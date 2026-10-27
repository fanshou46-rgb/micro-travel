/* 单独复核用户正在使用的 file:// 模式，不触碰用户浏览器档案。 */
const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'});
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 try{
  const root=path.resolve(__dirname,'../..');
  await p.goto(pathToFileURL(path.join(root,'detail.html')).href+'?route=donghu&period=day');
  await p.locator('[data-complete]').click();await p.waitForURL('**/finish.html?**');
  await p.locator('.finish-passport-links a').last().click();await p.waitForURL('**/footprints.html?**');
  const stats=await p.locator('.passport-stats b').allTextContents();
  assert.equal(stats.join(','),'01,03,01,00');assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(__dirname,'file-flow.json'),JSON.stringify({version:'1.6',passed:true,stats,errors},null,2));
  console.log('PASS file:// UI completion to global footprints: 1 city, 3 places, 1 trip');
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
