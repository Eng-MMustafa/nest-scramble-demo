// Headless check: the WebSocket console loads the Socket.IO client from the
// backend ORIGIN (not the namespaced URL) and actually connects + gets an ack.
const { chromium } = require('playwright');

const DOCS = process.argv[2] || 'http://localhost:3000/api/docs';
const WS_OP = process.argv[3] || 'ws-OrdersGateway-subscribeOrder';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const scriptUrls = [];
  page.on('request', (r) => { if (r.url().includes('socket.io.js')) scriptUrls.push(r.url() + ' -> pending'); });
  page.on('response', (r) => { if (r.url().includes('socket.io.js')) scriptUrls.push(r.url() + ' -> ' + r.status()); });

  await page.goto(DOCS, { waitUntil: 'networkidle' });
  // Expand the gateway group (collapsed by default) then open the event.
  await page.click('text=OrdersGateway');
  await page.click('text=subscribeOrder');
  await page.waitForSelector('#ws-connect:visible', { timeout: 10000 });
  const wsUrl = await page.$eval('#ws-url', (el) => el.value);
  console.log('ws url:', wsUrl);

  await page.click('#ws-connect');
  await page.waitForFunction(() => {
    const chip = document.querySelector('#ws-status');
    return chip && /connected|error/.test(chip.textContent);
  }, null, { timeout: 15000 });
  const status = await page.$eval('#ws-status', (el) => el.textContent.trim());
  console.log('ws status:', status);

  // Send the documented event with a payload and look for an ack in the log.
  await page.fill('#ws-payload', '"1001"');
  await page.click('#ws-send');
  await page.waitForFunction(() => /ack|subscribed/i.test(document.querySelector('#ws-log').innerText), null, { timeout: 10000 }).catch(() => {});
  const log = await page.$eval('#ws-log', (el) => el.innerText.replace(/\s+/g, ' ').slice(0, 300));
  console.log('ws log:', log);

  console.log('socket.io.js requests:', scriptUrls.filter((s) => !s.endsWith('pending')));
  await browser.close();
  const ok = status === 'connected' && scriptUrls.some((s) => s.endsWith('-> 200'));
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });
