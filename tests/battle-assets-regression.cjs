const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:8873';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const p=await browser.newPage();await p.route('https://**/*',r=>r.abort());await p.goto(base+'/tashizan_ninja.html?skip-startup=1');
 await p.evaluate(()=>{for(let s=1;s<=4;s++)NinjaBattleArt.sheet('hero',s);for(const k of ['ninja','samurai','oni','tengu','serpent','dragon','master','dummy'])NinjaBattleArt.sheet(k,1);});
 await p.waitForFunction(()=>Object.values(NinjaBattleArt.status()).length===12&&Object.values(NinjaBattleArt.status()).every(s=>s==='ready'));
 const frames=await p.evaluate(()=>{
  const out=[];for(const [kind,stage]of [...[1,2,3,4].map(s=>['hero',s]),...['ninja','samurai','oni','tengu','serpent','dragon','master','dummy'].map(k=>[k,1])]){
   const sheet=NinjaBattleArt.sheet(kind,stage),c=sheet.getContext('2d');
   const rows=(kind==='hero'?['idle','slash','throw','clone','hurt','win','smoke']:['idle','slash','hurt','defeat','bow']).map(pose=>NinjaBattleArt.poses.indexOf(pose));
   for(const row of rows)for(let frame=0;frame<4;frame++){
    const d=c.getImageData(frame*64,row*64,64,64).data;let count=0,bottom=-1;
    for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(d[(y*64+x)*4+3]>32){count++;bottom=y;}
    out.push({kind,stage,row,frame,count,bottom});
   }
  }return out;
 });
 for(const f of frames){assert(f.count>0,JSON.stringify(f));assert(f.count<64*64*.9,`transparent padding: ${JSON.stringify(f)}`);assert(f.bottom<=58,`feet anchor: ${JSON.stringify(f)}`);}
 assert.equal(frames.length,272);console.log('PASS: 12 generated PNG sheets, 272 animation cells, real alpha padding and common feet anchor, all assets loaded');
 const diagnostics=await p.evaluate(()=>[...[1,2,3,4].map(s=>NinjaBattleArt.diagnostics('hero',s)),...['ninja','samurai','oni','tengu','serpent','dragon','master','dummy'].map(k=>NinjaBattleArt.diagnostics(k,1))]);
 for(const [i,d]of diagnostics.entries()){
  assert.equal(d.coveredPixels,d.sourcePixels,`source pixels lost in sheet ${i}`);
  assert(d.cutPixels<=(i===5?8:0),`opaque separation seam in sheet ${i}: ${d.cutPixels}`);
 }
 const box=(sheet,pose,frame)=>diagnostics[sheet].frames.find(f=>f.pose===pose&&f.frame===frame).box;
 assert(box(0,'slash',1).x+box(0,'slash',1).w>=511,'Lv.1 extended blade must survive beyond the old column boundary');
 assert(box(0,'throw',2).y+box(0,'throw',2).h>=714,'Lv.1 throwing feet must survive below the old row boundary');
 assert(box(3,'slash',2).w>270,'Lv.4 long slash must not be cropped to a quarter sheet');
 assert(box(2,'throw',1).x+box(2,'throw',1).w>=517,'Lv.3 detached shuriken must belong to the second frame');
 assert(box(2,'throw',2).x>=500,'Lv.3 next frame must not contain the previous shuriken');
 assert(box(0,'smoke',1).x+box(0,'smoke',1).w>=493,'Lv.1 thrown smoke bomb must belong to the second frame');
 assert(box(10,'slash',0).y+box(10,'slash',0).h>=580,'master attack feet must survive below the old row boundary');
 console.log('PASS: all original opaque pixels retained; extended blades, throwing feet and detached props assigned to complete frames');
 const preview=await browser.newPage();const previewErrors=[];preview.on('pageerror',e=>previewErrors.push(e.message));
 await preview.goto(base+'/img/battle/preview.html');await preview.waitForFunction(()=>document.getElementById('contact')?.height===1512);
 await preview.locator('#character').selectOption('hero3');await preview.locator('#pose').selectOption('throw');
 await preview.waitForFunction(()=>document.getElementById('status').textContent.includes('603256 / 603256'));
 await preview.locator('label').filter({hasText:'切り出し境界'}).locator('input').uncheck();
 await preview.locator('#character').selectOption('master');await preview.waitForFunction(()=>document.getElementById('contact')?.height===1080);
 assert.deepEqual(previewErrors,[]);await preview.screenshot({path:'tests/battle-sprite-preview.png',fullPage:true});
 console.log('PASS: source seam overlay, all-frame contact sheet and character switching in preview');
 const missing=await browser.newPage({viewport:{width:1280,height:720}});
 await missing.route('https://**/*',r=>r.abort());await missing.route('**/img/battle/*.png',r=>r.abort());
 await missing.goto(base+'/tashizan_ninja.html?skip-startup=1');
 await missing.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;fxSettings.fx_perfect=false;voiceOn=false;sfxOn=false;launchSession([{a:2,b:3,ans:5}],'normal');hideCountdownOverlay();showP();});
 await missing.waitForFunction(()=>Object.values(NinjaBattleArt.status()).some(s=>s==='failed'));
 assert.equal(await missing.evaluate(()=>NinjaBattle.snapshot().visible),true);
 await missing.evaluate(()=>{chk(5,null,sess.queue[0]);clearNextQuestionTimer();sess.idx=1;showP();});
 await missing.locator('#battle-skip').click();await missing.waitForFunction(()=>_currentScreen==='result');
 assert.equal(await missing.evaluate(()=>sess.results.length),1);console.log('PASS: failed PNG requests fall back and preserve accepted answer and result');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
