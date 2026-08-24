// ============================================================
// SERVICE WORKER — ProjetBI.org  v5
// Network-First pour HTML, Cache-First pour assets statiques
// ============================================================

const STATIC_CACHE = 'projetbi-static-v105';
const DATA_CACHE   = 'projetbi-data-v105';

// Base du SW — fonctionne en racine ou sous-dossier
const BASE = self.registration.scope;

// Domaines à laisser passer sans interception
const PASSTHROUGH_DOMAINS = [
  'supabase.co',
  'cdnjs.cloudflare.com',
  'cdn.jsdelivr.net',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cloudflareinsights.com',
  'fbcdn.net',
  'facebook.com',
  'scontent.',
  'z-p3-scontent.',
  'picsum.photos',
];

// Chemins relatifs à la base du SW
const STATIC_ASSETS = [
  BASE,
  BASE + 'index.html',
  BASE + 'actualites.html',
  BASE + 'style.css',
  BASE + 'app.js',
  BASE + 'utils.js',
  BASE + 'render.js',
  BASE + 'manifest.json',
  BASE + 'favicon.png',
];

const DATA_ASSETS = [
  BASE + 'promises.json',
  BASE + 'news.json',
  BASE + 'press.json',
];

// Pages admin — jamais en cache (chemin complet)
const NO_CACHE_PAGES = ['admin.html', 'kit-communication.html', 'update_press_simple.html'];

const OFFLINE_HTML = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>ProjetBI — Hors-ligne</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;
min-height:100vh;margin:0;background:#0C0F0A;color:#E8F0E5;text-align:center;padding:2rem}
h1{color:#4ADE80}p{color:#9DB89A;margin-bottom:1.5rem}
a{color:#4ADE80;border:1px solid #4ADE80;padding:.5rem 1.2rem;border-radius:8px;text-decoration:none}
</style></head><body><div>
<h1>Hors-ligne</h1><p>Vous n'êtes pas connecté à Internet.</p>
<a href="/">Réessayer</a></div></body></html>`;

// ── INSTALLATION
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.allSettled([
      caches.open(STATIC_CACHE).then(c =>
        Promise.allSettled(STATIC_ASSETS.map(u => c.add(u).catch(() => {})))),
      caches.open(DATA_CACHE).then(c =>
        Promise.allSettled(DATA_ASSETS.map(u => c.add(u).catch(() => {})))),
    ]).then(() => self.skipWaiting())
  );
});

// ── ACTIVATION — supprime anciens caches + notifie les pages ouvertes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DATA_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: 'v105' }));
      })
  );
});

function shouldPassthrough(url) {
  return PASSTHROUGH_DOMAINS.some(d => url.hostname.includes(d));
}

// Réponse cacheable : HTTP 200 uniquement, jamais opaque ni error
function isCacheable(r) {
  return r &&
    r.status === 200 &&
    r.type !== 'error' &&
    r.type !== 'opaqueredirect';
}

// ── FETCH
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Laisser passer domaines externes
  if (shouldPassthrough(url)) return;

  // Pages admin — jamais en cache
  if (NO_CACHE_PAGES.some(p => url.href.endsWith(p))) return;

  // ── JSON & Revue de presse : Network First, cache fallback
  if (url.pathname.endsWith('.json') || url.pathname.includes('/revuedepresse/')) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).then(res => {
        if (isCacheable(res)) {
          const toCache = res.clone();
          caches.open(DATA_CACHE).then(c => c.put(req, toCache));
        }
        return res;
      }).catch(async () => {
        const cached = await caches.match(req);
        return cached || new Response('{"error":"offline"}', {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // ── Pages HTML : Network First — les mises à jour sont immédiates
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).then(res => {
        if (isCacheable(res)) {
          const toCache = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(req, toCache));
        }
        return res;
      }).catch(async () => {
        const cached = await caches.match(req);
        return cached || new Response(OFFLINE_HTML, {
          status: 200,
          headers: { 'Content-Type': 'text/html;charset=utf-8' }
        });
      })
    );
    return;
  }

  // ── Assets statiques (JS, CSS, images) : Cache First + revalidation silencieuse
  event.respondWith((async () => {
    const cached = await caches.match(req);

    if (cached) {
      // Revalidation en arrière-plan
      fetch(req).then(fresh => {
        if (isCacheable(fresh)) {
          caches.open(STATIC_CACHE).then(c => c.put(req, fresh.clone()));
        }
      }).catch(() => {});

      return cached;
    }

    // Rien en cache — aller chercher sur le réseau
    try {
      const res = await fetch(req);
      if (isCacheable(res)) {
        const toCache = res.clone();
        caches.open(STATIC_CACHE).then(c => c.put(req, toCache));
      }
      return res;
    } catch {
      return new Response('', { status: 408, statusText: 'Network timeout' });
    }
  })());
});

// ── PUSH NOTIFICATIONS
self.addEventListener('push', event => {
  if (!event.data) return;
  try {
    const d = event.data.json();
    event.waitUntil(
      self.registration.showNotification(d.title || 'ProjetBI', {
        body: d.body || 'Nouvelle mise à jour',
        icon: '/favicon.png',
        data: { url: d.url || '/' },
        actions: [{ action: 'open', title: 'Voir' }]
      })
    );
  } catch { /* données push malformées */ }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // FIX: Valider l'URL — bloquer les schémas dangereux
  const rawUrl = event.notification.data?.url || '/';
  let safeNotifUrl = '/';
  try {
    const parsed = new URL(rawUrl, self.registration.scope);
    // N'autoriser que les URLs du même origine
    if (parsed.origin === new URL(self.registration.scope).origin) {
      safeNotifUrl = parsed.href;
    }
  } catch {}
  event.waitUntil(clients.openWindow(safeNotifUrl));
});

