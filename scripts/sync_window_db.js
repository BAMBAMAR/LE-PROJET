const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

c = c.replace('let DB = { promises: [], news: [], press: [] };', 'let DB = window.DB = { promises: [], news: [], press: [] };');

c = c.replace(
  'filteredPromises = [...DB.promises];',
  'window.DB = DB;\n    filteredPromises = [...DB.promises];'
);

// In onPostSourceTypeChange and buildGeneratedPost, ensure db source is safe:
c = c.replaceAll(
  'const list = (DB && DB.promises && DB.promises.length) ? DB.promises : [];',
  'const dbSource = (window.DB && window.DB.promises && window.DB.promises.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.promises && dbSource.promises.length) ? dbSource.promises : [];'
);

c = c.replaceAll(
  'const list = (DB && DB.news && DB.news.length) ? DB.news : [];',
  'const dbSource = (window.DB && window.DB.news && window.DB.news.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.news && dbSource.news.length) ? dbSource.news : [];'
);

c = c.replaceAll(
  'const list = (DB && DB.press && DB.press.length) ? DB.press : [];',
  'const dbSource = (window.DB && window.DB.press && window.DB.press.length) ? window.DB : DB;\n    const list = (dbSource && dbSource.press && dbSource.press.length) ? dbSource.press : [];'
);

fs.writeFileSync('admin.html', c, 'utf8');
console.log('Synchronized window.DB in admin.html!');
