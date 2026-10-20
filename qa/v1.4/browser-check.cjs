const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless: true, channel: 'msedge'});
  const page = await browser.newPage({ viewport: {width: 1440, height: 1080}, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  const base = 'http://127.0.0.1:4173/';
  const out = __dirname;
  const checks = [];
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({width, height: 1080});
    for (const theme of ['day', 'night']) {
      for (const file of ['index.html', 'choose.html', 'routes.html', 'detail.html', 'finish.html']) {
        await page.goto(`${base}${file}?route=donghu&period=${theme}&style=nature`);
        await page.evaluate(() => document.fonts.ready);
        await page.emulateMedia({reducedMotion:'reduce'});
        const size = await page.evaluate(() => ({scroll: document.documentElement.scrollWidth, viewport: innerWidth}));
        assert(size.scroll <= size.viewport + 1, `${width} ${theme} ${file} overflow ${JSON.stringify(size)}`);
        assert(await page.locator('h1:visible').count() >= 1);
        if (file === 'routes.html') {
          assert.equal(await page.locator('.planning-card').count(), 3);
          await page.locator('[data-filter="food"]').click();
          assert.equal(await page.locator('.route-card:visible').count(), 1);
        }
        if (file === 'detail.html') {
          assert.equal(await page.locator('[data-departure-check]').count(), 4);
          await page.locator('[data-departure-check]').first().check();
          assert.match(await page.locator('.checklist-status').textContent(), /1 \/ 4/);
        }
        checks.push({width,theme,file,overflow:false});
      }
    }
  }
  // 九套路线均有独立预算、核对清单与可用的反选状态。
  for (const route of ['donghu','jianghan','wuhan-food']) for (const period of ['day','night','full']) {
    await page.goto(`${base}detail.html?route=${route}&period=${period}`);
    const expected = await page.evaluate(({route, period}) => {
      const b=window.Daytrip.planning[route].budgets[period];
      return b.reduce((s,x)=>s+x[0],0)+'–'+b.reduce((s,x)=>s+x[1],0);
    },{route,period});
    assert((await page.locator('.budget-total').textContent()).includes(expected));
    await page.locator('[data-departure-check]').evaluateAll(items=>items.forEach(x=>x.click()));
    assert.match(await page.locator('.checklist-status').textContent(), /4 \/ 4/);
    await page.locator('[data-departure-check]').first().uncheck();
    assert.match(await page.locator('.checklist-status').textContent(), /3 \/ 4/);
    await page.locator('.plan-alternative summary').click();
    assert(await page.locator('.plan-alternative p').isVisible());
  }
  // 通过两步选择进入结果，再查看详情和收藏；自查不增加探索记录。
  await page.goto(base+'choose.html');
  await page.locator('[name="period"][value="night"]').check();
  await page.locator('label').filter({has: page.locator('[name="style"][value="city"]')}).click();
  assert(await page.locator('[name="style"][value="city"]').isChecked());
  await page.locator('[type="submit"]').click();
  assert(page.url().includes('period=night') && page.url().includes('style=city'));
  assert.equal(await page.locator('.route-card').first().getAttribute('data-theme'),'city');
  await page.locator('.route-card').first().getByRole('link',{name:'查看行程'}).click();
  const before = await page.evaluate(()=>window.DaytripExperience.getState());
  await page.locator('[data-departure-check]').first().check();
  assert.deepEqual(await page.evaluate(()=>window.DaytripExperience.getState()),before);
  await page.getByRole('button',{name:'查看住宿'}).first().click();
  await page.locator('[data-stay-select]').click();
  await page.locator('[data-complete]').click();
  assert(page.url().includes('finish.html'));
  assert(await page.locator('.memory-stay').isVisible());
  assert.match(await page.locator('.finish-note').textContent(), /模拟完成/);
  // 课程报告使用实际浏览器截取的页面区域，禁用动画以稳定图片。
  await page.setViewportSize({width:1440,height:1080});
  const shots = [
    ['choose','choose.html?period=day&style=nature','.planner-section'],
    ['routes','routes.html?period=day&style=nature','.routes-section'],
    ['detail','detail.html?route=donghu&period=day&style=nature','.planning-overview'],
    ['checklist','detail.html?route=donghu&period=day&style=nature','.departure-checklist'],
    ['timeline','detail.html?route=donghu&period=day&style=nature','.detail-grid'],
    ['stay','detail.html?route=donghu&period=day&style=nature','.stay-section'],
    ['home-day','index.html?period=day',null],
    ['home-night','index.html?period=night',null],
    ['home-value','index.html?period=day','.planner-bridge'],
    ['finish','finish.html?route=jianghan&period=night&style=city','.finish-section']
  ];
  for(const [name,url,selector] of shots) {
    await page.evaluate(()=>localStorage.removeItem('daytrip.appearance.v1'));
    await page.goto(base+url);
    await page.evaluate(()=>{document.querySelectorAll('.reveal').forEach(x=>x.classList.add('visible')); document.querySelectorAll('img').forEach(x=>x.loading='eager');});
    await page.evaluate(()=>Promise.all([...document.images].map(x=>x.decode().catch(()=>{}))));
    if(selector) await page.locator(selector).screenshot({path:path.join(out,name+'.png'),animations:'disabled',style:'.skip-link:not(:focus) { visibility: hidden; }'});
    else await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'detail.html?route=jianghan&period=night&style=city');
  await page.locator('.planning-overview').screenshot({path:path.join(out,'mobile-planning.png'),animations:'disabled'});
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'browser-results.json'),JSON.stringify({date:'2026-10-20',checks,combinations:9,flow:'choose → routes → detail → stay → finish',errors},null,2));
  console.log(`PASS ${checks.length} page/width/period checks, 9 route plans, preference → stay → finish flow, screenshots; no console errors.`);
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
