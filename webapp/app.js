'use strict';

// ===== テーマ色をJSから参照できるようにする =====
var _T = (function() {
  var s = document.documentElement.style;
  return {
    brand       : function() { return s.getPropertyValue('--color-brand').trim()       || '#dc2626'; },
    brandDark   : function() { return s.getPropertyValue('--color-brand-dark').trim()  || '#991b1b'; },
    brandStroke : function() { return s.getPropertyValue('--color-brand-stroke').trim()|| '#7f1d1d'; },
    brandBg     : function() { return s.getPropertyValue('--color-brand-bg').trim()    || '#fee2e2'; },
    done        : function() { return s.getPropertyValue('--color-done').trim()        || '#2563eb'; },
    doneDark    : function() { return s.getPropertyValue('--color-done-dark').trim()   || '#1e3a8a'; },
    doneBg      : function() { return s.getPropertyValue('--color-done-bg').trim()     || '#dbeafe'; },
    doneHover   : function() { return s.getPropertyValue('--color-done-hover').trim()  || '#eff6ff'; },
  };
})();

// ===== 訪問済み管理 =====
var visitedSet = new Set();

function loadVisited() {
  try {
    var raw = localStorage.getItem('onsen88_visited');
    if (raw) visitedSet = new Set(JSON.parse(raw));
  } catch (e) { visitedSet = new Set(); }
}

function saveVisited() {
  try {
    localStorage.setItem('onsen88_visited', JSON.stringify(Array.from(visitedSet)));
  } catch (e) {}
}

