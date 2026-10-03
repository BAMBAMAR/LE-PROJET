const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const indexPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

  // Test 1: nav-logo comme capsule blanche élégante
  await page.goto(indexPath, { waitUntil: 'load' });
  await page.evaluate(() => {
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
      navLogo.style.background = '#FFFFFF';
      navLogo.style.padding = '4px 14px';
      navLogo.style.borderRadius = '10px';
      navLogo.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      const text = navLogo.querySelector('.nav-logo-text');
      if (text) text.style.color = '#1A3D28';
      const sub = navLogo.querySelector('.nav-logo-sub');
      if (sub) { sub.style.color = '#C9A84C'; sub.style.fontWeight = '700'; }
    }
  });
  await page.screenshot({ path: path.join(targetDir, 'test_navbar_white_capsule.png'), clip: { x: 0, y: 0, width: 1440, height: 200 } });

  // Test 2: nav-logo utilisant directement l'image horizontale blanche
  await page.evaluate(() => {
    const navLogo = document.querySelector('.nav-logo');
    if (navLogo) {
      navLogo.innerHTML = '<img src="assets/branding/logo_projetbi_horizontal_blanc.png" alt="PROJETBI" style="height:38px;object-fit:contain;border-radius:6px;background:#fff;padding:2px 8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);">';
      navLogo.style.background = 'transparent';
      navLogo.style.boxShadow = 'none';
      navLogo.style.padding = '0';
    }
  });
  await page.screenshot({ path: path.join(targetDir, 'test_navbar_horizontal_white_img.png'), clip: { x: 0, y: 0, width: 1440, height: 200 } });

  // Test 3: Toute la navbar avec fond blanc
  await page.evaluate(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = '#FFFFFF';
      navbar.style.borderBottom = '1px solid #E2E8F0';
      navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
      const navLogo = navbar.querySelector('.nav-logo');
      if (navLogo) {
        navLogo.innerHTML = '<img src="assets/branding/logo_projetbi_horizontal_blanc.png" alt="PROJETBI" style="height:40px;object-fit:contain;">';
      }
      const links = navbar.querySelectorAll('.nav-links a');
      links.forEach(l => {
        l.style.color = '#1A3D28';
      });
      const tagline = navbar.querySelector('.nav-tagline');
      if (tagline) tagline.style.color = '#4A5B52';
    }
  });
  await page.screenshot({ path: path.join(targetDir, 'test_navbar_full_white_bar.png'), clip: { x: 0, y: 0, width: 1440, height: 200 } });

  await browser.close();
  console.log('All 3 tests captured!');
})();
