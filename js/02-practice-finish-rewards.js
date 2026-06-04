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
      newGems.push({ img: './gem_' + gemIdx + '.png', name: nn + 'をたす マスター' });
    }
  }

  var newBadge = null;
  if (sessMode === 'normal' && (curCourse === '20' || curCourse === 'all')) {
    newBadge = checkAndAwardBadge(curLevel, curCourse, sess.results);
  }

  return { gems: newGems, badge: newBadge };
}

function playFinishUnlockSequence(gems, badge) {
  console.log('[DBG] playFinishUnlockSequence', {
    gems: gems ? gems.length : '(none)',
    badge: !!badge,
    fxPerfect: (typeof getFx === 'function') ? getFx('fx_perfect') : '(no getFx)',
    hasShowPerfectEffect: typeof showPerfectEffect,
    hasShowGemUnlockEffect: typeof showGemUnlockEffect,
    hasShowBadgeUnlockEffect: typeof showBadgeUnlockEffect
  });
  function showChain(gems2, badge2) {
    if (getFx('fx_perfect')) {
      sndPerfect();
      setTimeout(function(){
        console.log('[DBG] before showPerfectEffect', {
          gems: gems2 ? gems2.length : '(none)',
          badge: !!badge2,
          hasShowPerfectEffect: typeof showPerfectEffect
        });
        showPerfectEffect(function(){
          console.log('[DBG] after showPerfectEffect', {
            gems: gems2 ? gems2.length : '(none)',
            badge: !!badge2,
            hasShowGemUnlockEffect: typeof showGemUnlockEffect,
            hasShowBadgeUnlockEffect: typeof showBadgeUnlockEffect
          });
          if (gems2.length > 0) {
            console.log('[DBG] call showGemUnlockEffect', { img: gems2[0].img, name: gems2[0].name });
            showGemUnlockEffect(gems2[0].img, gems2[0].name, function(){
              console.log('[DBG] gem effect done');
              if (badge2) {
                console.log('[DBG] call showBadgeUnlockEffect after gem');
                showBadgeUnlockEffect(badge2);
              }
            });
          } else if (badge2) {
            console.log('[DBG] call showBadgeUnlockEffect only');
            showBadgeUnlockEffect(badge2);
          }
        });
      }, 80);
    } else {
      sndGoodFinish();
      if (gems2.length > 0) {
        setTimeout(function(){
          console.log('[DBG] call showGemUnlockEffect (fx off)', { img: gems2[0].img, name: gems2[0].name });
          showGemUnlockEffect(gems2[0].img, gems2[0].name, function(){
            console.log('[DBG] gem effect done (fx off)');
            if (badge2) {
              console.log('[DBG] call showBadgeUnlockEffect after gem (fx off)');
              showBadgeUnlockEffect(badge2);
            }
          });
        }, 300);
      } else if (badge2) {
        setTimeout(function(){
          console.log('[DBG] call showBadgeUnlockEffect only (fx off)');
          showBadgeUnlockEffect(badge2);
        }, 300);
      }
    }
  }
  showChain(gems, badge);
}
