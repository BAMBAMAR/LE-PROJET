const fs = require('fs');
const path = require('path');

const brandKitHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PROJETBI — Charte Graphique & Kit de Marque Officiel</title>
  <meta name="description" content="Kit de marque officiel et charte graphique de PROJETBI : emblème JJJ, déclinaisons sur fond blanc, typographies et palette chromatique officielle.">
  <link rel="icon" type="image/png" href="favicon_blanc_squircle.png">
  
  <!-- Polices Google Fonts Officielles -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Syne:wght@700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

  <style>
    :root {
      --brand-green: #2D5F3F;
      --brand-forest: #1A3D28;
      --brand-gold: #C9A84C;
      --brand-gold-light: #F4E8C1;
      --brand-red: #B23A3A;
      --brand-slate: #4A5B52;
      --bg-page: #F7FAF7;
      --bg-surface: #FFFFFF;
      --bg-surface-subtle: #EEF4EE;
      --border-subtle: #DDE6DD;
      --border-accent: rgba(201, 168, 76, 0.4);
      --text-main: #121D15;
      --text-muted: #4A5B52;
      --radius-lg: 16px;
      --radius-md: 10px;
      --shadow-sm: 0 2px 8px rgba(18, 30, 20, 0.04);
      --shadow-md: 0 10px 30px rgba(18, 30, 20, 0.07);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg-page);
      color: var(--text-main);
      font-family: 'Inter', -apple-system, sans-serif;
      line-height: 1.6;
      padding-bottom: 5rem;
    }

    /* Top Sticky Bar */
    .top-nav {
      position: sticky;
      top: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      z-index: 100;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .top-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--brand-forest);
    }
    .top-brand img {
      width: 36px;
      height: 36px;
      border-radius: 9px;
      border: 1.5px solid var(--brand-gold);
      background: #FFFFFF;
      padding: 2px;
    }
    .top-brand-text {
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 1.15rem;
      letter-spacing: -0.01em;
    }
    .top-links {
      display: flex;
      gap: 1.25rem;
      list-style: none;
    }
    .top-links a {
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-weight: 600;
      transition: color 0.2s;
    }
    .top-links a:hover { color: var(--brand-green); }
    .top-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .container { max-width: 1240px; margin: 0 auto; padding: 0 1.5rem; }

    /* Header Hero */
    header.hero-header {
      padding: 4.5rem 0 3.5rem;
      text-align: center;
      position: relative;
    }
    .flag-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: #FFFFFF;
      border: 1.5px solid var(--border-accent);
      padding: 0.45rem 1.1rem;
      border-radius: 30px;
      font-size: 0.82rem;
      font-weight: 800;
      color: var(--brand-green);
      letter-spacing: 0.05em;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow-sm);
    }
    .flag-bar {
      width: 24px;
      height: 10px;
      display: flex;
      border-radius: 2px;
      overflow: hidden;
    }
    .flag-bar div { flex: 1; height: 100%; }
    .hero-title {
      font-family: 'Syne', sans-serif;
      font-size: 3.4rem;
      font-weight: 900;
      color: var(--brand-forest);
      letter-spacing: -0.02em;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-family: 'Crimson Pro', Georgia, serif;
      font-size: 1.55rem;
      font-style: italic;
      color: var(--brand-gold);
      font-weight: 700;
      margin-bottom: 1.25rem;
    }
    .hero-desc {
      color: var(--text-muted);
      font-size: 1.05rem;
      max-width: 780px;
      margin: 0 auto 2.5rem;
      line-height: 1.7;
    }

    /* Section Headings */
    .section-wrap { margin-bottom: 4.5rem; }
    .section-header {
      margin-bottom: 2rem;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-bottom: 1.5px solid var(--border-subtle);
      padding-bottom: 1rem;
    }
    .section-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--brand-forest);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .section-desc {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-top: 0.35rem;
    }

    /* Cards Grid */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.75rem;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
      gap: 2rem;
    }
    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .hero-title { font-size: 2.4rem; }
    }

    .brand-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
      position: relative;
    }
    .brand-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      border-color: var(--border-accent);
    }
    .card-badge-top {
      display: inline-block;
      align-self: flex-start;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.25rem 0.65rem;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    .badge-primary { background: rgba(45, 95, 63, 0.1); color: var(--brand-green); }
    .badge-forest { background: rgba(26, 61, 40, 0.1); color: var(--brand-forest); }
    .badge-gold { background: rgba(201, 168, 76, 0.15); color: #8F7223; }

    /* Visual Preview Frames */
    .visual-frame {
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1.5rem;
      margin-bottom: 1.25rem;
      min-height: 180px;
      border: 1px solid var(--border-subtle);
      position: relative;
    }
    .visual-frame.white-bg { background: #FFFFFF; }
    .visual-frame.transparent-bg {
      background-color: #FFFFFF;
      background-image: 
        linear-gradient(45deg, #F0F2F0 25%, transparent 25%), 
        linear-gradient(-45deg, #F0F2F0 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #F0F2F0 75%), 
        linear-gradient(-45deg, transparent 75%, #F0F2F0 75%);
      background-size: 20px 20px;
      background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    }
    .visual-frame.forest-bg {
      background: var(--brand-forest);
    }
    .visual-frame img {
      max-width: 100%;
      height: auto;
      max-height: 130px;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.06));
    }

    .card-meta-title {
      font-family: 'Syne', sans-serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--brand-forest);
      margin-bottom: 0.35rem;
    }
    .card-meta-desc {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      flex-grow: 1;
    }
    .card-specs {
      list-style: none;
      font-size: 0.82rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      border-top: 1px solid var(--border-subtle);
      padding-top: 0.85rem;
    }
    .card-specs li {
      display: flex;
      justify-content: space-between;
      padding: 0.25rem 0;
    }
    .card-specs strong { color: var(--text-main); }

    /* Action Buttons */
    .btn-row {
      display: flex;
      gap: 0.6rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.65rem 1.1rem;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.15s ease;
      flex: 1;
    }
    .btn-primary {
      background: var(--brand-green);
      color: #FFFFFF;
      border: 1.5px solid var(--brand-green);
    }
    .btn-primary:hover {
      background: var(--brand-forest);
      border-color: var(--brand-forest);
      transform: translateY(-1px);
    }
    .btn-outline {
      background: #FFFFFF;
      color: var(--brand-forest);
      border: 1.5px solid var(--border-subtle);
    }
    .btn-outline:hover {
      border-color: var(--brand-gold);
      color: var(--brand-green);
      background: var(--bg-surface-subtle);
    }
    .btn-gold {
      background: var(--brand-gold);
      color: #0A1C11;
      border: 1.5px solid var(--brand-gold);
    }
    .btn-gold:hover {
      background: #DFBE63;
      transform: translateY(-1px);
    }

    /* Colors Section */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
    }
    .color-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .color-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
    }
    .color-swatch {
      height: 110px;
      width: 100%;
      position: relative;
    }
    .color-copy-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(255,255,255,0.85);
      border: none;
      border-radius: 6px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .color-card:hover .color-copy-btn { opacity: 1; }
    .color-info {
      padding: 1rem;
    }
    .color-name {
      font-weight: 800;
      font-size: 0.92rem;
      color: var(--brand-forest);
      margin-bottom: 0.2rem;
    }
    .color-role {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 0.6rem;
    }
    .color-hex {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--text-main);
      display: block;
      background: var(--bg-surface-subtle);
      padding: 0.3rem 0.5rem;
      border-radius: 4px;
      text-align: center;
    }

    /* Typo Section */
    .typo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .typo-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 1.5rem;
    }
    .typo-sample {
      font-size: 2.2rem;
      line-height: 1.1;
      margin: 0.8rem 0;
      color: var(--brand-forest);
    }

    /* Social Covers */
    .cover-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1.75rem;
      box-shadow: var(--shadow-sm);
    }
    .cover-img-preview {
      width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid var(--border-subtle);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      margin-bottom: 1.25rem;
      display: block;
    }

    /* Toast Notification */
    .toast-pill {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--brand-forest);
      color: #FFFFFF;
      padding: 0.8rem 1.5rem;
      border-radius: 50px;
      font-weight: 700;
      font-size: 0.9rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      z-index: 9999;
      display: none;
      animation: slideUp 0.3s ease;
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  </style>
</head>
<body>

  <!-- Top Sticky Navigation -->
  <nav class="top-nav">
    <a href="./brand_kit.html" class="top-brand">
      <img src="favicon_blanc_squircle.svg" alt="Logo PROJETBI">
      <span class="top-brand-text">PROJETBI BRAND KIT</span>
    </a>
    <ul class="top-links">
      <li><a href="#logos-officiels">Logotypes</a></li>
      <li><a href="#palette-couleurs">Couleurs</a></li>
      <li><a href="#typographies">Typographies</a></li>
      <li><a href="#bannieres-sociales">Réseaux Sociaux</a></li>
      <li><a href="#charte-doctrine">Doctrine & JJJ</a></li>
    </ul>
    <div class="top-actions">
      <a href="../../admin.html" class="btn btn-outline" style="font-size:0.8rem;padding:0.4rem 0.9rem;">
        <i class="fas fa-gear"></i> Administration
      </a>
      <a href="../../index.html" class="btn btn-primary" style="font-size:0.8rem;padding:0.4rem 0.9rem;">
        <i class="fas fa-external-link-alt"></i> Voir le site
      </a>
    </div>
  </nav>

  <div class="container">

    <!-- Header Hero -->
    <header class="hero-header">
      <div class="flag-pill">
        <div class="flag-bar">
          <div style="background:#00853F"></div>
          <div style="background:#FDEF42"></div>
          <div style="background:#E31B23"></div>
        </div>
        <span>RÉPUBLIQUE DU SÉNÉGAL • IDENTITÉ OFFICIELLE</span>
      </div>
      <h1 class="hero-title">Charte Graphique & Kit de Marque</h1>
      <p class="hero-subtitle">« Pour un Sénégal Souverain, Juste et Prospère »</p>
      <p class="hero-desc">
        Bienvenue sur le portail officiel de l'identité visuelle de <strong>PROJETBI</strong>. Vous y trouverez l'emblème aérodynamique <strong>JJJ</strong> (Jub, Jubal, Jubanti), les déclinaisons multi-formats sur <strong>fond blanc pur</strong>, le nuancier chromatique institutionnel et les fichiers haute résolution téléchargeables en SVG vectoriel et PNG HD.
      </p>
    </header>

    <!-- SECTION 1 : LOGOTYPE HORIZONTAL (RÉFÉRENCE MASTER) -->
    <section class="section-wrap" id="logos-officiels">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-layer-group" style="color:var(--brand-green)"></i> 1. Logotype Horizontal Master (1500 × 450)</h2>
          <p class="section-desc">Format principal de référence pour les en-têtes web, documents institutionnels, bannières et signatures.</p>
        </div>
      </div>

      <div class="grid-3">
        <!-- 1.1 Fond Blanc Pur -->
        <div class="brand-card">
          <span class="card-badge-top badge-primary">⭐ Version Officielle de Référence</span>
          <div class="visual-frame white-bg">
            <img src="logo_projetbi_horizontal_blanc.svg" alt="PROJETBI Horizontal Fond Blanc">
          </div>
          <h3 class="card-meta-title">Logo Horizontal — Fond Blanc Pur</h3>
          <p class="card-meta-desc">Usage privilégié sur le site web, les fonds clairs, courriers officiels, présentations et publications citoyennes.</p>
          <ul class="card-specs">
            <li><span>Fond :</span> <strong>Blanc Pur (#FFFFFF)</strong></li>
            <li><span>Résolution PNG :</span> <strong>1500 × 450 px HD</strong></li>
            <li><span>Vectoriel :</span> <strong>SVG Scalable infini</strong></li>
          </ul>
          <div class="btn-row">
            <a href="logo_projetbi_horizontal_blanc.svg" download="logo_projetbi_horizontal_blanc.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_horizontal_blanc.png" download="logo_projetbi_horizontal_blanc.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>

        <!-- 1.2 Fond Transparent -->
        <div class="brand-card">
          <span class="card-badge-top badge-gold">Usage Universel Détouré</span>
          <div class="visual-frame transparent-bg">
            <img src="logo_projetbi_horizontal_transparent.svg" alt="PROJETBI Horizontal Transparent">
          </div>
          <h3 class="card-meta-title">Logo Horizontal — Fond Transparent</h3>
          <p class="card-meta-desc">Idéal pour l'incrustation directe sur photographies, vidéos, présentations PowerPoint ou fonds colorés neutres.</p>
          <ul class="card-specs">
            <li><span>Fond :</span> <strong>Transparent (Alpha 100%)</strong></li>
            <li><span>Résolution PNG :</span> <strong>1500 × 450 px HD</strong></li>
            <li><span>Typographie :</span> <strong>Vert Forêt & Or</strong></li>
          </ul>
          <div class="btn-row">
            <a href="logo_projetbi_horizontal_transparent.svg" download="logo_projetbi_horizontal_transparent.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_horizontal_transparent.png" download="logo_projetbi_horizontal_transparent.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>

        <!-- 1.3 Fond Vert Forêt -->
        <div class="brand-card">
          <span class="card-badge-top badge-forest">Déclinaison Sombre Solennelle</span>
          <div class="visual-frame forest-bg">
            <img src="logo_projetbi_horizontal_vert_foret.svg" alt="PROJETBI Horizontal Vert Forêt">
          </div>
          <h3 class="card-meta-title">Logo Horizontal — Fond Vert Forêt</h3>
          <p class="card-meta-desc">Version institutionnelle sur fond Vert Forêt profond (#1A3D28) avec lettrage blanc et or pour les supports officiels.</p>
          <ul class="card-specs">
            <li><span>Fond :</span> <strong>Vert Forêt (#1A3D28)</strong></li>
            <li><span>Résolution PNG :</span> <strong>1500 × 450 px HD</strong></li>
            <li><span>Contraste :</span> <strong>Typo Blanche & Or</strong></li>
          </ul>
          <div class="btn-row">
            <a href="logo_projetbi_horizontal_vert_foret.svg" download="logo_projetbi_horizontal_vert_foret.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_horizontal_vert_foret.png" download="logo_projetbi_horizontal_vert_foret.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2 : LOGOTYPE VERTICAL / CARRÉ (1000 × 1000) -->
    <section class="section-wrap">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-square" style="color:var(--brand-gold)"></i> 2. Logotype Vertical & Format Carré (1000 × 1000)</h2>
          <p class="section-desc">Format optimisé pour les affiches verticales, roll-ups, avatars carrés et vignettes de partage.</p>
        </div>
      </div>

      <div class="grid-3">
        <!-- 2.1 Vertical Fond Blanc -->
        <div class="brand-card">
          <span class="card-badge-top badge-primary">⚪ Fond Blanc Pur</span>
          <div class="visual-frame white-bg">
            <img src="logo_projetbi_vertical_blanc.svg" alt="PROJETBI Vertical Fond Blanc">
          </div>
          <h3 class="card-meta-title">Logo Vertical — Fond Blanc</h3>
          <p class="card-meta-desc">Disposition centrée du symbole JJJ surmontant le nom de marque et le slogan pour supports imprimés et affiches.</p>
          <div class="btn-row">
            <a href="logo_projetbi_vertical_blanc.svg" download="logo_projetbi_vertical_blanc.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_vertical_blanc.png" download="logo_projetbi_vertical_blanc.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>

        <!-- 2.2 Vertical Transparent -->
        <div class="brand-card">
          <span class="card-badge-top badge-gold">✨ Fond Transparent</span>
          <div class="visual-frame transparent-bg">
            <img src="logo_projetbi_vertical_transparent.svg" alt="PROJETBI Vertical Transparent">
          </div>
          <h3 class="card-meta-title">Logo Vertical — Détouré</h3>
          <p class="card-meta-desc">Format sans fond pour impression sur textile, goodies, casquettes, badges et kakémonos.</p>
          <div class="btn-row">
            <a href="logo_projetbi_vertical_transparent.svg" download="logo_projetbi_vertical_transparent.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_vertical_transparent.png" download="logo_projetbi_vertical_transparent.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>

        <!-- 2.3 Vertical Vert Forêt -->
        <div class="brand-card">
          <span class="card-badge-top badge-forest">🟢 Fond Vert Forêt</span>
          <div class="visual-frame forest-bg">
            <img src="logo_projetbi_vertical_vert_foret.svg" alt="PROJETBI Vertical Vert Forêt">
          </div>
          <h3 class="card-meta-title">Logo Vertical — Vert Forêt</h3>
          <p class="card-meta-desc">Composition solennelle sur fond vert institutionnel avec devise en blanc et or républicain.</p>
          <div class="btn-row">
            <a href="logo_projetbi_vertical_vert_foret.svg" download="logo_projetbi_vertical_vert_foret.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG
            </a>
            <a href="logo_projetbi_vertical_vert_foret.png" download="logo_projetbi_vertical_vert_foret.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3 : MACARONS, FAVICONS & SYMBOLE SEUL -->
    <section class="section-wrap">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-certificate" style="color:var(--brand-green)"></i> 3. Macarons d'Application & Symbole JJJ Seul</h2>
          <p class="section-desc">Éléments graphiques autonomes pour icônes mobiles, favicons web, pastilles et tampons officiels.</p>
        </div>
      </div>

      <div class="grid-2">
        <!-- Favicon Squircle -->
        <div class="brand-card">
          <span class="card-badge-top badge-primary">📱 Macaron Web & Mobile Officiel</span>
          <div class="visual-frame white-bg" style="min-height: 220px;">
            <img src="favicon_blanc_squircle.svg" alt="Favicon Blanc Squircle" style="width: 140px; height: 140px;">
          </div>
          <h3 class="card-meta-title">Macaron Squircle Fond Blanc (512 × 512)</h3>
          <p class="card-meta-desc">L'icône déployée sur tout le site internet ([index.html], [admin.html]), dans les manifestes PWA et les favoris des navigateurs. Intègre une bordure subtile aux reflets d'or républicain.</p>
          <div class="btn-row">
            <a href="favicon_blanc_squircle.svg" download="favicon_blanc_squircle.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG Vectoriel
            </a>
            <a href="favicon_blanc_squircle.png" download="favicon_blanc_squircle.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD (512×512)
            </a>
          </div>
        </div>

        <!-- Symbole JJJ Seul -->
        <div class="brand-card">
          <span class="card-badge-top badge-gold">🦅 Emblème JJJ Pur (600 × 600)</span>
          <div class="visual-frame white-bg" style="min-height: 220px;">
            <img src="logo_projetbi_symbole_seul_blanc.svg" alt="Symbole JJJ Seul" style="width: 140px; height: 140px;">
          </div>
          <h3 class="card-meta-title">Emblème JJJ Seul — Fond Blanc</h3>
          <p class="card-meta-desc">Le symbole pur sans texte : les 3 J aérodynamiques inspirés de la crinière du lion et du totem félin de PASTEF, sans étoile, matérialisant Jub, Jubal et Jubanti.</p>
          <div class="btn-row">
            <a href="logo_projetbi_symbole_seul_blanc.svg" download="logo_projetbi_symbole_seul_blanc.svg" class="btn btn-primary">
              <i class="fas fa-bezier-curve"></i> SVG Vectoriel
            </a>
            <a href="logo_projetbi_symbole_seul_blanc.png" download="logo_projetbi_symbole_seul_blanc.png" class="btn btn-outline">
              <i class="fas fa-image"></i> PNG HD (600×600)
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4 : PALETTE CHROMATIQUE OFFICIELLE -->
    <section class="section-wrap" id="palette-couleurs">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-palette" style="color:var(--brand-gold)"></i> 4. Nuancier Chromatique Officiel & Tokens</h2>
          <p class="section-desc">Les 6 teintes institutionnelles du design system ProjetBI. Cliquez sur une carte pour copier son code HEX.</p>
        </div>
      </div>

      <div class="color-grid">
        <!-- Vert PASTEF -->
        <div class="color-card" onclick="copyColor('#2D5F3F')">
          <div class="color-swatch" style="background:#2D5F3F;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Vert PASTEF</div>
            <div class="color-role">Droiture • Souveraineté</div>
            <span class="color-hex">#2D5F3F</span>
          </div>
        </div>

        <!-- Vert Forêt -->
        <div class="color-card" onclick="copyColor('#1A3D28')">
          <div class="color-swatch" style="background:#1A3D28;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Vert Forêt Profond</div>
            <div class="color-role">Fond institutionnel</div>
            <span class="color-hex">#1A3D28</span>
          </div>
        </div>

        <!-- Or Républicain -->
        <div class="color-card" onclick="copyColor('#C9A84C')">
          <div class="color-swatch" style="background:#C9A84C;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Or Républicain</div>
            <div class="color-role">Justice • Équité</div>
            <span class="color-hex">#C9A84C</span>
          </div>
        </div>

        <!-- Rouge Patriotique -->
        <div class="color-card" onclick="copyColor('#B23A3A')">
          <div class="color-swatch" style="background:#B23A3A;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Rouge Patriotique</div>
            <div class="color-role">Jubanti • Redressement</div>
            <span class="color-hex">#B23A3A</span>
          </div>
        </div>

        <!-- Blanc Pur -->
        <div class="color-card" onclick="copyColor('#FFFFFF')">
          <div class="color-swatch" style="background:#FFFFFF;border-bottom:1px solid #eee;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Blanc Pur</div>
            <div class="color-role">Fond de référence</div>
            <span class="color-hex">#FFFFFF</span>
          </div>
        </div>

        <!-- Ardoise Muted -->
        <div class="color-card" onclick="copyColor('#4A5B52')">
          <div class="color-swatch" style="background:#4A5B52;">
            <button class="color-copy-btn" title="Copier"><i class="fas fa-copy"></i></button>
          </div>
          <div class="color-info">
            <div class="color-name">Ardoise Texte</div>
            <div class="color-role">Sous-titres & Contraste</div>
            <span class="color-hex">#4A5B52</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5 : TYPOGRAPHIES OFFICIELLES -->
    <section class="section-wrap" id="typographies">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-font" style="color:var(--brand-green)"></i> 5. Typographies Officielles</h2>
          <p class="section-desc">Hiérarchie typographique assurant élégance, autorité républicaine et lisibilité numérique.</p>
        </div>
      </div>

      <div class="typo-grid">
        <div class="typo-card">
          <span class="card-badge-top badge-primary">Logotype & Titres Majeurs</span>
          <div class="typo-sample" style="font-family:'Syne',sans-serif;font-weight:900;">PROJETBI</div>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.5rem"><strong>Police : Syne (Weights: 800, 900)</strong></p>
          <p style="font-size:0.8rem;color:var(--text-muted)">Caractère géométrique robuste conférant impact, modernité et assise républicaine.</p>
        </div>

        <div class="typo-card">
          <span class="card-badge-top badge-gold">Citations & Préambules</span>
          <div class="typo-sample" style="font-family:'Crimson Pro',serif;font-style:italic;font-weight:700;color:var(--brand-gold)">Jub · Jubal · Jubanti</div>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.5rem"><strong>Police : Crimson Pro (Italic, 700)</strong></p>
          <p style="font-size:0.8rem;color:var(--text-muted)">Sérif classique et solennel pour les devises constitutionnelles, citations et manifestes.</p>
        </div>

        <div class="typo-card">
          <span class="card-badge-top badge-forest">Interface & Lecture Courante</span>
          <div class="typo-sample" style="font-family:'Inter',sans-serif;font-weight:700;font-size:1.8rem">Sénégal Souverain</div>
          <p style="font-size:0.88rem;color:var(--text-muted);margin-bottom:0.5rem"><strong>Police : Inter & Plus Jakarta Sans</strong></p>
          <p style="font-size:0.8rem;color:var(--text-muted)">Haute lisibilité sur tous écrans pour les descriptions, fiches d'engagements et actualités.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 6 : ASSETS RÉSEAUX SOCIAUX DÉPLOYABLES -->
    <section class="section-wrap" id="bannieres-sociales">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-share-nodes" style="color:var(--brand-green)"></i> 6. Assets Prêts pour les Réseaux Sociaux</h2>
          <p class="section-desc">Bannières et avatars officiels pour Facebook, Twitter/X, LinkedIn, WhatsApp et TikTok.</p>
        </div>
      </div>

      <div class="grid-2">
        <!-- Couverture Facebook -->
        <div class="cover-card">
          <span class="card-badge-top badge-primary">Couverture Officielle (1640 × 624)</span>
          <img src="facebook_cover_clean.png" alt="Bannière Facebook PROJETBI" class="cover-img-preview">
          <h3 class="card-meta-title">Bannière Réseaux Sociaux — Observatoire Citoyen</h3>
          <p class="card-meta-desc">Format officiel pour la page Facebook « ProjetBI », LinkedIn et Twitter. Présente le logo fond blanc, la devise et les 300 engagements.</p>
          <a href="facebook_cover_clean.png" download="facebook_cover_projetbi_officielle.png" class="btn btn-primary" style="width:100%">
            <i class="fas fa-download"></i> Télécharger la Couverture HD (1640×624)
          </a>
        </div>

        <!-- Avatar Master -->
        <div class="cover-card">
          <span class="card-badge-top badge-gold">Photo de Profil Master (1080 × 1080)</span>
          <div style="text-align:center;padding:1rem 0;">
            <img src="projetbi_avatar_clean.png" alt="Photo de Profil PROJETBI" style="width:180px;height:180px;border-radius:50%;box-shadow:0 8px 24px rgba(0,0,0,0.1);margin:0 auto;display:block;">
          </div>
          <h3 class="card-meta-title" style="text-align:center">Avatar Rond Universel (1080 × 1080)</h3>
          <p class="card-meta-desc" style="text-align:center">Cercle de sécurité parfait pour Facebook, WhatsApp Business, Instagram, X et TikTok.</p>
          <a href="projetbi_avatar_clean.png" download="avatar_projetbi_officiel_1080.png" class="btn btn-primary" style="width:100%">
            <i class="fas fa-download"></i> Télécharger l'Avatar HD (1080×1080)
          </a>
        </div>
      </div>
    </section>

    <!-- SECTION 7 : DOCTRINE DE LA MARQUE & RECOMMANDATIONS -->
    <section class="section-wrap" id="charte-doctrine">
      <div class="section-header">
        <div>
          <h2 class="section-title"><i class="fas fa-book-bookmark" style="color:var(--brand-gold)"></i> 7. Doctrine Graphique & Règles d'Usage</h2>
          <p class="section-desc">Principes intangibles pour garantir la cohérence et l'intégrité de la marque citoyenne.</p>
        </div>
      </div>

      <div class="grid-2">
        <div class="brand-card">
          <h3 class="card-meta-title" style="color:var(--brand-green);margin-bottom:1rem"><i class="fas fa-check-circle"></i> Usages Autorisés & Recommandés</h3>
          <ul style="padding-left:1.25rem;font-size:0.9rem;color:var(--text-muted);line-height:1.8">
            <li><strong>Privilégier le fond blanc pur (#FFFFFF)</strong> pour assurer un contraste net et une perception institutionnelle.</li>
            <li>Respecter systématiquement l'ordre montant des trois J : <strong>Vert en bas (Jub), Or au milieu (Jubal), Rouge en haut (Jubanti)</strong>.</li>
            <li>Maintenir une <strong>zone d'exclusion</strong> minimale égale à la hauteur du symbole « J » autour du logo.</li>
            <li>Utiliser la version SVG vectorielle pour toute impression grand format ou affichage écran haute densité.</li>
          </ul>
        </div>

        <div class="brand-card">
          <h3 class="card-meta-title" style="color:var(--brand-red);margin-bottom:1rem"><i class="fas fa-times-circle"></i> Interdictions Strictes</h3>
          <ul style="padding-left:1.25rem;font-size:0.9rem;color:var(--text-muted);line-height:1.8">
            <li><strong>Ne jamais rajouter d'étoile</strong> à l'intérieur ou à côté de l'emblème JJJ.</li>
            <li>Ne pas déformer, comprimer ou étirer les proportions du logotype.</li>
            <li>Ne pas modifier les teintes officielles (ne pas substituer le Vert PASTEF par un vert fluo ou le Rouge par du rose).</li>
            <li>Ne pas remplacer la typographie du logotype « PROJETBI » par une autre police.</li>
          </ul>
        </div>
      </div>
    </section>

  </div>

  <!-- Toast Notification -->
  <div class="toast-pill" id="copyToast">
    <i class="fas fa-check-circle" style="color:var(--brand-gold)"></i> Code couleur copié dans le presse-papier !
  </div>

  <script>
    function copyColor(hex) {
      navigator.clipboard.writeText(hex).then(() => {
        const toast = document.getElementById('copyToast');
        toast.innerHTML = '<i class="fas fa-check-circle" style="color:#C9A84C"></i> ' + hex + ' copié dans le presse-papier !';
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2200);
      });
    }
  </script>
</body>
</html>
`;

fs.writeFileSync(path.resolve('assets/branding/brand_kit.html'), brandKitHtml, 'utf8');
console.log('brand_kit.html successfully rewritten into modern, luminous, comprehensive brand portal!');
