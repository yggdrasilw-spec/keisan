// 00-style.js
// ======================================================
// ステータス / 色 / 表示定数
// ======================================================
function getSt(r) {
  if (!r || !r.att || !r.last) return 'unseen';
  if (!r.last.ok || r.last.el >= 8000) return 'weak';
  if (r.last.ok && r.last.el < 3000) return 'master';
  return 'ok';
}

// ステータスカラー（マスター=青）
var ST_DOT = {master:'#3A90E0', ok:'#5AAA30', weak:'#D4407E', unseen:'#C0B090'};
var ST_BG  = {master:'#E8F4FF', ok:'#E8F8DF', weak:'#FFEEF4', unseen:'#F5EDE0'};
var ST_TC  = {master:'#1A4A80', ok:'#2A6010', weak:'#8A2050', unseen:'#6A5030'};
var ST_PT  = {master:'マスター', ok:'がんばろう', weak:'にがて', unseen:'まだ'};
var ST_HG  = {master:'#3A90E0', ok:'#7DC95E', weak:'#F0A0BF', unseen:'#E0D0B8'};
var ST_HTC = {master:'#fff', ok:'#fff', weak:'#fff', unseen:'#8A7050'};

var ACOLS = [
  {bg:'#FFEEF4',bd:'#D4407E',sh:'#A03060',tc:'#8A2050'},
  {bg:'#FFF3D6',bd:'#D49023',sh:'#A06800',tc:'#6A4010'},
  {bg:'#E8F8DF',bd:'#5AAA30',sh:'#3A8020',tc:'#2A6010'},
  {bg:'#E8F0FF',bd:'#5080D0',sh:'#3060A0',tc:'#1A3A80'},
  {bg:'#EEF0FF',bd:'#6060D0',sh:'#4040A0',tc:'#3A3A9A'},
  {bg:'#E8FFF4',bd:'#30A870',sh:'#1A8050',tc:'#0A5030'},
];
var DOT_COLS = ['#D4407E','#F5A623','#F5A623','#5AAA30','#5080D0','#6060D0'];
var NUM_COLS = {
  1:{bd:'#7DC95E',bg:'#F4FFDC',tc:'#2A6010'},
  2:{bd:'#E07070',bg:'#FFF0F0',tc:'#901010'},
  3:{bd:'#E09050',bg:'#FFF4E8',tc:'#803010'},
  4:{bd:'#D0A020',bg:'#FFF8D8',tc:'#705010'},
  5:{bd:'#90C040',bg:'#F4FFDC',tc:'#305010'},
  6:{bd:'#30B080',bg:'#E0FFF4',tc:'#104030'},
  7:{bd:'#5090D8',bg:'#EAF2FF',tc:'#103080'},
  8:{bd:'#8060D8',bg:'#F0EEFF',tc:'#301880'},
  9:{bd:'#C040B0',bg:'#FDEEFF',tc:'#601060'},
};
