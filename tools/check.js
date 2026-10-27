/* 数据关系、摄影授权、静态路径与脚本检查。浏览器另验。 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {boot,scripts,root}=require('./load-data');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {data}=boot();
assert.equal(Object.keys(data.cities).length,12);
assert.equal(data.routes.length,36);
assert.equal(new Set(data.routes.map(r=>r.id)).size,36);
assert.equal(Object.keys(data.themes).length,3);
assert.equal(data.nationalSelections.length,12);
assert.equal(new Set(data.nationalSelections.map(p=>p.cityId)).size,12);
assert.equal(new Set(data.nationalSelections.slice(0,6).map(p=>data.cities[p.cityId].region)).size,6);
for(const item of data.nationalSelections){
 const route=data.routes.find(r=>r.id===item.routeId);
 assert.equal(route.cityId,item.cityId);assert.ok(route.variants[item.period]);
 assert.ok(item.reason&&item.image);
 assert.ok(!Object.hasOwn(item,'rating')&&!Object.hasOwn(item,'rank'),'全国精选不设评分或名次');
}
const photos=new Set();
for(const city of Object.values(data.cities)){
 const routes=data.routes.filter(r=>r.cityId===city.id);
 assert.equal(routes.length,3,city.id);
 assert.equal(new Set(routes.map(r=>r.theme)).size,3);
 for(const image of Object.values(city.images))photos.add(image);
 assert.ok(city.sources.length>0,`${city.id} 缺少官方内容来源`);
 assert.ok(data.rankingsByCity[city.id].places.every(p=>routes.some(r=>r.id===p.route)));
 assert.equal(data.rankingsByCity[city.id].places.length,5);
 for(const p of data.rankingsByCity[city.id].places)assert.ok(!/入口|休息|返程|接入点|地铁站/.test(p.name),p.name);
 for(const u of data.rankingsByCity[city.id].users){
  assert.equal(new Set(u.places).size,u.places.length);
  assert.ok(u.places.every(id=>data.places[id]?.cityId===city.id));
 }
}
const signatures=new Set();
for(const route of data.routes){
 assert.ok(data.cities[route.cityId]&&data.themes[route.theme]);
 const plan=data.planning[route.id];
 assert.ok(plan.audience&&plan.access&&plan.focus&&plan.alternative&&plan.intensity);
 assert.equal(plan.checks.length,2);
 assert.equal(data.stays.filter(s=>s.route===route.id).length,2);
 assert.ok(data.offers[route.id]?.name);
 for(const period of ['day','night','full']){
  const trip=route.variants[period];
  assert.equal(trip.stops.length,period==='full'?6:4);
  assert.ok(trip.placeIds.length>0);
  assert.equal(new Set(trip.placeIds).size,trip.placeIds.length);
  assert.ok(trip.placeIds.every(id=>data.places[id]?.cityId===route.cityId));
  let previous=-1;
  for(const stop of trip.stops){
   assert.match(stop[0],/^\d{2}:\d{2}$/);
   const [h,m]=stop[0].split(':').map(Number),t=h*60+m;
   assert.ok(h<24&&m<60&&t>previous,route.id+period);previous=t;
   assert.ok(stop[1]&&stop[2]&&stop[3]&&stop[4]);
   if(stop[5])photos.add(stop[5]);
  }
  photos.add(trip.image);
  signatures.add(JSON.stringify(trip.stops));
  assert.equal(plan.budgets[period].length,3);
  for(const [low,high] of plan.budgets[period])assert.ok(Number.isFinite(low)&&low>=0&&Number.isFinite(high)&&high>=low);
 }
}
assert.equal(signatures.size,108,'108 套行程应分别编写');
for(const name of [...photos,'hero','forest','stay-room','stay-house']){
 const b=fs.readFileSync(path.join(root,'assets/images',name+'.jpg'));
 assert.ok(b.length>10000&&b[0]===255&&b[1]===216,name);
}
const metadata=JSON.parse(read('assets/city-photos.json'));
assert.equal(Object.keys(metadata).length,44);
for(const [id,p] of Object.entries(metadata)){
 assert.ok(p.artist&&p.source&&p.license,id+' attribution');
 assert.match(p.license,/CC BY|CC0|Public domain/i);
}
for(const file of [...scripts,'tools/serve.js'])new vm.Script(read(file),{filename:file});
for(const file of ['index.html','choose.html','routes.html','detail.html','finish.html','footprints.html']){
 const source=read(file);
 assert.deepEqual([...source.matchAll(/<script src="([^"]+)" defer><\/script>/g)].map(m=>m[1]),scripts,'各页数据顺序一致');
 for(const match of source.matchAll(/(?:src|href)="([^"\s]+)"/g)){
  const target=match[1].split(/[?#]/)[0];
  if(target&&!/^(https?:|data:)/.test(target))assert.ok(fs.existsSync(path.join(root,target)),target);
 }
}
assert.ok(!read('js/main.js').includes('fetch('));
require('./check-experience');
console.log(`PASS · v${data.version} · 12 城 / 36 路线 / 108 套行程，${photos.size} 张城市摄影，授权、预算、路径与语法。`);
