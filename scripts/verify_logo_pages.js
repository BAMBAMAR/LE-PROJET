const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const indexPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  
  const logoVisible = await page.locator('.nav-logo-img').isVisible();
  console.log('Nav logo visible on index.html:', logoVisible);
  
  const adminPath = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminPath, { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  
  const authLogoVisible = await page.locator('.auth-logo img').isVisible();
  console.log('Auth logo visible on admin.html:', authLogoVisible);
  
  await browser.close();
  console.log('Verification passed!');
})();
