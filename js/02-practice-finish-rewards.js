// 02-practice-finish-rewards.js
// ======================================================
// 結果画面の解放・報酬処理
// ======================================================

function collectFinishUnlockRewards(completed) {
  var liveTotal = (typeof getUnlockedAchievementCount === 'function')
    ? getUnlockedAchievementCount().totalOn
    : 0;
  var beforeTotal = (sess && typeof sess.startAchievementCount === 'number')
    ? sess.startAchievementCount
    : liveTotal;
  console.log('[DBG] collectFinishUnlockRewards', {
    completed: completed,
    sessMode: sessMode,
    curLevel: curLevel,
    curCourse: curCourse,
    sessStartAchievementCount: sess && sess.startAchievementCount,
    liveTotalOn: liveTotal,
    beforeTotal: beforeTotal
  });
  var newGems = [];
  if (sessMode === 'kotsu') {
    var nn = kSt.num;
    var mode = kSt.mode === 'no' ? 'no' : 'carry';
    var gemId = mode === 'no' ? ('no_' + nn) : ('carry_' + nn);
    var gem = (typeof ACH_GEMS !== 'undefined' && ACH_GEMS && ACH_GEMS.find)
      ? ACH_GEMS.find(function(g){ return g.id === gemId; })
      : null;
    var ps = mode === 'no' ? buildKP_for_no(nn) : buildKP_for_carry(nn);
    var allMaster = ps.length > 0 && ps.every(function(p){
      var key = (mode === 'no' ? 'n' : 'k') + nn + ':' + p.a + '+' + p.b;
      return getSt(kD[key]) === 'master';
    });
    if (allMaster && !badgeData['gem_' + mode + '_' + nn] && gem) {
      badgeData['gem_' + mode + '_' + nn] = 1;
      saveBadgeData();
      newGems.push({
        img: gem.img,
        name: gem.unlockText || getGemUnlockTextByIndex(gem.idx || 0)
      });
    }
  }

  var newBadge = null;
  if (sessMode === 'normal' && (curCourse === '20' || curCourse === 'all')) {
    newBadge = checkAndAwardBadge(curLevel, curCourse, sess.results);
  }
  if (sessMode === 'shinsoku' && completed !== false) {
    var shinsokuBadgeId = (typeof isShinsokuEvolved === 'function' && isShinsokuEvolved())
      ? (curLevel + '_cho_shinsoku')
      : (curLevel + '_shinsoku');
    newBadge = awardBadgeById(shinsokuBadgeId);
  }

  return { gems: newGems, badge: newBadge, beforeTotal: beforeTotal };
}

function playFinishUnlockSequence(gems, badge, beforeTotal, onDone, options) {
  if (typeof beforeTotal === 'function') {
    options = onDone;
    onDone = beforeTotal;
    beforeTotal = null;
  }

  options = options || {};
  var skipPerfectEffect = !!options.skipPerfectEffect;

  function finishMaybeLevelUp() {
    console.log('[DBG] playFinishUnlockSequence.finishMaybeLevelUp', {
      gems: gems && gems.length ? gems.length : 0,
      hasBadge: !!badge,
      beforeTotal: beforeTotal
    });
    if (typeof showNinjaLevelUpEffect === 'function' && beforeTotal !== null && beforeTotal !== undefined) {
      setTimeout(function() {
        if (typeof renderAchievementOverview === 'function') {
          try { renderAchievementOverview(); } catch (e) {}
        }
        showNinjaLevelUpEffect(beforeTotal, onDone);
      }, 80);
    } else if (typeof onDone === 'function') {
      onDone();
    }
  }

  function showChain(gems2, badge2) {
    function continueChain() {
      if (gems2.length > 0) {
        showGemUnlockEffect(gems2[0].img, gems2[0].name, function(){
          if (badge2) showBadgeUnlockEffect(badge2, finishMaybeLevelUp);
          else finishMaybeLevelUp();
        });
      } else if (badge2) {
        showBadgeUnlockEffect(badge2, finishMaybeLevelUp);
      } else {
        finishMaybeLevelUp();
      }
    }

    if (skipPerfectEffect) {
      continueChain();
    } else if (getFx('fx_perfect')) {
      sndPerfect();
      setTimeout(function(){
        showPerfectEffect(continueChain);
      }, 80);
    } else {
      sndGoodFinish();
      if (gems2.length > 0 || badge2) {
        setTimeout(continueChain, 300);
      } else {
        finishMaybeLevelUp();
      }
    }
  }
  if (!gems || !gems.length) {
    if (badge) {
      showBadgeUnlockEffect(badge, finishMaybeLevelUp);
      return;
    }
    finishMaybeLevelUp();
    return;
  }
  showChain(gems, badge);
}
