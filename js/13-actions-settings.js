// 13-actions-settings.js
// ======================================================
// 設定 / 保存 / 音声切替系アクション
// ======================================================
(function () {
  'use strict';

  registerAppActions({
    selRecCourse: function (value) {
      return typeof selRecCourse === 'function' && selRecCourse(value);
    },
    setAnswerMode: function (value) {
      return typeof setAnswerMode === 'function' && setAnswerMode(value);
    },
    resetData: function () {
      return typeof resetData === 'function' && resetData();
    },
    previewVoice: function () {
      return typeof previewVoice === 'function' && previewVoice();
    },
    savePraiseEdit: function () {
      return typeof savePraiseEdit === 'function' && savePraiseEdit();
    },
    resetPraiseEdit: function () {
      return typeof resetPraiseEdit === 'function' && resetPraiseEdit();
    },
    toggleSfx: function () {
      return typeof toggleSfx === 'function' && toggleSfx();
    },
    toggleVoice: function () {
      return typeof toggleVoice === 'function' && toggleVoice();
    },
    toggleFx: function (value) {
      return typeof toggleFx === 'function' && toggleFx(value);
    }
  });
})();
