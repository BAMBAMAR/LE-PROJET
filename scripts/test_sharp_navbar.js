const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const indexPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });
  
  await page.evaluate(() => {
    const img = document.querySelector('.nav-logo-img');
    if (img) {
      img.src = 'assets/branding/favicon_blanc_squircle.svg';
      img.style.width = '38px';
      img.style.height = '38px';
      img.style.background = '#FFFFFF';
      img.style.padding = '1px';
      img.style.borderRadius = '9px';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
    }
  });
  
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
  await page.screenshot({ path: path.join(targetDir, 'site_navbar_sharp_svg.png'), clip: { x: 0, y: 0, width: 1440, height: 250 } });
  
  await browser.close();
  console.log('Sharp SVG screenshot captured!');
})();
