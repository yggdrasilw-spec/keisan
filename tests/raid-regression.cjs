const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://**/*',r=>r.abort());
 await page.addInitScript(()=>{
  const state=window.raidMock={authenticated:false,hp:100,logs:[],expire:false,missing:false,online:true,denied:false};
  const listeners={};const snapshot=value=>({val:()=>value});
  const data=()=>state.missing?null:{boss:{name:'テストボス',currentHp:state.hp,maxHp:100},expiresAt:Date.now()+(state.expire?-1000:60000)};
  const ref=path=>({
   once:async()=>{if(!state.authenticated)throw Error('auth required');if(state.denied)throw Error('permission denied');return snapshot(data());},
   on:(_event,fn)=>{listeners[path]=fn;fn(snapshot(path==='.info/connected'?state.online:data()));},
   off:()=>{delete listeners[path];},
   child:child=>ref(path+'/'+child),
   transaction:async update=>{const hp=update(state.hp);if(hp===undefined)return {committed:false};state.hp=hp;listeners['rooms/ABCD']?.(snapshot(data()));return {committed:true};},
   push:async entry=>{state.logs.push(entry);}
  });
  const app={name:'ninja-raid',auth:()=>({signInAnonymously:async()=>{state.authenticated=true;}}),database:()=>({ref})};
  window.firebase={apps:[app],auth(){},database(){}};
  state.notify=()=>{listeners['rooms/ABCD']?.(snapshot(data()));listeners['.info/connected']?.(snapshot(state.online));};
 });
 await page.goto('http://127.0.0.1:8873/tashizan_ninja.html');
 await page.evaluate(()=>{document.getElementById('startup-overlay')?.remove();document.body.classList.remove('booting');});
 await page.locator('#dojo-raid-open').click();
 assert.equal(await page.locator('#raid-code').inputValue(),'');
 await page.evaluate(()=>NinjaRaid.answer(true));assert.equal(await page.evaluate(()=>raidMock.logs.length),0);
 await page.locator('#raid-code').fill('ＡＢＣＤ');await page.locator('#raid-name').fill('にんじゃ');await page.locator('#raid-connect').click();
 await page.waitForFunction(()=>document.getElementById('raid-status').textContent.includes('HP'));
 assert.equal(await page.locator('#raid-code').inputValue(),'ABCD');
 assert(await page.evaluate(()=>raidMock.authenticated));
 for(let i=0;i<5;i++) await page.evaluate(()=>NinjaRaid.answer(true));
 assert.deepEqual(await page.evaluate(()=>raidMock.logs.map(l=>l.damage)),[10,10,20,20,30]);
 assert.equal(await page.evaluate(()=>raidMock.hp),10);
 await page.evaluate(()=>NinjaRaid.answer(false));await page.evaluate(()=>NinjaRaid.answer(true));
 assert.equal(await page.evaluate(()=>raidMock.hp),0);
 await page.evaluate(()=>NinjaRaid.answer(true));assert.equal(await page.evaluate(()=>raidMock.logs.length),6);
 await page.locator('#raid-disconnect').click();await page.evaluate(()=>NinjaRaid.answer(true));assert.equal(await page.evaluate(()=>raidMock.logs.length),6);
 console.log('PASS: auth before room access, full-width code, damage streak, miss reset, HP floor, defeat, disconnect');
 await page.evaluate(()=>{raidMock.hp=100;raidMock.expire=true;});await page.locator('#raid-connect').click();
 await page.waitForFunction(()=>document.getElementById('raid-status').textContent.includes('期限切れ'));
 await page.evaluate(()=>{raidMock.expire=false;raidMock.missing=true;});await page.locator('#raid-connect').click();
 await page.waitForFunction(()=>document.getElementById('raid-status').textContent.includes('見つからない'));
 await page.evaluate(()=>{raidMock.missing=false;raidMock.denied=true;});await page.locator('#raid-connect').click();
 await page.waitForFunction(()=>document.getElementById('raid-status').textContent.includes('permission denied'));
 await page.evaluate(()=>{raidMock.denied=false;});await page.locator('#raid-connect').click();
 await page.waitForFunction(()=>document.getElementById('raid-status').textContent.includes('HP'));
 await page.evaluate(()=>{raidMock.online=false;raidMock.notify();});await page.evaluate(()=>NinjaRaid.answer(true));assert.equal(await page.evaluate(()=>raidMock.hp),100);
 await page.evaluate(()=>{raidMock.online=true;raidMock.expire=true;raidMock.notify();});await page.evaluate(()=>NinjaRaid.answer(true));assert.equal(await page.evaluate(()=>raidMock.hp),100);
 assert.deepEqual(errors,[]);console.log('PASS: expired/missing rooms, permission errors, offline, expiry during play');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
