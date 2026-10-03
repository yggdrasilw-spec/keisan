const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage();page.on('pageerror',e=>console.log('PREVIEW ERROR',e.message));await page.goto((process.env.QA_BASE||'http://127.0.0.1:8878')+'/img/battle/preview.html');
 await page.evaluate(()=>{for(let s=1;s<=4;s++)NinjaBattleArt.sheet('hero',s);for(const k of ['ninja','samurai','oni','tengu','serpent','dragon','master','dummy'])NinjaBattleArt.sheet(k,1);});
 await page.waitForFunction(()=>Object.values(NinjaBattleArt.status()).length===12&&Object.values(NinjaBattleArt.status()).every(s=>s==='ready'));
 const results=await page.evaluate(async()=>{const out=[];
 for(const name of ['hero-1','hero-2','hero-3','hero-4','ninja','samurai','oni','tengu','serpent','dragon','master','dummy']){
 const im=new Image();im.src='./img/battle/'+name+'.png';await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const d=ctx.getImageData(0,0,c.width,c.height).data,w=c.width,h=c.height,rows=name.startsWith('hero')?7:5,projection=[];
 for(let y=0;y<h;y++){let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>32)n++;projection.push(n);}
 const cuts=[0];for(let r=1;r<rows;r++){const target=Math.round(h*r/rows),range=Math.round(h/rows*.22);let best=target,score=Infinity;for(let y=target-range;y<=target+range;y++){const s=projection[y]*10000+Math.abs(y-target);if(s<score){score=s;best=y;}}cuts.push(best);}cuts.push(h);
 const rowInfo=[];
 for(let r=0;r<rows;r++){const y0=cuts[r],y1=cuts[r+1],visited=new Uint8Array(w*(y1-y0)),components=[];
 for(let yy=y0;yy<y1;yy++)for(let xx=0;xx<w;xx++){const start=(yy-y0)*w+xx;if(visited[start]||d[(yy*w+xx)*4+3]<=32)continue;const stack=[start];visited[start]=1;let minX=xx,maxX=xx,minY=yy,maxY=yy,count=0;
 while(stack.length){const p=stack.pop(),x=p%w,y=y0+Math.floor(p/w);count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=x+dx,ny=y+dy;if(nx<0||nx>=w||ny<y0||ny>=y1)continue;const q=(ny-y0)*w+nx;if(!visited[q]&&d[(ny*w+nx)*4+3]>32){visited[q]=1;stack.push(q);}}}
 if(count>100)components.push({x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1,count});}
 rowInfo.push(components.sort((a,b)=>a.x-b.x));}
 const kind=name.startsWith('hero')?'hero':name,stage=kind==='hero'?Number(name.slice(-1)):1,diag=NinjaBattleArt.diagnostics(kind,stage);
 const sheet=NinjaBattleArt.sheet(kind,stage),contact=document.createElement('canvas');contact.width=768;contact.height=rows*216;const cc=contact.getContext('2d');cc.imageSmoothingEnabled=false;
 for(let row=0;row<rows;row++)for(let frame=0;frame<4;frame++){const pose=diag.frames[row*4].pose;cc.fillStyle='#d8dccc';cc.fillRect(frame*192,row*216,192,216);cc.drawImage(sheet,frame*64,NinjaBattleArt.poses.indexOf(pose)*64,64,64,frame*192,row*216,192,192);cc.fillStyle='#1b293d';cc.font='14px sans-serif';cc.fillText(pose+' '+(frame+1),frame*192+8,row*216+208);}
 out.push({name,w,h,cuts,rows:rowInfo,diag,contact:contact.toDataURL('image/png')});}return out;});
 for(const r of results){fs.writeFileSync('tests/battle-contact-'+r.name+'.png',Buffer.from(r.contact.split(',')[1],'base64'));delete r.contact;}
 fs.writeFileSync('tests/battle-sprite-audit.json',JSON.stringify(results,null,2));
 for(const r of results)console.log(r.name,'grid cuts',r.diag.gridCutPixels,'seam cuts',r.diag.cutPixels,'coverage',r.diag.coveredPixels+'/'+r.diag.sourcePixels);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
