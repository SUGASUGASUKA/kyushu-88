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
  if (visitedSet.has(id)) {
    visitedSet.delete(id);
    showToast('↩ 訪問済みを取り消しました');
  } else {
    visitedSet.add(id);
    showToast('♨ スタンプを押しました！ ' + visitedSet.size + ' / ' + MAP_CONFIG.totalCount);
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

var _tile = _TILES[MAP_CONFIG.mapTile] || _TILES.osm;
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
    // フラットスクエア・影なし
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">'
      + '<rect x="0" y="0" width="28" height="28" fill="' + fill + '"/>'
      + '<text x="14" y="19.5" text-anchor="middle" font-size="13" fill="white" font-family="Helvetica,Arial,sans-serif">' + icon + '</text>'
      + '</svg>';
    size = [28, 28]; anchor = [14, 14]; pop = [0, -16];

  } else if (kit === 'retro-travel') {
    // スタンプ・判子風（破線リング）
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">'
      + '<circle cx="18" cy="18" r="16" fill="' + fill + '"/>'
      + '<circle cx="18" cy="18" r="16" fill="none" stroke="white" stroke-width="2" stroke-dasharray="4,2.5"/>'
      + '<text x="18" y="23" text-anchor="middle" font-size="14" fill="white">' + icon + '</text>'
      + '</svg>';
    size = [36, 36]; anchor = [18, 18]; pop = [0, -20];

  } else if (kit === 'expedition') {
    // クロスヘア・測量ターゲット
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="34" height="34">'
      + '<line x1="20" y1="1" x2="20" y2="11" stroke="' + fill + '" stroke-width="2.5"/>'
      + '<line x1="20" y1="29" x2="20" y2="39" stroke="' + fill + '" stroke-width="2.5"/>'
      + '<line x1="1" y1="20" x2="11" y2="20" stroke="' + fill + '" stroke-width="2.5"/>'
      + '<line x1="29" y1="20" x2="39" y2="20" stroke="' + fill + '" stroke-width="2.5"/>'
      + '<circle cx="20" cy="20" r="11" fill="' + fill + '"/>'
      + '<circle cx="20" cy="20" r="11" fill="none" stroke="white" stroke-width="1.5" opacity="0.5"/>'
      + '<text x="20" y="25" text-anchor="middle" font-size="13" fill="white">' + icon + '</text>'
      + '</svg>';
    size = [34, 34]; anchor = [17, 17]; pop = [0, -19];

  } else if (kit === 'pop-pilgrimage') {
    // カラーリング・ステッカー風
    var ring = visited ? dark : fill;
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" width="38" height="38">'
      + '<circle cx="19" cy="19" r="18" fill="' + ring + '"/>'
      + '<circle cx="19" cy="19" r="13" fill="white"/>'
      + '<circle cx="19" cy="19" r="11" fill="' + fill + '"/>'
      + '<text x="19" y="24" text-anchor="middle" font-size="13" fill="white">' + icon + '</text>'
      + '</svg>';
    size = [38, 38]; anchor = [19, 19]; pop = [0, -21];

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

  document.getElementById('popup-onsenti').textContent = '♨ ' + s.onsenti;
  document.getElementById('popup-onsenti').style.color = isVisited ? _T.done() : _T.brand();

  var badge = document.getElementById('popup-badge');
  badge.textContent = isVisited ? '✓ 訪問済み' : '未訪問';
  badge.style.background = isVisited ? _T.doneBg()   : _T.brandBg();
  badge.style.color       = isVisited ? _T.done()     : _T.brand();

  document.getElementById('popup-shisetsu').textContent = s.shisetsu;
  document.getElementById('popup-address').textContent = s.address;
  document.getElementById('btn-detail').href = 'https://www.88onsen.com/spot/detail/hid/' + s.id;
  document.getElementById('btn-route').href = 'https://www.google.com/maps/dir/?api=1&destination=' + s.lat + ',' + s.lng;

  updatePopupVisitedBtn();

  popup.style.display = 'block';
  backdrop.style.display = 'block';
}

function updatePopupVisitedBtn() {
  if (!currentFacility) return;
  var isVisited = visitedSet.has(currentFacility.id);
  var btn = document.getElementById('btn-visited');
  btn.textContent = isVisited ? '↩ 訪問済みを取り消す' : MAP_CONFIG.markerIcon + ' ここに行った！';
  btn.style.background = isVisited ? _T.doneHover() : _T.brand();
  btn.style.color      = isVisited ? _T.done()      : '#fff';
  btn.style.border     = isVisited ? '1px solid ' + _T.doneBg() : 'none';
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
  if (textEl)  textEl.textContent  = '/ ' + tot + ' スポット';
  document.getElementById('progress-bar-fill').style.width = (n / tot * 100) + '%';
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

  document.getElementById('panel-count').textContent =
    visitedSet.size + ' / ' + MAP_CONFIG.totalCount + ' 訪問済み';

  data.forEach(function(s) {
    var isVisited = visitedSet.has(s.id);
    var item = document.createElement('div');
    item.className = 'stamp-item';
    item.innerHTML =
      '<div class="stamp-dot ' + (isVisited ? 'visited' : 'unvisited') + '">' + (isVisited ? '✓' : MAP_CONFIG.markerIcon) + '</div>'
      + '<div class="stamp-info">'
      + '<div class="stamp-name">' + s.shisetsu + '</div>'
      + '<div class="stamp-sub">' + s.onsenti + ' · ' + s.address + '</div>'
      + '</div>';

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

  if (tab === 'map') {
    progressSec.style.display = '';       // 進捗バー表示
    mapEl.style.display   = '';
    fabWrap.style.display = '';
    navMap.classList.add('active');
    map.invalidateSize();
  } else if (tab === 'list') {
    progressSec.style.display = '';      // 進捗バー表示（一覧でも見える）
    panel.style.top = '132px';
    panel.style.bottom = 'calc(60px + env(safe-area-inset-bottom))';
    panel.style.display = 'block';
    navList.classList.add('active');
    renderPanel();
  } else if (tab === 'backup') {
    progressSec.style.display = 'none';  // 記録タブは非表示
    backupPanel.style.top = '64px';
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
