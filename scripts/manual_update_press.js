const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_DIR = path.join(__dirname, '..');
const REVUE_DIR = path.join(PROJECT_DIR, 'revuedepresse');
const UPLOAD_DIR = path.join(REVUE_DIR, 'upload');
const PRESS_JSON_PATH = path.join(PROJECT_DIR, 'press.json');
const SECONDARY_PROJECT_DIR = 'C:\\Users\\bamba\\OneDrive\\PROJETBI-V2';

// Dictionnaire de détection automatique des journaux
const KNOWN_PAPERS = [
  { keywords: ['rewmi sport', 'rewmisport'], name: 'Rewmi Sports' },
  { keywords: ['rewmi quotidien', 'rewmi'], name: 'Rewmi Quotidien' },
  { keywords: ['soleil', 'le soleil', 'lesoleil'], name: 'Le Soleil' },
  { keywords: ['sud quotidien', 'sudonline', 'sudquotidien', 'sud'], name: 'Sud Quotidien' },
  { keywords: ['liberation'], name: 'Libération' },
  { keywords: ['observateur', 'lobservateur', "l'observateur"], name: "L'Observateur" },
  { keywords: ['le quotidien', 'lequotidien'], name: 'Le Quotidien' },
  { keywords: ['evidence', 'levidence', "l'evidence"], name: "L'Évidence" },
  { keywords: ['echos', 'les echos'], name: 'Les Échos' },
  { keywords: ['point actu', 'le point', 'le epoint'], name: 'Le Point' },
  { keywords: ['tribune sport', 'tribunesport', 'tribune'], name: 'Tribune' },
  { keywords: ['republicain', 'lerepublicain'], name: 'Le Républicain' },
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
  { keywords: ['scoop', 'digital scoop'], name: 'Scoop' },
  { keywords: ['alerte'], name: 'Alerte Quotidien' },
  { keywords: ['independant', "l'independant"], name: "L'Indépendant" },
  { keywords: ['informateur', "l'informateur"], name: "L'Informateur" },
  { keywords: ['solo quotidien', 'solo'], name: 'Solo Quotidien' },
  { keywords: ['peuple', 'le peuple'], name: 'Le Peuple' }
];

function detectPaperName(filename) {
  if (!filename) return 'Quotidien';
  const clean = filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]/g, ' ');

  for (const paper of KNOWN_PAPERS) {
    for (const kw of paper.keywords) {
      if (clean.includes(kw)) return paper.name;
    }
  }

  // Si non reconnu, nettoyer le nom de fichier pour un titre propre
  const base = path.parse(filename).name
    .replace(/^revue_\d{4}-\d{2}-\d{2}_\d+$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  if (base && base.length > 2) {
    return base.charAt(0).toUpperCase() + base.slice(1);
  }

  return 'Quotidien';
}

function syncGit(todayFr, count) {
  try {
    console.log('\n🚀 Synchronisation Git automatique...');
    execSync('git add revuedepresse/ press.json', { cwd: PROJECT_DIR, stdio: 'inherit' });
    const status = execSync('git status --porcelain', { cwd: PROJECT_DIR, encoding: 'utf8' }).trim();
    if (status) {
      const commitMsg = `Mise à jour manuelle revue de presse du ${todayFr} (${count} journaux)`;
      execSync(`git commit -m "${commitMsg}"`, { cwd: PROJECT_DIR, stdio: 'inherit' });
      console.log(`✅ Commit créé : "${commitMsg}"`);
    } else {
      console.log('ℹ️ Aucun nouveau fichier à committer.');
    }

    try {
      execSync('git pull --rebase --autostash origin main', { cwd: PROJECT_DIR, encoding: 'utf8', stdio: 'inherit' });
    } catch (e) {
      console.warn('⚠️ Avertissement Git pull:', e.message);
    }

    execSync('git push origin main', { cwd: PROJECT_DIR, encoding: 'utf8', stdio: 'inherit' });
    console.log('✅ Push GitHub réussi ! Le site en ligne sera actualisé dans 1 minute.');
  } catch (err) {
    console.error('⚠️ Note sur la synchronisation Git :', err.message);
  }
}

