const fs = require('fs');

let admin = fs.readFileSync('admin.html', 'utf8');

const oldHeaderRegex = /function ideoLogoHeader\(ctx\)\s*\{[\s\S]*?ctx\.fillText\('◆ IDÉOLOGIE', 224, 76\);\s*\}/;

const newHeader = `function ideoLogoHeader(ctx) {
  ideoRR(ctx, 48, 44, 300, 52, 12, '#FFFFFF');
  ctx.strokeStyle = 'rgba(201, 168, 76, 0.55)';
  ctx.lineWidth = 1.5;
  ideoRR(ctx, 48, 44, 300, 52, 12);
  ctx.stroke();

  // Monogramme JJJ (Vert, Or, Rouge républicains)
  ctx.font = '900 18px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.fillStyle = '#1E6E3E'; ctx.fillText('J', 68, 77);
  ctx.fillStyle = '#A67C19'; ctx.fillText('J', 82, 77);
  ctx.fillStyle = '#D92D20'; ctx.fillText('J', 96, 77);

  ctx.fillStyle = '#0D2818';
  ctx.font = '900 18px "Syne", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PROJETBI', 116, 77);

  ctx.fillStyle = '#A67C19';
  ctx.font = '700 11px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.fillText('◆ IDÉOLOGIE', 224, 76);
}`;

admin = admin.replace(oldHeaderRegex, newHeader);
fs.writeFileSync('admin.html', admin, 'utf8');
console.log('ideoLogoHeader updated to pure white badge with high contrast text!');
