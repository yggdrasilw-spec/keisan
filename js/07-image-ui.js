// 07-image-ui.js
// ======================================================
// 画像管理（設定画面UI）
// ======================================================
var _currentImgEditKey = null;

function renderImgSetRows() {
  IMG_KEYS.forEach(function(key){ refreshImgSetRow(key); });
}

function syncImageSettingsUI() {
  renderImgSetRows();
  var mImg = document.getElementById('master-popup-img');
  if (mImg) mImg.src = imgSrc('master');
}

function refreshImgSetRow(key) {
  var el = document.getElementById('img-set-'+key);
  if (!el) return;
  var src = imgSrc(key);
  var hasCustom = !!imgCustom[key];
  var fname = hasCustom ? (imgCustom['_name_'+key] || 'カスタム がぞう') : '（うめこみ がぞう）';
  el.innerHTML =
    '<img class="img-set-preview" id="prev-'+key+'" src="'+src+'" alt="" onerror="this.style.display=&#39;none&#39;" />'
    +'<div class="img-set-info">'
    +'  <div class="img-set-label">'+IMG_LABELS[key]+'</div>'
    +'  <div class="img-set-name" id="iname-'+key+'">'+escHtml(fname)+'</div>'
    +'</div>'
    +'<button class="img-set-btn" data-action="openImgPicker" data-value="'+key+'">えらぶ</button>'
    +(hasCustom ? '<button class="img-set-reset" data-action="resetImg" data-value="'+key+'">↺</button>' : '');
}

function openImgPicker(key) {
  _currentImgEditKey = key;
  var inp = document.getElementById('img-file-input');
  if (!inp) return;
  inp.value = ''; inp.click();
}

function initImageFileInputBinding() {
  var inp = document.getElementById('img-file-input');
  if (!inp || inp.__boundImageChange) return;
  inp.__boundImageChange = true;
  inp.addEventListener('change', onImgFileSelected);
}

function onImgFileSelected(e) {
  var file = e.target.files && e.target.files[0];
  if (!file || !_currentImgEditKey) return;
  var key = _currentImgEditKey;
  if (file.size > 2 * 1024 * 1024) {
    if (!confirm('ファイルサイズが 2MB をこえています。\nそのまま つかいますか？')) return;
  }
  fileToBase64(file, function(b64){
    imgCustom[key] = b64;
    imgCustom['_name_'+key] = file.name;
    imgCustomSave();
    syncImageSettingsUI();
  });
}

function resetImg(key) {
  delete imgCustom[key];
  delete imgCustom['_name_'+key];
  imgCustomSave();
  syncImageSettingsUI();
  if (key === 'master') {
    var mImg = document.getElementById('master-popup-img');
    if (mImg) mImg.src = imgSrc('master');
  }
}

initImageFileInputBinding();
