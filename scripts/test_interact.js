const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');
const DEBUG_DIR = path.join(__dirname, '..', 'debug_screenshots');

if (!fs.existsSync(DEBUG_DIR)) {
  fs.mkdirSync(DEBUG_DIR);
}

async function run() {
  console.log('=== DÉBOGAGE INTERACTIF FACEBOOK ===');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 1000 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    console.log('1. Navigation vers le profil de Mamadou Ly...');
    await page.goto('https://www.facebook.com/mamadou.ly.1804', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6000);

    // Prendre un screenshot initial
    await page.screenshot({ path: path.join(DEBUG_DIR, '01_profil_load.png') });
    console.log('Screenshot 01_profil_load.png enregistré.');

    // Scroll pour voir le post d'aujourd'hui
    console.log('2. Scroll vers le bas...');
    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(DEBUG_DIR, '02_after_scroll_700.png') });

    await page.evaluate(() => window.scrollBy(0, 700));
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(DEBUG_DIR, '03_after_scroll_1400.png') });

    // Trouver le post "Ma Revue de Presse"
    // On va chercher le post qui contient "Ma Revue de Presse" et les photos
    const postHandle = await page.evaluateHandle(() => {
      const articles = Array.from(document.querySelectorAll('div[role="article"], div[data-ad-preview="message"]'));
      for (const art of articles) {
        if (art.innerText && art.innerText.includes('Ma Revue de Presse')) {
          // Trouver le conteneur du post parent pour pouvoir cliquer dedans
          let parent = art;
          while (parent && parent.tagName !== 'DIV') {
            parent = parent.parentElement;
          }
          return parent;
        }
      }
      return null;
    });

    if (postHandle) {
      console.log('Post "Ma Revue de Presse" trouvé dans le DOM !');
      // Trouver tous les liens d'images/photos dans ce post
      const photoLinks = await page.evaluate((post) => {
        if (!post) return [];
        // Chercher tous les liens dans le post qui vont vers des photos
        const links = Array.from(post.querySelectorAll('a[href*="/photo"]'));
        return links.map(a => {
          const img = a.querySelector('img');
          const rect = a.getBoundingClientRect();
          return {
            href: a.href,
            alt: img ? img.alt : '',
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            w: Math.round(rect.width),
            h: Math.round(rect.height),
            text: a.textContent || ''
          };
        });
      }, postHandle);

      console.log(`Nombre de liens de photos trouvés dans le post: ${photoLinks.length}`);
      photoLinks.forEach((p, idx) => {
        console.log(`  [Link ${idx + 1}] href: ${p.href.substring(0, 80)}...`);
        console.log(`      alt: "${p.alt}" | text: "${p.text}"`);
        console.log(`      rect: ${p.x}, ${p.y}, ${p.w}x${p.h}`);
      });

      // Cliquer sur le premier lien qui n'est pas une fleur
      let clickIndex = -1;
      for (let i = 0; i < photoLinks.length; i++) {
        const p = photoLinks[i];
        if (p.alt.toLowerCase().includes('fleur') || p.alt.toLowerCase().includes('lavande')) continue;
        clickIndex = i;
        break;
      }

      if (clickIndex === -1 && photoLinks.length > 0) {
        clickIndex = 0; // fallback sur le premier
      }

      if (clickIndex !== -1) {
        console.log(`\nCliquer sur la photo ${clickIndex + 1}...`);
        
        // On clique en utilisant les coordonnées pour éviter les interceptions
        const targetLink = photoLinks[clickIndex];
        await page.mouse.click(targetLink.x + targetLink.w / 2, targetLink.y + targetLink.h / 2);
        await page.waitForTimeout(5000);

        await page.screenshot({ path: path.join(DEBUG_DIR, '04_after_click.png') });
        console.log(`URL après clic: ${page.url()}`);

        // Vérifier si le photo viewer est ouvert
        const viewerStatus = await page.evaluate(() => {
          const dialog = document.querySelector('div[role="dialog"]');
          const viewer = document.querySelector('div[data-pagelet="MediaViewerPhoto"]');
          const img = document.querySelector('img[src*="scontent"]');
          return {
            dialogExists: !!dialog,
            viewerExists: !!viewer,
            imgSrc: img ? img.src.substring(0, 100) : 'none',
            imgAlt: img ? img.alt : ''
          };
        });
        console.log('Statut du Viewer:', viewerStatus);

        // Tester la navigation ArrowRight
        for (let step = 1; step <= 5; step++) {
          console.log(`Navigation étape ${step}...`);
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(3000);
          
          await page.screenshot({ path: path.join(DEBUG_DIR, `05_step_${step}.png`) });
          
          const currentImg = await page.evaluate(() => {
            const img = document.querySelector('img[src*="scontent"]');
            return img ? { src: img.src.substring(0, 100), alt: img.alt, w: img.naturalWidth, h: img.naturalHeight } : null;
          });
          console.log(`  -> URL: ${page.url().substring(0, 90)}`);
          console.log(`  -> Image: w=${currentImg?.w} x h=${currentImg?.h} | alt="${currentImg?.alt}"`);
        }
      } else {
        console.log('Aucun lien cliquable trouvé dans le post.');
      }
    } else {
      console.log('Post "Ma Revue de Presse" non trouvé sur la page.');
    }
  } catch (err) {
    console.error('Erreur pendant le script:', err);
  } finally {
    await context.close();
    console.log('=== FIN DU DÉBOGAGE ===');
  }
}

run();
