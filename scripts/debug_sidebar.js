const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  
  await page.addInitScript(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
  });

  await page.goto('file://' + path.resolve('admin.html').replace(/\\/g, '/'), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const sidebar = await page.$('#sidebar');
  if (sidebar) {
    await sidebar.screenshot({ path: 'C:/Users/HP/.gemini/antigravity/brain/a3e8fbdc-b860-4af8-89cd-e9467f707fb7/debug_sidebar.png' });
    console.log('Saved debug_sidebar.png');
  } else {
    console.log('Sidebar not found');
  }
  await browser.close();
})();

