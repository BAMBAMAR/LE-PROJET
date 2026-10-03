const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'actualites');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const newsRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'news.json'), 'utf8'));
const articles = newsRaw.news || newsRaw;

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function parseDateIso(dStr) {
  if (!dStr) return new Date().toISOString();
  if (dStr.includes('T')) return dStr;
  const parts = dStr.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}T12:00:00.000Z`;
  }
  return new Date().toISOString();
}

console.log(`Génération des pages SEO pour ${articles.length} articles d'actualité...`);

const newsSitemapUrls = [];

articles.forEach(art => {
  const id = art.id;
  const title = escapeHtml(art.title || 'Actualité ProjetBI');
  const excerpt = escapeHtml(art.excerpt || art.content || '');
  const content = escapeHtml(art.content || art.excerpt || '');
  const source = escapeHtml(art.source || 'ProjetBI');
  const dateStr = escapeHtml(art.date || '');
  const dateIso = parseDateIso(art.created_at || art.date);
  const originalLink = art.link ? escapeHtml(art.link) : '';
  const category = escapeHtml(art.category || 'Politique');
  const canonicalUrl = `https://www.projetbi.org/actualites/actu-${id}`;

  newsSitemapUrls.push({
    loc: canonicalUrl,
    lastmod: dateIso.substring(0, 10),
    priority: '0.75'
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Actualités ProjetBI</title>
  <meta name="description" content="${excerpt.substring(0, 155)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#2D5F3F">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title} | ProjetBI">
  <meta property="og:description" content="${excerpt.substring(0, 160)}">
  <meta property="og:image" content="https://www.projetbi.org/og-image.jpg">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title} | ProjetBI">
  <meta name="twitter:description" content="${excerpt.substring(0, 160)}">
  <meta name="twitter:image" content="https://www.projetbi.org/og-image.jpg">

  <link rel="icon" href="https://www.projetbi.org/favicon.png" type="image/png">
  <link rel="alternate" type="application/rss+xml" title="ProjetBI — Actualités du Projet PASTEF" href="https://www.projetbi.org/rss.xml">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/design-system.css">

  <!-- Schema.org NewsArticle -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${title.replace(/"/g, '\\"')}",
    "description": "${excerpt.replace(/"/g, '\\"')}",
    "datePublished": "${dateIso}",
    "dateModified": "${dateIso}",
    "author": {
      "@type": "Organization",
      "name": "${source.replace(/"/g, '\\"')}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ProjetBI",
      "url": "https://www.projetbi.org",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.projetbi.org/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "${canonicalUrl}"
    }
  }
  </script>
