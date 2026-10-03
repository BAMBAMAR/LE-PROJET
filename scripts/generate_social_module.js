const fs = require('fs');
const path = require('path');

// 1. CSS for Social Media Management
const socialCss = `
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

/* Grille des profils */
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
}

/* Switch Toggle */
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
input:checked + .social-slider {
  background-color: var(--green);
  border-color: var(--green);
}
input:checked + .social-slider:before {
  transform: translateX(20px);
  background-color: #FFFFFF;
}

/* Live Preview Cards */
.live-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}
.preview-card-wrap {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.preview-card-header {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border);
  font-size: .8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* X / Twitter Preview Simulator */
.sim-x-card {
  background: #000000;
  color: #E7E9EA;
  border: 1px solid #2F3336;
  border-radius: 16px;
  padding: 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 480px;
  margin: 0 auto;
}
.sim-x-user-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
}
.sim-x-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.sim-x-meta-box {
  border: 1px solid #2F3336;
  border-radius: 12px;
  overflow: hidden;
  margin-top: 10px;
  background: #000000;
}
.sim-x-media-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  background: #16181C;
}
.sim-x-media-info {
  padding: 10px 12px;
}
.sim-x-domain {
  font-size: 13px;
  color: #71767B;
}
.sim-x-title {
  font-size: 15px;
  font-weight: 700;
  color: #E7E9EA;
  margin: 2px 0 4px;
  line-height: 1.3;
}
.sim-x-desc {
  font-size: 13px;
  color: #71767B;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Facebook Simulator */
.sim-fb-card {
  background: #242526;
  color: #E4E6EB;
  border: 1px solid #3A3B3C;
  border-radius: 8px;
  font-family: Helvetica, Arial, sans-serif;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
}
.sim-fb-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}
.sim-fb-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sim-fb-post-text {
  padding: 0 12px 10px;
  font-size: 14px;
}
.sim-fb-media-img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
}
.sim-fb-meta-box {
  background: #3A3B3C;
  padding: 10px 12px;
  border-top: 1px solid #4E4F50;
}
.sim-fb-domain {
  font-size: 11px;
  color: #B0B3B8;
  text-transform: uppercase;
}
.sim-fb-title {
  font-size: 15px;
  font-weight: 700;
  color: #E4E6EB;
  margin: 3px 0;
}
.sim-fb-desc {
  font-size: 12px;
  color: #B0B3B8;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* WhatsApp Simulator */
.sim-wa-card {
  background: #0B141A;
  padding: 16px;
  border-radius: 12px;
  max-width: 420px;
  margin: 0 auto;
}
.sim-wa-bubble {
  background: #005C4B;
  color: #E9EDEF;
  border-radius: 8px;
  padding: 8px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-shadow: 0 1px 2px rgba(0,0,0,.3);
  position: relative;
}
.sim-wa-link-preview {
  background: rgba(0,0,0,0.25);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
.sim-wa-media-img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}
.sim-wa-info {
  padding: 8px 10px;
}
.sim-wa-title {
  font-size: 14px;
  font-weight: 700;
  color: #53BDEB;
  margin-bottom: 3px;
}
.sim-wa-desc {
  font-size: 12px;
  color: #8696A0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sim-wa-domain {
  font-size: 11px;
  color: #8696A0;
  margin-top: 4px;
}
`;

console.log('CSS ready, length:', socialCss.length);
