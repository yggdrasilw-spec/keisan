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
var ACH_GEMS = [
  {
    idx: 1,
    id: "no_1",
    label: "1をたすマスター",
    unlockText: "１をたすマスター！\n金剛石（ダイヤモンド）ゲット！",
    img: "./img/gem_1.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(1)
  },
  {
    idx: 2,
    id: "no_2",
    label: "2をたすマスター",
    unlockText: "２をたすマスター！\n紅玉（ルビー）ゲット！",
    img: "./img/gem_2.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(2)
  },
  {
    idx: 3,
    id: "no_3",
    label: "3をたすマスター",
    unlockText: "３をたすマスター！\n青玉（サファイア）ゲット！",
    img: "./img/gem_3.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(3)
  },
  {
    idx: 4,
    id: "no_4",
    label: "4をたすマスター",
    unlockText: "４をたすマスター！\n翠玉（エメラルド）ゲット！",
    img: "./img/gem_4.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(4)
  },
  {
    idx: 5,
    id: "no_5",
    label: "5をたすマスター",
    unlockText: "５をたすマスター！\n紫水晶（アメジスト）ゲット！",
    img: "./img/gem_5.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(5)
  },
  {
    idx: 6,
    id: "no_6",
    label: "6をたすマスター",
    unlockText: "６をたすマスター！\n黄玉（トパーズ）ゲット！",
    img: "./img/gem_6.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(6)
  },
  {
    idx: 7,
    id: "no_7",
    label: "7をたすマスター",
    unlockText: "７をたすマスター！\n柘榴石（ガーネット）ゲット！",
    img: "./img/gem_7.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(7)
  },
  {
    idx: 8,
    id: "no_8",
    label: "8をたすマスター",
    unlockText: "８をたすマスター！\n橄欖石（ペリドット）ゲット！",
    img: "./img/gem_8.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(8)
  },
  {
    idx: 9,
    id: "no_9",
    label: "9をたすマスター",
    unlockText: "9をたすマスター！\n蛋白石（オパール）ゲット！",
    img: "./img/gem_9.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_no(nn), "n" + nn + ":");
      };
    })(9)
  },
  {
    idx: 10,
    id: "all_master",
    label: "かんたん、むずかしい、ばらばらマスター、にがて0",
    unlockText: "すべてをマスター！\n電気石（トルマリン）ゲット！",
    img: "./img/gem_10.png",
    check: function() {
      return isAllMasterForLevel('mix');
    }
  },
  {
    idx: 11,
    id: "carry_2",
    label: "2をたすマスター（くりあがり）",
    unlockText: "２をたすマスター（くりあがり）！\n翡翠（ヒスイ）ゲット！",
    img: "./img/gem_11.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(2)
  },
  {
    idx: 12,
    id: "carry_3",
    label: "3をたすマスター（くりあがり）",
    unlockText: "３をたすマスター（くりあがり）！\n瑠璃（ラピスラズリ）ゲット！",
    img: "./img/gem_12.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(3)
  },
  {
    idx: 13,
    id: "carry_4",
    label: "4をたすマスター（くりあがり）",
    unlockText: "４をたすマスター（くりあがり）！\n真珠（パール）ゲット！",
    img: "./img/gem_13.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(4)
  },
  {
    idx: 14,
    id: "carry_5",
    label: "5をたすマスター（くりあがり）",
    unlockText: "５をたすマスター（くりあがり）！\n琥珀（コハク）ゲット！",
    img: "./img/gem_14.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(5)
  },
  {
    idx: 15,
    id: "carry_6",
    label: "6をたすマスター（くりあがり）",
    unlockText: "６をたすマスター（くりあがり）！\n風信子石（ジルコン）ゲット！",
    img: "./img/gem_15.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(6)
  },
  {
    idx: 16,
    id: "carry_7",
    label: "7をたすマスター（くりあがり）",
    unlockText: "７をたすマスター（くりあがり）！\n尖晶石（スピネル）ゲット！",
    img: "./img/gem_16.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(7)
  },
  {
    idx: 17,
    id: "carry_8",
    label: "8をたすマスター（くりあがり）",
    unlockText: "８をたすマスター（くりあがり）！\n月長石（ムーンストーン）ゲット！",
    img: "./img/gem_17.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(8)
  },
  {
    idx: 18,
    id: "carry_9",
    label: "9をたすマスター（くりあがり）",
    unlockText: "9をたすマスター（くりあがり）！\n金緑石（アレキサンドライト）ゲット！",
    img: "./img/gem_18.png",
    check: (function(nn) {
      return function() {
        return isAllMasterForProblemSet(buildKP_for_carry(nn), "k" + nn + ":");
      };
    })(9)
  }
];

// buildKP を mode 固定版として複製（kSt に依存しない）

// ── 実績定義 ──
function getAchievements() {
  return {
    badge: BADGES.map(function(b) {
      return {
        id: b.id,
        ico: b.ico,
        name: b.name,
        cond: b.cond,
        unlockTitle: b.unlockTitle,
        unlocked: !!badgeData[b.id]
      };
    })
  };
}

// ======================================================
// 制覇バッジ
// ======================================================
var badgeData = storageLoadJSON(LS_BADGE, {});

