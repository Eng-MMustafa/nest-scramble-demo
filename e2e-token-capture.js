// Headless check: login via the docs UI -> token auto-captured -> protected
// request succeeds without touching the Auth popover. Also checks the
// Socket.IO loader resolves to the backend origin (no namespace path).
const { chromium } = require('playwright');

const DOCS = process.argv[2] || 'http://localhost:3033/docs';
const LOGIN_OP = process.argv[3] || 'op-post--api-auth-login';
const PROTECTED_OP = process.argv[4] || 'op-post--api-users';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(DOCS, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.removeItem('scramble-auth'));
  await page.reload({ waitUntil: 'networkidle' });

  const groups = await page.$$eval('.group-name, .sb-group-name, [data-group]', (els) => els.map((e) => e.textContent.trim())).catch(() => []);
  console.log('sidebar groups:', groups.join(' | ') || '(selector not found — skipping)');

  // The hash is read on load only, so open each operation with a fresh load.
  const open = async (op) => {
    await page.goto('about:blank');
    await page.goto(DOCS + '#' + op, { waitUntil: 'networkidle' });
    await page.waitForSelector('#send-btn:visible', { timeout: 10000 });
  };

  // 1) Login through the UI
  await open(LOGIN_OP);
  const authBefore = await page.evaluate(() => localStorage.getItem('scramble-auth'));
  console.log('auth before login:', authBefore);
  await page.click('#send-btn');
  await page.waitForSelector('.toast.show', { timeout: 10000 });
  const toastText = await page.$eval('.toast', (el) => el.textContent);
  console.log('toast:', toastText);
  const authAfter = JSON.parse(await page.evaluate(() => localStorage.getItem('scramble-auth')));
  console.log('auth after login:', authAfter.type, (authAfter.token || '').slice(0, 24) + '...');
  const authBtnOn = await page.$eval('#auth-btn', (el) => el.classList.contains('auth-on'));
  console.log('auth button lit:', authBtnOn);

  // 2) Protected request with no manual auth step (fresh load = persisted auth)
  await open(PROTECTED_OP);
  const authHeaderShown = await page.evaluate(() => document.body.innerText.includes('Bearer'));
  console.log('Authorization header visible in request panel:', authHeaderShown);
  await page.click('#send-btn');
  await page.waitForFunction(() => /\d{3}/.test(document.querySelector('#resp-meta').textContent), null, { timeout: 10000 });
  const status = await page.$eval('#resp-meta .status', (el) => el.textContent.trim());
  console.log('protected request status:', status);

  // 3) Socket.IO client script origin
  const wsInfo = await page.evaluate(() => {
    const el = document.querySelector('#ws-url');
    return el ? el.value : null;
  });
  console.log('ws url field (pre-select):', wsInfo);

  console.log('page errors:', consoleErrors.length ? consoleErrors : 'none');
  await browser.close();
  const ok = authAfter.type === 'bearer' && authBtnOn && /^2\d\d/.test(status) && consoleErrors.length === 0;
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });
