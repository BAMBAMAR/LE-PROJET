const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');
const TARGET_DIR = path.join(__dirname, '..', 'revuedepresse');
const PRESS_JSON_PATH = path.join(__dirname, '..', 'press.json');

const NEWSPAPER_KEYWORDS = [
  'texte', 'journal', 'kiosque', 'quotidien', 'presse',
  'sport', 'actu', 'info', 'news', 'tribune',
  'soleil', 'libération', 'observateur', 'enquête', 'record',
  'évidence', 'rewmi', 'échos', 'point', 'pop',
  'sud', 'direct', 'exclusif', 'interview', 'panel', 'source'
];
const EXCLUDE_KEYWORDS = [
  'fleur', 'fleurs', 'flower', 'flowers', 'plante', 'plantes', 'vase', 'bouquet',
  'lavande', 'pivoine', 'eustoma', 'amarante', 'orchidée', 'strelitzia',
  'nourriture', 'recette', 'gâteau', 'cuisine',
  'anniversaire', 'mariage', 'célébration', 'course-pours', 'football bal', 'moto'
];

function extractPaperName(alt) {
  const lower = alt.toLowerCase();
  const names = {
    'rewmi': 'Rewmi Quotidien', 'soleil': 'Le Soleil', 'libération': 'Libération',
    'observateur': "L'Observateur", 'enquête': 'Enquête', 'record': 'Record',
    'évidence': "L'Évidence", 'tribune': 'Tribune', 'échos': 'Les Échos',
    'sud': 'Sud Quotidien', 'pop': 'Le Populaire', 'info': "L'Info",
    'sport': 'Sport', 'direct': 'Direct News', 'exclusif': "L'Exclusif",
    'panel': 'Grand Panel', 'source': 'Source A', 'yoor': 'Yoor-Yoor'
  };
  for (const [kw, name] of Object.entries(names)) {
    if (lower.includes(kw)) return name;
  }
  return 'Quotidien';
}