function run() {
  console.log('====================================================');
  console.log('  MISE À JOUR MANUELLE DE LA REVUE DE PRESSE');
  console.log('====================================================\n');

  if (!fs.existsSync(REVUE_DIR)) {
    fs.mkdirSync(REVUE_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const todayFr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);

  // 1. Vérifier si des fichiers ont été déposés dans revuedepresse/upload/
  const uploadedFiles = fs.readdirSync(UPLOAD_DIR).filter(f => validExtensions.has(path.extname(f).toLowerCase()));
  const papers = [];

  if (uploadedFiles.length > 0) {
    console.log(`📁 ${uploadedFiles.length} image(s) trouvée(s) dans revuedepresse/upload/ :`);
    let counter = 1;

    for (const file of uploadedFiles) {
      const ext = path.extname(file).toLowerCase();
      const detectedTitle = detectPaperName(file);
      const newFilename = `revue_${todayStr}_${counter}${ext}`;
      const srcPath = path.join(UPLOAD_DIR, file);
      const destPath = path.join(REVUE_DIR, newFilename);

      fs.copyFileSync(srcPath, destPath);
      // Supprimer du dossier upload après copie
      fs.unlinkSync(srcPath);

      papers.push({
        id: String(counter),
        title: detectedTitle,
        date: todayFr,
        image: `revuedepresse/${newFilename}`,
        link: '#'
      });

      console.log(`  ➕ [${counter}] ${file} -> ${newFilename} (${detectedTitle})`);
      counter++;
    }
  } else {
    // 2. Sinon, chercher les fichiers déjà présents dans revuedepresse/ pour la date d'aujourd'hui
    console.log(`ℹ️ Aucun fichier dans revuedepresse/upload/.`);
    console.log(`🔍 Recherche des fichiers du jour (revue_${todayStr}_*) dans revuedepresse/...`);

    const existingTodayFiles = fs.readdirSync(REVUE_DIR).filter(f => 
      f.startsWith(`revue_${todayStr}_`) && validExtensions.has(path.extname(f).toLowerCase())
    );

    if (existingTodayFiles.length > 0) {
      // Trier par numéro
      existingTodayFiles.sort((a, b) => {
        const numA = parseInt(a.replace(`revue_${todayStr}_`, '').split('.')[0]) || 0;
        const numB = parseInt(b.replace(`revue_${todayStr}_`, '').split('.')[0]) || 0;
        return numA - numB;
      });

      let counter = 1;
      for (const file of existingTodayFiles) {
        const detectedTitle = detectPaperName(file);
        papers.push({
          id: String(counter),
          title: detectedTitle,
          date: todayFr,
          image: `revuedepresse/${file}`,
          link: '#'
        });
        console.log(`  📄 [${counter}] ${file} (${detectedTitle})`);
        counter++;
      }
    } else {
      // 3. Chercher les images ajoutées aujourd'hui ou les images récentes dans revuedepresse/
      console.log(`🔍 Recherche des images récemment modifiées dans revuedepresse/...`);
      const allFiles = fs.readdirSync(REVUE_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return validExtensions.has(ext) && !f.startsWith('FB_IMG') && f !== 'enquete.jpg';
      });

      // Trier par date de modification descendante
      allFiles.sort((a, b) => {
        const statA = fs.statSync(path.join(REVUE_DIR, a));
        const statB = fs.statSync(path.join(REVUE_DIR, b));
        return statB.mtimeMs - statA.mtimeMs;
      });

      // Prendre les fichiers modifiés dans les dernières 24h ou les 30 derniers
      const recentFiles = allFiles.slice(0, 30);

      if (recentFiles.length === 0) {
        console.log('\n❌ Aucune image de journal trouvée dans revuedepresse/ ni dans revuedepresse/upload/.');
        console.log('👉 Déposez simplement vos images de journaux dans le dossier :');
        console.log(`   ${UPLOAD_DIR}`);
        console.log('   puis relancez ce script !\n');
        return;
      }

      console.log(`  -> ${recentFiles.length} image(s) sélectionnée(s).`);
      let counter = 1;
      for (const file of recentFiles) {
        const detectedTitle = detectPaperName(file);
        papers.push({
          id: String(counter),
          title: detectedTitle,
          date: todayFr,
          image: `revuedepresse/${file}`,
          link: '#'
        });
        counter++;
      }
    }
  }

  if (papers.length === 0) {
    console.log('❌ Aucun journal à publier.');
    return;
  }

  // 4. Écrire press.json
  const pressData = {
    last_updated: now.toISOString(),
    press: papers
  };

  fs.writeFileSync(PRESS_JSON_PATH, JSON.stringify(pressData, null, 2), 'utf8');
  console.log(`\n✅ press.json mis à jour avec succès (${papers.length} journaux enregistrés).`);

  // Synchronisation projet secondaire bamba si présent
  if (fs.existsSync(SECONDARY_PROJECT_DIR)) {
    try {
      const secJson = path.join(SECONDARY_PROJECT_DIR, 'press.json');
      fs.writeFileSync(secJson, JSON.stringify(pressData, null, 2), 'utf8');
      console.log('✅ Synchronisé avec PROJETBI-V2.');
    } catch (e) {}
  }

  // 5. Synchroniser avec Git
  const skipGit = process.argv.includes('--no-git');
  if (!skipGit) {
    syncGit(todayFr, papers.length);
  } else {
    console.log('ℹ️ Synchronisation Git ignorée (--no-git).');
  }

  console.log('\n====================================================');
  console.log(`  TERMINÉ AVEC SUCCÈS : ${papers.length} journaux prêts pour le ${todayFr}`);
  console.log('====================================================\n');
}

run();
