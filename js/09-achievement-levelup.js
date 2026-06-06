// 09-achievement-levelup.js
// ======================================================
// 忍者レベルアップ演出
// ======================================================

function _ninjaCreateEl(tag, cls, text) {
  var el = document.createElement(tag);
  if (cls) el.className = cls;
  if (typeof text === 'string') el.textContent = text;
  return el;
}

function _ninjaCreateNS(tag, cls) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  if (cls) el.setAttribute('class', cls);
  return el;
}

function _ninjaSetAttrs(el, attrs) {
  if (!el || !attrs) return el;
  Object.keys(attrs).forEach(function(k) {
    el.setAttribute(k, attrs[k]);
  });
  return el;
}

function _ninjaBuildSparkSvg() {
  var svg = _ninjaCreateNS('svg', 'ninja-levelup-sparks');
  _ninjaSetAttrs(svg, {
    viewBox: '0 0 320 320',
    width: '320',
    height: '320',
    fill: 'none',
    'aria-hidden': 'true'
  });

  var defs = _ninjaCreateNS('defs');
  var filter = _ninjaCreateNS('filter');
  _ninjaSetAttrs(filter, { id: 'ninjaLevelGlow', x: '-40%', y: '-40%', width: '180%', height: '180%' });
  var blur = _ninjaCreateNS('feGaussianBlur');
  _ninjaSetAttrs(blur, { stdDeviation: '5', result: 'blur' });
  var merge = _ninjaCreateNS('feMerge');
  merge.appendChild(_ninjaCreateNS('feMergeNode'));
  merge.appendChild(_ninjaCreateNS('feMergeNode'));
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  var cx = 160, cy = 160;
  function addOrbit(groupClass, count, radius, size, phase, speed, fill) {
    var g = _ninjaCreateNS('g', groupClass);
    _ninjaSetAttrs(g, {
      filter: 'url(#ninjaLevelGlow)',
      style: 'transform-box: fill-box; transform-origin: center;'
    });
    for (var i = 0; i < count; i++) {
      var ang = (Math.PI * 2 * i / count) + phase;
      var x = cx + Math.cos(ang) * radius;
      var y = cy + Math.sin(ang) * radius;
      var c = _ninjaCreateNS('circle', 'ninja-levelup-orb');
      _ninjaSetAttrs(c, {
        cx: x.toFixed(2),
        cy: y.toFixed(2),
        r: size,
        fill: fill
      });
      c.style.animationDuration = speed;
      c.style.animationDelay = (i * 0.08) + 's';
      g.appendChild(c);
    }
    svg.appendChild(g);
    return g;
  }

  addOrbit('ninja-levelup-orbit ninja-levelup-orbit-a', 7, 92, 8.5, 0.3, '1.8s', 'rgba(255,232,130,.92)');
  addOrbit('ninja-levelup-orbit ninja-levelup-orbit-b', 6, 62, 6.5, 1.05, '1.3s', 'rgba(120,238,255,.9)');
  addOrbit('ninja-levelup-orbit ninja-levelup-orbit-c', 5, 34, 5.5, 0.5, '1.0s', 'rgba(255,255,255,.95)');

  var ring = _ninjaCreateNS('circle', 'ninja-levelup-ring');
  _ninjaSetAttrs(ring, {
    cx: '160',
    cy: '160',
    r: '120',
    stroke: 'rgba(255,255,255,.16)',
    'stroke-width': '2'
  });
  svg.appendChild(ring);

  return svg;
}

function _ninjaGetStageIndexByTotal(totalUnlocked) {
  for (var i = 0; i < ACH_STAGES.length; i++) {
    if (totalUnlocked < ACH_STAGES[i].min) return Math.max(0, i - 1);
  }
  return ACH_STAGES.length - 1;
}

