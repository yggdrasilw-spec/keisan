// Keep the established activities and storage in a disposable same-origin view.
(function () {
  'use strict';
  var activities = {
    './dot-kazoe-finger.html?mode=dot': 'ドットをかぞえる',
    './dot-kazoe-finger.html?mode=finger': 'ゆびをかぞえる',
    './make-x-2.html': 'Xをつくろう',
    './suji_vision_training.html': '数字みつけ'
  };
  var frame = null, opener = null, loadingTimer = null;
  var section = document.createElement('section');
  section.id = 'kiso-activity'; section.className = 'sc';
  section.innerHTML = '<div class="page-head"><button type="button" class="bkbtn" id="kiso-close">← きそへ</button><span class="page-title" id="kiso-title"></span><strong data-hud-star></strong></div><div id="kiso-stage"><p id="kiso-loading" role="status">しゅぎょうを じゅんびしています…</p></div>';
  document.getElementById('app').appendChild(section);
  function close() {
    show('kiso-home');
    if (opener && opener.isConnected) opener.focus({preventScroll:true});
  }
  document.getElementById('kiso-close').addEventListener('click', close);
  window.disposeKisoActivity = function () {
    clearTimeout(loadingTimer);
    if (!frame) return;
    // Discard the browsing context, including all timers, audio and input handlers.
    try { frame.contentWindow.speechSynthesis.cancel(); } catch (e) {}
    frame.remove(); frame = null;
    if (window.TashizanHud) {
      TashizanHud.setSfxOn(TashizanHud.getSfxOn());
      TashizanHud.setVoiceOn(TashizanHud.getVoiceOn());
      TashizanHud.sync();
    }
  };
  window.openKisoActivity = function (value) {
    if (!Object.prototype.hasOwnProperty.call(activities, value)) return;
    disposeKisoActivity(); opener = document.activeElement;
    var status = document.getElementById('kiso-loading');
    status.hidden = false; status.textContent = 'しゅぎょうを じゅんびしています…';
    document.getElementById('kiso-title').textContent = activities[value];
    frame = document.createElement('iframe');
    frame.title = activities[value]; frame.id = 'kiso-frame';
    frame.src = value + (value.indexOf('?') >= 0 ? '&' : '?') + 'embedded=1';
    frame.addEventListener('load', function () {
      clearTimeout(loadingTimer); status.hidden = true;
      document.getElementById('kiso-close').focus({preventScroll:true});
    });
    document.getElementById('kiso-stage').appendChild(frame);
    show('kiso-activity');
    loadingTimer = setTimeout(function () { status.textContent = '読み込みに時間がかかっています。「きそへ」でもどって、もういちど開いてね。'; }, 10000);
  };
  window.addEventListener('message', function (event) {
    if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return;
    if (event.data && event.data.type === 'ninja-kiso-close') close();
  });
})();
