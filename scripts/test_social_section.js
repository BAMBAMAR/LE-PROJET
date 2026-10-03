const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  
  // Set session storage auth to bypass login screen
  await page.addInitScript(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
  });

  await page.goto(adminUrl, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  console.log('Errors on load:', errors);

  // Click on the new social page nav item
  const socialNav = await page.$('.nav-item[data-page="social"]');
  if (!socialNav) {
    console.error('FAIL: .nav-item[data-page="social"] not found in sidebar!');
    await browser.close();
    process.exit(1);
  }
  await socialNav.click();
  await page.waitForTimeout(500);

  // Check if page-social is active
  const isSocialActive = await page.$eval('#page-social', el => el.classList.contains('active'));
  console.log('page-social is active:', isSocialActive);

  // Capture screenshot of Tab 1 (Profiles)
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab1_profiles.png'), fullPage: false });

  // Click on Tab 2 (Metadata)
  await page.click('#stb-metadata');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab2_metadata.png'), fullPage: false });

  // Click on Tab 3 (Simulator)
  await page.click('#stb-simulator');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab3_simulator.png'), fullPage: false });

  // Click on Tab 4 (Generator)
  await page.click('#stb-generator');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(targetDir, 'admin_social_tab4_generator.png'), fullPage: false });

  await browser.close();
  console.log('All tabs tested and screens captured!');
})();