function showNinjaLevelUpEffect(beforeTotal, onDone) {
  if (typeof getUnlockedAchievementCount !== 'function' || typeof getAchStageByCount !== 'function') {
    if (typeof onDone === 'function') onDone();
    return;
  }

  var afterTotal = getUnlockedAchievementCount().totalOn;
  var beforeStage = getAchStageByCount(typeof beforeTotal === 'number' ? beforeTotal : afterTotal);
  var afterStage = getAchStageByCount(afterTotal);

  if (!afterStage || !beforeStage || afterStage.lv === beforeStage.lv) {
    if (typeof onDone === 'function') onDone();
    return;
  }

  var overlay = _ninjaCreateEl('div', 'ninja-levelup-overlay');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  var backdrop = _ninjaCreateEl('div', 'ninja-levelup-backdrop');
  var card = _ninjaCreateEl('div', 'ninja-levelup-card');
  var flash = _ninjaCreateEl('div', 'ninja-levelup-flash');
  card.appendChild(flash);

  var topText = _ninjaCreateEl('div', 'ninja-levelup-toptext', 'ほうせきのちからを きゅうしゅうして\nレベルがあがった！');
  card.appendChild(topText);

  var visual = _ninjaCreateEl('div', 'ninja-levelup-visual');
  var imgWrap = _ninjaCreateEl('div', 'ninja-levelup-imgwrap');
  var img = _ninjaCreateEl('img', 'ninja-levelup-img');
  img.src = beforeStage.img;
  img.alt = beforeStage.name;
  img.onerror = function(){ this.style.display = 'none'; };
  imgWrap.appendChild(img);
  visual.appendChild(imgWrap);
  visual.appendChild(_ninjaBuildSparkSvg());
  card.appendChild(visual);

  var copy = _ninjaCreateEl('div', 'ninja-levelup-copy');
  var lvLine = _ninjaCreateEl('div', 'ninja-levelup-level', afterStage.lv + ' ' + afterStage.name);
  var desc = _ninjaCreateEl('div', 'ninja-levelup-desc', afterStage.desc);
  copy.appendChild(lvLine);
  copy.appendChild(desc);
  card.appendChild(copy);

  var footer = _ninjaCreateEl('div', 'ninja-levelup-footer', 'つぎの しゅぎょうも がんばろう！');
  card.appendChild(footer);

  overlay.appendChild(backdrop);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  var closing = false;
  var timers = [];
  function schedule(fn, ms) {
    var id = setTimeout(fn, ms);
    timers.push(id);
    return id;
  }
  function clearTimers() {
    while (timers.length) clearTimeout(timers.pop());
  }
  function finish() {
    if (closing) return;
    closing = true;
    clearTimers();
    try { overlay.removeEventListener('pointerdown', onClose, true); } catch(e) {}
    try { backdrop.removeEventListener('pointerdown', onClose, true); } catch(e) {}
    try { card.removeEventListener('pointerdown', onClose, true); } catch(e) {}
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    if (typeof onDone === 'function') onDone();
  }
  function onClose(ev) {
    if (ev) {
      try { ev.preventDefault(); ev.stopPropagation(); } catch(e){}
    }
    finish();
  }

  overlay.addEventListener('pointerdown', onClose, true);
  backdrop.addEventListener('pointerdown', onClose, true);
  card.addEventListener('pointerdown', onClose, true);

  requestAnimationFrame(function() {
    overlay.classList.add('is-open');
    schedule(function(){ overlay.classList.add('is-flash'); }, 180);
    schedule(function(){ overlay.classList.add('is-absorb'); }, 950);
    schedule(function(){
      img.src = afterStage.img;
      img.alt = afterStage.name;
      overlay.classList.add('is-restored');
    }, 1450);
    schedule(function(){ overlay.classList.remove('is-flash'); }, 1820);
    schedule(function(){ finish(); }, 2750);
  });

  try {
    playAchievementTone([[0,523],[0.08,659],[0.16,784],[0.26,1047],[0.38,1319]],0.16,0.18);
  } catch (e) {}
}
