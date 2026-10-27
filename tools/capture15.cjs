/* 仅刷新当前版本截图；完整行为验收使用 qa/v1.5/browser-check.cjs。 */
const {chromium}=require('playwright');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
 const base='http://127.0.0.1:4173/',out=path.resolve(__dirname,'../qa/v1.5');
 const ready=(all=false)=>page.locator('img').evaluateAll(async(imgs,all)=>{
   const selected=imgs.filter(i=>{const r=i.getBoundingClientRect();return all||(r.top<innerHeight&&r.bottom>0&&getComputedStyle(i).visibility==='visible');});
   await Promise.all(selected.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 },all);
 const take=async(name,url,fullPage=false)=>{await page.goto(base+url);await ready(fullPage);await page.screenshot({path:path.join(out,name+'.png'),fullPage});};
 await take('home-day','index.html?city=hangzhou&period=day');
 await page.locator('#cities').scrollIntoViewIfNeeded();await ready();await page.screenshot({path:path.join(out,'cities.png')});
 await take('home-night','index.html?city=chongqing&period=night');
 await take('routes','routes.html?city=hangzhou&period=day',true);
 await take('choose','choose.html?city=hangzhou&period=day',true);
 await take('detail','detail.html?city=hangzhou&route=hangzhou-city&period=night',true);
 await page.evaluate(()=>{const api=window.DaytripExperience;api.complete('hangzhou-city','day');api.complete('hangzhou-city','night');api.selectStay('hangzhou-city','night','hangzhou-city-room');});
 await take('finish-dual','finish.html?city=hangzhou&route=hangzhou-city&period=night',true);
 await page.setViewportSize({width:390,height:844});
 await take('mobile-home','index.html?city=hangzhou&period=night');
 await page.locator('.city-card').first().scrollIntoViewIfNeeded();await ready();await page.screenshot({path:path.join(out,'mobile-cities.png')});
 await take('mobile-routes','routes.html?city=hangzhou&period=night',true);
 await page.setViewportSize({width:320,height:844});
 await take('mobile-detail','detail.html?city=chongqing&route=chongqing-nature&period=night',true);
 console.log('PASS versioned screenshots refreshed');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
