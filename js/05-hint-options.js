// Choose which teaching hints are available. The no-carry dot board is static.
(function () {
  'use strict';
  var key = 'tashizan_ninja_hint_options';
  var defaults = {dots:true, ten:true, five:true, sakura:true};
  var enabled = Object.assign({}, defaults);
  try {
    var saved = JSON.parse(localStorage.getItem(key));
    if (saved && typeof saved === 'object') Object.keys(defaults).forEach(function (name) {
      if (typeof saved[name] === 'boolean') enabled[name] = saved[name];
    });
  } catch (e) { /* Keep defaults if stored data is invalid. */ }

  var area = document.getElementById('hint-area');
  var methods = document.getElementById('hint-methods');
  var board = document.getElementById('hint-board');
  var msg = document.getElementById('hint-msg');
  var next = document.querySelector('[data-action="hintNext"]');
  var reset = document.querySelector('[data-action="hintReset"]');
  var originalSet = hintSetProblem, originalToggle = toggleHint;
  var originalDraw = hintDraw, originalNext = hintNext, originalReset = hintReset;
  var originalAnimate = hintAnimate;
  function noCarry() { return hintP && hintP.a + hintP.b <= 10; }
  function available() {
    if (!hintP) return [];
    if (noCarry()) return enabled.dots ? ['dots'] : [];
    var choices = [];
    if (enabled.ten) choices.push('ten');
    if (enabled.five && hintP.a >= 5 && hintP.b >= 5) choices.push('five');
    if (enabled.sakura) choices.push('sakura');
    return choices;
  }
  function sync() {
    var choices = available();
    area.style.display = choices.length ? 'block' : 'none';
    ['ten','five','sakura'].forEach(function (name) {
      document.getElementById('hint-' + name).hidden = choices.indexOf(name) < 0;
    });
    methods.hidden = noCarry() || choices.length < 2;
    next.hidden = noCarry();
    reset.hidden = noCarry();
  }
  function dotBoard() {
    if (!hintP) return;
    board.innerHTML = '';
    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 185');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', hintP.a + 'この青いドットと' + hintP.b + 'この赤いドット');
    svg.style.cssText = 'display:block;width:100%;height:100%';
    [hintP.a, hintP.b].forEach(function (count, side) {
      var label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', side ? '294' : '106');
      label.setAttribute('y', '36');
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '21');
      label.setAttribute('font-weight', 'bold');
      label.setAttribute('fill', side ? '#af3030' : '#176697');
      label.textContent = count;
      svg.appendChild(label);
      var frame = document.createElementNS(svgNS, 'rect');
      frame.setAttribute('x', side ? '210' : '22');
      frame.setAttribute('y', '52');
      frame.setAttribute('width', '168');
      frame.setAttribute('height', '102');
      frame.setAttribute('rx', '12');
      frame.setAttribute('fill', side ? '#fff3f1' : '#eef8ff');
      frame.setAttribute('stroke', side ? '#dcaaa4' : '#a7cce5');
      svg.appendChild(frame);
      for (var i = 0; i < count; i++) {
        var dot = document.createElementNS(svgNS, 'circle');
        dot.setAttribute('cx', (side ? 230 : 42) + (i % 5) * 29);
        dot.setAttribute('cy', 79 + Math.floor(i / 5) * 46);
        dot.setAttribute('r', '10');
        dot.setAttribute('fill', side ? '#e7504f' : '#258bd7');
        svg.appendChild(dot);
      }
    });
    board.appendChild(svg);
    msg.textContent = 'あお と あか の ドットを かぞえてみよう。';
  }
  hintDraw = function () { if (noCarry()) dotBoard(); else originalDraw(); sync(); };
  hintAnimate = function () { if (noCarry()) return; originalAnimate(); };
  hintNext = function () { if (noCarry()) return; originalNext(); };
  hintReset = function () { if (noCarry()) { dotBoard(); return; } originalReset(); };
  hintSetProblem = function (p) { originalSet(p); sync(); };
  toggleHint = function () {
    if (!available().length) return;
    originalToggle();
    if (hintVisible && !noCarry()) {
      var first = available()[0];
      if (first !== 'ten') document.getElementById('hint-' + first).click();
    }
    sync();
  };
  document.querySelectorAll('[data-hint-setting]').forEach(function (input) {
    input.checked = enabled[input.dataset.hintSetting];
    input.addEventListener('change', function () {
      enabled[input.dataset.hintSetting] = input.checked;
      try { localStorage.setItem(key, JSON.stringify(enabled)); } catch (e) { /* In-memory setting still works. */ }
      if (hintP) {
        if (hintVisible) originalToggle();
        hintSetProblem(hintP);
      }
    });
  });
  ['ten','five','sakura'].forEach(function (name) {
    document.getElementById('hint-' + name).addEventListener('click', function (event) {
      if (available().indexOf(name) < 0) { event.stopImmediatePropagation(); event.preventDefault(); }
    }, true);
  });
  sync();
})();
