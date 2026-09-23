const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('https://**/*',route=>route.abort());
  await page.goto('http://127.0.0.1:8873/tashizan_ninja.html?skip-startup=1');
  await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');voiceOn=false;show('practice');});
  for(const [a,b,need,remain] of [[8,3,2,1],[3,9,1,2],[6,7,3,3]]){
    await page.evaluate(({a,b})=>{hintSetProblem({a,b,ans:a+b});document.getElementById('hint-area').style.display='block';if(!hintVisible)toggleHint();},{a,b});
    await page.locator('#hint-sakura').click();
    assert.equal(await page.locator('#hint-sakura').getAttribute('aria-pressed'),'true');
    assert((await page.locator('#hint-msg').innerText()).includes(`あと${need}で10`));
    await page.waitForFunction(()=>hintStep===4,undefined,{timeout:15000});
    const state=await page.evaluate(()=>({text:document.querySelector('#hint-board .sakura-hint-svg').textContent,msg:document.getElementById('hint-msg').textContent,scroll:document.getElementById('app').scrollHeight-document.getElementById('app').clientHeight}));
    assert(state.text.includes(String(a+b)));
    assert(state.msg.includes(`のこりの${remain}`));
    if(state.scroll>1)await page.screenshot({path:'tests/sakura-overflow.png'});
    assert(state.scroll<=1,`page scroll: ${state.scroll}`);
  }
  await page.setViewportSize({width:960,height:540});
  await page.evaluate(()=>{hintSetProblem({a:8,b:3,ans:11});document.getElementById('hint-area').style.display='block';if(!hintVisible)toggleHint();});
  await page.locator('#hint-sakura').click();
  assert((await page.evaluate(()=>document.getElementById('app').scrollHeight-document.getElementById('app').clientHeight))<=1);
  await page.locator('#hint-ten').click();
  assert.equal(await page.locator('#hint-ten').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#hint-sakura').getAttribute('aria-pressed'),'false');
  await page.evaluate(()=>hintSetProblem({a:4,b:5,ans:9}));
  assert.equal(await page.locator('#hint-sakura').isVisible(),false);
  await page.evaluate(()=>{
    window.__spoken=[];
    window.speechSynthesis.speak=utterance=>{window.__spoken.push(utterance.text);setTimeout(()=>utterance.onend?.(),20)};
    window.speechSynthesis.cancel=()=>{};
    voiceOn=true;
    hintSetProblem({a:8,b:3,ans:11});
    document.getElementById('hint-area').style.display='block';
    if(!hintVisible)toggleHint();
  });
  await page.locator('#hint-sakura').click();
  await page.waitForFunction(()=>hintStep===4,undefined,{timeout:10000});
  assert.equal(await page.evaluate(()=>window.__spoken.length),5);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('PASS: Sakura Banana hint adapts to both number orders, narrates all steps, shares the method buttons, and fits 16:9');
})().catch(error=>{console.error(error);process.exit(1)});
