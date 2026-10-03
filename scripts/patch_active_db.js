const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

const helperCode = `
function getActiveDB() {
  if (typeof window !== 'undefined' && window.DB && window.DB.promises && window.DB.promises.length) return window.DB;
  if (typeof DB !== 'undefined' && DB && DB.promises && DB.promises.length) return DB;
  return (typeof window !== 'undefined' && window.DB) || (typeof DB !== 'undefined' && DB) || { promises: [], news: [], press: [] };
}
`;

if (!c.includes('function getActiveDB()')) {
  c = c.replace('function onPostSourceTypeChange() {', helperCode + '\nfunction onPostSourceTypeChange() {');
}

c = c.replaceAll(
  'const dbSource = (window.DB && window.DB.promises && window.DB.promises.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.promises && dbSource.promises.length) ? dbSource.promises : [];',
  'const dbSource = getActiveDB();\n    const list = dbSource.promises || [];'
);

c = c.replaceAll(
  'const dbSource = (window.DB && window.DB.news && window.DB.news.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.news && dbSource.news.length) ? dbSource.news : [];',
  'const dbSource = getActiveDB();\n    const list = dbSource.news || [];'
);

c = c.replaceAll(
  'const dbSource = (window.DB && window.DB.press && window.DB.press.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.press && dbSource.press.length) ? dbSource.press : [];',
  'const dbSource = getActiveDB();\n    const list = dbSource.press || [];'
);

// In buildGeneratedPost:
c = c.replace('const list = (DB && DB.promises) ? DB.promises : [];', 'const dbSource = getActiveDB();\n    const list = dbSource.promises || [];');
c = c.replace('const list = (DB && DB.news) ? DB.news : [];', 'const dbSource = getActiveDB();\n    const list = dbSource.news || [];');
c = c.replace('const list = (DB && DB.press) ? DB.press : [];', 'const dbSource = getActiveDB();\n    const list = dbSource.press || [];');

fs.writeFileSync('admin.html', c, 'utf8');
console.log('getActiveDB applied cleanly to admin.html!');
