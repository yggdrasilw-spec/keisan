// Existing basic-activity decisions drive an optional, disposable decoration.
(function(){
  'use strict';
  var state=null,root,left,right,name,hp,caption,raf=0,timer=0,unavailable=false;
  var media=matchMedia('(prefers-reduced-motion: reduce)');
  function mode(){try{var p=JSON.parse(localStorage.getItem('tashizan_learning_v1'))||{};return ['normal','quiet','off'].indexOf(p.battle)>=0?p.battle:'normal';}catch(e){return 'normal';}}
  function quiet(){return mode()==='quiet'||media.matches;}
  function stage(){try{var n=parent.getUnlockedAchievementCount().totalOn,index=1;parent.ACH_STAGES.forEach(function(s,i){if(n>=s.min)index=i+1;});return index;}catch(e){return 1;}}
  function rectVisible(el){if(!el)return null;var r=el.getBoundingClientRect();return r.width&&r.height?r:null;}
  function sync(){
    if(!root)return;
    var visible=state&&!unavailable&&mode()!=='off'&&!document.hidden&&innerWidth>=960&&innerHeight>=540&&innerWidth/innerHeight>4/3;
    // Keep the entire teaching area unchanged. Use only genuinely spare margins.
    var area=rectVisible(document.getElementById('screen-game'))||rectVisible(document.getElementById('game-screen'))||rectVisible(document.getElementById('screen-result'))||rectVisible(document.getElementById('result-screen'));
    visible=visible&&!!area&&area.left>=222&&area.right<=innerWidth-222;
    if(document.body.classList.contains('hint-on'))visible=false;
    var wasHidden=root.hidden;root.hidden=!visible;
    if(!visible){if(raf)cancelAnimationFrame(raf);raf=0;if(state)state.action=null;}
    else{if(wasHidden)state.action=null;draw(performance.now());if(!quiet()||state.action)run();}
  }
  function run(){if(!raf&&!root.hidden)raf=requestAnimationFrame(function(now){raf=0;safe(function(){draw(now);if(!quiet()||state.action)run();});});}
  function draw(now){
    if(!state)return;
    var action=state.action,type=action?action.type:'idle',t=action?Math.min(1,(now-action.start)/action.duration):0;
    if(t===1){state.action=null;type='idle';if(state.ended){root.hidden=true;return;}}
    var frame=type==='idle'?(quiet()?0:Math.floor(now/280)%4):Math.min(3,Math.floor(t*4));
    root.dataset.hp=state.hp;root.dataset.action=type;hp.style.width=state.hp+'%';name.textContent='道場の木人';caption.textContent=state.ended?'修行達成！':'Lv.'+state.stage+' にんじゃ';
    [left,right].forEach(function(canvas,i){
      var c=canvas.getContext('2d');if(!c)throw new Error('Battle canvas unavailable');
      c.clearRect(0,0,192,216);c.imageSmoothingEnabled=false;
      NinjaBattleArt.rect(c,'#b49d77',12,88,6,111);NinjaBattleArt.rect(c,'#b49d77',174,88,6,111);NinjaBattleArt.rect(c,'#ddd0ad',0,86,192,4);
      NinjaBattleArt.rect(c,'#97866c',0,198,192,3);NinjaBattleArt.rect(c,'#dac5a0',0,201,192,15);
      for(var k=0;k<6;k++)NinjaBattleArt.rect(c,'#b49c78',k*32,210,2,6);
      var hero=i===0,scale=hero?2:3,x=hero?32:0,y=hero?82:24,pose=type;
      if(type==='win')pose=hero?'win':'bow';else if(type==='hurt')pose=hero?'hurt':'slash';else if(!hero)pose=type==='idle'?'idle':'hurt';
      if(hero&&type==='clone'&&!quiet()){
        c.globalAlpha=.35;NinjaBattleArt.draw(c,'hero',state.stage,'slash',frame,x-16,y,scale,false);NinjaBattleArt.draw(c,'hero',state.stage,'slash',frame,x+16,y-4,scale,false);c.globalAlpha=1;
      }
      NinjaBattleArt.draw(c,hero?'hero':'dummy',state.stage,pose,frame,x,y,scale,!hero);
      if(type==='throw')NinjaBattleArt.star(c,130+Math.round(t*30),104,'#bfd8dd');
      if(type==='slash'||type==='clone')NinjaBattleArt.poly(c,'#e9d28b',[[82,87],[126,101],[152,148],[135,138],[117,107]]);
    });
  }
  function react(type){
    if(!state)return;state.action=root&&!root.hidden?{type:type,start:performance.now(),duration:type==='win'?(quiet()?300:1300):(quiet()?230:480)}:null;
    if(root&&!root.hidden){draw(performance.now());run();}
  }
  function event(e){safe(function(){var data=e.data;
    if(e.type==='start'){
      clearTimeout(timer);state={total:Math.max(1,Number(data.total)||1),progress:0,hp:100,streak:0,stage:stage(),seen:new Set(),action:null,ended:false};sync();
    }else if(e.type==='answer'&&state&&!state.ended){
      if(data.advance!==false){if(state.seen.has(data.index))return;state.seen.add(data.index);state.progress++;state.hp=Math.max(0,100*(1-state.progress/state.total));}
      state.streak=data.ok?state.streak+1:0;react(data.ok?state.streak>=5?'clone':state.streak>=3?'throw':'slash':'hurt');
    }else if(e.type==='finish'&&state){
      state.ended=true;state.hp=0;sync();react('win');clearTimeout(timer);
      timer=setTimeout(function(){root.hidden=true;if(raf)cancelAnimationFrame(raf);raf=0;},quiet()?350:1400);
    }else if(e.type==='leave'){
      clearTimeout(timer);state=null;if(root)root.hidden=true;if(raf)cancelAnimationFrame(raf);raf=0;
    }
  });}
  function safe(fn){try{fn();}catch(e){unavailable=true;if(root)root.hidden=true;if(raf)cancelAnimationFrame(raf);raf=0;console.warn('Basic battle decoration disabled:',e);}}
  function init(){
    var css=document.createElement('link');css.rel='stylesheet';css.href='./css/10-battle.css';document.head.appendChild(css);
    root=document.createElement('div');root.id='ninja-battle';root.hidden=true;root.setAttribute('aria-hidden','true');
    root.innerHTML='<div class="battle-wing battle-wing-left"><canvas width="192" height="216"></canvas><div class="battle-caption"></div></div><div class="battle-wing battle-wing-right"><div class="battle-enemy-info"><span></span><small>修行の進みぐあい</small><div class="battle-hp"><span></span></div></div><canvas width="192" height="216"></canvas></div>';
    root.querySelectorAll('.battle-wing').forEach(function(el){el.style.width='192px';el.style.height='252px';});root.querySelectorAll('canvas').forEach(function(el){el.style.width='192px';el.style.height='216px';});
    document.body.appendChild(root);left=root.querySelector('.battle-wing-left canvas');right=root.querySelector('.battle-wing-right canvas');hp=root.querySelector('.battle-hp span');name=root.querySelector('.battle-enemy-info>span');caption=root.querySelector('.battle-caption');
    window.NinjaKisoBattle={event:event,sync:function(){safe(sync);},snapshot:function(){return state?{hp:state.hp,progress:state.progress,total:state.total,streak:state.streak,ended:state.ended,visible:!root.hidden}:null;}};
    window.takeNinjaKisoBattleEvents().forEach(event);
    ['resize','storage'].forEach(function(type){window.addEventListener(type,function(){safe(sync);});});
    window.addEventListener('ninja-battle-art-ready',function(){safe(sync);});
    window.addEventListener('pagehide',function(){event({type:'leave',data:{}});});document.addEventListener('visibilitychange',function(){safe(sync);});media.addEventListener('change',function(){safe(sync);});
    new ResizeObserver(function(){safe(sync);}).observe(document.body);
    var screenObserver=new MutationObserver(function(){safe(sync);});
    ['screen-game','game-screen','screen-result','result-screen','screen-gameover'].forEach(function(id){var el=document.getElementById(id);if(el)screenObserver.observe(el,{attributes:true,attributeFilter:['class','style']});});
    screenObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){safe(init);});else safe(init);
})();
