const fs = require('fs');
const path = require('path');

function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, '’')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, '…')
    .replace(/&hellip;/gi, '…')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\u00a0/g, ' ');
}

function cleanTitle(title, source) {
  if (!title) return '';
  let t = decodeEntities(title).trim();

  // Strip known source suffix if present
  if (source && source.trim()) {
    const sEsc = source.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp('\\s*[-|–—]\\s*' + sEsc + '\\s*$', 'i'), '');
  }

  // Strip common news outlet suffixes
  t = t.replace(/\s*[-|–—]\s*(?:[a-zA-Z0-9.-]+\.(?:com|sn|net|org|fr|info)|xalima|sanslimitesn|senego|seneweb|dakaractu|pressafrik|lequotidien|le soleil|walf|sudquotidien|aps|rts|jeune afrique|dw\.com)\s*$/i, '');

  // Strip trailing " - SOMETHING.COM" or all-caps source names
  t = t.replace(/\s*[-|–—]\s*([A-Za-z0-9.\s_-]{2,30})$/, (match, p1) => {
    const trimmed = p1.trim();
    if (/\b(avec|face|pour|contre|dans|sur|sous|selon|vers|par)\b/i.test(trimmed)) return match;
    if (/\.(com|sn|net|org|info)/i.test(trimmed) || /^[A-Z0-9.\s_-]+$/.test(trimmed)) {
      return '';
    }
    return match;
  });

  return t.replace(/\s+/g, ' ').trim();
}

function cleanText(text, title, source) {
  if (!text) return '';
  let s = decodeEntities(text).trim();

  // Strip source suffix at end
  if (source && source.trim()) {
    const sEsc = source.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    s = s.replace(new RegExp('\\s*[-|–—]?\\s*' + sEsc + '\\s*$', 'i'), '');
  }
  s = s.replace(/\s*[-|–—]\s*(?:[a-zA-Z0-9.-]+\.(?:com|sn|net|org|fr|info)|xalima|sanslimitesn|senego|seneweb|dakaractu|pressafrik|lequotidien|le soleil|walf|sudquotidien|aps|rts|jeune afrique|dw\.com)\s*$/i, '');

  // Remove WordPress scraping junk
  s = s.replace(/The post .* appeared first on .*/gi, '');
  s = s.replace(/The post .*/gi, '');
  s = s.replace(/\[\s*…\s*\]/g, '…');
  s = s.replace(/\[\s*&#8230;\s*\]/g, '…');
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

function processNewsFile() {
  const newsPath = path.join(__dirname, '..', 'news.json');
  const raw = fs.readFileSync(newsPath, 'utf8');
  const data = JSON.parse(raw);
  let changed = 0;

  data.news = (data.news || []).map(n => {
    const origTitle = n.title;
    const origExcerpt = n.excerpt;
    const origContent = n.content;

    const newTitle = cleanTitle(n.title, n.source);
    let newExcerpt = cleanText(n.excerpt, newTitle, n.source);
    let newContent = cleanText(n.content, newTitle, n.source);

    if (newTitle !== origTitle || newExcerpt !== origExcerpt || newContent !== origContent) {
      changed++;
    }

    return {
      ...n,
      title: newTitle,
      excerpt: newExcerpt,
      content: newContent
    };
  });

  fs.writeFileSync(newsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`news.json updated: ${changed} articles cleaned out of ${data.news.length}`);
}

function processDraftsFile() {
  const draftsPath = path.join(__dirname, '..', 'drafts.json');
  if (!fs.existsSync(draftsPath)) return;
  const raw = fs.readFileSync(draftsPath, 'utf8');
  const data = JSON.parse(raw);
  let changed = 0;

  data.drafts = (data.drafts || []).map(d => {
    const origTitle = d.title;
    const origDesc = d.description;

    const newTitle = cleanTitle(d.title, d.source);
    const newDesc = cleanText(d.description, newTitle, d.source);

    if (newTitle !== origTitle || newDesc !== origDesc) {
      changed++;
    }

    return {
      ...d,
      title: newTitle,
      description: newDesc
    };
  });

  fs.writeFileSync(draftsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`drafts.json updated: ${changed} drafts cleaned out of ${data.drafts.length}`);
}

processNewsFile();
processDraftsFile();
