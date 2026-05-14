// =============================================================
//  map-config.js  ── 配布後の運用調整はこのファイル1つで完結
// =============================================================
//  ★ 非エンジニア向け緊急マニュアル ★
//
//  ▼ Mapbox から「無料枠まもなく超過」のメールが来たら：
//     1. このファイルの MAP_TILE を 'osm' に書き換え
//     2. Vercel のダッシュボードで再デプロイ（または git push）
//        → 以後 Mapbox には一切リクエストが飛ばず OSM 表示に
//
//  ▼ 落ち着いたら 'mapbox' に戻して再デプロイ
//
//  ※ 'auto' のままにしておくと、Mapbox がエラー（403/429）を
//     返した時点でクライアント側が自動で OSM にフォールバック
//     します。メールに気づくのが遅れても被害を最小化します。
// =============================================================

var MAP_CONFIG = {

  // —— タイル切替（'auto' / 'mapbox' / 'osm'）—————————————
  //   'auto'   : 通常は Mapbox、エラー多発時に自動で OSM へ
  //   'mapbox' : Mapbox 固定
  //   'osm'    : OSM 固定（緊急停止モード）
  MAP_TILE: 'auto',

  // —— Mapbox トークン（URL 制限付きの本番用に差し替える）——
  //   発行: https://account.mapbox.com/access-tokens
  //   トークンは隠す必要はありません（公開タイプ）。安全性は
  //   Mapbox 側の URL Restrictions で担保します。
  MAPBOX_TOKEN: 'pk.eyJ1IjoiaGFjaGloYWNoaTg4IiwiYSI6ImNtcDVpOXRibDBzOHYycnM5czQxcmR4dG0ifQ.OFAvtD7czVdrjXVGSJf5tw',

  // —— 自動フォールバックの閾値 —————————————————
  //   Mapbox が下記回数だけタイル取得に失敗したら OSM に切替
  AUTO_FALLBACK_ERRORS: 6
};
