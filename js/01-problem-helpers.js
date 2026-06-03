// 01-problem-helpers.js
// ======================================================
// 問題生成の共通ヘルパー
// ======================================================
function buildKP_for_no(n) {
  return buildKPRange(n, 1, 9, 2, 10);
}
function buildKP_for_carry(n) {
  return buildKPRange(n, 2, 9, 11, 18);
}