function toggleVisited(id) {
  var isEx  = MAP_CONFIG.designKit === 'expedition';
  var isPop = MAP_CONFIG.designKit === 'pop-pilgrimage';
  var isSw  = MAP_CONFIG.designKit === 'swiss-minimal';
  var isRt  = MAP_CONFIG.designKit === 'retro-travel';
  var isFn  = MAP_CONFIG.designKit === 'field-notes';
  if (visitedSet.has(id)) {
    visitedSet.delete(id);
    showToast(isEx ? '↩ 踏破を取り消しました' : '↩ 取り消しました');
  } else {
    visitedSet.add(id);
    showToast(isEx
      ? '踏破しました！  ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount
      : isPop
        ? '✓ 行った！  ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount
        : isSw
          ? '✓  ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount
          : isRt
            ? '記録しました！  ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount
            : isFn
              ? '湯印  ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount
              : '♨ スタンプを押しました！ ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount);
  }
  saveVisited();
  updateMarker(id);
  updateProgress();
  if (currentFacility && currentFacility.id === id) updatePopupVisitedBtn();
}

// ===== 距離計算 =====
function haversineKm(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dlat = (lat2 - lat1) * Math.PI / 180;
  var dlng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dlat/2)*Math.sin(dlat/2)
        + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)
          *Math.sin(dlng/2)*Math.sin(dlng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ===== ヘッダー・総数をconfigから設定 =====
document.getElementById('header-icon').textContent = MAP_CONFIG.markerIcon;
document.getElementById('header-name').textContent = MAP_CONFIG.appName;

// ===== Leaflet 地図初期化 =====
var map = L.map('map', {
  center: MAP_CONFIG.mapCenter,
  zoom  : MAP_CONFIG.mapZoom,
  zoomControl: false
});

var _activeKit  = _DESIGN_KITS[MAP_CONFIG.designKit] || _DESIGN_KITS['field-notes'];
var _tileName   = (_activeKit.mapTile === 'mapbox' && !MAP_CONFIG.mapboxToken)
                  ? 'osm' : (_activeKit.mapTile || MAP_CONFIG.mapTile);
var _tile       = _TILES[_tileName] || _TILES.osm;
L.tileLayer(_tile.url, {
  attribution: _tile.attr,
  maxZoom    : _tile.maxZ,
}).addTo(map);

// ズームコントロールを右下に
L.control.zoom({ position: 'bottomright' }).addTo(map);

// ===== カスタムマーカーアイコン =====
function createIcon(visited) {
  var fill  = visited ? _T.done()     : _T.brand();
  var dark  = visited ? _T.doneDark() : _T.brandStroke();
  var bg    = visited ? _T.doneBg()   : _T.brandBg();
  var icon  = visited ? '✓' : MAP_CONFIG.markerIcon;
  var kit   = MAP_CONFIG.designKit;
  var svg, size, anchor, pop;

  if (kit === 'swiss-minimal') {
    // フラットスクエア・アイコンなし・影なし
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">'
      + '<rect x="0" y="0" width="20" height="20" fill="' + fill + '"/>'
      + '</svg>';
    size = [20, 20]; anchor = [10, 10]; pop = [0, -12];

  } else if (kit === 'field-notes') {
    // 和紙感・リング＋センタードット（未訪問：細リング+小点 / 訪問済み：朱リング+大点）
    svg = visited
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="10" fill="none" stroke="#8C3A2B" stroke-width="1.4"/>'
          + '<circle cx="11" cy="11" r="5" fill="#8C3A2B"/>'
          + '</svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="9" fill="none" stroke="#8C3A2B" stroke-width="1.2"/>'
          + '<circle cx="11" cy="11" r="2.5" fill="#8C3A2B"/>'
          + '</svg>';
    size = [22, 22]; anchor = [11, 11]; pop = [0, -13];

  } else if (kit === 'retro-travel') {
    // シンプル円マーカー（未訪問：shu細リング / 訪問済み：sumi塗り）
    svg = visited
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="10" fill="#181410"/>'
          + '</svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="9" fill="rgba(242,235,216,0.9)" stroke="#A23A2B" stroke-width="2"/>'
          + '</svg>';
    size = [22, 22]; anchor = [11, 11]; pop = [0, -13];

  } else if (kit === 'expedition') {
    // リング＋中心ドット（未訪問：細リング+小点 / 訪問済み：塗り+リング）
    svg = visited
      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="10" fill="none" stroke="' + fill + '" stroke-width="1.5"/>'
          + '<circle cx="11" cy="11" r="7" fill="' + fill + '"/>'
          + '</svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" width="22" height="22">'
          + '<circle cx="11" cy="11" r="10" fill="none" stroke="' + fill + '" stroke-width="1.5"/>'
          + '<circle cx="11" cy="11" r="4" fill="' + fill + '"/>'
          + '</svg>';
    size = [22, 22]; anchor = [11, 11]; pop = [0, -13];

  } else if (kit === 'pop-pilgrimage') {
    // プレミアムポップ: シンプル塗り円マーカー（punch/grape）
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">'
      + '<circle cx="10" cy="10" r="9" fill="' + fill + '"/>'
      + (visited ? '<circle cx="10" cy="10" r="4" fill="rgba(255,255,255,0.38)"/>' : '')
      + '</svg>';
    size = [20, 20]; anchor = [10, 10]; pop = [0, -12];

  } else {
    // field-notes（デフォルト）: ドロップシャドウ付きピン
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 42" width="30" height="35">'
      + '<ellipse cx="18" cy="39" rx="8" ry="3" fill="rgba(0,0,0,0.22)"/>'
      + '<circle cx="18" cy="18" r="16" fill="white"/>'
      + '<circle cx="18" cy="18" r="13" fill="' + fill + '"/>'
      + '<text x="18" y="23.5" text-anchor="middle" font-size="15" fill="white">' + icon + '</text>'
      + '</svg>';
    size = [30, 35]; anchor = [15, 35]; pop = [0, -35];
  }

  return L.divIcon({ html: svg, className: '', iconSize: size, iconAnchor: anchor, popupAnchor: pop });
}

// ===== マーカー管理 =====
var markers = {};

function addMarkers() {
  ONSEN_DATA.forEach(function(s) {
    var marker = L.marker([s.lat, s.lng], {
      icon: createIcon(visitedSet.has(s.id))
    }).addTo(map);

    marker.on('click', function() {
      openPopup(s);
    });

    markers[s.id] = marker;
  });
}

function updateMarker(id) {
  if (markers[id]) {
    markers[id].setIcon(createIcon(visitedSet.has(id)));
  }
}

// ===== ポップアップ =====
var currentFacility = null;
var popup     = document.getElementById('popup');
var backdrop  = document.getElementById('popup-backdrop');

function openPopup(s) {
  currentFacility = s;
  var isVisited = visitedSet.has(s.id);

  // 番号表示（expedition: NO.xxx / pop-pilgrimage: #xxx）
  var numEl = document.getElementById('popup-number');
  if (numEl) {
    var idx = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
    var kit = MAP_CONFIG.designKit;
    numEl.textContent = (kit === 'expedition' || kit === 'swiss-minimal')
      ? 'NO. ' + String(idx + 1).padStart(3, '0')
      : kit === 'pop-pilgrimage'
        ? '#' + String(idx + 1).padStart(3, '0')
        : (kit === 'retro-travel' || kit === 'field-notes')
          ? '第' + String(idx + 1).padStart(3, '0') + '番'
          : '';
  }

  var isEx = MAP_CONFIG.designKit === 'expedition';
  var isRtP = MAP_CONFIG.designKit === 'retro-travel';
  document.getElementById('popup-onsenti').textContent = (isEx || isRtP ? '' : '♨ ') + s.onsenti;
  document.getElementById('popup-onsenti').style.color = isVisited
    ? (isEx ? '#9DC4A8' : _T.done())
    : (isEx ? '#E8A882' : _T.brand());

  var badge = document.getElementById('popup-badge');
  badge.textContent = isVisited
    ? (isEx ? '✓ 踏破済み' : isRtP ? '湯印済み' : '✓ 訪問済み')
    : (isEx ? '未踏破' : isRtP ? '未訪問' : '未訪問');
  badge.style.background = isEx
    ? (isVisited ? 'rgba(157,196,168,0.18)' : 'rgba(232,168,130,0.18)')
    : (isVisited ? _T.doneBg() : _T.brandBg());
  badge.style.color = isEx
    ? (isVisited ? '#9DC4A8' : '#E8A882')
    : (isVisited ? _T.done() : _T.brand());

  document.getElementById('popup-shisetsu').textContent = s.shisetsu;
  document.getElementById('popup-address').textContent = s.address;
  var detailUrl = s.url
    || (MAP_CONFIG.detailUrlTemplate ? MAP_CONFIG.detailUrlTemplate.replace('{id}', s.id) : '');
  var btnDetail = document.getElementById('btn-detail');
  btnDetail.href = detailUrl;
  btnDetail.style.display = detailUrl ? '' : 'none';
  document.getElementById('btn-route').href = 'https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lng;

  updatePopupVisitedBtn();

  // expedition: 左ボーダー色を訪問状態に合わせる
  if (MAP_CONFIG.designKit === 'expedition') {
    popup.style.borderLeftColor = isVisited ? _T.done() : _T.brand();
  }

  popup.style.display = 'block';
  backdrop.style.display = 'block';
}

function updatePopupVisitedBtn() {
  if (!currentFacility) return;
  var isVisited = visitedSet.has(currentFacility.id);
  var btn = document.getElementById('btn-visited');
  var kit = MAP_CONFIG.designKit;
  var isEx2 = kit === 'expedition';
  var isPop = kit === 'pop-pilgrimage';
  var isSw  = kit === 'swiss-minimal';
  var isRt2 = kit === 'retro-travel';
  var isFn2 = kit === 'field-notes';
  var visitedLabel = isEx2 ? '踏破する'
    : isSw  ? 'MARK AS VISITED'
    : isRt2 ? '湯印を押す'
    : isFn2 ? '湯印を押す'
    : MAP_CONFIG.markerIcon + ' ここに行った！';
  btn.textContent = isVisited
    ? (isEx2 ? '↩ 踏破を取り消す' : isSw ? 'REMOVE' : (isRt2 || isFn2) ? '取り消す' : '↩ 訪問済みを取り消す')
    : visitedLabel;
  if (isPop) {
    btn.style.backgroundColor = isVisited ? '#D9F25C' : '#FF4D6D';
    btn.style.color = isVisited ? '#0F0A1F' : '#fff';
    btn.style.border = 'none';
  } else if (isSw) {
    btn.style.backgroundColor = isVisited ? '#0E0E0E' : '#D6442C';
    btn.style.color = '#FFFFFF';
    btn.style.border = 'none';
    btn.style.borderRadius = '0';
  } else if (isRt2) {
    btn.style.backgroundColor = isVisited ? 'rgba(162,58,43,0.12)' : '#A23A2B';
    btn.style.color = isVisited ? '#A23A2B' : '#F2EBD8';
    btn.style.border = isVisited ? '1px solid rgba(162,58,43,0.3)' : 'none';
    btn.style.borderRadius = '3px';
  } else if (isFn2) {
    btn.style.backgroundColor = isVisited ? 'rgba(140,58,43,0.10)' : '#8C3A2B';
    btn.style.color = isVisited ? '#8C3A2B' : '#FFFDF7';
    btn.style.border = isVisited ? '1px solid rgba(140,58,43,0.25)' : 'none';
    btn.style.borderRadius = '0';
  } else {
    btn.style.backgroundColor = isVisited
      ? (isEx2 ? 'rgba(58,78,63,0.35)' : _T.doneHover())
      : _T.brand();
    btn.style.color = isVisited
      ? (isEx2 ? '#EDEAE0' : _T.done())
      : '#fff';
    btn.style.border = isVisited
      ? (isEx2 ? 'none' : '1px solid ' + _T.doneBg())
      : 'none';
  }
  if (kit === 'expedition') {
    var popup = document.getElementById('popup');
    if (popup) popup.style.borderLeftColor = isVisited ? _T.done() : _T.brand();
  }
}

function closePopup() {
  popup.style.display = 'none';
  backdrop.style.display = 'none';
  currentFacility = null;
}

document.getElementById('popup-close').addEventListener('click', closePopup);
backdrop.addEventListener('click', closePopup);

document.getElementById('btn-visited').addEventListener('click', function() {
  if (currentFacility) {
    toggleVisited(currentFacility.id);
    closePopup();
    if (currentFilter !== 'all') renderPanel();
  }
});

// ===== 進捗表示 =====
function updateProgress() {
  var n   = visitedSet.size;
  var tot = MAP_CONFIG.totalCount;
  var pct = tot > 0 ? Math.round(n / tot * 100) : 0;
  var countEl = document.getElementById('progress-count');
  var pctEl   = document.getElementById('progress-pct');
  var textEl  = document.getElementById('progress-text');
  if (countEl) countEl.textContent = n;
  if (pctEl)   pctEl.textContent   = pct + '%';
  if (textEl)  textEl.textContent  = (MAP_CONFIG.designKit === 'swiss-minimal' || MAP_CONFIG.designKit === 'retro-travel')
    ? '/ ' + tot
    : MAP_CONFIG.designKit === 'field-notes'
      ? '／' + tot
      : '/ ' + tot + ' スポット';
  // retro-travel: data-stamp-label 属性にスタンプラベルをセット（CSS attr()で参照）
  if (MAP_CONFIG.designKit === 'retro-travel') {
    var psec = document.getElementById('progress-section');
    if (psec) psec.setAttribute('data-stamp-label', MAP_CONFIG.stampLabel || 'STAMPED');
  }
  // field-notes: 残り数・remainLabel・訪問数をセット
  if (MAP_CONFIG.designKit === 'field-notes') {
    if (pctEl) {
      pctEl.textContent = tot - n;  // %→残り数に上書き
      pctEl.setAttribute('data-remain-label', MAP_CONFIG.remainLabel || '未湯');
    }
    if (textEl) textEl.textContent = '／' + tot;
    var statEl = document.getElementById('header-stat');
    if (statEl) statEl.setAttribute('data-fn-count', n + ' / ' + tot);
    var btnNearFn = document.getElementById('btn-near');
    if (btnNearFn) btnNearFn.setAttribute('data-remain-label', MAP_CONFIG.remainLabel || '未湯');
  }
  document.getElementById('progress-bar-fill').style.width = (n / tot * 100) + '%';
  // expedition ヘッダーの訪問数 + 円形リング
  var hv = document.getElementById('header-visited-count');
  var ht = document.getElementById('header-total-count');
  var hr = document.getElementById('header-ring-fill');
  if (hv) hv.textContent = n;
  if (ht) ht.textContent = '/' + tot;
  if (hr) hr.setAttribute('stroke-dasharray', pct + ' 100');
}

// ===== 現在地ボタン =====
var userMarker = null;

document.getElementById('btn-locate').addEventListener('click', function() {
  if (!navigator.geolocation) {
    showToast('このブラウザは位置情報に対応していません');
    return;
  }
  showToast('現在地を取得中...');
  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;

    if (userMarker) map.removeLayer(userMarker);
    userMarker = L.circleMarker([lat, lng], {
      radius: 9,
      fillColor: '#2575DE',  // 瑠璃色（ラピスラズリ）
      color: '#fff',
      weight: 2.5,
      fillOpacity: 1
    }).addTo(map);

    map.setView([lat, lng], 13);
    showToast('◎ 現在地を表示しました');
  }, function() {
    showToast('位置情報の取得に失敗しました');
  });
});

