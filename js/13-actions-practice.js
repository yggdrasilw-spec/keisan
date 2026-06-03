// 13-actions-practice.js
// ======================================================
// 練習 / 手書き / ヒント系アクション
// ======================================================
(function () {
  'use strict';

  registerAppActions({
    setAnsTab: function (value) {
      return typeof setAnsTab === 'function' && setAnsTab(value);
    },
    hwClear: function () {
      return typeof hwClear === 'function' && hwClear();
    },
    toggleHint: function () {
      return typeof toggleHint === 'function' && toggleHint();
    },
    hintNext: function () {
      return typeof hintNext === 'function' && hintNext();
    },
    hintReset: function () {
      return typeof hintReset === 'function' && hintReset();
    },
    kSelFilt: function (value) {
      return typeof kSelFilt === 'function' && kSelFilt(value);
    },
    kStart: function () {
      return typeof kStart === 'function' && kStart();
    },
    goKotsuR: function () {
      return typeof goKotsuR === 'function' && goKotsuR();
    },
    goKotsuSt: function () {
      return typeof goKotsuSt === 'function' && goKotsuSt();
    },
    endSess: function () {
      return typeof endSess === 'function' && endSess();
    }
  });
})();
