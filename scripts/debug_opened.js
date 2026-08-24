const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function test() {
  const browser = await chromium.launchPersistentContext('C:\\Users\\bamba\\Downloads\\LE-PROJET-main\\LE-PROJET-main\\.fb_session', {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 800 }
  });
  const page = browser.pages().length > 0 ? browser.pages()[0] : await browser.newPage();

  try {
    console.log('Navigation...');
    await page.goto('https://www.facebook.com/mamadou.ly.1804/photos', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const photoLinks = await page.locator('a[href*="/photo"]').all();
    if (photoLinks.length > 0) {
      // Find non-cover
      let targetLink = null;
      for (const link of photoLinks) {
        const ariaLabel = await link.getAttribute('aria-label') || '';
        if (!ariaLabel.toLowerCase().includes('couverture') && !ariaLabel.toLowerCase().includes('profil')) {
          targetLink = link;
          break;
        }
      }
      if (!targetLink) targetLink = photoLinks[0];

      console.log('Opening photo...');
      await targetLink.click({ force: true });
      await page.waitForTimeout(5000);

      await page.screenshot({ path: 'revuedepresse/debug_opened_photo.png' });
      console.log('Screenshot saved.');

      // Dump all images
      const imgsInfo = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img')).map(img => {
          return {
            src: img.src ? img.src.substring(0, 100) : '',
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            class: img.className,
            alt: img.alt
          };
        });
      });
      console.log('All images on page:', imgsInfo);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

test();
