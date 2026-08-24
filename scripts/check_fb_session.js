const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');

async function checkLogin() {
  console.log('=== VERIFICATION DE LA SESSION FACEBOOK ===');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 800 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    await page.goto('https://www.facebook.com/mamadou.ly.1804', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    const info = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyLength: document.body.innerText.length,
        bodyTextSnippet: document.body.innerText.substring(0, 1000),
        hasLoginField: !!document.querySelector('input[name="email"]') || !!document.querySelector('input[type="password"]'),
        h1s: Array.from(document.querySelectorAll('h1')).map(h => h.innerText)
      };
    });

    console.log('Info de la page :', JSON.stringify(info, null, 2));

  } catch (err) {
    console.error('Erreur:', err);
  } finally {
    await context.close();
  }
}

checkLogin();
