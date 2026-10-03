const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

const concepts = [
  {
    name: 'logo_jjj_criniere_45deg_aerodynamique',
    title: 'Modèle Félin 1 : La Crinière au Vent (3 J Aérodynamiques à 45°)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile Républicaine au Sommet de l'Élan -->
        <g transform="translate(680, 200)">
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,13 -20,26 -14,4 -32,-10 -10,-10" fill="#0F172A"/>
        </g>
        
        <!-- 3 J sculptés en crinière profilée de félin couché / au vent -->
        <g transform="translate(480, 390)">
          <!-- J 1 (Jub / Droiture) : Mèche inférieure, assise ferme et courbe féline douce -->
          <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#0F172A"/>
          
          <!-- J 2 (Jubal / Équité) : Mèche médiane, souplesse et force intérieure -->
          <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#0F172A"/>

          <!-- J 3 (Jubanti / Refondation) : Mèche supérieure, regard vers l'horizon -->
          <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">FORCE TRANQUILLE • VIGILANCE • ÉTHIQUE</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_leopard_regard_vigilant',
    title: 'Modèle Félin 2 : Le Profil Épuré du Léopard (Lignes & Regard)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile dans la direction du regard félin -->
        <g transform="translate(710, 290)">
          <polygon points="0,-30 9,-10 30,-10 13,4 19,24 0,12 -19,24 -13,4 -30,-10 -9,-10" fill="#0F172A"/>
        </g>
        
        <!-- Profil du Léopard / Panthère dont l'encolure et les babines dessinent JJJ -->
        <g transform="translate(480, 400)">
          <!-- Arc 1 (Mâchoire & Gorge féline) : J couché -->
          <path d="M -160,110 C -210,110 -230,70 -215,30 C -200,-5 -155,-20 -90,-20 C 0,-20 90,20 190,30 C 230,34 260,25 280,15 C 255,45 190,60 120,55 C 30,50 -40,30 -90,30 C -130,30 -160,45 -168,65 C -175,85 -155,95 -135,95 C -105,95 -50,65 20,40 L 30,70 C -40,95 -100,110 -160,110 Z" fill="#0F172A"/>
          
          <!-- Arc 2 (Nez & Arc frontal) : J couché médian -->
          <path d="M -190,20 C -240,20 -260,-20 -245,-60 C -230,-95 -185,-110 -120,-110 C -30,-110 60,-70 160,-60 C 200,-56 230,-65 250,-75 C 225,-45 160,-30 90,-35 C 0,-40 -70,-60 -120,-60 C -160,-60 -190,-45 -198,-25 C -205,-5 -185,5 -165,5 C -135,5 -80,-25 -10,-50 L 0,-20 C -70,5 -130,20 -190,20 Z" fill="#0F172A"/>

          <!-- Arc 3 (Oreille attentive & Crête de la nuque) : J supérieur couché -->
          <path d="M -220,-70 C -270,-70 -290,-110 -275,-150 C -260,-185 -215,-200 -150,-200 C -60,-200 30,-160 130,-150 C 150,-148 175,-170 190,-195 C 198,-170 190,-145 170,-130 C 130,-118 70,-120 0,-125 C -60,-130 -115,-145 -150,-145 C -190,-145 -220,-130 -228,-110 C -235,-90 -215,-80 -195,-80 C -165,-80 -110,-110 -40,-135 L -30,-105 C -100,-80 -160,-70 -220,-70 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">LE LÉOPARD DE PASTEF • SOUVERAINETÉ & DISCIPLINE</text>
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
  console.log('Reclined mane/feline designs rendered successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
