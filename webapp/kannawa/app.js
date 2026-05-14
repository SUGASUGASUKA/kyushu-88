// =============================================================
//  app.js  ── 鉄輪 観察記録 / 撮影地マップ
//  - Leaflet で Mapbox Light タイルを敷く
//  - KANNAWA_DATA の 14 点に番号入り角型ピンを配置
//  - ピン押下で観察カード（計器ログ風ポップアップ）を開く
// =============================================================

(function () {
  'use strict';

  // —— 開発環境判定（localhost なら ✎ などの開発用UIを出す）—
  var IS_DEV = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (IS_DEV) document.body.setAttribute('data-env', 'dev');

  // —— map-config.js から設定を読む（緊急切替はあちらを編集）—
  var CFG          = window.MAP_CONFIG || {};
  var TILE_MODE    = CFG.MAP_TILE     || 'auto';   // 'auto' | 'mapbox' | 'osm'
  var MAPBOX_TOKEN = CFG.MAPBOX_TOKEN || '';
  var ERR_THRESHOLD = CFG.AUTO_FALLBACK_ERRORS || 6;

  // —— 1. 地図初期化 ————————————————————————————————————————
  var map = L.map('map', {
    center: KANNAWA_VIEW.center,
    zoom:   KANNAWA_VIEW.zoom,
    zoomControl: true,
    attributionControl: true,
    minZoom: 13,
    maxZoom: 19,
    // ZINE の静謐感に合わせて、わずかにイナーシャを抑える
    inertiaDeceleration: 2400,
    zoomSnap: 0.5
  });

  // —— タイル定義 ————————————————————————————————————————
  var MAPBOX_TILES = {
    url: 'https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}{r}?access_token=' + MAPBOX_TOKEN,
    options: {
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 19,
      attribution:
        '© <a href="https://www.mapbox.com/about/maps/" target="_blank" rel="noopener">Mapbox</a> ' +
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }
  };
  var OSM_TILES = {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }
  };

  // —— タイル装着 + 自動フォールバック —————————————————
  var currentLayer = null;
  var mapboxErrors = 0;

  function attach(tileSpec) {
    if (currentLayer) map.removeLayer(currentLayer);
    currentLayer = L.tileLayer(tileSpec.url, tileSpec.options).addTo(map);
    return currentLayer;
  }

  function fallbackToOsm(reason) {
    if (currentLayer === null) return;
    if (currentLayer.options && currentLayer.options.attribution &&
        currentLayer.options.attribution.indexOf('Mapbox') === -1) return; // 既にOSM
    console.warn('[map] Mapbox → OSM fallback:', reason);
    attach(OSM_TILES);
  }

  if (TILE_MODE === 'osm' || !MAPBOX_TOKEN) {
    attach(OSM_TILES);
  } else {
    var layer = attach(MAPBOX_TILES);
    if (TILE_MODE === 'auto') {
      layer.on('tileerror', function () {
        mapboxErrors++;
        if (mapboxErrors >= ERR_THRESHOLD) fallbackToOsm('errors=' + mapboxErrors);
      });
    }
  }

  // —— 2. ナンバーピン生成 ———————————————————————————————
  function makePin(spot) {
    var v = (VAPOR_COLORS[spot.vapor.lv] || VAPOR_COLORS[2]).color;
    var html =
      '<div class="knnw-pin" data-no="' + spot.no + '">' +
        '<div class="pin-body">' + spot.no + '</div>' +
        '<div class="pin-stem"></div>' +
        '<div class="pin-dot" style="background:' + v + '"></div>' +
      '</div>';
    return L.divIcon({
      className: 'knnw-pin-wrap',
      html: html,
      iconSize:   [34, 40],
      iconAnchor: [17, 39],   // 先端（stem底）でアンカー
      popupAnchor: [0, -36]
    });
  }

  // 全マーカーを保持（FIT 用）
  var markers = [];
  var markerByNo = {};

  KANNAWA_DATA.forEach(function (spot) {
    var m = L.marker([spot.lat, spot.lng], {
      icon: makePin(spot),
      title: 'KNNW-2026 ' + spot.no,
      keyboard: true,
      riseOnHover: true,
      alt: '撮影地 ' + spot.no
    }).addTo(map);

    m.on('click', function () { openPopup(spot, m); });
    m.on('keypress', function (e) {
      if (e.originalEvent && (e.originalEvent.key === 'Enter' || e.originalEvent.key === ' ')) {
        openPopup(spot, m);
      }
    });

    markers.push(m);
    markerByNo[spot.no] = m;
  });

  // —— 3. 起動時に全スポットへフィット ——————————————————
  var bounds = L.latLngBounds(
    KANNAWA_DATA.map(function (s) { return [s.lat, s.lng]; })
  );

  function fitAll(animate) {
    map.fitBounds(bounds, {
      padding: KANNAWA_VIEW.fitPadding || [40, 40],
      animate: !!animate,
      // ZINE 14点は ~500m 四方に分布、中央に9点が密集するため
      // 17 程度まで寄せて個々のピンを見分けやすくする
      maxZoom: 17
    });
  }
  if (KANNAWA_VIEW.fitBounds) fitAll(false);

  document.getElementById('btn-fit').addEventListener('click', function () {
    closePopup();
    fitAll(true);
  });

  // —— 現在地 ————————————————————————————————————————————————
  var locateBtn  = document.getElementById('btn-locate');
  var toastEl    = document.getElementById('locate-toast');
  var meMarker   = null;
  var meAccCircle = null;
  var meWatchId  = null;
  var lastFix    = 0;

  function toast(msg, ms) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toast._t);
    if (ms !== 0) toast._t = setTimeout(function () {
      toastEl.classList.remove('is-on');
    }, ms || 2400);
  }

  function showMe(pos, opts) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;
    var acc = pos.coords.accuracy || 30;
    if (!meMarker) {
      meMarker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'me-pulse-wrap',
          html: '<div class="me-pulse"></div>',
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1000
      }).addTo(map);
      meAccCircle = L.circle([lat, lng], {
        radius: acc,
        color: '#3B6EA8',
        weight: 1,
        opacity: 0.4,
        fillColor: '#3B6EA8',
        fillOpacity: 0.08,
        interactive: false
      }).addTo(map);
    } else {
      meMarker.setLatLng([lat, lng]);
      meAccCircle.setLatLng([lat, lng]);
      meAccCircle.setRadius(acc);
    }
    // 鉄輪エリア外（>1km）ならズーム控えめ、エリア内なら寄せる
    if (opts && opts.pan) {
      var c = bounds.getCenter();
      var dist = map.distance([lat, lng], c);
      if (dist > 1500) {
        map.flyTo([lat, lng], 14, { duration: 0.6 });
        toast('現在地は鉄輪から離れています');
      } else {
        map.flyTo([lat, lng], Math.max(map.getZoom(), 17), { duration: 0.5 });
      }
    }
  }

  function locateError(err) {
    locateBtn.classList.remove('is-loading', 'is-on');
    var msg = '現在地を取得できませんでした';
    if (err && err.code === 1) msg = '位置情報の利用が許可されていません';
    if (err && err.code === 3) msg = '位置情報の取得がタイムアウトしました';
    toast(msg, 3200);
  }

  function startLocate() {
    if (!('geolocation' in navigator)) {
      toast('この端末では位置情報を取得できません', 3000);
      return;
    }
    // 初回だけプライバシーノート（端末内処理であることを明示）
    if (!localStorage.getItem('knnw_geo_seen')) {
      try { localStorage.setItem('knnw_geo_seen', '1'); } catch (e) {}
      toast('現在地はこの端末でのみ使用 ／ 外部送信はしません', 3800);
      // 少し待ってから取得へ
      setTimeout(function () { _doLocate(); }, 1200);
      return;
    }
    _doLocate();
  }

  function _doLocate() {
    locateBtn.classList.add('is-loading');
    toast('現在地を取得中…', 0);
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        locateBtn.classList.remove('is-loading');
        locateBtn.classList.add('is-on');
        toastEl.classList.remove('is-on');
        lastFix = Date.now();
        showMe(pos, { pan: true });
        // フォロー継続（追従モード）
        if (meWatchId == null) {
          meWatchId = navigator.geolocation.watchPosition(
            function (p) {
              lastFix = Date.now();
              showMe(p, { pan: false });
            },
            function () { /* watch失敗は無視 */ },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
          );
        }
      },
      locateError,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 12000 }
    );
  }

  function stopLocate() {
    if (meWatchId != null) {
      navigator.geolocation.clearWatch(meWatchId);
      meWatchId = null;
    }
    if (meMarker)    { map.removeLayer(meMarker);    meMarker = null; }
    if (meAccCircle) { map.removeLayer(meAccCircle); meAccCircle = null; }
    locateBtn.classList.remove('is-on', 'is-loading');
    toastEl.classList.remove('is-on');
  }

  locateBtn.addEventListener('click', function () {
    if (locateBtn.classList.contains('is-on')) {
      // 2回目押下：表示中の現在地を OFF にする
      stopLocate();
    } else if (locateBtn.classList.contains('is-loading')) {
      // 取得中：何もしない
    } else {
      startLocate();
    }
  });

  // —— 4. 観察カード（ポップアップ）—————————————————————
  var popup     = document.getElementById('popup');
  var backdrop  = document.getElementById('popup-backdrop');
  var elNo      = document.getElementById('pop-no');
  var elImg     = document.getElementById('pop-img');
  var elCap     = document.getElementById('pop-cap');
  var elTime    = document.getElementById('pop-time');
  var elVapor   = document.getElementById('pop-vapor');
  var elLoc     = document.getElementById('pop-loc');
  var elGmaps   = document.getElementById('pop-gmaps');
  var elRoute   = document.getElementById('pop-route');
  var btnClose  = document.getElementById('pop-close');
  var btnPrev   = document.getElementById('pop-prev');
  var btnNext   = document.getElementById('pop-next');

  var activeNo = null;

  function setActivePin(no) {
    document.querySelectorAll('.knnw-pin').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-no') === no);
    });
    activeNo = no;
  }

  function fmtNum(n, digits) {
    if (n === null || n === undefined || isNaN(n)) return null;
    return digits ? Number(n).toFixed(digits) : String(n);
  }

  function renderTime(spot) {
    // TIME 07:09 ・ TEMP 14°C ・ HUMID 60% ・ VIS 10.0m
    if (!spot.time) {
      elTime.innerHTML =
        '<span style="color:var(--ink-muted)">— LOG NOT RECORDED —</span>';
      return;
    }
    var sep = '<span class="sep">・</span>';
    elTime.innerHTML =
      'TIME ' + spot.time + sep +
      'TEMP ' + spot.temp + '°C' + sep +
      'HUMID ' + spot.humid + '%' + sep +
      'VIS '  + fmtNum(spot.vis, 1) + 'm';
  }

  function renderVapor(spot) {
    var v = VAPOR_COLORS[spot.vapor.lv] || VAPOR_COLORS[2];
    elVapor.innerHTML =
      'Lv.' + spot.vapor.lv +
      '<span class="vapor-pip" style="border-color:' + v.color + ';color:' + v.color + ';background:' + v.bg + '">' +
        '<span style="background:' + v.color + ';width:7px;height:7px;border-radius:50%;display:inline-block"></span>' +
        v.name +
      '</span>';
  }

  function openPopup(spot, marker) {
    elNo.textContent = spot.no;

    // 写真サムネ → 高解像度切替（先に thumb を表示し、popup 用画像を裏で読み込む）
    elImg.src = spot.thumb || spot.photo;
    elImg.alt = 'KNNW-2026 ' + spot.no + (spot.title ? ' / ' + spot.title : '');
    if (spot.photo && spot.photo !== spot.thumb) {
      var hi = new Image();
      hi.onload = function () {
        if (activeNo === spot.no) elImg.src = spot.photo;
      };
      hi.src = spot.photo;
    }

    if (spot.title) {
      elCap.textContent = spot.title;
      elCap.hidden = false;
    } else {
      elCap.hidden = true;
    }

    renderTime(spot);
    renderVapor(spot);
    elLoc.textContent = spot.locDms;

    var ll = spot.lat + ',' + spot.lng;
    elGmaps.href = 'https://www.google.com/maps/search/?api=1&query=' + ll;
    elRoute.href = 'https://www.google.com/maps/dir/?api=1&destination=' + ll + '&travelmode=walking';

    popup.classList.add('is-open');
    backdrop.classList.add('is-open');
    setActivePin(spot.no);

    // ピンを画面中央上寄りに（カードで隠れないように）
    if (marker) {
      var pt = map.latLngToContainerPoint(marker.getLatLng());
      var h  = window.innerHeight || document.documentElement.clientHeight;
      var targetY = h * 0.30;   // 画面の上から 30%
      var dy = pt.y - targetY;
      if (Math.abs(dy) > 30) {
        map.panBy([0, dy], { animate: true, duration: 0.35 });
      }
    }
  }

  function closePopup() {
    popup.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    setActivePin(null);
  }

  function step(delta) {
    if (!activeNo) return;
    var idx = KANNAWA_DATA.findIndex(function (s) { return s.no === activeNo; });
    if (idx < 0) return;
    var next = (idx + delta + KANNAWA_DATA.length) % KANNAWA_DATA.length;
    var spot = KANNAWA_DATA[next];
    openPopup(spot, markerByNo[spot.no]);
  }

  btnClose.addEventListener('click', closePopup);
  btnPrev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
  btnNext.addEventListener('click', function (e) { e.stopPropagation(); step(+1); });
  backdrop.addEventListener('click', closePopup);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape')    closePopup();
    if (e.key === 'ArrowLeft'  && popup.classList.contains('is-open')) step(-1);
    if (e.key === 'ArrowRight' && popup.classList.contains('is-open')) step(+1);
  });

  // 地図クリック（ピン以外）でも閉じる
  map.on('click', closePopup);

  // —— PWA: Service Worker 登録（dev/localhost も含めて常時）—————
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function (e) {
        console.warn('SW register failed:', e);
      });
    });
  }

  // —— 5. ハッシュリンク（#01 〜 #14 で直接そのスポットを開く）—
  function openByHash() {
    var m = (location.hash || '').match(/#(\d{1,2})/);
    if (!m) return;
    var no = ('0' + parseInt(m[1], 10)).slice(-2);
    var spot = KANNAWA_DATA.find(function (s) { return s.no === no; });
    if (spot) {
      // 少し遅延させてフィット完了後に開く
      setTimeout(function () { openPopup(spot, markerByNo[no]); }, 300);
    }
  }
  window.addEventListener('hashchange', openByHash);
  openByHash();
})();
