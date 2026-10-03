const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const adminUrl = 'file://' + path.resolve('admin.html').replace(/\\/g, '/');

  await page.goto(adminUrl, { waitUntil: 'networkidle' });
  
  // Remove auth screen and load data
  await page.evaluate(async () => {
    sessionStorage.setItem('admin_auth', '1');
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.remove();
    if (typeof loadData === 'function') await loadData();
    if (typeof initSocialPage === 'function') initSocialPage();
  });

  await page.waitForTimeout(600);

  // Navigate to Social Page
  await page.evaluate(() => {
    const socialNav = document.querySelector('.nav-item[data-page="social"]');
    if (socialNav) socialNav.click();
  });
  await page.waitForTimeout(400);

  // Click on Tab 4: Générateur de Posts
  await page.evaluate(() => {
    const btn = document.getElementById('stb-generator');
    if (btn) btn.click();
  });
  await page.waitForTimeout(400);

  // 1. Verify Promises generator
  const promiseInfo = await page.evaluate(() => {
    const sel = document.getElementById('postItemSelect');
    const txt = (document.getElementById('postGeneratedText') || {}).value || '';
    const firstOption = sel && sel.options.length ? sel.options[0].text : 'NONE';
    return { optionCount: sel ? sel.options.length : 0, firstOption, txtPreview: txt.slice(0, 100), hasUndefined: txt.includes('undefined') };
  });
  console.log('Promise generator check:', promiseInfo);

  // Screenshot 1: Promises
  await page.screenshot({ path: 'scripts/post_generator_promises.png' });

  // 2. Switch to News generator
  await page.evaluate(() => {
    const srcSel = document.getElementById('postSourceType');
    if (srcSel) {
      srcSel.value = 'news';
      srcSel.dispatchEvent(new Event('change'));
    }
  });
  await page.waitForTimeout(400);

  const newsInfo = await page.evaluate(() => {
    const sel = document.getElementById('postItemSelect');
    const txt = (document.getElementById('postGeneratedText') || {}).value || '';
    const firstOption = sel && sel.options.length ? sel.options[0].text : 'NONE';
    return { optionCount: sel ? sel.options.length : 0, firstOption, txtPreview: txt.slice(0, 100), hasUndefined: txt.includes('undefined') };
  });
  console.log('News generator check:', newsInfo);

  // Screenshot 2: News
  await page.screenshot({ path: 'scripts/post_generator_news.png' });

  // 3. Switch to Press generator
  await page.evaluate(() => {
    const srcSel = document.getElementById('postSourceType');
    if (srcSel) {
      srcSel.value = 'press';
      srcSel.dispatchEvent(new Event('change'));
    }
  });
  await page.waitForTimeout(400);

  const pressInfo = await page.evaluate(() => {
    const sel = document.getElementById('postItemSelect');
    const txt = (document.getElementById('postGeneratedText') || {}).value || '';
    const firstOption = sel && sel.options.length ? sel.options[0].text : 'NONE';
    return { optionCount: sel ? sel.options.length : 0, firstOption, txtPreview: txt.slice(0, 100), hasUndefined: txt.includes('undefined') };
  });
  console.log('Press generator check:', pressInfo);

  // Screenshot 3: Press
  await page.screenshot({ path: 'scripts/post_generator_press.png' });

  await browser.close();
  console.log('All generator checks finished!');
})();
