const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/detail.html?route=donghu&period=day&style=nature');
  await page.evaluate(()=>{document.querySelectorAll('img').forEach(x=>x.loading='eager')});
  await page.evaluate(()=>Promise.all([...document.images].map(x=>x.decode().catch(()=>{}))));
  await page.locator('.detail-grid').screenshot({path:__dirname+'/timeline.png',animations:'disabled',style:'.skip-link:not(:focus) { visibility: hidden; }'});
  console.log('Captured timeline without the offscreen skip-link overlay from full-element screenshot stitching.');
  await browser.close();
})();
