// 04-settings-fx.js
// ======================================================
// 設定画面：エフェクト設定
// ======================================================
var FX_DEFS = [
  { key:'fx_shuriken',  label:'✨ 手裏剣エフェクト',    sub:'せいかい時に手裏剣が飛ぶ',    def:true },
  { key:'fx_wipe',      label:'🥷 ページ切り替えワイプ', sub:'画面が切り替わるときのアニメ', def:true },
  { key:'fx_perfect',   label:'⚡ 全問正解エフェクト',  sub:'全問正解時の稲妻・文字演出',   def:true },
  { key:'fx_sfx',       label:'🔔 効果音',              sub:'正解・不正解などの音',         def:true },
  { key:'fx_button',    label:'💥 ボタンエフェクト',    sub:'ボタンを押したときのエフェクト', def:true },
];

function syncFxToggleButtons() {
  FX_DEFS.forEach(function(def) {
    var tog = document.getElementById('fxtog-' + def.key);
    if (tog) tog.classList.toggle('on', getFx(def.key));
  });
}

function renderFxSettings() {
  var el = document.getElementById('fx-settings-area');
  if (!el) return;
  var h = '';
  FX_DEFS.forEach(function(def) {
    var on = getFx(def.key);
    h += '<div class="fx-check-row" data-action="toggleFx" data-value="' + def.key + '">'
      + '<div><div class="fx-check-label">' + def.label + '</div>'
      + '<div class="fx-check-sub">' + def.sub + '</div></div>'
      + '<div class="fx-toggle ' + (on ? 'on' : '') + '" id="fxtog-' + def.key + '"></div>'
      + '</div>';
  });
  el.innerHTML = h;
  syncFxToggleButtons();
}

function toggleFx(key) {
  var v = !getFx(key);
  setFx(key, v);
  syncFxToggleButtons();
  if (key === 'fx_sfx') {
    if (typeof setSfxEnabled === 'function') setSfxEnabled(v);
    else sfxOn = v;
    if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
  }
}
