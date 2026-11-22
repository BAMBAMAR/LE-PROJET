const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outputDir = path.resolve(__dirname, 'audit_renders');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  console.log('--- 1. VERIFYING ADMIN.HTML IDEOLOGIE FIXES ---');
  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminUrl, { waitUntil: 'load' });
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    await document.fonts.ready;
    const navIdeo = document.querySelector('.nav-item[data-page="ideologie"]');
    if (navIdeo) navIdeo.click();
  });
  await page.waitForTimeout(500);

  const ideoCanvasEl = await page.locator('#ideoCanvas');
  const testTemplates = ['comparaison', 'jubanti', 'stat', 'pilier'];

  for (const itpl of testTemplates) {
    await page.evaluate((itpl) => {
      ideoActiveTemplate = itpl;
      ideoDrawCanvas();
    }, itpl);
    await page.waitForTimeout(200);
    const imgPath = path.join(outputDir, `fixed_ideo_${itpl}.png`);
    await ideoCanvasEl.screenshot({ path: imgPath });
    console.log(`Saved: fixed_ideo_${itpl}.png`);
  }

  console.log('--- 2. VERIFYING KIT-COMMUNICATION 1200x628 LANDSCAPE ---');
  const kitUrl = 'file:///' + path.resolve('kit-communication.html').replace(/\\/g, '/');
  await page.goto(kitUrl, { waitUntil: 'load' });
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  // Verify landscape generation on offscreen canvas
  const landscapeRenders = await page.evaluate(() => {
    const s = getStats();
    const tauxReel = Math.round((s.realise / s.total) * 100);
    const results = {};

    ['bilan', 'taux', 'retard', 'note'].forEach(tpl => {
      activeTemplate = tpl;
      const offscreen = document.createElement('canvas');
      offscreen.width = 1200;
      offscreen.height = 628;
      const oCtx = offscreen.getContext('2d');
      drawCanvasLandscape(oCtx, s, tauxReel);
      results[tpl] = offscreen.toDataURL('image/png');
    });

    return results;
  });

  for (const [tpl, dataUrl] of Object.entries(landscapeRenders)) {
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const imgPath = path.join(outputDir, `kit_${tpl}_1200x628.png`);
    fs.writeFileSync(imgPath, base64Data, 'base64');
    console.log(`Saved: kit_${tpl}_1200x628.png`);
  }

  await browser.close();
  console.log('✅ Fixes verification completed successfully!');
})();

