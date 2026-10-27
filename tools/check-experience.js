/* 真正影响用户的城市隔离、迁移、去重、旧链接与存储降级。 */
const assert=require('node:assert/strict');
const {boot}=require('./load-data');
const storage=new Map();
let {data,api}=boot(storage);
assert.equal(api.routeView(data.routes[0],'night').transport,'步行 / 公共交通','旧武汉夜线不沿用日间骑行');
const periodCases=[['','full'],['duration=half','day'],['duration=day','full'],['period=night&duration=half','night'],['period=bad&duration=half','full'],['period=__proto__','full']];
for(const [q,want] of periodCases)assert.equal(api.normalizePeriod(new URLSearchParams(q)),want);
for(const [q,page,city,route] of [
 ['','detail',null,null],['city=bad','routes',null,null],['city=__proto__','detail',null,null],
 ['city=wuhan','home',null,null],['city=hangzhou','footprints',null,null],['','choose',null,null],
 ['route=jianghan','detail','wuhan','jianghan'],['city=beijing&route=hangzhou-city','detail','hangzhou','hangzhou-city'],
 ['city=hangzhou&route=bad','detail','hangzhou',null],['city=hangzhou&route=donghu','finish','wuhan','donghu'],
 ['city=shanghai&route=donghu','routes','shanghai',null]
]){
 const actual=api.resolveContext(new URLSearchParams(q),page);assert.equal(actual.cityId,city);assert.equal(actual.route?.id||null,route);assert.equal(actual.scope,city?'city':'all');
}
api.complete('donghu','day');api.complete('donghu','day');api.complete('donghu','full');
assert.equal(api.getState().visited.length,3);
assert.equal(api.getCityState('wuhan').badges.length,1);
api.complete('hangzhou-city','night');
assert.equal(api.getOverview().cityCount,2);
assert.equal(api.getOverview().tripCount,3,'同路线的不同时段是不同的完成行程');
assert.equal(api.getOverview().dualCityCount,0);
const beforeRead=JSON.stringify(api.getState());api.getOverview();api.getOverview();
assert.equal(JSON.stringify(api.getState()),beforeRead,'全局总览必须只读');
assert.equal(api.getCityState('hangzhou').badges.join(','),'night');
assert.equal(api.getCityState('wuhan').badges.join(','),'day','跨城不合并双章');
api.complete('jianghan','night');
assert.equal(api.getCityState('wuhan').badges.length,2);
assert.equal(api.getOverview().dualCityCount,1);
const before=JSON.stringify(api.getState());api.complete('bad','night');api.complete('donghu','bad');
assert.equal(JSON.stringify(api.getState()),before);
api.selectStay('donghu','day','lake-room');
assert.equal(api.selectedStay('donghu','day').id,'lake-room');
assert.equal(api.selectedStay('donghu','night'),null);
api.selectStay('donghu','day','hangzhou-nature-room');
assert.equal(api.selectedStay('donghu','day').id,'lake-room');
api=boot(storage).api;assert.equal(api.selectedStay('donghu','day').id,'lake-room');
api.selectStay('donghu','day',null);assert.equal(api.selectedStay('donghu','day'),null);
// 旧键保留，v2 迁移一次，恢复旧的武汉纪念章及住宿。
const legacy={visited:['tingtao','tingtao','invalid'],badges:['day','night'],completed:['donghu:day'],stays:{'donghu:day':'lake-room'}};
const old=JSON.stringify(legacy),migration=new Map([['daytrip.exploration.v1',old]]);
api=boot(migration).api;
assert.equal(api.getCityState('wuhan').visited.length,1);
assert.equal(api.getCityState('wuhan').badges.length,2);
assert.equal(api.getCityState('hangzhou').badges.length,0);
assert.equal(api.selectedStay('donghu','day').id,'lake-room');
assert.equal(migration.get('daytrip.exploration.v1'),old);
api.complete('hangzhou-food','day');
const migrated=JSON.stringify(api.getState());
migration.set('daytrip.exploration.v1',JSON.stringify({...legacy,visited:['greenway']}));
api=boot(migration).api;assert.equal(JSON.stringify(api.getState()),migrated,'不能重复迁移覆盖 v2');
for(const raw of ['{bad-json','null','[]','42']){
 const map=new Map([['daytrip.exploration.v2',raw]]);
 assert.equal(boot(map).api.getState().visited.length,0);
}
for(const options of [{blocked:true},{quota:true}]){
 api=boot(new Map(),options).api;api.complete('donghu','day');
 assert.equal(api.getState().visited.length,3);
 assert.equal(api.isPersistent(),false);
}
// 每城完成两种时段只点亮本城；重复完整流程保持去重。
api=boot(new Map()).api;
for(const cityId of Object.keys(data.cities)){
 const route=data.routes.find(r=>r.cityId===cityId);
 api.complete(route.id,'day');api.complete(route.id,'night');
 assert.equal(api.getCityState(cityId).badges.length,2);
 const count=api.getCityState(cityId).visited.length;
 api.complete(route.id,'day');api.complete(route.id,'night');
 assert.equal(api.getCityState(cityId).visited.length,count);
}
console.log('PASS · 城市上下文、旧记录一次迁移、跨城纪念章隔离、去重、延住与存储异常。');
