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
  'anniversaire', 'mariage', 'célébration'
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
  console.log('=== SCRAPE: Méthode navigation directe par URL ===\n');
  
  // Empêcher l'exécution le dimanche (pas de parution de journaux)
  if (new Date().getDay() === 0) {
    console.log('🚫 C\'est dimanche. Il n\'y a pas de parution de presse aujourd\'hui.');
    console.log('Arrêt du script pour éviter de scraper et pusher d\'autres images.');
    return;
  }
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: true,
    args: ['--disable-notifications'],
    viewport: { width: 1280, height: 1000 }
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  // ÉTAPE 1 : Aller sur la page "Toutes les photos" et scroller beaucoup pour charger
  console.log('1. Navigation vers /mamadou.ly.1804/photos...');
  await page.goto('https://www.facebook.com/mamadou.ly.1804/photos', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Scroll agressif pour charger plus de photos
  let lastCount = 0;
  for (let s = 0; s < 30; s++) {
    await page.evaluate(() => window.scrollBy(0, 3000));
    await page.waitForTimeout(1200);
    const count = await page.locator('a[href*="/photo/?"], a[href*="/photo.php"]').count();
    if (count > lastCount) {
      console.log(`   Scroll ${s + 1}: ${count} liens photo chargés`);
      lastCount = count;
    }
    if (count >= 60) {
      console.log(`   Suffisamment de photos chargées (${count})`);
      break;
    }
  }

  // Extraire TOUS les fbids
  const allFbids = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="/photo/?"], a[href*="/photo.php"]'));
    return links.map(a => {
      const match = a.href.match(/fbid=(\d+)/);
      const img = a.querySelector('img');
      return {
        fbid: match ? match[1] : null,
        alt: img ? (img.alt || '') : '',
        href: a.href
      };
    }).filter(p => p.fbid);
  });

  // Dédupliquer
  const uniqueFbids = [];
  const seen = new Set();
  for (const p of allFbids) {
    if (!seen.has(p.fbid)) {
      seen.add(p.fbid);
      uniqueFbids.push(p);
    }
  }

  console.log(`\nTotal de FBIDs uniques trouvés: ${uniqueFbids.length}`);
  uniqueFbids.forEach((p, i) => {
    console.log(`[${i + 1}] fbid=${p.fbid} | alt="${p.alt.substring(0, 50)}"`);
  });

  // ÉTAPE 2 : Si pas assez, essayer une autre approche - aller directement sur les photos récentes
  // Le truc : naviguer photo par photo via l'URL directe
  console.log('\n2. Navigation directe par fbid vers chaque photo...');
  
  // On va naviguer vers chaque fbid et vérifier si c'est un quotidien d'aujourd'hui
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayFr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  // Supprimer les anciens fichiers du jour
  const existingFiles = fs.readdirSync(TARGET_DIR).filter(f => f.startsWith(`revue_${todayStr}_`));
  for (const f of existingFiles) {
    fs.unlinkSync(path.join(TARGET_DIR, f));
    console.log(`Supprimé: ${f}`);
  }

  const downloadedPapers = [];
  let downloadedCount = 0;
  let skippedCount = 0;
  
  // Parcourir chaque photo unique
  for (let i = 0; i < uniqueFbids.length && downloadedCount < 50; i++) {
    const { fbid, alt } = uniqueFbids[i];
    
    // Pré-filtrer avec le alt si disponible
    const altLower = alt.toLowerCase();
    if (alt.length > 0) {
      const isExcluded = EXCLUDE_KEYWORDS.some(kw => altLower.includes(kw));
      if (isExcluded) {
        console.log(`  ⏭ Photo ${i + 1} (fbid=${fbid}) ignorée: sujet exclu "${alt.substring(0, 40)}"`);
        skippedCount++;
        continue;
      }
    }

    // Naviguer vers la photo
    const photoUrl = `https://www.facebook.com/photo/?fbid=${fbid}`;
    await page.goto(photoUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // Extraire l'image HD
    const imgInfo = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img')).filter(i => 
        i.src && i.src.includes('scontent') && i.naturalWidth > 300 && i.naturalHeight > 300
      );
      if (imgs.length === 0) return null;
      // Prendre la plus grande
      imgs.sort((a, b) => (b.naturalWidth * b.naturalHeight) - (a.naturalWidth * a.naturalHeight));
      return { src: imgs[0].src, alt: imgs[0].alt || '', w: imgs[0].naturalWidth, h: imgs[0].naturalHeight };
    });

    if (!imgInfo) {
      console.log(`  ⚠ Photo ${i + 1} (fbid=${fbid}): pas d'image HD trouvée`);
      continue;
    }

    const imgAlt = imgInfo.alt.toLowerCase();
    const isExcluded = EXCLUDE_KEYWORDS.some(kw => imgAlt.includes(kw));
    const isNewspaper = NEWSPAPER_KEYWORDS.some(kw => imgAlt.includes(kw));

    // Si l'image est trop large et pas assez haute, c'est probablement une couverture
    if (imgInfo.w > imgInfo.h * 2) {
      console.log(`  ⏭ Photo ${i + 1} (fbid=${fbid}): ratio panoramique (couverture?) ${imgInfo.w}x${imgInfo.h}`);
      skippedCount++;
      continue;
    }

    if (isExcluded) {
      console.log(`  ⏭ Photo ${i + 1} (fbid=${fbid}): sujet exclu "${imgInfo.alt.substring(0, 40)}"`);
      skippedCount++;
      continue;
    }

    if (!isNewspaper && imgInfo.alt.length > 0) {
      console.log(`  ⏭ Photo ${i + 1} (fbid=${fbid}): pas un quotidien "${imgInfo.alt.substring(0, 40)}"`);
      skippedCount++;
      continue;
    }

    // C'est un quotidien ! Télécharger
    console.log(`  📰 Photo ${i + 1} (fbid=${fbid}): quotidien détecté !`);
    try {
      const response = await fetch(imgInfo.src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());

      const paperName = extractPaperName(imgInfo.alt);
      const filename = `revue_${todayStr}_${downloadedCount + 1}.jpg`;
      fs.writeFileSync(path.join(TARGET_DIR, filename), buffer);
      console.log(`     ✅ Sauvegardé: ${filename} (${Math.round(buffer.length / 1024)} KB) — ${paperName}`);

      downloadedPapers.push({
        id: String(downloadedCount + 1),
        title: paperName,
        date: todayFr,
        image: `revuedepresse/${filename}`,
        link: '#'
      });
      downloadedCount++;
    } catch (err) {
      console.error(`     ❌ Erreur téléchargement: ${err.message}`);
    }
  }

  console.log(`\n=== RÉSULTAT: ${downloadedCount} quotidiens téléchargés, ${skippedCount} ignorés ===`);

  // Mettre à jour press.json seulement si on a au moins 12 journaux
  if (downloadedPapers.length >= 12) {
    const pressData = {
      last_updated: new Date().toISOString(),
      press: downloadedPapers
    };
    fs.writeFileSync(PRESS_JSON_PATH, JSON.stringify(pressData, null, 2), 'utf8');
    console.log(`press.json mis à jour avec ${downloadedPapers.length} entrées.`);

    // Git sync
    try {
      console.log('\nSynchronisation Git...');
      execSync('git add revuedepresse/ press.json', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      const status = execSync('git status --porcelain', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
      if (status) {
        execSync(`git commit -m "Mise à jour revue de presse du ${todayFr}"`, { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      }
      
      try {
        execSync('git pull --rebase origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      } catch (e) {
        console.warn('Avertissement Git pull:', e.message);
      }

      execSync('git push origin main', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
      console.log('Git push réussi !');
    } catch (e) {
      console.error('Erreur Git:', e.message);
    }
  } else {
    console.log(`⚠ Seulement ${downloadedPapers.length} journaux trouvés (minimum 12 requis).`);
    console.log(`Annulation de la mise à jour pour éviter de publier un lot incomplet ou de fausses images.`);
  }

  await context.close();
  console.log('\n=== FIN ===');
}

run().catch(console.error);
