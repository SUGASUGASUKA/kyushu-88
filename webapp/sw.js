// Service Worker - オフライン対応・ホーム画面追加を有効にする
var CACHE_NAME = 'onsen88-v65';

// 同一オリジン：HTTP キャッシュを無視して常に最新を取得
var CACHE_INTERNAL = [
  '/',
  '/index.html',
  '/app.js',
  '/map-config.js',
  '/onsen-data.js',
  '/manifest.json',
];

// 外部 CDN：通常キャッシュ（CORS 制約のため reload 不可）
var CACHE_EXTERNAL = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // 同一オリジン: cache:'reload' で HTTP キャッシュをバイパス
      var p1 = Promise.all(
        CACHE_INTERNAL.map(function(url) {
          return cache.add(new Request(url, { cache: 'reload' }));
        })
      );
      // 外部 CDN: 通常取得
      var p2 = cache.addAll(CACHE_EXTERNAL);
      return Promise.all([p1, p2]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // OpenStreetMapのタイルはキャッシュしない（容量節約）
  if (e.request.url.includes('tile.openstreetmap.org')) return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() { return cached; });
    })
  );
});