async function run() {
  console.log('=== SCRAPE VIA POST PERMALINK ===\n');
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 1000 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // ÉTAPE 1: Trouver le permalink du post sur le profil
  console.log('1. Recherche du permalink du post "Ma Revue de Presse"...');
  await page.goto('https://www.facebook.com/mamadou.ly.1804', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Scroll pour charger le post
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(1500);
  }

  // Trouver le permalink du post (lien avec /posts/ ou timestamp)
  const postPermalinks = await page.evaluate(() => {
    // Chercher les liens de timestamp dans les posts (contiennent l'heure)
    const links = Array.from(document.querySelectorAll('a'));
    const postLinks = [];
    for (const a of links) {
      const href = a.href || '';
      const text = a.textContent || '';
      // Permalinks de posts Facebook
      if (href.includes('/posts/') || href.includes('/permalink/') || href.includes('story_fbid')) {
        postLinks.push({ href, text: text.substring(0, 30) });
      }
      // Aussi les timestamps (ex: "9 h", "10 h")
      if (text.match(/^\d+ h$/) && href.includes('facebook.com')) {
        postLinks.push({ href, text: text.substring(0, 30) });
      }
    }
    return postLinks;
  });

  console.log('Permalinks de posts trouvés:');
  postPermalinks.forEach((p, i) => console.log(`  [${i + 1}] "${p.text}" → ${p.href.substring(0, 100)}`));

  // ÉTAPE 2: Naviguer vers le post pour trouver ses photos
  // Utiliser la méthode Graph : les photos du post sont accessibles via le set=pcb.POSTID
  // Essayons d'abord de trouver la page du post
  let postUrl = null;
  for (const p of postPermalinks) {
    if (p.href.includes('/posts/') || p.href.includes('story_fbid') || p.href.includes('/permalink/')) {
      postUrl = p.href;
      break;
    }
  }

  if (!postUrl && postPermalinks.length > 0) {
    postUrl = postPermalinks[0].href;
  }

  if (postUrl) {
    console.log(`\n2. Navigation vers le post: ${postUrl.substring(0, 100)}`);
    await page.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(5000);

    // Scroll dans le post
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 1500));
      await page.waitForTimeout(1500);
    }

    // Extraire les liens photo du post
    const postPhotos = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/photo"]'));
      return links.map(a => {
        const match = a.href.match(/fbid=(\d+)/);
        const img = a.querySelector('img');
        return {
          fbid: match ? match[1] : null,
          href: a.href,
          alt: img ? (img.alt || '') : '',
          set: (a.href.match(/set=([^&]+)/) || [])[1] || ''
        };
      }).filter(p => p.fbid);
    });

    // Dédupliquer
    const uniquePhotos = [];
    const seen = new Set();
    for (const p of postPhotos) {
      if (!seen.has(p.fbid)) {
        seen.add(p.fbid);
        uniquePhotos.push(p);
      }
    }

    console.log(`\nPhotos trouvées dans le post: ${uniquePhotos.length}`);
    uniquePhotos.forEach((p, i) => {
      console.log(`  [${i + 1}] fbid=${p.fbid} set=${p.set.substring(0, 30)} alt="${p.alt.substring(0, 50)}"`);
    });
  }

  // ÉTAPE 3: Approche alternative - lister les photos via le set=pcb (post content bundle)
  // Chaque post multi-photos a un set=pcb.XXXXX
  // Chercher tous les sets dans la page
  console.log('\n3. Recherche de tous les "set=" dans la page...');
  const allSets = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="set="]'));
    const sets = new Set();
    links.forEach(a => {
      const match = a.href.match(/set=([^&]+)/);
      if (match) sets.add(match[1]);
    });
    return Array.from(sets);
  });
  console.log('Sets trouvés:', allSets);

  // ÉTAPE 4: Naviguer vers la photo du post AVEC le bon set pour débloquer la navigation
  console.log('\n4. Essai avec set=pcb si disponible...');
  const pcbSet = allSets.find(s => s.startsWith('pcb.'));
  
  if (pcbSet) {
    console.log(`   Trouvé pcb set: ${pcbSet}`);
    // Naviguer vers la première photo avec ce set
    const firstPhoto = `https://www.facebook.com/photo/?fbid=10235301284892468&set=${pcbSet}`;
    console.log(`   Navigation vers: ${firstPhoto}`);
    await page.goto(firstPhoto, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);

    // Tester la navigation
    const mainImg = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src && i.src.includes('scontent') && i.naturalWidth > 300);
      return imgs.length > 0 ? { src: imgs[0].src, alt: imgs[0].alt || '' } : null;
    });
    console.log(`   Image: "${(mainImg?.alt || '').substring(0, 60)}"`);
    
    let prevSrc = mainImg?.src || '';
    for (let step = 0; step < 3; step++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(2500);
      const info = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src && i.src.includes('scontent') && i.naturalWidth > 300);
        return imgs.length > 0 ? { src: imgs[0].src, alt: (imgs[0].alt || '').substring(0, 60) } : null;
      });
      const changed = info && info.src !== prevSrc;
      console.log(`   [Step ${step + 1}] Changed: ${changed} | Alt: "${info?.alt || ''}"`);
      if (info) prevSrc = info.src;
    }
  } else {
    console.log('   Aucun set pcb trouvé.');
    
    // ÉTAPE 5: Méthode finale - utiliser le mode NON-headless pour ouvrir le vrai viewer
    console.log('\n5. Méthode page.goto vers photo dans contexte album...');
    // Essayer avec le set de l'album principal et naviguer
    const albumPhotoUrl = 'https://www.facebook.com/photo/?fbid=10235301284892468&set=a.10208393349810908';
    await page.goto(albumPhotoUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);

    // Regarder si on peut trouver les liens "précédent/suivant" ou d'autres photos
    const viewerLinks = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href*="/photo"]'));
      return allLinks.map(a => {
        const match = a.href.match(/fbid=(\d+)/);
        return {
          fbid: match ? match[1] : null,
          href: a.href.substring(0, 100),
          set: (a.href.match(/set=([^&]+)/) || [])[1] || ''
        };
      }).filter(p => p.fbid);
    });
    
    const uniqueViewerFbids = [];
    const seenV = new Set();
    for (const p of viewerLinks) {
      if (!seenV.has(p.fbid)) {
        seenV.add(p.fbid);
        uniqueViewerFbids.push(p);
      }
    }
    console.log(`   Liens photo dans le viewer: ${uniqueViewerFbids.length}`);
    uniqueViewerFbids.forEach((p, i) => console.log(`   [${i + 1}] fbid=${p.fbid} set=${p.set.substring(0, 30)}`));
  }

  await context.close();
  console.log('\n=== FIN ===');
}

run().catch(console.error);
