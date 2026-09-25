// Headless check: the exported index.html renders from a file:// URL with no
// server — sidebar groups, schemas card, WS + GraphQL sections, deep links.
const { chromium } = require('playwright');
const path = require('path');

const file = process.argv[2];
if (!file) { console.error('usage: node e2e-static-export.js <path/to/index.html>'); process.exit(2); }

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelectorAll('.group-name').length > 0, null, { timeout: 10000 });

  const groups = await page.$$eval('.group-name', (els) => els.map((e) => e.textContent.trim()));
  const requests = await page.$eval('#ov-requests', (el) => el.textContent.trim()).catch(() => '?');
  const schemas = await page.$eval('#ov-schema-count', (el) => el.textContent.trim()).catch(() => '(no card)');
  console.log('groups:', groups.join(' | '));
  console.log('requests card:', requests, '| schemas card:', schemas);

  // Deep link into a GraphQL operation via hashchange (no reload).
  await page.evaluate(() => { location.hash = '#gql-mutation-createPost'; });
  await page.waitForFunction(() => !document.querySelector('#gql-view').hidden, null, { timeout: 5000 });
  const gqlQuery = await page.$eval('#gql-query', (el) => el.value);
  console.log('gql deep link → query:', gqlQuery.slice(0, 70) + '…');

  // And into a REST operation.
  await page.evaluate(() => { location.hash = '#op-post--api-users'; });
  await page.waitForFunction(() => !document.querySelector('#request-view').hidden, null, { timeout: 5000 });
  const urlBar = await page.$eval('#url-input', (el) => el.value);
  const bodyTab = await page.evaluate(() => document.body.innerText.includes('CreateUserBody'));
  console.log('rest deep link → url:', urlBar, '| body schema named:', bodyTab);

  console.log('page errors:', errors.length ? errors : 'none');
  await browser.close();
  const ok = groups.length >= 5 && /^\d+$/.test(requests) && errors.length === 0 && gqlQuery.includes('createPost') && urlBar.includes('/api/users');
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });
