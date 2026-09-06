const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FB_PROFILE_URL = 'https://www.facebook.com/mamadou.ly.1804';
const FB_FALLBACK_URL = 'https://www.facebook.com/universactu';
const TARGET_DIR = path.join(__dirname, '..', 'revuedepresse');
const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');
const PRESS_JSON_PATH = path.join(__dirname, '..', 'press.json');

const SECONDARY_PROJECT_DIR = 'C:\\Users\\bamba\\OneDrive\\PROJETBI-V2';

// Mots-clés caractérisant la revue de presse
const REVUE_KEYWORDS = [
  'revue de presse', 'kiosque', 'quotidien', 'unes', 'une ', 'parution', 'rp221', 'presse', 'journaux', 'journal'
];

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const args = process.argv.slice(2);
const isLoginMode = args.includes('--login');
const isSourceCheckMode = args.includes('--check-source');
const isForceMode = args.includes('--force');
const directUrlArg = args.find(a => a.startsWith('http://') || a.startsWith('https://'));

/** Navigation sécurisée pour éviter les timeouts domcontentloaded sur Facebook */
async function safeGoto(page, url, timeout = 30000) {
  try {
    await page.goto(url, { waitUntil: 'commit', timeout });
  } catch (e) {
    try {
      await page.goto(url, { timeout: 15000 });
    } catch (e2) {}
  }
  await page.waitForTimeout(3500);

  // Fermer les bannières cookies ou popups si présentes
  try {
    const dismissButtons = [
      'Autoriser tous les cookies', 'Tout accepter', 'Decline', 'Accept all', 'Plus tard', 'Not now', 'Fermer'
    ];
    for (const text of dismissButtons) {
      const btn = page.locator(`role=button[name="${text}" i]`);
      if (await btn.count() > 0 && await btn.first().isVisible()) {
        await btn.first().click({ timeout: 1000 });
        await page.waitForTimeout(500);
        break;
      }
    }
  } catch (e) {}
}

