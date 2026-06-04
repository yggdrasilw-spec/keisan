// 02-practice-finish-rewards.js
// ======================================================
// 結果画面の解放・報酬処理
// ======================================================

function collectFinishUnlockRewards() {
  var newGems = [];
  if (sessMode === 'kotsu') {
    var nn = kSt.num;
    var mode = kSt.mode === 'no' ? 'no' : 'carry';
    var gemIdx = mode === 'no' ? nn : nn + 9;
    var ps = mode === 'no' ? buildKP_for_no(nn) : buildKP_for_carry(nn);
    var allMaster = ps.length > 0 && ps.every(function(p){
      var key = (mode === 'no' ? 'n' : 'k') + nn + ':' + p.a + '+' + p.b;
      return getSt(kD[key]) === 'master';
    });
    if (allMaster && !badgeData['gem_' + mode + '_' + nn]) {
      badgeData['gem_' + mode + '_' + nn] = 1;
      saveBadgeData();
      newGems.push({ img: './img/gem_' + gemIdx + '.png', idx: gemIdx, unlockText: nn + 'をたすマスター' });
    }
  }

  var newBadge = null;
  if (sessMode === 'normal' && (curCourse === '20' || curCourse === 'all')) {
    newBadge = checkAndAwardBadge(curLevel, curCourse, sess.results);
  }

  return { gems: newGems, badge: newBadge };
}

function playFinishUnlockSequence(gems, badge) {
  function showChain(gems2, badge2) {
    if (getFx('fx_perfect')) {
      sndPerfect();
      setTimeout(function(){
        showPerfectEffect(function(){
          if (gems2.length > 0) {
            showGemUnlockEffect(gems2[0].img, gems2[0].unlockText, gems2[0].idx, function(){
              if (badge2) showBadgeUnlockEffect(badge2);
            });
          } else if (badge2) {
            showBadgeUnlockEffect(badge2);
          }
        });
      }, 80);
    } else {
      sndGoodFinish();
      if (gems2.length > 0) {
        setTimeout(function(){
          showGemUnlockEffect(gems2[0].img, gems2[0].unlockText, gems2[0].idx, function(){
            if (badge2) showBadgeUnlockEffect(badge2);
          });
        }, 300);
      } else if (badge2) {
        setTimeout(function(){ showBadgeUnlockEffect(badge2); }, 300);
      }
    }
  }
  showChain(gems, badge);
}
