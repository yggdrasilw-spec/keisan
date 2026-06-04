// 09-achievement-collections.js
// ======================================================
// じっせきの 一覧表示（実績 / バッジ / タブ）
// ======================================================

var _achTabsBound = false;

function makeAchItem(ico, name, meta, unlocked, gemImg) {
  var div = document.createElement('div');
  div.className = 'ach-item ' + (unlocked ? 'unlocked' : 'locked');
  var icoDiv = document.createElement('div');
  icoDiv.className = 'ach-ico' + (gemImg && !unlocked ? ' locked-gem' : '');
  if (gemImg) {
    var img = document.createElement('img');
    img.src = gemImg;
    img.alt = name;
    img.onerror = function(){ this.style.display='none'; this.parentNode.textContent = unlocked ? ico : '🔒'; };
    if (!unlocked) { img.style.opacity='0.2'; img.style.filter='grayscale(1)'; }
    icoDiv.appendChild(img);
  } else {
    icoDiv.textContent = ico;
  }
  div.appendChild(icoDiv);
  var info = document.createElement('div');
  info.className = 'ach-info';
  info.innerHTML = '<div class="ach-name">' + name + '</div><div class="ach-meta">' + meta + '</div>';
  div.appendChild(info);
  var pill = document.createElement('div');
  pill.className = 'ach-pill ' + (unlocked ? 'unlocked' : 'locked');
  pill.textContent = unlocked ? '解除済み' : '未解除';
  div.appendChild(pill);
  return div;
}

function renderAchList() {
  var gemEl = document.getElementById('ach-group-gem');
  if (gemEl) {
    gemEl.innerHTML = '';
    for (var i = 0; i < ACH_GEMS.length; i++) {
      var gem = ACH_GEMS[i];
      var on = false;
      try { on = gem.check(); } catch (e) {}
      var title = gem.label.split('\n').join(' ');
      var meta = (gem.id === 'all_master')
        ? '18こ ぜんぶの ほうせきを てにいれた！'
        : gem.label.split('\n').join(' ').replace('マスター', '').replace(/（.*?）/g, '').trim() + ' をぜんぶマスター';
      var item = makeAchItem('💎', title, meta, on, gem.img);
      if (on && typeof showGemUnlockEffect === 'function') {
        item.style.cursor = 'pointer';
        item.title = 'タップで ひょうじ';
        (function(g) {
          item.addEventListener('click', function() {
            showGemUnlockEffect(g.img, g.unlockText || g.name, g.idx || 0, null);
          });
        })(gem);
      }
      gemEl.appendChild(item);
    }
  }

}

function achInitTabs() {
  if (_achTabsBound) return;
  _achTabsBound = true;
  var tabs = document.querySelectorAll('.ach-tab');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      var target = tab.dataset.tab;
      document.querySelectorAll('.ach-group').forEach(function(g) {
        g.style.display = g.dataset.tab === target ? '' : 'none';
      });
    });
  });
}

function renderAchievementCollections() {
  renderAchList();
  renderAchBadges();
}
