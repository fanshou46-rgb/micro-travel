/* 1.6 全国首页、城市行程与跨城足迹的真实浏览器验收。 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {boot,root}=require('../../tools/load-data');
const {data}=boot();
const base='http://127.0.0.1:4173/',out=__dirname;
const result={version:data.version,date:'2026-10-27',details:[],flows:[],layouts:[],checks:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
 const page=await context.newPage();
 const errors=p=>{p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});};errors(page);
 async function go(url,p=page){await p.goto(url.startsWith('file:')?url:base+url);await p.locator('h1:visible').first().waitFor();}
 async function layout(p=page){
  const size=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.width+1,`${p.url()} overflow ${JSON.stringify(size)}`);
  const lines=await p.locator('.nav-wrap .brand-words strong').evaluate(e=>{const r=document.createRange();r.selectNodeContents(e.firstChild);return r.getClientRects().length;});assert.equal(lines,1,'导航品牌单行');
 }
 async function snap(name,fullPage=false,p=page){
  await p.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  await p.screenshot({path:path.join(out,name+'.png'),fullPage});
 }
 try{
  await go('index.html?city=wuhan');
  assert.equal(await page.locator('body').getAttribute('data-scope'),'all');
  assert.equal(await page.locator('#nav-city').inputValue(),'');
  assert.equal(await page.locator('#discovery-title').innerText(),'全国精选');
  assert.equal(await page.locator('[data-selection-city]').count(),6);
  assert.equal(new Set(await page.locator('[data-selection-city] .selection-copy small').allTextContents()).size,6);
  assert.equal(await page.locator('.passport-summary h3').innerText(),'我的足迹');
  assert.equal(await page.locator('.passport-summary .passport-stats b').allTextContents().then(v=>v.join(',')),'00,00,00,00');
  assert.equal(await page.locator('.passport-summary progress').count(),0);
  await page.locator('[data-selection-expand]').click();assert.equal(await page.locator('[data-selection-city]').count(),12);
  // 每张精选入口按显式时段绑定，不能继承当前夜色而落到另一地点。
  for(const item of data.nationalSelections){
   const href=await page.locator(`[data-selection-city="${item.cityId}"] a`).getAttribute('href');
   const u=new URL(href,base);assert.equal(u.searchParams.get('route'),item.routeId);assert.equal(u.searchParams.get('period'),item.period);
  }
  for(const c of Object.values(data.cities)){
   await page.locator('#ranking-city').selectOption(c.id);
   assert.equal(await page.locator('#discovery-title').innerText(),c.name+'景点好评榜');
   assert.equal(await page.locator('.ranking-list li').count(),5);
   assert.ok(!(await page.locator('.rank-text b').allTextContents()).some(v=>/入口|休息|返程|接入点|地铁站/.test(v)));
  }
  await page.locator('#ranking-city').selectOption('hangzhou');
  await page.locator('[data-local-ranking="places"]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-local-ranking="users"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-local-user]').first().click();assert.ok(await page.locator('dialog').isVisible());await page.keyboard.press('Escape');
  assert.ok(await page.locator('[data-local-user]').first().evaluate(e=>e===document.activeElement));
  await page.locator('#ranking-city').selectOption('');assert.equal(await page.locator('[data-selection-city]').count(),6);
  result.checks.push('全国首页不预选武汉；六地区精选、十二城展开、显式入口时段和十二城人工榜单');
  await go('choose.html');assert.equal(await page.locator('#choose-city').inputValue(),'');
  assert.equal(await page.locator('[name="city"]').evaluate(e=>e.checkValidity()),false);
  await page.locator('#choose-city').selectOption('hangzhou');await page.waitForURL('**/choose.html?**');
  assert.equal(await page.locator('#choose-city').inputValue(),'hangzhou');
  await page.locator('[name="period"][value="night"]').check();
  await page.locator('label').filter({has:page.locator('[name="style"][value="city"]')}).click();
  await page.locator('[type="submit"]').click();await page.waitForURL('**/routes.html?**');
  assert.equal(await page.locator('.route-card:visible').count(),3);
  assert.equal(await page.locator('.route-card').first().getAttribute('data-theme'),'city');
  await page.locator('#nav-city').selectOption('');await page.waitForURL(u=>u.pathname.endsWith('/routes.html')&&!u.searchParams.has('city'));
  assert.equal(await page.locator('.route-card:visible').count(),36);
  await page.locator('#route-region').selectOption('西南');assert.equal(await page.locator('.route-card:visible').count(),6);
  await page.locator('[data-filter="city"]').click();assert.equal(await page.locator('.route-card:visible').count(),2);
  await page.locator('#route-search').fill('洪崖洞');assert.equal(await page.locator('.route-card:visible').count(),1);
  const filtered=page.url();await page.locator('.route-card:visible .route-card-bottom a').click();
  await page.locator('.back-light').click();assert.equal(page.url(),filtered);
  assert.equal(await page.locator('#route-search').inputValue(),'洪崖洞');
  await page.locator('#route-search').fill('无此景点');assert.ok(await page.locator('.route-empty').isVisible());
  await page.locator('[data-reset-routes]').click();assert.equal(await page.locator('.route-card:visible').count(),36);
  await page.locator('#route-region').selectOption('华东');await page.locator('#route-city').selectOption('hangzhou');await page.waitForURL(u=>u.searchParams.get('city')==='hangzhou');
  assert.equal(await page.locator('.route-card:visible').count(),3);
  await page.locator('#route-region').selectOption('华北');await page.waitForURL(u=>u.searchParams.get('region')==='华北'&&!u.searchParams.has('city'));
  assert.equal(await page.locator('#route-city').inputValue(),'');assert.equal(await page.locator('.route-card:visible').count(),3);
  result.checks.push('目的地必选；全国36条、同城3条；地区兴趣关键词叠加、零结果、重置及详情返回筛选');

  for(const r of data.routes)for(const p of ['day','night','full']){
   await go(`detail.html?route=${r.id}&period=${p}&city=invalid`);
   assert.equal(await page.locator('.timeline-item').count(),p==='full'?6:4);
   assert.match(await page.locator('.detail-location').innerText(),new RegExp(data.cities[r.cityId].name));
   const budget=data.planning[r.id].budgets[p];assert.ok((await page.locator('.budget-total').innerText()).includes(budget.reduce((s,v)=>s+v[0],0)+'–'+budget.reduce((s,v)=>s+v[1],0)));
   await page.locator('[data-departure-check]').first().check();assert.match(await page.locator('.checklist-status').innerText(),/1 \/ 4/);
   await page.locator('[data-departure-check]').first().uncheck();assert.match(await page.locator('.checklist-status').innerText(),/0 \/ 4/);
   assert.equal(await page.locator('[data-stay-open]').count(),2);
   result.details.push({route:r.id,period:p});
  }
  console.log('PASS 108 details');

  // 真正通过页面完成武汉日间、杭州夜间，跨城章不得合并。
  for(const [id,p] of [['donghu','day'],['hangzhou-city','night']]){
   await go(`detail.html?route=${id}&period=${p}`);await page.locator('[data-complete]').click();await page.waitForURL('**/finish.html?**');
   assert.equal(await page.locator('.memory-card.dual').count(),0);
  }
  await go('footprints.html');
  assert.equal((await page.locator('.passport-overview .passport-stats b').allTextContents()).join(','),'02,07,02,00');
  const before=await page.evaluate(()=>JSON.stringify(window.DaytripExperience.getState()));
  await page.locator('[data-foot-mode="visited"]').click();assert.equal(await page.locator('[data-footprint-city]:visible').count(),2);
  await page.locator('#footprint-city').selectOption('hangzhou');assert.equal(await page.locator('[data-footprint-city]:visible').count(),1);
  await page.locator('[data-footprint-city="hangzhou"] summary').click();
  assert.equal(await page.locator('[data-footprint-city="hangzhou"] .completed-trips a').count(),1);
  await page.locator('#navigation a').filter({hasText:'我的足迹'}).click();await page.waitForURL('**/footprints.html?**');
  assert.equal(await page.locator('#footprint-city').inputValue(),'');
  assert.equal(await page.evaluate(()=>JSON.stringify(window.DaytripExperience.getState())),before,'查看全部足迹不写记录');
  await go('detail.html?route=jianghan&period=night');await page.locator('[data-complete]').click();await page.waitForURL('**/finish.html?**');
  assert.equal(await page.locator('.memory-card.dual').count(),1);
  await go('footprints.html');assert.equal(await page.locator('.passport-stats b').nth(3).innerText(),'01');
  await snap('footprints-populated',true);
  result.checks.push('武汉日间与杭州夜间分城记章；跨城总览只读；同城双章解锁；按城筛选及重看行程');

  for(const city of Object.values(data.cities)){
   await go('index.html');await page.locator(`[data-city-card="${city.id}"]`).click();
   await page.locator('[name="period"][value="night"]').check();
   await page.locator('label').filter({has:page.locator('[name="style"][value="city"]')}).click();
   await page.locator('[type="submit"]').click();await page.waitForURL('**/routes.html?**');
   await page.locator('.route-card').first().locator('.route-card-bottom a').click();
   await page.locator('[data-stay-open]').first().click();await page.locator('[data-stay-select]').click();
   await page.locator('[data-complete]').click();await page.waitForURL('**/finish.html?**');
   assert.ok((await page.locator('.memory-topline').innerText()).includes(city.name));assert.equal(await page.locator('.memory-stay').count(),1);
   await page.locator('.finish-passport-links a').first().click();await page.waitForURL('**/footprints.html?**');
   assert.equal(await page.locator('#footprint-city').inputValue(),city.id);assert.equal(await page.locator('[data-footprint-city]:visible').count(),1);
   await page.locator('.nav-wrap>.brand').click();await page.waitForURL('**/index.html?**');
   assert.equal(new URL(page.url()).searchParams.has('city'),false);assert.equal(await page.locator('#ranking-city').inputValue(),'');
   result.flows.push(city.id);
  }
  console.log('PASS 12 city flows and global return');

  for(const q of ['', '?city=hangzhou','?route=invalid','?city=__proto__']){
   await go('detail.html'+q);assert.equal(await page.locator('.missing-route').count(),1);assert.equal(await page.locator('.timeline-item').count(),0);
   await go('finish.html'+q);assert.equal(await page.locator('.missing-route').count(),1);
  }
  await go('detail.html?route=jianghan&duration=half');assert.equal(await page.locator('.timeline-item').count(),4);
  await go('index.html?city=hangzhou');assert.equal(await page.locator('#nav-city').inputValue(),'');
  await page.locator('#city-search').fill('hangzhou');assert.equal(await page.locator('.city-card:visible').count(),1);
  await page.locator('#city-search').fill('不存在');assert.ok(await page.locator('.city-empty').isVisible());await page.locator('[data-reset-cities]').click();
  await page.locator('.appearance-toggle').focus();await page.keyboard.press('Space');assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
  await page.evaluate(()=>localStorage.removeItem('daytrip.appearance.v1'));
  result.checks.push('无效行程空态与旧链接；城市搜索和空态；键盘外观切换');

  // 六页，五宽度，两种时段。足迹页此时含十二城记录。
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1000});
   for(const p of ['day','night'])for(const file of ['index','choose','routes','detail','finish','footprints']){
    await go(`${file}.html?period=${p}${['detail','finish'].includes(file)?'&route=hangzhou-city':''}`);
    assert.equal(await page.locator('body').getAttribute('data-theme'),p);await layout();
    result.layouts.push({width,period:p,page:file,state:file==='footprints'?'populated':'default'});
   }
   console.log('PASS six-page layouts',width);
  }

  const emptyContext=await browser.newContext({reducedMotion:'reduce'});const empty=await emptyContext.newPage();errors(empty);
  for(const width of [320,390,768,1024,1440])for(const p of ['day','night']){
   await empty.setViewportSize({width,height:1000});await go('footprints.html?period='+p,empty);await layout(empty);
   assert.equal((await empty.locator('.passport-stats b').allTextContents()).join(','),'00,00,00,00');
   result.layouts.push({width,period:p,page:'footprints',state:'empty'});
  }
  await empty.locator('[data-foot-mode="visited"]').click();assert.ok(await empty.locator('.footprint-filter-empty').isVisible());
  // 真实浏览器迁移旧键，旧值原封不动，刷新不重复迁移。
  const old={visited:['tingtao'],badges:['day'],completed:['donghu:day'],stays:{'donghu:day':'lake-room'}};
  await empty.evaluate(old=>localStorage.setItem('daytrip.exploration.v1',JSON.stringify(old)),old);
  await go('footprints.html',empty);assert.equal((await empty.locator('.passport-stats b').allTextContents()).join(','),'01,01,01,00');
  assert.equal(await empty.evaluate(()=>localStorage.getItem('daytrip.exploration.v1')),JSON.stringify(old));
  await empty.reload();assert.equal((await empty.locator('.passport-stats b').allTextContents()).join(','),'01,01,01,00');
  await empty.setViewportSize({width:1440,height:1080});await empty.evaluate(()=>{localStorage.removeItem('daytrip.exploration.v1');localStorage.removeItem('daytrip.exploration.v2');});
  await go('footprints.html',empty);await snap('footprints-empty',true,empty);await emptyContext.close();
  result.checks.push('空足迹与已探索筛选零结果；v1迁移到v2、旧键保留及刷新');

  const blockedContext=await browser.newContext({reducedMotion:'reduce'});
  await blockedContext.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}}));
  const blocked=await blockedContext.newPage();errors(blocked);await go('footprints.html',blocked);
  assert.match(await blocked.locator('.passport-storage-note').innerText(),/存储不可用/);
  await go('index.html',blocked);assert.equal(await blocked.locator('[data-selection-city]').count(),6);await blockedContext.close();
  await go('detail.html?route=hangzhou-city');await page.locator('.detail-hero img').evaluate(e=>e.dispatchEvent(new Event('error')));
  assert.equal(await page.locator('.detail-hero-image.image-unavailable').count(),1);await layout();
  result.checks.push('存储被禁用仍可浏览；图片失败样式');

  const localContext=await browser.newContext({reducedMotion:'reduce'});const local=await localContext.newPage();errors(local);
  for(const file of ['index','choose','routes','detail','finish','footprints']){
   await go(pathToFileURL(path.join(root,file+'.html')).href+(['detail','finish'].includes(file)?'?route=hangzhou-city':''),local);
   assert.ok(await local.locator('h1:visible').count()>0);
  }
  await go(pathToFileURL(path.join(root,'detail.html')).href+'?route=donghu&period=day',local);
  await local.locator('[data-complete]').click();await local.waitForURL('**/finish.html?**');
  await local.locator('.finish-passport-links a').last().click();await local.waitForURL('**/footprints.html?**');
  assert.equal((await local.locator('.passport-stats b').allTextContents()).join(','),'01,03,01,00');
  await localContext.close();
  await context.route('**/micro-travel/**',async route=>{
   const rel=decodeURIComponent(new URL(route.request().url()).pathname.replace('/micro-travel/',''));
   const file=path.join(root,rel||'index.html');const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml'};
   await route.fulfill(fs.existsSync(file)?{body:fs.readFileSync(file),contentType:types[path.extname(file)]||'text/plain'}:{status:404});
  });
  await go('micro-travel/index.html');await page.locator('#navigation a').filter({hasText:'我的足迹'}).click();await page.waitForURL('**/micro-travel/footprints.html?**');
  assert.equal(await page.locator('.passport-overview').count(),1);result.checks.push('file://六页与本地项目子路径相对导航；直接打开后完成行程可跨页显示足迹');

  await page.setViewportSize({width:1440,height:1080});
  await go('index.html?period=day');await snap('home-day');await page.locator('#rankings').scrollIntoViewIfNeeded();await snap('national-selections');
  await page.locator('#ranking-city').selectOption('hangzhou');await snap('city-ranking');
  await go('index.html?period=night');await snap('home-night');
  await go('routes.html?region=西南');await snap('national-routes',true);
  await go('footprints.html');await snap('footprints-all',true);
  await page.setViewportSize({width:390,height:844});await go('footprints.html?period=night');await snap('mobile-footprints');
  await page.locator('[data-footprint-city="wuhan"]').scrollIntoViewIfNeeded();await snap('mobile-city-record');
  await go('index.html?period=night');await page.locator('#rankings').scrollIntoViewIfNeeded();await snap('mobile-national');
  assert.deepEqual(result.errors,[]);result.passed=true;console.log('PASS final scenarios, 70 layouts and screenshots; zero console errors');
 }catch(error){result.passed=false;result.failure=error.stack;await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});throw error;}
 finally{fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(result,null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
