const fs = require('fs');
const path = require('path');

const adminPath = path.resolve('admin.html');
let content = fs.readFileSync(adminPath, 'utf8');

// 1. CSS STYLES TO INJECT INTO <style>
const cssToInject = `
/* ═══════════════════════════════════════════════════
   PAGES RÉSEAUX SOCIAUX — STYLES DÉDIÉS
═══════════════════════════════════════════════════ */
.social-tabs {
  display: flex;
  gap: .5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: .75rem;
  margin-bottom: 1.25rem;
  overflow-x: auto;
}
.social-tab-btn {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  padding: .5rem 1rem;
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: .5rem;
  transition: all .2s;
  white-space: nowrap;
}
.social-tab-btn:hover {
  background: var(--bg2);
  color: var(--text);
  border-color: var(--border2);
}
.social-tab-btn.active {
  background: rgba(45, 95, 63, 0.2);
  border-color: var(--green);
  color: var(--green);
}
.social-tab-content {
  display: none;
}
.social-tab-content.active {
  display: block;
  animation: fadeIn .25s ease;
}

/* Grille des profils réseaux */
.social-networks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
}
.social-net-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem;
  transition: transform .2s, border-color .2s;
  position: relative;
}
.social-net-card:hover {
  border-color: var(--border2);
  transform: translateY(-2px);
}
.social-net-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .85rem;
  padding-bottom: .6rem;
  border-bottom: 1px solid var(--border);
}
.social-net-title {
  display: flex;
  align-items: center;
  gap: .65rem;
  font-weight: 700;
  font-size: .95rem;
  color: var(--text);
}
.social-net-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: #fff;
}

/* Switch Toggle iOS */
.social-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.social-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.social-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: var(--bg3);
  border: 1px solid var(--border);
  transition: .3s;
  border-radius: 24px;
}
.social-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text3);
  transition: .3s;
  border-radius: 50%;
}
.social-switch input:checked + .social-slider {
  background-color: var(--green);
  border-color: var(--green);
}
.social-switch input:checked + .social-slider:before {
  transform: translateX(20px);
  background-color: #FFFFFF;
}

/* Simulateurs de Partage */
.sim-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 1.25rem;
}
.sim-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.sim-box-title {
  font-size: .85rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: .5rem;
}

/* X / Twitter card mockup */
.mockup-x {
  background: #000000;
  border: 1px solid #2F3336;
  border-radius: 16px;
  padding: 12px;
  color: #E7E9EA;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.mockup-x-header {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}
.mockup-x-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}
.mockup-x-author {
  font-weight: 700;
  font-size: 14px;
}
.mockup-x-handle {
  color: #71767B;
  font-weight: 400;
  font-size: 13px;
}
.mockup-x-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 10px;
}
.mockup-x-card {
  border: 1px solid #2F3336;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
}
.mockup-x-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
  background: #1A3D28;
}
.mockup-x-content {
  padding: 10px 12px;
}
.mockup-x-domain {
  font-size: 12px;
  color: #71767B;
}
.mockup-x-title {
  font-size: 14px;
  font-weight: 700;
  color: #E7E9EA;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mockup-x-desc {
  font-size: 12px;
  color: #71767B;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Facebook mockup */
.mockup-fb {
  background: #242526;
  border: 1px solid #3A3B3C;
  border-radius: 8px;
  color: #E4E6EB;
  font-family: Helvetica, Arial, sans-serif;
  overflow: hidden;
}
.mockup-fb-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}
.mockup-fb-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
}
.mockup-fb-name {
  font-weight: 700;
  font-size: 14px;
}
.mockup-fb-time {
  font-size: 11px;
  color: #B0B3B8;
}
.mockup-fb-text {
  padding: 0 12px 10px;
  font-size: 13px;
}
.mockup-fb-img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
  background: #1A3D28;
}
.mockup-fb-meta {
  background: #3A3B3C;
  padding: 8px 12px;
}
.mockup-fb-domain {
  font-size: 11px;
  color: #B0B3B8;
  text-transform: uppercase;
}
.mockup-fb-title {
  font-size: 14px;
  font-weight: 700;
  color: #E4E6EB;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mockup-fb-desc {
  font-size: 11px;
  color: #B0B3B8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* WhatsApp mockup */
.mockup-wa {
  background: #0B141A;
  border-radius: 8px;
  padding: 14px;
  border: 1px solid var(--border);
}
.mockup-wa-bubble {
  background: #005C4B;
  color: #E9EDEF;
  border-radius: 8px;
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-shadow: 0 1px 2px rgba(0,0,0,.3);
}
.mockup-wa-card {
  background: rgba(0,0,0,0.25);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
.mockup-wa-img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
  background: #1A3D28;
}
.mockup-wa-body {
  padding: 6px 8px;
}
.mockup-wa-title {
  font-size: 13px;
  font-weight: 700;
  color: #53BDEB;
}
.mockup-wa-desc {
  font-size: 11px;
  color: #8696A0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mockup-wa-domain {
  font-size: 10px;
  color: #8696A0;
  margin-top: 2px;
}
.mockup-wa-text {
  font-size: 13px;
  line-height: 1.3;
}

/* Hashtag Pills */
.htag-pill {
  background: var(--bg3);
  border: 1px solid var(--border);
  color: var(--text2);
  padding: .3rem .65rem;
  border-radius: 20px;
  font-size: .75rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .3rem;
  transition: all .15s;
  user-select: none;
}
.htag-pill:hover {
  border-color: var(--gold);
  color: var(--gold);
}
.htag-pill.active {
  background: rgba(201, 168, 76, 0.2);
  border-color: var(--gold);
  color: var(--gold);
  font-weight: 700;
}
`;

// Check if css already injected
if (!content.includes('PAGES RÉSEAUX SOCIAUX — STYLES DÉDIÉS')) {
  content = content.replace('</style>', `${cssToInject}\n</style>`);
  console.log('CSS injected successfully!');
}

fs.writeFileSync(adminPath, content, 'utf8');
console.log('Admin CSS updated.');
