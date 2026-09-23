// Notebook-style complement-to-ten hint. The larger addend stays intact;
// the smaller addend splits into the complement and the remainder.
(function () {
  'use strict';
  var selected=false, generation=0, timer=0;
  var originalDraw=hintDraw, originalNext=hintNext, originalReset=hintReset;
  var originalSet=hintSetProblem, originalToggle=toggleHint;
  var originalCancel=window.cancelHintMotion;
  var board=document.getElementById('hint-board');
  var message=document.getElementById('hint-msg');
  var methods=document.getElementById('hint-methods');
  var sakuraButton=document.getElementById('hint-sakura');
  var fiveButton=document.getElementById('hint-five');
  var nextButton=document.querySelector('[data-action="hintNext"]');

  function valid(){return hintP && Number.isInteger(hintP.a) && Number.isInteger(hintP.b) && hintP.a>=1 && hintP.a<=9 && hintP.b>=1 && hintP.b<=9 && hintP.a+hintP.b>=11;}
  function facts(){
    var left=hintP.a,right=hintP.b,big=Math.max(left,right),small=Math.min(left,right);
    return {left:left,right:right,big:big,small:small,need:10-big,remain:small-(10-big),sum:left+right,bigLeft:left>=right};
  }
  function stop(){
    generation++;clearTimeout(timer);
    if(window.speechSynthesis)window.speechSynthesis.cancel();
    nextButton.disabled=false;nextButton.textContent='▶ つぎへ';board.removeAttribute('aria-busy');
  }
  function controls(){
    if(!valid()){sakuraButton.hidden=true;return;}
    methods.hidden=false;sakuraButton.hidden=false;
    fiveButton.hidden=!(hintP.a>=5 && hintP.b>=5);
    sakuraButton.setAttribute('aria-pressed',String(selected));
    if(selected){document.getElementById('hint-ten').setAttribute('aria-pressed','false');fiveButton.setAttribute('aria-pressed','false');}
  }
  function svg(f){
    var root=f.bigLeft?306:100,first=f.bigLeft?245:63,second=f.bigLeft?365:175;
    var ellipse=f.bigLeft?'<ellipse class="group sakura-piece banana-step sakura-draw" pathLength="1" cx="160" cy="119" rx="170" ry="49" transform="rotate(42 160 119)"/>':'<ellipse class="group sakura-piece banana-step sakura-draw" pathLength="1" cx="246" cy="125" rx="165" ry="48" transform="rotate(-45 246 125)"/>';
    var ten=f.bigLeft?'<rect class="box sakura-piece banana-step sakura-draw" pathLength="1" x="35" y="212" width="119" height="53"/><text class="bottom sakura-piece banana-step" x="49" y="254">10</text><path class="arrow sakura-piece banana-step sakura-draw" pathLength="1" d="M84 211 Q99 184 128 164"/><path class="arrowhead sakura-piece banana-step" d="M120 166 L135 158 L130 174 Z"/>':'<text class="bottom sakura-piece banana-step" x="268" y="254">10</text><path class="arrow sakura-piece banana-step sakura-draw" pathLength="1" d="M320 211 L312 162"/><path class="arrowhead sakura-piece banana-step" d="M312 154 L304 169 L320 167 Z"/>';
    var rest=f.bigLeft?'<text class="bottom sakura-piece result-step" x="169" y="254">＋</text><text class="bottom sakura-piece result-step" x="255" y="254">'+f.remain+'</text><text class="bottom sakura-piece result-step" x="344" y="254">＝</text><text class="bottom sakura-piece result-step answer" x="441" y="254">'+f.sum+'</text>':'<text class="bottom sakura-piece result-step" x="39" y="254">'+f.remain+'</text><text class="bottom sakura-piece result-step" x="139" y="254">＋</text><text class="bottom sakura-piece result-step" x="386" y="254">＝</text><text class="bottom sakura-piece result-step answer" x="481" y="254">'+f.sum+'</text>';
    return '<svg class="sakura-hint-svg" viewBox="0 0 640 275" role="img" aria-label="'+f.left+'たす'+f.right+'をさくらんぼ・バナナ計算で考える">'
      +ellipse
      +'<path class="branch sakura-piece cherry-step sakura-draw" pathLength="1" d="M'+root+' 89 L'+first+' 150 M'+root+' 89 L'+second+' 150"/>'
      +'<circle class="circle sakura-piece cherry-step" cx="'+first+'" cy="178" r="29"/><circle class="circle sakura-piece cherry-step" cx="'+second+'" cy="178" r="29"/>'
      +'<text class="top '+(f.bigLeft?'near':'')+'" x="45" y="75">'+f.left+'</text><text class="top" x="158" y="75">＋</text><text class="top '+(!f.bigLeft?'near':'')+'" x="268" y="75">'+f.right+'</text><text class="top" x="378" y="75">＝</text>'
      +'<text class="top answer sakura-piece result-step" x="490" y="75">'+f.sum+'</text>'
      +'<text class="child sakura-piece cherry-step" x="'+first+'" y="194" text-anchor="middle">'+(f.bigLeft?f.need:f.remain)+'</text>'
      +'<text class="child sakura-piece cherry-step" x="'+second+'" y="194" text-anchor="middle">'+(f.bigLeft?f.remain:f.need)+'</text>'
      +ten+rest+'</svg>';
  }
  function lines(f){return [
    '大きい方の数、'+f.big+'は、あと'+f.need+'で10だね。',
    'それに合わせて、小さい方の数を分けるよ。',
    f.small+'を'+f.need+'と'+f.remain+'に分けます。さくらんぼ。',
    (f.bigLeft?f.big+'＋'+f.need:f.need+'＋'+f.big)+'で10をつくるよ。バナナ。',
    'さいごに'+(f.bigLeft?'10とのこりの'+f.remain:'のこりの'+f.remain+'と10')+'をたして、こたえは'+f.sum+'。'
  ];}
  function speak(line,done){
    var called=false;
    function advance(){if(called)return;called=true;clearTimeout(timer);timer=setTimeout(done,450);}
    timer=setTimeout(advance,voiceOn?6500:1800);
    if(!voiceOn || !window.speechSynthesis)return;
    var u=new SpeechSynthesisUtterance(line.replace(/＋/g,'たす'));
    u.lang='ja-JP';u.rate=typeof voiceCfg!=='undefined'?voiceCfg.rate:.95;u.pitch=typeof voiceCfg!=='undefined'?voiceCfg.pitch:1;
    if(typeof getSelectedVoice==='function'){var v=getSelectedVoice();if(v)u.voice=v;}
    u.onend=advance;u.onerror=advance;window.speechSynthesis.speak(u);
  }
  function playStage(stage,token,f){
    if(token!==generation || !selected || !hintVisible)return;
    hintStep=stage;
    if(stage===2)board.querySelectorAll('.cherry-step').forEach(function(n){n.classList.add('revealed');});
    if(stage===3)board.querySelectorAll('.banana-step').forEach(function(n){n.classList.add('revealed');});
    if(stage===4)board.querySelectorAll('.result-step').forEach(function(n){n.classList.add('revealed');});
    var line=lines(f)[stage];message.textContent=line;
    if(stage===4){nextButton.disabled=false;nextButton.textContent='↺ もういちど';board.setAttribute('aria-busy','false');if(voiceOn&&window.speechSynthesis){var u=new SpeechSynthesisUtterance(line);u.lang='ja-JP';u.rate=typeof voiceCfg!=='undefined'?voiceCfg.rate:.95;u.pitch=typeof voiceCfg!=='undefined'?voiceCfg.pitch:1;if(typeof getSelectedVoice==='function'){var v=getSelectedVoice();if(v)u.voice=v;}window.speechSynthesis.speak(u);}return;}
    speak(line,function(){playStage(stage+1,token,f);});
  }
  function draw(){
    stop();if(!valid())return;
    var f=facts();board.innerHTML=svg(f);message.textContent='';hintStep=0;
    nextButton.disabled=true;nextButton.textContent='うごきを みよう';board.setAttribute('aria-busy','true');
    controls();playStage(0,generation,f);
  }
  hintDraw=function(){if(selected){draw();return;}originalDraw();controls();};
  hintNext=function(){if(selected){if(!nextButton.disabled)draw();return;}originalNext();};
  hintReset=function(){if(selected){draw();return;}originalReset();};
  hintSetProblem=function(p){stop();selected=false;originalSet(p);controls();};
  toggleHint=function(){if(selected&&hintVisible)stop();originalToggle();};
  window.cancelHintMotion=function(){stop();if(originalCancel)originalCancel();};
  ['hint-ten','hint-five'].forEach(function(id){var b=document.getElementById(id);b.addEventListener('click',function(){selected=false;stop();},true);b.addEventListener('click',controls);});
  sakuraButton.addEventListener('click',function(){if(!valid())return;if(originalCancel)originalCancel();selected=true;draw();});
  controls();
})();
