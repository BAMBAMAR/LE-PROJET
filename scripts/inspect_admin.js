const fs = require('fs');

const content = fs.readFileSync('admin.html', 'utf8');

// Find all data-page
const dataPages = [...content.matchAll(/data-page="([^"]+)"/g)].map(m => m[1]);
console.log('Sidebar data-page items:', dataPages);

// Find all page- divs
const pageDivs = [...content.matchAll(/id="(page-[^"]+)"/g)].map(m => m[1]);
console.log('Page divs in HTML:', pageDivs);

// Find navigation handler in script
const navHandlerMatch = content.match(/function switchPage|function navigateTo|data-page/i);
console.log('Nav handler match:', navHandlerMatch ? navHandlerMatch[0] : 'not found');

// Let's search where data-page is handled in JavaScript
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('data-page') && idx > 450) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
  if (line.includes('page-kit') || line.includes('page-social') || line.includes('kit-communication')) {
    console.log(`Match at line ${idx + 1}: ${line.trim()}`);
  }
});
