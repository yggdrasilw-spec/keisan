const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 const base=process.env.QA_BASE||'http://127.0.0.1:8892';
 await page.route(base+'/**',async route=>{
  const name=decodeURIComponent(new URL(route.request().url()).pathname).slice(1);
  const file=path.resolve(__dirname,'..',name),root=path.resolve(__dirname,'..');
  if(!file.startsWith(root+path.sep))return route.abort();
  try{const body=await fs.readFile(file);const ext=path.extname(file);
   await route.fulfill({body,contentType:ext==='.js'?'text/javascript':ext==='.css'?'text/css':ext==='.html'?'text/html':ext==='.png'?'image/png':ext==='.mp3'?'audio/mpeg':'application/octet-stream'});
  }catch{await route.fulfill({status:404,body:''});}
 });
 await page.goto(base+'/tashizan_ninja.html?skip-startup=1');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;fxSettings.fx_perfect=false;voiceOn=false;sfxOn=false;});
 async function start(p={a:8,b:7,ans:15},mode='normal',count=2){
  await page.evaluate(({p,mode,count})=>{clearRuntimeTimers();learningPrefs.recite='off';learningPrefs.battle='normal';learningPrefs.explainMiss=true;curLevel='hard';launchSession(Array.from({length:count},()=>({...p})),mode);hideCountdownOverlay();showP();NinjaBattle.sync();},{p,mode,count});
  await page.waitForTimeout(200);
  await page.evaluate(()=>NinjaBattle.sync());
 }
 await start();
 assert.equal(await page.evaluate(()=>{startPracticeTimer();return document.getElementById('ptimer').textContent;}),'⏱ 0.0 びょう');
 const impact=await page.evaluate(async()=>{chk(0,null,sess.queue[0]);await new Promise(r=>setTimeout(r,650));return {hint:hintVisible,action:NinjaBattle.snapshot().action};});
 assert.equal(impact.hint,false);assert.equal(impact.action,'hurt');
 await page.waitForFunction(()=>hintVisible);
 await page.waitForTimeout(2400);
 assert.equal(await page.evaluate(()=>sess.idx),0);
 assert.equal(await page.locator('#correction-continue').isDisabled(),true);
 await page.waitForFunction(()=>!document.getElementById('correction-continue').disabled,{},{timeout:25000});
 assert.equal(await page.evaluate(()=>hintStep),5);
 assert.match(await page.locator('#hint-msg').textContent(),/こたえは 15/);
 for(const [width,height] of [[960,540],[1280,720],[1920,1080]]){
  await page.setViewportSize({width,height});
  const rect=await page.locator('#correction-continue').boundingBox();
  assert(rect&&rect.y>=0&&rect.y+rect.height<=height,`continue button fits ${width}x${height}: ${JSON.stringify(rect)}`);
 }
 await page.setViewportSize({width:1280,height:720});
 await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>sess.idx),0);
 await page.locator('#correction-continue').click();
 await page.waitForFunction(()=>sess.idx===1);
 await start();await page.evaluate(()=>{learningPrefs.explainMiss=false;chk(0,null,sess.queue[0]);});
 await page.waitForFunction(()=>sess.idx===1);assert.equal(await page.evaluate(()=>hintVisible),false);
 await page.evaluate(()=>show('settings'));
 await page.locator('#explain-miss').check();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('tashizan_learning_v1')).explainMiss),true);
 await start({a:2,b:3,ans:5});await page.evaluate(()=>chk(0,null,sess.queue[0]));
 await page.waitForFunction(()=>!document.getElementById('correction-continue').hidden&&!document.getElementById('correction-continue').disabled);
 await page.locator('#correction-continue').click();await page.waitForFunction(()=>sess.idx===1);
 await start({a:2,b:3,ans:5},'normal',1);await page.evaluate(()=>chk(5,null,sess.queue[0]));
 await page.waitForFunction(()=>NinjaBattle.snapshot().finishing);
 assert.equal(await page.evaluate(async()=>{await new Promise(r=>setTimeout(r,1000));return _currentScreen;}),'practice');
 await page.waitForFunction(()=>_currentScreen==='result');
 await start({a:8,b:7,ans:15},'mugen');await page.evaluate(()=>chk(0,null,sess.queue[0]));
 await page.waitForFunction(()=>hintVisible);
 assert.equal(await page.evaluate(()=>_currentScreen),'practice');
 await page.evaluate(()=>endSess());await page.waitForFunction(()=>_currentScreen!=='practice');
 await page.waitForTimeout(2200);assert.equal(await page.locator('#correction-continue').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS: complete explanation, explicit continue, OFF persistence, dot hint, damage/clear dwell, special miss and cancellation, fixed decimal timer');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
