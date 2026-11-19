/* Modo sin conexión: siempre intenta la red primero (así ves lo último) y, si no hay red, usa la copia guardada. */
const CACHE = 'mando-v2';
const BASE = ['./', 'index.html', 'estudio/curso.js', 'estudio/estudio.js', 'estudio/estudio.css', 'modulos/noticias.js', 'modulos/banca.js', 'modulos/tradovate.js', 'modulos/sync.js', 'modulos/legacy.js', 'firebase-config.js', 'manifest.webmanifest', 'icons/icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('mando-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !/^https?:/.test(req.url)) return;
  e.respondWith(
    fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined)))
  );
});
