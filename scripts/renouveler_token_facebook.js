/**
 * renouveler_token_facebook.js
 * 
 * Script utilitaire pour transformer un token temporaire Facebook
 * en TOKEN DE PAGE PERMANENT (n'expire jamais) et mettre à jour .env automatiquement.
 *
 * Utilisation :
 *   node scripts/renouveler_token_facebook.js
 * ou en passant directement les arguments :
 *   node scripts/renouveler_token_facebook.js --short-token <TOKEN> --app-id <APP_ID> --app-secret <APP_SECRET>
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

const ENV_PATH = path.join(__dirname, '..', '.env');
const FB_API_VERSION = 'v19.0';

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

function prompt(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

function readCurrentEnv() {
  const env = {};
  if (fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const k = trimmed.substring(0, eqIdx).trim();
        const v = trimmed.substring(eqIdx + 1).trim();
        env[k] = v;
      }
    }
  }
  return env;
}

function updateEnvFile(newValues) {
  let content = '';
  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, 'utf8');
  }

  for (const [key, val] of Object.entries(newValues)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${val}`);
    } else {
      content = (content ? content.trim() + '\n' : '') + `${key}=${val}\n`;
    }
  }

  fs.writeFileSync(ENV_PATH, content, 'utf8');
}

async function main() {
  console.log('========================================================');
  console.log('  TRANSFORMATION DE TOKEN FACEBOOK EN TOKEN PERMANENT');
  console.log('========================================================\n');

  const env = readCurrentEnv();
  const targetPageId = env.FB_PAGE_ID || '165343486664407';

  console.log(`📌 Page ciblée : ID ${targetPageId}\n`);

  const args = process.argv.slice(2);
  let shortToken = '';
  let appId = '';
  let appSecret = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--short-token' && args[i + 1]) shortToken = args[i + 1];
    if (args[i] === '--app-id' && args[i + 1]) appId = args[i + 1];
    if (args[i] === '--app-secret' && args[i + 1]) appSecret = args[i + 1];
  }

  if (!shortToken) {
    console.log('1. Générez un token utilisateur temporaire sur :');
    console.log('   👉 https://developers.facebook.com/tools/explorer/');
    console.log('   (Permissions requises : pages_manage_posts, pages_read_engagement, pages_show_list)\n');
    shortToken = await prompt('👉 Collez le token temporaire (User Token) : ');
  }

  if (!shortToken) {
    console.error('❌ Aucun token fourni. Annulation.');
    process.exit(1);
  }

  if (!appId) {
    appId = await prompt('👉 Entrez votre App ID Facebook (developers.facebook.com/apps) : ');
  }

  if (!appSecret) {
    appSecret = await prompt('👉 Entrez votre App Secret (Paramètres > Général > Clé secrète) : ');
  }

  if (!appId || !appSecret) {
    console.error('❌ App ID et App Secret sont indispensables pour convertir le token.');
    process.exit(1);
  }

  console.log('\n⏳ [Étape 1/3] Échange du token court contre un token longue durée (60 jours)...');
  const exchangeUrl = `https://graph.facebook.com/${FB_API_VERSION}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${encodeURIComponent(appId)}&` +
    `client_secret=${encodeURIComponent(appSecret)}&` +
    `fb_exchange_token=${encodeURIComponent(shortToken)}`;

  const exchangeRes = await httpsGet(exchangeUrl);

  if (!exchangeRes.body || !exchangeRes.body.access_token) {
    console.error('❌ Erreur lors de l\'échange de token :');
    console.error(JSON.stringify(exchangeRes.body, null, 2));
    process.exit(1);
  }

  const longLivedUserToken = exchangeRes.body.access_token;
  console.log('✅ Token utilisateur longue durée obtenu avec succès (60 jours).');

  console.log('\n⏳ [Étape 2/3] Récupération du Token de Page permanent...');
  const accountsUrl = `https://graph.facebook.com/${FB_API_VERSION}/me/accounts?access_token=${encodeURIComponent(longLivedUserToken)}`;
  const accountsRes = await httpsGet(accountsUrl);

  if (!accountsRes.body || !accountsRes.body.data) {
    console.error('❌ Impossible de récupérer les pages de ce compte :');
    console.error(JSON.stringify(accountsRes.body, null, 2));
    process.exit(1);
  }

  const pages = accountsRes.body.data;
  if (pages.length === 0) {
    console.error('❌ Aucune page Facebook trouvée pour cet utilisateur.');
    console.error('Vérifiez que votre compte administre bien la page et que les permissions sont cochées.');
    process.exit(1);
  }

  let selectedPage = pages.find(p => p.id === targetPageId);
  if (!selectedPage) {
    console.log(`⚠️ La page configurée (${targetPageId}) n'est pas dans la liste.`);
    console.log('Pages disponibles :');
    pages.forEach((p, idx) => console.log(`   [${idx + 1}] ${p.name} (ID: ${p.id})`));
    const choice = await prompt(`Sélectionnez une page (1-${pages.length}) [défaut: 1] : `);
    const idx = parseInt(choice || '1', 10) - 1;
    selectedPage = pages[idx] || pages[0];
  }

  const permanentPageToken = selectedPage.access_token;
  console.log(`✅ Page identifiée : "${selectedPage.name}" (ID: ${selectedPage.id})`);

  console.log('\n⏳ [Étape 3/3] Vérification de la validité du Token de Page...');
  const verifyUrl = `https://graph.facebook.com/${FB_API_VERSION}/${selectedPage.id}?fields=name,id,fan_count&access_token=${encodeURIComponent(permanentPageToken)}`;
  const verifyRes = await httpsGet(verifyUrl);

  if (verifyRes.body && verifyRes.body.id) {
    console.log(`🎉 SUCCÈS ! Connexion vérifiée avec succès sur la Page : "${verifyRes.body.name}".`);
  } else {
    console.warn('⚠️ Avertissement lors de la vérification :', JSON.stringify(verifyRes.body));
  }

  console.log('\n--------------------------------------------------------');
  console.log('🔑 NOUVEAU TOKEN DE PAGE PERMANENT :');
  console.log(permanentPageToken);
  console.log('--------------------------------------------------------\n');

  const apply = await prompt('👉 Mettre à jour automatiquement le fichier .env avec ce token ? (o/n) [défaut: o] : ');
  if (!apply || apply.toLowerCase() === 'o' || apply.toLowerCase() === 'oui' || apply.toLowerCase() === 'y') {
    updateEnvFile({
      FB_PAGE_ID: selectedPage.id,
      FB_PAGE_ACCESS_TOKEN: permanentPageToken
    });
    console.log('✅ Fichier .env mis à jour avec succès !');
    console.log('\nVous pouvez tester la publication à tout moment avec :');
    console.log('   node scripts/publish_social_auto.js --test');
  } else {
    console.log('ℹ️ .env non modifié. Vous pouvez copier/coller la valeur manuellement.');
  }
}

main().catch(err => {
  console.error('❌ Erreur inattendue :', err);
  process.exit(1);
});

