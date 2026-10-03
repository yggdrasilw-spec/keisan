// Battle observes accepted learning events; it never changes scoring or timing.
(function () {
  'use strict';
  var state=null, root, left, right, hp, name, caption, skip, result;
  var animation=null, raf=0, syncRaf=0, finishTimer=0, pending=null, unavailable=false;
  var lastEnemy={};
  var enemies={
    easy:[['ninja','影の忍者','bamboo'],['samurai','城門の武者','gate']],
    hard:[['oni','山の赤鬼','mountain'],['tengu','森の天狗','forest'],['serpent','森の大蛇','forest'],['dragon','雲上の龍','mountain']],
    kotsu:[['master','道場の師範','dojo']]
  };
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  function mode(){return ['normal','quiet','off'].indexOf(learningPrefs.battle)>=0?learningPrefs.battle:'normal';}
  function quiet(){return mode()==='quiet'||reduced.matches;}
  function active(){return state&&state.session===sess&&_currentScreen==='practice';}
  function choose(boss){
    var group=sessMode==='kotsu'?'kotsu':curLevel==='mix'?(Math.random()<.5?'easy':'hard'):curLevel;
    if(sessMode==='mugen'&&!boss)group='easy';
    if(sessMode==='mugen'&&boss)group='hard';
    var choices=enemies[group]||enemies.easy;
    var pool=choices.filter(function(e){return e[0]!==lastEnemy[group];});
    var enemy=(pool.length?pool:choices)[Math.floor(Math.random()*(pool.length||choices.length))];
    lastEnemy[group]=enemy[0];return enemy;
  }
  function stage(){
    var total=typeof getUnlockedAchievementCount==='function'?getUnlockedAchievementCount().totalOn:0;
    var index=0;ACH_STAGES.forEach(function(s,i){if(total>=s.min)index=i;});return index+1;
  }
  function begin(){
    if(!sess||!Array.isArray(sess.queue)||!sess.queue.length)return;
    if(state&&state.session===sess)return;
    cancel(false);
    state={session:sess,total:sess.queue.length,progress:0,streak:0,kills:0,stage:stage(),seen:new Set(),
      enemy:choose(false),enemySlot:0,hp:100,outcome:'',ended:false};
    if(result)result.hidden=true;
  }
  function infiniteSlot(n){var cycle=Math.floor(n/20),within=n%20;return cycle*4+Math.floor(within/5);}
  function update(){
    if(!state)return;
    name.textContent=state.enemy[1];hp.style.width=state.hp+'%';
    caption.textContent=state.outcome==='win'?(sessMode==='kotsu'?'修行達成':'勝利！'):state.outcome==='retreat'?'煙玉で撤退':
      sessMode==='mugen'?'撃破 '+state.kills+'体':state.streak>=5?'分身の術':state.streak>=3?'手裏剣の術':'Lv.'+state.stage+' にんじゃ';
    root.dataset.enemy=state.enemy[0];root.dataset.stage=state.stage;
    root.dataset.hp=state.hp;root.dataset.kills=state.kills;
    root.dataset.action=animation?animation.type:'idle';
  }
  function advanceEnemy(){
    if(sessMode!=='mugen'||state.progress>=state.total)return;
    var slot=infiniteSlot(state.progress);
    if(slot!==state.enemySlot){state.enemySlot=slot;state.enemy=choose(slot%4===3);state.hp=100;}
  }
  function question(){begin();if(!state)return;advanceEnemy();sync();update();}
  function prepare(){begin();if(state&&mode()!=='off'){NinjaBattleArt.sheet('hero',state.stage);NinjaBattleArt.sheet(state.enemy[0],1);}}
  function answer(ok){
    begin();if(!state||state.ended||state.seen.has(sess.idx))return;
    state.seen.add(sess.idx);state.streak=ok?state.streak+1:0;
    // A terminal miss in a record challenge is not a completed question.
    if(ok||(sessMode!=='mugen'&&sessMode!=='shinsoku')){
      state.progress++;
      if(sessMode==='mugen'){
        var inEnemy=(state.progress-1)%5+1;state.hp=100-inEnemy*20;
        if(inEnemy===5)state.kills++;
      }else{state.hp=Math.max(0,100*(1-state.progress/state.total));}
    }
    react(ok?state.streak>=5?'clone':state.streak>=3?'throw':'slash':'hurt');update();
  }
  function miss(){if(!active()||state.ended)return;state.streak=0;react('hurt');update();}
  function react(type){
    if(pending)return;
    if(!root||root.hidden){animation=null;return;}
    animation={type:type,start:performance.now(),duration:quiet()?230:sessMode==='shinsoku'?320:520};
    update();startDraw();
  }
  function blockers(){return hintVisible||recitationActive()||document.hidden||
    document.getElementById('countdown-overlay').classList.contains('show');}
  function intersects(a,b){return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;}
  function sync(){
    if(!root)return;
    var practice=document.getElementById('practice'),panel=document.querySelector('.practice-answer-panel');
    practice.classList.remove('battle-layout');practice.style.removeProperty('--battle-offset');
    var allowed=!unavailable&&active()&&mode()!=='off'&&!blockers()&&innerWidth>=960&&innerHeight>=540&&innerWidth/innerHeight>4/3;
    if(allowed){
      var base=panel.getBoundingClientRect(),offset=Math.round(innerWidth/2-(base.left+base.width/2));
      var wing=innerWidth>=1500&&innerHeight>=850?256:192,margin=wing===256?28:12;
      var central={left:base.left+offset,right:base.right+offset,top:base.top,bottom:base.bottom};
      allowed=central.left>=wing+margin+18&&central.right<=innerWidth-wing-margin-18&&base.bottom<=innerHeight-20;
      if(allowed){
        practice.style.setProperty('--battle-offset',offset+'px');practice.classList.add('battle-layout');
        // Verify every visible learning control against both side zones.
        var zones=[{left:margin,right:margin+wing,top:innerHeight-64-(wing===256?326:252),bottom:innerHeight-64},
          {left:innerWidth-margin-wing,right:innerWidth-margin,top:innerHeight-64-(wing===256?326:252),bottom:innerHeight-64}];
        allowed=Array.from(practice.querySelectorAll('#pcard,#agrid,#calcgrid,#hw-area,.practice-hint-panel')).every(function(el){
          var r=el.getBoundingClientRect();return !r.width||!r.height||zones.every(function(z){return !intersects(r,z);});
        });
      }
    }
    if(!allowed){practice.classList.remove('battle-layout');practice.style.removeProperty('--battle-offset');}
    var wasHidden=root.hidden;root.hidden=!allowed;
    if(!allowed){
      animation=null;stopDraw();if(pending)complete();
    }else{
      var width=innerWidth>=1500&&innerHeight>=850?256:192;
      [left,right].forEach(function(canvas){if(canvas.width!==width){canvas.width=width;canvas.height=width*9/8;}});
      if(wasHidden)animation=null;
      update();draw(performance.now());if(!quiet()||animation)startDraw();
    }
  }
  function scheduleSync(){if(!syncRaf)syncRaf=requestAnimationFrame(function(){syncRaf=0;safe(sync);});}
  function stopDraw(){if(raf)cancelAnimationFrame(raf);raf=0;}
  function startDraw(){if(!raf&&!root.hidden)raf=requestAnimationFrame(tick);}
  function tick(now){raf=0;safe(function(){if(root.hidden)return;draw(now);if(!quiet()||animation)startDraw();});}
  function scenery(c,place){
    var r=NinjaBattleArt.rect,p=NinjaBattleArt.poly;
    c.clearRect(0,0,96,108);
    // Scenery stays in each wing; there is no full-screen background.
    if(place==='bamboo'||place==='forest'){
      [6,16,79,88].forEach(function(x,i){
        r(c,i%2?'#a5b59a':'#728971',x,20+i%2*9,3,79);
        for(var y=29;y<90;y+=15){r(c,'#d1d7b7',x,y,3,1);p(c,'#93a58a',[[x,y],[x-7,y-4],[x-3,y+1]]);}
      });
      if(place==='forest')p(c,'#c6cab5',[[0,92],[9,80],[23,85],[29,70],[42,90],[64,76],[92,83],[96,99]]);
    }else if(place==='gate'){
      r(c,'#b5b6a6',3,48,10,51);r(c,'#838d80',5,48,3,51);
      r(c,'#b5b6a6',81,48,10,51);p(c,'#717c72',[[0,48],[8,40],[88,40],[96,48]]);
      r(c,'#c5c3ae',15,94,67,5);
    }else if(place==='dojo'){
      r(c,'#b69d79',6,48,4,51);r(c,'#b69d79',85,48,4,51);r(c,'#ddd0ae',0,49,96,2);
      for(var x=0;x<96;x+=16)r(c,'#d1be94',x,99,14,4);
    }else{
      p(c,'#bec6bc',[[0,96],[11,65],[22,75],[32,55],[48,82],[66,66],[82,79],[96,69],[96,100]]);
      p(c,'#e1e1cd',[[26,65],[32,55],[40,68],[33,65],[30,70]]);
    }
    r(c,'#78836c',0,99,96,2);r(c,'#b4b299',0,101,96,5);r(c,'#d6cab0',0,106,96,2);
    for(var j=0;j<8;j++)r(c,'#939c7a',j*13+2,96-j%3,3,3+j%3);
  }
  function effect(c,type,t,target){
    var art=NinjaBattleArt, col=state.stage>=3?'#f4d684':'#c9e7e6';
    if(type==='smoke'){
      for(var i=0;i<8;i++){
        var x=23+(i*17)%53,y=83-Math.round(t*26)-(i%3)*8,s=6+Math.round(t*10);
        c.globalAlpha=1-t*.8;art.rect(c,i%2?'#b1b7b0':'#e0e1d1',x,y,s,s);art.rect(c,'#c9cec4',x+2,y-3,s-2,3);
      }c.globalAlpha=1;return;
    }
    if(t>.8)return;
    if(type==='throw'){
      for(var n=0;n<3;n++)art.star(c,54+Math.round(t*22)-n*8,54+n*8,col);
    }else if(type==='slash'||type==='clone'||type==='win'){
      art.poly(c,col,[[34,37],[55,49],[73,77],[66,73],[49,50]]);
      art.poly(c,'#fcf6da',[[39,42],[53,51],[66,68],[63,64]]);
      if(type==='clone')art.poly(c,'#97c4d2',[[29,68],[52,59],[73,42],[61,58],[34,73]]);
    }else if(type==='hurt'&&target){
      art.poly(c,'#ddba7b',[[42,55],[47,46],[49,55],[58,56],[49,59],[47,67],[44,59],[36,57]]);
    }
  }
  function draw(now){
    if(!state||!left||!right)return;
    var type=animation?animation.type:'idle',t=animation?Math.min(1,(now-animation.start)/animation.duration):0;
    if(animation&&t>=1){
      animation=null;if(pending){complete();return;}type='idle';update();
    }
    var frame=type==='idle'?(quiet()?0:Math.floor(now/280)%4):Math.min(3,Math.floor(t*4));
    [left,right].forEach(function(canvas,i){
      var c=canvas.getContext('2d');if(!c)throw new Error('Battle canvas unavailable');
      c.imageSmoothingEnabled=false;c.save();c.scale(canvas.width/96,canvas.width/96);scenery(c,state.enemy[2]);c.restore();
      // Integer 2x/3x (3x/4x on large screens) at the CSS display boundary.
      var hero=i===0,pose=type;
      if(type==='hurt')pose=hero?'hurt':'slash';
      else if(type==='win'){
        pose=t<.22?(hero?'slash':'hurt'):hero?'win':sessMode==='kotsu'?'bow':'defeat';
        frame=t<.22?Math.min(3,Math.floor(t/.22*4)):Math.min(3,Math.floor((t-.22)/.45*4));
      }
      else if(type==='retreat')pose=hero?'smoke':'idle';
      else if(!hero)pose=type==='idle'?'idle':state.hp===0?'defeat':'hurt';
      var kind=hero?'hero':state.enemy[0];
      var scale=canvas.width===256?(hero?3:4):(hero?2:3);
      var x=Math.round((canvas.width-64*scale)/2),y=Math.round(canvas.width*99/96-58*scale);
      if(hero&&sessMode==='shinsoku'&&type!=='idle'&&type!=='win'&&type!=='retreat'&&!quiet()){
        c.globalAlpha=.25;NinjaBattleArt.draw(c,kind,state.stage,pose,frame,x-5*scale,y,scale,false);c.globalAlpha=1;
      }
      if(hero&&type==='clone'&&!quiet()){
        c.globalAlpha=.3;NinjaBattleArt.draw(c,kind,state.stage,'slash',frame,x-8*scale,y-2*scale,scale,false);
        c.globalAlpha=.45;NinjaBattleArt.draw(c,kind,state.stage,'slash',frame,x+8*scale,y-scale,scale,false);c.globalAlpha=1;
      }
      if(hero&&state.stage>=3&&!quiet()&&type==='idle'){
        for(var j=0;j<5;j++)NinjaBattleArt.rect(c,state.stage===4?'#dcc27f':'#a1c6c5',x+(14+j*8)*scale,y+(50-Math.floor((now/160+j*9)%42))*scale,scale,scale);
      }
      // Enemy sprites occupy 64px; hero is drawn in a 64px cell into a 96px scenery canvas.
      NinjaBattleArt.draw(c,kind,state.stage,pose,frame,x,y,scale,!hero);
      c.save();c.scale(canvas.width/96,canvas.width/96);
      if(type==='retreat'&&hero)effect(c,'smoke',t,true);
      else if(type!=='idle'&&(type!=='win'||t<.25))effect(c,type,t,hero);
      c.restore();
    });
  }
  function complete(){
    if(!pending)return;
    var p=pending;pending=null;clearTimeout(finishTimer);finishTimer=0;animation=null;
    skip.hidden=true;stopDraw();
    if(p.session===sess&&_currentScreen==='practice'){state.ended=true;p.done();}
  }
  function finish(completed,done){
    begin();if(!state||state.ended)return false;if(pending)return true;
    var record=sessMode==='mugen'||sessMode==='shinsoku';
    state.outcome=completed&&sessMode!=='mugen'?'win':record?'retreat':'';
    if(completed&&sessMode!=='mugen')state.hp=0;
    if(result){result.hidden=!record;result.textContent='倒した敵：'+(sessMode==='mugen'?state.kills:completed?1:0)+'体';}
    sync();update();
    if(!state.outcome||root.hidden){state.ended=true;return false;}
    pending={session:sess,done:done};
    animation={type:state.outcome,start:performance.now(),duration:quiet()?350:1400};
    skip.hidden=false;skip.textContent='結果へ進む ›';
    // Watchdog also resolves when requestAnimationFrame is throttled.
    finishTimer=setTimeout(complete,quiet()?400:1550);update();startDraw();return true;
  }
  function cancel(reset){
    clearTimeout(finishTimer);finishTimer=0;pending=null;animation=null;stopDraw();
    if(root)root.hidden=true;if(skip)skip.hidden=true;
    var p=document.getElementById('practice');if(p){p.classList.remove('battle-layout');p.style.removeProperty('--battle-offset');}
    if(reset)state=null;
  }
  function leave(){cancel(true);}
  function safe(fn){try{return fn();}catch(e){unavailable=true;cancel(false);console.warn('Battle decoration disabled:',e);return false;}}
  function init(){
    root=document.createElement('div');root.id='ninja-battle';root.hidden=true;root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="battle-wing battle-wing-left"><canvas width="96" height="108"></canvas><div class="battle-caption"></div></div><div class="battle-wing battle-wing-right"><div class="battle-enemy-info"><span></span><small>修行の進みぐあい</small><div class="battle-hp"><span></span></div></div><canvas width="96" height="108"></canvas></div>';
    document.body.appendChild(root);left=root.querySelector('.battle-wing-left canvas');right=root.querySelector('.battle-wing-right canvas');
    name=root.querySelector('.battle-enemy-info>span');hp=root.querySelector('.battle-hp span');caption=root.querySelector('.battle-caption');
    skip=document.createElement('button');skip.type='button';skip.id='battle-skip';skip.hidden=true;skip.onclick=complete;document.body.appendChild(skip);
    result=document.createElement('p');result.id='battle-result';result.hidden=true;document.getElementById('rs2').after(result);
    var settings=document.createElement('fieldset');settings.id='battle-settings';settings.className='learning-settings';
    settings.innerHTML='<legend>忍者のバトル演出</legend><label>動きかた <select id="battle-mode"><option value="normal">通常</option><option value="quiet">ひかえめ</option><option value="off">オフ</option></select></label><p>横長で、両端に余白がある画面に表示します。ヒントを開いている間はお休みします。</p>';
    document.getElementById('settings').appendChild(settings);
    var select=settings.querySelector('select');select.value=mode();select.onchange=function(){learningPrefs.battle=select.value;saveLearningPrefs();sync();};
    var oldSettings=SCREEN_ENTER_HANDLERS.settings;
    SCREEN_ENTER_HANDLERS.settings=function(){if(oldSettings)oldSettings();select.value=mode();};
    window.addEventListener('resize',scheduleSync);document.addEventListener('visibilitychange',scheduleSync);
    window.addEventListener('ninja-battle-art-ready',scheduleSync);
    reduced.addEventListener('change',scheduleSync);
    // Watch only the controls that can hide battle; never replay hidden events.
    var observer=new MutationObserver(scheduleSync);
    ['hint-box','recitation-overlay','countdown-overlay'].forEach(function(id){var el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['style','hidden','class']});});
    new ResizeObserver(scheduleSync).observe(document.querySelector('.practice-answer-panel'));
  }
  window.NinjaBattle={
    prepare:function(){safe(prepare);},
    question:function(){safe(question);},answer:function(ok){safe(function(){answer(ok);});},miss:function(){safe(miss);},
    finish:function(completed,done){return safe(function(){return finish(completed,done);});},leave:function(){safe(leave);},
    sync:function(){safe(sync);},snapshot:function(){return state?{hp:state.hp,progress:state.progress,streak:state.streak,kills:state.kills,stage:state.stage,enemy:state.enemy.slice(),outcome:state.outcome,ended:state.ended,visible:!!root&&!root.hidden,action:animation?animation.type:'idle',finishing:!!pending}:null;}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){safe(init);});else safe(init);
})();
