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

const LOG_FILE = path.join(__dirname, '..', 'daily_run.log');

const args = process.argv.slice(2);
const isLoginMode = args.includes('--login');
const isSourceCheckMode = args.includes('--check-source');
const isForceMode = args.includes('--force');
const isVisibleMode = args.includes('--visible') || args.includes('--show');
const directUrlArg = args.find(a => a.startsWith('http://') || a.startsWith('https://'));

/** Logger centralisé avec horodatage, affichage direct en console et fichier */
function log(msg) {
  const timestamp = new Date().toLocaleTimeString('fr-FR');
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n', 'utf8');
  } catch (e) {}
}

/** Barre de progression textuelle visuelle */
function renderProgressBar(current, total = 22, barWidth = 18) {
  const pct = Math.min(100, Math.round((current / total) * 100));
  const filled = Math.round((pct / 100) * barWidth);
  const empty = Math.max(0, barWidth - filled);
  const bar = '■'.repeat(filled) + '□'.repeat(empty);
  return `[${bar}] ${String(pct).padStart(3, ' ')}%`;
}

/** Navigation sécurisée avec rapport d'étape et détection de session */
async function safeGoto(page, url, timeout = 30000) {
  const shortUrl = url.length > 70 ? url.substring(0, 67) + '...' : url;
  log(`  🌐 Connexion : ${shortUrl}`);
  try {
    await page.goto(url, { waitUntil: 'commit', timeout });
  } catch (e) {
    try {
      await page.goto(url, { timeout: 15000 });
    } catch (e2) {}
  }
  await page.waitForTimeout(3000);

  // Vérifier si Facebook demande une connexion
  try {
    const curUrl = page.url();
    if (curUrl.includes('facebook.com/login') || curUrl.includes('checkpoint')) {
      log('  ⚠️ ATTENTION : Facebook demande une réauthentification !');
      log('  👉 Lancez la commande : npm run revue:login (ou connexion_facebook.bat)');
    }
  } catch (e) {}

  // Fermer les bannières cookies ou popups si présentes
  try {
    const dismissButtons = [
      'Autoriser tous les cookies', 'Tout accepter', 'Decline', 'Accept all', 'Plus tard', 'Not now', 'Fermer'
    ];
    for (const text of dismissButtons) {
      const btn = page.locator(`role=button[name="${text}" i]`);
      if (await btn.count() > 0 && await btn.first().isVisible()) {
        log(`  👉 Fermeture popup Facebook : "${text}"`);
        await btn.first().click({ timeout: 1000 });
        await page.waitForTimeout(500);
        break;
      }
    }
  } catch (e) {}
}

