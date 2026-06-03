// 01-course-popups.js
// ======================================================
// 例外コース用ポップアップ
// ======================================================
function closeAskGanbare(doIt) {
  hideCountdownOverlay();
  document.getElementById('ask-ganbare-dialog').style.display = 'none';
  if (doIt && window._ganbarePs && window._ganbarePs.length) {
    launchSession(sh(window._ganbarePs));
  }
  window._ganbarePs = null;
}

function closeAllMasterPopup() {
  hideCountdownOverlay();
  document.getElementById('all-master-popup').style.display = 'none';
}

function showAllMasterPopup() {
  var mImg = document.getElementById('master-popup-img');
  if (mImg) { mImg.src = imgSrc('master'); mImg.style.display = ''; }
  document.getElementById('all-master-popup').style.display = 'flex';
}
