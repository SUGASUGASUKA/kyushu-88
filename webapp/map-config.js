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
  mapTile     : 'osm',
  mapboxToken : '',   // mapbox 選択時のみ入力

  // -------- デザインキット ----------------------------------
  //   'field-notes'    記録帳・和紙・アースカラー（温泉・神社・巡礼）
  //   'swiss-minimal'  超ミニマル・白黒赤・格子（都市回遊・建築・デザイン）
  //   'retro-travel'   昭和旅情・朱色・活版印刷（鉄道・道の駅・レトロ巡り）
  //   'expedition'     探検図・オリーブ・測量感（登山・ツーリング・MTB）
  //   'pop-pilgrimage' 推し活・ビビッド・丸ゴシック（聖地巡礼・カフェ・イベント）
  designKit : 'swiss-minimal',

  // -------- マーカーアイコン（絵文字）-----------------------
  //  温泉   ♨      神社   ⛩     城・寺  🏯
  //  ラーメン 🍜   グルメ  🍴    カフェ  ☕
  //  登山   ⛰     海・港  ⚓    釣り    🎣
  //  酒蔵   🍶    サイクリング 🚴  花・公園 🌸
  //  キャンプ ⛺   撮影スポット 📸  おすすめ ⭐
  markerIcon : '♨',

  // -------- 進捗カードのスタンプラベル ----------------------
  //  retro-travel キットの進捗カード上部に表示するラベル。
  //  テーマを変えても変更一箇所で済む。
  stampLabel  : 'STAMPED ・ 湯印',

  // -------- 残り未訪問数のラベル ----------------------------
  //  field-notes FABボタン・右サイドカウントに表示。一行で変更可。
  //  例: 温泉 → '未湯' / 城 → '未登城' / 神社 → '未参拝'
  remainLabel : '未湯',

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
    mapTile:      'gsi',
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
  //  SWISS MINIMAL  ─ 超ミニマル・白黒赤・バウハウス
  //  Palette: ink #0E0E0E / white #FFFFFF / accent #D6442C / gray #8A8A8A
  // ----------------------------------------------------------
  'swiss-minimal': {
    mapTile:      'osm',
    bgPage:       '#FFFFFF',
    bgCard:       '#FFFFFF',
    bgHeader:     '#FFFFFF',
    bgProgress:   '#FFFFFF',
    bgNav:        '#FFFFFF',
    textOnHeader: '#0E0E0E',
    textPrimary:  '#0E0E0E',
    textSecondary:'#8A8A8A',
    textMuted:    '#9A9A9A',
    borderCard:   '#EEEEEE',
    borderNav:    '#0E0E0E',
    radiusCard:   '0',
    radiusBtn:    '0',
    radiusPopup:  '0',
    fontHeading:  "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    fontBody:     "'Noto Sans JP', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    bgToast:      '#0E0E0E',
    textToast:    '#FFFFFF',
    shadowCard:   'none',
    shadowPopup:  'none',
    brand:        '#D6442C',
    brandDark:    '#962C15',
    brandStroke:  '#7A220F',
    brandBg:      '#FDECEA',
    done:         '#0E0E0E',
    doneDark:     '#0D0B09',
    doneBg:       '#EFEFEF',
    doneHover:    '#F6F6F6',
  },

  // ----------------------------------------------------------
  //  RETRO TRAVEL  ─ 旅館しおり・活版印刷・墨と朱
  //  Palette: cream #F2EBD8 / sumi #181410 / shu #A23A2B / gray #9A8C76
  // ----------------------------------------------------------
  'retro-travel': {
    mapTile:      'gsi',
    bgPage:       '#F2EBD8',
    bgCard:       '#F2EBD8',
    bgHeader:     '#181410',
    bgProgress:   '#F2EBD8',
    bgNav:        '#F2EBD8',
    textOnHeader: '#F2EBD8',
    textPrimary:  '#181410',
    textSecondary:'#7A6B5A',
    textMuted:    '#9A8C76',
    borderCard:   'rgba(24,20,16,0.08)',
    borderNav:    'rgba(24,20,16,0.15)',
    radiusCard:   '0',
    radiusBtn:    '3px',
    radiusPopup:  '0',
    fontHeading:  "'Shippori Mincho', 'Noto Serif JP', serif",
    fontBody:     "'Noto Sans JP', sans-serif",
    bgToast:      '#181410',
    textToast:    '#F2EBD8',
    shadowCard:   'none',
    shadowPopup:  'none',
    brand:        '#A23A2B',
    brandDark:    '#7A2A1E',
    brandStroke:  '#5C1E14',
    brandBg:      'rgba(162,58,43,0.08)',
    done:         '#A23A2B',
    doneDark:     '#7A2A1E',
    doneBg:       'rgba(162,58,43,0.12)',
    doneHover:    'rgba(162,58,43,0.06)',
  },

  // ----------------------------------------------------------
  //  EXPEDITION  ─ 探検図・オリーブ・測量感
  // ----------------------------------------------------------
  'expedition': {
    mapTile:      'gsi',
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
    done:         '#3A4E3F',
    doneDark:     '#1E3320',
    doneBg:       'rgba(58,78,63,0.12)',
    doneHover:    'rgba(58,78,63,0.08)',
  },

  // ----------------------------------------------------------
  //  POP PILGRIMAGE  ─ タイポ主役・プレミアムポップ
  //  Palette: ink #0F0A1F / cream #FFF7EE / punch #FF4D6D / acid #D9F25C / grape #6E3AED
  // ----------------------------------------------------------
  'pop-pilgrimage': {
    mapTile:      'osm',
    bgPage:       '#FFF7EE',
    bgCard:       '#FFFFFF',
    bgHeader:     '#FFF7EE',
    bgProgress:   '#F0EAFF',
    bgNav:        '#0F0A1F',
    textOnHeader: '#0F0A1F',
    textPrimary:  '#0F0A1F',
    textSecondary:'#7A6B8A',
    textMuted:    '#A09AB0',
    borderCard:   '#EDE9FF',
    borderNav:    '#EDE9FF',
    radiusCard:   '16px',
    radiusBtn:    '12px',
    radiusPopup:  '10px',
    fontHeading:  "'Bricolage Grotesque', 'Inter', system-ui, sans-serif",
    fontBody:     "'Noto Sans JP', system-ui, sans-serif",
    bgToast:      '#0F0A1F',
    textToast:    '#FFF7EE',
    shadowCard:   '0 2px 8px rgba(15,10,31,0.06)',
    shadowPopup:  '0 4px 24px rgba(15,10,31,0.15)',
    brand:        '#FF4D6D',
    brandDark:    '#CC2244',
    brandStroke:  '#AA1133',
    brandBg:      '#FFE4EB',
    done:         '#6E3AED',
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
