// Headless check: with the backend unreachable, the static export answers
// REST and GraphQL calls with clearly-labelled MOCK responses.
const { chromium } = require('playwright');
const path = require('path');

const file = process.argv[2] || 'docs/index.html';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));

  const url = 'file:///' + path.resolve(file).replace(/\\/g, '/');
  await page.goto(url + '#op-get--api-users', { waitUntil: 'load' });
  await page.waitForSelector('#send-btn:visible');
  await page.click('#send-btn');
  await page.waitForFunction(() => /\d{3}|failed/.test(document.querySelector('#resp-meta').textContent), null, { timeout: 15000 });
  const restMeta = (await page.$eval('#resp-meta', (e) => e.textContent)).replace(/\s+/g, ' ').trim();
  const restNote = await page.$eval('.mock-note', (e) => e.textContent).catch(() => '');
  const restBody = await page.$eval('#resp-body pre', (e) => e.textContent).catch(() => '');
  console.log('REST meta:', restMeta);
  console.log('REST note:', restNote.slice(0, 120));
  console.log('REST body:', restBody.replace(/\s+/g, ' ').slice(0, 140));
  await page.screenshot({ path: process.env.TEMP + '/static-mock-rest.png' });

  await page.evaluate(() => { location.hash = '#gql-query-post'; });
  await page.waitForFunction(() => !document.querySelector('#gql-view').hidden);
  const vars = (await page.$eval('#gql-variables', (e) => e.value)).replace(/\s+/g, ' ');
  console.log('GQL vars:', vars);
  await page.click('#gql-run');
  await page.waitForFunction(() => /\d{3}/.test(document.querySelector('#gql-meta').textContent) || /Request failed/.test(document.querySelector('#gql-resp').textContent), null, { timeout: 20000 });
  const gqlMeta = (await page.$eval('#gql-meta', (e) => e.textContent)).replace(/\s+/g, ' ').trim();
  const gqlBody = await page.$eval('#gql-resp pre', (e) => e.textContent).catch(() => '');
  console.log('GQL meta:', gqlMeta);
  console.log('GQL body:', gqlBody.replace(/\s+/g, ' ').slice(0, 140));
  await page.screenshot({ path: process.env.TEMP + '/static-mock-gql.png' });

  // WebSocket: the Socket.IO client cannot load from an unreachable origin →
  // mock connection, and Send yields a MOCK ack from the response schema.
  await page.evaluate(() => { location.hash = '#ws-OrdersGateway-subscribeOrder'; });
  await page.waitForFunction(() => !document.querySelector('#ws-view').hidden);
  await page.fill('#ws-payload', '"1001"');
  await page.click('#ws-send');
  await page.waitForFunction(() => /MOCK/.test(document.querySelector('#ws-log').innerText) && /ack/.test(document.querySelector('#ws-log').innerText), null, { timeout: 20000 });
  const wsStatus = await page.$eval('#ws-status', (e) => e.textContent.trim());
  const wsLog = (await page.$eval('#ws-log', (e) => e.innerText)).replace(/\s+/g, ' ');
  console.log('WS status chip:', wsStatus);
  console.log('WS log:', wsLog.slice(0, 160));
  await page.screenshot({ path: process.env.TEMP + '/static-mock-ws.png' });

  // Login → mocked token is captured too, so the whole flow stays coherent.
  await page.evaluate(() => { location.hash = '#op-post--api-auth-login'; localStorage.removeItem('scramble-auth'); });
  await page.waitForFunction(() => !document.querySelector('#request-view').hidden);
  await page.click('#send-btn');
  await page.waitForFunction(() => /MOCK/.test(document.querySelector('#resp-meta').textContent), null, { timeout: 20000 });
  const loginBody = await page.$eval('#resp-body pre', (e) => e.textContent).catch(() => '');
  console.log('login mock body:', loginBody.replace(/\s+/g, ' ').slice(0, 140));

  console.log('page errors:', errors.length ? errors : 'none');
  await browser.close();
  const ok = /MOCK/.test(restMeta) && /200/.test(restMeta) && restBody.includes('email') && /MOCK/.test(gqlMeta) && gqlBody.includes('"post"') && vars.includes('"id": 1')
    && wsStatus === 'mock' && /ack · MOCK/.test(wsLog) && /orderId/.test(wsLog) && /eyJ/.test(loginBody) && /bearer/.test(loginBody) && errors.length === 0;
  console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
