// 07-image-data.js
// ======================================================
// 画像管理（データ層）
// ======================================================
var IMG_KEYS = ['seikai', 'fuseikai', 'master'];
var IMG_LABELS = { seikai:'🎉 せいかい！', fuseikai:'😢 ふせいかい…', master:'🏆 マスター！！' };

// デフォルト画像（HTMLに埋め込み済みBase64）
var IMG_B64_DEFAULT = {
  seikai:   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  fuseikai: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  master:   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
};

// カスタム画像キャッシュ（localStorage）
var LS_IMG = APP_KEYS.IMGS;
var imgCustom = {};
function imgCustomLoad() {
  imgCustom = storageLoadJSON(LS_IMG, {});
}
function imgCustomSave() {
  try {
    storageSaveJSON(LS_IMG, imgCustom);
  } catch(e) {
    alert('がぞうのほぞんに しっぱいしました。\nがぞうのファイルサイズが おおきすぎるかもしれません。');
  }
}

// 画像srcを返す（カスタム優先、なければ埋め込みBase64）
function imgSrc(key) {
  return imgCustom[key] || IMG_B64_DEFAULT[key];
}

// ファイルをBase64に変換してキャッシュ＆保存
function fileToBase64(file, callback) {
  var reader = new FileReader();
  reader.onload = function(e) { callback(e.target.result); };
  reader.readAsDataURL(file);
}
