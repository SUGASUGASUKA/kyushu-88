// =============================================================
//  map-config.js  ── このファイルだけ編集して地図をカスタマイズ
// =============================================================

var MAP_CONFIG = {

  // -------- 基本情報 ----------------------------------------
  appName   : '九州八十八湯マップ',   // ヘッダーに表示するタイトル
  totalCount: 160,                    // スタンプの総数

  // -------- 地図の初期位置 -----------------------------------
  mapCenter : [32.5, 131.0],
  mapZoom   : 7,

  // -------- 地図タイル --------------------------------------
  //   'osm'     OpenStreetMap（標準・街・観光地向け）
  //   'gsi'     地理院タイル  （山・登山・ハイキング向け）
  //   'mapbox'  Mapbox Light  （シンプルおしゃれ・観光PR向け）
  mapTile     : 'gsi',
  mapboxToken : '',   // mapbox 選択時のみ入力

  // -------- デザインキット ----------------------------------
  //   'field-notes'    記録帳・和紙・アースカラー（温泉・神社・巡礼）
  //   'swiss-minimal'  超ミニマル・白黒赤・格子（都市回遊・建築・デザイン）
  //   'retro-travel'   昭和旅情・朱色・活版印刷（鉄道・道の駅・レトロ巡り）
  //   'expedition'     探検図・オリーブ・測量感（登山・ツーリング・MTB）
  //   'pop-pilgrimage' 推し活・ビビッド・丸ゴシック（聖地巡礼・カフェ・イベント）
  designKit : 'field-notes',

  // -------- マーカーアイコン（絵文字）-----------------------
  //  温泉   ♨      神社   ⛩     城・寺  🏯
  //  ラーメン 🍜   グルメ  🍴    カフェ  ☕
  //  登山   ⛰     海・港  ⚓    釣り    🎣
  //  酒蔵   🍶    サイクリング 🚴  花・公園 🌸
  //  キャンプ ⛺   撮影スポット 📸  おすすめ ⭐
  markerIcon : '♨',

  // -------- 詳細リンク URL テンプレート ---------------------
  //  {id} がスポット ID に置き換わります。不要なら '' にする
  detailUrlTemplate : 'https://www.88onsen.com/spot/detail/hid/{id}',
};


// =============================================================
//  以下は編集不要  ── デザインキット定義 & CSS変数の適用
// =============================================================

