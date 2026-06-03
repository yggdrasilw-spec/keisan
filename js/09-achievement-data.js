
// 09-achievement-data.js
// ======================================================
// じっせき（実績）データ
// ======================================================

// ── アバター段階定義（PNG: ninja_1.png〜ninja_4.png）──
var ACH_STAGES = [
  { min:0,  img:'./ninja_1.png', lv:'Lv.1', name:'みならい忍者',
    desc:'まずは「1をたす」をきわめるところから。',   halo:'rgba(103,183,255,.20)' },
  { min:5,  img:'./ninja_2.png', lv:'Lv.2', name:'てがた忍者',
    desc:'手裏剣がさえてきた。修行の成果が出ている。', halo:'rgba(93,211,140,.22)' },
  { min:12, img:'./ninja_3.png', lv:'Lv.3', name:'かみなり忍者',
    desc:'雷のオーラで、かなりの達人感。',            halo:'rgba(245,200,76,.25)' },
  { min:20, img:'./ninja_4.png', lv:'Lv.4', name:'でんせつの忍者',
    desc:'すべてを極めた、最終形態。',                halo:'rgba(255,120,200,.22)' },
];

// ── 宝石名（gem_1.png〜gem_18.png の順番に対応）──
var GEM_NAMES = [
  '金剛石（ダイヤモンド）',
  '紅玉（ルビー）',
  '青玉（サファイア）',
  '翠玉（エメラルド）',
  '紫水晶（アメジスト）',
  '黄玉（トパーズ）',
  '柘榴石（ガーネット）',
  '橄欖石（ペリドット）',
  '蛋白石（オパール）',
  '電気石（トルマリン）',
  '翡翠（ヒスイ）',
  '瑠璃（ラピスラズリ）',
  '真珠（パール）',
  '琥珀（コハク）',
  '風信子石（ジルコン）',
  '尖晶石（スピネル）',
  '月長石（ムーンストーン）',
  '金緑石（アレキサンドライト）'
];

function makeGemInfo(idx, label, img, check) {
  return {
    id: idx,
    label: label,
    gemName: GEM_NAMES[idx - 1] || '',
    img: img,
    check: check
  };
}

// ── 宝石定義（18個）──
var ACH_GEMS = [];
(function() {
  for (var n = 1; n <= 9; n++) {
    ACH_GEMS.push(makeGemInfo(
      n,
      n + 'をたす マスター',
      './gem_' + n + '.png',
      (function(nn) {
        return function() {
          return isAllMasterForProblemSet(buildKP_for_no(nn), 'n' + nn + ':');
        };
      })(n)
    ));
  }
  for (var n2 = 2; n2 <= 9; n2++) {
    ACH_GEMS.push(makeGemInfo(
      n2 + 8,
      n2 + 'をたす マスター(くりあがり)',
      './gem_' + (n2 + 9) + '.png',
      (function(nn) {
        return function() {
          return isAllMasterForProblemSet(buildKP_for_carry(nn), 'k' + nn + ':');
        };
      })(n2)
    ));
  }
  ACH_GEMS.push(makeGemInfo(
    18,
    'ぜんぶマスター',
    './gem_18.png',
    function() {
      return isAllMasterForLevel('mix');
    }
  ));
})();

// ── 制覇バッジ ──
var badgeData = storageLoadJSON(LS_BADGE, {});

var BADGES = [
  { id:'easy_20',  ico:'🟢', name:'かんたん
20もん 制覇！',
    cond:'かんたん 20もん
ぜんもん3びょう以内',
    img:'./badge_easy20.png',
    level:'easy', course:'20' },
  { id:'easy_all', ico:'🌿', name:'かんたん
ぜんぶ 制覇！',
    cond:'かんたん ぜんもん
ぜんもん3びょう以内',
    img:'./badge_easy_all.png',
    level:'easy', course:'all' },
  { id:'hard_20',  ico:'💜', name:'むずかしい
20もん 制覇！',
    cond:'むずかしい 20もん
ぜんもん3びょう以内',
    img:'./badge_hard20.png',
    level:'hard', course:'20' },
  { id:'hard_all', ico:'⭐', name:'むずかしい
ぜんぶ 制覇！',
    cond:'むずかしい ぜんもん
ぜんもん3びょう以内',
    img:'./badge_hard_all.png',
    level:'hard', course:'all' },
  { id:'mix_20',   ico:'🎲', name:'ばらばら
20もん 制覇！',
    cond:'ばらばら 20もん
ぜんもん3びょう以内',
    img:'./badge_mix20.png',
    level:'mix', course:'20' },
  { id:'mix_all',  ico:'👑', name:'ばらばら
ぜんぶ 制覇！',
    cond:'ばらばら ぜんもん
ぜんもん3びょう以内',
    img:'./badge_mix_all.png',
    level:'mix', course:'all' },
];

function getAchievements() {
  return {
    badges: BADGES
  };
}

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
