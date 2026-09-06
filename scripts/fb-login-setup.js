const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const USER_DATA_DIR = path.join(__dirname, '..', '.fb_session');

async function main() {
  console.log('====================================================');
  console.log('  CONNEXION FACEBOOK POUR LA REVUE DE PRESSE');
  console.log('====================================================\n');
  console.log('🌐 Ouverture du navigateur Google Chrome/Chromium...');

  if (process.argv.includes('--reset') && fs.existsSync(USER_DATA_DIR)) {
    console.log('🧹 Réinitialisation de l\'ancienne session Facebook...');
    try {
      fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
      console.log('✅ Ancienne session effacée.');
    } catch (e) {
      console.warn('Note:', e.message);
    }
  }

  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  let context;
  try {
    context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false,
      args: [
        '--disable-notifications',
        '--start-maximized',
        '--disable-blink-features=AutomationControlled'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      viewport: null,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      locale: 'fr-FR'
    });

    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      window.chrome = window.chrome || { runtime: {} };
    });
  } catch (err) {
    console.error('Erreur lancement Chromium:', err.message);
    process.exit(1);
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  console.log('🔗 Chargement de Facebook...');
  try {
    await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  } catch (e) {
    console.log('... chargement en cours ...');
  }

  console.log('\n👉 INSTRUCTIONS :');
  console.log('   1. Connectez-vous avec votre compte Facebook dans la fenêtre du navigateur.');
  console.log('   2. Validez le mot de passe et le code 2FA si demandé.');
  console.log('   3. Une fois sur votre fil d\'actualité :');
  console.log('      - Fermez simplement la fenêtre du navigateur OU appuyez sur Entrée ici.\n');

  let resolveDone;
  const donePromise = new Promise(resolve => { resolveDone = resolve; });

  page.on('close', () => resolveDone('page_closed'));
  context.on('close', () => resolveDone('context_closed'));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Appuyez sur Entrée une fois connecté > ', () => {
    rl.close();
    resolveDone('enter_pressed');
  });

  // Détection automatique du cookie de session c_user
  let detected = false;
  const pollInterval = setInterval(async () => {
    try {
      const cookies = await context.cookies();
      if (!detected && cookies.some(c => c.name === 'c_user')) {
        detected = true;
        console.log('✨ Session utilisateur Facebook connectée détectée !');
        console.log('⏳ Sauvegarde automatique dans 5 secondes...');
        setTimeout(() => resolveDone('c_user_auto'), 5000);
      }
    } catch {}
  }, 2000);

  await donePromise;
  clearInterval(pollInterval);
  try { rl.close(); } catch {}

  console.log('\n💾 Session persistée avec succès dans le dossier .fb_session');
  console.log('✅ Vous pouvez maintenant lancer le scraping : run_daily_revue.bat');

  try {
    await context.close();
  } catch {}
}

main().catch(err => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
