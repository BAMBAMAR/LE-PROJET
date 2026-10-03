const fs = require('fs');

const indexHtml = fs.readFileSync('index.html', 'utf8');

const socialMatches = [];
const lines = indexHtml.split('\n');
lines.forEach((l, i) => {
  if (l.match(/facebook|twitter|x\.com|whatsapp|youtube|tiktok|linkedin|telegram|instagram|fa-share|share/i)) {
    if (socialMatches.length < 25) {
      socialMatches.push({ line: i + 1, content: l.trim().slice(0, 120) });
    }
  }
});
console.log('Social references in index.html:', socialMatches);
