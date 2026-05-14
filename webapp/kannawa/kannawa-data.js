// =============================================================
//  kannawa-data.js  ── 鉄輪 観察記録 ZINE 撮影地データ
//  KNNW-2026 / Etsuko Kanno
//
//  座標は ZINE 第1版(2023) 誌面の度分秒(DMS)を出発点に、
//  撮影者本人が現地照合して見直した「正しい撮影地」の値。
//  以下の写真は誌面のDMSと差分があるため、再版/正誤表を
//  作る際はこの値に揃えること：
//    01, 03, 04, 05, 06, 10, 12
//
//  写真09 は誌面構成上、計器ログ(TIME/TEMP/HUMID/VIS)が
//  記録されていない（VAPORのみ記録）。
// =============================================================

var KANNAWA_DATA = [
  {
    no: "01",
    title: "見はらし坂",
    time: "07:09",
    temp: 14,
    humid: 60,
    vis: 10.0,
    vapor: { lv: 3, label: "Moderate" },
    locDms: "33°19'3.9\"N 131°28'44.7\"E",
    lat: 33.317750,
    lng: 131.479075,
    photo: "photos/KNNW_01.jpg",
    thumb: "photos/KNNW_01_th.jpg"
  },
  {
    no: "02",
    title: "",
    time: "07:15",
    temp: 14,
    humid: 51,
    vis: 15.0,
    vapor: { lv: 2, label: "Drift" },
    locDms: "33°18'56.2\"N 131°28'32.3\"E",
    lat: 33.315611,
    lng: 131.475639,
    photo: "photos/KNNW_02.jpg",
    thumb: "photos/KNNW_02_th.jpg"
  },
  {
    no: "03",
    title: "",
    time: "07:27",
    temp: 16,
    humid: 62,
    vis: 8.0,
    vapor: { lv: 2, label: "Drift" },
    locDms: "33°18'57.6\"N 131°28'38.5\"E",
    lat: 33.315992,
    lng: 131.477363,
    photo: "photos/KNNW_03.jpg",
    thumb: "photos/KNNW_03_th.jpg"
  },
  {
    no: "04",
    title: "",
    time: "07:45",
    temp: 16,
    humid: 60,
    vis: 8.5,
    vapor: { lv: 2, label: "Drift" },
    locDms: "33°18'57.1\"N 131°28'40.9\"E",
    lat: 33.315854,
    lng: 131.478031,
    photo: "photos/KNNW_04.jpg",
    thumb: "photos/KNNW_04_th.jpg"
  },
  {
    no: "05",
    title: "",
    time: "09:17",
    temp: 18,
    humid: 83,
    vis: 3.5,
    vapor: { lv: 4, label: "Heavy" },
    locDms: "33°18'59.9\"N 131°28'43.6\"E",
    lat: 33.316649,
    lng: 131.478790,
    photo: "photos/KNNW_05.jpg",
    thumb: "photos/KNNW_05_th.jpg"
  },
  {
    no: "06",
    title: "",
    time: "10:33",
    temp: 19,
    humid: 72,
    vis: 10.0,
    vapor: { lv: 1, label: "Stable" },
    locDms: "33°18'58.6\"N 131°28'40.7\"E",
    lat: 33.316285,
    lng: 131.477968,
    photo: "photos/KNNW_06.jpg",
    thumb: "photos/KNNW_06_th.jpg"
  },
  {
    no: "07",
    title: "",
    time: "12:59",
    temp: 21,
    humid: 90,
    vis: 2.5,
    vapor: { lv: 4, label: "Heavy" },
    locDms: "33°18'53.3\"N 131°28'41.7\"E",
    lat: 33.314806,
    lng: 131.478250,
    photo: "photos/KNNW_07.jpg",
    thumb: "photos/KNNW_07_th.jpg"
  },
  {
    no: "08",
    title: "",
    time: "15:23",
    temp: 23,
    humid: 94,
    vis: 2.0,
    vapor: { lv: 5, label: "Blind" },
    locDms: "33°18'56.8\"N 131°28'24.5\"E",
    lat: 33.315778,
    lng: 131.473472,
    photo: "photos/KNNW_08.jpg",
    thumb: "photos/KNNW_08_th.jpg"
  },
  {
    no: "09",
    title: "",
    time: null,
    temp: null,
    humid: null,
    vis: null,
    vapor: { lv: 2, label: "Drift" },
    locDms: "33°18'59.3\"N 131°28'42.2\"E",
    lat: 33.316472,
    lng: 131.478389,
    photo: "photos/KNNW_09.jpg",
    thumb: "photos/KNNW_09_th.jpg"
  },
  {
    no: "10",
    title: "",
    time: "18:12",
    temp: 17,
    humid: 55,
    vis: 13.5,
    vapor: { lv: 1, label: "Stable" },
    locDms: "33°18'59.4\"N 131°28'35.1\"E",
    lat: 33.316489,
    lng: 131.476418,
    photo: "photos/KNNW_10.jpg",
    thumb: "photos/KNNW_10_th.jpg"
  },
  {
    no: "11",
    title: "",
    time: "19:41",
    temp: 13,
    humid: 100,
    vis: 0.0,
    vapor: { lv: 5, label: "Blind" },
    locDms: "33°18'59.1\"N 131°28'41.4\"E",
    lat: 33.316417,
    lng: 131.478167,
    photo: "photos/KNNW_11.jpg",
    thumb: "photos/KNNW_11_th.jpg"
  },
  {
    no: "12",
    title: "",
    time: "21:19",
    temp: 13,
    humid: 61,
    vis: 11.0,
    vapor: { lv: 2, label: "Drift" },
    locDms: "33°18'57.6\"N 131°28'39.1\"E",
    lat: 33.315989,
    lng: 131.477528,
    photo: "photos/KNNW_12.jpg",
    thumb: "photos/KNNW_12_th.jpg"
  },
  {
    no: "13",
    title: "",
    time: "23:49",
    temp: 12,
    humid: 67,
    vis: 9.0,
    vapor: { lv: 3, label: "Moderate" },
    locDms: "33°19'01.2\"N 131°28'40.8\"E",
    lat: 33.317000,
    lng: 131.478000,
    photo: "photos/KNNW_13.jpg",
    thumb: "photos/KNNW_13_th.jpg"
  },
  {
    no: "14",
    title: "",
    time: "16:09",
    temp: 55,
    humid: 91,
    vis: 5.5,
    vapor: { lv: 3, label: "Moderate" },
    locDms: "33°18'54.7\"N 131°28'42.1\"E",
    lat: 33.315194,
    lng: 131.478361,
    photo: "photos/KNNW_14.jpg",
    thumb: "photos/KNNW_14_th.jpg"
  }
];

