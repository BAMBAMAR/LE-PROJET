const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');

async function deepInvestigation() {
  console.log('=== INVESTIGATION APPROFONDIE ===\n');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 1000 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // === ÉTAPE 1: Timeline du profil - chercher TOUS les posts d'aujourd'hui ===
  console.log('--- ÉTAPE 1: Timeline du profil ---');
  await page.goto('https://www.facebook.com/mamadou.ly.1804', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Scroll pour charger les posts
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 2000));
    await page.waitForTimeout(2000);
  }

  // Extraire TOUS les posts avec leur contenu et dates
  const posts = await page.evaluate(() => {
    // Chercher les posts dans le feed
    const allDivs = Array.from(document.querySelectorAll('div[data-ad-preview], div[role="article"]'));
    const results = [];
    
    for (const div of allDivs) {
      const text = (div.innerText || '').substring(0, 300);
      const photoLinks = Array.from(div.querySelectorAll('a[href*="/photo"]'));
      const imgs = Array.from(div.querySelectorAll('img')).filter(i => i.src && i.naturalWidth > 100);
      
      // Chercher les timestamps
      const timeEls = Array.from(div.querySelectorAll('a[href*="/posts/"], a[aria-label*="h"], span[id]'));
      const timeTexts = timeEls.map(t => t.textContent || t.getAttribute('aria-label') || '').filter(t => t.length < 50);
      
      if (text.length > 20) {
        results.push({
          text: text.replace(/\n/g, ' | '),
          photoCount: photoLinks.length,
          imgCount: imgs.length,
          timeHints: timeTexts.slice(0, 3),
          photoHrefs: photoLinks.slice(0, 5).map(a => a.href)
        });
      }
    }
    return results;
  });

  console.log(`Posts trouvés sur la timeline: ${posts.length}`);
  posts.forEach((p, i) => {
    console.log(`\n[Post ${i + 1}] Photos: ${p.photoCount}, Images: ${p.imgCount}`);
    console.log(`  Time: ${JSON.stringify(p.timeHints)}`);
    console.log(`  Text: ${p.text.substring(0, 120)}`);
    if (p.photoHrefs.length > 0) {
      p.photoHrefs.forEach(h => console.log(`  Link: ${h.substring(0, 80)}`));
    }
  });

  // === ÉTAPE 2: Chercher les FBID récents dans l'album "Photos" ===
  console.log('\n\n--- ÉTAPE 2: Album "Photos" (25 235 éléments) ---');
  await page.goto('https://www.facebook.com/media/set/?set=a.10208393349810908&type=3', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Scroll pour charger plus de photos
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(2000);
  }

  const albumPhotos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/photo/?"], a[href*="/photo.php"]')).map(a => {
      const img = a.querySelector('img');
      // Extract fbid from href
      const match = a.href.match(/fbid=(\d+)/);
      return {
        fbid: match ? match[1] : 'unknown',
        href: a.href.substring(0, 80),
        alt: img ? (img.alt || '').substring(0, 60) : ''
      };
    });
  });

  console.log(`Photos dans l'album: ${albumPhotos.length}`);
  albumPhotos.slice(0, 20).forEach((p, i) => {
    console.log(`[${i + 1}] fbid=${p.fbid} | alt="${p.alt}"`);
  });

  // === ÉTAPE 3: Comparer les fbids ===
  console.log('\n\n--- ÉTAPE 3: Comparaison des FBID ---');
  console.log('FBID composite d\'aujourd\'hui: 10235301284892468');
  console.log('FBID fleurs d\'aujourd\'hui: 10235301306293003');
  if (albumPhotos.length > 0) {
    const fbids = albumPhotos.map(p => parseInt(p.fbid)).filter(n => !isNaN(n)).sort((a, b) => b - a);
    console.log('FBID les plus récents dans l\'album:');
    fbids.slice(0, 10).forEach(f => {
      const isToday = f >= 10235301284892468;
      const isYesterday = f >= 10235289000000000 && f < 10235301000000000;
      console.log(`  ${f} ${isToday ? '← AUJOURD\'HUI' : isYesterday ? '← HIER (05/08)' : ''}`);
    });
  }

  // === ÉTAPE 4: Vérifier photos_by avec plus de scroll ===
  console.log('\n\n--- ÉTAPE 4: photos_by avec scroll intensif ---');
  await page.goto('https://www.facebook.com/mamadou.ly.1804/photos_by', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);

  for (let i = 0; i < 15; i++) {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1500);
  }

  const photosByLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/photo/?"], a[href*="/photo.php"]')).map(a => {
      const img = a.querySelector('img');
      const match = a.href.match(/fbid=(\d+)/);
      return {
        fbid: match ? match[1] : 'unknown',
        alt: img ? (img.alt || '').substring(0, 60) : ''
      };
    });
  });

  console.log(`Liens sur photos_by après scroll: ${photosByLinks.length}`);
  photosByLinks.forEach((p, i) => {
    console.log(`[${i + 1}] fbid=${p.fbid} | alt="${p.alt}"`);
  });

  await context.close();
  console.log('\n=== FIN INVESTIGATION ===');
}

deepInvestigation().catch(console.error);
