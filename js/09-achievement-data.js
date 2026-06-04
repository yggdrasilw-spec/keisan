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
      id: 'no_' + n,
      label: n + 'をたす マスター',
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
      label: n2 + 'をたす マスター(くりあがり)',
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
  var easyAllMaster = isAllMasterForLevel('easy');
  var hardAllMaster = isAllMasterForLevel('hard');
  var mixAllMaster = isAllMasterForLevel('mix');

  var has20EasyRank  = rkD['easy_20']  && rkD['easy_20'].length  > 0;
  var has20HardRank  = rkD['hard_20']  && rkD['hard_20'].length  > 0;
  var hasAllEasyRank = rkD['easy_all'] && rkD['easy_all'].length > 0;
  var hasAllHardRank = rkD['hard_all'] && rkD['hard_all'].length > 0;

  return {
    speed: [
      { ico:'⚡', name:'5びょう以内で正解',    meta:'はやく こたえた記録が残った',         unlocked: has20EasyRank },
      { ico:'⚡', name:'20もん ぜんもんせいかい（かんたん）', meta:'かんたんコースを ぜんぶ正解', unlocked: has20EasyRank },
      { ico:'⚡', name:'20もん ぜんもんせいかい（むずかしい）',meta:'むずかしいコースも ぜんぶ正解',unlocked: has20HardRank },
      { ico:'🏁', name:'ぜんぶコース ぜんもんせいかい（かんたん）',meta:'かんたん全問をノーミスクリア', unlocked: hasAllEasyRank },
      { ico:'🏆', name:'ぜんぶコース ぜんもんせいかい（むずかしい）',meta:'むずかしい全問をノーミスクリア',unlocked: hasAllHardRank },
    ],
    combo: [
      { ico:'🔥', name:'3れんぞく せいかい',  meta:'コンボの入口。ここで気分が上がる。',  unlocked: false },
      { ico:'🔥', name:'5れんぞく せいかい',  meta:'流れに乗って、どんどん進む。',        unlocked: false },
      { ico:'🌪', name:'10れんぞく せいかい', meta:'集中力が高まった強者の証。',          unlocked: false },
      { ico:'🛡', name:'ノーミス修行',        meta:'まちがえずに最後まで進む。',          unlocked: has20EasyRank || has20HardRank },
    ],
    clear: [
      { ico:'🌱', name:'くりあがりなし 全制覇', meta:'基礎をぜんぶ押さえた証。',         unlocked: easyAllMaster },
      { ico:'⭐', name:'くりあがりあり 全制覇', meta:'一段上の修行を終えた証。',          unlocked: hardAllMaster },
      { ico:'🎲', name:'ばらばら ぜんもんせいかい',meta:'全ジャンル混合でノーミス。',      unlocked: rkD['mix_all'] && rkD['mix_all'].length > 0 },
      { ico:'👑', name:'ぜんぶ マスター',       meta:'伝説の忍者への最終到達点。',        unlocked: mixAllMaster },
    ],
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
    cond:'かんたん 20もん\nぜんもん3びょう以内',
    img:'./img/badge_easy20.png',
    level:'easy', course:'20' },
  { id:'easy_all', ico:'🌿', name:'かんたん\nぜんぶ 制覇！',
    cond:'かんたん ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_easy_all.png',
    level:'easy', course:'all' },
  { id:'hard_20',  ico:'💜', name:'むずかしい\n20もん 制覇！',
    cond:'むずかしい 20もん\nぜんもん3びょう以内',
    img:'./img/badge_hard20.png',
    level:'hard', course:'20' },
  { id:'hard_all', ico:'⭐', name:'むずかしい\nぜんぶ 制覇！',
    cond:'むずかしい ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_hard_all.png',
    level:'hard', course:'all' },
  { id:'mix_20',   ico:'🎲', name:'ばらばら\n20もん 制覇！',
    cond:'ばらばら 20もん\nぜんもん3びょう以内',
    img:'./img/badge_mix20.png',
    level:'mix', course:'20' },
  { id:'mix_all',  ico:'👑', name:'ばらばら\nぜんぶ 制覇！',
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