// VAPOR レベル別のカラー定義（観測強度を視覚化）
var VAPOR_COLORS = {
  1: { name: "Stable",   color: "#7A9E7E", bg: "#E8F0E5" },  // 淡い緑：穏やか
  2: { name: "Drift",    color: "#6E8AA6", bg: "#E5EBF2" },  // 青灰：漂う
  3: { name: "Moderate", color: "#C8A24A", bg: "#F4ECD6" },  // 黄土：中程度
  4: { name: "Heavy",    color: "#C26B3A", bg: "#F4DECF" },  // 橙：濃い
  5: { name: "Blind",    color: "#8C3A2B", bg: "#EFD9D2" }   // 朱：視界遮断
};

// 起動時の初期表示
var KANNAWA_VIEW = {
  // 中央：写真01「見はらし坂」
  center: [33.317556, 131.478778],
  // 鉄輪全体（14スポット＋周辺）が収まるおおよその倍率
  // 全14点は ~600m 四方に収まるため zoom 16 前後が適切
  zoom: 16,
  // 起動時に全スポットへ自動フィット（true で center/zoom を上書き）
  fitBounds: true,
  // フィット時のパディング（鉄輪らしい街並みも見えるように余白）
  fitPadding: [60, 60]
};

// メタ情報（フッター・ヘッダー表示用）
var KANNAWA_META = {
  code:       "KNNW-2026",
  totalUnit:  "014",
  title:      "鉄輪 観察記録",
  subtitle:   "Vapor Field Notes",
  observer:   "Etsuko Kanno",
  place:      "Beppu / Oita / Japan",
  instagram:  "beppu_kannawa",
  year:       2023
};
