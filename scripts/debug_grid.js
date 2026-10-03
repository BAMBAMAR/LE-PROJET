const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  page.on('pageerror', e => logs.push('ERROR: ' + e.message + '\n' + e.stack));

  await page.addInitScript(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
  });

  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminUrl, { waitUntil: 'load' });

  await page.click('.nav-item[data-page="social"]');
  await page.waitForTimeout(500);

  const gridHtml = await page.$eval('#socialNetworksGrid', el => el.innerHTML);
  console.log('Grid HTML length:', gridHtml.length);
  console.log('Logs:', logs);

  await browser.close();
})();
