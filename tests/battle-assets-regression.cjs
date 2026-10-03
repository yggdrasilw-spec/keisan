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
