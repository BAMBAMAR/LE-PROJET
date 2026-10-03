const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const newsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'news.json'), 'utf8'));
const articles = (newsData.news || newsData).slice(0, 50);

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function parsePubDate(item) {
  if (item.created_at) {
    try {
      return new Date(item.created_at).toUTCString();
    } catch(e) {}
  }
  if (item.date) {
    // format DD/MM/YYYY
    const parts = item.date.split('/');
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`).toUTCString();
    }
  }
  return new Date().toUTCString();
}

let itemsXml = articles.map(art => {
  const title = escapeXml(art.title);
  const desc = escapeXml(art.excerpt || art.content || art.title);
  const link = escapeXml(`https://www.projetbi.org/actualites#actu-${art.id}`);
  const source = escapeXml(art.source || 'ProjetBI');
  const pubDate = parsePubDate(art);
  const guid = `projetbi-actu-${art.id}`;

  return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${desc}</description>
      <source url="https://www.projetbi.org/actualites">${source}</source>
    </item>`;
}).join('\n');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ProjetBI — Actualités &amp; Suivi du Projet PASTEF</title>
    <link>https://www.projetbi.org/actualites</link>
    <description>Fil d'actualité et revue de presse du Projet Sénégal Souverain, Juste &amp; Prospère (2024–2029).</description>
    <language>fr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://www.projetbi.org/rss.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>
`;

fs.writeFileSync(path.join(rootDir, 'rss.xml'), rssXml, 'utf8');
console.log(`rss.xml généré avec succès (${articles.length} articles récents)`);