// ===== 近くの未訪問ボタン =====
document.getElementById('btn-near').addEventListener('click', function() {
  if (!navigator.geolocation) {
    showToast('このブラウザは位置情報に対応していません');
    return;
  }
  showToast('近くの温泉を探しています...');
  navigator.geolocation.getCurrentPosition(function(pos) {
    var lat = pos.coords.latitude;
    var lng = pos.coords.longitude;

    var unvisited = ONSEN_DATA.filter(function(s) {
      return !visitedSet.has(s.id);
    });

    if (unvisited.length === 0) {
      showToast('全施設を制覇しました！おめでとうございます 🎉');
      return;
    }

    unvisited.sort(function(a, b) {
      return haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng);
    });

    var nearest = unvisited[0];
    var dist = haversineKm(lat, lng, nearest.lat, nearest.lng);
    var distText = dist < 1 ? Math.round(dist * 1000) + 'm' : dist.toFixed(1) + 'km';
    var shortName = nearest.shisetsu.length > 12
      ? nearest.shisetsu.slice(0, 12) + '…'
      : nearest.shisetsu;

    map.setView([nearest.lat, nearest.lng], 15);
    showToast('♨ 最寄りの未訪問: ' + shortName + '（' + distText + '）');
    setTimeout(function() { openPopup(nearest); }, 600);
  }, function() {
    showToast('位置情報の取得に失敗しました');
  });
});

