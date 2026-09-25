const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api/docs';
const OUT_DIR = path.join(__dirname, 'screenshots');

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function screenshot(page, name, actions) {
  if (actions) await actions(page);
  await wait(400);
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', file);
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(BASE_URL);
  await page.waitForSelector('#welcome', { state: 'visible' });
  await wait(600);

  // 1. Overview
  await screenshot(page, '01-overview');

  // Expand Users group and select GET /api/users (List all users)
  await page.evaluate(() => {
    const group = Array.from(document.querySelectorAll('.group-head')).find(
      (el) => el.textContent.includes('Users')
    );
    if (group) group.click();
  });
  await wait(200);
  await page.evaluate(() => {
    const item = document.getElementById('nav-op-get--api-users');
    if (item) item.click();
  });
  await page.waitForSelector('#request-view', { state: 'visible' });
  await screenshot(page, '02-rest-request');

  // 3. Send request
  await page.click('#send-btn');
  await wait(800);
  await screenshot(page, '03-rest-response');

  // 4. Auth panel
  await page.click('#auth-btn');
  await wait(300);
  await screenshot(page, '04-auth-panel');
  await page.keyboard.press('Escape');

  // 5. File upload endpoint
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('.nav-item')).find(
      (el) => el.textContent.includes('Upload a product image')
    );
    if (item) item.click();
  });
  await wait(300);
  await screenshot(page, '05-file-upload');

  // 6. WebSocket
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('.nav-item')).find(
      (el) => el.textContent.includes('Subscribe to order status')
    );
    if (item) item.click();
  });
  await page.waitForSelector('#ws-view', { state: 'visible' });
  await page.click('#ws-connect');
  await wait(900);
  await page.fill('#ws-event-name', 'subscribeOrder');
  await page.fill('#ws-payload', '"1"');
  await page.click('#ws-send');
  await wait(900);
  await screenshot(page, '06-websocket');

  // 7. GraphQL
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('.nav-item')).find(
      (el) => el.textContent.includes('Get a single post by ID')
    );
    if (item) item.click();
  });
  await page.waitForSelector('#gql-view', { state: 'visible' });
  await page.click('#gql-run');
  await wait(900);
  await screenshot(page, '07-graphql');

  // 8. Dark mode
  await page.click('button.btn-theme');
  await wait(300);
  await screenshot(page, '08-light-mode');

  await browser.close();
})();
