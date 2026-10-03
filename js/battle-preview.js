// Developer-only inspection of source seams and every normalized animation.
(function(){
  'use strict';
  const raw=document.getElementById('source'),source=document.createElement('canvas');
  source.style.cssText='max-width:400px;width:100%;background:#233046';
  source.setAttribute('aria-label','元画像と切り出し境界');raw.hidden=true;raw.after(source);
  const control=document.createElement('label');
  control.innerHTML='<input type="checkbox" checked>切り出し境界を表示';
  source.before(control);
  const legend=document.createElement('p');legend.textContent='赤：以前の均等分割／青：修正後の境界';source.before(legend);
  const title=document.createElement('h2');title.textContent='全コマ一覧';
  const contact=document.createElement('canvas');contact.id='contact';contact.style.cssText='max-width:100%;image-rendering:pixelated';
  contact.setAttribute('aria-label','全ポーズの切り出し結果');
  document.querySelector('main').append(title,contact);
  let auditedKey='';
  function audit(){
    const value=document.getElementById('character').value,hero=value.startsWith('hero');
    const kind=hero?'hero':value,stage=hero?Number(value.slice(-1)):1;
    const diag=NinjaBattleArt.diagnostics(kind,stage);
    if(!diag||!raw.complete||!raw.naturalWidth)return;
    document.getElementById('status').textContent='生成PNG・'+diag.frames.length+'コマ／元画像の画素保持 '+diag.coveredPixels+' / '+diag.sourcePixels+(diag.cutPixels?'／隣接する絵の接触境界 '+diag.cutPixels+'px':'／境界での切断なし');
    if(auditedKey===value+raw.src)return;auditedKey=value+raw.src;
    source.width=diag.width;source.height=diag.height;
    const c=source.getContext('2d');c.drawImage(raw,0,0);
    if(control.firstChild.checked){
      c.lineWidth=2;c.strokeStyle='#ff5757';c.beginPath();
      for(let x=1;x<4;x++){c.moveTo(diag.width*x/4,0);c.lineTo(diag.width*x/4,diag.height);}
      for(let y=1;y<diag.cuts.length-1;y++){c.moveTo(0,diag.height*y/(diag.cuts.length-1));c.lineTo(diag.width,diag.height*y/(diag.cuts.length-1));}
      c.stroke();c.strokeStyle='#42dcff';c.beginPath();
      diag.cuts.slice(1,-1).forEach(y=>{c.moveTo(0,y);c.lineTo(diag.width,y);});
      diag.rows.forEach((seams,row)=>seams.forEach(seam=>{c.moveTo(seam[0],diag.cuts[row]);seam.forEach((x,y)=>c.lineTo(x,diag.cuts[row]+y));}));c.stroke();
    }
    contact.width=768;contact.height=diag.rows.length*216;
    const cc=contact.getContext('2d');cc.imageSmoothingEnabled=false;
    const sheet=NinjaBattleArt.sheet(kind,stage);
    diag.frames.forEach((f,i)=>{
      const x=i%4*192,y=Math.floor(i/4)*216;
      cc.fillStyle='#d8dccc';cc.fillRect(x,y,192,216);
      cc.drawImage(sheet,f.frame*64,NinjaBattleArt.poses.indexOf(f.pose)*64,64,64,x,y,192,192);
      cc.fillStyle='#223047';cc.font='14px system-ui';cc.fillText(names[f.pose]+' '+(f.frame+1),x+8,y+208);
    });
  }
  const baseDraw=draw;draw=function(){baseDraw();audit();};
  raw.addEventListener('load',()=>{auditedKey='';draw();});
  control.firstChild.onchange=()=>{auditedKey='';draw();};
  window.addEventListener('ninja-battle-art-ready',()=>{auditedKey='';draw();});
  draw();
})();
