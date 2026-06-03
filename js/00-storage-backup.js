// 00-storage-backup.js
// ======================================================
// バックアップ / 復元
// ======================================================
function exportAppData() {
  return JSON.stringify(collectAppSnapshot(), null, 2);
}

function importAppData(jsonText) {
  try {
    var snapshot = JSON.parse(jsonText);
    return syncPersistedStateFromSnapshot(snapshot);
  } catch (e) {
    return false;
  }
}

function downloadTextFile(filename, text, mimeType) {
  try {
    var blob = new Blob([text], { type: mimeType || 'application/json;charset=utf-8' });
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
