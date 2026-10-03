const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

const concepts = [
  {
    name: 'logo_jjj_criniere_sans_etoile',
    title: 'Modèle 1 : Crinière Royale JJJ (Sans Étoile - Pureté Absolue)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Emblème Félin Couché Sans Étoile : 3 Mèches JJJ sculptées en crinière royale -->
        <g transform="translate(500, 370)">
          <!-- Mèche 1 (Jub / Droiture) : Mèche inférieure -->
          <path d="M -180,110 C -220,110 -240,75 -230,40 C -220,5 -185,-15 -145,-15 C -95,-15 -30,25 60,35 C -15,10 -80,-5 -125,-5 C -155,-5 -180,10 -185,35 C -190,55 -175,75 -150,75 C -115,75 -40,30 80,30 C 130,30 200,55 240,75 C 170,55 90,45 20,55 C -60,65 -130,110 -180,110 Z" fill="#0F172A"/>
          
          <!-- Mèche 2 (Jubal / Justice & Équité) : Mèche médiane -->
          <path d="M -210,35 C -250,35 -270,0 -260,-35 C -250,-70 -210,-90 -160,-90 C -100,-90 -20,-40 110,-30 C 20,-55 -60,-75 -120,-75 C -165,-75 -200,-55 -205,-30 C -210,-5 -190,12 -165,12 C -115,12 -30,-25 120,-25 C 180,-25 250,0 290,20 C 210,0 120,-10 40,0 C -50,12 -140,35 -210,35 Z" fill="#0F172A"/>

          <!-- Mèche 3 (Jubanti / Redressement) : Mèche supérieure, profil noble couché -->
          <path d="M -240,-40 C -280,-40 -300,-75 -290,-110 C -280,-145 -230,-165 -170,-165 C -90,-165 0,-110 150,-95 C 40,-125 -50,-145 -120,-145 C -170,-145 -220,-125 -225,-100 C -230,-75 -205,-58 -180,-58 C -110,-58 -10,-95 160,-95 C 230,-95 300,-65 340,-45 C 250,-65 150,-75 60,-65 C -40,-52 -150,-40 -240,-40 Z" fill="#0F172A"/>
        </g>
        
        <!-- Typographie Institutionnelle Haut de Gamme -->
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="68" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">FORCE TRANQUILLE • SOUVERAINETÉ • DIGNITÉ</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_leopard_profil_sans_etoile',
    title: 'Modèle 2 : L\'Encolure du Léopard PASTEF (Sans Étoile)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Profil du Léopard / Panthère stylisé en 3 lignes JJJ couchées sans étoile -->
        <g transform="translate(500, 370)">
          <!-- Ligne 1 : Mâchoire & gorge (Jub) -->
          <path d="M 180,-10 C 190,-10 210,0 230,15 C 240,22 250,35 240,50 C 230,62 210,65 190,62 C 160,58 130,55 100,58 C 50,62 0,85 -60,110 C -120,135 -170,140 -210,130 C -240,122 -260,95 -250,65 C -240,35 -210,25 -180,35 C -150,45 -110,40 -60,25 C 0,8 80,-10 180,-10 Z" fill="#0F172A"/>
          
          <!-- Ligne 2 : Arc frontal & regard (Jubal) -->
          <path d="M 120,-80 C 150,-70 190,-40 210,-20 C 190,-15 160,-25 130,-35 C 80,-52 10,-45 -60,-25 C -130,-5 -190,10 -230,-10 C -255,-22 -265,-50 -250,-75 C -235,-100 -205,-105 -180,-92 C -150,-78 -105,-80 -50,-88 C 10,-96 70,-90 120,-80 Z" fill="#0F172A"/>

          <!-- Ligne 3 : Oreille et nuque couchée (Jubanti) -->
          <path d="M 40,-170 C 65,-215 90,-210 110,-175 C 120,-155 130,-135 150,-120 C 130,-120 100,-130 80,-140 C 40,-160 -10,-155 -70,-145 C -145,-132 -210,-120 -250,-145 C -275,-160 -280,-188 -260,-205 C -240,-222 -210,-220 -185,-205 C -150,-185 -90,-182 -30,-185 C 0,-186 25,-180 40,-170 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="68" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">VIGILANCE • ÉTHIQUE • VISION SÉNÉGAL 2050</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_elan_45deg_sans_etoile',
    title: 'Modèle 3 : L\'Élan Aérodynamique à 45° (Sans Étoile)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- 3 J sculptés à 45° sans étoile, pure silhouette de vitesse et sérénité -->
        <g transform="translate(500, 360)">
          <!-- J 1 (Jub / Droiture) -->
          <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#0F172A"/>
          
          <!-- J 2 (Jubal / Équité) -->
          <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#0F172A"/>

          <!-- J 3 (Jubanti / Refondation) -->
          <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="68" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">FORCE TRANQUILLE • VIGILANCE • ÉTHIQUE</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_criniere_harmonie_pure',
    title: 'Modèle 4 : La Crinière Harmonique Épurée (Courbes Adoucies)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Version perfectionnée : 3 J félins aux courbes douces, sans angle agressif -->
        <g transform="translate(500, 360)">
          <!-- J 1 (Jub) -->
          <path d="M -180,90 C -215,90 -235,65 -230,35 C -222,5 -195,-15 -160,-15 C -110,-15 -45,15 45,22 C 125,28 205,48 245,62 C 175,48 95,38 15,38 C -65,38 -115,55 -145,80 C -152,86 -162,90 -180,90 Z" fill="#0F172A"/>

          <!-- J 2 (Jubal) -->
          <path d="M -200,15 C -235,15 -255,-10 -250,-40 C -242,-70 -215,-90 -180,-90 C -125,-90 -55,-55 50,-45 C 135,-35 225,-15 270,2 C 190,-15 110,-25 20,-25 C -65,-25 -130,-8 -165,10 C -172,13 -182,15 -200,15 Z" fill="#0F172A"/>

          <!-- J 3 (Jubanti) -->
          <path d="M -220,-60 C -255,-60 -275,-85 -270,-115 C -262,-145 -235,-165 -200,-165 C -135,-165 -60,-125 60,-112 C 150,-102 245,-78 290,-60 C 205,-78 120,-92 25,-92 C -60,-92 -140,-72 -185,-58 C -192,-55 -202,-60 -220,-60 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="680" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="68" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="745" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="795" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">SOUVERAINETÉ • JUSTICE • PROSPÉRITÉ</text>
      </svg>
    `
  }
];

async function generate() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  
  for (const item of concepts) {
    const svgPath = path.join(targetDir, `${item.name}.svg`);
    const pngPath = path.join(targetDir, `${item.name}.png`);
    
    fs.writeFileSync(svgPath, item.svg.trim(), 'utf8');
    
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">${item.svg}</body></html>`);
    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Rendered: ${pngPath}`);
  }
  
  await browser.close();
  console.log('All no-star models rendered successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
