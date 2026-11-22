const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const outputDir = path.resolve(__dirname, 'audit_renders');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();

  console.log('--- 1. AUDITING ADMIN.HTML (STUDIO HD & IDEOLOGIE) ---');
  const adminUrl = 'file:///' + path.resolve('admin.html').replace(/\\/g, '/');
  await page.goto(adminUrl, { waitUntil: 'load' });

  // Authenticate
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(1000);
  await page.evaluate(async () => {
    await document.fonts.ready;
    if (typeof loadData === 'function') await loadData();
  });

  // Navigate to Studio (data-page="kit")
  await page.evaluate(() => {
    const navKit = document.querySelector('.nav-item[data-page="kit"]');
    if (navKit) navKit.click();
  });
  await page.waitForTimeout(600);

  const canvasEl = await page.locator('#studioCanvas');

  // Studio test combinations
  const studioTemplates = ['flash', 'engagement', 'bilan', 'revue', 'decryptage', 'citation'];
  const ratios = ['1:1', '16:9'];
  const themes = ['projetbi_prestige', 'dark_minimal', 'white_republican'];

  for (const tpl of studioTemplates) {
    for (const ratio of ratios) {
      for (const th of [themes[0], themes[2]]) { // Test prestige (dark) and white_republican (light)
        try {
          await page.evaluate(({ tpl, ratio, th }) => {
            studioSelectTemplate(tpl);
            studioSetRatio(ratio);
            studioSetTheme(th);
            studioRenderAll();
          }, { tpl, ratio, th });
          await page.waitForTimeout(150);

          const imgPath = path.join(outputDir, `studio_${tpl}_${ratio.replace(':', 'x')}_${th}.png`);
          await canvasEl.screenshot({ path: imgPath });
          console.log(`Rendered: studio_${tpl}_${ratio.replace(':', 'x')}_${th}.png`);
        } catch (e) {
          console.error(`Error rendering studio_${tpl}_${ratio}_${th}:`, e.message);
        }
      }
    }
  }

  // Also test Bilan modes: chiffre_choc and note
  for (const bMode of ['chiffre_choc', 'note']) {
    try {
      await page.evaluate((bMode) => {
        studioSelectTemplate('bilan');
        studioSetRatio('1:1');
        studioSetTheme('projetbi_prestige');
        const sel = document.getElementById('stBilanMode');
        if (sel) { sel.value = bMode; }
        studioRenderAll();
      }, bMode);
      await page.waitForTimeout(150);
      const imgPath = path.join(outputDir, `studio_bilan_1x1_${bMode}.png`);
      await canvasEl.screenshot({ path: imgPath });
      console.log(`Rendered: studio_bilan_1x1_${bMode}.png`);
    } catch (e) {
      console.error(`Error rendering bilan mode ${bMode}:`, e.message);
    }
  }

  console.log('\n--- 2. AUDITING IDEOLOGIE POSTERS ---');
  // Navigate to Ideologie (data-page="ideologie")
  await page.evaluate(() => {
    const navIdeo = document.querySelector('.nav-item[data-page="ideologie"]');
    if (navIdeo) navIdeo.click();
  });
  await page.waitForTimeout(600);

  const ideoCanvasEl = await page.locator('#ideoCanvas');
  const ideoTemplates = ['citation', 'pilier', 'comparaison', 'jubanti', 'stat'];

  for (const itpl of ideoTemplates) {
    try {
      await page.evaluate((itpl) => {
        ideoActiveTemplate = itpl;
        ideoDrawCanvas();
      }, itpl);
      await page.waitForTimeout(150);
      const imgPath = path.join(outputDir, `ideo_${itpl}.png`);
      await ideoCanvasEl.screenshot({ path: imgPath });
      console.log(`Rendered: ideo_${itpl}.png`);
    } catch (e) {
      console.error(`Error rendering ideo_${itpl}:`, e.message);
    }
  }

  console.log('\n--- 3. AUDITING KIT-COMMUNICATION.HTML ---');
  const kitUrl = 'file:///' + path.resolve('kit-communication.html').replace(/\\/g, '/');
  await page.goto(kitUrl, { waitUntil: 'load' });

  // Authenticate kit
  await page.evaluate(() => {
    sessionStorage.setItem('admin_auth', '03eb6856c640072257980d6125e3082905e07a23b3a50f2efe5256bc9898a380');
    location.reload();
  });
  await page.waitForTimeout(800);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const kitCanvasEl = await page.locator('#mainCanvas');
  const kitTemplates = ['bilan', 'taux', 'retard', 'note'];

  for (const ktpl of kitTemplates) {
    try {
      await page.evaluate((ktpl) => {
        selectTemplate(ktpl);
      }, ktpl);
      await page.waitForTimeout(150);
      const imgPath = path.join(outputDir, `kit_${ktpl}.png`);
      await kitCanvasEl.screenshot({ path: imgPath });
      console.log(`Rendered: kit_${ktpl}.png`);
    } catch (e) {
      console.error(`Error rendering kit_${ktpl}:`, e.message);
    }
  }

  await browser.close();
  console.log('\n✅ All renders generated successfully!');
})();

