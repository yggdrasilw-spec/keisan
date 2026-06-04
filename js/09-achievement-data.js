// 09-achievement-data.js
// ======================================================
// じっせき（実績）データ
// ======================================================

// ── アバター段階定義（PNG: img/ninja_1.png〜img/ninja_4.png）──
var ACH_STAGES = [
  { min:0,  img:'./img/ninja_1.png', lv:'Lv.1', name:'みならい忍者',
    desc:'まずは「1をたす」をきわめるところから。',   halo:'rgba(103,183,255,.20)' },
  { min:5,  img:'./img/ninja_2.png', lv:'Lv.2', name:'てがた忍者',
    desc:'手裏剣がさえてきた。修行の成果が出ている。', halo:'rgba(93,211,140,.22)' },
  { min:12, img:'./img/ninja_3.png', lv:'Lv.3', name:'かみなり忍者',
    desc:'雷のオーラで、かなりの達人感。',            halo:'rgba(245,200,76,.25)' },
  { min:20, img:'./img/ninja_4.png', lv:'Lv.4', name:'でんせつの忍者',
    desc:'すべてを極めた、最終形態。',                halo:'rgba(255,120,200,.22)' },
];

// ── 宝石定義（18個: くりあがりなし 1〜9, くりあがりあり 2〜9 + ぜんぶマスター）──
// img/gem_1.png〜img/gem_18.png, または img/gem_no1.png / img/gem_carry2.png 等
// ファイル名規則: gem_no1〜gem_no9（なし1〜9）, gem_c2〜gem_c9（くりあがり2〜9）
// ここでは img/gem_1.png〜img/gem_18.png のシンプルな連番で対応
var ACH_GEMS = [];
(function() {
  for (var n = 1; n <= 9; n++) {
    ACH_GEMS.push({
      idx: n,
      id: 'no_' + n,
      label: n + 'をたすマスター',
      img: './img/gem_' + n + '.png',
      check: function(nn) {
        return function() {
          return isAllMasterForProblemSet(buildKP_for_no(nn), 'n' + nn + ':');
        };
      }(n)
    });
  }
  for (var n2 = 2; n2 <= 9; n2++) {
    ACH_GEMS.push({
      idx: n2 + 8,
      id: 'carry_' + n2,
      label: n2 + 'をたすマスター(くりあがり)',
      img: './img/gem_' + (n2 + 9) + '.png',
      check: function(nn) {
        return function() {
          return isAllMasterForProblemSet(buildKP_for_carry(nn), 'k' + nn + ':');
        };
      }(n2)
    });
  }
  ACH_GEMS.push({
    idx: 18,
    id: 'all_master',
    label: 'ぜんぶマスター',
    img: './img/gem_18.png',
    check: function() {
      return isAllMasterForLevel('mix');
    }
  });
})();

// buildKP を mode 固定版として複製（kSt に依存しない）

// ── 実績定義 ──
function getAchievements() {
  return {};
}

// ======================================================
// 制覇バッジ
// ======================================================
var badgeData = storageLoadJSON(LS_BADGE, {});

// 制覇バッジ定義（6個）
// 条件: 全問正解 + 全問平均3秒以内（=合計ms / 問題数 <= 3000）
var BADGES = [
  { id:'easy_20',  ico:'🟢', name:'かんたん20もん せいはバッジ',
    cond:'かんたん 20もん\nぜんもん3びょう以内',
    img:'./img/badge_easy20.png',
    level:'easy', course:'20' },
  { id:'easy_all', ico:'🌿', name:'かんたんぜんぶ せいはバッジ',
    cond:'かんたん ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_easy_all.png',
    level:'easy', course:'all' },
  { id:'hard_20',  ico:'💜', name:'むずかしい20もん せいはバッジ',
    cond:'むずかしい 20もん\nぜんもん3びょう以内',
    img:'./img/badge_hard20.png',
    level:'hard', course:'20' },
  { id:'hard_all', ico:'⭐', name:'むずかしいぜんぶ せいはバッジ',
    cond:'むずかしい ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_hard_all.png',
    level:'hard', course:'all' },
  { id:'mix_20',   ico:'🎲', name:'ばらばら20もん せいはバッジ',
    cond:'ばらばら 20もん\nぜんもん3びょう以内',
    img:'./img/badge_mix20.png',
    level:'mix', course:'20' },
  { id:'mix_all',  ico:'👑', name:'ばらばらぜんぶ せいはバッジ',
    cond:'ばらばら ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_mix_all.png',
    level:'mix', course:'all' },
];

function saveBadgeData() {
  storageSaveJSON(LS_BADGE, badgeData);
}

// finish() から呼ぶ: 全問正解 + 全問3秒以内 → バッジ付与
function checkAndAwardBadge(level, course, results) {
  if (!results || !results.length) return null;
  var allOk  = results.every(function(r){ return r.ok; });
  var allFast = results.every(function(r){ return r.el <= 3000; });
  if (!allOk || !allFast) return null;

  var id = level + '_' + course;
  var badge = BADGES.find(function(b){ return b.id === id; });
  if (!badge) return null;

  if (!badgeData[id]) {
    badgeData[id] = { date: new Date().toLocaleDateString('ja-JP') };
    saveBadgeData();
    return badge; // 新規獲得
  }
  return null; // 既に持っている
}