// ===== スタンプ一覧パネル =====
var currentFilter = 'all';

function renderPanel() {
  var list = document.getElementById('panel-list');
  list.innerHTML = '';

  var data = ONSEN_DATA.filter(function(s) {
    if (currentFilter === 'visited')   return visitedSet.has(s.id);
    if (currentFilter === 'unvisited') return !visitedSet.has(s.id);
    return true;
  });

  var n   = visitedSet.size;
  var tot = MAP_CONFIG.totalCount;
  var pct = Math.round(n / tot * 100);

  if (MAP_CONFIG.designKit === 'expedition') {
    document.getElementById('panel-title').textContent = 'FIELD LOG';
    document.getElementById('panel-count').innerHTML =
      '<div class="exp-hero-row">'
      + '<span class="exp-hero-num">' + n + '</span>'
      + '<div class="exp-hero-right">'
      + '<div class="exp-hero-of">OF ' + tot + '</div>'
      + '<div class="exp-hero-pct">' + pct + '%</div>'
      + '</div></div>'
      + '<div class="exp-prog-bar"><div class="exp-prog-fill" style="width:' + pct + '%"></div></div>';
    var filterMap = { all: 'ALL', unvisited: '未踏破', visited: '踏破済み' };
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.textContent = filterMap[b.dataset.filter] || b.textContent;
    });
  } else if (MAP_CONFIG.designKit === 'pop-pilgrimage') {
    document.getElementById('panel-title').textContent = '';
    document.getElementById('panel-count').innerHTML = '';
    var popFilterMap = { all: 'ALL', unvisited: 'TODO', visited: 'DONE' };
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.textContent = popFilterMap[b.dataset.filter] || b.textContent;
    });
  } else if (MAP_CONFIG.designKit === 'swiss-minimal') {
    document.getElementById('panel-title').textContent = 'INDEX';
    document.getElementById('panel-count').textContent = n + ' / ' + tot;
    var swFilterMap = { all: 'ALL', unvisited: 'PENDING', visited: 'VISITED' };
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      b.textContent = swFilterMap[b.dataset.filter] || b.textContent;
    });
  } else if (MAP_CONFIG.designKit === 'retro-travel') {
    document.getElementById('panel-title').textContent = '';
    document.getElementById('panel-count').textContent = '';
    var rtFilterDefs = {
      all:      { jp: 'すべて', en: 'ALL',     count: ONSEN_DATA.length },
      visited:  { jp: '訪問済', en: 'VISITED', count: n },
      unvisited:{ jp: '未訪問', en: 'PENDING', count: ONSEN_DATA.length - n },
    };
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      var def = rtFilterDefs[b.dataset.filter];
      if (def) {
        b.innerHTML =
          '<div class="rt-filter-row">'
          + '<span class="rt-filter-jp">' + def.jp + '</span>'
          + '<span class="rt-filter-n">' + def.count + '</span>'
          + '</div>'
          + '<div class="rt-filter-en">' + def.en + '</div>';
      }
    });
    // 元帳ヘッダーストリップ（既存削除→再挿入）
    var oldLedger = document.getElementById('rt-ledger-header');
    if (oldLedger) oldLedger.parentNode.removeChild(oldLedger);
    var ledger = document.createElement('div');
    ledger.id = 'rt-ledger-header';
    ledger.innerHTML = '<span>番号</span><span>施設名</span><span>検印</span>';
    var panelEl = document.getElementById('panel');
    var listEl  = document.getElementById('panel-list');
    panelEl.insertBefore(ledger, listEl);
  } else if (MAP_CONFIG.designKit === 'field-notes') {
    document.getElementById('panel-title').textContent = '';
    document.getElementById('panel-count').textContent = '';
    var fnFilterDefs = {
      all:      { jp: 'すべて', count: ONSEN_DATA.length },
      unvisited:{ jp: '未訪問', count: ONSEN_DATA.length - n },
      visited:  { jp: '訪問済', count: n },
    };
    document.querySelectorAll('.filter-btn').forEach(function(b) {
      var def = fnFilterDefs[b.dataset.filter];
      if (def) {
        b.innerHTML = def.jp + '<span class="fn-filter-count">' + def.count + '</span>';
      }
    });
  } else {
    document.getElementById('panel-count').textContent = n + ' / ' + tot + ' 訪問済み';
  }

  data.forEach(function(s, localIdx) {
    var isVisited = visitedSet.has(s.id);
    var item = document.createElement('div');
    item.className = 'stamp-item';

    if (MAP_CONFIG.designKit === 'expedition') {
      var gIdx = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
      item.innerHTML =
        '<div class="stamp-num">' + String(gIdx + 1).padStart(3, '0') + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + ' · ' + s.address + '</div>'
        + '</div>'
        + '<div class="stamp-dot ' + (isVisited ? 'visited' : 'unvisited') + '"></div>';
    } else if (MAP_CONFIG.designKit === 'swiss-minimal') {
      if (isVisited) item.classList.add('sw-visited');
      var gIdxSw = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
      item.innerHTML =
        '<div class="stamp-num">' + String(gIdxSw + 1).padStart(3, '0') + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + ' · ' + s.address + '</div>'
        + '</div>'
        + '<div class="sw-indicator' + (isVisited ? ' sw-visited' : '') + '"></div>';
    } else if (MAP_CONFIG.designKit === 'pop-pilgrimage') {
      if (isVisited) item.classList.add('pop-visited-item');
      var gIdx2 = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
      item.innerHTML =
        '<div class="stamp-num">' + String(gIdx2 + 1).padStart(3, '0') + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + ' · ' + s.address + '</div>'
        + '</div>'
        + (isVisited
          ? '<div class="pop-done-pill">DONE</div>'
          : '<div class="pop-unvisited-dot"></div>');
    } else if (MAP_CONFIG.designKit === 'field-notes') {
      var gIdxFn = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
      item.innerHTML =
        '<div class="fn-num">'
        + '<span class="fn-num-label">第</span>'
        + '<span class="fn-num-digit">' + String(gIdxFn + 1).padStart(3, '0') + '</span>'
        + '<span class="fn-num-label">番</span>'
        + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + '　' + s.address + '</div>'
        + '</div>'
        + '<div class="fn-status' + (isVisited ? ' fn-visited' : ' fn-unvisited') + '">'
        + (isVisited ? '済' : '—') + '</div>';
    } else if (MAP_CONFIG.designKit === 'retro-travel') {
      var gIdxRt = ONSEN_DATA.findIndex(function(d) { return d.id === s.id; });
      // 交互背景色: JS でローカルインデックス使用（フィルター後も正しく交互になる）
      item.style.background = localIdx % 2 === 1 ? 'rgba(24,20,16,0.025)' : 'transparent';
      item.innerHTML =
        '<div class="rt-num">'
        + '<span class="rt-num-label">第</span>'
        + '<span class="rt-num-digit">' + String(gIdxRt + 1).padStart(3, '0') + '</span>'
        + '<span class="rt-num-label">番</span>'
        + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + '　' + s.address + '</div>'
        + '</div>'
        + '<div class="rt-stamp' + (isVisited ? ' rt-visited' : '') + '">'
        + (isVisited ? '済' : '') + '</div>';
    } else {
      item.innerHTML =
        '<div class="stamp-dot ' + (isVisited ? 'visited' : 'unvisited') + '">' + (isVisited ? '✓' : MAP_CONFIG.markerIcon) + '</div>'
        + '<div class="stamp-info">'
        + '<div class="stamp-name">' + s.shisetsu + '</div>'
        + '<div class="stamp-sub">' + s.onsenti + ' · ' + s.address + '</div>'
        + '</div>';
    }

    item.addEventListener('click', function() {
      switchTab('map');
      map.setView([s.lat, s.lng], 15);
      setTimeout(function() { openPopup(s); }, 300);
    });

    list.appendChild(item);
  });
}

