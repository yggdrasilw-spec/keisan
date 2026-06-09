// 15-global-hud.js
// ======================================================
// 共通フロートUI（戻る / 音声 / 効果音 / ★）
// ・★は複数HTML間で timestamp 付き同期
// ・最後に更新された値を全キーへ反映
// ======================================================
(function () {
  'use strict';

  var DEFAULT_MAIN_URL = './tashizan_ninja.html?open=kiso-home&skip-startup=1';
  var FX_KEY = 'tashizan_v2_fx';
  var VOICE_KEY = 'tashizan_voice_on';
  var STAR_SYNC_PREFIX = 'tashizan_star_sync:';

  var state = {
    inited: false,
    opts: null,
    root: null,
    backBtn: null,
    sfxBtn: null,
    voiceBtn: null,
    starPill: null,
    layoutRaf: 0,
    layoutTimer: 0
  };

  function safeGetItem(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetItem(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }

  function safeParseJSON(text, fallback) {
    try {
      return text ? JSON.parse(text) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function isHudNode(node) {
    return !!(node && node.id && /^global-hud-/.test(node.id));
  }

  function rectIntersects(a, b) {
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function rectOverlapArea(a, b) {
    var left = Math.max(a.left, b.left);
    var right = Math.min(a.right, b.right);
    var top = Math.max(a.top, b.top);
    var bottom = Math.min(a.bottom, b.bottom);
    if (right <= left || bottom <= top) return 0;
    return (right - left) * (bottom - top);
  }

  function isVisibleElement(el) {
    if (!el || el.nodeType !== 1) return false;
    if (isHudNode(el)) return false;
    if (el.closest && el.closest('#global-hud-back, #global-hud-cluster')) return false;
    var style = window.getComputedStyle ? getComputedStyle(el) : null;
    if (!style) return false;
    if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) return false;
    var rect = el.getBoundingClientRect ? el.getBoundingClientRect() : null;
    if (!rect || rect.width < 4 || rect.height < 4) return false;
    if (rect.bottom < 0 || rect.right < 0) return false;
    if (rect.top > Math.min(window.innerHeight || 0, 170)) return false;
    if (el.children && el.children.length > 0 && rect.width > (window.innerWidth || 0) * 0.78 && rect.height <= 120) return false;
    if (rect.width > (window.innerWidth || 0) * 0.96 && rect.height > 70) return false;
    return true;
  }

  function collectAvoidRects(extraNodes) {
    var rects = [];
    var seen = [];
    var nodes = Array.prototype.slice.call(document.body ? document.body.querySelectorAll('*') : []);
    if (Array.isArray(extraNodes)) {
      for (var i = 0; i < extraNodes.length; i++) nodes.push(extraNodes[i]);
    }
    for (var j = 0; j < nodes.length; j++) {
      var el = nodes[j];
      if (!isVisibleElement(el)) continue;
      var rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.right < 0) continue;
      if (rect.top > Math.min(window.innerHeight || 0, 170)) continue;
      var key = [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)].join(':');
      if (seen.indexOf(key) !== -1) continue;
      seen.push(key);
      rects.push({ left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom });
    }
    return rects;
  }

  function findBestHudX(el, preferredSide, obstacles, y, margin) {
    var vw = window.innerWidth || document.documentElement.clientWidth || 0;
    var rect = el.getBoundingClientRect();
    var width = rect.width;
    var height = rect.height;
    if (!vw || !width) return margin;

    var minX = margin;
    var maxX = Math.max(margin, vw - width - margin);
    var step = 8;
    var best = null;
    var bestScore = Infinity;
    var start = preferredSide === 'left' ? minX : maxX;
    var end = preferredSide === 'left' ? maxX : minX;
    var dir = preferredSide === 'left' ? step : -step;

    function scoreAt(x) {
      var cand = { left: x, top: y, right: x + width, bottom: y + height };
      var overlapCount = 0;
      var overlapArea = 0;
      for (var i = 0; i < obstacles.length; i++) {
        var obs = obstacles[i];
        if (rectIntersects(cand, obs)) {
          overlapCount += 1;
          overlapArea += rectOverlapArea(cand, obs);
        }
      }
      return { count: overlapCount, area: overlapArea, rect: cand };
    }

    for (var x = start; preferredSide === 'left' ? x <= end : x >= end; x += dir) {
      var sc = scoreAt(x);
      if (sc.count === 0) return sc.rect;
      var weighted = sc.count * 100000 + sc.area;
      if (weighted < bestScore) {
        bestScore = weighted;
        best = sc.rect;
      }
    }
    return best || { left: start, top: y, right: start + width, bottom: y + height };
  }

  function applyHudRect(el, rect) {
    if (!el) return;
    el.style.left = Math.round(rect.left) + 'px';
    el.style.top = Math.round(rect.top) + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
  }

  function scheduleLayout() {
    if (state.layoutRaf) return;
    state.layoutRaf = window.requestAnimationFrame(function () {
      state.layoutRaf = 0;
      layoutHud();
    });
  }

  function ensureLayoutListeners() {
    if (state.layoutTimer) return;
    state.layoutTimer = 1;
    window.addEventListener('resize', scheduleLayout, { passive: true });
    window.addEventListener('orientationchange', scheduleLayout, { passive: true });
    window.addEventListener('scroll', scheduleLayout, { passive: true });
    if (window.ResizeObserver) {
      try {
        var ro = new ResizeObserver(scheduleLayout);
        ro.observe(document.documentElement);
        ro.observe(document.body);
      } catch (e) {}
    }
  }

  function ensureStyle() {
    if (document.getElementById('global-hud-style')) return;
    var css = ''
      + '#global-hud-back, #global-hud-cluster { position:fixed; top: 10px; z-index: 9999; }'
      + '#global-hud-back { left: 10px; }'
      + '#global-hud-cluster { right: 10px; display:flex; align-items:center; gap:8px; max-width: calc(100vw - 20px); }'
      + '#global-hud-star { position:static; }'
      + '.hud-pill, .hud-btn {'
      + '  -webkit-tap-highlight-color: transparent;'
      + '  touch-action: manipulation;'
      + '  border: 1.5px solid rgba(120, 90, 45, .18);'
      + '  box-shadow: 0 2px 8px rgba(0,0,0,.10);'
      + '  backdrop-filter: blur(6px);'
      + '  font-family: "Hiragino Maru Gothic ProN", "BIZ UDPGothic", sans-serif;'
      + '  white-space: nowrap; line-height: 1.2;'
      + '}'
      + '.hud-pill {'
      + '  display:flex; align-items:center; gap:6px;'
      + '  padding: 6px 10px; border-radius: 999px;'
      + '  background: rgba(255, 249, 240, 0.94); color:#6b4a18;'
      + '  font-size: 12px; font-weight: 800;'
      + '}'
      + '.hud-pill strong { font-size: 13px; }'
      + '.hud-btn {'
      + '  border-radius: 14px; padding: 5px 10px; font-size: 11px; font-weight: 800;'
      + '  background: rgba(255,249,240,.95); color:#8a5b14; cursor:pointer;'
      + '}'
      + '.hud-btn.on { background: #FFF3D6; border-color: #F5A623; color:#7A5000; }'
      + '.hud-btn.off { background: #E8E8E8; border-color: #B0B0B0; color:#909090; opacity: .78; }'
      + '.hud-back { background: rgba(255,238,244,.94); border-color:#F0A0BF; color:#8A2050; }'
      + '.hud-back:active, .hud-btn:active, .hud-pill:active { transform: scale(.98); }'
      + '@media (max-width: 420px) {'
      + '  #global-hud-back { top: 8px; left: 8px; }'
      + '  #global-hud-cluster { top: 8px; right: 8px; }'
      + '  .hud-btn, .hud-pill { font-size: 10px; }'
      + '}';

    var style = document.createElement('style');
    style.id = 'global-hud-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function layoutHud() {
    var margin = 10;
    var topY = Math.max(8, Math.min(10, (window.innerHeight || 0) - 1));
    var obstacles = collectAvoidRects([state.backBtn, state.root, state.starPill, state.sfxBtn, state.voiceBtn]);
    var placed = [];

    if (state.backBtn && state.backBtn.parentNode) {
      var backRect = findBestHudX(state.backBtn, 'left', obstacles.concat(placed), topY, margin);
      applyHudRect(state.backBtn, backRect);
      placed.push(backRect);
    }

    if (state.root && state.root.parentNode) {
      var clusterRect = findBestHudX(state.root, 'right', obstacles.concat(placed), topY, margin);
      applyHudRect(state.root, clusterRect);
      placed.push(clusterRect);
    }
  }

  function loadFxSettings() {
    return safeParseJSON(safeGetItem(FX_KEY, ''), {});
  }

  function getSfxOn() {
    var fx = loadFxSettings();
    if (typeof fx.fx_sfx === 'boolean') return fx.fx_sfx;
    return true;
  }

  function setSfxOn(nextOn) {
    var fx = loadFxSettings();
    fx.fx_sfx = !!nextOn;
    safeSetItem(FX_KEY, JSON.stringify(fx));
    window.sfxOn = !!nextOn;
    if (typeof setSfxEnabled === 'function') {
      try { setSfxEnabled(!!nextOn); } catch (e) {}
    }
    if (typeof syncAudioControlButtons === 'function') {
      try { syncAudioControlButtons(); } catch (e2) {}
    }
    refreshButtons();
    scheduleLayout();
  }

  function getVoiceOn() {
    return safeGetItem(VOICE_KEY, '1') !== '0';
  }

  function setVoiceOn(nextOn) {
    var on = !!nextOn;
    safeSetItem(VOICE_KEY, on ? '1' : '0');
    window.voiceOn = on;
    if (typeof setVoiceOnState === 'function') {
      try { setVoiceOnState(on); } catch (e) {}
    }
    if (typeof window.__hudVoiceSync === 'function') {
      try { window.__hudVoiceSync(on); } catch (e2) {}
    }
    if (typeof syncAudioControlButtons === 'function') {
      try { syncAudioControlButtons(); } catch (e3) {}
    }
    refreshButtons();
    scheduleLayout();
  }

  function getStarKeys() {
    var opts = state.opts || {};
    if (Array.isArray(opts.starKeys) && opts.starKeys.length) return opts.starKeys.slice();
    if (typeof opts.starKey === 'function') {
      var k = opts.starKey();
      return k ? [k] : [];
    }
    if (typeof opts.starKey === 'string' && opts.starKey) return [opts.starKey];
    return [];
  }

  function metaKeyFor(key) {
    return STAR_SYNC_PREFIX + key + ':meta';
  }

  function readStarRecord(key) {
    var count = parseInt(safeGetItem(key, '0'), 10);
    if (!Number.isFinite(count)) count = 0;
    var meta = safeParseJSON(safeGetItem(metaKeyFor(key), ''), {});
    var updatedAt = parseInt(meta.updatedAt, 10);
    if (!Number.isFinite(updatedAt)) updatedAt = 0;
    return {
      key: key,
      count: count,
      updatedAt: updatedAt,
      source: meta.source || key
    };
  }

  function chooseLatestRecord(records) {
    var best = null;
    for (var i = 0; i < records.length; i++) {
      var rec = records[i];
      if (!best) {
        best = rec;
        continue;
      }
      if (rec.updatedAt > best.updatedAt) {
        best = rec;
        continue;
      }
      if (rec.updatedAt === best.updatedAt && rec.count > best.count) {
        best = rec;
      }
    }
    return best;
  }

  function writeStarRecord(keys, count, source, updatedAt) {
    var ts = Number.isFinite(updatedAt) ? updatedAt : Date.now();
    var safeCount = Math.max(0, parseInt(count, 10) || 0);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      safeSetItem(key, String(safeCount));
      safeSetItem(metaKeyFor(key), JSON.stringify({
        count: safeCount,
        updatedAt: ts,
        source: source || keys[0] || key
      }));
    }
    return { count: safeCount, updatedAt: ts, source: source || keys[0] || '' };
  }

  function reconcileStarStore(keys) {
    if (!keys.length) return { count: 0, updatedAt: 0, source: '' };
    var records = [];
    for (var i = 0; i < keys.length; i++) records.push(readStarRecord(keys[i]));
    var latest = chooseLatestRecord(records);

    // 初回だけ値が全部 0/未設定でも、最新を作る
    if (!latest) {
      latest = { count: 0, updatedAt: 0, source: keys[0] };
    }

    var needsWrite = false;
    for (var j = 0; j < records.length; j++) {
      if (records[j].count !== latest.count || records[j].updatedAt !== latest.updatedAt || records[j].source !== latest.source) {
        needsWrite = true;
        break;
      }
    }
    if (needsWrite) {
      writeStarRecord(keys, latest.count, latest.source, latest.updatedAt || Date.now());
    }
    return latest;
  }

  function getTotalStarCount() {
    var keys = getStarKeys();
    if (!keys.length) return 0;
    return reconcileStarStore(keys).count;
  }

  function setStarCount(value, source) {
    var keys = getStarKeys();
    if (!keys.length) return Math.max(0, parseInt(value, 10) || 0);
    var rec = writeStarRecord(keys, value, source || keys[0], Date.now());
    refreshButtons();
    scheduleLayout();
    return rec.count;
  }

  function addStarCount(delta, source) {
    return setStarCount(getTotalStarCount() + (parseInt(delta, 10) || 0), source);
  }

  function syncAudioButtons() {
    if (state.sfxBtn) {
      state.sfxBtn.className = 'hud-btn ' + (getSfxOn() ? 'on' : 'off');
      state.sfxBtn.textContent = (getSfxOn() ? '🔔 おと' : '🔕 おと');
    }
    if (state.voiceBtn) {
      state.voiceBtn.className = 'hud-btn ' + (getVoiceOn() ? 'on' : 'off');
      state.voiceBtn.textContent = (getVoiceOn() ? '🗣 こえ' : '🔇 こえ');
    }
  }

  function syncStarPill() {
    if (!state.starPill) return;
    var opts = state.opts || {};
    var total = getTotalStarCount();
    var prefix = opts.starLabelPrefix || '★×';
    state.starPill.innerHTML = '<strong>🥷</strong><span>' + prefix + total + '</span>';
    state.starPill.title = opts.starTitle || 'ためた★の数';
  }

  function refreshButtons() {
    syncAudioButtons();
    syncStarPill();
  }

  function removeExisting(id) {
    var el = document.getElementById(id);
    if (el && el.parentNode) el.parentNode.removeChild(el);
    return el;
  }

  function makeButton(text, extraClass, id) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = id;
    btn.className = extraClass;
    btn.textContent = text;
    return btn;
  }

  function init(opts) {
    state.opts = opts || {};
    ensureStyle();
    ensureLayoutListeners();

    if (state.inited) {
      refreshButtons();
      scheduleLayout();
      return api;
    }

    var showBack = state.opts.showBack !== false;
    var showSfx = state.opts.showSfx !== false;
    var showVoice = state.opts.showVoice !== false;
    var showStar = state.opts.showStar !== false;
    var mainUrl = state.opts.mainUrl || DEFAULT_MAIN_URL;
    var backLabel = state.opts.backLabel || '← もどる';
    var hasClusterItems = !!(showSfx || showVoice || showStar);

    if (showBack) {
      state.backBtn = removeExisting('global-hud-back') || makeButton(backLabel, 'hud-btn hud-back', 'global-hud-back');
      state.backBtn.textContent = backLabel;
      state.backBtn.addEventListener('click', function () {
        if (typeof state.opts.onBack === 'function') {
          state.opts.onBack();
          return;
        }
        window.location.href = mainUrl;
      });
      if (!state.backBtn.parentNode) document.body.appendChild(state.backBtn);
    }

    if (hasClusterItems) {
      state.root = removeExisting('global-hud-cluster') || document.createElement('div');
      state.root.id = 'global-hud-cluster';
      state.root.innerHTML = '';
      if (showStar) {
        state.starPill = removeExisting('global-hud-star') || document.createElement('div');
        state.starPill.id = 'global-hud-star';
        state.starPill.className = 'hud-pill';
        state.root.appendChild(state.starPill);
      } else {
        state.starPill = null;
      }
      if (showSfx) {
        state.sfxBtn = makeButton('🔔 おと', 'hud-btn on', 'global-hud-sfx');
        state.sfxBtn.addEventListener('click', function () { setSfxOn(!getSfxOn()); });
        state.root.appendChild(state.sfxBtn);
      } else {
        state.sfxBtn = null;
      }
      if (showVoice) {
        state.voiceBtn = makeButton('🗣 こえ', 'hud-btn on', 'global-hud-voice');
        state.voiceBtn.addEventListener('click', function () { setVoiceOn(!getVoiceOn()); });
        state.root.appendChild(state.voiceBtn);
      } else {
        state.voiceBtn = null;
      }
      if (!state.root.parentNode) document.body.appendChild(state.root);
    }

    state.inited = true;
    refreshButtons();
    scheduleLayout();
    return api;
  }

  var api = {
    init: init,
    refresh: refreshButtons,
    sync: refreshButtons,
    getSfxOn: getSfxOn,
    setSfxOn: setSfxOn,
    getVoiceOn: getVoiceOn,
    setVoiceOn: setVoiceOn,
    getStarCount: getTotalStarCount,
    getStarKeys: getStarKeys,
    setStarCount: setStarCount,
    addStarCount: addStarCount,
    reconcileStarStore: reconcileStarStore
  };

  window.TashizanHud = api;

  window.addEventListener('storage', function () {
    refreshButtons();
    scheduleLayout();
    if (typeof syncAudioControlButtons === 'function') {
      try { syncAudioControlButtons(); } catch (e) {}
    }
  });

  window.addEventListener('load', function () {
    scheduleLayout();
    setTimeout(scheduleLayout, 50);
    setTimeout(scheduleLayout, 250);
  });
})();
