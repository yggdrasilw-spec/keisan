// 00-fx-settings.js
// ======================================================
// エフェクト設定
// ======================================================
var LS_FX = APP_KEYS.FX;
var fxSettings = lsLoad(LS_FX);

function getFx(key) {
  return Object.prototype.hasOwnProperty.call(fxSettings, key) ? !!fxSettings[key] : true;
}

function setFx(key, value) {
  fxSettings[key] = !!value;
  storageSaveJSON(LS_FX, fxSettings);
  if (typeof syncFxToggleButtons === 'function') syncFxToggleButtons();
}
