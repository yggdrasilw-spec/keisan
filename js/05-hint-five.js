// Deterministic teaching motion: positions are interpolated, never CSS-dependent.
(function () {
  'use strict';
  var method='ten', busy=false, frame=0, generation=0;
  var originalDraw=hintDraw, originalAnimate=hintAnimate, originalSet=hintSetProblem;
  var originalToggle=toggleHint, originalReset=hintReset;
  var ns='http://www.w3.org/2000/svg';
  var next=document.querySelector('[data-action="hintNext"]');
  function eligible(){return hintP && Number.isInteger(hintP.a) && Number.isInteger(hintP.b) && hintP.a>=5 && hintP.a<=9 && hintP.b>=5 && hintP.b<=9;}
  function lock(value){busy=value;next.disabled=value;next.textContent=value?'うごきを みよう':'▶ つぎへ';document.getElementById('hint-board').setAttribute('aria-busy',String(value));}
  function cancel(){generation++;cancelAnimationFrame(frame);document.querySelectorAll('[data-moving]').forEach(function(n){n.removeAttribute('data-moving');});lock(false);}
  window.cancelHintMotion=cancel;
  function sync(){document.getElementById('hint-methods').hidden=!eligible();['ten','five'].forEach(function(v){document.getElementById('hint-'+v).setAttribute('aria-pressed',String(method===v));});}
  function el(tag,attrs,text){var e=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){e.setAttribute(k,attrs[k]);});if(text!==undefined)e.textContent=text;return e;}
  function point(side,i,stage){
    var x=54+side*210+(i%5)*23,y=i<5?70:110;
    if(stage>=1 && i>=5)y=139;
    if(stage>=2 && i<5){x=54+i*23;y=70+side*28;}
    if(stage>=3 && i>=5){var idx=i-5+(side?hintP.a-5:0);x=264+(idx%5)*23;y=76+Math.floor(idx/5)*28;}
    if(stage===4)x+=i<5?16:-16;
    return {x:x,y:y};
  }
  function textFor(stage){
    var a=hintP.a,b=hintP.b,r=a+b-10;
    return [a+' と '+b+'。５の かたまりを さがそう。',a+' は ５と'+(a-5)+'、'+b+' は ５と'+(b-5)+'。','５と５で 10を つくろう！','のこりの '+(a-5)+' と '+(b-5)+' で '+r+'。','10と '+r+' を あわせて '+(a+b)+' だね！'][stage];
  }
  function label(stage){
    var a=hintP.a,b=hintP.b,r=a+b-10;
    document.getElementById('five-equation').textContent=stage===4?'10 ＋ '+r+' ＝ '+(a+b):a+' ＋ '+b;
    document.getElementById('five-left-label').textContent=stage>=2?'５ ＋ ５ ＝ 10':stage===1?'５ と '+(a-5):a;
    document.getElementById('five-right-label').textContent=stage>=3?(a-5)+' ＋ '+(b-5)+' ＝ '+r:stage===2?'のこり':stage===1?'５ と '+(b-5):b;
    document.getElementById('five-ten-frame').setAttribute('opacity',stage>=2?'1':'0');
    document.getElementById('five-rest-frame').setAttribute('opacity',stage>=3?'1':'0');
    document.getElementById('five-ten-frame').setAttribute('x',stage===4?53:37);
    document.getElementById('five-rest-frame').setAttribute('x',stage===4?231:247);
    document.getElementById('hint-msg').textContent=textFor(stage);
  }
  function drawFive(){
    var board=document.getElementById('hint-board');board.innerHTML='';
    var svg=el('svg',{viewBox:'0 0 420 205',class:'five-hint-svg',role:'img','aria-label':hintP.a+'と'+hintP.b+'を５のまとまりで考える'});board.appendChild(svg);
    svg.appendChild(el('rect',{id:'five-ten-frame',x:37,y:53,width:126,height:63,rx:10,fill:'#fff2cb',stroke:'#c58a22','stroke-width':2,opacity:0}));
    svg.appendChild(el('rect',{id:'five-rest-frame',x:247,y:59,width:126,height:63,rx:10,fill:'#f3f5f8',stroke:'#9aa9bb','stroke-width':2,opacity:0}));
    [hintP.a,hintP.b].forEach(function(n,side){for(var i=0;i<n;i++){var p=point(side,i,hintStep);svg.appendChild(el('circle',{id:'five-dot-'+side+'-'+i,cx:p.x,cy:p.y,r:9,fill:side?'#e7504f':'#258bd7',stroke:side?'#a22424':'#12639c','stroke-width':1}));}});
    svg.appendChild(el('text',{id:'five-equation',x:210,y:27,'text-anchor':'middle','font-size':21}));
    svg.appendChild(el('text',{id:'five-left-label',x:110,y:184,'text-anchor':'middle','font-size':18}));
    svg.appendChild(el('text',{id:'five-right-label',x:308,y:184,'text-anchor':'middle','font-size':18}));label(hintStep);
  }
  // Move a group as one unit. A short pause before and after lets children follow it.
  function tween(moves,duration,done){
    var token=generation,start=null;
    moves.forEach(function(m){m.node.style.transition='none';m.node.setAttribute('data-moving','true');});
    function tick(now){
      if(token!==generation)return;
      if(start===null)start=now;
      var t=Math.max(0,Math.min(1,(now-start-240)/duration)),ease=t*t*(3-2*t);
      moves.forEach(function(m){var x=m.from.x+(m.to.x-m.from.x)*ease,y=m.from.y+(m.to.y-m.from.y)*ease;
        if(m.svg){m.node.setAttribute('cx',x);m.node.setAttribute('cy',y);}else{m.node.style.left=x+'px';m.node.style.top=y+'px';}
      });
      if(now-start<duration+580){frame=requestAnimationFrame(tick);return;}
      moves.forEach(function(m){m.node.removeAttribute('data-moving');});done();
    }
    frame=requestAnimationFrame(tick);
  }
  function animateFive(){
    var stage=hintStep,groups=[];
    if(stage===3){groups=[[],[]];}else groups=[[]];
    [hintP.a,hintP.b].forEach(function(n,side){for(var i=0;i<n;i++){
      var dot=document.getElementById('five-dot-'+side+'-'+i),p=point(side,i,stage),from={x:Number(dot.getAttribute('cx')),y:Number(dot.getAttribute('cy'))};
      if(Math.abs(from.x-p.x)+Math.abs(from.y-p.y)>.01)groups[stage===3?side:0].push({node:dot,from:from,to:p,svg:true});
    }});
    document.getElementById('hint-msg').textContent=stage===3?'のこりを、ひとつずつの まとまりで よせよう。':textFor(stage);
    if(typeof hSpeak==='function')hSpeak(document.getElementById('hint-msg').textContent);
    // Frames are shown after arrival, avoiding a destination appearing to jump.
    document.getElementById('five-ten-frame').setAttribute('opacity','0');document.getElementById('five-rest-frame').setAttribute('opacity','0');
    lock(true);
    function run(){if(!groups.length){label(stage);lock(false);return;}var group=groups.shift();if(!group.length)return run();tween(group,stage===4?1500:1900,run);}
    run();
  }
  function animateTen(){
    var board=document.getElementById('hint-board'),positions=[];
    Array.from(board.children).forEach(function(node){if(node.style.left.endsWith('px')&&node.style.top.endsWith('px'))positions.push({node:node,from:{x:parseFloat(node.style.left),y:parseFloat(node.style.top)}});node.style.transition='none';});
    var existing=Array.from(board.children);originalAnimate();
    var moves=[];
    positions.forEach(function(m){if(!m.node.isConnected)return;m.to={x:parseFloat(m.node.style.left),y:parseFloat(m.node.style.top)};if(m.from.x!==m.to.x||m.from.y!==m.to.y){m.node.style.left=m.from.x+'px';m.node.style.top=m.from.y+'px';moves.push(m);}});
    Array.from(board.children).filter(function(n){return existing.indexOf(n)<0;}).forEach(function(n){n.animate([{opacity:0},{opacity:1}],{duration:1200,fill:'backwards'});});
    lock(true);tween(moves,moves.length?1900:800,function(){lock(false);});
  }
  hintDraw=function(){cancel();sync();if(method==='five'&&eligible())drawFive();else originalDraw();};
  hintAnimate=function(){if(method==='five'&&eligible()){if(hintStep>4)hintStep=0;animateFive();}else animateTen();};
  hintNext=function(){if(busy||!hintP||!hintVisible)return;if(method==='ten'&&hintStep>=5)return hintReset();hintStep++;hintAnimate();};
  hintReset=function(){cancel();if(window.speechSynthesis)window.speechSynthesis.cancel();if(method==='five'&&eligible()&&document.querySelector('.five-hint-svg')){hintStep=0;animateFive();}else{
    var previous={};document.querySelectorAll('#hint-board [id^="hOt"],#hint-board [id^="hNt"]').forEach(function(n){previous[n.id]={x:parseFloat(n.style.left),y:parseFloat(n.style.top)};});
    originalReset();var moves=[];Object.keys(previous).forEach(function(id){var node=document.getElementById(id);if(!node)return;var to={x:parseFloat(node.style.left),y:parseFloat(node.style.top)};node.style.transition='none';node.style.left=previous[id].x+'px';node.style.top=previous[id].y+'px';if(previous[id].x!==to.x||previous[id].y!==to.y)moves.push({node:node,from:previous[id],to:to});});
    if(moves.length){lock(true);tween(moves,1900,function(){lock(false);});}
  }};
  hintSetProblem=function(p){cancel();method='ten';originalSet(p);sync();};
  toggleHint=function(){if(hintVisible){cancel();if(window.speechSynthesis)window.speechSynthesis.cancel();hintStep=0;}originalToggle();};
  ['ten','five'].forEach(function(value){document.getElementById('hint-'+value).addEventListener('click',function(){if(value==='five'&&!eligible())return;cancel();if(window.speechSynthesis)window.speechSynthesis.cancel();method=value;hintStep=0;hintDraw();});});
})();
