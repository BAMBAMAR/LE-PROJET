const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();

  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  console.log('Navigating to:', adminUrl);
  await page.goto(adminUrl, { waitUntil: 'load' });
  await page.waitForTimeout(400);

  // Authenticate
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(800);

  // Trigger openPressDecryptage()
  await page.evaluate(() => {
    openPressDecryptage();
  });
  await page.waitForTimeout(800);

  // Take screenshot of the studio interface
  await page.screenshot({ path: path.join(__dirname, 'preview_studio_decryptage.png') });
  console.log('Saved preview_studio_decryptage.png');

  // Ensure fonts and assets are loaded and render canvas
  await page.evaluate(async () => {
    await document.fonts.ready;
    studioSetRatio('1:1');
    studioRenderAll();
  });
  await page.waitForTimeout(1000);

  const canvasEl = await page.locator('#studioCanvas');
  await canvasEl.screenshot({ path: path.join(__dirname, 'decryptage_1_1_executive.png') });
  console.log('Saved decryptage_1_1_executive.png');

  // Also save directly to artifact directory for the user
  const artifactDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\8523804f-b992-4a99-9ce7-dba197b0babf';
  await canvasEl.screenshot({ path: path.join(artifactDir, 'decryptage_1_1_executive.png') });


  // Capture canvas in 16:9 Dark
  await page.evaluate(() => {
    studioSetRatio('16:9');
    studioRenderAll();
  });
  await page.waitForTimeout(500);
  await canvasEl.screenshot({ path: path.join(__dirname, 'decryptage_16_9_dark.png') });
  await canvasEl.screenshot({ path: path.join(artifactDir, 'decryptage_16_9_dark.png') });
  console.log('Saved decryptage_16_9_dark.png');

  // Capture canvas in Light Republican Theme (1:1)
  await page.evaluate(() => {
    studioSetTheme('white_republican');
    studioSetRatio('1:1');
    studioRenderAll();
  });
  await page.waitForTimeout(500);
  await canvasEl.screenshot({ path: path.join(__dirname, 'decryptage_1_1_light.png') });
  await canvasEl.screenshot({ path: path.join(artifactDir, 'decryptage_1_1_light.png') });
  console.log('Saved decryptage_1_1_light.png');

  // Log captions
  const captions = await page.evaluate(() => {
    return {
      fb: document.getElementById('stFbCaption')?.value || '',
      tw: document.getElementById('stTwitterText')?.value || ''
    };
  });
  console.log('=== FACEBOOK CAPTION ===\n' + captions.fb);

  await browser.close();
  console.log('All Décryptage visual tests completed!');
})();
