// 00-problem.js
// ======================================================
// 問題生成 / キー生成 / シャッフル
// ======================================================
function buildKPRange(n, minA, maxA, minSum, maxSum) {
  var p=[], seen={};
  for (var a=minA; a<=maxA; a++) {
    var pairs=[[a,n],[n,a]];
    for (var j=0; j<pairs.length; j++) {
      var aa=pairs[j][0], bb=pairs[j][1], key=aa+'+'+bb, sum=aa+bb;
      if (!seen[key] && sum>=minSum && sum<=maxSum) {
        seen[key]=1;
        p.push({a:aa,b:bb,ans:sum});
      }
    }
  }
  return p;
}

function buildP(m) {
  var p=[];
  if (m==='no') {
    for (var a=1;a<=9;a++) for (var b=1;b<=9;b++) if (a+b<=10) p.push({a:a,b:b,ans:a+b});
  } else {
    for (var a=2;a<=9;a++) for (var b=2;b<=9;b++) if (a+b>=11&&a+b<=18) p.push({a:a,b:b,ans:a+b});
  }
  return p;
}

function buildKP(n) {
  var isNo = (kSt.mode === 'no');
  return buildKPRange(n, isNo ? 1 : 2, 9, isNo ? 2 : 11, isNo ? 10 : 18);
}

function gk(m,p)  { return m+':'+p.a+'+'+p.b; }
function kk(n,p)  { return (kSt.mode==='no'?'n':'k')+n+':'+p.a+'+'+p.b; }

function sh(a) {
  for (var i=a.length-1;i>0;i--) { var j=0|Math.random()*(i+1),t=a[i];a[i]=a[j];a[j]=t; }
  return a;
}

// mixモード用: easy + hard 全問
function buildPMix() {
  return buildP('no').concat(buildP('carry'));
}

// レベルに対応するbuildP
function buildPLevel(level) {
  if (level === 'easy')  return buildP('no');
  if (level === 'hard')  return buildP('carry');
  if (level === 'mix')   return buildPMix();
  return buildP('no');
}

// gkキー（レベル付き）
function gkLevel(level, p) {
  // mixでは元のモードキーで管理（easy/hardそれぞれ）
  var m = (p.a + p.b <= 10) ? 'no' : 'carry';
  return m + ':' + p.a + '+' + p.b;
}
