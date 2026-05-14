/* ============================================================
 *  sw.js — KANNAWA 蒸気帯観察記録 / KNNW-2026
 *  - アプリ shell（HTML/CSS/JS/写真）: cache-first
 *  - Mapbox / OSM タイル              : stale-while-revalidate
 *  - その他（外部CDN）                : network-first
 * ============================================================ */

// バージョンを上げるとクライアントは再キャッシュする
const VERSION    = 'knnw-2026-v3';
const SHELL_CACHE = `${VERSION}-shell`;
const TILES_CACHE = `${VERSION}-tiles`;

// プリキャッシュ対象（アプリ起動に必須のもの）
const SHELL_ASSETS = [
  './',
  'index.html',
  'app.js',
  'map-config.js',
  'kannawa-data.js',
  'manifest.json',
  'favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  // 写真サムネ（軽い・全ピンに必要）
  'photos/KNNW_01_th.jpg', 'photos/KNNW_02_th.jpg', 'photos/KNNW_03_th.jpg',
  'photos/KNNW_04_th.jpg', 'photos/KNNW_05_th.jpg', 'photos/KNNW_06_th.jpg',
  'photos/KNNW_07_th.jpg', 'photos/KNNW_08_th.jpg', 'photos/KNNW_09_th.jpg',
  'photos/KNNW_10_th.jpg', 'photos/KNNW_11_th.jpg', 'photos/KNNW_12_th.jpg',
  'photos/KNNW_13_th.jpg', 'photos/KNNW_14_th.jpg',
  // Leaflet 本体（unpkg）
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// ——— install ———————————————————————————————
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      // unpkg/Google Fonts などはno-corsで取得（opaqueになるがキャッシュは可能）
      return Promise.all(SHELL_ASSETS.map((url) => {
        const req = new Request(url, /^https?:/.test(url) ? { mode: 'no-cors' } : {});
        return cache.add(req).catch((e) => console.warn('precache skip:', url, e));
      }));
    }).then(() => self.skipWaiting())
  );
});

// ——— activate（古い世代を掃除）—————————————
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ——— fetch ————————————————————————————————
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // タイル: stale-while-revalidate（速い表示 + バックグラウンド更新）
  if (/api\.mapbox\.com|tile\.openstreetmap|cyberjapandata\.gsi\.go\.jp/.test(url.hostname)) {
    event.respondWith(staleWhileRevalidate(req, TILES_CACHE));
    return;
  }

  // 写真: cache-first（更新頻度が低い）
  if (/\.(jpg|jpeg|png|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // 同一オリジンのアプリshell: cache-first
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(req, SHELL_CACHE));
    return;
  }

  // 外部リソース（Google Fonts等）: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
});

// —— ヘルパー ————————————————————————————————
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit   = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    // ネットワークも無く、キャッシュも無い → 404相当を返す
    return new Response('offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit   = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => hit);
  return hit || fetchPromise;
}
