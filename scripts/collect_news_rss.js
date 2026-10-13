/**
 * scripts/collect_news_rss.js
 * 
 * Collecteur haute performance de flux RSS d'actualité pour ProjetBI
 * Inspiré du moteur d'ingestion de Surga (yombale) avec :
 * - Ingestion simultanée des grands flux d'information sénégalais
 * - Nettoyage strict des résumés (< 220 car) et suppression du boilerplate HTML
 * - Suppression des suffixes d'éditeurs parasites dans les titres
 * - Classification automatique dans les 12 domaines clés de ProjetBI
 * - Rapprochement intelligent avec les engagements de promises.json
 * - Dédoublonnage robuste par URL et empreinte de titre
 * - Sauvegarde dans drafts.json (par défaut) ou news.json (option --direct)
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const PROJECT_DIR = path.resolve(__dirname, '..');
const NEWS_FILE = path.join(PROJECT_DIR, 'news.json');
const DRAFTS_FILE = path.join(PROJECT_DIR, 'drafts.json');
const PROMISES_FILE = path.join(PROJECT_DIR, 'promises.json');

// Bouquet complet des flux RSS de référence
const SOURCES_RSS = [
  // 1. Médias nationaux avec flux directs
  { nom: 'APS', url: 'https://aps.sn/feed/', categorie: 'actualites' },
  { nom: 'Le Soleil', url: 'https://lesoleil.sn/feed/', categorie: 'actualites' },
  { nom: 'Seneweb', url: 'https://www.seneweb.com/feed', categorie: 'actualites' },
  { nom: 'PressAfrik', url: 'https://www.pressafrik.com/xml/syndication.rss', categorie: 'actualites' },
  { nom: 'SeneNews', url: 'https://www.senenews.com/feed', categorie: 'actualites' },
  { nom: 'Leral.net', url: 'https://www.leral.net/xml/syndication.rss', categorie: 'actualites' },

  // 2. Google News ciblé sur quotidiens clés sans flux XML direct ouvert
  { nom: 'Dakaractu', url: 'https://news.google.com/rss/search?q=site:dakaractu.com&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },
  { nom: 'Le Quotidien', url: 'https://news.google.com/rss/search?q=site:lequotidien.sn&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },
  { nom: 'Sud Quotidien', url: 'https://news.google.com/rss/search?q=site:sudquotidien.sn&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },

  // 3. Google News thématique stratégique pour ProjetBI
  { nom: 'Presse Institutions SN', url: 'https://news.google.com/rss/search?q=gouvernement+s%C3%A9n%C3%A9gal+conseil+ministres+diomaye+sonko&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },
  { nom: 'Presse Éco & Finances SN', url: 'https://news.google.com/rss/search?q=s%C3%A9n%C3%A9gal+finances+dette+budget+bceao+impots&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },
  { nom: 'Presse Réformes & Justice SN', url: 'https://news.google.com/rss/search?q=s%C3%A9n%C3%A9gal+justice+audit+cour+des+comptes+assemblee&hl=fr&gl=SN&ceid=SN:fr', categorie: 'actualites' },
];

// Dictionnaire de classification thématique dans les domaines de ProjetBI
const DOMAINES_RULES = [
  {
    domaine: 'Justice',
    regex: /\b(justice|cour des comptes|ofnac|magistrat|tribunal|juge|procureur|parquet|csm|conseil superieur de la magistrature|assises de la justice|garde des sceaux|reddition des comptes|detournement|corruption|traque|patrimoine bati|baux emphyt[\w]+|plainte|audit)\b/i
  },
  {
    domaine: 'Économie',
    regex: /\b(economie|budget|finances|tresor|dette|fmi|banque mondiale|bceao|franc cfa|cfa|inflation|pme|commerce|fiscalite|douane|deniers|recettes|depenses publiques|eurobond|croissance|export|import|industrie|subvention)\b/i
  },
  {
    domaine: 'Institutions',
    regex: /\b(gouvernement|assemblee|depute|ministre|primature|presidence|diomaye|sonko|decret|conseil des ministres|loi|election|cour constitutionnelle|reforme institutionnelle|pouvoir executif|pouvoir legislatif|diplomatie|ambassadeur|cooperation bilat[\w]+)\b/i
  },
  {
    domaine: 'Éducation',
    regex: /\b(education|ecole|rentree scolaire|enseignant|eleve|abris provisoires|daara|daaras|universite|ucad|ugb|uadb|etudiant|bourse|mesri|anaq-sup|baccalaureat|bepc|formation professionnelle|alphab[\w]+)\b/i
  },
  {
    domaine: 'Santé',
    regex: /\b(sante|hopital|medecin|clinique|samu|urgences|medicament|pharmacie|cmu|couverture maladie|dialyse|soignant|sage-femme|lutte contre|epidemie|chirurgie)\b/i
  },
  {
    domaine: 'Infrastructures',
    regex: /\b(infrastructure|route|brt|ter|autoroute|pont|port|aeroport|aidb|echangeur|forage|eau|senelec|sones|woyofal|electricite|assainissement|travaux publics|bitume|piste|transport)\b/i
  },
  {
    domaine: 'Agriculture',
    regex: /\b(agriculture|agricole|paysan|campagne agricole|arachide|riz|mil|mais|semence|engrais|recolte|souverainete alimentaire|elevage|betail|peche|pecheur|pirogue|accord de peche)\b/i
  },
  {
    domaine: 'Emploi & Jeunesse',
    regex: /\b(emploi|jeune|jeunesse|chomage|insertion|recrutement|stage|entrepreneuriat|3fpt|der|financement des jeunes)\b/i
  },
  {
    domaine: 'Environnement',
    regex: /\b(environnement|inondation|climat|erosion cotiere|foret|reboisement|pollution|dechets|plastique|ecologie|pluie|pluviometrie)\b/i
  },
  {
    domaine: 'Numérique',
    regex: /\b(numerique|digital|tech|fintech|startup|telecom|fibre optique|application|cybersecurite|intelligence artificielle|ia|donnees)\b/i
  },
  {
    domaine: 'Social',
    regex: /\b(social|solidarite|famille|femmes|vulnerabilite|bourse de securite|action sociale|pouvoir d achat|vie chere|prix des denrees)\b/i
  }
];

function classerDomaineProjetBI(titre, resume) {
  const texte = `${titre || ''} ${resume || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const rule of DOMAINES_RULES) {
    if (rule.regex.test(texte)) {
      return rule.domaine;
    }
  }
  return 'Politique';
}

function nettoyerResumeTexte(htmlOuTexte) {
  if (!htmlOuTexte) return '';
  const $ = cheerio.load(String(htmlOuTexte));
  let brut = $.text() || '';

  // Supprimer préfixes journalistiques redondants
  brut = brut
    .replace(/^Dakar,\s*\d+\s*[a-zéû.]+\s*\([A-Z]+\)\s*[-–—]/i, '')
    .replace(/^The post .* appeared first on .*/i, '')
    .replace(/\[&#8230;\]/g, '…')
    .replace(/\[\.\.\.\]/g, '…')
    .replace(/\s+/g, ' ')
    .trim();

  if (brut.length <= 220) return brut;
  const cut = brut.slice(0, 215);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 120) {
    return cut.slice(0, lastSpace).replace(/[,;:\s.]+$/, '') + '…';
  }
  return cut.trim() + '…';
}

