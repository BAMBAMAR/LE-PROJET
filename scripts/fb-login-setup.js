const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Analyse des arguments en ligne de commande
const args = process.argv.slice(2);

// Choix du dossier de session
let sessionDirName = '.fb_session';
if (args.includes('--annonces')) {
  sessionDirName = '.fb_session_annonces';
}
const sessionArgIndex = args.indexOf('--session');
if (sessionArgIndex !== -1 && args[sessionArgIndex + 1]) {
  sessionDirName = args[sessionArgIndex + 1];
}

const USER_DATA_DIR = path.isAbsolute(sessionDirName)
  ? sessionDirName
  : path.join(__dirname, '..', sessionDirName);

// Choix du navigateur
let browserChannel = undefined;
let browserName = 'Chromium (embarqué)';

if (args.includes('--edge')) {
  browserChannel = 'msedge';
  browserName = 'Microsoft Edge';
} else if (args.includes('--chrome')) {
  browserChannel = 'chrome';
  browserName = 'Google Chrome';
}

const isReset = args.includes('--reset');

async function main() {
  console.log('====================================================');
  console.log('       INITIALISATION DE LA SESSION FACEBOOK');
  console.log('====================================================');
  console.log(`🌐 Navigateur cible : ${browserName}`);
  console.log(`📁 Dossier session  : ${path.basename(USER_DATA_DIR)} (${USER_DATA_DIR})`);
  console.log('----------------------------------------------------\n');

  // Réinitialisation si demandée
  if (isReset && fs.existsSync(USER_DATA_DIR)) {
    console.log('🧹 Nettoyage de l\'ancienne session...');
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
      console.log('✅ Ancienne session effacée avec succès.\n');
    } catch (e) {
      console.warn('⚠️ Note suppression :', e.message);
    }
  }

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const launchOptions = {
    headless: false,
    channel: browserChannel,
    args: [
      '--disable-notifications',
      '--start-maximized',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    viewport: null,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    locale: 'fr-FR'
  };

  let context;
  try {
    context = await chromium.launchPersistentContext(USER_DATA_DIR, launchOptions);

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = window.chrome || { runtime: {} };
    });
  } catch (err) {
    if (browserChannel) {
      console.warn(`⚠️ Impossible de lancer ${browserName} via le canal spécifié (${err.message}).`);
      console.log('🔄 Repli sur le Chromium interne...');
      delete launchOptions.channel;
      context = await chromium.launchPersistentContext(USER_DATA_DIR, launchOptions);
    } else {
      console.error('❌ Erreur lancement navigateur :', err.message);
      process.exit(1);
    }
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  console.log('🔗 Chargement de Facebook...');
  try {
    await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (e) {
    console.log('... chargement de la page en cours ...');
  }

  console.log('\n👉 INSTRUCTIONS :');
  console.log('   1. Connectez-vous avec votre compte Facebook dans la fenêtre ouverte.');
  console.log('   2. Validez le mot de passe et le code 2FA si nécessaire.');
  console.log('   3. Une fois connecté sur votre fil d\'actualité :');
  console.log('      - Fermez simplement la fenêtre du navigateur OU appuyez sur Entrée dans ce terminal.\n');

  let resolveDone;
  const donePromise = new Promise(resolve => { resolveDone = resolve; });

  page.on('close', () => resolveDone('page_closed'));
  context.on('close', () => resolveDone('context_closed'));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Appuyez sur Entrée une fois connecté > ', () => {
    rl.close();
    resolveDone('enter_pressed');
  });

  // Détection de la session sans fermeture forcée précipitée
  let sessionNotified = false;
  const pollInterval = setInterval(async () => {
    try {
      const cookies = await context.cookies();
      const hasCUser = cookies.some(c => c.name === 'c_user');
      if (hasCUser && !sessionNotified) {
        sessionNotified = true;
        console.log('\n✨ Connexion Facebook active détectée (cookie de session valide) !');
        console.log('👉 Vous pouvez fermer la fenêtre du navigateur ou appuyer sur Entrée pour terminer.');
      }
    } catch {}
  }, 2500);

  await donePromise;
  clearInterval(pollInterval);
  try { rl.close(); } catch {}

  console.log(`\n💾 Session persistée avec succès dans : ${path.basename(USER_DATA_DIR)}`);
  console.log('✅ Configuration terminée.');

  try {
    await context.close();
  } catch {}
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