async function run() {
  console.log('====================================================');
  console.log('  AUTOMATISATION COMPLETE DE LA REVUE DE PRESSE');
  console.log('====================================================\n');

  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM chrome-headless-shell.exe 2>nul || exit 0', { shell: 'cmd.exe' });
    }
  } catch (e) {}

  if (!isLoginMode && !isSourceCheckMode && !directUrlArg && !isForceMode && new Date().getDay() === 0) {
    console.log("ℹ️ C'est dimanche. Il n'y a pas de parution de presse aujourd'hui.");
    console.log("Arrêt du script pour éviter de scraper de fausses images.");
    return;
  }

  const launchOptions = {
    headless: !isLoginMode,
    args: [
      '--disable-notifications',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    viewport: { width: 1280, height: 950 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'fr-FR'
  };

  const context = await chromium.launchPersistentContext(USER_DATA_DIR, launchOptions);

  // Masquer les traces de Playwright pour éviter la déconnexion automatique par Facebook
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = window.chrome || { runtime: {} };
  });

  if (isLoginMode) {
    console.log('MODE CONNEXION ACTIVE - Connectez-vous puis fermez le navigateur.');
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await safeGoto(page, 'https://www.facebook.com');
    await new Promise((resolve) => page.on('close', resolve));
    await context.close();
    return;
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    let startPhotoUrl = directUrlArg || null;

    if (startPhotoUrl) {
      console.log(`🔗 URL directe fournie : ${startPhotoUrl}`);
    } else {
      console.log(`1. Recherche de la publication du jour sur : ${FB_PROFILE_URL}...`);
      startPhotoUrl = await findRevuePostUrl(page);

      if (!startPhotoUrl) {
        console.log(`  -> Aucun quotidien trouvé sur le profil principal.`);
        console.log(`  -> Recherche de secours sur : ${FB_FALLBACK_URL}...`);
        startPhotoUrl = await findRevuePostUrlOnPage(page, FB_FALLBACK_URL);
      }
    }

    if (!startPhotoUrl) {
      console.log('❌ Aucune publication de revue de presse trouvée.');
      await context.close();
      return;
    }

    if (isSourceCheckMode) {
      console.log(`\n✅ Contrôle réussi : album de revue sélectionné : ${startPhotoUrl}`);
      console.log('  Aucun fichier téléchargé et aucune publication Git effectuée.');
      await context.close();
      return;
    }

    console.log(`\n2. Ouverture de la galerie : ${startPhotoUrl}`);
    await safeGoto(page, startPhotoUrl, 45000);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayFr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // Supprimer les fichiers résiduels du jour avant de retélécharger
    try {
      const existingTodayFiles = fs.readdirSync(TARGET_DIR).filter(f => f.startsWith(`revue_${todayStr}_`));
      for (const f of existingTodayFiles) {
        fs.unlinkSync(path.join(TARGET_DIR, f));
      }
    } catch (e) {}

    const downloadedPapers = [];
    const seenSrcs = new Set();
    let downloadedCount = 0;
    let skippedCount = 0;

    console.log(`\n3. Parcours et téléchargement de toute la galerie...`);

    for (let i = 0; i < 60; i++) {
      let imgInfo = null;

      // Attendre que la nouvelle image soit chargée
      for (let attempt = 0; attempt < 12; attempt++) {
        imgInfo = await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll('img'));
          let best = null;
          let maxArea = 0;
          for (const img of imgs) {
            const w = img.naturalWidth || img.width || 0;
            const h = img.naturalHeight || img.height || 0;
            const area = w * h;
            // Ne garder que les images principales de la visionneuse (grand format)
            if (area > maxArea && area > 100000 && !img.src.includes('emoji') && !img.src.includes('profile')) {
              maxArea = area;
              best = img;
            }
          }
          if (best) {
            return {
              src: best.src,
              alt: best.alt || '',
              w: best.naturalWidth || best.width || 0,
              h: best.naturalHeight || best.height || 0
            };
          }
          return null;
        });

        if (imgInfo && imgInfo.src && !seenSrcs.has(imgInfo.src)) {
          break;
        }
        await page.waitForTimeout(500);
      }

      // Si après plusieurs essais, aucune nouvelle image n'apparaît (fin de l'album ou boucle)
      if (!imgInfo || !imgInfo.src || seenSrcs.has(imgInfo.src)) {
        console.log(`\nFin de la galerie atteinte à la photo ${i + 1}. Total scannées : ${downloadedCount}`);
        break;
      }

      seenSrcs.add(imgInfo.src);

      // Vérifier si c'est une image non-pertinente (uniquement les cas évidents)
      const altText = (imgInfo.alt || '').toLowerCase();
      const isPureAvatarOrCover = altText.includes('photo de profil') || altText.includes('photo de couverture');
      const isIsolatedFlower = (altText.includes('lys blanc') || altText.includes('eustoma') || altText.includes('fleur')) &&
        !altText.includes('journal') && !altText.includes('presse') && !altText.includes('texte');

      if (isPureAvatarOrCover || isIsolatedFlower) {
        console.log(`  ⏭️ Photo ${i + 1} ignorée (élément non-presse) : "${altText.substring(0, 40)}"`);
        skippedCount++;
      } else {
        const paperName = extractPaperName(imgInfo.alt);
        const filename = `revue_${todayStr}_${downloadedCount + 1}.webp`;

        try {
          const response = await fetch(imgInfo.src);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());

          fs.writeFileSync(path.join(TARGET_DIR, filename), buffer);
          console.log(`  📸 Photo ${downloadedCount + 1} (${imgInfo.w}x${imgInfo.h}) -> Sauvegardé : ${filename} (${Math.round(buffer.length / 1024)} KB) [${paperName}]`);

          downloadedPapers.push({
            id: String(downloadedCount + 1),
            title: paperName,
            date: todayFr,
            image: `revuedepresse/${filename}`,
            link: '#'
          });

          downloadedCount++;
        } catch (err) {
          console.error(`  ❌ Erreur téléchargement photo: ${err.message}`);
        }
      }

      // Passer à la photo suivante
      let clicked = false;
      try {
        const nextLocator = page.locator('[aria-label="Photo suivante"], [aria-label="Next photo"], [aria-label="Photo suivante."]').first();
        if (await nextLocator.count() > 0 && await nextLocator.isVisible()) {
          await nextLocator.click({ timeout: 2000 });
          clicked = true;
        }
      } catch (e) {}

      if (!clicked) {
        clicked = await page.evaluate(() => {
          const nextDiv = document.querySelector('[aria-label="Photo suivante"], [aria-label="Next photo"], [aria-label="Photo suivante."]');
          if (nextDiv) {
            nextDiv.click();
            return true;
          }
          return false;
        });
      }

      if (!clicked) {
        await page.keyboard.press('ArrowRight');
      }

      await page.waitForTimeout(1800);
    }

    console.log(`\n====================================================`);
    console.log(`  FIN DU SCRAPING : ${downloadedCount} journaux téléchargés, ${skippedCount} ignorés.`);
    console.log(`====================================================\n`);

    if (downloadedPapers.length >= 8) {
      updatePressJson(downloadedPapers);
      syncGit(todayFr, downloadedPapers.length);
    } else {
      console.log(`⚠️ Seulement ${downloadedPapers.length} journaux trouvés (minimum 8 requis).`);
      console.log(`Annulation de la mise à jour pour éviter de publier un lot incomplet.`);
    }

  } catch (error) {
    console.error("Erreur pendant l'exécution :", error.message);
  } finally {
    await context.close();
  }
}

