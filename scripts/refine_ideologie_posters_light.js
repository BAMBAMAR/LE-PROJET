const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. Refine ideoLogoHeader
const oldHeader = `function ideoLogoHeader(ctx) {
  ideoRR(ctx, 48, 48, 280, 48, 10, 'rgba(8, 28, 17, 0.90)');
  ctx.strokeStyle = 'rgba(229,184,66,0.30)'; ctx.lineWidth = 1;
  ideoRR(ctx, 48, 48, 280, 48, 10); ctx.stroke();

  // Emblème JJJ
  ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#00B054'; ctx.fillText('J', 68, 77);
  ctx.fillStyle = '#FFD700'; ctx.fillText('J', 82, 77);
  ctx.fillStyle = '#E31B23'; ctx.fillText('J', 96, 77);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px "Syne", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('PROJETBI', 116, 77);

  ctx.fillStyle = '#E5B842';
  ctx.font = '700 11px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.fillText('◆ IDÉOLOGIE', 224, 76);
}`;

const newHeader = `function ideoLogoHeader(ctx) {
  ideoRR(ctx, 48, 48, 280, 48, 10, '#FFFFFF');
  ctx.strokeStyle = 'rgba(201,168,76,0.60)'; ctx.lineWidth = 1.5;
  ideoRR(ctx, 48, 48, 280, 48, 10); ctx.stroke();

  // Emblème JJJ (Vert, Or, Rouge républicains)
  ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
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

// 2. Refine ideoFooter
const oldFooter = `function ideoFooter(ctx) {
  ideoRR(ctx, 0, 990, 1080, 90, 0, 'rgba(3, 14, 8, 0.96)');
  const lineG = ctx.createLinearGradient(0, 990, 1080, 990);
  lineG.addColorStop(0, 'rgba(229,184,66,0.1)');
  lineG.addColorStop(0.5, 'rgba(229,184,66,0.5)');
  lineG.addColorStop(1, 'rgba(229,184,66,0.1)');
  ctx.fillStyle = lineG;
  ctx.fillRect(0, 990, 1080, 1.5);

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '500 16px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🌐 projetbi.org/ideologie.html  •  Plateforme Citoyenne Indépendante', 48, 1042);

  ctx.fillStyle = '#E5B842';
  ctx.font = '800 16px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('JUB • JUBAL • JUBANTI 🇸🇳', 1032, 1042);
  ctx.textAlign = 'left';
}`;

const newFooter = `function ideoFooter(ctx) {
  ideoRR(ctx, 0, 990, 1080, 90, 0, '#FFFFFF');
  ctx.fillStyle = 'rgba(201,168,76,0.40)';
  ctx.fillRect(0, 990, 1080, 1.5);

  ctx.fillStyle = '#354B3C';
  ctx.font = '600 16px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🌐 projetbi.org/ideologie.html  •  Plateforme Citoyenne Indépendante', 48, 1042);

  ctx.fillStyle = '#A67C19';
  ctx.font = '800 16px "Plus Jakarta Sans", Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('JUB • JUBAL • JUBANTI 🇸🇳', 1032, 1042);
  ctx.textAlign = 'left';
}`;

content = content.replace(oldHeader.replace(/\r\n/g, '\n'), newHeader);
content = content.replace(oldFooter.replace(/\r\n/g, '\n'), newFooter);
// Try CRLF too
content = content.replace(oldHeader.replace(/\n/g, '\r\n'), newHeader.replace(/\n/g, '\r\n'));
content = content.replace(oldFooter.replace(/\n/g, '\r\n'), newFooter.replace(/\n/g, '\r\n'));

// 3. Refine Comparaison Template (Template 3)
content = content.replace(
  `    ctx.fillStyle = '#FFE9A3';\n    ctx.font = 'bold 28px "Plus Jakarta Sans", Inter, sans-serif';`,
  `    ctx.fillStyle = '#A67C19';\n    ctx.font = 'bold 28px "Plus Jakarta Sans", Inter, sans-serif';`
);
content = content.replace(
  `    ctx.fillStyle = '#FFE9A3';\r\n    ctx.font = 'bold 28px "Plus Jakarta Sans", Inter, sans-serif';`,
  `    ctx.fillStyle = '#A67C19';\r\n    ctx.font = 'bold 28px "Plus Jakarta Sans", Inter, sans-serif';`
);

content = content.replace(
  `    ideoRR(ctx, 44, 235, 476, 710, 18, 'rgba(239,68,68,0.10)');\n    ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 2;\n    ideoRR(ctx, 44, 235, 476, 710, 18); ctx.stroke();\n\n    ctx.fillStyle = '#F87171';\n    ctx.font = 'bold 22px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('✕  LE SYSTÈME', 282, 290);\n\n    ctx.fillStyle = '#FFFFFF';\n    ctx.font = 'bold 36px "Crimson Pro", Georgia, serif';\n    ideoWrapText(ctx, badTitle, 282, 360, 420, 48);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.72)';`,
  `    ideoRR(ctx, 44, 235, 476, 710, 18, '#FFFFFF');\n    ctx.strokeStyle = '#D92D20'; ctx.lineWidth = 2;\n    ideoRR(ctx, 44, 235, 476, 710, 18); ctx.stroke();\n\n    ctx.fillStyle = '#D92D20';\n    ctx.font = 'bold 22px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('✕  LE SYSTÈME', 282, 290);\n\n    ctx.fillStyle = '#111D14';\n    ctx.font = 'bold 36px "Crimson Pro", Georgia, serif';\n    ideoWrapText(ctx, badTitle, 282, 360, 420, 48);\n\n    ctx.fillStyle = '#354B3C';`
);

