const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const adminUrl = 'file://' + path.resolve('admin.html').replace(/\\/g, '/');

  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
  
  // Remove auth screen and authenticate
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '1');
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.remove();
  });

  // Click on "Logos & Kit de Marque" via evaluate
  await page.evaluate(() => {
    const item = document.querySelector('.nav-item[data-page="branding"]');
    if (item) item.click();
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'scripts/admin_brand_page_view1.png' });
  console.log('Saved admin_brand_page_view1.png');

  // Scroll down to see covers and squircle
  await page.evaluate(() => {
    const content = document.getElementById('mainContent');
    if (content) content.scrollTop = 500;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/admin_brand_page_view2.png' });
  console.log('Saved admin_brand_page_view2.png');

  // Scroll further down to see social covers, avatar & palette
  await page.evaluate(() => {
    const content = document.getElementById('mainContent');
    if (content) content.scrollTop = 1200;
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scripts/admin_brand_page_view3.png' });
  console.log('Saved admin_brand_page_view3.png');

  // Also check "Pages Réseaux Sociaux"
  await page.evaluate(() => {
    const socialNav = document.querySelector('.nav-item[data-page="social"]');
    if (socialNav) socialNav.click();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'scripts/admin_social_with_callout.png' });
  console.log('Saved admin_social_with_callout.png');

  await browser.close();
  console.log('Verification completed successfully!');
})();
