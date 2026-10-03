const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:8873';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:720}}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.goto(base+'/tashizan_ninja.html?skip-startup=1');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;fxSettings.fx_perfect=false;voiceOn=false;sfxOn=false;});
 async function start(count=20,mode='normal',level='easy'){
  await page.evaluate(({count,mode,level})=>{
   clearRuntimeTimers();learningPrefs.recite='off';learningPrefs.battle='normal';curLevel=level;
   launchSession(Array.from({length:count},(_,i)=>({a:2,b:3,ans:5})),mode);hideCountdownOverlay();showP();NinjaBattle.sync();
  },{count,mode,level});await page.waitForTimeout(180);
 }
 const snap=()=>page.evaluate(()=>NinjaBattle.snapshot());
 const answer=ok=>page.evaluate(ok=>{chk(ok?5:0,null,sess.queue[sess.idx]);clearNextQuestionTimer();},ok);
 const next=()=>page.evaluate(()=>{sess.idx++;showP();});
 // Real rendered geometry, including all input methods and the hint button.
 for(const [width,height]of [[960,540],[1280,720],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});await start();
  for(const tab of ['btn','calc','hw']){
   await page.evaluate(tab=>{setAnsTab(tab);NinjaBattle.sync();},tab);await page.waitForTimeout(130);
   assert((await snap()).visible,`${width} ${tab}: battle should fit`);
   const sizes=await page.evaluate(()=>{
    const ids=['pcard',_currentAnsTab==='calc'?'calcgrid':_currentAnsTab==='hw'?'hw-area':'agrid'];
    const wings=[...document.querySelectorAll('.battle-wing')].map(e=>e.getBoundingClientRect().toJSON());
    const controls=ids.map(id=>({id,...document.getElementById(id).getBoundingClientRect().toJSON()}));
    const hit=controls.some(c=>wings.some(w=>c.left<w.right&&c.right>w.left&&c.top<w.bottom&&c.bottom>w.top));
    const old=controls.map(c=>({width:c.width,height:c.height}));learningPrefs.battle='off';NinjaBattle.sync();
    const off=ids.map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {width:r.width,height:r.height};});
    learningPrefs.battle='normal';NinjaBattle.sync();return {hit,old,off,scroll:document.getElementById('app').scrollHeight-document.getElementById('app').clientHeight};
   });
   assert.equal(sizes.hit,false);assert(sizes.scroll<=1);sizes.old.forEach((s,i)=>{assert(Math.abs(s.width-sizes.off[i].width)<1);assert(Math.abs(s.height-sizes.off[i].height)<1);});
   await page.locator('#hint-btn').click();await page.waitForTimeout(60);assert.equal((await snap()).visible,false);
   await page.locator('#hint-btn').click();await page.waitForTimeout(60);assert.equal((await snap()).visible,true);
  }
  await page.evaluate(()=>setAnsTab('btn'));await page.waitForTimeout(100);
  await page.screenshot({path:`tests/battle-${width}.png`});
 }
 console.log('PASS: four landscape sizes, three inputs, unchanged control sizes, no overlap, hint opens by actual click');
 await page.setViewportSize({width:390,height:844});await start();assert.equal((await snap()).visible,false);
 await page.setViewportSize({width:900,height:600});await page.waitForTimeout(100);assert.equal((await snap()).visible,false);
 await page.setViewportSize({width:1280,height:720});await start();
 await answer(true);assert.equal((await snap()).progress,1);assert.equal((await snap()).hp,95);
 await page.evaluate(()=>chk(5,null,sess.queue[0]));assert.equal((await snap()).progress,1);assert.equal(await page.evaluate(()=>sess.results.length),1);
 for(let i=1;i<5;i++){await next();await answer(true);}
 assert.equal((await snap()).streak,5);assert.equal((await snap()).action,'clone');
 await next();await answer(false);assert.equal((await snap()).streak,0);assert.equal((await snap()).hp,70);assert.equal((await snap()).action,'hurt');
 await page.evaluate(()=>toggleHint());await page.waitForTimeout(60);await next();await answer(true);
 await page.evaluate(()=>toggleHint());await page.waitForTimeout(60);assert.equal((await snap()).action,'idle');assert.equal((await snap()).progress,7);
 // Retried handwritten misses do not manufacture recorded answers or progress.
 await page.evaluate(()=>{setAnsTab('hw');hwCheckAnswer(0);});assert.equal((await snap()).streak,0);assert.equal((await snap()).progress,7);
 await page.evaluate(()=>hwCheckAnswer(null));assert.equal((await snap()).progress,7);
 console.log('PASS: accepted-answer deduplication, combo and miss, hidden events discarded, handwriting retry/unknown');
 for(const count of [1,7,20]){
  await start(count);for(let i=0;i<count;i++){if(i)await next();await answer(i%2===0);}
  assert.equal((await snap()).hp,0);await page.evaluate(()=>{sess.idx=sess.queue.length;showP();});
  assert.equal((await snap()).outcome,'win');assert.equal((await snap()).finishing,true);
  if(count===20)await page.screenshot({path:'tests/battle-win.png'});
  await page.locator('#battle-skip').click();await page.waitForFunction(()=>_currentScreen==='result');
  assert.equal(await page.evaluate(()=>sess.results.length),count);
 }
 await start(20);await answer(true);await page.evaluate(()=>endSess());assert.equal(await page.evaluate(()=>_currentScreen),'result');
 await start(1);await answer(true);await page.evaluate(()=>{learningPrefs.battle='off';NinjaBattle.sync();sess.idx=1;showP();});assert.equal(await page.evaluate(()=>_currentScreen),'result');
 await start(1);await answer(true);await page.evaluate(()=>{sess.idx=1;showP();});await page.waitForFunction(()=>_currentScreen==='result');
 await start(1);await answer(true);await page.evaluate(()=>{sess.idx=1;showP();show('home');});await page.waitForTimeout(1700);assert.equal(await page.evaluate(()=>_currentScreen),'home');assert.equal(await page.locator('#battle-skip').isVisible(),false);
 console.log('PASS: variable course HP, imperfect completion wins, tap skip, automatic end, quit/off immediate, navigation cancels stale finish');
 await start(1000,'mugen');
 for(let i=0;i<21;i++){if(i)await next();await answer(true);}
 assert.equal((await snap()).kills,4);assert.equal((await snap()).hp,80);assert.equal((await snap()).progress,21);
 await next();await answer(false);assert.equal((await snap()).outcome,'retreat');assert.equal((await snap()).kills,4);assert.equal((await snap()).progress,21);
 await page.locator('#battle-skip').click();await page.waitForFunction(()=>_currentScreen==='result');assert((await page.locator('#battle-result').innerText()).includes('4体'));
 await start(2,'shinsoku');const limit=await page.evaluate(()=>sess.specialQuestionLimitMs);await answer(true);await next();assert.equal(await page.evaluate(()=>sess.specialQuestionLimitMs),limit);
 await answer(true);await page.evaluate(()=>{sess.idx=2;showP();});assert.equal((await snap()).outcome,'win');await page.locator('#battle-skip').click();
 await start(2,'shinsoku');await page.evaluate(()=>{sess.specialQuestionDeadlineMs=Date.now()-1;chk(5,null,sess.queue[0]);});assert.equal((await snap()).outcome,'retreat');assert.equal(await page.evaluate(()=>sess.results.length),0);await page.locator('#battle-skip').click();
 console.log('PASS: infinite five-question enemies and 20-question boss cycle, terminal miss not counted, speed limit unchanged, speed completion/timeout');
 await start(2,'kotsu');assert.equal((await snap()).enemy[0],'master');
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(60);
 const image=()=>page.locator('.battle-wing-left canvas').evaluate(e=>e.toDataURL());
 const calm=await image();await page.waitForTimeout(500);assert.equal(await image(),calm);await page.emulateMedia({reducedMotion:'no-preference'});
 await page.evaluate(()=>show('settings'));await page.locator('#battle-mode').selectOption('quiet');
 assert.equal(await page.evaluate(()=>collectAppSnapshot().storage.learningPrefs.battle),'quiet');await page.reload();assert.equal(await page.evaluate(()=>learningPrefs.battle),'quiet');
 // A broken optional art module cannot break question/answer/result paths.
 await page.evaluate(()=>{NinjaBattleArt.draw=()=>{throw new Error('deliberate unavailable art')};});
 await start(1);assert.equal((await snap()).visible,false);await answer(true);await page.evaluate(()=>{sess.idx=1;showP();});assert.equal(await page.evaluate(()=>_currentScreen),'result');
 assert.deepEqual(errors,[]);console.log('PASS: training partner, reduced motion, saved setting/backup, art failure leaves learning functional, no page errors');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