/**
 * Vérifie si le texte correspond à une publication récente du jour
 */
function isTodayFacebookPost(text) {
  const normalized = (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'ʼ`]/g, "'");

  // Si l'auteur annonce explicitement une pause
  if (normalized.includes('observe une pause') || normalized.includes('pause de deux semaines')) {
    return false;
  }

  if (normalized.includes('hier')) return false;

  const now = new Date();
  const day = String(now.getDate());
  const dayPadded = String(now.getDate()).padStart(2, '0');
  const monthNames = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
  const month = monthNames[now.getMonth()];
  const year = String(now.getFullYear());

  return (
    normalized.includes("aujourd'hui") ||
    normalized.includes('il y a') ||
    normalized.includes('maintenant') ||
    normalized.includes('h ·') ||
    normalized.includes('min ·') ||
    new RegExp(`\\b(${day}|${dayPadded})\\s+${month}(\\s+${year})?\\b`).test(normalized)
  );
}

async function findTodayPcbAlbum(page, pageUrl, sourceName, allowLatestPcbWithoutDate = false) {
  console.log(`  -> Recherche des albums de publication sur ${sourceName}...`);
  await safeGoto(page, pageUrl, 35000);

  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(800);
  }

  const candidates = await page.evaluate((keywords) => {
    const found = [];
    const seen = new Set();

    // 1. Chercher dans les balises article / feed
    const articles = Array.from(document.querySelectorAll('div[role="article"], div[data-ad-preview]'));
    for (const article of articles) {
      const links = Array.from(article.querySelectorAll('a[href*="set=pcb."], a[href*="/photo"]'));
      if (!links.length) continue;
      const text = (article.innerText || '').toLowerCase();
      const isRevue = keywords.some(keyword => text.includes(keyword)) ||
        text.includes('journal') || text.includes('quotidien') || text.includes('kiosque') || text.includes('unes');

      for (const link of links) {
        if (link.href && !seen.has(link.href)) {
          seen.add(link.href);
          found.push({ href: link.href, context: text, isRevue });
        }
      }
    }

    // 2. Chercher dans tous les liens set=pcb
    const pcbLinks = Array.from(document.querySelectorAll('a[href*="set=pcb"]')).slice(0, 30);
    for (const link of pcbLinks) {
      if (!link.href || seen.has(link.href)) continue;
      let parent = link;
      let context = '';
      for (let level = 0; level < 6 && parent; level++, parent = parent.parentElement) {
        context += ` ${parent.innerText || ''}`;
      }
      context = context.toLowerCase();
      const isRevue = keywords.some(keyword => context.includes(keyword)) ||
        context.includes('journal') || context.includes('quotidien') || context.includes('kiosque') || context.includes('unes');
      seen.add(link.href);
      found.push({ href: link.href, context, isRevue });
    }

    return found;
  }, REVUE_KEYWORDS);

  if (isSourceCheckMode) {
    console.log(`  -> ${candidates.length} album(s) détecté(s) sur ${sourceName}.`);
    candidates.slice(0, 8).forEach(candidate => {
      const status = isTodayFacebookPost(candidate.context) ? 'AUJOURD\'HUI' : 'autre date';
      console.log(`     [${status}] ${candidate.href}`);
    });
  }

  // Chercher un album caractérisé du jour
  const todayAlbum = candidates.find(candidate =>
    candidate.isRevue && isTodayFacebookPost(candidate.context)
  );
  if (todayAlbum) {
    console.log(`  ✅ Album du jour identifié : ${todayAlbum.href}`);
    return todayAlbum.href;
  }

  // Si on autorise le dernier album pcb (ex: page UniversActu spécialisée dans la revue)
  if (allowLatestPcbWithoutDate && candidates.length > 0) {
    const revueCandidate = candidates.find(c => c.isRevue) || candidates[0];
    console.log(`  ✅ Dernier album sélectionné sur la source de secours : ${revueCandidate.href}`);
    return revueCandidate.href;
  }

  console.log(`  -> Aucun album de revue valide aujourd'hui sur ${sourceName}.`);
  return null;
}

async function findRevuePostUrl(page) {
  return findTodayPcbAlbum(page, FB_PROFILE_URL, 'le profil principal');
}

async function findRevuePostUrlOnPage(page, pageUrl) {
  return findTodayPcbAlbum(page, pageUrl, 'UniversActu', true);
}

