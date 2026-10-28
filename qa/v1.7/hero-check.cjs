/* 首页三城日夜图文、入口、轮播状态与存储的真实浏览器检查。 */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {boot}=require('../../tools/load-data');
const data=boot().data,base=process.env.DAYTRIP_QA_URL||'http://127.0.0.1:4173/';
const result={version:data.version,date:'2026-10-28',url:base,stories:[],layouts:[],checks:[],errors:[]};
const expected=JSON.parse(JSON.stringify(data.nationalStories));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await ctx.newPage();
 const watch=p=>{p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('net::ERR_FAILED'))result.errors.push(m.text());});};watch(page);
 async function go(file,p=page){await p.goto(base+file);await p.locator('h1:visible').first().waitFor();}
 async function mode(value,p=page){if(await p.locator('body').getAttribute('data-theme')!==value)await p.locator('.appearance-toggle').click();}
 async function show(i,p=page){while(Number(await p.locator('.story-carousel').getAttribute('data-slide'))!==i)await p.locator('[data-carousel="next"]').click();}
 async function checkStories(value,p=page){
  assert.equal(await p.locator('.story-carousel').getAttribute('data-story-mode'),value);
  for(let i=0;i<3;i++){
   const story=expected[i][value],slide=p.locator(`[data-story="${i}"]`);
   assert.equal(await slide.locator('img').getAttribute('src'),`assets/images/${story.image}.jpg`);
   assert.equal(await slide.locator('img').getAttribute('alt'),story.alt);
   assert.equal((await slide.locator('h1').textContent()).replace(/\s/g,''),(story.title+story.accent).replace(/\s/g,''));
   assert.equal(await slide.locator('.eyebrow').textContent(),story.eyebrow);
   assert.equal((await slide.locator('.hero-content > p').textContent()).replace(/\s/g,''),story.text.replace(/\s/g,''));
   const href=new URL(await slide.locator('.btn').getAttribute('href'),base);
   assert.ok(href.pathname.endsWith('/choose.html'));assert.equal(href.searchParams.get('city'),expected[i].cityId);assert.equal(href.searchParams.get('style'),story.style);assert.equal(href.searchParams.get('period'),story.period);
   assert.ok((await slide.locator('.btn').textContent()).includes(story.button));
  }
  const i=Number(await p.locator('.story-carousel').getAttribute('data-slide'));
  assert.ok((await p.locator('.story-caption').innerText()).includes(expected[i][value].caption));
 }
 async function layout(){
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const hero=await page.locator('.story-carousel').boundingBox(),button=await page.locator('.story-slide.active .btn').boundingBox();
  assert.ok(button.x>=hero.x-1&&button.x+button.width<=hero.x+hero.width+1&&button.y+button.height<hero.y+hero.height,'主视觉按钮位于图片范围内');
 }
 try{
  // 无保存、旅行参数与保存偏好的组合，三张都必须按有效外观同步。
  for(const saved of [null,'day','night'])for(const period of ['day','night','full']){
   await ctx.clearCookies();await go('index.html');await page.evaluate(saved=>{localStorage.removeItem('daytrip.exploration.v2');if(saved)localStorage.setItem('daytrip.appearance.v1',saved);else localStorage.removeItem('daytrip.appearance.v1');},saved);
   await go('index.html?period='+period);await checkStories(saved||(period==='night'?'night':'day'));
  }
  result.checks.push('首次进入、三种时段与已保存的日夜外观优先级，共九种组合');
  await mode('day');
  for(const value of ['day','night']){
   await mode(value);await checkStories(value);
   for(let i=0;i<3;i++){
    await show(i);await page.locator('.story-slide.active img').evaluate(async img=>{img.loading='eager';await img.decode();});
    const href=await page.locator('.story-slide.active .btn').getAttribute('href');
    result.stories.push({city:expected[i].cityId,mode:value,image:expected[i][value].image,href});
    await page.screenshot({path:path.join(__dirname,`hero-${value}-${expected[i].cityId}.png`)});
    await page.locator('.story-slide.active .btn').click();await page.waitForURL('**/choose.html?**');
    assert.equal(await page.locator('#choose-city').inputValue(),expected[i].cityId);
    assert.equal(await page.locator('[name="style"]:checked').inputValue(),expected[i][value].style);
    assert.equal(await page.locator('[name="period"]:checked').inputValue(),expected[i][value].period);
    await page.goBack();await page.locator('.story-carousel').waitFor();await mode(value);
   }
  }
  result.checks.push('六组真实摄影与文案、地点、替代文字、按钮及偏好页选中项一致');
  await page.evaluate(()=>{DaytripExperience.complete('donghu','day');DaytripExperience.selectStay('donghu','day',Daytrip.stays.find(s=>s.route==='donghu').id);});
  const records=await page.evaluate(()=>localStorage.getItem('daytrip.exploration.v2'));
  await show(1);const index=await page.locator('.story-carousel').getAttribute('data-slide');
  await page.locator('.appearance-toggle').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('.story-carousel').getAttribute('data-slide'),index);
  assert.ok(await page.locator('.appearance-toggle').evaluate(e=>e===document.activeElement));
  await page.evaluate(()=>{const old=document.querySelector('.story-slide img');document.querySelector('.appearance-toggle').click();old.dispatchEvent(new Event('error'));});
  for(let i=0;i<20;i++){await page.evaluate(()=>document.querySelector('.appearance-toggle').click());await checkStories(await page.locator('body').getAttribute('data-theme'));}
  await mode('night');await page.reload();await checkStories('night');
  assert.equal(await page.evaluate(()=>localStorage.getItem('daytrip.exploration.v2')),records);
  result.checks.push('键盘焦点与索引保留；二十次快速切换、旧图片迟到错误、刷新与记录不变');
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1000});
   for(const value of ['day','night']){
    await mode(value);await checkStories(value);
    for(let i=0;i<3;i++){
     await show(i);await page.locator('.story-slide.active img').evaluate(async img=>{img.loading='eager';await img.decode();});await layout();result.layouts.push({width,mode:value,city:expected[i].cityId});
     if(width===390)await page.screenshot({path:path.join(__dirname,`mobile-${value}-${expected[i].cityId}.png`)});
    }
   }
  }
  assert.equal(await page.locator('[data-carousel="pause"]').isDisabled(),true);
  result.checks.push('五种宽度、两种模式、三张轮播共三十项布局；减少动画手动轮播');
  // 使用真实时间检查自动播放及三个独立暂停来源。
  const live=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),p=await live.newPage();watch(p);
  await go('index.html?period=day',p);await p.mouse.move(0,0);await p.locator('.appearance-toggle').focus();
  let before=await p.locator('.story-carousel').getAttribute('data-slide');await p.waitForTimeout(6300);assert.notEqual(await p.locator('.story-carousel').getAttribute('data-slide'),before);
  await p.locator('.story-carousel').hover();before=await p.locator('.story-carousel').getAttribute('data-slide');await p.waitForTimeout(6300);assert.equal(await p.locator('.story-carousel').getAttribute('data-slide'),before);
  await p.locator('[data-carousel="next"]').focus();await p.mouse.move(0,0);before=await p.locator('.story-carousel').getAttribute('data-slide');await p.waitForTimeout(6300);assert.equal(await p.locator('.story-carousel').getAttribute('data-slide'),before);
  await p.locator('[data-carousel="pause"]').click();await p.locator('.appearance-toggle').focus();await p.mouse.move(0,0);await mode('night',p);before=await p.locator('.story-carousel').getAttribute('data-slide');await p.waitForTimeout(6300);assert.equal(await p.locator('.story-carousel').getAttribute('data-slide'),before);assert.equal(await p.locator('[data-carousel="pause"]').getAttribute('aria-pressed'),'true');await checkStories('night',p);
  result.checks.push('六秒自动轮播、悬停暂停、聚焦暂停、手动暂停及暂停中换肤保留');await live.close();
  const blocked=await browser.newContext({reducedMotion:'reduce'});await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw Error('blocked');}}));const b=await blocked.newPage();watch(b);await go('index.html?period=day',b);await mode('night',b);await checkStories('night',b);await mode('day',b);await checkStories('day',b);await blocked.close();
  result.checks.push('浏览器存储被禁用时三张图文仍可来回切换');
  const broken=await browser.newContext({reducedMotion:'reduce'});await broken.route('**/assets/images/beijing-night.jpg',r=>r.abort());const f=await broken.newPage();watch(f);await go('index.html?period=day',f);await mode('night',f);await f.locator('[data-story="0"] .hero-image.image-unavailable').waitFor({state:'attached'});await checkStories('night',f);await mode('day',f);await f.locator('[data-story="0"] img').evaluate(img=>img.decode());assert.equal(await f.locator('[data-story="0"] .image-unavailable').count(),0);await broken.close();
  result.checks.push('夜景加载失败使用占位，切回日光恢复正常图片，无跨模式假图');
  assert.deepEqual(result.errors,[]);result.passed=true;
 }catch(e){result.passed=false;result.failure=e.stack;throw e;}
 finally{fs.writeFileSync(path.join(__dirname,'hero-results.json'),JSON.stringify(result,null,2));await ctx.close();await browser.close();}
 console.log(JSON.stringify({passed:result.passed,version:result.version,stories:result.stories.length,layouts:result.layouts.length,checks:result.checks.length,errors:result.errors}));
})().catch(e=>{console.error(e);process.exitCode=1;});
