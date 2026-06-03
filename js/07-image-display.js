// 07-image-display.js
// ======================================================
// 画像オーバーレイ表示
// ======================================================
var imgTimer = null;

function showImg(key, dur) {
  var ov = document.getElementById('img-overlay');
  var im = document.getElementById('overlay-img');
  if (imgTimer) { clearTimeout(imgTimer); }
  im.src = imgSrc(key);
  ov.classList.add('show');
  imgTimer = setTimeout(function(){ ov.classList.remove('show'); }, dur || 800);
}
