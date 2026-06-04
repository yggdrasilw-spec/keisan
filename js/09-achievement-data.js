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

// ── 宝石定義（18個）──
var ACH_GEM_LABELS = {
  1: '金剛石（ダイヤモンド）',
  2: '紅玉（ルビー）',
  3: '青玉（サファイア）',
  4: '翠玉（エメラルド）',
  5: '紫水晶（アメジスト）',
  6: '黄玉（トパーズ）',
  7: '柘榴石（ガーネット）',
  8: '橄欖石（ペリドット）',
  9: '蛋白石（オパール）',
  10: '電気石（トルマリン）',
  11: '翡翠（ヒスイ）',
  12: '瑠璃（ラピスラズリ）',
  13: '真珠（パール）',
  14: '琥珀（コハク）',
  15: '風信子石（ジルコン）',
  16: '尖晶石（スピネル）',
  17: '月長石（ムーンストーン）',
  18: '金緑石（アレキサンドライト）'
};

var ACH_GEMS = [];
(function() {
  for (var n = 1; n <= 9; n++) {
    ACH_GEMS.push({
      id: 'no_' + n,
      idx: n,
      name: n + 'をたすマスター',
      unlockText: n + 'をたすマスター',
      label: n + 'をたすマスター ' + ACH_GEM_LABELS[n],
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
      id: 'carry_' + n2,
      idx: n2 + 9,
      name: n2 + 'をたすマスター（くりあがり）',
      unlockText: n2 + 'をたすマスター',
      label: n2 + 'をたすマスター（くりあがり） ' + ACH_GEM_LABELS[n2 + 9],
      img: './img/gem_' + (n2 + 9) + '.png',
      check: function(nn) {
        return function() {
          return isAllMasterForProblemSet(buildKP_for_carry(nn), 'k' + nn + ':');
        };
      }(n2)
    });
  }
  ACH_GEMS.push({
    id: 'all_master',
    idx: 18,
    name: 'ぜんぶマスター',
    unlockText: 'ぜんぶマスター',
    label: 'ぜんぶマスター ' + ACH_GEM_LABELS[18],
    img: './img/gem_18.png',
    check: function() {
      return isAllMasterForLevel('mix');
    }
  });
})();

// buildKP を mode 固定版として複製（kSt に依存しない）

// ── 実績定義 ──
function getAchievements() {
  return {
    badge: BADGES.map(function(badge) {
      return {
        ico: badge.ico,
        name: badge.name,
        meta: badge.cond,
        unlocked: !!badgeData[badge.id],
        unlockText: badge.unlockText || badge.name.replace(/\n/g, ' ')
      };
    })
  };
}

// ======================================================
// 制覇バッジ
// ======================================================
var badgeData = storageLoadJSON(LS_BADGE, {});

// 制覇バッジ定義（6個）
// 条件: 全問正解 + 全問平均3秒以内（=合計ms / 問題数 <= 3000）
var BADGES = [
  { id:'easy_20',  ico:'🟢', name:'かんたん\n20もん 制覇！',
    unlockText:'かんたん２０もん　せいはバッジ',
    cond:'かんたん 20もん\nぜんもん3びょう以内',
    img:'./img/badge_easy20.png',
    level:'easy', course:'20' },
  { id:'easy_all', ico:'🌿', name:'かんたん\nぜんぶ 制覇！',
    unlockText:'かんたんぜんぶ　せいはバッジ',
    cond:'かんたん ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_easy_all.png',
    level:'easy', course:'all' },
  { id:'hard_20',  ico:'💜', name:'むずかしい\n20もん 制覇！',
    unlockText:'むずかしい２０もん　せいはバッジ',
    cond:'むずかしい 20もん\nぜんもん3びょう以内',
    img:'./img/badge_hard20.png',
    level:'hard', course:'20' },
  { id:'hard_all', ico:'⭐', name:'むずかしい\nぜんぶ 制覇！',
    unlockText:'むずかしいぜんぶ　せいはバッジ',
    cond:'むずかしい ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_hard_all.png',
    level:'hard', course:'all' },
  { id:'mix_20',   ico:'🎲', name:'ばらばら\n20もん 制覇！',
    unlockText:'ばらばら２０もん　せいはバッジ',
    cond:'ばらばら 20もん\nぜんもん3びょう以内',
    img:'./img/badge_mix20.png',
    level:'mix', course:'20' },
  { id:'mix_all',  ico:'👑', name:'ばらばら\nぜんぶ 制覇！',
    unlockText:'ばらばらぜんぶ　せいはバッジ',
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