// 制覇バッジ定義（12個）
// 条件: 全問正解 + 全問平均3秒以内（=合計ms / 問題数 <= 3000）
var BADGES = [
  { id:'easy_20',  ico:'🟢', name:'かんたん\n20もん 制覇！', unlockTitle:'かんたん２０もん　せいはバッジ',
    cond:'かんたん 20もん\nぜんもん3びょう以内',
    img:'./img/badge_easy20.png',
    level:'easy', course:'20', group:'seiha' },
  { id:'easy_all', ico:'🌿', name:'かんたん\nぜんぶ 制覇！', unlockTitle:'かんたんぜんぶ　せいはバッジ',
    cond:'かんたん ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_easy_all.png',
    level:'easy', course:'all', group:'seiha' },
  { id:'hard_20',  ico:'💜', name:'むずかしい\n20もん 制覇！', unlockTitle:'むずかしい２０もん　せいはバッジ',
    cond:'むずかしい 20もん\nぜんもん3びょう以内',
    img:'./img/badge_hard20.png',
    level:'hard', course:'20', group:'seiha' },
  { id:'hard_all', ico:'⭐', name:'むずかしい\nぜんぶ 制覇！', unlockTitle:'むずかしいぜんぶ　せいはバッジ',
    cond:'むずかしい ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_hard_all.png',
    level:'hard', course:'all', group:'seiha' },
  { id:'mix_20',   ico:'🎲', name:'ばらばら\n20もん 制覇！', unlockTitle:'ばらばら２０もん　せいはバッジ',
    cond:'ばらばら 20もん\nぜんもん3びょう以内',
    img:'./img/badge_mix20.png',
    level:'mix', course:'20', group:'seiha' },
  { id:'mix_all',  ico:'👑', name:'ばらばら\nぜんぶ 制覇！', unlockTitle:'ばらばらぜんぶ　せいはバッジ',
    cond:'ばらばら ぜんもん\nぜんもん3びょう以内',
    img:'./img/badge_mix_all.png',
    level:'mix', course:'all', group:'seiha' },

  { id:'easy_shinsoku', ico:'⚡', name:'かんたん\n神速（しんそく） クリア！', unlockTitle:'かんたん神速（しんそく）　せいはバッジ',
    cond:'かんたん 神速（しんそく）\n2びょう以内で クリア',
    img:'./img/shinsoku_easy.png',
    level:'easy', course:'shinsoku', group:'ougi' },
  { id:'hard_shinsoku', ico:'⚡', name:'むずかしい\n神速（しんそく） クリア！', unlockTitle:'むずかしい神速（しんそく）　せいはバッジ',
    cond:'むずかしい 神速（しんそく）\n2びょう以内で クリア',
    img:'./img/shinsoku_hard.png',
    level:'hard', course:'shinsoku', group:'ougi' },
  { id:'mix_shinsoku', ico:'⚡', name:'ばらばら\n神速（しんそく） クリア！', unlockTitle:'ばらばら神速（しんそく）　せいはバッジ',
    cond:'ばらばら 神速（しんそく）\n2びょう以内で クリア',
    img:'./img/shinsoku_barabara.png',
    level:'mix', course:'shinsoku', group:'ougi' },
  { id:'easy_cho_shinsoku', ico:'⚡', name:'かんたん\n超神速（ちょうしんそく） クリア！', unlockTitle:'かんたん超神速（ちょうしんそく）　せいはバッジ',
    cond:'かんたん 超神速（ちょうしんそく）\n1.5びょう以内で クリア',
    img:'./img/cho_shinsoku_easy.png',
    level:'easy', course:'cho_shinsoku', group:'ougi' },
  { id:'hard_cho_shinsoku', ico:'⚡', name:'むずかしい\n超神速（ちょうしんそく） クリア！', unlockTitle:'むずかしい超神速（ちょうしんそく）　せいはバッジ',
    cond:'むずかしい 超神速（ちょうしんそく）\n1.5びょう以内で クリア',
    img:'./img/cho_shinsoku_hard.png',
    level:'hard', course:'cho_shinsoku', group:'ougi' },
  { id:'mix_cho_shinsoku', ico:'⚡', name:'ばらばら\n超神速（ちょうしんそく） クリア！', unlockTitle:'ばらばら超神速（ちょうしんそく）　せいはバッジ',
    cond:'ばらばら 超神速（ちょうしんそく）\n1.5びょう以内で クリア',
    img:'./img/cho_shinsoku_barabara.png',
    level:'mix', course:'cho_shinsoku', group:'ougi' },
];

function saveBadgeData() {
  storageSaveJSON(LS_BADGE, badgeData);
}

function awardBadgeById(id) {
  var badge = BADGES.find(function(b){ return b.id === id; });
  if (!badge) return null;
  if (!badgeData[id]) {
    badgeData[id] = { date: new Date().toLocaleDateString('ja-JP') };
    saveBadgeData();
    return badge;
  }
  return null;
}

// finish() から呼ぶ: 全問正解 + 全問3秒以内 → バッジ付与
function checkAndAwardBadge(level, course, results) {
  if (!results || !results.length) return null;
  var allOk  = results.every(function(r){ return r.ok; });
  var allFast = results.every(function(r){ return r.el <= 3000; });
  if (!allOk || !allFast) return null;

  var id = level + '_' + course;
  return awardBadgeById(id); // 新規獲得 or null
}
