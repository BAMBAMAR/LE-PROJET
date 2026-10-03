const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'engagements');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const promisesRaw = JSON.parse(fs.readFileSync(path.join(rootDir, 'promises.json'), 'utf8'));
const promises = promisesRaw.promises || promisesRaw;

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

function getStatusBadge(status) {
  const s = (status || '').toLowerCase();
  if (s.includes('realise') || s.includes('réalisé')) {
    return { label: 'Réalisé', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', icon: 'fa-check-circle' };
  } else if (s.includes('cours') || s.includes('encours')) {
    return { label: 'En cours', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: 'fa-sync-alt' };
  } else if (s.includes('retard')) {
    return { label: 'En retard', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', icon: 'fa-exclamation-triangle' };
  }
  return { label: 'Non lancé', color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', icon: 'fa-clock' };
}

console.log(`Génération des pages SEO pour ${promises.length} engagements...`);

const sitemapUrls = [];

promises.forEach((p, idx) => {
  const num = idx + 1;
  const id = p.id || `promise_${num}`;
  const domaine = escapeHtml(p.domaine || 'Général');
  const engagementText = escapeHtml(p.engagement || '');
  const resultatText = escapeHtml(p.resultat || 'Transformation et respect du programme PASTEF.');
  const delaiText = escapeHtml(p.delai || 'Mandat 2024-2029');
  const statusInfo = getStatusBadge(p.status);
  const canonicalUrl = `https://www.projetbi.org/engagements/${id}`;
  const updates = Array.isArray(p.mises_a_jour) ? p.mises_a_jour : [];

  sitemapUrls.push({
    loc: canonicalUrl,
    lastmod: '2026-10-03',
    priority: '0.8'
  });

  const updatesHtml = updates.length > 0 ? updates.map(u => `
    <div class="update-item" style="border-left: 3px solid #2D5F3F; padding-left: 1rem; margin-bottom: 1rem;">
      <div style="font-size: 0.85rem; font-weight: 700; color: #2D5F3F;">📅 ${escapeHtml(u.date || '')}</div>
      <div style="font-size: 0.95rem; color: #374151; margin-top: 0.25rem;">${escapeHtml(u.text || '')}</div>
    </div>
  `).join('') : '<p style="color: #6B7280; font-style: italic;">Aucune mise à jour formelle enregistrée pour l\'instant.</p>';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Engagement n°${num} : ${domaine} | ProjetBI — Suivi du Projet PASTEF</title>
  <meta name="description" content="Suivi de l'engagement n°${num} (${domaine}) : « ${engagementText.substring(0, 140)}... » du Président Bassirou Diomaye Faye. Statut : ${statusInfo.label}.">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#2D5F3F">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="Engagement n°${num} : ${domaine} | ProjetBI">
  <meta property="og:description" content="Statut : ${statusInfo.label} — ${engagementText.substring(0, 160)}">
  <meta property="og:image" content="https://www.projetbi.org/og-image.jpg">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Engagement n°${num} : ${domaine} | ProjetBI">
  <meta name="twitter:description" content="Statut : ${statusInfo.label} — ${engagementText.substring(0, 160)}">
  <meta name="twitter:image" content="https://www.projetbi.org/og-image.jpg">

  <link rel="icon" href="https://www.projetbi.org/favicon.png" type="image/png">
  <link rel="alternate" type="application/rss+xml" title="ProjetBI — Actualités du Projet PASTEF" href="https://www.projetbi.org/rss.xml">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" crossorigin="anonymous">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/design-system.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    "name": "Engagement n°${num} : ${domaine}",
    "description": "${engagementText.replace(/"/g, '\\"')}",
    "serviceType": "Suivi citoyen du programme présidentiel",
    "provider": {
      "@type": "Organization",
      "name": "ProjetBI",
      "url": "https://www.projetbi.org"
    },
    "areaServed": "Sénégal"
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://www.projetbi.org/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Engagements",
        "item": "https://www.projetbi.org/#engagements"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${domaine}",
        "item": "${canonicalUrl}"
      }
    ]
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
      <a href="/#engagements" style="color:#E5E7EB;text-decoration:none;font-weight:600;"><i class="fas fa-arrow-left"></i> Tous les engagements</a>
      <a href="/actualites" style="color:#E5E7EB;text-decoration:none;font-weight:600;">Actualités</a>
      <a href="/ideologie" style="color:#E5E7EB;text-decoration:none;font-weight:600;">Idéologie</a>
    </div>
  </header>

  <main style="max-width:960px;margin:2.5rem auto;padding:0 1.5rem;">
    <!-- Fil d'ariane -->
    <nav style="font-size:0.85rem;color:#6B7280;margin-bottom:1.5rem;">
      <a href="/" style="color:#2D5F3F;text-decoration:none;">Accueil</a> &gt; 
      <a href="/#engagements" style="color:#2D5F3F;text-decoration:none;">Engagements</a> &gt; 
      <span>${domaine}</span> &gt;
      <span style="color:#111827;font-weight:600;">n°${num}</span>
    </nav>

    <!-- Fiche de l'engagement -->
    <article style="background:white;border-radius:16px;padding:2.5rem;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #E5E7EB;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
        <span style="background:#EEF6F1;color:#2D5F3F;padding:6px 14px;border-radius:20px;font-size:0.85rem;font-weight:800;text-transform:uppercase;">
          🏛️ ${domaine}
        </span>
        <span style="background:${statusInfo.bg};color:${statusInfo.color};border:1px solid ${statusInfo.border};padding:6px 16px;border-radius:20px;font-size:0.85rem;font-weight:800;display:inline-flex;align-items:center;gap:6px;">
          <i class="fas ${statusInfo.icon}"></i> ${statusInfo.label}
        </span>
      </div>

      <h1 style="font-family:'Crimson Pro',serif;font-size:clamp(1.8rem, 3.5vw, 2.5rem);font-weight:800;color:#0D1B14;line-height:1.25;margin:0 0 1.5rem;">
        ${engagementText}
      </h1>

      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1.5rem;background:#F9FAFB;padding:1.5rem;border-radius:12px;margin-bottom:2rem;border:1px solid #F3F4F6;">
        <div>
          <div style="font-size:0.75rem;text-transform:uppercase;color:#6B7280;font-weight:700;">Résultat attendu</div>
          <div style="font-weight:600;color:#111827;margin-top:0.25rem;">${resultatText}</div>
        </div>
        <div>
          <div style="font-size:0.75rem;text-transform:uppercase;color:#6B7280;font-weight:700;">Échéance / Calendrier</div>
          <div style="font-weight:600;color:#111827;margin-top:0.25rem;">⏱️ ${delaiText}</div>
        </div>
        <div>
          <div style="font-size:0.75rem;text-transform:uppercase;color:#6B7280;font-weight:700;">Source officielle</div>
          <div style="font-weight:600;color:#111827;margin-top:0.25rem;">Livre Programme Diomaye 2024</div>
        </div>
      </div>

      <h2 style="font-family:'Crimson Pro',serif;font-size:1.5rem;color:#0D1B14;margin:2rem 0 1rem;">
        <i class="fas fa-history" style="color:#2D5F3F;"></i> Historique et état d'avancement
      </h2>
      <div style="margin-bottom:2.5rem;">
        ${updatesHtml}
      </div>

      <!-- Actions citoyennes -->
      <div style="border-top:1px solid #E5E7EB;padding-top:1.5rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
        <a href="/#engagements" style="background:#2D5F3F;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:0.95rem;display:inline-flex;align-items:center;gap:8px;">
          <i class="fas fa-sliders-h"></i> Explorer les 300 engagements
        </a>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="font-size:0.85rem;color:#6B7280;">Partager :</span>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('Suivi engagement n°' + num + ' - ' + domaine + ' : ' + engagementText + ' sur ProjetBI')}&url=${encodeURIComponent(canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="color:#1DA1F2;padding:6px 10px;border:1px solid #E5E7EB;border-radius:6px;text-decoration:none;"><i class="fab fa-twitter"></i></a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent('Engagement n°' + num + ' : ' + engagementText + ' - ' + canonicalUrl)}" target="_blank" rel="noopener noreferrer" style="color:#25D366;padding:6px 10px;border:1px solid #E5E7EB;border-radius:6px;text-decoration:none;"><i class="fab fa-whatsapp"></i></a>
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

  fs.writeFileSync(path.join(outDir, `${id}.html`), html, 'utf8');
});

console.log(`✅ 300 pages générées avec succès dans ${outDir}`);

// Générer le sitemap complet avec toutes les pages
const baseUrls = [
  { loc: 'https://www.projetbi.org/', lastmod: '2026-10-03', changefreq: 'daily', priority: '1.0' },
  { loc: 'https://www.projetbi.org/actualites', lastmod: '2026-10-03', changefreq: 'daily', priority: '0.95' },
  { loc: 'https://www.projetbi.org/ideologie', lastmod: '2026-10-03', changefreq: 'weekly', priority: '0.90' },
  { loc: 'https://www.projetbi.org/Livre-Programme-Bassirou-Diomaye-Faye.pdf', lastmod: '2026-10-03', changefreq: 'monthly', priority: '0.80' },
  { loc: 'https://www.projetbi.org/rss.xml', lastmod: '2026-10-03', changefreq: 'daily', priority: '0.70' }
];

const allUrls = baseUrls.concat(sitemapUrls);

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`).join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(rootDir, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✅ sitemap.xml mis à jour avec ${allUrls.length} URLs indexables directes (200 OK) !`);
