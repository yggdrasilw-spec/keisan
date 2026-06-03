// 13-actions-media.js
// ======================================================
// 音声素材 / 画像素材系アクション
// ======================================================
(function () {
  'use strict';

  registerAppActions({
    openPraiseAudioPicker: function (value) {
      return typeof openPraiseAudioPicker === 'function' && openPraiseAudioPicker(Number(value));
    },
    removePraiseAudio: function (value) {
      return typeof removePraiseAudio === 'function' && removePraiseAudio(Number(value));
    },
    playPraiseAudioPreview: function (value) {
      return typeof playPraiseAudioPreview === 'function' && playPraiseAudioPreview(Number(value));
    },
    openImgPicker: function (value) {
      return typeof openImgPicker === 'function' && openImgPicker(value);
    },
    resetImg: function (value) {
      return typeof resetImg === 'function' && resetImg(value);
    }
  });
})();