function extractPaperName(alt) {
  if (!alt) return 'Quotidien';
  const clean = alt
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const knownPapers = [
    { keywords: ['rewmi sport', 'rewmisport'], name: 'Rewmi Sports' },
    { keywords: ['rewmi quotidien', 'rewmi'], name: 'Rewmi Quotidien' },
    { keywords: ['soleil', 'le soleil'], name: 'Le Soleil' },
    { keywords: ['sud quotidien', 'sudonline', 'sud '], name: 'Sud Quotidien' },
    { keywords: ['liberation'], name: 'Libération' },
    { keywords: ['observateur', 'lobservateur', "l'observateur"], name: "L'Observateur" },
    { keywords: ['le quotidien', 'lequotidien'], name: 'Le Quotidien' },
    { keywords: ['evidence', 'levidence', "l'evidence"], name: "L'Évidence" },
    { keywords: ['echos', 'les echos'], name: 'Les Échos' },
    { keywords: ['point actu', 'le point', 'le epoint'], name: 'Le Point' },
    { keywords: ['tribune sport', 'tribune'], name: 'Tribune' },
    { keywords: ['las', "l'as"], name: "L'As" },
    { keywords: ['enquete'], name: 'Enquête' },
    { keywords: ['record'], name: 'Record' },
    { keywords: ['yoor-yoor', 'yooryoor', 'yoor'], name: 'Yoor-Yoor' },
    { keywords: ['direct news', 'directnews'], name: 'Direct News' },
    { keywords: ['linfo', "l'info"], name: "L'Info" },
    { keywords: ['populaire', 'pop', 'le populaire'], name: 'Le Populaire' },
    { keywords: ['bes bi', 'besbi', 'le jour'], name: 'Bès Bi' },
    { keywords: ['source a', 'sourcea'], name: 'Source A' },
    { keywords: ['walf', 'walfadjri'], name: 'Walf Quotidien' },
    { keywords: ['lii quotidien', 'lii'], name: 'Lii Quotidien' },
    { keywords: ['temoin', 'le temoin'], name: 'Le Témoin' },
    { keywords: ['vox populi', 'voxpopuli', 'vox'], name: 'Vox Populi' },
    { keywords: ['stade'], name: 'Stade' },
    { keywords: ['grand panel', 'panel'], name: 'Grand Panel' },
    { keywords: ['scoop', 'quotidien digital scoop'], name: 'Scoop' },
    { keywords: ['alerte'], name: 'Alerte Quotidien' },
    { keywords: ['independant', "l'independant"], name: "L'Indépendant" },
    { keywords: ['informateur', "l'informateur"], name: "L'Informateur" },
    { keywords: ['solo quotidien', 'solo'], name: 'Solo Quotidien' },
    { keywords: ['peuple', 'le peuple'], name: 'Le Peuple' }
  ];

  for (const paper of knownPapers) {
    for (const kw of paper.keywords) {
      if (clean.includes(kw)) return paper.name;
    }
  }
  return 'Quotidien';
}

function updatePressJson(papers) {
  console.log('Mise à jour de press.json...');
  const pressData = {
    last_updated: new Date().toISOString(),
    press: papers
  };

  fs.writeFileSync(PRESS_JSON_PATH, JSON.stringify(pressData, null, 2), 'utf8');
  console.log(`press.json mis à jour avec ${papers.length} entrées.`);

  if (fs.existsSync(SECONDARY_PROJECT_DIR)) {
    try {
      const targetJson = path.join(SECONDARY_PROJECT_DIR, 'press.json');
      fs.writeFileSync(targetJson, JSON.stringify(pressData, null, 2), 'utf8');

      const secRevueDir = path.join(SECONDARY_PROJECT_DIR, 'revuedepresse');
      if (!fs.existsSync(secRevueDir)) fs.mkdirSync(secRevueDir, { recursive: true });

      for (const p of papers) {
        const basename = path.basename(p.image);
        const srcFile = path.join(TARGET_DIR, basename);
        const dstFile = path.join(secRevueDir, basename);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, dstFile);
        }
      }
      console.log(`Copie synchronisée vers PROJETBI-V2 effectuée !`);
    } catch (e) {
      console.warn('Avertissement sync PROJETBI-V2:', e.message);
    }
  }
}

function syncGit(todayFr, count) {
  try {
    console.log('Synchronisation Git automatique...');
    const repoDir = path.join(__dirname, '..');

    execSync('git add -A', { cwd: repoDir, stdio: 'inherit' });
    const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf8' }).trim();
    if (status) {
      const commitMsg = `Mise à jour revue de presse du ${todayFr} (${count} journaux)`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: repoDir, stdio: 'inherit' });
    } else {
      console.log('Aucun nouveau fichier à committer, vérification du push...');
    }

    try {
      execSync('git pull --rebase --autostash origin main', { cwd: repoDir, encoding: 'utf8', stdio: 'inherit' });
    } catch (e) {
      console.warn('Avertissement Git pull:', e.message);
    }

    execSync('git push origin main', { cwd: repoDir, encoding: 'utf8', stdio: 'inherit' });
    console.log('🚀 Push GitHub effectué avec succès !');
  } catch (err) {
    console.error('Erreur lors de la synchronisation Git :', err.message);
  }
}

run();