var _DESIGN_KITS = {

  // ----------------------------------------------------------
  //  FIELD NOTES  ─ 記録帳・和紙・アースカラー
  // ----------------------------------------------------------
  'field-notes': {
    bgPage:       '#F7F3EE',
    bgCard:       '#FDFAF6',
    bgHeader:     '#2D1B0E',
    bgProgress:   '#EDE6DA',
    bgNav:        '#FAF7F2',
    textOnHeader: '#F5EDD8',
    textPrimary:  '#2D1B0E',
    textSecondary:'#7A6558',
    textMuted:    '#B0A090',
    borderCard:   '#EDE6DA',
    borderNav:    '#E0D5C5',
    radiusCard:   '10px',
    radiusBtn:    '8px',
    radiusPopup:  '16px',
    fontHeading:  "'Shippori Mincho', serif",
    fontBody:     "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    bgToast:      '#2D1B0E',
    textToast:    '#F5EDD8',
    shadowCard:   '0 1px 3px rgba(45,27,14,0.07)',
    shadowPopup:  '0 4px 28px rgba(45,27,14,0.2)',
    brand:        '#8C3A2B',
    brandDark:    '#5C2418',
    brandStroke:  '#3D1610',
    brandBg:      '#F0E0D8',
    done:         '#3D5A3E',
    doneDark:     '#1E3320',
    doneBg:       '#D4E8CA',
    doneHover:    '#EFF6EE',
  },

  // ----------------------------------------------------------
  //  SWISS MINIMAL  ─ 超ミニマル・白黒赤
  // ----------------------------------------------------------
  'swiss-minimal': {
    bgPage:       '#FFFFFF',
    bgCard:       '#FFFFFF',
    bgHeader:     '#1A1A1A',
    bgProgress:   '#F5F5F5',
    bgNav:        '#FFFFFF',
    textOnHeader: '#FFFFFF',
    textPrimary:  '#1A1A1A',
    textSecondary:'#666666',
    textMuted:    '#999999',
    borderCard:   '#E8E8E8',
    borderNav:    '#E8E8E8',
    radiusCard:   '2px',
    radiusBtn:    '2px',
    radiusPopup:  '4px',
    fontHeading:  "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontBody:     "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    bgToast:      '#1A1A1A',
    textToast:    '#FFFFFF',
    shadowCard:   '0 1px 2px rgba(0,0,0,0.08)',
    shadowPopup:  '0 4px 20px rgba(0,0,0,0.15)',
    brand:        '#E63329',
    brandDark:    '#B52820',
    brandStroke:  '#8B1D16',
    brandBg:      '#FEE8E7',
    done:         '#1A1A1A',
    doneDark:     '#000000',
    doneBg:       '#F0F0F0',
    doneHover:    '#F8F8F8',
  },

  // ----------------------------------------------------------
  //  RETRO TRAVEL  ─ 昭和旅情・朱色・活版印刷
  // ----------------------------------------------------------
  'retro-travel': {
    bgPage:       '#F5EDD5',
    bgCard:       '#FBF5E6',
    bgHeader:     '#7B1818',
    bgProgress:   '#EDE0C4',
    bgNav:        '#F5EDD5',
    textOnHeader: '#FFF8E7',
    textPrimary:  '#2A1A0A',
    textSecondary:'#7A5C3A',
    textMuted:    '#A8896A',
    borderCard:   '#D4B896',
    borderNav:    '#C8A87A',
    radiusCard:   '4px',
    radiusBtn:    '3px',
    radiusPopup:  '6px',
    fontHeading:  "'Noto Serif JP', serif",
    fontBody:     "'Noto Serif JP', serif",
    bgToast:      '#7B1818',
    textToast:    '#FFF8E7',
    shadowCard:   '0 1px 4px rgba(42,26,10,0.12)',
    shadowPopup:  '0 4px 20px rgba(42,26,10,0.25)',
    brand:        '#C0392B',
    brandDark:    '#922B21',
    brandStroke:  '#641E16',
    brandBg:      '#FDECEA',
    done:         '#4A7C59',
    doneDark:     '#2D5A3D',
    doneBg:       '#D5EAD9',
    doneHover:    '#EAF5EC',
  },

  // ----------------------------------------------------------
  //  EXPEDITION  ─ 探検図・オリーブ・測量感
  // ----------------------------------------------------------
  'expedition': {
    bgPage:       '#F2F0EA',
    bgCard:       '#FAFAF7',
    bgHeader:     '#2C3E2D',
    bgProgress:   '#E5EBE0',
    bgNav:        '#F2F0EA',
    textOnHeader: '#E8F0E4',
    textPrimary:  '#1C2820',
    textSecondary:'#4D5C4E',
    textMuted:    '#8A9E8A',
    borderCard:   '#D0D8C8',
    borderNav:    '#C4CFC0',
    radiusCard:   '4px',
    radiusBtn:    '4px',
    radiusPopup:  '8px',
    fontHeading:  "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    fontBody:     "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif",
    bgToast:      '#2C3E2D',
    textToast:    '#E8F0E4',
    shadowCard:   '0 1px 3px rgba(28,40,32,0.10)',
    shadowPopup:  '0 4px 24px rgba(28,40,32,0.22)',
    brand:        '#C4622D',
    brandDark:    '#9A4A1E',
    brandStroke:  '#7A3414',
    brandBg:      '#FAE8DC',
    done:         '#3A6B45',
    doneDark:     '#245030',
    doneBg:       '#CEEBD8',
    doneHover:    '#E8F5EC',
  },

  // ----------------------------------------------------------
  //  POP PILGRIMAGE  ─ 推し活・ビビッド・丸ゴシック
  // ----------------------------------------------------------
  'pop-pilgrimage': {
    bgPage:       '#FDF8FF',
    bgCard:       '#FFFFFF',
    bgHeader:     '#5B21B6',
    bgProgress:   '#F0EEFF',
    bgNav:        '#FFFFFF',
    textOnHeader: '#FFFFFF',
    textPrimary:  '#1E1B4B',
    textSecondary:'#6366A0',
    textMuted:    '#9CA3C8',
    borderCard:   '#EDE9FF',
    borderNav:    '#E5E0FF',
    radiusCard:   '16px',
    radiusBtn:    '12px',
    radiusPopup:  '20px',
    fontHeading:  "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif",
    fontBody:     "'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif",
    bgToast:      '#5B21B6',
    textToast:    '#FFFFFF',
    shadowCard:   '0 2px 8px rgba(91,33,182,0.08)',
    shadowPopup:  '0 4px 28px rgba(91,33,182,0.18)',
    brand:        '#EC4899',
    brandDark:    '#BE185D',
    brandStroke:  '#9D174D',
    brandBg:      '#FCE7F3',
    done:         '#7C3AED',
    doneDark:     '#5B21B6',
    doneBg:       '#EDE9FE',
    doneHover:    '#F5F3FF',
  },
};

