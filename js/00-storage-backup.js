// 00-storage-backup.js
// ======================================================
// バックアップ / 復元
// ======================================================
var APP_BACKUP_SCHEMA = 'tashizan-save';
var APP_BACKUP_FORMAT_VERSION = 1;
var APP_BACKUP_PREFIX = 'tashizan_';

function padBackup2(n) {
  return (n < 10 ? '0' : '') + n;
}

function buildBackupTimestamp(dateObj) {
  var d = dateObj || new Date();
  return d.getFullYear() + '-' + padBackup2(d.getMonth() + 1) + '-' + padBackup2(d.getDate()) + '_' + padBackup2(d.getHours()) + '-' + padBackup2(d.getMinutes()) + '-' + padBackup2(d.getSeconds());
}

function buildBackupFilename() {
  return 'たし算忍者_' + buildBackupTimestamp(new Date()) + '.sav';
}

function getBackupStorageKeys() {
  var keys = [];
  var seen = {};
  function addKey(key) {
    if (!key || seen[key]) return;
    seen[key] = true;
    keys.push(key);
  }

  if (typeof getPersistedAppStorageKeys === 'function') {
    getPersistedAppStorageKeys().forEach(addKey);
  }

  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (typeof key === 'string' && key.indexOf(APP_BACKUP_PREFIX) === 0) addKey(key);
    }
  } catch (e) {}

  return keys;
}

function isDataUriString(value) {
  return typeof value === 'string' && /^data:[^,]+,/.test(value);
}

function sanitizeBackupValue(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (isDataUriString(value)) return undefined;
    return value;
  }
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    var arr = [];
    for (var i = 0; i < value.length; i++) {
      var v = sanitizeBackupValue(value[i]);
      if (v !== undefined) arr.push(v);
    }
    return arr;
  }
  var out = {};
  for (var k in value) {
    if (!Object.prototype.hasOwnProperty.call(value, k)) continue;
    var next = sanitizeBackupValue(value[k]);
    if (next !== undefined) out[k] = next;
  }
  return out;
}

function sanitizeBackupSnapshot(snapshot) {
  var cloned = JSON.parse(JSON.stringify(snapshot || {}));
  if (cloned.storage) cloned.storage = sanitizeBackupValue(cloned.storage) || {};
  return cloned;
}

function collectBackupPayload() {
  var snapshot = sanitizeBackupSnapshot(collectAppSnapshot());
  var storageDump = {};
  var omittedKeys = [];
  var keys = getBackupStorageKeys();

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var raw = null;
    try { raw = localStorage.getItem(key); } catch (e) { raw = null; }
    if (raw === null || raw === undefined) continue;

    var parsed = raw;
    var parsedOk = false;
    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
        parsedOk = true;
      } catch (e) {
        parsed = raw;
      }
    }

    var sanitized = sanitizeBackupValue(parsed);
    if (parsedOk && typeof parsed === 'object' && sanitized && JSON.stringify(sanitized) !== JSON.stringify(parsed)) {
      omittedKeys.push(key);
    } else if (typeof parsed === 'string' && isDataUriString(parsed)) {
      omittedKeys.push(key);
      continue;
    }

    if (sanitized === undefined) continue;
    storageDump[key] = sanitized;
  }

  return {
    schema: APP_BACKUP_SCHEMA,
    backupVersion: APP_BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    omittedKeys: omittedKeys,
    snapshot: snapshot,
    storageDump: storageDump
  };
}

function exportAppData() {
  return JSON.stringify(collectBackupPayload(), null, 2);
}

function downloadAppDataFile() {
  var filename = buildBackupFilename();
  return downloadTextFile(filename, exportAppData(), 'text/plain;charset=utf-8');
}

function restoreBackupStorageDump(storageDump) {
  if (!storageDump || typeof storageDump !== 'object') return;
  for (var key in storageDump) {
    if (!Object.prototype.hasOwnProperty.call(storageDump, key)) continue;
    var value = storageDump[key];
    if (value === undefined) continue;
    if (value === null) {
      storageSaveJSON(key, null);
      continue;
    }
    if (typeof value === 'string') {
      storageSaveText(key, value);
    } else {
      storageSaveJSON(key, value);
    }
  }
}

function importAppData(jsonText) {
  try {
    var text = String(jsonText || '').replace(/^\uFEFF/, '').trim();
    if (!text) return false;
    var payload = JSON.parse(text);

    if (payload && payload.schema === APP_BACKUP_SCHEMA && payload.snapshot) {
      restoreBackupStorageDump(payload.storageDump);
      return syncPersistedStateFromSnapshot(payload.snapshot);
    }

    if (payload && payload.storage) {
      return syncPersistedStateFromSnapshot(payload);
    }

    return false;
  } catch (e) {
    return false;
  }
}

function openAppDataImportPicker() {
  var inp = document.getElementById('app-data-import-input');
  if (!inp) return false;
  inp.value = '';
  inp.click();
  return true;
}

function initAppDataImportBinding() {
  var inp = document.getElementById('app-data-import-input');
  if (!inp || inp.__boundAppDataImport) return;
  inp.__boundAppDataImport = true;
  inp.addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var ok = importAppData(ev.target.result);
      alert(ok ? 'セーブデータを 取りこみました。' : 'セーブデータの 取りこみに しっぱいしました。');
    };
    reader.onerror = function () {
      alert('ファイルを 読みこめませんでした。');
    };
    reader.readAsText(file, 'utf-8');
  });
}

function downloadTextFile(filename, text, mimeType) {
  try {
    var blob = new Blob([text], { type: mimeType || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 0);
    return true;
  } catch (e) {
    return false;
  }
}

initAppDataImportBinding();