async function run() {
  log('====================================================');
  log('  AUTOMATISATION COMPLETE DE LA REVUE DE PRESSE');
  log('====================================================');
  log(`Mode d'affichage : ${isVisibleMode ? 'VISUEL (Fenêtre navigateur visible)' : 'ARRIÈRE-PLAN (Rapide)'}`);
  log(`Dossier de stockage : ${TARGET_DIR}`);
  log(`Fichier journal : ${LOG_FILE}\n`);

  try {
    if (process.platform === 'win32') {
      execSync('taskkill /F /IM chrome-headless-shell.exe 2>nul || exit 0', { shell: 'cmd.exe' });
    }
  } catch (e) {}

  if (!isLoginMode && !isSourceCheckMode && !directUrlArg && !isForceMode && new Date().getDay() === 0) {
    log("ℹ️ C'est dimanche. Il n'y a pas de parution de journaux aujourd'hui.");
    log("Arrêt du script pour éviter de scraper des archives passées.");
    log("💡 Astuce : Ajoutez l'argument --force pour exécuter quand même un test (ex: npm run revue:force).");
    return;
  }

  log('[1/5] 🚀 Lancement du navigateur Chromium...');

  const launchOptions = {
    headless: !isLoginMode && !isVisibleMode,
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
  log('      ✅ Navigateur prêt (session Facebook chargée).');

  // Masquer les traces de Playwright pour éviter la déconnexion automatique par Facebook
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = window.chrome || { runtime: {} };
  });

  if (isLoginMode) {
    log('🔐 MODE CONNEXION ACTIF — Connectez-vous manuellement sur la fenêtre Facebook qui vient de s\'ouvrir.');
    log('   Une fois connecté avec succès, vous pourrez refermer le navigateur.');
    const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();
    await safeGoto(page, 'https://www.facebook.com');
    await new Promise((resolve) => page.on('close', resolve));
    await context.close();
    log('✅ Session enregistrée avec succès.');
    return;
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  try {
    let startPhotoUrl = directUrlArg || null;

    if (startPhotoUrl) {
      log(`🔗 [2/5] URL directe de l'album fournie : ${startPhotoUrl}`);
    } else {
      log(`[2/5] 🔍 Recherche de la parution du jour...`);
      log(`      Source 1 (Profil Mamadou Ly) : ${FB_PROFILE_URL}`);
      startPhotoUrl = await findRevuePostUrl(page);

      if (!startPhotoUrl) {
        log(`      -> Pas de parution détectée sur le profil principal.`);
        log(`      Source 2 de secours (UniversActu) : ${FB_FALLBACK_URL}`);
        startPhotoUrl = await findRevuePostUrlOnPage(page, FB_FALLBACK_URL);
      }
    }

    if (!startPhotoUrl) {
      log('❌ Aucune publication de revue de presse trouvée pour aujourd\'hui.');
      log('   Il est possible que les parutions ne soient pas encore publiées ou que la session ait expiré.');
      await context.close();
      return;
    }

    if (isSourceCheckMode) {
      log(`\n✅ [Contrôle terminé] Album sélectionné : ${startPhotoUrl}`);
      log('   Mode vérification : aucun téléchargement effectué.');
      await context.close();
      return;
    }

    log(`\n[3/5] 🎯 Ouverture de la galerie de presse : ${startPhotoUrl}`);
    await safeGoto(page, startPhotoUrl, 45000);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayFr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    // Nettoyage préalable des fichiers du jour
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

    log(`\n[4/5] 📥 Téléchargement méthodique de chaque une de journal...`);

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

      // Si après plusieurs essais, aucune nouvelle image n'apparaît
      if (!imgInfo || !imgInfo.src || seenSrcs.has(imgInfo.src)) {
        log(`\n      🏁 Fin de l'album atteinte à la photo ${i + 1}. Total analysé : ${downloadedCount} journaux.`);
        break;
      }

      seenSrcs.add(imgInfo.src);

      // Filtrage des éléments non-presse
      const altText = (imgInfo.alt || '').toLowerCase();
      const isPureAvatarOrCover = altText.includes('photo de profil') || altText.includes('photo de couverture');
      const isIsolatedFlower = (altText.includes('lys blanc') || altText.includes('eustoma') || altText.includes('fleur')) &&
        !altText.includes('journal') && !altText.includes('presse') && !altText.includes('texte');

      if (isPureAvatarOrCover || isIsolatedFlower) {
        log(`  ⏭️ [Image ${i + 1}] Ignorée (élément décoratif) : "${altText.substring(0, 35)}..."`);
        skippedCount++;
      } else {
        const paperName = extractPaperName(imgInfo.alt);
        const filename = `revue_${todayStr}_${downloadedCount + 1}.webp`;

        try {
          const response = await fetch(imgInfo.src);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const buffer = Buffer.from(await response.arrayBuffer());

          fs.writeFileSync(path.join(TARGET_DIR, filename), buffer);
          const bar = renderProgressBar(downloadedCount + 1, 21);
          log(`  📸 [${String(downloadedCount + 1).padStart(2, '0')}/21] ${bar} -> ${paperName} (${Math.round(buffer.length / 1024)} KB) [${filename}]`);

          downloadedPapers.push({
            id: String(downloadedCount + 1),
            title: paperName,
            date: todayFr,
            image: `revuedepresse/${filename}`,
            link: '#'
          });

          downloadedCount++;
        } catch (err) {
          log(`  ❌ Erreur téléchargement photo : ${err.message}`);
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

    log(`\n====================================================`);
    log(`  BILAN SCRAPING : ${downloadedCount} journaux enregistrés (${skippedCount} éléments ignorés).`);
    log(`====================================================\n`);

    if (downloadedPapers.length >= 8) {
      log(`[5/5] 💾 Mise à jour de press.json et synchronisation Git...`);
      updatePressJson(downloadedPapers);
      syncGit(todayFr, downloadedPapers.length);
      log(`\n🎉 SUCCÈS : La revue de presse du ${todayFr} (${downloadedPapers.length} journaux) est en ligne !`);
    } else {
      log(`⚠️ Seulement ${downloadedPapers.length} journaux trouvés (minimum 8 requis).`);
      log(`   Mise à jour annulée pour éviter de publier un lot partiel.`);
    }

  } catch (error) {
    log(`❌ Erreur pendant l'exécution : ${error.message}`);
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
  log(`  🔎 Recherche des albums de presse sur : ${sourceName}...`);
  await safeGoto(page, pageUrl, 35000);

  const allCandidates = [];
  const seenUrls = new Set();

  // Défilement progressif avec extraction à chaque étape pour ne rien manquer (évite le recyclage virtuel de Facebook)
  for (let s = 0; s < 5; s++) {
    if (s > 0) {
      log(`     📜 Défilement du fil (${s + 1}/5) pour charger les parutions...`);
      await page.evaluate(() => window.scrollBy(0, 900));
      await page.waitForTimeout(1200);
    }

    const stepItems = await page.evaluate((keywords) => {
      const items = [];
      const seen = new Set();

      // Stratégie 1 : Balises article classiques (Pages Facebook)
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
            items.push({ href: link.href, context: article.innerText || text, isRevue });
          }
        }
      }

      // Stratégie 2 : Recherche de liens set=pcb avec remontée profonde (Profils personnels Facebook)
      const pcbLinks = Array.from(document.querySelectorAll('a[href*="set=pcb."]')).slice(0, 30);
      for (const link of pcbLinks) {
        if (!link.href || seen.has(link.href)) continue;
        let parent = link;
        let fullContext = '';
        for (let level = 0; level < 18 && parent && parent !== document.body; level++, parent = parent.parentElement) {
          const txt = parent.innerText || '';
          if (txt.length > fullContext.length) {
            fullContext = txt;
          }
          if (keywords.some(k => txt.toLowerCase().includes(k)) && (txt.includes('07') || txt.toLowerCase().includes('septembre') || txt.includes('#Rp221') || txt.includes('#rp221'))) {
            fullContext = txt;
            break;
          }
        }
        const ctxLower = fullContext.toLowerCase();
        const isRevue = keywords.some(keyword => ctxLower.includes(keyword)) ||
          ctxLower.includes('journal') || ctxLower.includes('quotidien') || ctxLower.includes('kiosque') || ctxLower.includes('unes') || ctxLower.includes('rp221');
        seen.add(link.href);
        items.push({ href: link.href, context: fullContext, isRevue });
      }

      // Stratégie 3 : Recherche inversée par texte de publication (#Rp221, Revue de Presse, Unes du...)
      const allTextNodes = Array.from(document.querySelectorAll('a, span, div, p'));
      for (const node of allTextNodes) {
        const text = (node.innerText || '').trim();
        const textLower = text.toLowerCase();
        if (textLower.includes('#rp221') || textLower.includes('revue de presse') || textLower.includes('unes du')) {
          let p = node;
          for (let l = 0; l < 16 && p && p !== document.body; l++, p = p.parentElement) {
            const pcb = p.querySelector('a[href*="set=pcb."], a[href*="/photo"]');
            if (pcb && pcb.href && !seen.has(pcb.href)) {
              seen.add(pcb.href);
              items.push({
                href: pcb.href,
                context: p.innerText || text,
                isRevue: true
              });
              break;
            }
          }
        }
      }

      return items;
    }, REVUE_KEYWORDS);

    for (const item of stepItems) {
      if (!seenUrls.has(item.href)) {
        seenUrls.add(item.href);
        allCandidates.push(item);
      }
    }

    // Si on a déjà trouvé un album du jour avec certitude, on peut arrêter de défiler
    const earlyMatch = allCandidates.find(c => c.isRevue && isTodayFacebookPost(c.context));
    if (earlyMatch) {
      log(`     🎯 Album du jour repéré dès l'étape ${s + 1} !`);
      break;
    }
  }

  log(`     📊 ${allCandidates.length} publication(s) avec photos analysée(s).`);

  if (isSourceCheckMode) {
    allCandidates.slice(0, 10).forEach(candidate => {
      const isToday = isTodayFacebookPost(candidate.context);
      const status = isToday ? 'AUJOURD\'HUI' : 'autre date';
      log(`     [${status}] (Revue: ${candidate.isRevue ? 'OUI' : 'NON'}) ${candidate.href.substring(0, 75)}...`);
    });
  }

  // Chercher un album caractérisé du jour
  const todayAlbum = allCandidates.find(candidate =>
    candidate.isRevue && isTodayFacebookPost(candidate.context)
  );
  if (todayAlbum) {
    log(`  ✅ Album de presse du jour identifié : ${todayAlbum.href}`);
    return todayAlbum.href;
  }

  // Si on autorise le dernier album pcb (ex: page UniversActu de secours)
  if (allowLatestPcbWithoutDate && allCandidates.length > 0) {
    const revueCandidate = allCandidates.find(c => c.isRevue) || allCandidates[0];
    log(`  ✅ Dernier album sélectionné sur la source de secours : ${revueCandidate.href}`);
    return revueCandidate.href;
  }

  log(`  -> Aucun album de presse valide pour aujourd'hui sur ${sourceName}.`);
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
  log('💾 Mise à jour de press.json...');
  const pressData = {
    last_updated: new Date().toISOString(),
    press: papers
  };

  fs.writeFileSync(PRESS_JSON_PATH, JSON.stringify(pressData, null, 2), 'utf8');
  log(`✅ press.json mis à jour avec ${papers.length} entrées.`);

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
      log(`✅ Copie miroir synchronisée vers PROJETBI-V2.`);
    } catch (e) {
      log(`⚠️ Note sync PROJETBI-V2 : ${e.message}`);
    }
  }
}

function syncGit(todayFr, count) {
  try {
    log('🚀 Début de la synchronisation Git automatique...');
    const repoDir = path.join(__dirname, '..');

    execSync('git add -A', { cwd: repoDir, stdio: 'inherit' });
    const status = execSync('git status --porcelain', { cwd: repoDir, encoding: 'utf8' }).trim();
    if (status) {
      const commitMsg = `Mise à jour revue de presse du ${todayFr} (${count} journaux)`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: repoDir, stdio: 'inherit' });
      log(`   ✅ Commit local créé : "${commitMsg}"`);
    } else {
      log('   ℹ️ Aucun nouveau fichier à committer.');
    }

    try {
      execSync('git pull --rebase --autostash origin main', { cwd: repoDir, encoding: 'utf8', stdio: 'inherit' });
    } catch (e) {
      log(`   ⚠️ Avertissement Git pull : ${e.message}`);
    }

    execSync('git push origin main', { cwd: repoDir, encoding: 'utf8', stdio: 'inherit' });
    log('   🚀 Push GitHub effectué avec succès sur origin/main !');
  } catch (err) {
    log(`❌ Erreur lors de la synchronisation Git : ${err.message}`);
  }
}

run();