</head>
<body style="font-family:'Inter',system-ui,sans-serif;background:#FAFBFB;color:#0D1B14;margin:0;padding:0;">

  <!-- Header compact -->
  <header style="background:#1A3D28;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #C9A84C;">
    <a href="/" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;color:white;">
      <img src="/favicon.png" alt="ProjetBI" style="width:32px;height:32px;border-radius:6px;">
      <span style="font-weight:800;font-size:1.15rem;letter-spacing:-0.01em;">PROJETBI</span>
      <span style="color:#C9A84C;font-size:0.8rem;font-weight:600;">Jub Jubal Jubanti</span>
    </a>
    <div style="display:flex;gap:1rem;font-size:0.9rem;">
      <a href="/actualites" style="color:#E5E7EB;text-decoration:none;font-weight:600;"><i class="fas fa-arrow-left"></i> Toutes les actualités</a>
      <a href="/#engagements" style="color:#E5E7EB;text-decoration:none;font-weight:600;">Engagements</a>
      <a href="/ideologie" style="color:#E5E7EB;text-decoration:none;font-weight:600;">Idéologie</a>
    </div>
  </header>

  <main style="max-width:880px;margin:2.5rem auto;padding:0 1.5rem;">
    <!-- Fil d'ariane -->
    <nav style="font-size:0.85rem;color:#6B7280;margin-bottom:1.5rem;">
      <a href="/" style="color:#2D5F3F;text-decoration:none;">Accueil</a> &gt; 
      <a href="/actualites" style="color:#2D5F3F;text-decoration:none;">Actualités</a> &gt; 
      <span>${category}</span> &gt;
      <span style="color:#111827;font-weight:600;">Article #${id}</span>
    </nav>

    <!-- Article -->
    <article style="background:white;border-radius:16px;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #E5E7EB;">
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap;">
        <span style="background:#EEF6F1;color:#2D5F3F;padding:4px 12px;border-radius:16px;font-size:0.8rem;font-weight:800;text-transform:uppercase;">
          ${category}
        </span>
        <span style="font-size:0.85rem;color:#6B7280;">📅 ${dateStr}</span>
        <span style="font-size:0.85rem;color:#6B7280;">📰 Source : <strong>${source}</strong></span>
      </div>

      <h1 style="font-family:'Crimson Pro',serif;font-size:clamp(1.8rem, 3.5vw, 2.4rem);font-weight:800;color:#0D1B14;line-height:1.25;margin:0 0 1.5rem;">
        ${title}
      </h1>

      <div style="font-size:1.1rem;line-height:1.75;color:#374151;margin-bottom:2rem;border-left:4px solid #C9A84C;padding-left:1.25rem;">
        <p>${content}</p>
      </div>

      ${originalLink ? `
      <div style="background:#F9FAFB;padding:1.25rem;border-radius:10px;border:1px solid #E5E7EB;margin-bottom:2rem;">
        <div style="font-size:0.85rem;color:#6B7280;margin-bottom:0.4rem;">Lien vers la source originale vérifiée :</div>
        <a href="${originalLink}" target="_blank" rel="noopener noreferrer" style="color:#2D5F3F;font-weight:700;word-break:break-all;text-decoration:none;">
          <i class="fas fa-external-link-alt"></i> Lire l'article complet sur ${source}
        </a>
      </div>
      ` : ''}

      <!-- Actions citoyennes & partage -->
      <div style="border-top:1px solid #E5E7EB;padding-top:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <a href="/actualites" style="background:#2D5F3F;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;display:inline-flex;align-items:center;gap:8px;">
          <i class="fas fa-newspaper"></i> Retour au fil d'actualités
        </a>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:0.85rem;color:#6B7280;">Partager :</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title + ' - ProjetBI')}&url=${encodeURIComponent(canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="color:#1DA1F2;padding:6px 10px;border:1px solid #E5E7EB;border-radius:6px;text-decoration:none;"><i class="fab fa-twitter"></i></a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' - ' + canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="color:#25D366;padding:6px 10px;border:1px solid #E5E7EB;border-radius:6px;text-decoration:none;"><i class="fab fa-whatsapp"></i></a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="color:#1877F2;padding:6px 10px;border:1px solid #E5E7EB;border-radius:6px;text-decoration:none;"><i class="fab fa-facebook"></i></a>
        </div>
      </div>
    </article>
  </main>

  <!-- Footer -->
  <footer style="background:#1A3D28;color:white;text-align:center;padding:2.5rem 1.5rem;margin-top:4rem;border-top:3px solid #C9A84C;">
    <p style="margin:0 0 0.5rem;font-weight:700;">PROJETBI.ORG — Les Gardiens du Projet PASTEF</p>
    <p style="margin:0;font-size:0.85rem;color:rgba(255,255,255,0.7);">Veille citoyenne et suivi rigoureux des engagements pour un Sénégal Souverain, Juste & Prospère (2024–2029).</p>
  </footer>

</body>
</html>`;

  fs.writeFileSync(path.join(outDir, `actu-${id}.html`), html, 'utf8');
});

console.log(`✅ ${articles.length} pages d'actualité générées dans ${outDir}`);

// Mettre à jour le sitemap global en intégrant les pages d'engagements ET les actualités
const sitemapPath = path.join(rootDir, 'sitemap.xml');
let existingSitemap = fs.readFileSync(sitemapPath, 'utf8');

// Récupérer les URLs déjà présentes pour ne pas dupliquer
const matches = existingSitemap.match(/<loc>(.*?)<\/loc>/g) || [];
const existingLocs = new Set(matches.map(m => m.replace(/<\/?loc>/g, '')));

let addedCount = 0;
let newXmlEntries = [];

newsSitemapUrls.forEach(u => {
  if (!existingLocs.has(u.loc)) {
    newXmlEntries.push(`  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`);
    addedCount++;
  }
});

if (newXmlEntries.length > 0) {
  existingSitemap = existingSitemap.replace('</urlset>', newXmlEntries.join('\n') + '\n</urlset>');
  fs.writeFileSync(sitemapPath, existingSitemap, 'utf8');
  console.log(`✅ sitemap.xml enrichi de ${addedCount} articles d'actualité !`);
} else {
  console.log('Toutes les URLs d\'actualités sont déjà présentes dans le sitemap.');
}
