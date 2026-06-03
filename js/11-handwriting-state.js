// 11-handwriting-state.js
// ======================================================
// 手書きモードの状態 / 共通ヘルパー
// ======================================================
var hwDrawing     = false;
var hwStrokeCount = 0;
var hwTensDigit   = null;
var hwOnesDigit   = null;
var hwStroke1Box  = null;
var hwStroke2Box  = null;
var hwStroke1Pts  = [];
var hwStroke2Pts  = [];
var hwMinX, hwMaxX, hwMinY, hwMaxY;
var HW_TOUCH_THRESHOLD = 20;

function hwResetBox() { hwMinX=9999; hwMinY=9999; hwMaxX=-1; hwMaxY=-1; }
function hwUpdateBox(x,y) {
  if(x<hwMinX)hwMinX=x; if(y<hwMinY)hwMinY=y;
  if(x>hwMaxX)hwMaxX=x; if(y>hwMaxY)hwMaxY=y;
}
function hwGetRawBox() {
  return {x:hwMinX, y:hwMinY, w:Math.max(8,hwMaxX-hwMinX), h:Math.max(8,hwMaxY-hwMinY)};
}
function hwExpandBox(b, p) {
  p = p||14;
  var x=b.x-p, y=b.y-p, w=b.w+p*2, h=b.h+p*2;
  if(x<0)x=0; if(y<0)y=0;
  if(x+w>500)w=500-x; if(y+h>220)h=220-y;
  return {x:x,y:y,w:w,h:h};
}
function hwMergeBox(a,b) {
  var x=Math.min(a.x,b.x), y=Math.min(a.y,b.y);
  var r=Math.max(a.x+a.w,b.x+b.w), bt=Math.max(a.y+a.h,b.y+b.h);
  return {x:x,y:y,w:r-x,h:bt-y};
}
function hwMinDist(pts1, pts2) {
  var min=99999;
  for(var i=0;i<pts2.length;i++) {
    for(var j=0;j<pts1.length;j++) {
      var d=Math.hypot(pts2[i].x-pts1[j].x, pts2[i].y-pts1[j].y);
      if(d<min) min=d;
      if(min<2) return min;
    }
  }
  return min;
}
function hwPushPoint(x,y) {
  if(hwStrokeCount===0) hwStroke1Pts.push({x:x,y:y});
  else hwStroke2Pts.push({x:x,y:y});
}
function hwDrawBoxes(octx) {
  octx.clearRect(0,0,500,220);
  function rect(b,c) {
    octx.strokeStyle=c; octx.lineWidth=2;
    octx.setLineDash([8,5]); octx.strokeRect(b.x,b.y,b.w,b.h); octx.setLineDash([]);
  }
  if(hwStroke1Box) rect(hwStroke1Box,'#5AAA30');
  if(hwStroke2Box) rect(hwStroke2Box,'#F5A623');
}