document.querySelectorAll('.filter-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    currentFilter = this.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    this.classList.add('active');
    renderPanel();
  });
});

// ===== タブ切り替え =====
function switchTab(tab) {
  var mapEl          = document.getElementById('map');
  var panel          = document.getElementById('panel');
  var backupPanel    = document.getElementById('backup-panel');
  var fabWrap        = document.getElementById('fab-wrap');
  var progressSec    = document.getElementById('progress-section');
  var navMap         = document.getElementById('nav-map');
  var navList        = document.getElementById('nav-list');
  var navBackup      = document.getElementById('nav-backup');

  mapEl.style.display       = 'none';
  fabWrap.style.display     = 'none';
  panel.style.display       = 'none';
  backupPanel.style.display = 'none';
  navMap.classList.remove('active');
  navList.classList.remove('active');
  navBackup.classList.remove('active');

  var isEx  = MAP_CONFIG.designKit === 'expedition';
  var isPop = MAP_CONFIG.designKit === 'pop-pilgrimage';
  var isSw  = MAP_CONFIG.designKit === 'swiss-minimal';
  var isRt  = MAP_CONFIG.designKit === 'retro-travel';
  var isFn  = MAP_CONFIG.designKit === 'field-notes';
  var header = document.getElementById('header');

  if (tab === 'map') {
    if ((isEx || isPop) && header) header.style.display = '';
    if (isPop) progressSec.style.top = ''; // CSS デフォルト (72px) に戻す
    progressSec.style.display = '';
    mapEl.style.display   = '';
    fabWrap.style.display = '';
    navMap.classList.add('active');
    map.invalidateSize();
  } else if (tab === 'list') {
    if (isEx && header) header.style.display = 'none';
    if (isPop && header) header.style.display = 'none';
    if (isPop) {
      // プログレスカードを上詰めで浮遊、パネルはカード直下から
      progressSec.style.display = '';
      progressSec.style.top = '8px'; // ヘッダーなし → カードを上に詰める
      panel.style.top = '130px';
    } else if (isEx) {
      progressSec.style.display = 'none';
      panel.style.top = 'env(safe-area-inset-top, 0px)';
    } else if (isSw) {
      progressSec.style.display = '';
      panel.style.top = '144px'; // header(64) + progress(80)
    } else if (isRt) {
      // retro-travel: ヘッダーのみ表示、プログレスカードは非表示
      progressSec.style.display = 'none';
      panel.style.top = '76px'; // header(76) 直下
    } else if (isFn) {
      // field-notes: ヘッダーのみ表示、プログレスカードは非表示
      progressSec.style.display = 'none';
      panel.style.top = '56px'; // header(56) 直下
    } else {
      progressSec.style.display = '';
      panel.style.top = '132px';
    }
    panel.style.bottom  = (isEx || isPop || isRt || isFn) ? '0' : 'calc(60px + env(safe-area-inset-bottom))';
    panel.style.display = (isEx || isPop || isRt || isFn) ? 'flex' : 'block';
    navList.classList.add('active');
    renderPanel();
  } else if (tab === 'backup') {
    if ((isEx || isPop) && header) header.style.display = 'none';
    progressSec.style.display = 'none';
    backupPanel.style.top    = (isEx || isPop) ? 'env(safe-area-inset-top, 0px)'
      : isRt ? '76px'
      : isFn  ? '56px'
      : '64px';
    // ナビバー(60px)は記録タブでも常に表示 → 全キットでナビ分を確保
    backupPanel.style.bottom = 'calc(60px + env(safe-area-inset-bottom))';
    backupPanel.style.display = 'block';
    navBackup.classList.add('active');
    refreshTransferCode();
  }
  closePopup();
}