function nettoyerTitrePresse(titre) {
  if (!titre) return '';
  let t = String(titre)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '’')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();

  // Nettoyer les signatures d'éditeurs à la fin
  t = t.replace(/\s*[-–|—]\s*(Seneweb|Dakaractu|SeneNews|Leral(\.net)?|PressAfrik|Le Soleil|APS|Le Quotidien|Sud Quotidien|Walfnet|RTS|Jeune Afrique|RFI|BBC).*$/i, '').trim();
  return t;
}

/**
 * Rapprochement automatique d'un article avec la liste des promesses
 */
function chercherEngagementAssocie(titre, resume, promises) {
  if (!Array.isArray(promises) || promises.length === 0) return null;
  const texte = `${titre || ''} ${resume || ''}`.toLowerCase();

  let meilleurMatch = null;
  let scoreMax = 0;

  for (const p of promises) {
    if (!p.engagement) continue;
    const engLower = p.engagement.toLowerCase();

    // Recherche de mots-clés spécifiques forts
    const keywords = engLower
      .replace(/[(),.':"«»]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 5 && !['faire', 'mettre', 'creer', 'assurer', 'porter', 'toutes', 'selon', 'entre', 'cadre', 'niveau', 'premier', 'ministre'].includes(w));

    if (keywords.length === 0) continue;
    let hits = 0;
    for (const kw of keywords) {
      if (texte.includes(kw)) hits++;
    }

    const score = hits / keywords.length;
    if (hits >= 2 && score > scoreMax) {
      scoreMax = score;
      meilleurMatch = { id: p.id, engagement: p.engagement, domaine: p.domaine, score };
    }
  }

  return meilleurMatch;
}

/**
 * Récupération et parsing d'une source RSS
 */
async function fetchSourceRss(src) {
  try {
    const res = await fetch(src.url, {
      signal: AbortSignal.timeout(9000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 (ProjetBI-NewsCollector/2.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      console.warn(`[RSS WARN] ${src.nom} HTTP ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const items = [];

    $('item').each((_, el) => {
      let title = $(el).find('title').text().trim();
      const link = $(el).find('link').text().trim();
      const desc = $(el).find('description').text() || $(el).find('content\\:encoded').text();
      const pubDate = $(el).find('pubDate').text().trim() || $(el).find('dc\\:date').text().trim();

      if (title && link) {
        let exactSource = src.nom;
        const sourceTag = $(el).find('source').text().trim();
        if (sourceTag) {
          exactSource = sourceTag.replace(/\s*-\s*(Agence de Presse.*|Groupe.*)$/i, '').trim();
        }

        let dateObj = pubDate ? new Date(pubDate) : new Date();
        if (isNaN(dateObj.getTime())) dateObj = new Date();

        // Ignorer les articles vieux de plus de 4 jours
        const ageJours = (Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24);
        if (ageJours > 4) return;

        const cleanTitle = nettoyerTitrePresse(title);
        const cleanDesc = nettoyerResumeTexte(desc) || cleanTitle;

        items.push({
          title: cleanTitle,
          link: link,
          source: exactSource,
          dateObj: dateObj,
          excerpt: cleanDesc,
        });
      }
    });

    return items;
  } catch (err) {
    console.warn(`[RSS ERROR] ${src.nom}:`, err.message);
    return [];
  }
}

/**
 * Fonction maîtresse de collecte
 */
async function collecterNews({ directToNews = false, limitPerSource = 15 } = {}) {
  console.log('====================================================');
  console.log('  PROJETBI — COLLECTEUR AUTOMATISÉ D\'ACTUALITÉS RSS');
  console.log('====================================================\n');

  // 1. Charger les données existantes
  let newsData = { last_updated: new Date().toISOString(), news: [] };
  if (fs.existsSync(NEWS_FILE)) {
    try { newsData = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8')); } catch (_) {}
  }

  let draftsData = { drafts: [] };
  if (fs.existsSync(DRAFTS_FILE)) {
    try { draftsData = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8')); } catch (_) {}
  }

  let promises = [];
  if (fs.existsSync(PROMISES_FILE)) {
    try {
      const pRaw = JSON.parse(fs.readFileSync(PROMISES_FILE, 'utf8'));
      promises = pRaw.promises || [];
    } catch (_) {}
  }

  // Clés de déduplication existantes
  const existingUrls = new Set();
  const existingTitles = new Set();

  (newsData.news || []).forEach(n => {
    if (n.link) existingUrls.add(n.link.trim());
    if (n.title) existingTitles.add(n.title.toLowerCase().trim());
  });

  // Si on est en mode brouillons uniquement, on évite aussi les doublons dans drafts
  if (!directToNews) {
    (draftsData.drafts || []).forEach(d => {
      if (d.source_url) existingUrls.add(d.source_url.trim());
      if (d.title) existingTitles.add(d.title.toLowerCase().trim());
    });
  }

  console.log(`Sources scrutées : ${SOURCES_RSS.length}`);
  console.log(`Articles actuels dans news.json : ${newsData.news.length}`);
  console.log(`Brouillons en attente dans drafts.json : ${draftsData.drafts.length}`);
  console.log(`Mode d'ingestion : ${directToNews ? '🚀 DIRECT DANS NEWS.JSON' : '📥 VERS BROUILLONS (drafts.json)'}\n`);

  // 2. Fetch parallèle de tous les flux
  const resultats = await Promise.allSettled(SOURCES_RSS.map(src => fetchSourceRss(src)));

  let articlesCollectes = [];
  resultats.forEach((res, i) => {
    const src = SOURCES_RSS[i];
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      console.log(`  ✓ [${src.nom}] ${res.value.length} dépêches lues`);
      articlesCollectes = articlesCollectes.concat(res.value.slice(0, limitPerSource));
    } else {
      console.log(`  ✗ [${src.nom}] Échec de récupération`);
    }
  });

  // Trier par date la plus récente
  articlesCollectes.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  // 3. Filtrage et enrichissement
  const nouveauxArticles = [];
  const nouveauxDrafts = [];
  let maxNewsId = Math.max(0, ...newsData.news.map(n => parseInt(n.id) || 0));

  for (const item of articlesCollectes) {
    const normTitle = item.title.toLowerCase().trim();
    if (existingUrls.has(item.link) || existingTitles.has(normTitle)) {
      continue;
    }
    // Marquer pour éviter les doublons dans le même batch
    existingUrls.add(item.link);
    existingTitles.add(normTitle);

    const domaine = classerDomaineProjetBI(item.title, item.excerpt);
    const promMatch = chercherEngagementAssocie(item.title, item.excerpt, promises);

    const jour = String(item.dateObj.getDate()).padStart(2, '0');
    const mois = String(item.dateObj.getMonth() + 1).padStart(2, '0');
    const annee = item.dateObj.getFullYear();
    const dateFr = `${jour}/${mois}/${annee}`;

    if (directToNews) {
      maxNewsId++;
      nouveauxArticles.push({
        id: String(maxNewsId),
        title: item.title,
        excerpt: item.excerpt,
        content: item.excerpt,
        date: dateFr,
        source: item.source,
        link: item.link,
        category: domaine,
        author: 'Collecte automatique ProjetBI',
        image: '',
        image_url: '',
        promise_id: promMatch ? promMatch.id : null,
        created_at: item.dateObj.toISOString()
      });
    } else {
      nouveauxDrafts.push({
        type: promMatch ? 'promise_update' : 'news',
        promise_id: promMatch ? promMatch.id : null,
        title: item.title,
        description: item.excerpt,
        source: item.source,
        source_url: item.link,
        date: `${annee}-${mois}-${jour}`,
        domain: domaine,
        confidence: promMatch ? 0.85 : 0.65,
        keywords: [],
        id: `draft_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }
  }

  // 4. Persistance
  if (directToNews) {
    if (nouveauxArticles.length > 0) {
      newsData.news = [...nouveauxArticles, ...newsData.news];
      newsData.last_updated = new Date().toISOString();
      fs.writeFileSync(NEWS_FILE, JSON.stringify(newsData, null, 2), 'utf8');
      console.log(`\n🎉 SUCCÈS : ${nouveauxArticles.length} nouveaux articles insérés directement dans news.json !`);
    } else {
      console.log('\nℹ️ Aucun nouvel article inédit à ajouter dans news.json (déjà à jour).');
    }
  } else {
    if (nouveauxDrafts.length > 0) {
      draftsData.drafts = [...nouveauxDrafts, ...draftsData.drafts];
      fs.writeFileSync(DRAFTS_FILE, JSON.stringify(draftsData, null, 2), 'utf8');
      console.log(`\n🎉 SUCCÈS : ${nouveauxDrafts.length} nouveaux brouillons ajoutés dans drafts.json (prêts pour validation admin) !`);
    } else {
      console.log('\nℹ️ Aucun nouveau brouillon à ajouter dans drafts.json.');
    }
  }

  return {
    nouveaux: directToNews ? nouveauxArticles : nouveauxDrafts,
    count: directToNews ? nouveauxArticles.length : nouveauxDrafts.length
  };
}

// Exécution CLI directe
if (require.main === module) {
  const isDraftsOnly = process.argv.includes('--drafts') || process.argv.includes('--drafts-only');
  const isDirect = !isDraftsOnly; // Direct dans news.json par défaut
  collecterNews({ directToNews: isDirect })
    .then(res => {
      console.log(`Terminé avec succès (${res.count} articles traités).`);
      process.exit(0);
    })
    .catch(err => {
      console.error('Erreur critique collecte :', err);
      process.exit(1);
    });
}

module.exports = { collecterNews, SOURCES_RSS };
