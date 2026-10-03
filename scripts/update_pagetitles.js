const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

c = c.replace(
  "social: 'Pages Réseaux Sociaux',",
  "branding: 'Logos, Bannières & Kit de Marque Officiel',\r\n  social: 'Pages Réseaux Sociaux',"
);

fs.writeFileSync('admin.html', c, 'utf8');
console.log('pageTitles updated with branding!');
