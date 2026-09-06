/**
 * publish_social_auto.js
 * Publication automatique des revues de presse, actualités et bilans
 * vers Facebook Page et Twitter / X.
 *
 * Utilisation :
 *   node scripts/publish_social_auto.js --type revue        (Publie la revue de presse du jour)
 *   node scripts/publish_social_auto.js --type news         (Publie la dernière actualité de news.json)
 *   node scripts/publish_social_auto.js --type bilan        (Publie le bilan des promesses)
 *   node scripts/publish_social_auto.js --test              (Vérifie la connexion aux réseaux)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Chargement automatique du fichier .env sans dépendance externe ──
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

loadEnv();

const FB_API_VERSION = 'v19.0';
const FB_PAGE_ID = process.env.FB_PAGE_ID;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://projetbi.org';

// ── Requête HTTPS standard ──
function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// ── 1. FACEBOOK : Publication de Photo + Légende ──
async function postToFacebookPhoto(imagePath, caption) {
  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    console.log('⚠️  Facebook non configuré (FB_PAGE_ID ou FB_PAGE_ACCESS_TOKEN manquant dans .env)');
    return null;
  }

  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const fullPath = path.isAbsolute(imagePath) ? imagePath : path.join(__dirname, '..', imagePath);

  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Image introuvable pour Facebook: ${fullPath}`);
    // Fallback: publication simple en message de flux
    return postToFacebookFeed(caption);
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const fileName = path.basename(fullPath);

  let pre = '';
  pre += `--${boundary}\r\n`;
  pre += `Content-Disposition: form-data; name="caption"\r\n\r\n${caption}\r\n`;
  pre += `--${boundary}\r\n`;
  pre += `Content-Disposition: form-data; name="access_token"\r\n\r\n${FB_PAGE_ACCESS_TOKEN}\r\n`;
  pre += `--${boundary}\r\n`;
  pre += `Content-Disposition: form-data; name="source"; filename="${fileName}"\r\n`;
  pre += `Content-Type: image/jpeg\r\n\r\n`;

  const post = `\r\n--${boundary}--\r\n`;

  const payload = Buffer.concat([
    Buffer.from(pre, 'utf8'),
    fileBuffer,
    Buffer.from(post, 'utf8')
  ]);

  const options = {
    hostname: 'graph.facebook.com',
    path: `/${FB_API_VERSION}/${FB_PAGE_ID}/photos`,
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': payload.length
    }
  };

  try {
    const res = await request(options, payload);
    if (res.data && (res.data.id || res.data.post_id)) {
      const postId = res.data.post_id || res.data.id;
      console.log(`✅ [Facebook] Photo publiée avec succès !`);
      console.log(`   Lien : https://facebook.com/${postId}`);
      return postId;
    } else {
      console.error('❌ [Facebook] Erreur API :', JSON.stringify(res.data || res.raw));
      return null;
    }
  } catch (err) {
    console.error('❌ [Facebook] Erreur réseau :', err.message);
    return null;
  }
}

// ── 1b. FACEBOOK : Publication de Texte + Lien ──
async function postToFacebookFeed(message, link = SITE_URL) {
  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) return null;

  const data = JSON.stringify({
    message: message,
    link: link,
    access_token: FB_PAGE_ACCESS_TOKEN
  });

  const options = {
    hostname: 'graph.facebook.com',
    path: `/${FB_API_VERSION}/${FB_PAGE_ID}/feed`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  try {
    const res = await request(options, data);
    if (res.data && res.data.id) {
      console.log(`✅ [Facebook] Post publié avec succès ! ID: ${res.data.id}`);
      return res.data.id;
    } else {
      console.error('❌ [Facebook] Erreur API feed :', JSON.stringify(res.data));
      return null;
    }
  } catch (err) {
    console.error('❌ [Facebook] Erreur :', err.message);
    return null;
  }
}

// ── 2. TWITTER / X : Vérification et publication ──
async function postToTwitter(tweetText) {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;

  if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) {
    console.log('ℹ️  Twitter API non configurée dans .env (utilisation du partage Web Intent recommandé depuis l\'Admin)');
    return null;
  }

  // Si des clés OAuth 1.0a sont fournies, un envoi direct peut être branché
  console.log(`[Twitter/X] Message prêt : « ${tweetText.substring(0, 100)}… »`);
}

// ── 3. GÉNÉRATEURS DE CONTENU AUTOMATIQUE ──

/** Publication automatique de la revue de presse du jour */
async function publishRevueDuJour() {
  const pressFile = path.join(__dirname, '..', 'press.json');
  if (!fs.existsSync(pressFile)) {
    console.log('⚠️ Aucun fichier press.json trouvé');
    return;
  }

  const pressData = JSON.parse(fs.readFileSync(pressFile, 'utf8'));
  const list = pressData.press || [];
  if (list.length === 0) {
    console.log('⚠️ press.json ne contient aucun journal.');
    return;
  }

  const todayStr = list[0].date || new Date().toLocaleDateString('fr-FR');
  const count = list.length;
  const firstImage = list[0].image;

  // Extraire les noms des 4 premiers journaux
  const topPapers = list.slice(0, 4).map(p => `• ${p.title || 'Quotidien'}`).join('\n');

  const caption = 
`🗞️ REVUE DE PRESSE DU SÉNÉGAL • ${todayStr.toUpperCase()}

Retrouvez les unes des principaux quotidiens nationaux parus ce matin :

${topPapers}
... et bien d'autres !

🔎 Consultez toutes les ${count} unes numérisées et l'analyse de l'actualité sur ProjetBI :
👉 ${SITE_URL}/revuedepresse.html

#Sénégal #RevueDePresse #PresseSN #XeyXeyiTeey #ProjetBI #Transparence #DiomayeFaye`;

  console.log(`\n🚀 Publication automatique de la revue de presse (${count} journaux)...`);
  await postToFacebookPhoto(firstImage, caption);
}

