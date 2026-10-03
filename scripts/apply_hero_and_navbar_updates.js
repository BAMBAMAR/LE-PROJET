const fs = require('fs');
const path = require('path');

console.log('--- Applying Navbar and Hero updates to index.html, actualites.html, and ideologie.html ---');

// 1. UPDATE INDEX.HTML
const indexPath = path.resolve('index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Backup
fs.writeFileSync(path.resolve('index.html.bak'), indexContent, 'utf8');

// 1.1 New Navbar Center Markup
const newNavCenter = `            <div class="nav-row-center">
              <div class="nav-kpi-under-logo">
                    <button class="nav-kpi-mini-btn" aria-label="KPI précédent" onclick="window.kpiPrevSlide()"><i class="fas fa-chevron-left" aria-hidden="true"></i></button>
                    <div id="navKpiDesktop" class="nav-kpi-mini-display">
                        <div id="kpiCarousel" class="hero-kpi-display">
                            <div class="kpi-item" style="display:flex;align-items:center;gap:0.45rem;">
                                <span class="kpi-icon" style="font-size:1.05rem;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">⭐</span>
                                <div class="kpi-content" style="display:flex;flex-direction:column;line-height:1.15;text-align:left;">
                                    <span class="kpi-value" style="font-weight:800;color:#FFFFFF;font-size:1.02rem;letter-spacing:-0.01em;">4.1</span>
                                    <span class="kpi-label" style="font-size:0.64rem;color:#A7F3D0;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">NOTE MOYENNE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button class="nav-kpi-mini-btn" aria-label="KPI suivant" onclick="window.kpiNextSlide()"><i class="fas fa-chevron-right" aria-hidden="true"></i></button>
                </div> 
                <span class="nav-tagline">
                    <i class="fas fa-shield-alt nav-tagline-shield"></i>
                    <strong class="nav-tagline-main">Gardiens du Projet PASTEF</strong>
                    <span class="nav-tagline-sub">— Jub · Jubal · Jubanti</span>
                </span>
              </div>`;

// Regex pour remplacer nav-row-center
const navRegex = /<div class="nav-row-center">[\s\S]*?<\/div>\s*<button class="hamburger"/;
if (navRegex.test(indexContent)) {
    indexContent = indexContent.replace(navRegex, newNavCenter + '\n            <button class="hamburger"');
    console.log('✓ Navbar center replaced in index.html');
} else {
    console.error('✗ Could not match nav-row-center in index.html');
}

// 1.2 New Hero V4 Section
const newHeroSection = `<section class="hero-section" id="accueil">
    <div class="hero-v4-container">
        <!-- Colonne Gauche : Titre, Explication & Mandat -->
        <div class="hero-left-v4">
            <div class="badge-pill-v4">
                <i class="fas fa-shield-alt" style="color:#F2D279"></i>
                <span class="gold-txt">Gardiens du Projet</span>
                <span>·</span>
                <span>Veille Citoyenne Indépendante</span>
            </div>

            <h1 class="hero-h1-v4">
                Suivi des Engagements de Bassirou Diomaye Faye
                <span class="highlight-v4">La Vision &amp; le Projet PASTEF</span>
            </h1>

            <p class="hero-p-v4">
                Nous suivons et documentons avec rigueur les engagements du Président <strong>Bassirou Diomaye Faye</strong> et la concrétisation de la vision souveraine du <strong>Projet PASTEF</strong> pour un Sénégal souverain, juste et prospère. <em>Jub, Jubal, Jubanti.</em>
            </p>

            <div class="hero-actions-v4">
                <a href="#dashboard" class="btn-gold-v4">
                    <i class="fas fa-chart-line"></i> Consulter l'état du Projet
                </a>
                <a href="Livre-Programme-Bassirou-Diomaye-Faye.pdf" class="btn-glass-v4" download target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-file-pdf"></i> Le Projet PASTEF (PDF)
                </a>
            </div>

            <!-- Bande Mandat Condensée & Dynamique -->
            <div class="mandate-strip-v4">
                <div class="mandate-stats-v4">
                    <div class="stat-unit-v4">
                        <span class="su-val" id="mandateDaysVal">911</span>
                        <span class="su-lbl">Jours restants</span>
                    </div>
                    <div style="width:1px;height:24px;background:rgba(255,255,255,0.15)"></div>
                    <div class="stat-unit-v4">
                        <span class="su-val" id="heroStatTotal">300</span>
                        <span class="su-lbl">Engagements</span>
                    </div>
                    <div style="width:1px;height:24px;background:rgba(255,255,255,0.15)"></div>
                    <div class="stat-unit-v4">
                        <span class="su-val" style="color:#4ADE80" id="heroStatRealise">26</span>
                        <span class="su-lbl">Réalisés</span>
                    </div>
                </div>

                <div class="mandate-jauge-v4">
                    <div class="jauge-bg">
                        <div class="jauge-fill" id="mandateJaugeFill" style="width: 46%;"></div>
                    </div>
                    <div class="jauge-meta">
                        <span>Mandat 2024–2029</span>
                        <span id="mandatePercentVal">46%</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Colonne Droite : Carte Institutionnelle Lumineuse -->
        <div class="hero-right-v4">
            <div class="hero-right-card-v4">
                <div class="hrc-top">
                    <span class="hrc-tag">
                        <i class="fas fa-shield-alt"></i> LE PROJET PASTEF 2024–2029
                    </span>
                    <span style="font-size: 1.15rem; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em;">SN</span>
                </div>

                <p class="quote-v4">
                    « Notre engagement solennel est de bâtir un Sénégal souverain, juste et prospère dans une Afrique en marche. »
                </p>

                <div class="author-box-v4">
                    <div class="author-v4-title">Bassirou Diomaye Faye</div>
                    <div class="author-v4-desc">Président de la République · Porteur du Projet PASTEF</div>
                </div>

                <div class="hrc-bottom">
                    <span class="motto-v4">
                        <i class="fas fa-balance-scale" style="color:#F2D279"></i> Jub · Jubal · Jubanti
                    </span>
                    <span class="status-v4">
                        <i class="fas fa-check-circle"></i> <span id="heroStatMaj">168</span> actions vérifiées
                    </span>
                </div>
            </div>
        </div>
    </div>
</section>`;

// Remplacement de l'ancienne section hero
const heroRegex = /<section class="hero-section" id="accueil">[\s\S]*?<\/section>/;
if (heroRegex.test(indexContent)) {
    indexContent = indexContent.replace(heroRegex, newHeroSection);
    console.log('✓ Hero section V4 replaced in index.html');
} else {
    console.error('✗ Could not match hero-section in index.html');
}

// Bump cache version to v108
indexContent = indexContent.replace(/\?v=v107/g, '?v=v108');

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✓ index.html updated successfully!');

// 2. UPDATE ACTUALITES.HTML
const actuPath = path.resolve('actualites.html');
if (fs.existsSync(actuPath)) {
    let actuContent = fs.readFileSync(actuPath, 'utf8');
    const actuTaglineRegex = /<span class="nav-tagline"><i class="fas fa-shield-alt"><\/i> Gardiens du Projet PASTEF — Jub · Jubal · Jubanti<\/span>/;
    const newActuTagline = `<span class="nav-tagline">
                    <i class="fas fa-shield-alt nav-tagline-shield"></i>
                    <strong class="nav-tagline-main">Gardiens du Projet PASTEF</strong>
                    <span class="nav-tagline-sub">— Jub · Jubal · Jubanti</span>
                </span>`;
    if (actuTaglineRegex.test(actuContent)) {
        actuContent = actuContent.replace(actuTaglineRegex, newActuTagline);
        console.log('✓ Tagline replaced in actualites.html');
    }
    actuContent = actuContent.replace(/\?v=v107/g, '?v=v108');
    fs.writeFileSync(actuPath, actuContent, 'utf8');
    console.log('✓ actualites.html updated!');
}

// 3. UPDATE IDEOLOGIE.HTML
const ideoPath = path.resolve('ideologie.html');
if (fs.existsSync(ideoPath)) {
    let ideoContent = fs.readFileSync(ideoPath, 'utf8');
    const ideoTaglineRegex = /<span class="nav-tagline"><i class="fas fa-shield-alt"><\/i> Gardiens du Projet PASTEF — Jub · Jubal · Jubanti<\/span>/;
    const newIdeoTagline = `<span class="nav-tagline">
                    <i class="fas fa-shield-alt nav-tagline-shield"></i>
                    <strong class="nav-tagline-main">Gardiens du Projet PASTEF</strong>
                    <span class="nav-tagline-sub">— Jub · Jubal · Jubanti</span>
                </span>`;
    if (ideoTaglineRegex.test(ideoContent)) {
        ideoContent = ideoContent.replace(ideoTaglineRegex, newIdeoTagline);
        console.log('✓ Tagline replaced in ideologie.html');
    }
    ideoContent = ideoContent.replace(/\?v=v107/g, '?v=v108');
    fs.writeFileSync(ideoPath, ideoContent, 'utf8');
    console.log('✓ ideologie.html updated!');
}

// 4. UPDATE SW.JS
const swPath = path.resolve('sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(/v107/g, 'v108');
    fs.writeFileSync(swPath, swContent, 'utf8');
    console.log('✓ sw.js bumped to v108!');
}

console.log('--- All file updates completed! ---');
