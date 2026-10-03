const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

  // 1. Capture Light Auth Screen (without auth token in session)
  await page.goto(adminUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'admin_light_auth.png') });

  // 2. Set auth in sessionStorage & reload to get Dashboard
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(targetDir, 'admin_light_dashboard.png') });

  // 3. Capture Light "Pages Réseaux Sociaux"
  await page.click('.nav-item[data-page="social"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'admin_light_social.png') });

  // 4. Capture Studio Réseaux Sociaux (page-kit with white theme)
  await page.click('.nav-item[data-page="kit"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(targetDir, 'admin_light_studio.png') });

  // 5. Capture Posters Idéologie (page-ideologie with light theme)
  await page.click('.nav-item[data-page="ideologie"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(targetDir, 'admin_light_ideologie.png') });

  await browser.close();
  console.log('All light admin and visual previews captured!');
})();