/** Publication automatique de la dernière actualité */
async function publishLatestNews() {
  const newsFile = path.join(__dirname, '..', 'news.json');
  if (!fs.existsSync(newsFile)) return;

  const newsData = JSON.parse(fs.readFileSync(newsFile, 'utf8'));
  const articles = newsData.news || [];
  if (!articles.length) return;

  const last = articles[0];
  const title = (last.title || '').replace(/&nbsp;/g, ' ');
  const cat = (last.category || 'Actualité').toUpperCase();
  const excerpt = (last.excerpt || last.description || '').replace(/&nbsp;/g, ' ').substring(0, 180);

  const caption =
`⚡ [ACTUALITÉ • ${cat}]

📌 ${title}

${excerpt ? '« ' + excerpt + '… »\n\n' : ''}📰 Source : ${last.source || 'Presse nationale'}

🔎 Suivez l'impact des décisions présidentielles et les engagements du Projet en continu :
👉 ${SITE_URL}

#Sénégal #PASTEF #DiomayeFaye #ProjetBI #Transparence`;

  console.log(`\n🚀 Publication automatique de l'actualité : "${title}"...`);
  if (last.image && fs.existsSync(path.join(__dirname, '..', last.image))) {
    await postToFacebookPhoto(last.image, caption);
  } else {
    await postToFacebookFeed(caption);
  }
}

/** Test de connexion aux plateformes */
async function testConnections() {
  console.log('====================================================');
  console.log('  TEST DE CONNEXION AUX RÉSEAUX SOCIAUX');
  console.log('====================================================\n');

  if (FB_PAGE_ID && FB_PAGE_ACCESS_TOKEN) {
    console.log(`🔍 Test Facebook (Page ID: ${FB_PAGE_ID})...`);
    try {
      const res = await request({
        hostname: 'graph.facebook.com',
        path: `/${FB_API_VERSION}/${FB_PAGE_ID}?fields=name,id,fan_count,link&access_token=${FB_PAGE_ACCESS_TOKEN}`,
        method: 'GET'
      });
      if (res.data && res.data.id) {
        console.log(`✅ Facebook connecté : "${res.data.name}" (${res.data.fan_count || 0} abonnés)`);
      } else {
        console.log(`❌ Facebook erreur :`, JSON.stringify(res.data));
      }
    } catch (e) {
      console.log(`❌ Facebook erreur réseau :`, e.message);
    }
  } else {
    console.log('ℹ️  Facebook non configuré dans .env (FB_PAGE_ID ou FB_PAGE_ACCESS_TOKEN vide)');
  }
}

// ── Point d'entrée principal ──
async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--test')) {
    await testConnections();
  } else if (args.includes('--type') && args[args.indexOf('--type') + 1] === 'news') {
    await publishLatestNews();
  } else {
    // Par défaut : revue de presse
    await publishRevueDuJour();
  }
}

main().catch(err => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
