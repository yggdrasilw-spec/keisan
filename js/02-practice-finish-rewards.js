// 02-practice-finish-rewards.js
// ======================================================
// 結果画面の解放・報酬処理
// ======================================================

function collectFinishUnlockRewards(completed) {
  var beforeTotal = (typeof getUnlockedAchievementCount === 'function')
    ? getUnlockedAchievementCount().totalOn
    : 0;
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

function playFinishUnlockSequence(gems, badge, beforeTotal, onDone) {
  if (typeof beforeTotal === 'function') {
    onDone = beforeTotal;
    beforeTotal = null;
  }

  function finishMaybeLevelUp() {
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
    if (getFx('fx_perfect')) {
      sndPerfect();
      setTimeout(function(){
        showPerfectEffect(function(){
          if (gems2.length > 0) {
            showGemUnlockEffect(gems2[0].img, gems2[0].name, function(){
              if (badge2) showBadgeUnlockEffect(badge2, finishMaybeLevelUp);
              else finishMaybeLevelUp();
            });
          } else if (badge2) {
            showBadgeUnlockEffect(badge2, finishMaybeLevelUp);
          }
        });
      }, 80);
    } else {
      sndGoodFinish();
      if (gems2.length > 0) {
        setTimeout(function(){
          showGemUnlockEffect(gems2[0].img, gems2[0].name, function(){
            if (badge2) showBadgeUnlockEffect(badge2, finishMaybeLevelUp);
            else finishMaybeLevelUp();
          });
        }, 300);
      } else if (badge2) {
        setTimeout(function(){ showBadgeUnlockEffect(badge2, finishMaybeLevelUp); }, 300);
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