document.getElementById('nav-map').addEventListener('click',    function() { switchTab('map'); });
document.getElementById('nav-list').addEventListener('click',   function() { switchTab('list'); });
document.getElementById('nav-backup').addEventListener('click', function() { switchTab('backup'); });

// ===== バックアップ・復元 =====

// 全施設IDとインデックスの対応表を作る
function buildIdIndex() {
  var map = {};
  ONSEN_DATA.forEach(function(s, i) { map[s.id] = i; });
  return map;
}

// 訪問済みをビット列→Base64に圧縮
function generateTransferCode() {
  var idIndex = buildIdIndex();
  var n = ONSEN_DATA.length;
  var bytes = new Uint8Array(Math.ceil(n / 8));
  visitedSet.forEach(function(id) {
    var i = idIndex[id];
    if (i !== undefined) {
      bytes[Math.floor(i / 8)] |= (1 << (i % 8));
    }
  });
  var binary = '';
  bytes.forEach(function(b) { binary += String.fromCharCode(b); });
  return btoa(binary);
}

// Base64→ビット列→訪問済みセットを復元
function restoreFromCode(code) {
  try {
    var binary = atob(code.trim());
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    var newVisited = new Set();
    ONSEN_DATA.forEach(function(s, i) {
      if (bytes[Math.floor(i / 8)] & (1 << (i % 8))) {
        newVisited.add(s.id);
      }
    });
    visitedSet = newVisited;
    saveVisited();
    ONSEN_DATA.forEach(function(s) { updateMarker(s.id); });
    updateProgress();
    return true;
  } catch(e) {
    return false;
  }
}

