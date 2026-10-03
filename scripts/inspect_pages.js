const fs = require('fs');

const content = fs.readFileSync('admin.html', 'utf8');

// Find line numbers for each page- div
const lines = content.split('\n');
const pageLines = [];
lines.forEach((l, idx) => {
  const m = l.match(/<div class="page(?: active)?" id="([^"]+)">/);
  if (m) {
    pageLines.push({ id: m[1], line: idx + 1 });
  }
});
console.log('Page line numbers:', pageLines);

// Check navigation JS
const navHandlerIdx = lines.findIndex(l => l.includes("data-page") && l.includes("forEach"));
console.log('Nav handler at line:', navHandlerIdx + 1);
if (navHandlerIdx !== -1) {
  console.log(lines.slice(navHandlerIdx, navHandlerIdx + 30).join('\n'));
}
