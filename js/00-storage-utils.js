// 00-storage-utils.js
// ======================================================
// localStorage 共通ラッパー / タブボタン共通化
// ======================================================
function storageLoadJSON(key, fallback) {
  try {
    var v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function storageLoadText(key, fallback) {
  try {
    var v = localStorage.getItem(key);
    return v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function storageSaveJSON(key, obj) {
  try {
    localStorage.setItem(key, JSON.stringify(obj));
  } catch (e) {}
}
function storageSaveText(key, val) {
  try {
    localStorage.setItem(key, String(val));
  } catch (e) {}
}
function storageRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}
function lsLoad(key, fallback) {
  return storageLoadJSON(key, typeof fallback === 'undefined' ? {} : fallback);
}
function lsSave(key, obj) {
  storageSaveJSON(key, obj);
}
function toggleTabButtons(prefix, keys, active) {
  keys.forEach(function(k) {
    var el = document.getElementById(prefix + k);
    if (el) el.classList.toggle('on', k === active);
  });
}
