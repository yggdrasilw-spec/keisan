const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 for(const reducedMotion of ['no-preference','reduce'])for(const embedded of [false,true]){
  const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',r=>r.abort());
  async function open(value){
   if(!embedded){await page.goto('http://127.0.0.1:8873/'+value);return page;}
   await page.goto('http://127.0.0.1:8873/tashizan_ninja.html?skip-startup=1');
   await page.evaluate(value=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');fxSettings.fx_wipe=false;openKisoActivity('./'+value);},value);
   const f=await(await page.locator('#kiso-frame').elementHandle()).contentFrame();await f.locator('#start-btn').waitFor({state:'visible'});return f;
  }
  const f=await open('dot-kazoe-finger.html?mode=dot');await f.locator('#start-btn').click();
  await f.waitForFunction(()=>[...document.querySelectorAll('#dot-svg circle')].some(c=>c.getAnimations().length>0));
  await page.waitForTimeout(750);
  const sample=await f.evaluate(async()=>{
   const circles=[...document.querySelectorAll('#dot-svg circle')].filter(c=>getComputedStyle(c).display!=='none');
   const pos=c=>({x:parseFloat(getComputedStyle(c).cx),y:parseFloat(getComputedStyle(c).cy)});
   const start=circles.map(pos);renderDotsAligned(currentAnswer);
   const end=circles.map(c=>({x:+c.getAttribute('cx'),y:+c.getAttribute('cy')}));
   await new Promise(r=>setTimeout(r,100));return {start,end,middle:circles.map(pos),duration:getComputedStyle(circles[0]).transitionDuration};
  });
  assert(sample.start.some((s,i)=>Math.hypot(s.x-sample.middle[i].x,s.y-sample.middle[i].y)>.2&&Math.hypot(sample.end[i].x-sample.middle[i].x,sample.end[i].y-sample.middle[i].y)>.2),JSON.stringify({reducedMotion,embedded,sample}));
  const merge=await open('make-x-2.html');await merge.locator('#start-btn').click();await merge.waitForFunction(()=>document.getElementById('left-svg').children.length>0);await merge.evaluate(()=>onCardClick(correctIdx));
  await merge.waitForFunction(()=>[...document.querySelectorAll('#merge-svg circle')].some(c=>c.getAnimations().length>0));
  assert.deepEqual(errors,[]);console.log('PASS:',reducedMotion,embedded?'embedded':'standalone','dot entrance, intermediate alignment positions, merge animation');await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
