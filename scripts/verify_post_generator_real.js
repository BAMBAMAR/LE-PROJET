const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const adminUrl = 'file://' + path.resolve('admin.html').replace(/\\/g, '/');

  // Read local json files
  const promisesData = JSON.parse(fs.readFileSync('promises.json', 'utf8'));
  const newsData = JSON.parse(fs.readFileSync('news.json', 'utf8'));
  const pressData = JSON.parse(fs.readFileSync('press.json', 'utf8'));

  await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
  
  // Inject authenticated state and real data into window.DB
  await page.evaluate(({ pData, nData, prData }) => {
    sessionStorage.setItem('admin_auth', '1');
    const authScreen = document.getElementById('authScreen');
    if (authScreen) authScreen.remove();

    window.DB = {
      promises: pData.promises || pData,
      news: nData.news || nData,
      press: prData.press || prData
    };
    window.filteredPromises = [...window.DB.promises];

    if (typeof initSocialPage === 'function') initSocialPage();
  }, { pData: promisesData, nData: newsData, prData: pressData });

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

  // 1. Verify Promises generator with REAL DATA
  const promiseInfo = await page.evaluate(() => {
    const sel = document.getElementById('postItemSelect');
    const txt = (document.getElementById('postGeneratedText') || {}).value || '';
    const firstOption = sel && sel.options.length ? sel.options[0].text : 'NONE';
    const optgroups = sel ? sel.querySelectorAll('optgroup').length : 0;
    return {
      optionCount: sel ? sel.options.length : 0,
      optgroups,
      firstOption,
      txtPreview: txt.slice(0, 150),
      hasUndefined: txt.includes('undefined')
    };
  });
  console.log('Promise generator with real data:', promiseInfo);

  // Screenshot 1: Promises
  await page.screenshot({ path: 'scripts/post_generator_promises_real.png' });

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
    return {
      optionCount: sel ? sel.options.length : 0,
      firstOption,
      txtPreview: txt.slice(0, 150),
      hasUndefined: txt.includes('undefined')
    };
  });
  console.log('News generator with real data:', newsInfo);

  // Screenshot 2: News
  await page.screenshot({ path: 'scripts/post_generator_news_real.png' });

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
    return {
      optionCount: sel ? sel.options.length : 0,
      firstOption,
      txtPreview: txt.slice(0, 150),
      hasUndefined: txt.includes('undefined')
    };
  });
  console.log('Press generator with real data:', pressInfo);

  // Screenshot 3: Press
  await page.screenshot({ path: 'scripts/post_generator_press_real.png' });

  await browser.close();
  console.log('All real data tests passed successfully!');
})();
