// kiso-mini-common.js
// ======================================================
// 基礎修行ミニゲーム共通ヘルパー
// - ★ 保存を単一キーに集約
// - きそしゅぎょうへの復帰
// - HUD 表示更新
// ======================================================
(function () {
  'use strict';

  var STAR_KEY = 'ninja-stars-total';
  var KISO_RETURN_URL = './tashizan_ninja.html?open=kiso-home';

  function toInt(v) {
    var n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
  }

  function getNinjaStars() {
    try {
      return toInt(localStorage.getItem(STAR_KEY));
    } catch (e) {
      return 0;
    }
  }

  function setNinjaStars(value) {
    var next = Math.max(0, toInt(value));
    try { localStorage.setItem(STAR_KEY, String(next)); } catch (e) {}
    syncNinjaStarsUI(next);
    return next;
  }

  function addNinjaStars(delta) {
    return setNinjaStars(getNinjaStars() + toInt(delta));
  }

  function formatStarCount(count) {
    var n = Math.max(0, toInt(count));
    return '★×' + n;
  }

  function syncNinjaStarsUI(value) {
    var text = formatStarCount(value);
    var nodes = document.querySelectorAll('[data-ninja-stars], .js-ninja-stars, #ninja-stars-hud, #total-stars-count, #go-stars-count, #total-stars-disp, #go-stars-disp');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!node) continue;
      if (node.id === 'result-stars' && node.children && node.children.length) continue;
      node.textContent = text;
    }
  }

  function ensureNinjaHud() {
    var nodes = document.querySelectorAll('[data-ninja-stars], .js-ninja-stars, #ninja-stars-hud, #total-stars-count, #go-stars-count, #total-stars-disp, #go-stars-disp');
    syncNinjaStarsUI(getNinjaStars());
    return nodes;
  }

  function goToKisoHome(extraQuery) {
    var url = KISO_RETURN_URL;
    if (extraQuery) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + extraQuery.replace(/^\?/, '');
    }
    window.location.href = url;
  }

  function bindBackButtons(selectorOrIds, handler) {
    var ids = Array.isArray(selectorOrIds) ? selectorOrIds : [selectorOrIds];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('click', handler);
    });
  }

  window.NINJA_STARS_KEY = STAR_KEY;
  window.getNinjaStars = getNinjaStars;
  window.setNinjaStars = setNinjaStars;
  window.addNinjaStars = addNinjaStars;
  window.formatStarCount = formatStarCount;
  window.syncNinjaStarsUI = syncNinjaStarsUI;
  window.ensureNinjaHud = ensureNinjaHud;
  window.goToKisoHome = goToKisoHome;
  window.bindBackButtons = bindBackButtons;
})();
