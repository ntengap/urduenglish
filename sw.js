const VERSION = 'urdu-daily-v1-snd';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png', './NastaliqUrdu.woff2', './NaskhArabic-400.woff2', './NaskhArabic-700.woff2'];
const PDFS = ["./urdu-book.pdf", "./urdu-cards.pdf", "./urdu-cards-g1.pdf", "./urdu-cards-g2.pdf", "./urdu-cards-g3.pdf", "./urdu-cards-g4.pdf", "./urdu-cards-g5.pdf", "./urdu-cards-g6.pdf", "./urdu-cards-g7.pdf", "./urdu-cards-g8.pdf"];

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
