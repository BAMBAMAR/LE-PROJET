const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
  });

  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminUrl, { waitUntil: 'load' });

  await page.click('.nav-item[data-page="social"]');
  await page.waitForTimeout(400);

  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
  
  // Tab 1 refreshed
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab1_refined.png'), fullPage: false });

  // Tab 5
  await page.click('#stb-public');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab5_public.png'), fullPage: false });

  await browser.close();
  console.log('Tab 5 captured!');
})();
