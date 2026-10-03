const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetDir = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\4edbf982-febd-4ee3-b721-e212e8f97747';

const concepts = [
  {
    name: 'logo_jjj_criniere_feline',
    title: 'Modèle 1 : La Crinière Féline JJJ (Force Tranquille & Sérénité)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile Nationale au Zénith -->
        <g transform="translate(680, 200)">
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,13 -20,26 -14,4 -32,-10 -10,-10" fill="#0F172A"/>
        </g>
        
        <!-- Emblème Félin Couché : 3 Mèches / Lignes JJJ sculptées comme une crinière ou l'échine du léopard -->
        <g transform="translate(480, 380)">
          <!-- Mèche 1 (Jub) : Mèche inférieure, crochet J à gauche, s'étire vers la droite en crinière couchée -->
          <path d="M -180,110 C -220,110 -240,75 -230,40 C -220,5 -185,-15 -145,-15 C -95,-15 -30,25 60,35 C -15,10 -80,-5 -125,-5 C -155,-5 -180,10 -185,35 C -190,55 -175,75 -150,75 C -115,75 -40,30 80,30 C 130,30 200,55 240,75 C 170,55 90,45 20,55 C -60,65 -130,110 -180,110 Z" fill="#0F172A"/>
          
          <!-- Mèche 2 (Jubal) : Mèche médiane couchée, courbe féline puissante et fluide -->
          <path d="M -210,35 C -250,35 -270,0 -260,-35 C -250,-70 -210,-90 -160,-90 C -100,-90 -20,-40 110,-30 C 20,-55 -60,-75 -120,-75 C -165,-75 -200,-55 -205,-30 C -210,-5 -190,12 -165,12 C -115,12 -30,-25 120,-25 C 180,-25 250,0 290,20 C 210,0 120,-10 40,0 C -50,12 -140,35 -210,35 Z" fill="#0F172A"/>

          <!-- Mèche 3 (Jubanti) : Mèche supérieure, profil noble du léopard/lion au vent -->
          <path d="M -240,-40 C -280,-40 -300,-75 -290,-110 C -280,-145 -230,-165 -170,-165 C -90,-165 0,-110 150,-95 C 40,-125 -50,-145 -120,-145 C -170,-145 -220,-125 -225,-100 C -230,-75 -205,-58 -180,-58 C -110,-58 -10,-95 160,-95 C 230,-95 300,-65 340,-45 C 250,-65 150,-75 60,-65 C -40,-52 -150,-40 -240,-40 Z" fill="#0F172A"/>
        </g>
        
        <!-- Typographie Institutionnelle Sereine & Bâtisseuse -->
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">FORCE TRANQUILLE • SOUVERAINETÉ • DIGNITÉ</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_profil_leopard_minimal',
    title: 'Modèle 2 : Le Léopard Vigilant & le Triptyque JJJ (Totem PASTEF)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Profil du Léopard / Panthère stylisé en 3 lignes JJJ couchées -->
        <g transform="translate(480, 370)">
          <!-- Silhouette de tête féline stylisée en aplat négatif / positif épuré -->
          <!-- Museau et mâchoire noble du félin (vigilance & force) -->
          <path d="M 180,-10 C 190,-10 210,0 230,15 C 240,22 250,35 240,50 C 230,62 210,65 190,62 C 160,58 130,55 100,58 C 50,62 0,85 -60,110 C -120,135 -170,140 -210,130 C -240,122 -260,95 -250,65 C -240,35 -210,25 -180,35 C -150,45 -110,40 -60,25 C 0,8 80,-10 180,-10 Z" fill="#0F172A"/>
          
          <!-- Mèche / Onde 2 : L'oeil et l'arc frontal du félin -->
          <path d="M 120,-80 C 150,-70 190,-40 210,-20 C 190,-15 160,-25 130,-35 C 80,-52 10,-45 -60,-25 C -130,-5 -190,10 -230,-10 C -255,-22 -265,-50 -250,-75 C -235,-100 -205,-105 -180,-92 C -150,-78 -105,-80 -50,-88 C 10,-96 70,-90 120,-80 Z" fill="#0F172A"/>

          <!-- Mèche / Onde 3 : L'oreille dressée et la nuque couchée du léopard -->
          <path d="M 40,-170 C 65,-215 90,-210 110,-175 C 120,-155 130,-135 150,-120 C 130,-120 100,-130 80,-140 C 40,-160 -10,-155 -70,-145 C -145,-132 -210,-120 -250,-145 C -275,-160 -280,-188 -260,-205 C -240,-222 -210,-220 -185,-205 C -150,-185 -90,-182 -30,-185 C 0,-186 25,-180 40,-170 Z" fill="#0F172A"/>
          
          <!-- Étoile du regard républicain -->
          <polygon points="175,-48 181,-35 195,-35 183,-25 187,-12 175,-20 163,-12 167,-25 155,-35 169,-35" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">VIGILANCE • ÉTHIQUE • VISION SÉNÉGAL 2050</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_ondes_couchées',
    title: 'Modèle 3 : Les 3 Ondes Couchées (L\'Échine Féline & l\'Élan Pacifique)',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Étoile au-dessus de l'horizon -->
        <g transform="translate(680, 210)">
          <polygon points="0,-32 10,-10 32,-10 14,4 20,26 0,13 -20,26 -14,4 -32,-10 -10,-10" fill="#0F172A"/>
        </g>
        
        <!-- 3 Rubans en « J » couchés horizontalement de gauche à droite (Douceur, Aérodynamisme, Sérénité) -->
        <g transform="translate(480, 390)">
          <!-- Ruban J 1 (Jub) : La base stable -->
          <path d="M -220,110 C -255,110 -275,85 -270,55 C -265,25 -240,5 -205,5 C -170,5 -145,25 -115,45 C -75,70 10,75 120,65 C 180,60 230,45 270,30 C 230,55 170,75 110,82 C 0,92 -80,90 -125,70 C -155,55 -175,45 -195,45 C -215,45 -225,58 -225,72 C -225,85 -215,92 -200,92 C -175,92 -135,75 -80,50 L -70,75 C -120,100 -170,110 -220,110 Z" fill="#0F172A"/>
          
          <!-- Ruban J 2 (Jubal) : L'équilibre central -->
          <path d="M -180,20 C -215,20 -235,-5 -230,-35 C -225,-65 -200,-85 -165,-85 C -130,-85 -105,-65 -75,-45 C -35,-20 50,-15 160,-25 C 220,-30 270,-45 310,-60 C 270,-35 210,-15 150,-8 C 40,2 -40,0 -85,-20 C -115,-35 -135,-45 -155,-45 C -175,-45 -185,-32 -185,-18 C -185,-5 -175,2 -160,2 C -135,2 -95,-15 -40,-40 L -30,-15 C -80,10 -130,20 -180,20 Z" fill="#0F172A"/>
          
          <!-- Ruban J 3 (Jubanti) : L'impulsion supérieure -->
          <path d="M -140,-70 C -175,-70 -195,-95 -190,-125 C -185,-155 -160,-175 -125,-175 C -90,-175 -65,-155 -35,-135 C 5,-110 90,-105 200,-115 C 260,-120 310,-135 350,-150 C 310,-125 250,-105 190,-98 C 80,-88 0,-90 -45,-110 C -75,-125 -95,-135 -115,-135 C -135,-135 -145,-122 -145,-108 C -145,-95 -135,-88 -120,-88 C -95,-88 -55,-105 0,-130 L 10,-105 C -40,-80 -90,-70 -140,-70 Z" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">L'ÉLAN APAISÉ • TRANSFORMATION TRANQUILLE</text>
      </svg>
    `
  },
  {
    name: 'logo_jjj_feline_p_emblem',
    title: 'Modèle 4 : Le « P » Félin & les 3 Rayons Couchés',
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
        <rect width="1000" height="1000" fill="#FFFFFF"/>
        
        <!-- Emblème unissant le P du Projet et les 3 crins félins couchés -->
        <g transform="translate(480, 380)">
          <!-- La Hampe du P : Colonne solide et droite (Jub / Intégrité) -->
          <path d="M -160,-200 L -100,-200 L -100,160 C -100,195 -125,215 -160,215 C -195,215 -220,195 -220,160 L -160,160 Z" fill="#0F172A"/>
          
          <!-- L'Arche du P qui s'ouvre en crinière couchée vers la droite -->
          <path d="M -100,-200 C 0,-200 120,-160 180,-100 C 230,-50 240,20 190,70 C 140,110 50,120 -100,120 L -100,60 C 20,60 90,50 130,20 C 160,-5 160,-50 120,-85 C 80,-120 0,-140 -100,-140 Z" fill="#0F172A"/>
          
          <!-- 3 Lignes aérodynamiques félines horizontales intérieures (JJJ) -->
          <path d="M -70,-80 C 10,-80 80,-65 140,-40 C 80,-45 10,-55 -70,-55 Z" fill="#0F172A"/>
          <path d="M -70,-20 C 0,-20 60,-10 110,10 C 60,3 0,-5 -70,-5 Z" fill="#0F172A"/>
          <path d="M -70,40 C -10,40 40,48 80,62 C 40,55 -10,50 -70,50 Z" fill="#0F172A"/>

          <!-- Étoile Républicaine -->
          <polygon points="120,-160 129,-140 151,-140 133,-127 139,-106 120,-118 101,-106 107,-127 89,-140 111,-140" fill="#0F172A"/>
        </g>
        
        <text x="500" y="700" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="64" font-weight="900" fill="#0F172A" letter-spacing="8">LE PROJET</text>
        <text x="500" y="765" text-anchor="middle" font-family="'Outfit', 'Inter', -apple-system, sans-serif" font-size="28" font-weight="700" fill="#1E293B" letter-spacing="10">JUB • JUBAL • JUBANTI</text>
        <text x="500" y="815" text-anchor="middle" font-family="'Inter', sans-serif" font-size="16" font-weight="600" fill="#64748B" letter-spacing="6">PASTEF • ÉTHIQUE • SOUVERAINETÉ NATIONALE</text>
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
  console.log('All feline/mane JJJ models rendered successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
