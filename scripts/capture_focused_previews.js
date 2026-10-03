const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';
  
  // 1. Index
  await page.goto('file:///' + path.resolve('index.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_index_navbar.png'), clip: { x: 0, y: 0, width: 600, height: 100 } });
  
  // 2. Actualités
  await page.goto('file:///' + path.resolve('actualites.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_actualites_navbar.png'), clip: { x: 0, y: 0, width: 600, height: 100 } });

  // 3. Idéologie
  await page.goto('file:///' + path.resolve('ideologie.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_ideologie_navbar.png'), clip: { x: 0, y: 0, width: 600, height: 100 } });
  
  // 4. Admin
  await page.goto('file:///' + path.resolve('admin.html').replace(/\\/g, '/'), { waitUntil: 'load' });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(targetDir, 'preview_admin_card.png'), clip: { x: 450, y: 200, width: 540, height: 500 } });

  await browser.close();
  console.log('All targeted previews captured!');
})();
