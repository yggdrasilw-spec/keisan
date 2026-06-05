var _achTabsBound = false;
// 09-achievement-collections.js
// ======================================================
// じっせきの 一覧表示（実績 / バッジ / タブ）
// ======================================================

function getAchActiveTab() {
  var active = document.querySelector('.ach-tab.active');
  return active && active.dataset ? active.dataset.tab : 'gem';
}

function setAchTabView(target) {
  var next = target || 'gem';
  var groups = document.querySelectorAll('.ach-group');
  for (var i = 0; i < groups.length; i++) {
    var g = groups[i];
    g.style.display = (g.dataset && g.dataset.tab === next) ? '' : 'none';
  }

  var tabs = document.querySelectorAll('.ach-tab');
  for (var j = 0; j < tabs.length; j++) {
    var tab = tabs[j];
    if (tab.dataset && tab.dataset.tab === next) tab.classList.add('active');
    else tab.classList.remove('active');
  }
}

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

function makeGemCard(gem, on) {
  var item = document.createElement('div');
  item.className = 'ach-gem-card ' + (on ? 'unlocked' : 'locked');

  var icoDiv = document.createElement('div');
  icoDiv.className = 'ach-gem-card-ico' + (gem.img && !on ? ' locked-gem' : '');
  if (gem.img) {
    var img = document.createElement('img');
    img.src = gem.img;
    img.alt = gem.label;
    img.onerror = function(){ this.style.display='none'; this.parentNode.textContent = on ? '💎' : '🔒'; };
    if (!on) { img.style.opacity='0.2'; img.style.filter='grayscale(1)'; }
    icoDiv.appendChild(img);
  } else {
    icoDiv.textContent = '💎';
  }
  item.appendChild(icoDiv);

  var name = document.createElement('div');
  name.className = 'ach-gem-card-name';
  name.textContent = gem.label.replace(/\n/g, ' ');
  item.appendChild(name);

  var meta = document.createElement('div');
  meta.className = 'ach-gem-card-meta';
  if (gem.id === 'tourmaline') {
    meta.textContent = '18こ ぜんぶの ほうせきを てにいれた！';
  } else if (/（くりあがり）/.test(gem.label)) {
    meta.textContent = gem.label.replace(/\n/g, ' ').replace('マスター（くりあがり）', '').trim() + ' をぜんぶマスター（くりあがり）';
  } else {
    meta.textContent = gem.label.replace(/\n/g, ' ').replace('マスター', '').trim() + ' をぜんぶマスター';
  }
  item.appendChild(meta);

  var pill = document.createElement('div');
  pill.className = 'ach-gem-card-pill ' + (on ? 'unlocked' : 'locked');
  pill.textContent = on ? '解除済み' : '未解除';
  item.appendChild(pill);

  if (on && typeof showGemUnlockEffect === 'function' && typeof getGemUnlockTextByIndex === 'function') {
    item.style.cursor = 'pointer';
    item.title = 'タップで ひょうじ';
    item.addEventListener('click', function() {
      showGemUnlockEffect(gem.img, getGemUnlockTextByIndex(gem.idx || 0), null);
    });
  }
  return item;
}

function renderAchList() {
  var gemEl = document.getElementById('ach-group-gem');
  if (gemEl) {
    gemEl.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'ach-gem-grid';
    for (var i = 0; i < ACH_GEMS.length; i++) {
      var gem = ACH_GEMS[i];
      var on = false;
      try { on = gem.check(); } catch (e) {}
      grid.appendChild(makeGemCard(gem, on));
    }
    gemEl.appendChild(grid);
  }

  renderAchBadges();
}

function achInitTabs() {
  if (_achTabsBound) {
    setAchTabView(getAchActiveTab());
    return;
  }
  _achTabsBound = true;

  var tabsWrap = document.getElementById('ach-tabs');
  if (tabsWrap) {
    tabsWrap.addEventListener('click', function(evt) {
      var tab = evt.target && evt.target.closest ? evt.target.closest('.ach-tab') : null;
      if (!tab || !tab.dataset) return;
      setAchTabView(tab.dataset.tab);
    });
  } else {
    var tabs = document.querySelectorAll('.ach-tab');
    for (var i = 0; i < tabs.length; i++) {
      (function(tab) {
        tab.addEventListener('click', function() {
          if (tab && tab.dataset) setAchTabView(tab.dataset.tab);
        });
      })(tabs[i]);
    }
  }

  setAchTabView(getAchActiveTab());
}

function renderAchievementCollections() {
  renderAchList();
  achInitTabs();
}
