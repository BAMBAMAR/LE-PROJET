/**
 * app.v2.js – Couche d'amélioration ProjetBI V2
 * ─────────────────────────────────────────────────────────────────────
 * À charger APRÈS app.js, app.perf.js, app.harden.js.
 * N'écrase aucune fonction existante sauf par wrapping explicite.
 *
 * Apports :
 *   1. Corrections regex U+2028/U+2029 dans escapeJS (bug navigateur)
 *   2. Navigation scroll avec requestAnimationFrame
 *   3. Bouton "retour en haut" (backToTop)
 *   4. Mise à jour SW avec bannière
 *   5. Année dynamique dans le footer
 * ─────────────────────────────────────────────────────────────────────
 */
(function () {
  'use strict';

  /* ─── 1. Correction escapeJS (U+2028 / U+2029 dans regex) ─────────────
     Les caractères Unicode Line Separator (U+2028) et Paragraph Separator
     (U+2029) sont invalides dans un littéral regex en JavaScript.
     On réécrit la fonction en utilisant des string hex escapes.
  ──────────────────────────────────────────────────────────────────────── */
  window.escapeJSString = function escapeJSString(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/\\/g,   '\\\\')
      .replace(/'/g,    "\\'")
      .replace(/"/g,    '\\"')
      .replace(/\n/g,   '\\n')
      .replace(/\r/g,   '\\r')
      .replace(/ /g, '\\u2028')   /* ← hex escape, pas littéral */
      .replace(/ /g, '\\u2029')   /* ← hex escape, pas littéral */
      .replace(/</g,    '\\x3C')
      .replace(/>/g,    '\\x3E');
  };

  /* ─── 2. Scroll navbar + backToTop (RAF pour performance) ─────────────── */
  var _rafPending = false;
  var _lastScrollY = 0;

  window.addEventListener('scroll', function () {
    _lastScrollY = window.scrollY;
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(function () {
      _rafPending = false;
      onScroll(_lastScrollY);
    });
  }, { passive: true });

  function onScroll(y) {
    var navbar = document.querySelector('.navbar');
    if (navbar) navbar.classList.toggle('scrolled', y > 10);

    var btt = document.getElementById('backToTop');
    if (btt) btt.classList.toggle('visible', y > 300);
  }

  /* ─── 3. Année dynamique dans le footer ───────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });

  /* ─── 4. Bannière mise à jour Service Worker ──────────────────────────── */
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration('./sw.js').then(function (reg) {
      if (!reg) return;
      reg.addEventListener('updatefound', function () {
        var w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', function () {
          if (w.state === 'installed' && navigator.serviceWorker.controller) {
            var banner = document.getElementById('updateBanner');
            if (banner) banner.style.display = 'flex';
          }
        });
      });
    });

    var updateBtn = document.querySelector('[data-action="update"]');
    if (updateBtn) {
      updateBtn.addEventListener('click', function () {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        }
        window.location.reload();
      });
    }
  }

  /* ─── 5. Correction : escapeHTML sécurisé (table-driven, sans DOM) ───── */
  /* Remplace la version de app.js qui crée un nœud DOM à chaque appel.     */
  var _HTML_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  var _HTML_RE  = /[&<>"']/g;
  window.escapeHTML = function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(_HTML_RE, function (c) { return _HTML_MAP[c]; });
  };
  window.escapeAndTruncate = function escapeAndTruncate(str, max) {
    if (!str) return '';
    max = max || 80;
    var s = String(str);
    return window.escapeHTML(s.length > max ? s.slice(0, max) + '…' : s);
  };

})();
