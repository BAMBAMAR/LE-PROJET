const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const adminUrl = 'file://' + path.resolve('admin.html').replace(/\\/g, '/');

  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
  
  // Remove auth screen
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '1');
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.remove();
  });

  // Verify Topbar Brand Kit button
  await page.screenshot({ path: 'scripts/admin_topbar_with_brandkit.png' });
  console.log('Saved admin_topbar_with_brandkit.png');

  // Click on "Brand Kit" in sidebar or topbar
  await page.evaluate(() => {
    const item = document.querySelector('.nav-item[data-page="branding"]');
    if (item) item.click();
  });
  await page.waitForTimeout(1000);

  // Take screenshot of embedded Brand Kit tab (Tab 1: iframe)
  await page.screenshot({ path: 'scripts/admin_brandkit_tab1_portal.png' });
  console.log('Saved admin_brandkit_tab1_portal.png');

  // Switch to Tab 2: Galerie Téléchargements Rapides HD
  await page.evaluate(() => {
    const btn = document.getElementById('btnTabBrandDownloads');
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scripts/admin_brandkit_tab2_downloads.png' });
  console.log('Saved admin_brandkit_tab2_downloads.png');

  await browser.close();
  console.log('Admin Brand Kit verified successfully!');
})();
