// 15-global-hud.js
// ======================================================
// 共通フロートUI（戻る / 音声 / 効果音 / ★）
// ======================================================
(function () {
  'use strict';

  var DEFAULT_MAIN_URL = './tashizan_ninja.html#kiso-home';
  var FX_KEY = 'tashizan_v2_fx';
  var VOICE_KEY = 'tashizan_voice_on';
  var STAR_KEYS = ['ninja-stars'];

  var state = {
    inited: false,
    opts: null,
    root: null,
    backBtn: null,
    sfxBtn: null,
    voiceBtn: null,
    starPill: null
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
    try {
      localStorage.setItem(key, String(value));
    } catch (e) {}
  }

  function safeParseJSON(text, fallback) {
    try {
      return text ? JSON.parse(text) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function ensureStyle() {
    if (document.getElementById('global-hud-style')) return;
    var css = ''
      + '#global-hud-back, #global-hud-right, #global-hud-star { position:fixed; z-index: 9999; }'
      + '#global-hud-back { top: 10px; left: 10px; }'
      + '#global-hud-right { top: 10px; right: 10px; display:flex; align-items:center; gap:8px; }'
      + '#global-hud-star { top: 10px; right: 156px; display:flex; align-items:center; gap:8px; }'
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
      + '  #global-hud-right, #global-hud-star { top: 8px; right: 8px; }'
      + '  .hud-btn, .hud-pill { font-size: 10px; }'
      + '}';

    var style = document.createElement('style');
    style.id = 'global-hud-style';
    style.textContent = css;
    document.head.appendChild(style);
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
    if (typeof setSfxEnabled === 'function') {
      setSfxEnabled(!!nextOn);
    } else {
      window.sfxOn = !!nextOn;
    }
    if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
    refreshButtons();
  }

  function getVoiceOn() {
    return safeGetItem(VOICE_KEY, '1') !== '0';
  }

  function setVoiceOn(nextOn) {
    var on = !!nextOn;
    safeSetItem(VOICE_KEY, on ? '1' : '0');
    if (typeof setVoiceOnState === 'function') {
      setVoiceOnState(on);
    } else {
      window.voiceOn = on;
    }
    if (typeof window.__hudVoiceSync === 'function') {
      try { window.__hudVoiceSync(on); } catch (e) {}
    }
    if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
    refreshButtons();
  }

  function getStarKey() {
    var opts = state.opts || {};
    if (typeof opts.starKey === 'function') return opts.starKey();
    if (typeof opts.starKey === 'string' && opts.starKey) return opts.starKey;
    if (Array.isArray(opts.starKeys) && opts.starKeys.length) return opts.starKeys[0];
    return null;
  }

  function getStarCountForKey(key) {
    if (!key) return 0;
    return parseInt(safeGetItem(key, '0'), 10) || 0;
  }

  function getTotalStarCount() {
    var opts = state.opts || {};
    if (Array.isArray(opts.starKeys) && opts.starKeys.length) {
      var total = 0;
      for (var i = 0; i < opts.starKeys.length; i++) total += getStarCountForKey(opts.starKeys[i]);
      return total;
    }
    var key = getStarKey();
    return getStarCountForKey(key);
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
    if (state.inited) {
      refreshButtons();
      return api;
    }

    ensureStyle();

    var showBack = state.opts.showBack !== false;
    var showSfx = state.opts.showSfx !== false;
    var showVoice = state.opts.showVoice !== false;
    var showStar = state.opts.showStar !== false;
    var mainUrl = state.opts.mainUrl || DEFAULT_MAIN_URL;

    if (showBack) {
      state.backBtn = removeExisting('global-hud-back') || makeButton('← もどる', 'hud-btn hud-back', 'global-hud-back');
      state.backBtn.addEventListener('click', function () {
        if (typeof state.opts.onBack === 'function') {
          state.opts.onBack();
          return;
        }
        window.location.href = mainUrl;
      });
      if (!state.backBtn.parentNode) document.body.appendChild(state.backBtn);
    }

    if (showSfx || showVoice) {
      state.root = removeExisting('global-hud-right') || document.createElement('div');
      state.root.id = 'global-hud-right';
      state.root.innerHTML = '';
      if (showSfx) {
        state.sfxBtn = makeButton('🔔 おと', 'hud-btn on', 'global-hud-sfx');
        state.sfxBtn.addEventListener('click', function () { setSfxOn(!getSfxOn()); });
        state.root.appendChild(state.sfxBtn);
      }
      if (showVoice) {
        state.voiceBtn = makeButton('🗣 こえ', 'hud-btn on', 'global-hud-voice');
        state.voiceBtn.addEventListener('click', function () { setVoiceOn(!getVoiceOn()); });
        state.root.appendChild(state.voiceBtn);
      }
      document.body.appendChild(state.root);
    }

    if (showStar) {
      state.starPill = removeExisting('global-hud-star') || document.createElement('div');
      state.starPill.id = 'global-hud-star';
      state.starPill.className = 'hud-pill';
      document.body.appendChild(state.starPill);
    }

    state.inited = true;
    refreshButtons();
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
    getStarKey: getStarKey
  };

  window.TashizanHud = api;

  window.addEventListener('storage', function () {
    refreshButtons();
    if (typeof syncAudioControlButtons === 'function') syncAudioControlButtons();
  });
})();
