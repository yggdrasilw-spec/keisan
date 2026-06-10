// 16-shop-debug.js
// ======================================================
// かいもの / デバッグモード / 追加報酬
// ======================================================
(function () {
  'use strict';

  var SHOP_KEY = APP_KEYS.SHOP;
  var DEBUG_UNLOCK_KEY = 'tashizan_v2_debug_unlocked';
  var DEBUG_AUTO_AWARD_KEY = 'tashizan_v2_debug_auto_award';
  var DEBUG_PASSWORD = '16801680';
  var HOLD_MS = 10000;
  var _origRenderAchievementCollections = typeof renderAchievementCollections === 'function' ? renderAchievementCollections : null;
  var _origCollectFinishUnlockRewards = typeof collectFinishUnlockRewards === 'function' ? collectFinishUnlockRewards : null;
  var _origRenderFinishOutcome = typeof renderFinishOutcome === 'function' ? renderFinishOutcome : null;

  var DEBUG_GEM_OVERRIDES_KEY = 'tashizan_v2_debug_gem_overrides';

  var SHOP_ITEMS = [
    { id: 'shuriken_black',   ico: '✸', name: 'くろ手裏剣',     price: 5,   desc: '基本の手裏剣。まずはこれから。' },
    { id: 'makibishi',        ico: '✹', name: 'まきびし',       price: 8,   desc: '追手の足止めに使う。逃走向き。' },
    { id: 'kunai',            ico: '🗡', name: '苦無',           price: 10,  desc: '掘る・はさむ・刺す、万能寄り。' },
    { id: 'takezutsu',        ico: '🎋', name: '竹筒',           price: 12,  desc: '小物や薬草の携帯に便利。' },
    { id: 'waraji',           ico: '👣', name: '草鞋',           price: 14,  desc: '素早い移動用の基本装備。' },
    { id: 'tenugui',          ico: '🧣', name: '手ぬぐい',       price: 15,  desc: '隠す・拭く・縛る、地味に便利。' },
    { id: 'shinobi_pouch',    ico: '🎒', name: '忍び袋',         price: 18,  desc: '道具をまとめて持ち歩ける。' },
    { id: 'hikigane',         ico: '🔥', name: '火打石',         price: 20,  desc: '火起こし用。野営・合図にも。' },
    { id: 'metsubushi',       ico: '💨', name: '目潰し粉',       price: 24,  desc: '相手の視界を奪う。短期決戦向き。' },
    { id: 'kemuridama',       ico: '💣', name: '煙玉',           price: 28,  desc: '視界を切って姿を消す定番。' },
    { id: 'kaginawa',         ico: '🪝', name: '鉤縄',           price: 32,  desc: '壁・塀・高所へ移動するための道具。' },
    { id: 'tabi',             ico: '🧦', name: '足袋',           price: 36,  desc: '静かな移動のための履物。' },
    { id: 'amigasa',          ico: '🎩', name: '編笠',           price: 40,  desc: '顔を隠して街に溶け込む。' },
    { id: 'shinobi_mask',     ico: '🥷', name: '忍び面',         price: 45,  desc: '正体を見せないための面。' },
    { id: 'kodachi',          ico: '⚔', name: '小太刀',         price: 50,  desc: '近接戦の軽量武器。' },
    { id: 'mitsuduka',        ico: '📜', name: '密書筒',         price: 56,  desc: '秘密の文書を守って運ぶ。' },
    { id: 'naruko',           ico: '🔔', name: '鳴子',           price: 62,  desc: '侵入者の接近を知らせる。' },
    { id: 'henso_set',        ico: '🎭', name: '変装一式',       price: 68,  desc: '身分をごまかして潜入する。' },
    { id: 'shikomizue',       ico: '🪄', name: '仕込み杖',       price: 75,  desc: '見た目を隠した携帯武器。' },
    { id: 'shinobigatana',    ico: '🗡', name: '忍び刀',         price: 82,  desc: '携帯性重視の短い刀。' },
    { id: 'kusarigama',       ico: '⛓', name: '鎖鎌',           price: 90,  desc: '間合いを取って戦う上級装備。' },
    { id: 'tekkoukagi',       ico: '🪤', name: '手甲鉤',         price: 98,  desc: '引っ掛ける・奪う・登るの三役。' },
    { id: 'kusari_katabira',  ico: '🛡', name: '鎖帷子',         price: 110, desc: '軽装ながら防御力の高い防具。' },
    { id: 'muneate',          ico: '🥋', name: '胸当て',         price: 120, desc: '飛び道具対策の防具。' },
    { id: 'mizugumo',         ico: '🌊', name: '水蜘蛛',         price: 135, desc: '水上・湿地の移動を助ける道具。' },
    { id: 'shinobibune',      ico: '🛶', name: '忍び舟',         price: 150, desc: '水路の移動や密かな移送に。' },
    { id: 'kagi_ladder',      ico: '🪜', name: '鉤梯子',         price: 165, desc: '高所攻略のための可搬梯子。' },
    { id: 'kemuridake',       ico: '🗼', name: '狼煙筒',         price: 180, desc: '合図・連絡・撹乱に使う。' },
    { id: 'denju',            ico: '📚', name: '忍術秘伝書',     price: 220, desc: '技能を体系的に学ぶための宝典。' },
    { id: 'bunsin',           ico: '👥', name: '影分身の巻物',   price: 260, desc: '完全にロマン枠の上位商品。' }
  ];

  function safeGetText(key, fallback) {
    try {
      var v = sessionStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  function safeSetText(key, value) {
    try { sessionStorage.setItem(key, String(value)); } catch (e) {}
  }

  function getShopData() {
    if (typeof shopData === 'object' && shopData) return shopData;
    shopData = storageLoadJSON(SHOP_KEY, {});
    return shopData;
  }

  function saveDebugGemOverrides() {
    try { sessionStorage.setItem(DEBUG_GEM_OVERRIDES_KEY, JSON.stringify(debugGemOverrides || {})); } catch (e) {}
  }

  var debugGemOverrides = (function () {
    try {
      var raw = sessionStorage.getItem(DEBUG_GEM_OVERRIDES_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  })();

  function getGemOverride(id) {
    if (!debugGemOverrides || !Object.prototype.hasOwnProperty.call(debugGemOverrides, id)) return null;
    return !!debugGemOverrides[id];
  }

  function setGemOverride(id, on) {
    if (!debugGemOverrides) debugGemOverrides = {};
    debugGemOverrides[id] = !!on;
    saveDebugGemOverrides();
  }

  function clearGemOverride(id) {
    if (!debugGemOverrides || !Object.prototype.hasOwnProperty.call(debugGemOverrides, id)) return;
    delete debugGemOverrides[id];
    saveDebugGemOverrides();
  }

  function hasGemOverride(id) {
    return !!(debugGemOverrides && Object.prototype.hasOwnProperty.call(debugGemOverrides, id));
  }

  function hasGemId(id) {
    return typeof id === 'string' && /^gem_/.test(id);
  }

  function wrapGemChecks() {
    if (!Array.isArray(ACH_GEMS)) return;
    ACH_GEMS.forEach(function (gem) {
      if (!gem || gem._origCheck) return;
      gem._origCheck = gem.check;
      gem.check = function () {
        var ov = getGemOverride(gem.id);
        if (ov !== null) return ov;
        try { return gem._origCheck ? gem._origCheck() : false; } catch (e) { return false; }
      };
    });
  }

  function saveShopData() {
    storageSaveJSON(SHOP_KEY, getShopData());
  }

  function hasShopItem(id) {
    var data = getShopData();
    return !!(data && data[id]);
  }

  function setShopItemOwned(id, owned) {
    var data = getShopData();
    if (owned) {
      data[id] = { date: new Date().toLocaleDateString('ja-JP') };
    } else {
      delete data[id];
    }
    saveShopData();
    return data;
  }

  function getStarCount() {
    if (window.TashizanHud && typeof TashizanHud.getStarCount === 'function') {
      try { return TashizanHud.getStarCount(); } catch (e) {}
    }
    try {
      var v = localStorage.getItem('ninja-stars-total');
      var n = parseInt(v, 10);
      return Number.isFinite(n) ? n : 0;
    } catch (e2) {
      return 0;
    }
  }

  function setStarCount(value, source) {
    if (window.TashizanHud && typeof TashizanHud.setStarCount === 'function') {
      try { return TashizanHud.setStarCount(value, source || 'debug'); } catch (e) {}
    }
    var next = Math.max(0, parseInt(value, 10) || 0);
    try { localStorage.setItem('ninja-stars-total', String(next)); } catch (e2) {}
    if (window.syncNinjaStarsUI) {
      try { syncNinjaStarsUI(next); } catch (e3) {}
    }
    return next;
  }

  function addStarCount(delta, source) {
    if (window.TashizanHud && typeof TashizanHud.addStarCount === 'function') {
      try { return TashizanHud.addStarCount(delta, source || 'debug'); } catch (e) {}
    }
    return setStarCount(getStarCount() + (parseInt(delta, 10) || 0), source);
  }

  function isDebugUnlocked() {
    return safeGetText(DEBUG_UNLOCK_KEY, '0') === '1';
  }

  function setDebugUnlocked(on) {
    safeSetText(DEBUG_UNLOCK_KEY, on ? '1' : '0');
    if (!on) hideDebugPanel();
  }

  function isDebugAutoAwardOn() {
    return safeGetText(DEBUG_AUTO_AWARD_KEY, '1') !== '0';
  }

  function setDebugAutoAward(on) {
    safeSetText(DEBUG_AUTO_AWARD_KEY, on ? '1' : '0');
    syncDebugPanel();
  }

  function showToast(msg) {
    var id = 'shop-debug-toast';
    var el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      el.style.cssText = [
        'position:fixed',
        'left:50%',
        'bottom:18px',
        'transform:translateX(-50%)',
        'z-index:10050',
        'padding:10px 14px',
        'border-radius:999px',
        'background:rgba(35,28,18,.92)',
        'color:#fff',
        'font-size:13px',
        'font-weight:800',
        'box-shadow:0 8px 24px rgba(0,0,0,.24)',
        'pointer-events:none',
        'max-width:min(92vw,520px)',
        'text-align:center',
        'line-height:1.3'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(el._tm);
    el._tm = setTimeout(function () {
      el.style.opacity = '0';
    }, 1800);
  }

  function ensureStyle() {
    if (document.getElementById('shop-debug-style')) return;
    var css = ''
      + '.ach-shop-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:12px;padding:12px 14px;border-radius:16px;background:linear-gradient(135deg,#FFF9E8,#F7F3FF);border:1.5px solid rgba(126,95,39,.14);}'
      + '.ach-shop-head .shop-title{font-size:15px;font-weight:900;color:#5a3a05;}'
      + '.ach-shop-head .shop-meta{font-size:12px;font-weight:800;color:#7b5c2e;text-align:right;}'
      + '.ach-shop-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;}'
      + '.shop-card{background:#fff;border:1.5px solid #eadfc6;border-radius:18px;padding:12px;box-shadow:0 4px 14px rgba(0,0,0,.06);display:flex;flex-direction:column;gap:8px;min-height:176px;}'
      + '.shop-card.owned{border-color:#9ad8a0;background:linear-gradient(180deg,#ffffff,#f3fff4);}'
      + '.shop-ico{width:48px;height:48px;display:flex;align-items:center;justify-content:center;border-radius:14px;background:linear-gradient(135deg,#fff0d4,#fff);font-size:28px;flex-shrink:0;}'
      + '.shop-name{font-size:15px;font-weight:900;color:#3a2a00;line-height:1.2;}'
      + '.shop-desc{font-size:11px;font-weight:700;color:#7d6a51;line-height:1.45;min-height:2.8em;}'
      + '.shop-price{font-size:13px;font-weight:900;color:#8a5b14;display:flex;justify-content:space-between;align-items:center;}'
      + '.shop-price small{font-size:11px;color:#9a7c52;font-weight:800;}'
      + '.shop-buy{border:none;border-radius:14px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;background:#f5a623;color:#2d2100;box-shadow:0 2px 0 rgba(120,80,0,.18);}'
      + '.shop-buy:disabled{background:#d8d8d8;color:#7a7a7a;cursor:not-allowed;box-shadow:none;opacity:.92;}'
      + '.shop-owned-tag{display:inline-flex;align-items:center;justify-content:center;padding:6px 10px;border-radius:999px;background:#dff4e2;color:#26633a;font-size:11px;font-weight:900;}'
      + '.shop-count-line{font-size:12px;font-weight:800;color:#6b4a18;margin-top:2px;}'
      + '.shop-panel-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;}'
      + '.dbg-chip,.dbg-btn{border:none;border-radius:12px;padding:8px 10px;font-size:12px;font-weight:900;cursor:pointer;box-shadow:0 2px 0 rgba(0,0,0,.08);}'
      + '.dbg-btn{background:#ece6ff;color:#3d2d7d;}'
      + '.dbg-chip.on{background:#dff4e2;color:#1f5f35;}'
      + '.dbg-chip.off{background:#f0f0f0;color:#6b7280;}'
      + '.dbg-overlay{position:fixed;inset:0;z-index:10040;display:none;align-items:center;justify-content:center;background:rgba(17,24,39,.55);padding:16px;}'
      + '.dbg-overlay.show{display:flex;}'
      + '.dbg-dialog{width:min(940px,94vw);max-height:min(86vh,920px);overflow:auto;background:#fff;border-radius:22px;box-shadow:0 28px 80px rgba(0,0,0,.35);padding:16px;border:2px solid rgba(140,108,50,.16);}'
      + '.dbg-dialog h3{margin:0 0 8px;font-size:18px;color:#3a2a00;}'
      + '.dbg-dialog p{margin:0;font-size:12px;color:#7b5c2e;font-weight:700;line-height:1.5;}'
      + '.dbg-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0;}'
      + '.dbg-row input{border:2px solid #e7d9bf;border-radius:12px;padding:8px 10px;font-size:14px;font-weight:800;min-width:120px;}'
      + '.dbg-section{margin-top:14px;padding-top:12px;border-top:1px solid #eee2c7;}'
      + '.dbg-section-title{font-size:13px;font-weight:900;color:#5a3a05;margin-bottom:8px;}'
      + '.dbg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;}'
      + '.dbg-mini{display:flex;justify-content:space-between;align-items:center;gap:8px;background:#faf7ef;border:1px solid #eadfc6;border-radius:14px;padding:8px 10px;font-size:12px;font-weight:800;color:#3a2a00;}'
      + '.dbg-mini button{margin-left:auto;border:none;border-radius:10px;padding:6px 8px;font-size:11px;font-weight:900;cursor:pointer;background:#efefef;color:#3a2a00;}'
      + '.dbg-close{background:#f5a623;color:#2d2100;}'
      + '.debug-launch-wrap{margin-top:18px;padding:14px 12px;border-radius:18px;background:#fff7e8;border:2px dashed #f0c66b;display:flex;align-items:center;gap:12px;justify-content:space-between;flex-wrap:wrap;}'
      + '.debug-shuriken{width:62px;height:62px;border:none;border-radius:18px;background:linear-gradient(135deg,#fff,#ffe8b6);color:#5a3a05;font-size:30px;font-weight:900;cursor:pointer;box-shadow:0 5px 14px rgba(0,0,0,.12);}'
      + '.debug-shuriken:active{transform:scale(.98);}'
      + '.debug-launch-text{flex:1;min-width:180px;font-size:12px;font-weight:800;color:#7b5c2e;line-height:1.45;}'
      + '.debug-hold-meter{height:8px;background:#eadfc6;border-radius:999px;overflow:hidden;margin-top:8px;flex-basis:100%;}'
      + '.debug-hold-meter > span{display:block;height:100%;width:0%;background:linear-gradient(90deg,#f5a623,#d88b0a);border-radius:999px;transition:width .08s linear;}'
      + '.debug-password-mask{display:none;position:fixed;inset:0;z-index:10060;background:rgba(0,0,0,.56);align-items:center;justify-content:center;padding:16px;}'
      + '.debug-password-mask.show{display:flex;}'
      + '.debug-password-card{width:min(420px,92vw);background:#fff;border-radius:20px;padding:16px;border:2px solid rgba(140,108,50,.16);box-shadow:0 24px 70px rgba(0,0,0,.32);}'
      + '.debug-password-card h4{margin:0 0 8px;font-size:18px;color:#3a2a00;}'
      + '.debug-password-card .tip{font-size:12px;color:#7b5c2e;font-weight:700;margin-bottom:12px;}'
      + '.debug-password-card input{width:100%;box-sizing:border-box;border:2px solid #e7d9bf;border-radius:12px;padding:10px 12px;font-size:18px;font-weight:900;letter-spacing:.12em;text-align:center;}'
      + '.debug-password-card .actions{display:flex;gap:8px;margin-top:12px;}'
      + '.debug-password-card .actions button{flex:1;border:none;border-radius:12px;padding:10px 12px;font-size:13px;font-weight:900;cursor:pointer;}'
      + '.debug-password-card .actions .ok{background:#f5a623;color:#2d2100;}'
      + '.debug-password-card .actions .cancel{background:#efefef;color:#3a2a00;}'
      + '.shop-empty{padding:18px;border-radius:16px;background:#fff; border:1.5px dashed #eadfc6;color:#7b5c2e;font-size:13px;font-weight:800;text-align:center;}';
    var style = document.createElement('style');
    style.id = 'shop-debug-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function ensureAchievementShopDom() {
    var tabs = document.getElementById('ach-tabs');
    var ougiTab = tabs ? tabs.querySelector('.ach-tab[data-tab="ougi"]') : null;
    if (tabs && !document.querySelector('.ach-tab[data-tab="shop"]')) {
      var btn = document.createElement('button');
      btn.className = 'ach-tab';
      btn.dataset.tab = 'shop';
      btn.textContent = '🛒 にんじゃどうぐ';
      if (ougiTab && ougiTab.parentNode === tabs) tabs.insertBefore(btn, ougiTab.nextSibling);
      else tabs.appendChild(btn);
    }

    var listWrap = document.querySelector('.ach-list-wrap');
    if (listWrap && !document.getElementById('ach-group-shop')) {
      var div = document.createElement('div');
      div.className = 'ach-group';
      div.dataset.tab = 'shop';
      div.id = 'ach-group-shop';
      div.style.display = 'none';
      var ref = document.getElementById('ach-group-ougi');
      if (ref && ref.parentNode === listWrap) {
        ref.parentNode.insertBefore(div, ref.nextSibling);
      } else {
        listWrap.appendChild(div);
      }
    }
  }

  function ensureDebugLauncherDom() {
    var adv = document.getElementById('advanced-settings');
    if (!adv || document.getElementById('debug-launch-wrap')) return;
    var wrap = document.createElement('div');
    wrap.id = 'debug-launch-wrap';
    wrap.className = 'debug-launch-wrap';
    wrap.innerHTML = ''
      + '<button type="button" id="debug-shuriken-btn" class="debug-shuriken" aria-label="デバッグモード">✸</button>'
      + '<div class="debug-launch-text">'
      + 'この手裏剣を10秒長押しするとデバッグモードに入れます。<br>'
      + '入室時だけパスワードを求めます。'
      + '<div class="debug-hold-meter" aria-hidden="true"><span id="debug-hold-bar"></span></div>'
      + '</div>';
    adv.appendChild(wrap);
    bindDebugLauncher();
  }

  function ensureDebugOverlays() {
    if (!document.getElementById('debug-password-mask')) {
      var m = document.createElement('div');
      m.id = 'debug-password-mask';
      m.className = 'debug-password-mask';
      m.innerHTML = ''
        + '<div class="debug-password-card">'
        + '<h4>デバッグモード</h4>'
        + '<div class="tip">パスワードを入力してください。</div>'
        + '<input id="debug-password-input" type="password" inputmode="numeric" autocomplete="off" maxlength="8" placeholder="16801680">'
        + '<div class="actions"><button type="button" class="cancel" id="debug-password-cancel">キャンセル</button><button type="button" class="ok" id="debug-password-ok">OK</button></div>'
        + '</div>';
      document.body.appendChild(m);
    }

    if (!document.getElementById('debug-panel-overlay')) {
      var o = document.createElement('div');
      o.id = 'debug-panel-overlay';
      o.className = 'dbg-overlay';
      o.innerHTML = ''
        + '<div class="dbg-dialog">'
        + '<h3>デバッグモード</h3>'
        + '<p>★の増減、実績のON/OFF、商店購入データの確認ができます。</p>'
        + '<div class="dbg-section">'
        + '  <div class="dbg-section-title">★ の調整</div>'
        + '  <div class="dbg-row" id="dbg-star-controls"></div>'
        + '  <div class="dbg-row">'
        + '    <input id="dbg-star-input" type="number" min="0" step="1" value="0">'
        + '    <button type="button" class="dbg-btn" id="dbg-star-set">この数にする</button>'
        + '    <span id="dbg-star-current" style="font-size:13px;font-weight:900;color:#7b5c2e;"></span>'
        + '  </div>'
        + '</div>'
        + '<div class="dbg-section">'
        + '  <div class="dbg-section-title">実績の自動付与</div>'
        + '  <div class="dbg-row" id="dbg-auto-award-row"></div>'
        + '</div>'
        + '<div class="dbg-section">'
        + '  <div class="dbg-section-title">実績を手で切り替え</div>'
        + '  <div class="dbg-row">'
        + '    <button type="button" class="dbg-btn" id="dbg-all-ach-on">全部ON</button>'
        + '    <button type="button" class="dbg-btn" id="dbg-all-ach-off">全部OFF</button>'
        + '  </div>'
        + '  <div class="dbg-grid" id="dbg-achievement-grid"></div>'
        + '</div>'
        + '<div class="dbg-section">'
        + '  <div class="dbg-section-title">商店の購入データ</div>'
        + '  <div class="dbg-row">'
        + '    <button type="button" class="dbg-btn" id="dbg-all-shop-on">全部購入済みにする</button>'
        + '    <button type="button" class="dbg-btn" id="dbg-all-shop-off">購入データを消す</button>'
        + '  </div>'
        + '  <div class="dbg-grid" id="dbg-shop-grid"></div>'
        + '</div>'
        + '<div class="dbg-row" style="justify-content:flex-end;margin-top:16px;">'
        + '  <button type="button" class="dbg-btn dbg-close" id="dbg-close-panel">閉じる</button>'
        + '</div>'
        + '</div>';
      document.body.appendChild(o);
    }
  }

  function setHoldMeter(pct) {
    var bar = document.getElementById('debug-hold-bar');
    if (bar) bar.style.width = Math.max(0, Math.min(100, pct)) + '%';
  }

  function bindDebugLauncher() {
    var btn = document.getElementById('debug-shuriken-btn');
    if (!btn || btn._bound) return;
    btn._bound = true;
    var intervalId = 0;
    var timeoutId = 0;
    var startAt = 0;

    function cancelHold() {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      intervalId = 0;
      timeoutId = 0;
      startAt = 0;
      setHoldMeter(0);
    }

    function beginHold(ev) {
      if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      if (intervalId || timeoutId) return;
      startAt = Date.now();
      setHoldMeter(1);
      intervalId = setInterval(function () {
        var pct = ((Date.now() - startAt) / HOLD_MS) * 100;
        setHoldMeter(pct);
      }, 80);
      timeoutId = setTimeout(function () {
        cancelHold();
        openDebugPasswordModal();
      }, HOLD_MS);
      btn._holdCancel = cancelHold;
    }

    function onUp() {
      cancelHold();
    }

    btn.addEventListener('pointerdown', beginHold);
    btn.addEventListener('touchstart', beginHold, { passive: false });
    btn.addEventListener('mousedown', beginHold);
    ['pointerup', 'pointercancel', 'touchend', 'touchcancel', 'mouseup', 'mouseleave', 'blur'].forEach(function (evtName) {
      btn.addEventListener(evtName, onUp);
    });
  }

  function openDebugPasswordModal() {
    ensureDebugOverlays();
    var mask = document.getElementById('debug-password-mask');
    var input = document.getElementById('debug-password-input');
    if (!mask || !input) return;
    mask.classList.add('show');
    input.value = '';
    setTimeout(function () {
      try { input.focus(); input.select(); } catch (e) {}
    }, 20);

    var ok = function () {
      var value = (input.value || '').trim();
      if (value === DEBUG_PASSWORD) {
        setDebugUnlocked(true);
        mask.classList.remove('show');
        showDebugPanel();
        showToast('デバッグモードに入りました');
      } else {
        input.value = '';
        input.focus();
        showToast('パスワードが違います');
      }
    };

    var cancel = function () {
      mask.classList.remove('show');
    };

    document.getElementById('debug-password-ok').onclick = ok;
    document.getElementById('debug-password-cancel').onclick = cancel;
    mask.onclick = function (ev) {
      if (ev.target === mask) cancel();
    };
    input.onkeydown = function (ev) {
      if (ev.key === 'Enter') ok();
      else if (ev.key === 'Escape') cancel();
    };
  }

  function showDebugPanel() {
    ensureDebugOverlays();
    var overlay = document.getElementById('debug-panel-overlay');
    if (!overlay) return;
    overlay.classList.add('show');
    renderDebugPanel();
  }

  function hideDebugPanel() {
    var overlay = document.getElementById('debug-panel-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  function updateBadgeRecord(id, on) {
    if (id.indexOf('gem:') === 0) {
      var gemId = id.slice(4);
      if (on) {
        if (!badgeData[gemId]) badgeData[gemId] = 1;
      } else {
        delete badgeData[gemId];
      }
      saveBadgeData();
      return;
    }
    if (on) {
      if (!badgeData[id]) badgeData[id] = { date: new Date().toLocaleDateString('ja-JP') };
    } else {
      delete badgeData[id];
    }
    saveBadgeData();
  }

  function setAllAchievements(on) {
    if (Array.isArray(ACH_GEMS)) {
      for (var i = 0; i < ACH_GEMS.length; i++) {
        var gem = ACH_GEMS[i];
        if (on) setGemOverride(gem.id, true);
        else setGemOverride(gem.id, false);
      }
    }
    if (Array.isArray(BADGES)) {
      for (var j = 0; j < BADGES.length; j++) {
        updateBadgeRecord(BADGES[j].id, !!on);
      }
    }
    refreshAfterDebugChange();
  }

  function setAllShop(on) {
    var data = getShopData();
    if (on) {
      SHOP_ITEMS.forEach(function (item) {
        data[item.id] = { date: new Date().toLocaleDateString('ja-JP') };
      });
    } else {
      shopData = {};
    }
    saveShopData();
    renderShopCollection();
    renderDebugPanel();
  }

  function renderDebugPanel() {
    var starCurrent = document.getElementById('dbg-star-current');
    var starInput = document.getElementById('dbg-star-input');
    if (starCurrent) starCurrent.textContent = '現在: ★×' + getStarCount();
    if (starInput) starInput.value = String(getStarCount());

    var autoRow = document.getElementById('dbg-auto-award-row');
    if (autoRow) {
      autoRow.innerHTML = '';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dbg-chip ' + (isDebugAutoAwardOn() ? 'on' : 'off');
      btn.textContent = isDebugAutoAwardOn() ? 'ON: 実績を自動付与' : 'OFF: 実績を自動付与';
      btn.onclick = function () {
        setDebugAutoAward(!isDebugAutoAwardOn());
        showToast('自動付与を ' + (isDebugAutoAwardOn() ? 'ON' : 'OFF') + ' にしました');
      };
      autoRow.appendChild(btn);
    }

    var controls = document.getElementById('dbg-star-controls');
    if (controls) {
      controls.innerHTML = '';
      [
        -100, -10, -1, 1, 10, 100
      ].forEach(function (delta) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dbg-btn';
        b.textContent = (delta > 0 ? '+' : '') + delta;
        b.onclick = function () {
          addStarCount(delta, 'debug');
          renderShopCollection();
          renderDebugPanel();
        };
        controls.appendChild(b);
      });
    }

    var starSet = document.getElementById('dbg-star-set');
    if (starSet && !starSet._bound) {
      starSet._bound = true;
      starSet.onclick = function () {
        var n = parseInt((document.getElementById('dbg-star-input') || {}).value, 10);
        if (!Number.isFinite(n)) n = 0;
        setStarCount(n, 'debug');
        renderShopCollection();
        renderDebugPanel();
      };
    }

    var closeBtn = document.getElementById('dbg-close-panel');
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.onclick = hideDebugPanel;
    }

    var allOn = document.getElementById('dbg-all-ach-on');
    var allOff = document.getElementById('dbg-all-ach-off');
    if (allOn && !allOn._bound) {
      allOn._bound = true;
      allOn.onclick = function () { setAllAchievements(true); };
    }
    if (allOff && !allOff._bound) {
      allOff._bound = true;
      allOff.onclick = function () { setAllAchievements(false); };
    }

    var allShopOn = document.getElementById('dbg-all-shop-on');
    var allShopOff = document.getElementById('dbg-all-shop-off');
    if (allShopOn && !allShopOn._bound) {
      allShopOn._bound = true;
      allShopOn.onclick = function () { setAllShop(true); renderDebugPanel(); };
    }
    if (allShopOff && !allShopOff._bound) {
      allShopOff._bound = true;
      allShopOff.onclick = function () { setAllShop(false); renderDebugPanel(); };
    }

    var achGrid = document.getElementById('dbg-achievement-grid');
    if (achGrid) {
      achGrid.innerHTML = '';
      var items = [];
      if (Array.isArray(ACH_GEMS)) {
        ACH_GEMS.forEach(function (gem) {
          var key = gem.id || '';
          var ov = getGemOverride(key);
          items.push({
            type: 'gem',
            key: key,
            label: gem.label || gem.id,
            on: ov === null ? (typeof gem.check === 'function' ? !!gem.check() : false) : ov
          });
        });
      }
      if (Array.isArray(BADGES)) {
        BADGES.forEach(function (badge) {
          items.push({
            type: 'badge',
            key: badge.id,
            label: badge.name ? badge.name.replace(/\n/g, ' ') : badge.id,
            on: !!badgeData[badge.id]
          });
        });
      }
      items.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'dbg-mini';
        row.textContent = item.type === 'gem' ? '💎 ' + item.label : '🏅 ' + item.label;
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = item.on ? 'ON' : 'OFF';
        b.className = item.on ? 'dbg-chip on' : 'dbg-chip off';
        b.onclick = function () {
          if (item.type === 'gem') {
            setGemOverride(item.key, !item.on);
          } else {
            updateBadgeRecord(item.key, !item.on);
          }
          refreshAfterDebugChange();
        };
        row.appendChild(b);
        achGrid.appendChild(row);
      });
    }

    var shopGrid = document.getElementById('dbg-shop-grid');
    if (shopGrid) {
      shopGrid.innerHTML = '';
      SHOP_ITEMS.forEach(function (item) {
        var row = document.createElement('div');
        row.className = 'dbg-mini';
        row.textContent = item.ico + ' ' + item.name + ' / ★' + item.price;
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = hasShopItem(item.id) ? '済' : '未';
        b.className = hasShopItem(item.id) ? 'dbg-chip on' : 'dbg-chip off';
        b.onclick = function () {
          setShopItemOwned(item.id, !hasShopItem(item.id));
          renderDebugPanel();
          renderShopCollection();
        };
        row.appendChild(b);
        shopGrid.appendChild(row);
      });
    }
  }

  function refreshAfterDebugChange() {
    saveBadgeData();
    if (typeof renderAchievement === 'function') {
      try { renderAchievement(); } catch (e) {}
    } else {
      if (typeof renderAchievementCollections === 'function') {
        try { renderAchievementCollections(); } catch (e2) {}
      }
      if (typeof renderAchievementOverview === 'function') {
        try { renderAchievementOverview(); } catch (e3) {}
      }
    }
    renderDebugPanel();
  }

  function renderShopCollection() {
    var el = document.getElementById('ach-group-shop');
    if (!el) return;
    el.innerHTML = '';

    var total = getStarCount();
    var ownedCount = 0;
    for (var i = 0; i < SHOP_ITEMS.length; i++) if (hasShopItem(SHOP_ITEMS[i].id)) ownedCount++;

    var head = document.createElement('div');
    head.className = 'ach-shop-head';
    head.innerHTML = ''
      + '<div><div class="shop-title">★ を つかって にんじゃどうぐを かう</div>'
      + '<div class="shop-count-line">購入済み ' + ownedCount + ' / ' + SHOP_ITEMS.length + '</div></div>'
      + '<div class="shop-meta">ためた★: ★×' + total + '<br>高い道具ほど強い</div>';
    el.appendChild(head);

    if (!SHOP_ITEMS.length) {
      var empty = document.createElement('div');
      empty.className = 'shop-empty';
      empty.textContent = 'まだ商品がありません。';
      el.appendChild(empty);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'ach-shop-grid';
    SHOP_ITEMS.forEach(function (item) {
      var owned = hasShopItem(item.id);
      var card = document.createElement('div');
      card.className = 'shop-card' + (owned ? ' owned' : '');
      var title = owned ? '購入済み' : ('★' + item.price + 'で かう');
      var afford = total >= item.price;
      card.innerHTML = ''
        + '<div class="shop-ico">' + item.ico + '</div>'
        + '<div class="shop-name">' + item.name + '</div>'
        + '<div class="shop-desc">' + item.desc + '</div>'
        + '<div class="shop-price"><span>' + title + '</span><small>' + (owned ? '所持中' : (afford ? '買える' : '★がたりない')) + '</small></div>';
      if (owned) {
        var tag = document.createElement('div');
        tag.className = 'shop-owned-tag';
        tag.textContent = '購入済み';
        card.appendChild(tag);
      } else {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'shop-buy';
        btn.textContent = '★' + item.price + ' で かう';
        btn.disabled = !afford;
        btn.onclick = function () {
          purchaseShopItem(item.id);
        };
        card.appendChild(btn);
      }
      grid.appendChild(card);
    });
    el.appendChild(grid);
  }

  function purchaseShopItem(id) {
    var item = null;
    for (var i = 0; i < SHOP_ITEMS.length; i++) {
      if (SHOP_ITEMS[i].id === id) { item = SHOP_ITEMS[i]; break; }
    }
    if (!item) return;
    if (hasShopItem(id)) {
      showToast('購入済みです');
      return;
    }
    var total = getStarCount();
    if (total < item.price) {
      showToast('★が足りません');
      return;
    }
    setStarCount(total - item.price, 'shop');
    setShopItemOwned(id, true);
    showToast(item.name + ' を購入しました');
    renderShopCollection();
    renderDebugPanel();
  }

  function calcNormalStarReward(summary) {
    if (!summary || !summary.tot) return 0;
    var base = Math.max(1, Math.ceil(summary.tot / 6));
    var courseBonus = 0;
    if (curCourse === '20') courseBonus = 6;
    else if (curCourse === 'all') courseBonus = 12;
    else courseBonus = 2;

    var accBonus = 0;
    if (summary.acc === 100) accBonus = 5;
    else if (summary.acc >= 90) accBonus = 3;
    else if (summary.acc >= 70) accBonus = 1;

    var sizeBonus = 0;
    if (summary.tot >= 20) sizeBonus = 2;
    if (summary.tot >= 40) sizeBonus = 5;

    return base + courseBonus + accBonus + sizeBonus;
  }

  function grantNormalStars(summary, completed) {
    if (sessMode !== 'normal') return 0;
    if (!summary || !summary.tot) return 0;
    if (sess && sess._starsAwarded) return 0;
    var reward = calcNormalStarReward(summary);
    if (reward <= 0) return 0;
    if (sess) sess._starsAwarded = true;
    addStarCount(reward, 'practice');
    renderShopCollection();
    syncDebugPanel();
    showToast('★' + reward + ' ふえました');
    return reward;
  }

  function maybeAwardNormalStars(summary, completed) {
    try {
      return grantNormalStars(summary, completed);
    } catch (e) {
      console.error('[shop-debug] star reward failed', e);
      return 0;
    }
  }

  function isGemBadgeId(id) {
    return typeof id === 'string' && /^gem_(no|carry)_/.test(id);
  }

  function getGemKeyFromBadgeId(id) {
    return id.replace(/^gem_/, '');
  }

  function updateAchievementToggle(id, on) {
    if (isGemBadgeId(id)) {
      if (on) badgeData[id] = 1;
      else delete badgeData[id];
      saveBadgeData();
      return;
    }
    if (on) badgeData[id] = { date: new Date().toLocaleDateString('ja-JP') };
    else delete badgeData[id];
    saveBadgeData();
  }

  function wrapFinishHooks() {
    if (typeof collectFinishUnlockRewards === 'function') {
      window.collectFinishUnlockRewards = function (completed) {
        if (!isDebugAutoAwardOn()) {
          var liveTotal = (typeof getUnlockedAchievementCount === 'function')
            ? getUnlockedAchievementCount().totalOn
            : 0;
          var beforeTotal = (sess && typeof sess.startAchievementCount === 'number')
            ? sess.startAchievementCount
            : liveTotal;
          return { gems: [], badge: null, beforeTotal: beforeTotal };
        }
        return _origCollectFinishUnlockRewards ? _origCollectFinishUnlockRewards(completed) : { gems: [], badge: null, beforeTotal: null };
      };
    }

    if (typeof renderFinishOutcome === 'function') {
      window.renderFinishOutcome = function (summary, completed) {
        var ret = _origRenderFinishOutcome ? _origRenderFinishOutcome(summary, completed) : undefined;
        maybeAwardNormalStars(summary, completed);
        return ret;
      };
    }
  }

  function wrapAchievementRender() {
    if (typeof renderAchievementCollections === 'function') {
      window.renderAchievementCollections = function () {
        ensureAchievementShopDom();
        var ret = _origRenderAchievementCollections ? _origRenderAchievementCollections() : undefined;
        renderShopCollection();
        return ret;
      };
    }
  }

  function init() {
    ensureStyle();
    wrapGemChecks();
    ensureAchievementShopDom();
    ensureDebugLauncherDom();
    ensureDebugOverlays();
    wrapAchievementRender();
    wrapFinishHooks();

    if (isDebugUnlocked()) {
      showDebugPanel();
    }

    if (typeof renderShopCollection === 'function') {
      renderShopCollection();
    }
  }

  function syncDebugPanel() {
    if (document.getElementById('debug-panel-overlay') && document.getElementById('debug-panel-overlay').classList.contains('show')) {
      renderDebugPanel();
    }
  }

  window.saveShopData = saveShopData;
  window.getShopData = getShopData;
  window.hasShopItem = hasShopItem;
  window.purchaseShopItem = purchaseShopItem;
  window.renderShopCollection = renderShopCollection;
  window.showDebugPanel = showDebugPanel;
  window.hideDebugPanel = hideDebugPanel;
  window.renderDebugPanel = renderDebugPanel;
  window.isDebugAutoAwardOn = isDebugAutoAwardOn;
  window.setDebugAutoAward = setDebugAutoAward;
  window.setDebugUnlocked = setDebugUnlocked;
  window.getStarCountDebug = getStarCount;
  window.addStarCountDebug = addStarCount;
  window.setStarCountDebug = setStarCount;

  document.addEventListener('DOMContentLoaded', init, { once: true });

})();
