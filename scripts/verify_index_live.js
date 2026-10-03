const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  console.log('Navigating to http://localhost:8089/index.html');
  await page.goto('http://localhost:8089/index.html', { waitUntil: 'load' });
  await page.waitForTimeout(800);
  
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\34f1ce19-b4b8-43b9-be39-7ace1de0a9e1';
  
  await page.screenshot({ 
    path: path.join(artifactDir, 'index_live_http_hero_navbar.png'),
    clip: { x: 0, y: 0, width: 1440, height: 600 }
  });

  await browser.close();
  console.log('HTTP screenshot captured successfully!');
})();
