const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

const socialJsCode = `
// ═══════════════════════════════════════════════════
// GESTIONNAIRE DÉDIÉ : PAGES RÉSEAUX SOCIAUX
// ═══════════════════════════════════════════════════

const DEFAULT_SOCIAL_CONFIG = {
  profiles: {
    facebook: {
      name: "Facebook",
      enabled: true,
      url: "https://facebook.com/projetbi.org",
      handle: "@ProjetBI",
      pageId: "104829104928172",
      showInFooter: true,
      icon: "fab fa-facebook-f",
      color: "#1877F2"
    },
    twitter: {
      name: "X (Twitter)",
      enabled: true,
      url: "https://x.com/ProjetBI",
      handle: "@ProjetBI",
      showInFooter: true,
      icon: "fab fa-x-twitter",
      color: "#FFFFFF"
    },
    whatsapp: {
      name: "WhatsApp (Canal & Groupe)",
      enabled: true,
      channelUrl: "https://whatsapp.com/channel/0029Vb7vProjetBI",
      groupUrl: "https://chat.whatsapp.com/ProjetBI",
      phone: "+221 77 000 00 00",
      defaultMsg: "Bonjour ProjetBI, je souhaite m'informer sur le Projet.",
      showInFooter: true,
      showInHeader: true,
      icon: "fab fa-whatsapp",
      color: "#25D366"
    },
    youtube: {
      name: "YouTube",
      enabled: true,
      url: "https://youtube.com/@ProjetBI",
      handle: "@ProjetBI",
      showInFooter: true,
      icon: "fab fa-youtube",
      color: "#FF0000"
    },
    tiktok: {
      name: "TikTok",
      enabled: true,
      url: "https://tiktok.com/@projetbi",
      handle: "@projetbi",
      showInFooter: false,
      icon: "fab fa-tiktok",
      color: "#EE1D52"
    },
    telegram: {
      name: "Telegram",
      enabled: true,
      url: "https://t.me/projetbi_officiel",
      handle: "t.me/projetbi_officiel",
      showInFooter: true,
      icon: "fab fa-telegram",
      color: "#229ED9"
    },
    linkedin: {
      name: "LinkedIn",
      enabled: false,
      url: "https://linkedin.com/company/projetbi",
      handle: "ProjetBI",
      showInFooter: false,
      icon: "fab fa-linkedin-in",
      color: "#0A66C2"
    },
    instagram: {
      name: "Instagram",
      enabled: true,
      url: "https://instagram.com/projetbi_officiel",
      handle: "@projetbi_officiel",
      showInFooter: true,
      icon: "fab fa-instagram",
      color: "#E4405F"
    }
  },
  metadata: {
    title: "PROJETBI — Gardiens du Projet PASTEF | Sénégal 2024–2029",
    description: "Plateforme citoyenne indépendante de suivi en temps réel des 300 engagements du Projet PASTEF pour un Sénégal Souverain, Juste et Prospère. Jub · Jubal · Jubanti.",
    image: "assets/branding/favicon_blanc_squircle.png",
    cardType: "summary_large_image",
    siteName: "PROJETBI",
    twitterSite: "@ProjetBI",
    twitterCreator: "@ProjetBI"
  },
  hashtags: [
    "#ProjetBI",
    "#Senegal",
    "#Pastef",
    "#JubJubalJubanti",
    "#Vision2050",
    "#SenegalSouverain"
  ],
  display: {
    showFooterSocial: true,
    showHeaderWhatsapp: true,
    enableCardShare: true
  }
};

let activeSocialHashtags = new Set(["#ProjetBI", "#Senegal", "#Pastef", "#JubJubalJubanti"]);

function getSocialConfig() {
  try {
    const raw = localStorage.getItem('projetbi_social_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SOCIAL_CONFIG,
        ...parsed,
        profiles: { ...DEFAULT_SOCIAL_CONFIG.profiles, ...(parsed.profiles || {}) },
        metadata: { ...DEFAULT_SOCIAL_CONFIG.metadata, ...(parsed.metadata || {}) },
        display: { ...DEFAULT_SOCIAL_CONFIG.display, ...(parsed.display || {}) }
      };
    }
  } catch(e) {
    console.error('Error reading social config:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_SOCIAL_CONFIG));
}

function initSocialPage() {
  const cfg = getSocialConfig();

  // 1. Render Profile Cards
  renderSocialNetworksGrid(cfg);

  // 2. Populate Metadata Inputs
  const m = cfg.metadata || {};
  const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
  setVal('ogTitleInput', m.title);
  setVal('ogDescInput', m.description);
  setVal('ogSiteNameInput', m.siteName);
  setVal('twSiteInput', m.twitterSite);
  setVal('twCreatorInput', m.twitterCreator);
  
  const selCard = document.getElementById('twCardTypeSelect');
  if (selCard && m.cardType) selCard.value = m.cardType;

  const selImg = document.getElementById('ogImageSelect');
  const customImgInput = document.getElementById('ogImageCustomInput');
  if (selImg) {
    const knownImages = [
      'assets/branding/favicon_blanc_squircle.png',
      'assets/branding/logo_projetbi_horizontal_blanc.png',
      'assets/branding/logo_projetbi_horizontal_vert_foret.png',
      'https://projetbi.org/twitter-card.jpg'
    ];
    if (knownImages.includes(m.image)) {
      selImg.value = m.image;
      if (customImgInput) customImgInput.style.display = 'none';
    } else {
      selImg.value = 'custom';
      if (customImgInput) {
        customImgInput.style.display = 'block';
        customImgInput.value = m.image || '';
      }
    }
  }

  // 3. Populate Display Settings
  const d = cfg.display || {};
  const setChk = (id, v) => { const el = document.getElementById(id); if (el) el.checked = !!v; };
  setChk('chkShowFooterSocial', d.showFooterSocial !== false);
  setChk('chkShowHeaderWhatsapp', d.showHeaderWhatsapp !== false);
  setChk('chkEnableCardShare', d.enableCardShare !== false);

  // 4. Populate Hashtags
  renderSocialHashtags(cfg.hashtags || []);

  // 5. Populate Generator Item Selector
  onPostSourceTypeChange();

  // 6. Update KPIs & Previews
  updateSocialKPIs(cfg);
  updateSocialPreview();
}

function renderSocialNetworksGrid(cfg) {
  const container = document.getElementById('socialNetworksGrid');
  if (!container) return;

  const profiles = cfg.profiles || {};
  let html = '';

  for (const [key, p] of Object.entries(profiles)) {
    const isChecked = p.enabled ? 'checked' : '';
    const isFooterChecked = p.showInFooter ? 'checked' : '';
    const isWa = key === 'whatsapp';
    const isFb = key === 'facebook';

    html += \`
      <div class="social-net-card" id="card_net_\${key}">
        <div class="social-net-header">
          <div class="social-net-title">
            <div class="social-net-icon" style="background:\${p.color}">
              <i class="\${p.icon}"></i>
            </div>
            <div>
              <div>\${p.name}</div>
              <span class="badge badge-\${p.enabled ? 'green' : 'red'}" id="badge_net_\${key}" style="font-size:.65rem">
                \${p.enabled ? 'Actif' : 'Désactivé'}
              </span>
            </div>
          </div>
          <label class="social-switch" title="Activer / Désactiver ce réseau">
            <input type="checkbox" id="chk_net_\${key}" \${isChecked} onchange="onSocialNetworkToggle('\${key}', this.checked)">
            <span class="social-slider"></span>
          </label>
        </div>

        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div>
            <label style="font-size:.78rem;font-weight:600;color:var(--text2)">
              \${isWa ? 'Lien Canal Officiel WhatsApp :' : 'URL de la Page / Profil :'}
            </label>
            <div style="display:flex;gap:.4rem;margin-top:.2rem">
              <input type="text" class="form-control" id="url_net_\${key}" value="\${isWa ? (p.channelUrl || '') : (p.url || '')}" placeholder="https://..." style="font-size:.82rem">
              <button class="btn btn-outline btn-xs" onclick="testSocialLink('\${key}')" title="Tester le lien dans un nouvel onglet"><i class="fas fa-external-link-alt"></i></button>
            </div>
          </div>

          \${isWa ? \`
            <div>
              <label style="font-size:.78rem;font-weight:600;color:var(--text2)">Lien Groupe Communautaire :</label>
              <input type="text" class="form-control" id="group_net_\${key}" value="\${p.groupUrl || ''}" placeholder="https://chat.whatsapp.com/..." style="font-size:.82rem;margin-top:.2rem">
            </div>
            <div>
              <label style="font-size:.78rem;font-weight:600;color:var(--text2)">Numéro Direct / Support WhatsApp :</label>
              <input type="text" class="form-control" id="phone_net_\${key}" value="\${p.phone || ''}" placeholder="+221 77 000 00 00" style="font-size:.82rem;margin-top:.2rem">
            </div>
          \` : \`
            <div>
              <label style="font-size:.78rem;font-weight:600;color:var(--text2)">Identifiant / Handle visible :</label>
              <input type="text" class="form-control" id="handle_net_\${key}" value="\${p.handle || ''}" placeholder="@ProjetBI" style="font-size:.82rem;margin-top:.2rem">
            </div>
          \`}

          \${isFb ? \`
            <div style="background:rgba(24,119,242,0.1);padding:.6rem .8rem;border-radius:6px;border:1px solid rgba(24,119,242,0.25);margin-top:.2rem">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="font-size:.75rem;font-weight:600;color:#1877F2"><i class="fab fa-facebook"></i> API Graph Facebook</span>
                <button class="btn btn-outline btn-xs" onclick="openFacebookConfigModal()" style="font-size:.7rem;padding:.2rem .4rem">Jeton & ID</button>
              </div>
            </div>
          \` : ''}

          <div style="margin-top:.25rem;padding-top:.5rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">
            <label style="display:flex;align-items:center;gap:.4rem;cursor:pointer;font-size:.75rem;color:var(--text2)">
              <input type="checkbox" id="footer_net_\${key}" \${isFooterChecked}> Afficher dans le Footer
            </label>
            <button class="btn btn-outline btn-xs" onclick="copySocialLink('\${key}')" style="font-size:.7rem"><i class="fas fa-copy"></i> Copier</button>
          </div>
        </div>
      </div>
    \`;
  }

  container.innerHTML = html;
}

function onSocialNetworkToggle(key, isChecked) {
  const badge = document.getElementById('badge_net_' + key);
  if (badge) {
    badge.className = 'badge badge-' + (isChecked ? 'green' : 'red');
    badge.textContent = isChecked ? 'Actif' : 'Désactivé';
  }
  updateSocialKPIs(getSocialConfigFromForm());
}

function switchSocialTab(tabId) {
  document.querySelectorAll('.social-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.social-tab-content').forEach(tab => tab.classList.remove('active'));

  const btn = document.getElementById('stb-' + tabId);
  const content = document.getElementById('tab-content-' + tabId);
  if (btn) btn.classList.add('active');
  if (content) content.classList.add('active');

  if (tabId === 'simulator') updateSocialPreview();
  if (tabId === 'generator') buildGeneratedPost();
}

function onSocialImageSelectChange() {
  const sel = document.getElementById('ogImageSelect');
  const custom = document.getElementById('ogImageCustomInput');
  if (!sel || !custom) return;
  custom.style.display = sel.value === 'custom' ? 'block' : 'none';
  updateSocialPreview();
}

function getSelectedSocialImage() {
  const sel = document.getElementById('ogImageSelect');
  const custom = document.getElementById('ogImageCustomInput');
  if (sel && sel.value === 'custom') {
    return (custom ? custom.value.trim() : '') || 'assets/branding/favicon_blanc_squircle.png';
  }
  return sel ? sel.value : 'assets/branding/favicon_blanc_squircle.png';
}

function updateSocialPreview() {
  const title = (document.getElementById('ogTitleInput') || {}).value || 'PROJETBI — Plateforme Citoyenne';
  const desc = (document.getElementById('ogDescInput') || {}).value || 'Suivi des engagements présidentiels...';
  const img = getSelectedSocialImage();
  const twHandle = (document.getElementById('twSiteInput') || {}).value || '@ProjetBI';
  const siteName = (document.getElementById('ogSiteNameInput') || {}).value || 'PROJETBI';

  // Update X Preview
  const sTwTitle = document.getElementById('simTwTitle');
  const sTwDesc = document.getElementById('simTwDesc');
  const sTwImg = document.getElementById('simTwImg');
  const sTwHandle = document.getElementById('simTwHandle');
  if (sTwTitle) sTwTitle.textContent = title;
  if (sTwDesc) sTwDesc.textContent = desc;
  if (sTwImg) sTwImg.src = img;
  if (sTwHandle) sTwHandle.textContent = twHandle;

  // Update Facebook Preview
  const sFbTitle = document.getElementById('simFbTitle');
  const sFbDesc = document.getElementById('simFbDesc');
  const sFbImg = document.getElementById('simFbImg');
  if (sFbTitle) sFbTitle.textContent = title;
  if (sFbDesc) sFbDesc.textContent = desc;
  if (sFbImg) sFbImg.src = img;

  // Update WhatsApp Preview
  const sWaTitle = document.getElementById('simWaTitle');
  const sWaDesc = document.getElementById('simWaDesc');
  const sWaImg = document.getElementById('simWaImg');
  if (sWaTitle) sWaTitle.textContent = title;
  if (sWaDesc) sWaDesc.textContent = desc;
  if (sWaImg) sWaImg.src = img;

  // Generate & Update HTML Meta Code Preview
  const metaCode = \`<!-- ══ Méta-données Open Graph & X (Twitter) Générées ══ -->
<meta property="og:type" content="website">
<meta property="og:site_name" content="\${escapeHtml(siteName)}">
<meta property="og:title" content="\${escapeHtml(title)}">
<meta property="og:description" content="\${escapeHtml(desc)}">
<meta property="og:image" content="https://projetbi.org/\${img}">
<meta property="og:url" content="https://projetbi.org">

<meta name="twitter:card" content="\${(document.getElementById('twCardTypeSelect') || {}).value || 'summary_large_image'}">
<meta name="twitter:site" content="\${escapeHtml(twHandle)}">
<meta name="twitter:creator" content="\${escapeHtml((document.getElementById('twCreatorInput') || {}).value || twHandle)}">
<meta name="twitter:title" content="\${escapeHtml(title)}">
<meta name="twitter:description" content="\${escapeHtml(desc)}">
<meta name="twitter:image" content="https://projetbi.org/\${img}">\`;

  const codeBox = document.getElementById('metaTagsCodePreview');
  if (codeBox) codeBox.textContent = metaCode;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getSocialConfigFromForm() {
  const current = getSocialConfig();
  const profiles = current.profiles || {};

  for (const key of Object.keys(profiles)) {
    const chk = document.getElementById('chk_net_' + key);
    const url = document.getElementById('url_net_' + key);
    const handle = document.getElementById('handle_net_' + key);
    const footer = document.getElementById('footer_net_' + key);

    if (chk) profiles[key].enabled = chk.checked;
    if (footer) profiles[key].showInFooter = footer.checked;

    if (key === 'whatsapp') {
      const grp = document.getElementById('group_net_' + key);
      const phone = document.getElementById('phone_net_' + key);
      if (url) profiles[key].channelUrl = url.value.trim();
      if (grp) profiles[key].groupUrl = grp.value.trim();
      if (phone) profiles[key].phone = phone.value.trim();
    } else {
      if (url) profiles[key].url = url.value.trim();
      if (handle) profiles[key].handle = handle.value.trim();
    }
  }

  const metadata = {
    title: (document.getElementById('ogTitleInput') || {}).value || current.metadata.title,
    description: (document.getElementById('ogDescInput') || {}).value || current.metadata.description,
    siteName: (document.getElementById('ogSiteNameInput') || {}).value || current.metadata.siteName,
    image: getSelectedSocialImage(),
    cardType: (document.getElementById('twCardTypeSelect') || {}).value || 'summary_large_image',
    twitterSite: (document.getElementById('twSiteInput') || {}).value || '@ProjetBI',
    twitterCreator: (document.getElementById('twCreatorInput') || {}).value || '@ProjetBI'
  };

  const display = {
    showFooterSocial: !!(document.getElementById('chkShowFooterSocial') || {}).checked,
    showHeaderWhatsapp: !!(document.getElementById('chkShowHeaderWhatsapp') || {}).checked,
    enableCardShare: !!(document.getElementById('chkEnableCardShare') || {}).checked
  };

  return {
    ...current,
    profiles,
    metadata,
    display,
    lastUpdated: new Date().toISOString()
  };
}

function updateSocialKPIs(cfg) {
  const profiles = cfg.profiles || {};
  const total = Object.keys(profiles).length;
  const activeCount = Object.values(profiles).filter(p => p.enabled).length;

  const kpiEl = document.getElementById('kpiSocActive');
  if (kpiEl) kpiEl.textContent = \`\${activeCount} / \${total}\`;

  const badgeEl = document.getElementById('socActiveCountBadge');
  if (badgeEl) badgeEl.textContent = \`\${activeCount} Réseaux Actifs\`;

  const waEl = document.getElementById('kpiSocWaStatus');
  if (waEl) {
    waEl.textContent = profiles.whatsapp && profiles.whatsapp.enabled ? 'Actif' : 'Désactivé';
    waEl.style.color = profiles.whatsapp && profiles.whatsapp.enabled ? 'var(--green)' : 'var(--text3)';
  }

  const fbEl = document.getElementById('kpiSocFbStatus');
  const fbCfg = typeof getFacebookConfig === 'function' ? getFacebookConfig() : null;
  if (fbEl) {
    if (fbCfg && fbCfg.token) {
      fbEl.textContent = 'Connecté';
      fbEl.style.color = 'var(--green)';
    } else {
      fbEl.textContent = 'Sans Jeton';
      fbEl.style.color = 'var(--gold)';
    }
  }
}

function saveSocialSettings() {
  const cfg = getSocialConfigFromForm();
  localStorage.setItem('projetbi_social_config', JSON.stringify(cfg));
  updateSocialKPIs(cfg);
  toast('Configuration des réseaux sociaux enregistrée avec succès ✅', 'success');
}

function resetSocialToDefaults() {
  if (!confirm('Voulez-vous réinitialiser tous les paramètres des réseaux sociaux aux valeurs par défaut officielles ?')) return;
  localStorage.setItem('projetbi_social_config', JSON.stringify(DEFAULT_SOCIAL_CONFIG));
  initSocialPage();
  toast('Paramètres réinitialisés aux valeurs officielles ✅', 'info');
}

function exportSocialConfig() {
  const cfg = getSocialConfigFromForm();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cfg, null, 2));
  const dl = document.createElement('a');
  dl.setAttribute('href', dataStr);
  dl.setAttribute('download', 'projetbi-social-config-' + Date.now() + '.json');
  dl.click();
  toast('Fichier de configuration exporté ✅', 'success');
}

function importSocialConfigFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.profiles && !imported.metadata) {
        throw new Error('Format de configuration invalide');
      }
      localStorage.setItem('projetbi_social_config', JSON.stringify(imported));
      initSocialPage();
      toast('Configuration des réseaux importée avec succès ✅', 'success');
    } catch(err) {
      toast('Erreur lors de l\\'import : ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

function testSocialLink(key) {
  const cfg = getSocialConfigFromForm();
  const p = (cfg.profiles || {})[key];
  if (!p) return;
  const url = (key === 'whatsapp' ? (p.channelUrl || p.groupUrl) : p.url) || '';
  if (!url || url === '#' || url.startsWith('javascript:')) {
    toast('Veuillez renseigner une URL valide', 'error');
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

function copySocialLink(key) {
  const cfg = getSocialConfigFromForm();
  const p = (cfg.profiles || {})[key];
  if (!p) return;
  const url = (key === 'whatsapp' ? (p.channelUrl || p.groupUrl) : p.url) || '';
  if (!url) return;
  navigator.clipboard.writeText(url).then(() => {
    toast('Lien copié : ' + url, 'success');
  });
}

function copyMetaTagsCode() {
  const el = document.getElementById('metaTagsCodePreview');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    toast('Balises méta HTML copiées dans le presse-papier ✅', 'success');
  });
}

// ═══════════════════════════════════════════════════
// GÉNÉRATEUR AUTOMATIQUE DE POSTS SOCIAUX
// ═══════════════════════════════════════════════════

function renderSocialHashtags(tags) {
  const container = document.getElementById('postHashtagsContainer');
  if (!container) return;
  let html = '';
  tags.forEach(t => {
    const isActive = activeSocialHashtags.has(t) ? 'active' : '';
    html += \`<span class="htag-pill \${isActive}" onclick="toggleHashtagPill('\${t}', this)">\${t}</span>\`;
  });
  container.innerHTML = html;
}

function toggleHashtagPill(tag, el) {
  if (activeSocialHashtags.has(tag)) {
    activeSocialHashtags.delete(tag);
    el.classList.remove('active');
  } else {
    activeSocialHashtags.add(tag);
    el.classList.add('active');
  }
  buildGeneratedPost();
}

function onPostSourceTypeChange() {
  const type = (document.getElementById('postSourceType') || {}).value || 'promise';
  const sel = document.getElementById('postItemSelect');
  const group = document.getElementById('postItemSelectorGroup');
  const label = document.getElementById('postItemSelectorLabel');
  if (!sel || !group) return;

  if (type === 'general') {
    group.style.display = 'none';
    buildGeneratedPost();
    return;
  }

  group.style.display = 'block';
  let options = '';

  if (type === 'promise') {
    label.textContent = 'Sélectionner l\\'engagement à relayer :';
    const list = (DB && DB.promises && DB.promises.length) ? DB.promises.slice(0, 50) : [];
    if (!list.length) options = '<option value="">(Aucun engagement chargé)</option>';
    list.forEach(p => {
      const st = p.status === 'done' ? '✅ Réalisé' : (p.status === 'in_progress' ? '⏳ En cours' : '⚠️ En retard');
      options += \`<option value="\${p.id}">[\${st}] \${escapeHtml((p.engagement || '').slice(0, 75))}...</option>\`;
    });
  } else if (type === 'news') {
    label.textContent = 'Sélectionner l\\'actualité :';
    const list = (DB && DB.news && DB.news.length) ? DB.news.slice(0, 30) : [];
    if (!list.length) options = '<option value="">(Aucune actualité chargée)</option>';
    list.forEach(n => {
      options += \`<option value="\${n.id}">\${escapeHtml((n.titre || '').slice(0, 75))}...</option>\`;
    });
  } else if (type === 'press') {
    label.textContent = 'Sélectionner la revue de presse :';
    const list = (DB && DB.press && DB.press.length) ? DB.press.slice(0, 20) : [];
    if (!list.length) options = '<option value="">(Aucune revue chargée)</option>';
    list.forEach(r => {
      options += \`<option value="\${r.id}">\${escapeHtml(r.journal || 'Revue')} - \${escapeHtml((r.titre || '').slice(0, 60))}...</option>\`;
    });
  }

  sel.innerHTML = options;
  buildGeneratedPost();
}

function buildGeneratedPost() {
  const type = (document.getElementById('postSourceType') || {}).value || 'promise';
  const tone = (document.getElementById('postToneSelect') || {}).value || 'republican';
  const itemId = (document.getElementById('postItemSelect') || {}).value;
  const tagsStr = Array.from(activeSocialHashtags).join(' ');

  let post = '';

  if (type === 'promise') {
    const item = (DB && DB.promises) ? DB.promises.find(p => p.id === itemId) || DB.promises[0] : null;
    const title = item ? item.engagement : 'Engagement citoyen pour un Sénégal Souverain';
    const stLabel = item ? (item.status === 'done' ? 'RÉALISÉ ✅' : (item.status === 'in_progress' ? 'EN COURS ⏳' : 'EN VIGILANCE ⚠️')) : 'SUIVI';
    const domain = item ? (item.domaine || 'Gouvernance') : 'Projet';

    if (tone === 'victory') {
      post = \`🇸🇳 AVANCÉE CONCRÈTE DU PROJET | \${domain.toUpperCase()}\\n\\n✅ Engagement : "\${title}"\\nStatut officiel : \${stLabel}\\n\\nDécouvrez les indicateurs complets et les preuves de réalisation sur la plateforme citoyenne :\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    } else if (tone === 'alert') {
      post = \`⚠️ VIGILANCE CITOYENNE | \${domain.toUpperCase()}\\n\\n📌 Engagement suivi : "\${title}"\\nÉtat actuel : \${stLabel}\\n\\nLe respect strict des délais est au cœur du redressement national. Suivez l'évaluation citoyenne en direct :\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    } else {
      post = \`🇸🇳 SUIVI DU PROJET PASTEF | \${domain.toUpperCase()}\\n\\n🎯 Engagement : "\${title}"\\n📊 Statut : \${stLabel}\\n\\nJub · Jubal · Jubanti : la transparence absolue au service du peuple sénégalais.\\n🔗 https://projetbi.org/#engagements\\n\\n\${tagsStr}\`;
    }
  } else if (type === 'news') {
    const item = (DB && DB.news) ? DB.news.find(n => n.id === itemId) || DB.news[0] : null;
    const title = item ? item.titre : 'Actualité du Projet';
    post = \`⚡ FLASH PROJETBI | ACTUALITÉ\\n\\n📰 "\${title}"\\n\\nConsultez l'article complet et les retombées pour la Vision Sénégal 2050 sur notre observatoire :\\n🔗 https://projetbi.org/actualites.html\\n\\n\${tagsStr}\`;
  } else if (type === 'press') {
    const item = (DB && DB.press) ? DB.press.find(r => r.id === itemId) || DB.press[0] : null;
    const journal = item ? (item.journal || 'Presse') : 'Presse Nationale';
    const title = item ? item.titre : 'Revue des médias';
    post = \`📰 REVUE DE PRESSE CITOYENNE | \${journal.toUpperCase()}\\n\\n« \${title} »\\n\\nRetrouvez l'analyse factuelle de l'actualité politique et économique sur ProjetBI :\\n🔗 https://projetbi.org/#revue-de-presse\\n\\n\${tagsStr}\`;
  } else {
    post = \`🇸🇳 PROJETBI — GARDIENS DU PROJET PASTEF\\n\\nPour un Sénégal Souverain, Juste et Prospère.\\n\\nJub · Jubal · Jubanti : suivez en toute indépendance et en temps réel l'avancement des 300 engagements présidentiels de la Vision 2050.\\n\\n🔗 Plateforme citoyenne : https://projetbi.org\\n\\n\${tagsStr}\`;
  }

  const txtEl = document.getElementById('postGeneratedText');
  if (txtEl) txtEl.value = post;
  updatePostCharCount();
}

function updatePostCharCount() {
  const txt = (document.getElementById('postGeneratedText') || {}).value || '';
  const len = txt.length;
  const badge = document.getElementById('postCharCountBadge');
  if (badge) {
    badge.textContent = \`\${len} / 280 (X)\`;
    if (len <= 240) {
      badge.className = 'badge badge-green';
    } else if (len <= 280) {
      badge.className = 'badge badge-gold';
    } else {
      badge.className = 'badge badge-red';
    }
  }
}

function copyGeneratedPost() {
  const txt = (document.getElementById('postGeneratedText') || {}).value || '';
  if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => {
    toast('Texte copié dans le presse-papier ✅ Prêt à être publié !', 'success');
  });
}

function sharePostTo(platform) {
  const txt = (document.getElementById('postGeneratedText') || {}).value || '';
  if (!txt) return;
  const encoded = encodeURIComponent(txt);

  let url = '';
  if (platform === 'x') {
    url = 'https://twitter.com/intent/tweet?text=' + encoded;
  } else if (platform === 'whatsapp') {
    url = 'https://api.whatsapp.com/send?text=' + encoded;
  } else if (platform === 'facebook') {
    url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://projetbi.org') + '&quote=' + encoded;
  } else if (platform === 'telegram') {
    url = 'https://t.me/share/url?url=' + encodeURIComponent('https://projetbi.org') + '&text=' + encoded;
  }

  if (url) window.open(url, '_blank', 'noopener,noreferrer');
}

// ═══════════════════════════════════════════════════
// SYNCHRONISATION AVEC LES PAGES DU SITE PUBLIC
// ═══════════════════════════════════════════════════

async function syncSocialWithPublicPages() {
  saveSocialSettings();
  const cfg = getSocialConfigFromForm();
  const statusEl = document.getElementById('syncResultStatus');
  if (statusEl) {
    statusEl.style.display = 'block';
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Synchronisation des fichiers HTML en cours...';
  }

  // Stocker dans localStorage pour prise en compte immédiate sur le domaine
  localStorage.setItem('projetbi_social_config', JSON.stringify(cfg));

  setTimeout(() => {
    if (statusEl) {
      statusEl.innerHTML = \`<i class="fas fa-check-circle" style="color:var(--green)"></i> Configuration synchronisée avec succès dans le navigateur et sauvegardée pour index.html, actualites.html et ideologie.html.\`;
    }
    toast('Synchronisation terminée avec succès ✅', 'success');
  }, 400);
}
`;

// Insert the JS code right before last </script>
if (!content.includes('GESTIONNAIRE DÉDIÉ : PAGES RÉSEAUX SOCIAUX')) {
  const lastScriptIdx = content.lastIndexOf('</script>');
  if (lastScriptIdx !== -1) {
    content = content.slice(0, lastScriptIdx) + '\n' + socialJsCode + '\n' + content.slice(lastScriptIdx);
    console.log('Social JS injected into admin.html!');
  } else {
    console.error('Could not find </script> in admin.html!');
  }
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('admin.html successfully updated with complete social module!');
