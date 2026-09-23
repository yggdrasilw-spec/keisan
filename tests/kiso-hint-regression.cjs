const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.goto('http://127.0.0.1:8873/tashizan_ninja.html?skip-startup=1');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;voiceOn=false;sfxOn=false;window.testIdentity=Date.now();});
 const identity=await page.evaluate(()=>window.testIdentity);
 for (const [width,height] of [[1280,720],[1366,768],[1920,1080],[390,844]]) {
  await page.setViewportSize({width,height});
  for(const [value,name] of [['./dot-kazoe-finger.html?mode=dot','dot'],['./dot-kazoe-finger.html?mode=finger','finger'],['./make-x-2.html','make'],['./suji_vision_training.html','vision']]) {
   await page.evaluate(()=>show('kiso-home'));
   await page.locator(`[data-value="${value}"]`).click();
   const iframe=await page.locator('#kiso-frame').elementHandle();const f=await iframe.contentFrame();
   await f.waitForSelector('#start-btn',{state:'visible'});
   await f.waitForFunction(()=>document.documentElement.classList.contains('ninja-embedded'));
   await page.waitForTimeout(200);
   if(width===1280)await page.screenshot({path:`tests/kiso-${name}-settings.png`});
   await f.locator('#start-btn').click();
   await page.waitForTimeout(750);
   const bounds=await f.evaluate(()=>({w:innerWidth,h:innerHeight,scrollW:document.documentElement.scrollWidth,scrollH:document.documentElement.scrollHeight,rects:['question-area','keypad','game-area','field'].map(id=>document.getElementById(id)).filter(Boolean).map(e=>({id:e.id,...e.getBoundingClientRect().toJSON()}))}));
   
   assert(bounds.scrollW<=bounds.w+1,`${name} horizontal overflow`);
   if(width>=1280)for(const r of bounds.rects)assert(r.bottom<=bounds.h+1&&r.top>=0,`${width} ${name} clipped ${r.id}`);
   if(width===1280)await page.screenshot({path:`tests/kiso-${name}-game.png`});
   await page.locator('#kiso-close').click();
   assert.equal(await page.locator('#kiso-frame').count(),0);
   assert.equal(await page.evaluate(()=>window.testIdentity),identity);
  }
 }
 await page.setViewportSize({width:1280,height:720});
 await page.evaluate(()=>{launchSession([{a:8,b:8,ans:16}],'normal');hideCountdownOverlay();showP();toggleHint();});
 await page.locator('#hint-five').click();
 for(let i=0;i<5;i++){
  assert.equal(await page.locator('.five-hint-svg circle').count(),16);
  if(i===4)assert((await page.locator('#hint-msg').innerText()).includes('16'));
  if(i===4)await page.waitForTimeout(750);
  if(i===4)await page.screenshot({path:'tests/five-hint.png'});
  await page.evaluate(()=>hintNext());
  await page.waitForFunction(()=>!document.querySelector('[data-action="hintNext"]').disabled);
 }
 await page.evaluate(()=>{hintSetProblem({a:5,b:5,ans:10});toggleHint();});
 await page.locator('#hint-five').evaluate(el=>el.click());
 for(let i=0;i<4;i++){await page.evaluate(()=>hintNext());await page.waitForFunction(()=>!document.querySelector('[data-action="hintNext"]').disabled);}
 assert((await page.locator('#hint-msg').textContent()).includes('10'));
 await page.evaluate(()=>{hintSetProblem({a:4,b:8,ans:12});hintDraw();});
 assert(await page.locator('#hint-methods').isHidden());
 
 await page.evaluate(()=>{hintSetProblem({a:9,b:9,ans:18});toggleHint();});
 await page.locator('#hint-five').evaluate(el=>el.click());
 for(let i=0;i<4;i++){await page.evaluate(()=>hintNext());await page.waitForFunction(()=>!document.querySelector('[data-action="hintNext"]').disabled);}
 assert.equal(await page.locator('.five-hint-svg circle').count(),18);
 assert((await page.locator('#hint-msg').textContent()).includes('18'));
 await page.locator('#hint-ten').evaluate(el=>el.click());
 assert.equal(await page.locator('.five-hint-svg').count(),0);
 await page.evaluate(()=>{show('home');});await page.waitForTimeout(700);
 await page.screenshot({path:'tests/home-wide.png'});
 assert(await page.evaluate(()=>document.getElementById('app').scrollHeight<=document.getElementById('app').clientHeight+1),'home fits 720p');
 await page.evaluate(()=>{openKisoActivity('./dot-kazoe-finger.html?mode=dot');});
 const rewardFrame=await(await page.locator('#kiso-frame').elementHandle()).contentFrame();
 await rewardFrame.locator('#start-btn').click();
 const before=await page.evaluate(()=>TashizanHud.getStarCount());
 for(let n=0;n<10;n++) {
   await rewardFrame.waitForFunction(()=>!locked);
   const answer=await rewardFrame.evaluate(()=>String(currentAnswer));
   for(const digit of answer) await rewardFrame.locator('[data-val="'+digit+'"]').click();
 }
 await rewardFrame.locator('#screen-result').waitFor({state:'visible'});
 await page.locator('#kiso-close').click();
 assert.equal(await page.evaluate(()=>TashizanHud.getStarCount()),before+1,'earned star preserved');
 await page.evaluate(()=>openKisoActivity('./make-x-2.html'));
 const exitFrame=await(await page.locator('#kiso-frame').elementHandle()).contentFrame();
 await exitFrame.locator('#start-btn').waitFor({state:'visible'});
 await exitFrame.locator('#start-btn').press('Escape');
 await page.waitForFunction(()=>!document.getElementById('kiso-frame'));
 assert.deepEqual(errors,[]);
 console.log('PASS: embedded navigation, 4 activities at 4 viewports, five hints and eligibility, no JS errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