// 引き継ぎコード表示を更新
function refreshTransferCode() {
  var box = document.getElementById('transfer-code-box');
  if (visitedSet.size === 0) {
    box.textContent = '（まだ訪問記録がありません）';
  } else {
    box.textContent = generateTransferCode();
  }
}

// コードをコピー
document.getElementById('btn-copy-code').addEventListener('click', function() {
  var code = document.getElementById('transfer-code-box').textContent;
  if (!code || code.startsWith('（')) {
    showToast('まだ訪問記録がありません');
    return;
  }
  navigator.clipboard.writeText(code).then(function() {
    showToast('✅ コードをコピーしました');
  }).catch(function() {
    // clipboard APIが使えないブラウザ対応
    var ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ コードをコピーしました');
  });
});

// コードから復元
document.getElementById('btn-restore-code').addEventListener('click', function() {
  var code = document.getElementById('transfer-code-input').value.trim();
  if (!code) {
    showToast('コードを貼り付けてください');
    return;
  }
  if (!confirm('現在の訪問記録を上書きして復元します。よろしいですか？')) return;
  if (restoreFromCode(code)) {
    document.getElementById('transfer-code-input').value = '';
    refreshTransferCode();
    showToast('✅ ' + visitedSet.size + ' 件の記録を復元しました');
  } else {
    showToast('⚠️ コードが正しくありません');
  }
});

