const VERSION = '8-1-snd';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './NaskhArabic-400.woff2', './NaskhArabic-700.woff2'];
const PDFS = ["./english-book.pdf", "./english-cards.pdf", "./english-cards-g1.pdf", "./english-cards-g2.pdf", "./english-cards-g3.pdf", "./english-cards-g4.pdf", "./english-cards-g5.pdf", "./english-cards-g6.pdf", "./english-cards-g7.pdf", "./english-cards-g8.pdf"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL).then(() => Promise.all(PDFS.map(u => c.add(u).catch(() => {}))))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// App files: cache first. Google Fonts: cached the first time they load, so they work offline after that.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !fonts) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: false }).then(hit => {
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      return hit || net;
    })
  );
});