content = content.replace(
  `    ideoRR(ctx, 560, 235, 476, 710, 18, 'rgba(16,185,129,0.12)');\n    ctx.strokeStyle = '#10B981'; ctx.lineWidth = 2;\n    ideoRR(ctx, 560, 235, 476, 710, 18); ctx.stroke();\n\n    ctx.fillStyle = '#34D399';\n    ctx.font = 'bold 22px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('✓  VISION PASTEF', 798, 290);\n\n    ctx.fillStyle = '#FFFFFF';\n    ctx.font = 'bold 36px "Crimson Pro", Georgia, serif';\n    ideoWrapText(ctx, goodTitle, 798, 360, 420, 48);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.72)';`,
  `    ideoRR(ctx, 560, 235, 476, 710, 18, '#FFFFFF');\n    ctx.strokeStyle = '#1E6E3E'; ctx.lineWidth = 2;\n    ideoRR(ctx, 560, 235, 476, 710, 18); ctx.stroke();\n\n    ctx.fillStyle = '#1E6E3E';\n    ctx.font = 'bold 22px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('✓  VISION PASTEF', 798, 290);\n\n    ctx.fillStyle = '#111D14';\n    ctx.font = 'bold 36px "Crimson Pro", Georgia, serif';\n    ideoWrapText(ctx, goodTitle, 798, 360, 420, 48);\n\n    ctx.fillStyle = '#354B3C';`
);

// 4. Refine Jubanti Template (Template 4)
content = content.replace(
  `ideoBg(ctx, '#031409', '#082D18');\n    ideoLogoHeader(ctx);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.60)';`,
  `ideoBg(ctx, '#FFFFFF', '#F4F7F4');\n    ideoLogoHeader(ctx);\n\n    ctx.fillStyle = '#354B3C';`
);
content = content.replace(
  `ideoBg(ctx, '#031409', '#082D18');\r\n    ideoLogoHeader(ctx);\r\n\r\n    ctx.fillStyle = 'rgba(255,255,255,0.60)';`,
  `ideoBg(ctx, '#FFFFFF', '#F4F7F4');\r\n    ideoLogoHeader(ctx);\r\n\r\n    ctx.fillStyle = '#354B3C';`
);

content = content.replace(
  `const textColors = ['#FFFFFF', '#FFE9A3', '#FFFFFF'];`,
  `const textColors = ['#1E6E3E', '#A67C19', '#D92D20'];`
);

content = content.replace(
  `ideoRR(ctx, x, bY, bW, bH, 18, 'rgba(8, 28, 17, 0.85)');`,
  `ideoRR(ctx, x, bY, bW, bH, 18, '#FFFFFF');`
);

content = content.replace(
  `ctx.fillStyle = 'rgba(255,255,255,0.85)';\n      ctx.font = 'italic 26px "Crimson Pro", Georgia, serif';`,
  `ctx.fillStyle = '#111D14';\n      ctx.font = 'italic 26px "Crimson Pro", Georgia, serif';`
);
content = content.replace(
  `ctx.fillStyle = 'rgba(255,255,255,0.85)';\r\n      ctx.font = 'italic 26px "Crimson Pro", Georgia, serif';`,
  `ctx.fillStyle = '#111D14';\r\n      ctx.font = 'italic 26px "Crimson Pro", Georgia, serif';`
);

// 5. Refine Stat Template (Template 5)
content = content.replace(
  `ideoRR(ctx, 150, 220, 780, 350, 20, 'rgba(8, 28, 17, 0.88)');`,
  `ideoRR(ctx, 150, 220, 780, 350, 20, '#FFFFFF');`
);
content = content.replace(
  `ctx.fillStyle = '#FFE9A3';\n    ctx.font = '900 200px "Plus Jakarta Sans", Inter, sans-serif';`,
  `ctx.fillStyle = '#A67C19';\n    ctx.font = '900 200px "Plus Jakarta Sans", Inter, sans-serif';`
);
content = content.replace(
  `ctx.fillStyle = '#FFE9A3';\r\n    ctx.font = '900 200px "Plus Jakarta Sans", Inter, sans-serif';`,
  `ctx.fillStyle = '#A67C19';\r\n    ctx.font = '900 200px "Plus Jakarta Sans", Inter, sans-serif';`
);
content = content.replace(
  `ctx.fillStyle = '#FFFFFF';\n    ctx.font = 'bold 32px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.fillText(bigL, 540, 520);`,
  `ctx.fillStyle = '#0D2818';\n    ctx.font = 'bold 32px "Plus Jakarta Sans", Inter, sans-serif';\n    ctx.fillText(bigL, 540, 520);`
);
content = content.replace(
  `ctx.fillStyle = '#FFFFFF';\r\n    ctx.font = 'bold 32px "Plus Jakarta Sans", Inter, sans-serif';\r\n    ctx.fillText(bigL, 540, 520);`,
  `ctx.fillStyle = '#0D2818';\r\n    ctx.font = 'bold 32px "Plus Jakarta Sans", Inter, sans-serif';\r\n    ctx.fillText(bigL, 540, 520);`
);

fs.writeFileSync(adminPath, content, 'utf8');
console.log('All ideo templates updated to high-prestige Republican White aesthetics!');
