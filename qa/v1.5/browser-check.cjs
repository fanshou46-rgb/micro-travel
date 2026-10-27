/* 真实 Edge 验收；NODE_PATH 指向可用的 Playwright 包目录。 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {boot,root}=require('../../tools/load-data');
const {data}=boot();
const out=__dirname,base='http://127.0.0.1:4173/';
const results={date:'2026-10-27',version:data.version,details:[],flows:[],responsive:[],special:[],errors:[]};
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
 const page=await context.newPage();
 page.on('pageerror',e=>results.errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')results.errors.push(m.text());});
 async function go(url){await page.goto(url,{waitUntil:'load'});await page.locator('h1:visible').first().waitFor();}
 async function layout(){
  const size=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
  assert.ok(size.scroll<=size.width+1,`overflow ${page.url()} ${JSON.stringify(size)}`);
  const lines=await page.locator('.nav-wrap .brand-words strong').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el.firstChild);return range.getClientRects().length;});
  assert.equal(lines,1,'品牌名称不应在小屏换行');
 }
 async function snap(name,fullPage=false){
  await page.locator('img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));});
  await page.screenshot({path:path.join(out,name+'.png'),fullPage});
 }
 try{
  // 首次直接访问纪念卡，不能给任何城市发章或增加地点。
  await go(base+'finish.html?city=hangzhou&route=hangzhou-nature&period=night');
  assert.equal(await page.evaluate(()=>window.DaytripExperience.getState().visited.length),0);
  assert.match(await page.locator('.finish-note').innerText(),/预览/);
  results.special.push('direct finish is read-only');

  for(const route of data.routes)for(const period of ['day','night','full']){
   await go(`${base}detail.html?route=${route.id}&period=${period}&city=${route.cityId}`);
   assert.equal(await page.locator('.timeline-item').count(),period==='full'?6:4);
   assert.ok((await page.locator('.detail-location').innerText()).includes(data.cities[route.cityId].name));
   const budget=data.planning[route.id].budgets[period];
   assert.ok((await page.locator('.budget-total').innerText()).includes(budget.reduce((a,b)=>a+b[0],0)+'–'+budget.reduce((a,b)=>a+b[1],0)));
   assert.equal(await page.locator('[data-stay-open]').count(),2);
   await page.locator('[data-departure-check]').first().check();
   assert.match(await page.locator('.checklist-status').innerText(),/1 \/ 4/);
   await page.locator('[data-departure-check]').first().uncheck();
   assert.match(await page.locator('.checklist-status').innerText(),/0 \/ 4/);
   await page.locator('.source-notes summary').click();
   assert.ok(await page.locator('.source-notes a').count()>1);
   results.details.push({route:route.id,period,nodes:period==='full'?6:4});
  }
  console.log('PASS 108 details, budgets, city labels, stays and checklist');

  // 每城从首页选城，进入偏好、路线、详情，选择住宿，完成后进入纪念卡。
  for(const city of Object.values(data.cities)){
   await go(base+'index.html');
   await page.locator(`[data-city-card="${city.id}"]`).click();
   assert.equal(await page.locator('#choose-city').inputValue(),city.id);
   await page.locator('[name="period"][value="night"]').check();
   await page.locator('label').filter({has:page.locator('[name="style"][value="city"]')}).click();
   await page.locator('[type="submit"]').click();
   await page.waitForURL('**/routes.html?**');
   assert.equal(new URL(page.url()).searchParams.get('city'),city.id);
   assert.equal(await page.locator('.route-card').first().getAttribute('data-theme'),'city');
   await page.locator('.route-card').first().locator('.route-card-bottom a').click();
   await page.locator('[data-stay-open]').first().click();
   await page.locator('[data-stay-select]').click();
   assert.match(await page.locator('.stay-selection').innerText(),/已加入/);
   await page.locator('[data-complete]').click();
   await page.waitForURL('**/finish.html?**');
   assert.ok((await page.locator('.memory-topline').innerText()).includes(city.name));
   assert.match(await page.locator('.finish-note').innerText(),/模拟完成/);
   assert.equal(await page.locator('.memory-stay').count(),1);
   assert.equal(await page.locator('.memory-card.dual').count(),0);
   const route=data.routes.find(r=>r.cityId===city.id&&r.theme==='city');
   await go(`${base}detail.html?city=${city.id}&route=${route.id}&period=day`);
   await page.locator('[data-complete]').click();await page.waitForURL('**/finish.html?**');
   assert.equal(await page.locator('.memory-card.dual').count(),1);
   const before=await page.evaluate(id=>window.DaytripExperience.getCityState(id).visited.length,city.id);
   await page.locator('.finish-detail-link').click();await page.locator('[data-complete]').click();await page.waitForURL('**/finish.html?**');
   assert.equal(await page.evaluate(id=>window.DaytripExperience.getCityState(id).visited.length,city.id),before);
   results.flows.push({city:city.id,stay:true,dual:true,deduplicated:true});
   if(city.id==='hangzhou')await snap('finish-dual',true);
  }
  console.log('PASS 12 city five-page flows, stays, same-city dual badges and deduplication');

  // 12 城 × 五页 × 五宽度 × 日夜皮肤，检查横向溢出与品牌单行。
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:1080});
   for(const city of Object.values(data.cities))for(const period of ['day','night'])for(const file of ['index','choose','routes','detail','finish']){
    const route=data.routes.find(r=>r.cityId===city.id&&r.theme==='city');
    await go(`${base}${file}.html?city=${city.id}&period=${period}&route=${route.id}`);
    // 前面的手动主题切换不应干扰本轮皮肤；此时没有手动偏好。
    assert.equal(await page.locator('body').getAttribute('data-theme'),period);
    await layout();results.responsive.push({width,city:city.id,period,page:file});
   }
   console.log('PASS responsive width',width,'/',results.responsive.length);
  }

  await page.setViewportSize({width:1440,height:1080});
  await go(base+'index.html?city=hangzhou');
  await page.locator('#city-search').fill('hangzhou');assert.equal(await page.locator('.city-card:visible').count(),1);
  await page.locator('#city-search').fill('西湖');
  assert.ok(await page.locator('[data-city-card="hangzhou"]').isVisible());
  await page.locator('[data-city-card="hangzhou"]').click();await page.waitForURL('**/routes.html?**');
  assert.equal(new URL(page.url()).searchParams.get('city'),'hangzhou');
  assert.equal(await page.locator('.route-card:visible').count(),1);
  await page.locator('#route-search').fill('不存在的景点');assert.equal(await page.locator('.route-card:visible').count(),0);
  assert.ok(await page.locator('.route-empty').isVisible());
  await page.locator('[data-reset-routes]').click();assert.equal(await page.locator('.route-card:visible').count(),3);
  await page.locator('[data-filter="city"]').click();await page.locator('#route-search').fill('断桥');
  assert.equal(await page.locator('.route-card:visible').count(),0,'搜索必须与主题筛选叠加');
  await page.locator('[data-reset-routes]').click();
  await page.locator('.period-links a').filter({hasText:'夜间'}).click();
  assert.equal(new URL(page.url()).searchParams.get('city'),'hangzhou');
  await page.locator('#nav-city').selectOption('beijing');await page.waitForURL('**/routes.html?city=beijing**');
  assert.equal(new URL(page.url()).searchParams.get('period'),'night');
  assert.equal(new URL(page.url()).searchParams.has('q'),false);
  results.special.push('city/pinyin/landmark search, empty reset, combined filters, context carry');

  await go(base+'index.html');
  await page.locator('[data-region="西南"]').click();assert.equal(await page.locator('.city-card:visible').count(),2);
  await page.locator('#city-search').fill('杭州');assert.ok(await page.locator('.city-empty').isVisible());
  await page.locator('[data-reset-cities]').click();assert.equal(await page.locator('.city-card:visible').count(),12);
  await page.locator('.appearance-toggle').focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('body').getAttribute('data-theme'),'night');
  await page.locator('[data-ranking="places"]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-ranking="users"]').getAttribute('aria-selected'),'true');
  await page.locator('[data-user]').first().click();assert.ok(await page.locator('dialog').isVisible());await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-user]').first().evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('[data-carousel="pause"]').isDisabled(),true);
  const slide=await page.locator('.story-carousel').getAttribute('data-slide');
  await page.locator('[data-carousel="next"]').click();assert.notEqual(await page.locator('.story-carousel').getAttribute('data-slide'),slide);
  results.special.push('keyboard theme, tabs, dialog focus restore, reduced-motion manual carousel');

  // 常规动画模式下验证用户暂停，再移开鼠标仍保持暂停。
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('[data-carousel="pause"]').click();
  await page.locator('footer').hover();
  assert.equal(await page.locator('[data-carousel="pause"]').getAttribute('aria-pressed'),'true');
  await page.emulateMedia({reducedMotion:'reduce'});

  await go(base+'detail.html?city=beijing&route=hangzhou-city&period=day');
  assert.match(await page.locator('.detail-location').innerText(),/杭州/);
  await go(base+'detail.html?city=hangzhou&route=invalid&period=invalid');
  assert.match(await page.locator('h1').innerText(),/西湖/);assert.equal(await page.locator('.timeline-item').count(),6);
  await go(base+'detail.html?route=jianghan&duration=half');assert.equal(await page.locator('.timeline-item').count(),4);
  results.special.push('legacy and conflicting/invalid query parameters');

  // 让一张已加载图触发 error，检验降级布局；避免人为 404 污染控制台统计。
  await page.locator('.detail-hero img').evaluate(el=>el.dispatchEvent(new Event('error')));
  assert.equal(await page.locator('.detail-hero-image').evaluate(el=>el.classList.contains('image-unavailable')),true);
  await layout();results.special.push('image failure fallback');

  const blocked=await browser.newContext({reducedMotion:'reduce'});
  await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError');}});});
  const bp=await blocked.newPage();await bp.goto(base+'detail.html?route=donghu');
  assert.equal(await bp.evaluate(()=>{window.DaytripExperience.complete('donghu','day');return window.DaytripExperience.getCityState('wuhan').visited.length;}),3);
  assert.equal(await bp.evaluate(()=>window.DaytripExperience.isPersistent()),false);await blocked.close();
  results.special.push('blocked browser storage retains in-page state');

  const local=await browser.newContext({reducedMotion:'reduce'});const lp=await local.newPage();
  const localErrors=[];lp.on('pageerror',e=>localErrors.push(e.message));
  for(const file of ['index','choose','routes','detail','finish']){
   await lp.goto(pathToFileURL(path.join(root,file+'.html')).href+'?city=hangzhou&route=hangzhou-nature');
   await lp.locator('h1').first().waitFor();assert.equal(await lp.locator('#nav-city').inputValue(),'hangzhou');
  }
  assert.deepEqual(localErrors,[]);await local.close();results.special.push('file:// five pages');

  // 本地模拟 GitHub Pages 项目子路径，所有相对资源按子路径解析。
  await context.route('**/micro-travel/**',async route=>{
   const relative=decodeURIComponent(new URL(route.request().url()).pathname.replace('/micro-travel/',''));
   const file=path.join(root,relative||'index.html');
   const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml'};
   if(fs.existsSync(file))await route.fulfill({body:fs.readFileSync(file),contentType:types[path.extname(file)]||'text/plain'});else await route.fulfill({status:404});
  });
  await go(base+'micro-travel/choose.html?city=suzhou&period=night');
  await page.locator('[type="submit"]').click();await page.waitForURL('**/micro-travel/routes.html?**');
  assert.equal(await page.locator('.route-card').count(),3);results.special.push('project subpath relative navigation');

  // 最终截图使用确定状态，不写入用户自己的浏览器记录。
  await page.evaluate(()=>localStorage.removeItem('daytrip.appearance.v1'));
  await go(base+'index.html?city=hangzhou&period=day');await snap('home-day');
  await page.locator('#cities').scrollIntoViewIfNeeded();await snap('cities');
  await go(base+'index.html?city=chongqing&period=night');await snap('home-night');
  await go(base+'routes.html?city=hangzhou&period=day');await snap('routes',true);
  await go(base+'choose.html?city=hangzhou&period=day');await snap('choose',true);
  await go(base+'detail.html?city=hangzhou&route=hangzhou-city&period=night');await snap('detail',true);
  await page.setViewportSize({width:390,height:844});await go(base+'index.html?city=hangzhou&period=night');await snap('mobile-home');
  await page.locator('.city-card').first().scrollIntoViewIfNeeded();await snap('mobile-cities');
  await go(base+'routes.html?city=hangzhou&period=night');await snap('mobile-routes',true);
  await page.setViewportSize({width:320,height:844});await go(base+'detail.html?city=chongqing&route=chongqing-nature&period=night');await snap('mobile-detail',true);
  assert.deepEqual(results.errors,[]);
  results.passed=true;
  console.log('PASS special cases and screenshots; console errors:',results.errors.length);
 }catch(error){
  results.passed=false;results.failure=error.stack;
  await page.screenshot({path:path.join(out,'failure.png'),fullPage:true}).catch(()=>{});
  throw error;
 }finally{
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify(results,null,2));await browser.close();
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
