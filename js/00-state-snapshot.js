// 00-state-snapshot.js
// ======================================================
// アプリ状態のスナップショット / 復元
// ======================================================
function getAppSnapshotState() {
  return {
    data: getDataSnapshot(),
    session: getSessionSnapshot(),
    ui: getUiSnapshot()
  };
}

function applyAppSnapshotState(snapshot) {
  if (!snapshot) return false;
  if (snapshot.data) applyDataSnapshot(snapshot.data);
  if (snapshot.session) applySessionSnapshot(snapshot.session);
  if (snapshot.ui) applyUiSnapshot(snapshot.ui);
  return true;
}
