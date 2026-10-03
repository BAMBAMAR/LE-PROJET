const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const pages = ['index.html', 'actualites.html', 'ideologie.html', 'admin.html'];
  for (const p of pages) {
    const filePath = 'file:///' + path.resolve(p).replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });
    await page.waitForTimeout(300);
    console.log(`Page ${p} loaded successfully!`);
  }
  
  await browser.close();
  console.log('All pages verified!');
})();
