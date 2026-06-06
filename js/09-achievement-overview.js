// 09-achievement-overview.js
// ======================================================
// じっせきの 概要表示（宝石 / アバター / 進捗）
// ======================================================

function renderAchGems() {
  var el = document.getElementById('ach-gems');
  if (!el) return;
  var unlockedCount = 0;
  var h = '';
  for (var i = 0; i < ACH_GEMS.length; i++) {
    var gem = ACH_GEMS[i];
    var on  = false;
    try { on = gem.check(); } catch(e) {}
    if (on) unlockedCount++;
    h += '<div class="ach-gem ' + (on ? 'unlocked' : 'locked') + '" title="' + gem.label.replace(/\n/g,' ') + '">'
      + (on ? '<img src="' + gem.img + '" alt="' + gem.label + '" onerror="this.style.display=&#39;none&#39;">'
            : '')
      + '</div>';
  }
  el.innerHTML = h;
  return unlockedCount;
}

function getAchStageByCount(totalUnlocked) {
  var stage = ACH_STAGES[0];
  for (var i = ACH_STAGES.length - 1; i >= 0; i--) {
    if (totalUnlocked >= ACH_STAGES[i].min) { stage = ACH_STAGES[i]; break; }
  }
  return stage;
}

function getAchNextStageByCount(totalUnlocked) {
  for (var i = 0; i < ACH_STAGES.length; i++) {
    if (ACH_STAGES[i].min > totalUnlocked) return ACH_STAGES[i];
  }
  return null;
}



function getAchUnlockedCountSummary(gemUnlocked) {
  var badgeOn = getUnlockedBadgeCount();
  return {
    totalOn: typeof gemUnlocked === 'number' ? gemUnlocked + badgeOn : getUnlockedAchievementCount().totalOn,
    totalAll: ACH_GEMS.length + BADGES.length
  };
}

function updateAchAvatarFrame(stage) {
  var img = document.getElementById('ach-avatar-img');
  if (img) {
    img.style.display = '';
    img.src = stage.img;
  }
  var css = document.getElementById('ach-avatar-css');
  if (css && (!img || img.style.display==='none')) css.textContent = '🥷';
  else if (css) css.textContent = '';

  var halo = document.querySelector('.ach-avatar-halo');
  if (halo) halo.style.background = 'radial-gradient(circle, ' + stage.halo + ' 0%, transparent 65%)';

  var badge = document.getElementById('ach-rank-badge');
  if (badge) badge.textContent = stage.lv + ' ' + stage.name;
  var name = document.getElementById('ach-rank-name');
  if (name) name.textContent = stage.name;
  var desc = document.getElementById('ach-rank-desc');
  if (desc) desc.textContent = stage.desc;
}

function updateAchProgressFrame(totalUnlocked) {
  var nextStage = getAchNextStageByCount(totalUnlocked);
  var pctEl  = document.getElementById('ach-progress-pct');
  var barEl  = document.getElementById('ach-progress-bar');
  var txtEl  = document.getElementById('ach-progress-text');
  var footer = document.getElementById('ach-footer-next');

  if (!nextStage) {
    if (pctEl) pctEl.textContent = '100%';
    if (barEl) barEl.style.width = '100%';
    if (txtEl) txtEl.textContent = '🎉 さいこうランク！';
    if (footer) footer.textContent = '🏆 すべての 宝石と実績 を てにいれた！';
    return;
  }

  var pct = Math.round(totalUnlocked / nextStage.min * 100);
  if (pctEl) pctEl.textContent = pct + '%';
  if (barEl) barEl.style.width = pct + '%';
  if (txtEl) txtEl.textContent = 'つぎのランクまで';
  if (footer) footer.textContent = 'あと ' + (nextStage.min - totalUnlocked) + ' こ じっせきを あつめると「' + nextStage.name + '」に しんか！';
}

function updateAchCountFrame(gemUnlocked) {
  var cnt = getAchUnlockedCountSummary(gemUnlocked);
  var el = document.getElementById('ach-count');
  if (el) el.textContent = '解除 ' + cnt.totalOn + ' / ' + cnt.totalAll;
}

function renderAchAvatar(gemUnlocked) {
  var cnt = getAchUnlockedCountSummary(gemUnlocked);
  var stage = getAchStageByCount(cnt.totalOn);
  updateAchAvatarFrame(stage);
  updateAchProgressFrame(cnt.totalOn);
  updateAchCountFrame(gemUnlocked);
}

function renderAchievementOverview() {
  var gemUnlocked = renderAchGems();
  renderAchAvatar(gemUnlocked);
  return gemUnlocked;
}
