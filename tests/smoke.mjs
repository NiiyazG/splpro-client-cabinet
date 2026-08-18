import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';

const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('pageerror', error => errors.push(error.message));

await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
await page.selectOption('#roleSelect', 'contractor');
assert.match(await page.locator('#welcomeTitle').textContent(), /Поставки/);
assert.equal(await page.locator('#kpiGrid .kpi').count(), 4);

await page.click('[data-page="orders"]');
assert.equal(await page.locator('#page-orders').getAttribute('class'), 'page active');
await page.click('.order-item[data-order="1"]');
assert.equal(await page.locator('#orderNumber').textContent(), 'SPL-260814-03');
const action = page.locator('#customerActions input').first();
await action.check();
assert.equal(await page.locator('#customerActions .tag').first().textContent(), 'Готово');

await page.click('#notificationButton');
assert.equal(await page.locator('#notificationDrawer').getAttribute('aria-hidden'), 'false');
await page.click('#closeDrawer');
assert.equal(await page.locator('#notificationDrawer').getAttribute('aria-hidden'), 'true');

await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://127.0.0.1:4173', { waitUntil: 'networkidle' });
const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
assert.ok(dimensions.scrollWidth <= dimensions.innerWidth, `horizontal overflow: ${JSON.stringify(dimensions)}`);
await page.click('#mobileMenu');
assert.ok((await page.locator('.sidebar').getAttribute('class')).includes('open'));
await page.click('[data-page="production"]');
assert.equal(await page.locator('#page-production').getAttribute('class'), 'page active');

assert.deepEqual(errors, []);
console.log(JSON.stringify({ status: 'PASS', roleSwitch: true, navigation: true, checklist: true, notifications: true, mobileMenu: true, mobileOverflow: dimensions, consoleErrors: errors.length }, null, 2));
await browser.close();
