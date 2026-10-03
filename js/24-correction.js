// Keep a missed problem visible until its complete explanation is confirmed.
(function () {
  'use strict';
  var timer=0, poll=0, current=null, readyAt=0;
  var board=document.getElementById('hint-board');
  var next=document.querySelector('[data-action="hintNext"]');
  var continueButton=document.createElement('button');
  continueButton.id='correction-continue';continueButton.type='button';continueButton.hidden=true;
  next.parentElement.appendChild(continueButton);
  function stop(){clearTimeout(timer);clearInterval(poll);timer=0;poll=0;current=null;continueButton.hidden=true;document.getElementById('hint-box').classList.remove('correction-active');}
  function valid(){return current && current.session===sess && _currentScreen==='practice' && !sess._sessionEnding;}
  function completeStage(){
    if(hintP.a+hintP.b<=10)return true;
    return hintStep >= (board.querySelector('.five-hint-svg,.sakura-hint-svg')?4:5);
  }
  function open(p,done){
    if(!valid())return stop();
    hintSetProblem(p);
    if(!hintVisible)toggleHint();
    if(!hintVisible){var finish=current.done;stop();finish();return;}
    document.getElementById('hint-box').classList.add('correction-active');
    continueButton.hidden=false;continueButton.disabled=true;continueButton.textContent='かいせつを みよう';
    readyAt=Date.now()+2000;
    poll=setInterval(function(){
      if(!valid())return stop();
      if(next.disabled || board.getAttribute('aria-busy')==='true' || (voiceOn && window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)))return;
      if(Date.now()<readyAt)return;
      if(completeStage()){
        if(hintP.a+hintP.b<=10)document.getElementById('hint-msg').textContent=hintP.a+' と '+hintP.b+' を あわせて、こたえは '+hintP.ans+'！';
        clearInterval(poll);poll=0;continueButton.disabled=false;continueButton.textContent='つぎの もんだい ▶';return;
      }
      hintNext();readyAt=Date.now()+2000;
    },100);
  }
  continueButton.onclick=function(){
    if(!valid()||continueButton.disabled)return;
    var done=current.done;stop();
    if(hintVisible)toggleHint();
    if(typeof NinjaBattle!=='undefined')NinjaBattle.sync();
    done();
  };
  // Keep the active explanation open; returning to another screen still cancels it.
  var originalToggle=toggleHint;
  toggleHint=function(){if(current && hintVisible)return;originalToggle();};
  window.NinjaCorrection={stop:stop,afterMiss:function(p,done,delay){
    stop();current={session:sess,done:done};
    var enabled=learningPrefs.explainMiss!==false;
    var wait=Math.max(delay||1400,typeof NinjaBattle!=='undefined'?NinjaBattle.feedbackDelay():0);
    timer=setTimeout(function(){
      timer=0;if(!valid())return stop();
      if(!enabled){stop();done();return;}
      open(p,done);
    },wait);
  }};
  var settings=document.createElement('fieldset');settings.className='learning-settings';
  settings.innerHTML='<legend>ミスした ときの かいせつ</legend><label><input id="explain-miss" type="checkbox"> かいせつを 最後まで みる</label><p>初期設定はON。かいせつのあと「つぎの もんだい」で進みます。</p>';
  document.querySelector('#settings .hint-settings').after(settings);
  var checkbox=settings.querySelector('input');checkbox.checked=learningPrefs.explainMiss!==false;
  checkbox.onchange=function(){learningPrefs.explainMiss=checkbox.checked;saveLearningPrefs();};
  var enter=SCREEN_ENTER_HANDLERS.settings;
  SCREEN_ENTER_HANDLERS.settings=function(){if(enter)enter();checkbox.checked=learningPrefs.explainMiss!==false;};
})();