var _TILES = {
  osm : {
    url  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attr : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZ : 19,
  },
  gsi : {
    url  : 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attr : '© <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院</a>',
    maxZ : 18,
  },
  mapbox : {
    url  : 'https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=' + MAP_CONFIG.mapboxToken,
    attr : '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZ : 19,
  },
};

// --- CSS カスタムプロパティに適用 ---
(function () {
  var kit = _DESIGN_KITS[MAP_CONFIG.designKit] || _DESIGN_KITS['field-notes'];
  var r   = document.documentElement.style;
  document.documentElement.setAttribute('data-kit', MAP_CONFIG.designKit);

  // Surface
  r.setProperty('--bg-page',        kit.bgPage);
  r.setProperty('--bg-card',        kit.bgCard);
  r.setProperty('--bg-header',      kit.bgHeader);
  r.setProperty('--bg-progress',    kit.bgProgress);
  r.setProperty('--bg-nav',         kit.bgNav);
  // Text
  r.setProperty('--text-on-header', kit.textOnHeader);
  r.setProperty('--text-primary',   kit.textPrimary);
  r.setProperty('--text-secondary', kit.textSecondary);
  r.setProperty('--text-muted',     kit.textMuted);
  // Border
  r.setProperty('--border-card',    kit.borderCard);
  r.setProperty('--border-nav',     kit.borderNav);
  // Shape
  r.setProperty('--radius-card',    kit.radiusCard);
  r.setProperty('--radius-btn',     kit.radiusBtn);
  r.setProperty('--radius-popup',   kit.radiusPopup);
  // Font
  r.setProperty('--font-heading',   kit.fontHeading);
  r.setProperty('--font-body',      kit.fontBody);
  // Toast
  r.setProperty('--bg-toast',       kit.bgToast);
  r.setProperty('--text-toast',     kit.textToast);
  // Shadow
  r.setProperty('--shadow-card',    kit.shadowCard);
  r.setProperty('--shadow-popup',   kit.shadowPopup);
  // Brand colors（app.js の _T オブジェクトでも参照）
  r.setProperty('--color-brand',        kit.brand);
  r.setProperty('--color-brand-dark',   kit.brandDark);
  r.setProperty('--color-brand-stroke', kit.brandStroke);
  r.setProperty('--color-brand-bg',     kit.brandBg);
  r.setProperty('--color-done',         kit.done);
  r.setProperty('--color-done-dark',    kit.doneDark);
  r.setProperty('--color-done-bg',      kit.doneBg);
  r.setProperty('--color-done-hover',   kit.doneHover);
})();
