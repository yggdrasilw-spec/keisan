// 09-achievement-badges.js
// ======================================================
// じっせきの 制覇バッジ 表示
// ======================================================

function buildAchBadgeIconEl(badge, on) {
  var ico = document.createElement('div');
  ico.className = 'ach-badge-ico';
  var img = document.createElement('img');
  img.style.cssText = 'width:40px;height:40px;object-fit:contain';
  img.src = badge.img;
  img.alt = badge.name;
  img.onerror = function(){ this.style.display='none'; this.parentNode.textContent = on ? badge.ico : '🔒'; };
  if (!on) { img.style.opacity='0.2'; img.style.filter='grayscale(1)'; }
  ico.appendChild(img);
  return ico;
}

function buildAchBadgeItemEl(badge) {
  var on = !!badgeData[badge.id];
  var item = document.createElement('div');
  item.className = 'ach-badge-item ' + (on ? 'unlocked' : 'locked');
  if (on) {
    item.style.cursor = 'pointer';
    item.title = 'タップで ひょうじ';
    item.addEventListener('click', function() {
      if (typeof showBadgeUnlockEffect === 'function') {
        showBadgeUnlockEffect(badge, null);
      }
    });
  }
  item.appendChild(buildAchBadgeIconEl(badge, on));

  var name = document.createElement('div');
  name.className = 'ach-badge-name';
  name.textContent = badge.name.replace(/\n/g, ' ');
  item.appendChild(name);

  var cond = document.createElement('div');
  cond.className = 'ach-badge-cond';
  cond.textContent = on
    ? '🗓 ' + (badgeData[badge.id].date || '')
    : badge.cond.replace(/\n/g, ' ');
  item.appendChild(cond);

  return item;
}

function renderAchBadges() {
  var el = document.getElementById('ach-group-badge');
  if (!el) return;
  el.innerHTML = '';

  var grid = document.createElement('div');
  grid.className = 'ach-badge-grid';

  BADGES.forEach(function(badge) {
    grid.appendChild(buildAchBadgeItemEl(badge));
  });

  el.appendChild(grid);
}