// JSONファイルに書き出し
document.getElementById('btn-export').addEventListener('click', function() {
  if (visitedSet.size === 0) {
    showToast('まだ訪問記録がありません');
    return;
  }
  var data = {
    app: '九州八十八湯マップ',
    exportedAt: new Date().toISOString(),
    visited: Array.from(visitedSet)
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'onsen88_backup_' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('✅ ファイルを書き出しました');
});

// JSONファイルから読み込み
document.getElementById('btn-import').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    try {
      var data = JSON.parse(ev.target.result);
      var ids = Array.isArray(data) ? data : data.visited;
      if (!Array.isArray(ids)) throw new Error('invalid');
      if (!confirm(ids.length + ' 件の記録を読み込みます。現在の記録を上書きしてよろしいですか？')) return;
      visitedSet = new Set(ids);
      saveVisited();
      ONSEN_DATA.forEach(function(s) { updateMarker(s.id); });
      updateProgress();
      refreshTransferCode();
      showToast('✅ ' + visitedSet.size + ' 件の記録を読み込みました');
    } catch(err) {
      showToast('⚠️ ファイルの読み込みに失敗しました');
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

// ===== トースト =====
var toastTimer = null;
function showToast(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { el.style.display = 'none'; }, 3000);
}

// ===== ホーム画面追加バナー =====
(function() {
  // スタンドアロン（ホーム画面追加済み）なら非表示
  var isStandalone = window.navigator.standalone
    || window.matchMedia('(display-mode: standalone)').matches;
  var dismissed = localStorage.getItem('onsen88_banner_dismissed');
  var banner = document.getElementById('add-banner');
  if (!isStandalone && !dismissed) {
    banner.style.display = 'flex';
  }
  document.getElementById('banner-close').addEventListener('click', function() {
    banner.style.display = 'none';
    localStorage.setItem('onsen88_banner_dismissed', '1');
  });
})();

// ===== 起動 =====
loadVisited();
addMarkers();
updateProgress();

// Service Worker 登録（PWA）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(function() {});
}
