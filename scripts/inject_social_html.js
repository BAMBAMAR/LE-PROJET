const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// The HTML for page-social
const pageSocialHtml = `
    <!-- ═══════════════════════════════════════════════════
         PAGE: GESTION & PERSONNALISATION DES RÉSEAUX SOCIAUX
         ═══════════════════════════════════════════════════ -->
    <div class="page" id="page-social">

      <!-- Top Banner & Quick Controls -->
      <div class="card" style="margin-bottom:1rem;background:linear-gradient(135deg,rgba(26,43,30,.85),rgba(13,24,18,.95));border-color:var(--border2)">
        <div class="card-head" style="flex-wrap:wrap;gap:.75rem">
          <div style="display:flex;align-items:center;gap:.6rem">
            <span class="card-title"><i class="fas fa-share-nodes" style="color:var(--green)"></i> Gestion & Personnalisation des Réseaux Sociaux</span>
            <span id="socActiveCountBadge" class="badge badge-green" style="font-size:.68rem">7 Réseaux Actifs</span>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-left:auto;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="saveSocialSettings()"><i class="fas fa-save"></i> Enregistrer Tout</button>
            <button class="btn btn-outline btn-sm" onclick="exportSocialConfig()"><i class="fas fa-download"></i> Exporter JSON</button>
            <label class="btn btn-outline btn-sm" style="margin:0;cursor:pointer">
              <i class="fas fa-upload"></i> Importer JSON
              <input type="file" id="socImportFile" accept=".json" style="display:none" onchange="importSocialConfigFile(event)">
            </label>
            <button class="btn btn-outline btn-sm" onclick="resetSocialToDefaults()"><i class="fas fa-rotate-left"></i> Réinitialiser</button>
            <button class="btn btn-gold btn-sm" onclick="syncSocialWithPublicPages()"><i class="fas fa-arrows-rotate"></i> Synchroniser Site Public</button>
          </div>
        </div>
        <div class="card-body" style="padding:.9rem 1.25rem">
          <p style="color:var(--text2);font-size:.84rem;margin:0 0 .75rem 0">
            Personnalisez l'ensemble de la présence sociale de ProjetBI : liens officiels, métadonnées Open Graph (aperçus sur Facebook, X, WhatsApp), simulateurs en direct et composition de posts prêts à être diffusés.
          </p>

          <!-- KPI Summary Row -->
          <div class="kpi-row" style="margin-bottom:0">
            <div class="kpi-card" style="padding:.8rem 1rem">
              <div class="kpi-label">Profils Actifs</div>
              <div class="kpi-value" id="kpiSocActive" style="font-size:1.5rem">7 / 8</div>
              <div class="kpi-sub" style="color:var(--green)">Visibles et prêts</div>
              <i class="fas fa-network-wired kpi-icon"></i>
            </div>
            <div class="kpi-card blue" style="padding:.8rem 1rem">
              <div class="kpi-label">Open Graph / X Card</div>
              <div class="kpi-value" style="font-size:1.5rem">HD</div>
              <div class="kpi-sub" id="kpiSocMetaStatus" style="color:var(--blue)">summary_large_image</div>
              <i class="fas fa-tags kpi-icon"></i>
            </div>
            <div class="kpi-card gold" style="padding:.8rem 1rem">
              <div class="kpi-label">API Facebook</div>
              <div class="kpi-value" id="kpiSocFbStatus" style="font-size:1.3rem">Connecté</div>
              <div class="kpi-sub"><a href="javascript:void(0)" onclick="openFacebookConfigModal()" style="color:var(--gold);text-decoration:underline">Gérer le jeton</a></div>
              <i class="fab fa-facebook kpi-icon"></i>
            </div>
            <div class="kpi-card red" style="padding:.8rem 1rem">
              <div class="kpi-label">Canal WhatsApp</div>
              <div class="kpi-value" id="kpiSocWaStatus" style="font-size:1.3rem">Actif</div>
              <div class="kpi-sub" style="color:var(--text3)">Canal & Communauté</div>
              <i class="fab fa-whatsapp kpi-icon"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Bar Navigation -->
      <div class="social-tabs">
        <button class="social-tab-btn active" id="stb-profiles" onclick="switchSocialTab('profiles')">
          <i class="fas fa-id-card"></i> 1. Profils & Liens Officiels
        </button>
        <button class="social-tab-btn" id="stb-metadata" onclick="switchSocialTab('metadata')">
          <i class="fas fa-tags"></i> 2. Méta-données Open Graph & X Cards
        </button>
        <button class="social-tab-btn" id="stb-simulator" onclick="switchSocialTab('simulator')">
          <i class="fas fa-eye"></i> 3. Simulateur en Direct (X, FB, WhatsApp)
        </button>
        <button class="social-tab-btn" id="stb-generator" onclick="switchSocialTab('generator')">
          <i class="fas fa-bullhorn"></i> 4. Générateur de Posts & Templates
        </button>
        <button class="social-tab-btn" id="stb-public" onclick="switchSocialTab('public')">
          <i class="fas fa-globe"></i> 5. Intégration sur le Site Public
        </button>
      </div>

      <!-- TAB 1: PROFILS & LIENS OFFICIELS -->
      <div class="social-tab-content active" id="tab-content-profiles">
        <div class="social-networks-grid" id="socialNetworksGrid">
          <!-- Dynamically populated by initSocialPage() -->
        </div>
      </div>

      <!-- TAB 2: META-DONNÉES OPEN GRAPH & X CARDS -->
      <div class="social-tab-content" id="tab-content-metadata">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
          <div class="card">
            <div class="card-head">
              <span class="card-title"><i class="fas fa-tags" style="color:var(--blue)"></i> Configuration Open Graph (Facebook, WhatsApp, LinkedIn)</span>
            </div>
            <div class="card-body">
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Titre de partage (og:title)</label>
                <input type="text" class="form-control" id="ogTitleInput" oninput="updateSocialPreview()" placeholder="PROJETBI — Suivi des Engagements & Vision Sénégal 2050">
                <span style="font-size:.72rem;color:var(--text3)">Recommandé : 50 à 60 caractères</span>
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Description de partage (og:description)</label>
                <textarea class="form-control" id="ogDescInput" rows="3" oninput="updateSocialPreview()" placeholder="Plateforme citoyenne indépendante de suivi en temps réel des 300 engagements du Projet PASTEF..."></textarea>
                <span style="font-size:.72rem;color:var(--text3)">Recommandé : 120 à 155 caractères</span>
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Nom du site (og:site_name)</label>
                <input type="text" class="form-control" id="ogSiteNameInput" oninput="updateSocialPreview()" placeholder="PROJETBI">
              </div>
              <div class="form-group">
                <label style="font-weight:600;font-size:.82rem">URL canonique de base</label>
                <input type="text" class="form-control" id="ogUrlInput" value="https://projetbi.org" placeholder="https://projetbi.org">
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <span class="card-title"><i class="fab fa-x-twitter" style="color:#FFFFFF"></i> Configuration X / Twitter Card</span>
            </div>
            <div class="card-body">
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Type de carte Twitter (twitter:card)</label>
                <select class="form-control" id="twCardTypeSelect" onchange="updateSocialPreview()">
                  <option value="summary_large_image" selected>summary_large_image (Grande image HD - Recommandé)</option>
                  <option value="summary">summary (Petite vignette carrée à gauche)</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Compte X officiel (twitter:site)</label>
                <input type="text" class="form-control" id="twSiteInput" oninput="updateSocialPreview()" placeholder="@ProjetBI">
              </div>
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Compte X créateur (twitter:creator)</label>
                <input type="text" class="form-control" id="twCreatorInput" placeholder="@ProjetBI">
              </div>
              <div class="form-group">
                <label style="font-weight:600;font-size:.82rem">Image de partage Open Graph & Twitter (og:image)</label>
                <select class="form-control" id="ogImageSelect" onchange="onSocialImageSelectChange()" style="margin-bottom:.5rem">
                  <option value="assets/branding/favicon_blanc_squircle.png">⚪ Logo Officiel Fond Blanc Squircle HD (Recommandé)</option>
                  <option value="assets/branding/logo_projetbi_horizontal_blanc.png">⚪ Logo Horizontal Fond Blanc (1500×450)</option>
                  <option value="assets/branding/logo_projetbi_horizontal_vert_foret.png">🟢 Logo Horizontal Vert Forêt (#1A3D28)</option>
                  <option value="https://projetbi.org/twitter-card.jpg">🖼️ Bannière Twitter Card Dédiée (1200×630)</option>
                  <option value="custom">✏️ URL personnalisée...</option>
                </select>
                <input type="text" class="form-control" id="ogImageCustomInput" oninput="updateSocialPreview()" placeholder="https://..." style="display:none">
              </div>
            </div>
          </div>

          <!-- Code Generator for <head> -->
          <div class="card" style="grid-column:1/-1">
            <div class="card-head">
              <span class="card-title"><i class="fas fa-code" style="color:var(--gold)"></i> Balises HTML &lt;head&gt; générées automatiquement</span>
              <button class="btn btn-outline btn-sm" onclick="copyMetaTagsCode()"><i class="fas fa-copy"></i> Copier les balises</button>
            </div>
            <div class="card-body">
              <pre id="metaTagsCodePreview" style="background:var(--bg);padding:1rem;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--text2);overflow-x:auto;max-height:220px;border:1px solid var(--border)"></pre>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: SIMULATEUR EN DIRECT -->
      <div class="social-tab-content" id="tab-content-simulator">
        <div style="margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between">
          <p style="color:var(--text2);font-size:.83rem;margin:0">
            Aperçu en temps réel du rendu de vos liens lorsqu'ils sont partagés par les citoyens sur les différentes plateformes :
          </p>
          <button class="btn btn-outline btn-xs" onclick="updateSocialPreview()"><i class="fas fa-sync"></i> Rafraîchir l'aperçu</button>
        </div>

        <div class="sim-grid">
          <!-- X / Twitter Simulator -->
          <div class="sim-box">
            <div class="sim-box-title"><i class="fab fa-x-twitter"></i> Aperçu X / Twitter (Feed)</div>
            <div class="mockup-x">
              <div class="mockup-x-header">
                <div class="mockup-x-avatar"><img src="assets/branding/favicon_blanc_squircle.svg" style="width:28px;height:28px"></div>
                <div>
                  <div class="mockup-x-author">ProjetBI Officiel <i class="fas fa-circle-check" style="color:#1D9BF0;font-size:12px"></i></div>
                  <div class="mockup-x-handle" id="simTwHandle">@ProjetBI</div>
                </div>
              </div>
              <div class="mockup-x-text" id="simTwText">
                🇸🇳 Gardiens du Projet PASTEF — Suivez en direct le suivi des 300 engagements pour un Sénégal Souverain, Juste et Prospère !
              </div>
              <div class="mockup-x-card">
                <img class="mockup-x-img" id="simTwImg" src="assets/branding/favicon_blanc_squircle.png" alt="Aperçu X">
                <div class="mockup-x-content">
                  <div class="mockup-x-domain">projetbi.org</div>
                  <div class="mockup-x-title" id="simTwTitle">PROJETBI — Plateforme Citoyenne</div>
                  <div class="mockup-x-desc" id="simTwDesc">Suivi des engagements présidentiels...</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Facebook Simulator -->
          <div class="sim-box">
            <div class="sim-box-title"><i class="fab fa-facebook" style="color:#1877F2"></i> Aperçu Facebook (Fil d'actualité)</div>
            <div class="mockup-fb">
              <div class="mockup-fb-header">
                <div class="mockup-fb-avatar"><img src="assets/branding/favicon_blanc_squircle.svg" style="width:28px;height:28px"></div>
                <div>
                  <div class="mockup-fb-name">ProjetBI</div>
                  <div class="mockup-fb-time">À l'instant · 🌐 Public</div>
                </div>
              </div>
              <div class="mockup-fb-text">
                Retrouvez l'évaluation indépendante et les avancées concrètes sur la plateforme officielle :
              </div>
              <img class="mockup-fb-img" id="simFbImg" src="assets/branding/favicon_blanc_squircle.png" alt="Aperçu Facebook">
              <div class="mockup-fb-meta">
                <div class="mockup-fb-domain">PROJETBI.ORG</div>
                <div class="mockup-fb-title" id="simFbTitle">PROJETBI — Plateforme Citoyenne</div>
                <div class="mockup-fb-desc" id="simFbDesc">Suivi des engagements présidentiels...</div>
              </div>
            </div>
          </div>

          <!-- WhatsApp Simulator -->
          <div class="sim-box">
            <div class="sim-box-title"><i class="fab fa-whatsapp" style="color:#25D366"></i> Aperçu WhatsApp (Discussion & Canal)</div>
            <div class="mockup-wa">
              <div class="mockup-wa-bubble">
                <div class="mockup-wa-card">
                  <img class="mockup-wa-img" id="simWaImg" src="assets/branding/favicon_blanc_squircle.png" alt="Aperçu WhatsApp">
                  <div class="mockup-wa-body">
                    <div class="mockup-wa-title" id="simWaTitle">PROJETBI — Plateforme Citoyenne</div>
                    <div class="mockup-wa-desc" id="simWaDesc">Suivi des engagements présidentiels...</div>
                    <div class="mockup-wa-domain">https://projetbi.org</div>
                  </div>
                </div>
                <div class="mockup-wa-text">
                  🇸🇳 Suivez les 300 engagements de PASTEF en temps réel sur https://projetbi.org
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: GÉNÉRATEUR DE POSTS & TEMPLATES -->
      <div class="social-tab-content" id="tab-content-generator">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
          <div class="card">
            <div class="card-head">
              <span class="card-title"><i class="fas fa-wand-magic-sparkles" style="color:var(--gold)"></i> Composer une publication</span>
            </div>
            <div class="card-body">
              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Source du contenu à diffuser</label>
                <select class="form-control" id="postSourceType" onchange="onPostSourceTypeChange()">
                  <option value="promise">🇸🇳 Suivi d'un Engagement (Base des Promesses)</option>
                  <option value="news">⚡ Flash Actualité Récente</option>
                  <option value="press">📰 Revue de Presse Quotidienne</option>
                  <option value="general">📢 Annonce Générale & Slogan Républicain</option>
                </select>
              </div>

              <div class="form-group" id="postItemSelectorGroup" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem" id="postItemSelectorLabel">Sélectionner l'élément</label>
                <select class="form-control" id="postItemSelect" onchange="buildGeneratedPost()">
                  <!-- Populated dynamically -->
                </select>
              </div>

              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Ton / Style du message</label>
                <select class="form-control" id="postToneSelect" onchange="buildGeneratedPost()">
                  <option value="republican" selected>🇸🇳 Républicain & Factuel (Recommandé)</option>
                  <option value="alert">⚡ Alerte Citoyenne & Mobilisation</option>
                  <option value="victory">✅ Célébration d'étape / Réalisation</option>
                  <option value="quote">💬 Citation & Doctrine Jub · Jubal · Jubanti</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom:1rem">
                <label style="font-weight:600;font-size:.82rem">Hashtags officiels (cliquer pour activer/désactiver)</label>
                <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.4rem" id="postHashtagsContainer">
                  <!-- Injected dynamically -->
                </div>
              </div>

              <button class="btn btn-primary" onclick="buildGeneratedPost()" style="width:100%"><i class="fas fa-sync"></i> Régénérer le texte</button>
            </div>
          </div>

          <div class="card">
            <div class="card-head">
              <span class="card-title"><i class="fas fa-paper-plane" style="color:var(--green)"></i> Message prêt à diffuser</span>
              <div style="display:flex;align-items:center;gap:.5rem">
                <span id="postCharCountBadge" class="badge badge-green" style="font-size:.7rem">0 / 280 (X)</span>
              </div>
            </div>
            <div class="card-body">
              <textarea class="form-control" id="postGeneratedText" rows="7" oninput="updatePostCharCount()" style="font-size:.88rem;line-height:1.5;margin-bottom:1rem"></textarea>

              <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:.6rem;margin-bottom:1rem">
                <button class="btn btn-outline btn-sm" onclick="sharePostTo('x')">
                  <i class="fab fa-x-twitter"></i> Partager sur X
                </button>
                <button class="btn btn-outline btn-sm" onclick="sharePostTo('whatsapp')">
                  <i class="fab fa-whatsapp" style="color:#25D366"></i> Partager sur WhatsApp
                </button>
                <button class="btn btn-outline btn-sm" onclick="sharePostTo('facebook')">
                  <i class="fab fa-facebook" style="color:#1877F2"></i> Partager sur Facebook
                </button>
                <button class="btn btn-outline btn-sm" onclick="sharePostTo('telegram')">
                  <i class="fab fa-telegram" style="color:#229ED9"></i> Partager sur Telegram
                </button>
              </div>

              <button class="btn btn-primary btn-sm" onclick="copyGeneratedPost()" style="width:100%">
                <i class="fas fa-copy"></i> Copier le texte complet dans le presse-papier
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: INTÉGRATION SUR LE SITE PUBLIC -->
      <div class="social-tab-content" id="tab-content-public">
        <div class="card" style="margin-bottom:1.25rem">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-sliders" style="color:var(--green)"></i> Options d'affichage sur le site public</span>
          </div>
          <div class="card-body">
            <div style="display:flex;flex-direction:column;gap:1rem">
              <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
                <input type="checkbox" id="chkShowFooterSocial" checked style="width:18px;height:18px">
                <div>
                  <div style="font-weight:700;font-size:.88rem">Afficher les icônes de réseaux sociaux dans le pied de page (Footer)</div>
                  <div style="color:var(--text3);font-size:.78rem">Génère automatiquement les liens dans index.html, actualites.html et ideologie.html</div>
                </div>
              </label>

              <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
                <input type="checkbox" id="chkShowHeaderWhatsapp" checked style="width:18px;height:18px">
                <div>
                  <div style="font-weight:700;font-size:.88rem">Afficher le raccourci WhatsApp officiel dans l'en-tête / navigation</div>
                  <div style="color:var(--text3);font-size:.78rem">Permet aux citoyens d'accéder directement au canal officiel WhatsApp</div>
                </div>
              </label>

              <label style="display:flex;align-items:center;gap:.75rem;cursor:pointer">
                <input type="checkbox" id="chkEnableCardShare" checked style="width:18px;height:18px">
                <div>
                  <div style="font-weight:700;font-size:.88rem">Activer les boutons de partage direct sur les fiches d'engagements</div>
                  <div style="color:var(--text3);font-size:.78rem">Permet le partage 1-clic de chaque promesse et actualité</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div class="card" style="background:linear-gradient(135deg,rgba(45,95,63,0.1),rgba(201,168,76,0.1));border-color:var(--green)">
          <div class="card-head">
            <span class="card-title"><i class="fas fa-cloud-arrow-up" style="color:var(--green)"></i> Synchronisation des fichiers HTML publics</span>
          </div>
          <div class="card-body">
            <p style="font-size:.84rem;color:var(--text2);margin-bottom:1rem">
              Cliquez ci-dessous pour appliquer immédiatement vos liens officiels et vos balises Open Graph à <code>index.html</code>, <code>actualites.html</code> et <code>ideologie.html</code> :
            </p>
            <button class="btn btn-primary" onclick="syncSocialWithPublicPages()"><i class="fas fa-sync"></i> Synchroniser avec les pages publiques du site</button>
            <div id="syncResultStatus" style="margin-top:.85rem;font-size:.8rem;color:var(--green);display:none"></div>
          </div>
        </div>
      </div>

    </div>
`;

// Insert pageSocialHtml right after page-seo
if (!content.includes('id="page-social"')) {
  const pageSeoEnd = '<div class="page" id="page-seo">';
  content = content.replace(pageSeoEnd, `${pageSocialHtml}\n    ${pageSeoEnd}`);
  console.log('page-social HTML inserted into admin.html!');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Admin HTML updated with page-social div.');
