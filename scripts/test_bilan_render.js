const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  
  const adminUrl = 'file://' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Switch to studio tab
  await page.evaluate(() => {
    if (typeof showTab === 'function') showTab('studio');
  });
  await page.waitForTimeout(500);

  // Configure exact fields from user screenshot
  await page.evaluate(() => {
    // Template 3: bilan
    if (typeof studioSelectTemplate === 'function') {
      studioSelectTemplate('bilan');
    }
    
    // Theme white
    const themeSel = document.getElementById('stThemeSelect');
    if (themeSel) { themeSel.value = 'white_republican'; }

    // Format 1:1
    const ratioSel = document.getElementById('stRatioSelect');
    if (ratioSel) { ratioSel.value = '1:1'; }

    // Mode global
    const modeSelect = document.getElementById('stBilanMode');
    if (modeSelect) { modeSelect.value = 'global'; }

    // Inputs
    document.getElementById('kctTotal').value = 300;
    document.getElementById('kctRealise').value = 26;
    document.getElementById('kctEncours').value = 74;
    document.getElementById('kctNonLance').value = 34;
    document.getElementById('kctRetard').value = 166;
    document.getElementById('kctNote').value = '3.4';
    document.getElementById('kctPeriode').value = 'Bilan — Novembre 2026';
    document.getElementById('kctSous').value = "2 ans et 8 mois après l'élection";

    if (typeof studioRenderAll === 'function') studioRenderAll();
  });

  await page.waitForTimeout(1200);

  // Capture canvas to artifact directory
  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/a3e8fbdc-b860-4af8-89cd-e9467f707fb7';
  
  const canvasData = await page.evaluate(() => {
    const canvas = document.getElementById('studioCanvas');
    return canvas ? canvas.toDataURL('image/png') : null;
  });

  if (canvasData) {
    const base64Data = canvasData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(artifactDir, 'studio_bilan_fixed_white_1x1.png'), base64Data, 'base64');
    console.log('Saved studio_bilan_fixed_white_1x1.png successfully');
  } else {
    console.error('Canvas not found!');
  }

  // Also test prestige dark theme
  await page.evaluate(() => {
    const themeSel = document.getElementById('stThemeSelect');
    if (themeSel) { themeSel.value = 'projetbi_prestige'; }
    if (typeof studioRenderAll === 'function') studioRenderAll();
  });
  await page.waitForTimeout(800);

  const canvasDataDark = await page.evaluate(() => {
    const canvas = document.getElementById('studioCanvas');
    return canvas ? canvas.toDataURL('image/png') : null;
  });

  if (canvasDataDark) {
    const base64Data = canvasDataDark.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(artifactDir, 'studio_bilan_fixed_prestige_1x1.png'), base64Data, 'base64');
    console.log('Saved studio_bilan_fixed_prestige_1x1.png successfully');
  }

  // Also test landscape 16:9 white
  await page.evaluate(() => {
    const themeSel = document.getElementById('stThemeSelect');
    if (themeSel) { themeSel.value = 'white_republican'; }
    const ratioSel = document.getElementById('stRatioSelect');
    if (ratioSel) { ratioSel.value = '16:9'; }
    if (typeof studioRenderAll === 'function') studioRenderAll();
  });
  await page.waitForTimeout(800);

  const canvasData169 = await page.evaluate(() => {
    const canvas = document.getElementById('studioCanvas');
    return canvas ? canvas.toDataURL('image/png') : null;
  });

  if (canvasData169) {
    const base64Data = canvasData169.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync(path.join(artifactDir, 'studio_bilan_fixed_white_16x9.png'), base64Data, 'base64');
    console.log('Saved studio_bilan_fixed_white_16x9.png successfully');
  }

  await browser.close();
})();
