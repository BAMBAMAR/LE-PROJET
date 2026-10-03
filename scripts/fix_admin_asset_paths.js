const fs = require('fs');
let c = fs.readFileSync('admin.html', 'utf8');

c = c.replaceAll('"/assets/branding/', '"assets/branding/');

fs.writeFileSync('admin.html', c, 'utf8');
console.log('Fixed relative paths in admin.html!');
