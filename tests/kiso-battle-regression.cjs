const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:8873';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());await page.goto(base+'/tashizan_ninja.html?skip-startup=1');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;voiceOn=false;sfxOn=false;learningPrefs.battle='normal';saveLearningPrefs();});
 async function open(file){
  await page.evaluate(file=>openKisoActivity('./'+file),file);
  const f=await(await page.locator('#kiso-frame').elementHandle()).contentFrame();
  await f.waitForFunction(()=>!!window.NinjaKisoBattle);await f.locator('#start-btn').click();await f.waitForTimeout(200);return f;
 }
 for(const file of ['dot-kazoe-finger.html?mode=dot','dot-kazoe-finger.html?mode=finger']){
  const f=await open(file);assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).progress,0);
  assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).visible,true);
  await f.evaluate(()=>{inputStr=String(currentAnswer);submitAnswer();});
  assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).progress,1);assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).hp,90);
  await f.waitForFunction(()=>!locked);await f.evaluate(()=>{inputStr=String(currentAnswer===0?1:0);submitAnswer();});
  assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).progress,2);assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).streak,0);
  await f.waitForFunction(()=>!locked);const stars=await f.evaluate(()=>totalStars);
  // Finish the actual activity using its accepted-answer path.
  for(let i=2;i<10;i++){await f.waitForFunction(()=>!locked);await f.evaluate(()=>{inputStr=String(currentAnswer);submitAnswer();});}
  await f.locator('#screen-result').waitFor({state:'visible'});assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).ended,true);assert.equal(await f.evaluate(()=>totalStars),stars);
  await f.locator('#retry-btn').click();await f.waitForFunction(()=>!locked);assert.equal((await f.evaluate(()=>NinjaKisoBattle.snapshot())).progress,0);
  await f.evaluate(()=>onTimeout());assert.equal(await f.evaluate(()=>NinjaKisoBattle.snapshot()),null);
  await page.locator('#kiso-close').click();assert.equal(await page.locator('#kiso-frame').count(),0);
 }
 console.log('PASS: dot/finger accepted answers and misses, full course with unchanged reward, retry reset, timeout without victory, disposal');
 const merge=await open('make-x-2.html');assert.equal((await merge.evaluate(()=>NinjaKisoBattle.snapshot())).visible,true);
 await merge.evaluate(()=>{onCardClick(correctIdx);onCardClick(correctIdx);});assert.equal((await merge.evaluate(()=>NinjaKisoBattle.snapshot())).progress,1);
 await merge.waitForFunction(()=>!locked);await merge.evaluate(()=>onCardClick((correctIdx+1)%3));assert.equal((await merge.evaluate(()=>NinjaKisoBattle.snapshot())).progress,2);
 await merge.evaluate(()=>onTimeout());assert.equal(await merge.evaluate(()=>NinjaKisoBattle.snapshot()),null);await page.locator('#kiso-close').click();
 const vision=await open('suji_vision_training.html');
 const targets=vision.locator('#field [data-num]');await targets.first().waitFor({state:'visible'});
 await targets.first().click();assert.equal((await vision.evaluate(()=>NinjaKisoBattle.snapshot())).progress,1);
 // Find and click an existing non-target: the activity already judges this miss.
 const missNumber=await vision.evaluate(()=>[...document.querySelectorAll('#field [data-num]')].find(el=>!el.classList.contains('target')&&!el.classList.contains('hit')).dataset.num);
 await vision.locator('#field [data-num="'+missNumber+'"]').click();
 assert.equal((await vision.evaluate(()=>NinjaKisoBattle.snapshot())).progress,1);
 assert.equal((await vision.evaluate(()=>NinjaKisoBattle.snapshot())).streak,0);
 await page.locator('#kiso-close').click();
 await page.setViewportSize({width:390,height:844});const phone=await open('dot-kazoe-finger.html?mode=dot');assert.equal((await phone.evaluate(()=>NinjaKisoBattle.snapshot())).visible,false);await page.locator('#kiso-close').click();
 // Standalone applications do not load battle scripts or create events.
 await page.goto(base+'/dot-kazoe-finger.html?mode=dot');assert.equal(await page.evaluate(()=>typeof window.NinjaKisoBattle),'undefined');
 assert.deepEqual(errors,[]);console.log('PASS: card double-click, card miss, number-finding miss without progress, phone hidden, standalone unchanged, no page errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
