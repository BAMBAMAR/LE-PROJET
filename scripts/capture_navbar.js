const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const indexPath = 'file:///' + path.resolve('index.html').replace(/\\/g, '/');
  await page.goto(indexPath, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
  await page.screenshot({ path: path.join(targetDir, 'site_navbar_preview.png'), clip: { x: 0, y: 0, width: 1440, height: 350 } });
  
  await browser.close();
  console.log('Navbar screenshot captured!');
})();
