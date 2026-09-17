const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',route=>route.abort());
 await page.goto('http://127.0.0.1:8873/tashizan_ninja.html');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;fxSettings.fx_perfect=false;voiceOn=false;sfxOn=false;});
 async function start(mode='normal',count=2){
  await page.evaluate(({mode,count})=>{if(recitationActive()) {recitationState=null;document.getElementById('recitation-overlay').hidden=true;document.getElementById('app').inert=false;}clearRuntimeTimers();fxSettings.fx_wipe=false;fxSettings.fx_perfect=false;launchSession(Array.from({length:count},()=>({a:8,b:7,ans:15})),mode);hideCountdownOverlay();},{mode,count});
  await page.waitForTimeout(50);await page.evaluate(()=>showP());
 }
 for(const [width,height] of [[960,540],[1280,720],[1366,768],[1920,1080]]) {
  await page.setViewportSize({width,height});await start();
  for(const mode of ['btn','calc','hw']) {
   await page.evaluate(mode=>{setAnsTab(mode);if(!hintVisible)toggleHint();hintReset();},mode);
   for(let n=0;n<5;n++)await page.evaluate(()=>hintNext());
   await page.waitForTimeout(300);
   const dims=await page.evaluate(()=>{
    const app=document.getElementById('app');
    const ids=['pcard','hint-box',_currentAnsTab==='calc'?'calcgrid':_currentAnsTab==='hw'?'hw-area':'agrid'];
    return {scroll:app.scrollHeight-app.clientHeight,rects:ids.map(id=>({id,...document.getElementById(id).getBoundingClientRect().toJSON()}))};
   });
   if(dims.scroll>1) { console.log(dims); await page.screenshot({path:'tests/overflow.png'}); } assert(dims.scroll<=1,`${width} ${mode} scroll ${dims.scroll}`);
   for(const r of dims.rects)assert(r.top>=0&&r.bottom<=height&&r.right<=width,JSON.stringify({width,mode,r}));
  }
  await page.screenshot({path:`tests/practice-${width}.png`});
 }
 console.log('PASS: 4 landscape sizes, 3 input modes, all hint steps');
 const mastery=await page.evaluate(()=>{
  learningPrefs.masterSeconds=3;const defaults=[isMasterTime(2999),isMasterTime(3000)];
  learningPrefs.masterSeconds=4.1;syncMasterDescriptions();const changed=[isMasterTime(4099),isMasterTime(4100)];
  const special=BADGES.find(b=>b.course==='shinsoku').cond;
  learningPrefs.masterSeconds=10;const long=getSt({att:1,last:{ok:true,el:9000}});
  learningPrefs.masterSeconds=4.1;saveLearningPrefs();
  return {defaults,changed,long,special,normal:BADGES[0].cond};
 });
 assert.deepEqual(mastery.defaults,[true,false]);assert.deepEqual(mastery.changed,[true,false]);assert.equal(mastery.long,'master');assert(mastery.special.includes('2びょう'));assert(mastery.normal.includes('4.1びょう'));
 console.log('PASS: master threshold boundaries and special-mode descriptions');
 await page.setViewportSize({width:1280,height:720});
 for(const when of ['off','immediate','end','both']) {
  await page.evaluate(when=>{learningPrefs.recite=when;learningPrefs.count=5;_currentAnsTab='btn';},when);await start();
  await page.evaluate(()=>{const p=sess.queue[0];chk(0,null,p);chk(15,null,p);});
  assert.equal(await page.evaluate(()=>sess.results.length),1);
  const immediate=when==='immediate'||when==='both';assert.equal(await page.evaluate(()=>recitationActive()),immediate);
  if(immediate){
   await page.screenshot({path:'tests/recitation.png'});
   await page.evaluate(()=>{advanceRecitation();advanceRecitation();advanceRecitation();});
   assert((await page.locator('#recitation-equation').innerText()).includes('？'));
   await page.evaluate(()=>{advanceRecitation();advanceRecitation();});
  }
  await page.waitForFunction(()=>sess.idx===1);
  await page.evaluate(()=>chk(15,null,sess.queue[1]));
  const ending=when==='end'||when==='both';
  if(ending){await page.waitForFunction(()=>recitationActive());assert.equal(await page.evaluate(()=>recitationState.problems.length),1);await page.evaluate(()=>{for(let i=0;i<5;i++)advanceRecitation();});}
  await page.waitForFunction(()=>document.getElementById('result').classList.contains('on'));
  assert.deepEqual(await page.evaluate(()=>sess.results.map(r=>r.ok)),[false,true]);
 }
 console.log('PASS: OFF/immediate/end/both, answer deduplication, hidden answers, unchanged scores');
 await page.evaluate(()=>{learningPrefs.recite='end';learningPrefs.count=10;});await start('normal',1);
 await page.evaluate(()=>{chk(0,null,sess.queue[0]);});await page.waitForFunction(()=>recitationActive());
 await page.evaluate(()=>{for(let i=0;i<9;i++)advanceRecitation();});assert(await page.evaluate(()=>recitationActive()));
 await page.evaluate(()=>advanceRecitation());await page.waitForFunction(()=>sess._finishRendered);
 assert.equal(await page.evaluate(()=>uniqueMissedProblems([{p:{a:1,b:2},ok:false},{p:{a:1,b:2},ok:false}]).length),1);
 console.log('PASS: 10 repetitions and duplicate review questions');
 await page.evaluate(()=>{learningPrefs.recite='both';learningPrefs.count=5;});await start('mugen',1);
 await page.evaluate(()=>chk(0,null,sess.queue[0]));assert(await page.evaluate(()=>recitationActive()));
 await page.evaluate(()=>{for(let i=0;i<5;i++)advanceRecitation();});assert(await page.evaluate(()=>recitationActive()));
 await page.evaluate(()=>{for(let i=0;i<5;i++)advanceRecitation();});await page.waitForFunction(()=>sess._finishRendered);
 assert.equal(await page.evaluate(()=>sess.results.length),1);
 assert.equal(await page.locator('#rt2').innerText(),'記録 0問');
 console.log('PASS: special-mode wrong answer reviews and correct-count record');
 await page.evaluate(()=>{learningPrefs.recite='both';saveLearningPrefs();show('settings');});await page.waitForTimeout(50);await page.screenshot({path:'tests/settings.png'});
 await page.evaluate(()=>{setDebugUnlocked(true);showDebugPanel();});
 const threshold=page.locator('#dbg-auto-award-row input[type=number]');
 await threshold.fill('4.2');await threshold.dispatchEvent('change');assert.equal(await page.evaluate(()=>getMasterMs()),4200);
 await threshold.fill('4.1');await threshold.dispatchEvent('change');
 await page.evaluate(()=>hideDebugPanel());
 await page.locator('#recite-count').selectOption('10');assert.equal(await page.evaluate(()=>recitationCount()),10);
 await page.locator('#recite-enabled').uncheck();assert.equal(await page.evaluate(()=>learningPrefs.recite),'off');
 await page.locator('#recite-enabled').check();await page.locator('#recite-when').selectOption('both');
 console.log('PASS: debug and recitation settings via UI');
 await page.reload();assert.equal(await page.evaluate(()=>getMasterMs()),4100);assert.equal(await page.evaluate(()=>learningPrefs.recite),'both');
 assert.deepEqual(errors,[]);console.log('PASS: persistence, no JavaScript errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



