// 13-actions.js
// ======================================================
// DOMイベントの集約 / クリック経路の一本化
// ======================================================
(function () {
  'use strict';

  var ACTION_HANDLERS = window.APP_ACTION_HANDLERS || {};
  window.APP_ACTION_HANDLERS = ACTION_HANDLERS;

  function registerAppActions(map) {
    if (!map) return ACTION_HANDLERS;
    for (var key in map) {
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        ACTION_HANDLERS[key] = map[key];
      }
    }
    return ACTION_HANDLERS;
  }

  function callAction(action, value, el) {
    var handler = ACTION_HANDLERS[action];
    if (typeof handler === 'function') {
      return handler(value, el);
    }
    if (window && window.console && console.warn) console.warn('Unknown app action:', action, value, el);
  }

  function handleClick(evt) {
    var target = evt.target && evt.target.closest ? evt.target.closest('[data-action]') : null;
    if (!target) return;
    var action = target.getAttribute('data-action');
    if (!action) return;
    var value = target.getAttribute('data-value');
    callAction(action, value, target);
  }

  function initActionBindings() {
    if (window.__appActionBindingsReady) return;
    window.__appActionBindingsReady = true;
    document.addEventListener('click', handleClick, { passive: true });
  }

  window.registerAppActions = registerAppActions;
  window.callAppAction = callAction;
  window.callAction = callAction; // 旧名互換

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActionBindings, { once: true });
  } else {
    initActionBindings();
  }
})();
