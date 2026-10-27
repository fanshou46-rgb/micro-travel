/* 城市上下文、旧记录迁移、地点去重与延住状态。无账号或服务器写入。 */
(() => {
  'use strict';
  const data = window.Daytrip;
  const key = 'daytrip.exploration.v2';
  const legacyKey = 'daytrip.exploration.v1';
  const blank = () => ({visited:[],badgesByCity:{},completed:[],stays:{}});
  let memory = blank(), storageAvailable = true;
  const valid = (items,allow) => Array.isArray(items)?[...new Set(items.filter(x=>allow.includes(x)))]:[];
  const completedIds = data.routes.flatMap(r=>Object.keys(data.periods).map(p=>`${r.id}:${p}`));
  function sanitize(raw) {
    const stays = {}, badgesByCity = {};
    for (const r of data.routes) for (const p of Object.keys(data.periods)) {
      const id = raw?.stays?.[`${r.id}:${p}`];
      if (data.stays.some(s=>s.id===id&&s.route===r.id)) stays[`${r.id}:${p}`]=id;
    }
    for (const cityId of Object.keys(data.cities)) {
      const badges=valid(raw?.badgesByCity?.[cityId],['day','night']);
      if (badges.length) badgesByCity[cityId]=badges;
    }
    return {visited:valid(raw?.visited,Object.keys(data.places)),completed:valid(raw?.completed,completedIds),badgesByCity,stays};
  }
  function getState(){return JSON.parse(JSON.stringify(memory));}
  function save(next){
    memory=sanitize(next);
    try {localStorage.setItem(key,JSON.stringify(memory));storageAvailable=true;}
    catch {storageAvailable=false;}
    return getState();
  }
  try {
    const stored=localStorage.getItem(key);
    if (stored!==null) {
      try {memory=sanitize(JSON.parse(stored));} catch {memory=blank();}
    } else {
      const legacy=localStorage.getItem(legacyKey);
      if (legacy!==null) {
        try {
          const old=JSON.parse(legacy);
          // 1.x 的所有记录都属于武汉；不覆盖旧键，v2 存在后不再重放迁移。
          memory=sanitize({...old,badgesByCity:{wuhan:old?.badges}});
        } catch {memory=blank();}
        save(memory);
      }
    }
  } catch {storageAvailable=false;}
  function normalizePeriod(params){
    if (params.has('period')) return Object.hasOwn(data.periods,params.get('period'))?params.get('period'):'full';
    return params.get('duration')==='half'?'day':'full';
  }
  function resolveContext(params,page='routes'){
    const explicit=data.routes.find(r=>r.id===params.get('route'));
    const requested=Object.hasOwn(data.cities,params.get('city'))?params.get('city'):null;
    const itinerary=['detail','finish'].includes(page);
    const cityId=['home','footprints'].includes(page)?null:itinerary?(explicit?.cityId||requested):requested;
    return {scope:cityId?'city':'all',cityId,city:cityId?data.cities[cityId]:null,route:itinerary?(explicit||null):null};
  }
  function getCityState(cityId){
    const state=getState();
    return {visited:state.visited.filter(id=>data.places[id].cityId===cityId),badges:state.badgesByCity[cityId]||[],completed:state.completed.filter(id=>data.routes.some(r=>r.cityId===cityId&&id.startsWith(r.id+':'))),stays:state.stays};
  }
  // 汇总是只读派生结果；不新建存储键，也不为旧记录补造时间。
  function getOverview(){
    const state=getState();
    const cities=(data.discoveryOrder||Object.keys(data.cities)).map(cityId=>{
      const own=getCityState(cityId);
      return {cityId,...own,hasRecords:own.visited.length>0||own.completed.length>0||own.badges.length>0};
    });
    return {cityCount:cities.filter(c=>c.hasRecords).length,placeCount:state.visited.length,tripCount:state.completed.length,dualCityCount:cities.filter(c=>c.badges.length===2).length,cities};
  }
  function routeView(route,period){
    const variant=route.variants[period];
    return {...route,...variant,transport:variant.transport||(period==='night'?'步行 / 公共交通':route.transport),period};
  }
  function selectedStay(routeId,period){return data.stays.find(s=>s.id===memory.stays[`${routeId}:${period}`]&&s.route===routeId)||null;}
  function selectStay(routeId,period,stayId){
    if (!data.routes.some(r=>r.id===routeId)||!Object.hasOwn(data.periods,period))return getState();
    const next=getState(),entry=`${routeId}:${period}`;
    if (!stayId)delete next.stays[entry];
    else if(data.stays.some(s=>s.id===stayId&&s.route===routeId)) next.stays[entry]=stayId;
    return save(next);
  }
  function complete(routeId,period){
    const route=data.routes.find(r=>r.id===routeId);
    if(!route||!Object.hasOwn(data.periods,period))return getState();
    const next=getState();
    next.visited.push(...route.variants[period].placeIds);
    next.badgesByCity[route.cityId]||=[];
    next.badgesByCity[route.cityId].push(period==='night'?'night':'day');
    next.completed.push(`${routeId}:${period}`);
    return save(next);
  }
  window.DaytripExperience={getState,getCityState,getOverview,normalizePeriod,resolveContext,routeView,selectedStay,selectStay,complete,isPersistent:()=>storageAvailable};
})();
