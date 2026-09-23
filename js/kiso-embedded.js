(function () {
  'use strict';
  if (window.parent === window || new URLSearchParams(location.search).get('embedded') !== '1') return;
  document.documentElement.classList.add('ninja-embedded');
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = './css/kiso-embedded.css';
  document.head.appendChild(css);
  // The host owns the exit; internal retry/settings buttons keep their behavior.
  document.addEventListener('click', function (event) {
    if (event.target.closest('#global-hud-back')) {
      event.preventDefault(); event.stopImmediatePropagation();
      window.parent.postMessage({type:'ninja-kiso-close'}, location.origin);
    }
  }, true);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') window.parent.postMessage({type:'ninja-kiso-close'}, location.origin);
  });
})();
