// 13-actions-navigation.js
// ======================================================
// 画面遷移系アクション
// ======================================================
(function () {
  'use strict';

  function toBool(v) {
    return v === true || v === 'true' || v === 1 || v === '1';
  }

  registerAppActions({
    show: function (value) {
      return typeof show === 'function' && show(value);
    },
    showKotsuHome: function () {
      if (typeof show === 'function') show('kotsu-home');
      if (typeof renNumGrid === 'function') renNumGrid();
    },
    goLevel: function (value) {
      return typeof goLevel === 'function' && goLevel(value);
    },
    startCourse: function (value) {
      return typeof startCourse === 'function' && startCourse(value);
    },
    goKotsuFromCourse: function () {
      return typeof goKotsuFromCourse === 'function' && goKotsuFromCourse();
    },
    showKisoHome: function () {
      if (typeof show === 'function') show('kiso-home');
    },
    launchKisoGame: function (value) {
      if (!value) return;
      if (typeof window !== 'undefined') {
        window.location.href = value;
      }
    },
    startEndMode: function (value) {
      return typeof startEndMode === 'function' && startEndMode(value);
    },
    closeEndContentLock: function () {
      return typeof closeEndContentLock === 'function' && closeEndContentLock();
    },
    showKotsuSub: function (value) {
      return typeof showKotsuSub === 'function' && showKotsuSub(Number(value));
    },
    closeAskGanbare: function (value) {
      return typeof closeAskGanbare === 'function' && closeAskGanbare(toBool(value));
    },
    closeAllMasterPopup: function () {
      return typeof closeAllMasterPopup === 'function' && closeAllMasterPopup();
    }
  });
})();
