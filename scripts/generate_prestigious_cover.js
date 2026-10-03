const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1640, height: 624 } });
  const brandingDir = path.resolve('assets/branding');

  // Exact JJJ SVG Symbol definition from official asset (100% compliant, NO STARS)
  const jjjSvgCode = `
    <svg viewBox="0 0 512 512" style="width:100%;height:100%">
      <rect width="512" height="512" rx="112" fill="#FFFFFF"/>
      <rect x="8" y="8" width="496" height="496" rx="104" fill="none" stroke="#2D5F3F" stroke-width="8" stroke-opacity="0.18"/>
      <rect x="18" y="18" width="476" height="476" rx="94" fill="none" stroke="#C9A84C" stroke-width="5" stroke-opacity="0.35"/>
      <g transform="translate(256, 256) scale(0.92)">
        <path d="M -180,140 C -225,140 -255,105 -245,65 C -238,25 -205,0 -165,0 C -120,0 -80,25 -20,65 C 40,105 120,135 180,145 C 110,135 40,100 -20,65 C -70,30 -115,18 -150,18 C -180,18 -200,35 -205,58 C -210,80 -195,100 -170,100 C -135,100 -85,75 -30,45 L -20,75 C -75,115 -130,140 -180,140 Z" fill="#2D5F3F"/>
        <path d="M -130,45 C -175,45 -205,10 -195,-30 C -188,-70 -155,-95 -115,-95 C -70,-95 -30,-70 30,-30 C 90,10 170,40 230,50 C 160,40 90,5 30,-30 C -20,-65 -65,-77 -100,-77 C -130,-77 -150,-60 -155,-37 C -160,-15 -145,5 -120,5 C -85,5 -35,-20 20,-50 L 30,-20 C -25,20 -80,45 -130,45 Z" fill="#C9A84C"/>
        <path d="M -80,-50 C -125,-50 -155,-85 -145,-125 C -138,-165 -105,-190 -65,-190 C -20,-190 20,-165 80,-125 C 140,-85 220,-55 280,-45 C 210,-55 140,-90 80,-125 C 30,-160 -15,-172 -50,-172 C -80,-172 -100,-155 -105,-132 C -110,-110 -95,-90 -70,-90 C -35,-90 15,-115 70,-145 L 80,-115 C 25,-75 -30,-50 -80,-50 Z" fill="#B23A3A"/>
      </g>
    </svg>
  `;

  const coverHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,600;0,700;1,600;1,700&family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1640px;
      height: 624px;
      background: #FFFFFF;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 42px 75px 36px 75px;
    }
    
    /* Clean subtle Republican canvas */
    .bg-canvas {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 15% 30%, rgba(45, 95, 63, 0.05) 0%, transparent 45%),
        radial-gradient(ellipse at 85% 70%, rgba(201, 168, 76, 0.08) 0%, transparent 50%),
        linear-gradient(135deg, #FFFFFF 0%, #F9FAF8 100%);
      z-index: 0;
    }
    
    /* Tricolor Top Bar */
    .top-tricolor {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      display: flex;
      z-index: 10;
    }
    .top-tricolor .c1 { flex: 1; background: #00853F; }
    .top-tricolor .c2 { flex: 1; background: #FDEF42; }
    .top-tricolor .c3 { flex: 1; background: #E31B23; }

    /* Top Bar */
    .header-bar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .republic-pill {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1.5px solid rgba(45, 95, 63, 0.22);
      border-radius: 40px;
      padding: 8px 22px;
      box-shadow: 0 2px 10px rgba(18, 30, 20, 0.04);
    }
    .republic-flag {
      width: 24px;
      height: 15px;
      display: flex;
      border-radius: 3px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .republic-flag div { flex: 1; height: 100%; }
    .republic-pill-text {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #1A3D28;
      text-transform: uppercase;
    }
    .vision-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(201, 168, 76, 0.12);
      border: 1.5px solid rgba(201, 168, 76, 0.4);
      border-radius: 40px;
      padding: 8px 24px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.12em;
      color: #8F7223;
    }

    /* Central Content Grid */
    .main-body {
      position: relative;
      z-index: 2;
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 50px;
      align-items: center;
      margin: auto 0;
    }
    
    /* Left Brand Section */
    .brand-section {
      display: flex;
      align-items: center;
      gap: 34px;
    }
    .brand-mark {
      width: 180px;
      height: 180px;
      min-width: 180px;
      border-radius: 40px;
      box-shadow: 0 16px 40px rgba(26, 61, 40, 0.08), 0 2px 8px rgba(0,0,0,0.04);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-details {
      display: flex;
      flex-direction: column;
    }
    .brand-name {
      font-family: 'Outfit', sans-serif;
      font-size: 72px;
      font-weight: 900;
      color: #1A3D28;
      letter-spacing: 4px;
      line-height: 1;
      margin-bottom: 8px;
    }
    .brand-motto {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Outfit', sans-serif;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 6px;
      margin-bottom: 12px;
    }
    .brand-motto .dot {
      color: #94A3B8;
      font-size: 14px;
    }
    .brand-tagline {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 27px;
      font-style: italic;
      font-weight: 700;
      color: #2D5F3F;
      line-height: 1.25;
      letter-spacing: 0.5px;
    }

    /* Right Metrics Column */
    .metrics-col {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .metric-item {
      background: #FFFFFF;
      border: 1.5px solid rgba(220, 229, 220, 0.9);
      border-radius: 14px;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 4px 14px rgba(18, 30, 20, 0.03);
    }
    .metric-badge-icon {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .metric-val {
      font-family: 'Outfit', sans-serif;
      font-weight: 800;
      font-size: 18px;
      color: #1A3D28;
      letter-spacing: -0.01em;
      line-height: 1.2;
    }
    .metric-desc {
      font-size: 12.5px;
      color: #4A5B52;
      font-weight: 500;
      margin-top: 2px;
    }

    /* Bottom Bar */
    .footer-bar {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid rgba(220, 229, 220, 0.85);
      padding-top: 16px;
    }
    .footer-baseline {
      font-size: 14px;
      font-weight: 700;
      color: #4A5B52;
      letter-spacing: 0.03em;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .footer-baseline-badge {
      background: rgba(45, 95, 63, 0.1);
      color: #2D5F3F;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.06em;
    }
    .footer-link {
      background: #1A3D28;
      color: #FFFFFF;
      padding: 9px 26px;
      border-radius: 30px;
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.08em;
      box-shadow: 0 4px 14px rgba(26, 61, 40, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="bg-canvas"></div>
  <div class="top-tricolor">
    <div class="c1"></div>
    <div class="c2"></div>
    <div class="c3"></div>
  </div>

  <!-- Top Header -->
  <div class="header-bar">
    <div class="republic-pill">
      <div class="republic-flag">
        <div style="background:#00853F"></div>
        <div style="background:#FDEF42"></div>
        <div style="background:#E31B23"></div>
      </div>
      <span class="republic-pill-text">RÉPUBLIQUE DU SÉNÉGAL • OBSERVATOIRE CITOYEN</span>
    </div>
    <div class="vision-pill">
      <span>VISION SÉNÉGAL 2050</span>
    </div>
  </div>

  <!-- Main Body -->
  <div class="main-body">
    
    <!-- Left Hero Identity -->
    <div class="brand-section">
      <div class="brand-mark">
        ${jjjSvgCode}
      </div>
      <div class="brand-details">
        <div class="brand-name">PROJETBI</div>
        <div class="brand-motto">
          <span style="color:#2D5F3F">JUB</span>
          <span class="dot">•</span>
          <span style="color:#C9A84C">JUBAL</span>
          <span class="dot">•</span>
          <span style="color:#B23A3A">JUBANTI</span>
        </div>
        <div class="brand-tagline">
          « Pour un Sénégal Souverain, Juste et Prospère »
        </div>
      </div>
    </div>

    <!-- Right Metrics Column -->
    <div class="metrics-col">
      <div class="metric-item">
        <div class="metric-badge-icon" style="background:rgba(45,95,63,0.1);color:#2D5F3F;">
          <i class="fas fa-landmark"></i>
        </div>
        <div>
          <div class="metric-val">300 Engagements Suivis</div>
          <div class="metric-desc">Évaluation factuelle, transparente & citoyenne</div>
        </div>
      </div>

      <div class="metric-item">
        <div class="metric-badge-icon" style="background:rgba(201,168,76,0.14);color:#A67C19;">
          <i class="fas fa-chart-pie"></i>
        </div>
        <div>
          <div class="metric-val">15 Domaines Stratégiques</div>
          <div class="metric-desc">Économie, Justice, Souveraineté, Éducation</div>
        </div>
      </div>

      <div class="metric-item">
        <div class="metric-badge-icon" style="background:rgba(178,58,58,0.1);color:#B23A3A;">
          <i class="fas fa-scale-balanced"></i>
        </div>
        <div>
          <div class="metric-val">100% Indépendant</div>
          <div class="metric-desc">Plateforme civique d'intérêt général</div>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer Bar -->
  <div class="footer-bar">
    <div class="footer-baseline">
      <span class="footer-baseline-badge">OFFICIEL</span>
      <span>Plateforme de Suivi Citoyen du Projet de Transformation Nationale</span>
    </div>
    <div class="footer-link">
      <i class="fas fa-globe"></i> www.projetbi.org
    </div>
  </div>
</body>
</html>`;

  await page.setContent(coverHtml);
  // Wait for Google fonts and FontAwesome icons to load
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(brandingDir, 'facebook_cover_clean.png'), type: 'png' });
  console.log('Successfully generated prestigious facebook_cover_clean.png!');

  // Also update projetbi_avatar_clean.png (1080x1080)
  await page.setViewportSize({ width: 1080, height: 1080 });
  const avatarHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      width: 1080px;
      height: 1080px;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .ring {
      position: absolute;
      width: 1000px;
      height: 1000px;
      border-radius: 50%;
      border: 12px solid rgba(201, 168, 76, 0.45);
    }
    .squircle-box {
      width: 800px;
      height: 800px;
      border-radius: 175px;
      box-shadow: 0 20px 60px rgba(26,61,40,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
    }
  </style>
</head>
<body>
  <div class="ring"></div>
  <div class="squircle-box">
    ${jjjSvgCode}
  </div>
</body>
</html>`;

  await page.setContent(avatarHtml);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  await page.screenshot({ path: path.join(brandingDir, 'projetbi_avatar_clean.png'), type: 'png' });
  console.log('Successfully generated prestigious projetbi_avatar_clean.png (1080x1080)!');

  await browser.close();
})();
