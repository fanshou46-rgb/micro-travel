/* 全国发现、同城榜单与个人足迹。页面视角独立于所在地，记录从 v2 只读派生。 */
window.createDiscoveryUI = function({data,experience,params,city,cityId,period,style,icon,image,link,periodLinks,cityDirectory,planningCard,openDialog,watchImages,onPeriodChosen}) {
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cities=data.discoveryOrder.map(id=>data.cities[id]);
  const routeURL=(id,p)=>{
    const r=data.routes.find(r=>r.id===id);
    return link('detail.html',{city:r.cityId,route:r.id,style:r.theme},p);
  };
  const overviewStats=overview=>[
    [overview.cityCount,'已探索城市'],[overview.placeCount,'不同地点'],
    [overview.tripCount,'已完成行程'],[overview.dualCityCount,'日夜双章城市']
  ].map(([count,label])=>`<div><b>${String(count).padStart(2,'0')}</b><span>${label}</span></div>`).join('');
  const badgePair=id=>{
    const badges=experience.getCityState(id).badges;
    return `<div class="passport-badges" aria-label="${data.cities[id].name}纪念章">${['day','night'].map(p=>`<span class="${badges.includes(p)?'earned':''}">${icon(p==='day'?'sun':'moon')} ${p==='day'?'日光章':'夜游章'}<small>${badges.includes(p)?'已点亮':'待出发'}</small></span>`).join('')}</div>`;
  };
  function globalSummary(){
    const overview=experience.getOverview();
    return `<aside class="passport-summary" id="my-footprints"><span class="eyebrow">MY TRAVEL PASSPORT</span><h3>我的足迹</h3><p>${overview.cityCount?'在不同城市，收集自己的日光与夜色。':'第一段微旅，从你想去的城市开始。'}</p><div class="passport-stats">${overviewStats(overview)}</div><a class="btn" href="${link('footprints.html')}">打开我的旅行护照 ${icon('arrow')}</a><small>本浏览器的模拟探索记录 · 地点去重累计</small></aside>`;
  }
  function selectionCard(item){
    const c=data.cities[item.cityId];
    return `<article class="selection-card" data-selection-city="${c.id}"><a href="${routeURL(item.routeId,item.period)}" data-discovery-period><div class="selection-photo">${image(item.image,`${c.name}主题实景参考`)}<span>${data.periods[item.period].short}灵感</span></div><div class="selection-copy"><small>${c.region} · ${c.name}</small><h3>${item.name}<span aria-hidden="true">↗</span></h3><p>${item.reason}</p></div></a></article>`;
  }
  function home(){
    return `${cityDirectory()}<section class="national-discovery wrap" id="rankings"><div class="section-heading"><div><div class="eyebrow">GOOD PLACES, DIFFERENT CITIES</div><h2>值得出发的<span class="serif-accent">地方。</span></h2></div><p>从目前覆盖的十二座城市，挑一段喜欢的时光。<br>全国精选看灵感，城市榜单做同城比较。</p></div><div class="national-layout"><div><div class="discovery-heading"><div><span class="eyebrow">CURATED LITTLE ESCAPES</span><h3 id="discovery-title">全国精选</h3></div><label for="ranking-city">浏览范围<select id="ranking-city"><option value="">全国精选</option>${cities.map(c=>`<option value="${c.id}">${c.name}城市榜</option>`).join('')}</select></label></div><div id="discovery-content">${nationalPanel(false)}</div></div>${globalSummary()}</div></section>`;
  }
  function nationalPanel(expanded){
    return `<p class="discovery-note">人工挑选 · 每城一项 · 不设全国名次</p><div class="selection-grid">${data.nationalSelections.slice(0,expanded?12:6).map(selectionCard).join('')}</div><button class="selection-expand text-link" data-selection-expand aria-expanded="${expanded}">${expanded?'收起精选':'展开全部十二城'} ${icon('arrow')}</button>`;
  }
  let rankingCity='',rankingType='places',expanded=false;
  function cityRankPanel(){
    const c=data.cities[rankingCity],ranking=data.rankingsByCity[rankingCity];
    const rows=ranking[rankingType];
    return `<div class="city-rank-board"><div class="ranking-tabs" role="tablist" aria-label="${c.name}城市榜"><button type="button" data-local-ranking="places" id="local-places" role="tab" aria-controls="local-rank-panel" aria-selected="${rankingType==='places'}" tabindex="${rankingType==='places'?0:-1}">景点好评榜</button><button type="button" data-local-ranking="users" id="local-users" role="tab" aria-controls="local-rank-panel" aria-selected="${rankingType==='users'}" tabindex="${rankingType==='users'?0:-1}">探索者榜</button><span class="demo-pill">教学示例</span></div><div role="tabpanel" id="local-rank-panel" aria-labelledby="local-${rankingType}"><ol class="ranking-list">${rows.map((item,i)=>rankingType==='places'?`<li><a class="ranking-row" data-discovery-period href="${routeURL(item.route,item.period)}"><span class="rank-number">0${i+1}</span><span class="rank-photo">${image(item.image,`${c.name}主题参考摄影`)}</span><span class="rank-text"><b>${item.name}</b><small>${data.periods[item.period].short}灵感 · ${data.themes[data.routes.find(r=>r.id===item.route).theme].name}</small></span><span class="rank-value">${item.rating.toFixed(1)}<small>${item.reviews} 条示例评价</small></span>${icon('arrow')}</a></li>`:`<li><button class="ranking-row user-ranking" data-local-user="${i}"><span class="rank-number">0${i+1}</span><span class="user-avatar">${item.initials}</span><span class="rank-text"><b>${item.name}</b><small>${item.motto}</small></span><span class="rank-value">${item.places.length}<small>探索地点 · 模拟用户</small></span>${icon('arrow')}</button></li>`).join('')}</ol></div><p class="ranking-note">评分、评价与用户为教学示例，仅用于本城展示，不构成全国排名。</p><a class="text-link" href="${link('routes.html',{city:rankingCity})}">探索${c.name}路线 ${icon('arrow')}</a></div>`;
  }
  function renderRanking(){
    document.getElementById('discovery-title').textContent=rankingCity?`${data.cities[rankingCity].name}${rankingType==='places'?'景点好评榜':'探索者榜'}`:'全国精选';
    const container=document.getElementById('discovery-content');
    container.innerHTML=rankingCity?cityRankPanel():nationalPanel(expanded);watchImages(container);
  }
  function routesPage(){
    const items=data.routes.filter(r=>!cityId||r.cityId===cityId).map(r=>experience.routeView(r,period));
    const preferred=params.has('style');
    items.sort((a,b)=>Number(b.theme===style&&preferred)-Number(a.theme===style&&preferred)||data.discoveryOrder.indexOf(a.cityId)-data.discoveryOrder.indexOf(b.cityId));
    const currentRegion=['华北','华东','华中','华南','西南','西北'].includes(params.get('region'))?params.get('region'):'';
    return `<section class="wrap routes-section"><div class="page-heading"><div class="eyebrow">FIND YOUR NEXT LITTLE ESCAPE</div><h1>${city?`${city.name}，`:'下一站，'}<span class="serif-accent">跟着喜欢出发。</span></h1><p>${city?city.intro:'在十二座城市之间比较风景、预算与步调，找到适合自己的微旅。'}</p></div>${city?`<section class="city-banner">${image(city.images[period==='night'?'night':'city'],`${city.name}城市摄影`)}<div><span class="eyebrow">${city.region} / ${city.english.toUpperCase()}</span><h2>${city.name}，慢慢喜欢。</h2><p>三种兴趣，九段时光。出发之前，选一种舒服的节奏。</p><a href="${link('routes.html',{city:null})}">看看全部城市 ↗</a></div></section>`:''}<div class="route-scope-tools"><label for="route-region">地区<select id="route-region"><option value="">全部地区</option>${['华北','华东','华中','华南','西南','西北'].map(r=>`<option ${r===currentRegion?'selected':''}>${r}</option>`).join('')}</select></label><label for="route-city">目的地<select id="route-city"><option value="">全部城市</option>${cities.map(c=>`<option value="${c.id}" ${c.id===cityId?'selected':''}>${c.name}</option>`).join('')}</select></label><label for="route-search">路线或景点<input id="route-search" type="search" value="${esc(params.get('q')||'')}" placeholder="搜索景点、城市或路线" autocomplete="off"></label></div>${periodLinks('routes.html',{region:currentRegion||null,q:params.get('q')||null,filter:params.get('filter')||null})}<div class="route-filters route-theme-filters" role="group" aria-label="旅行兴趣">${[['all','全部兴趣'],...Object.entries(data.themes).map(([k,v])=>[k,v.name])].map(([k,name])=>`<button class="filter" data-filter="${k}" aria-pressed="false">${name}</button>`).join('')}</div><p class="route-result-count" aria-live="polite"></p><div class="route-grid">${items.map(item=>{
      const c=data.cities[item.cityId];
      const search=[c.name,c.id,c.english,item.name,...item.keywords,...Object.values(item.variants).flatMap(v=>[v.name,...v.stops.map(s=>s[4])])].join(' ');
      return `<article class="route-card" data-theme="${item.theme}" data-route-city="${c.id}" data-route-region="${c.region}" data-search="${esc(search)}"><a class="route-photo" href="${routeURL(item.id,period)}">${image(item.image,`${c.name}主题实景参考`)}<span class="route-photo-caption">${c.name} / ${c.english.toUpperCase()}</span></a><div class="route-card-body"><div class="route-card-meta"><span class="tag ${data.themes[item.theme].color}">${icon(data.themes[item.theme].icon)} ${data.themes[item.theme].name}</span><span>${data.periods[period].short}</span></div><h2><a href="${routeURL(item.id,period)}">${item.name}</a></h2><p>${item.intro}</p><div class="keywords">${item.keywords.map(k=>`<span>${k}</span>`).join('')}</div><div class="route-hours">${icon('clock')} ${item.hours}<span>${item.stops.length} 个时刻</span></div>${planningCard(item)}<div class="route-card-bottom"><span>${c.region} · ${c.name}</span><a class="btn btn-small" href="${routeURL(item.id,period)}">查看行程 ${icon('arrow')}</a></div></div></article>`;
    }).join('')}</div><div class="route-empty" hidden><h2>暂时没有匹配的路线</h2><p>试试其他地区、兴趣或关键词。</p><button class="btn" data-reset-routes>清除筛选</button></div><div class="route-help"><div><span class="eyebrow">YOUR OWN PACE</span><h3>城市是目的地，足迹属于你。</h3><p>预算和行程为教学参考；实际开放、交通和消费请出发前核实。</p></div><a class="text-link" href="${link('footprints.html')}">查看我的跨城足迹 ${icon('arrow')}</a></div></section>`;
  }
  function footprintCard(own){
    const c=data.cities[own.cityId];
    return `<article class="footprint-city" data-footprint-city="${c.id}" data-explored="${own.hasRecords}"><div class="footprint-city-heading">${image(c.images.city,`${c.name}城市参考摄影`)}<div><small>${c.region} / ${c.english.toUpperCase()}</small><h2>${c.name}</h2></div><span class="footprint-status">${own.hasRecords?'已留下足迹':'待出发'}</span></div><div class="footprint-counts"><span><b>${own.visited.length}</b> 探索地点</span><span><b>${own.completed.length}</b> 完成行程</span></div>${badgePair(c.id)}<details class="footprint-records"><summary>查看地点与已完成行程</summary><h3>探索地点</h3>${own.visited.length?`<ul class="explored-places">${own.visited.map(id=>`<li>${icon('check')}${data.places[id].name}</li>`).join('')}</ul>`:'<p>这里还没有探索记录。</p>'}<h3>已完成行程</h3>${own.completed.length?`<ul class="completed-trips">${own.completed.map(entry=>{
      const [id,p]=entry.split(':');const r=data.routes.find(r=>r.id===id);return `<li><a data-discovery-period href="${routeURL(id,p)}">${experience.routeView(r,p).name}<span>重看行程 ↗</span></a></li>`;
    }).join('')}</ul>`:'<p>完成一段微旅后，行程会保存在这里。</p>'}</details><div class="footprint-city-actions"><a class="text-link" href="${link('routes.html',{city:c.id})}">${own.hasRecords?'继续探索':'去认识这座城'} ${icon('arrow')}</a>${own.badges.length===2&&own.completed.length?`<a class="text-link" href="${link('finish.html',{city:c.id,route:own.completed[0].split(':')[0]},own.completed[0].split(':')[1])}">查看双面卡 ${icon('camera')}</a>`:''}</div></article>`;
  }
  function footprintsPage(){
    const overview=experience.getOverview();
    const order=[...overview.cities].sort((a,b)=>Number(b.hasRecords)-Number(a.hasRecords));
    return `<section class="footprints-page wrap"><div class="page-heading"><div class="eyebrow">MY TRAVEL PASSPORT</div><h1>每一次出发，<span class="serif-accent">都算数。</span></h1><p>我的足迹 · 一本属于自己的跨城旅行护照</p></div><div class="passport-overview"><div><span class="eyebrow">LITTLE MOMENTS, ACROSS CITIES</span><h2>我的足迹</h2><p>城市各有故事，日光与夜色都值得收藏。</p></div><div class="passport-stats">${overviewStats(overview)}</div></div>${!overview.cityCount?`<div class="passport-empty"><div>${icon('map')}<h2>第一段微旅，从你想去的城市开始。</h2><p>选一座城市，完成行程后，这里就会收好你的地点、行程与纪念章。</p></div><a class="btn" href="${link('index.html')}#cities">发现想去的城市 ${icon('arrow')}</a></div>`:''}<div class="footprint-toolbar"><div role="group" aria-label="足迹范围"><button class="filter active" data-foot-mode="all" aria-pressed="true">全部城市</button><button class="filter" data-foot-mode="visited" aria-pressed="false">已探索</button></div><label for="footprint-city">查看城市<select id="footprint-city"><option value="">全部城市</option>${cities.map(c=>`<option value="${c.id}" ${params.get('city')===c.id?'selected':''}>${c.name}</option>`).join('')}</select></label></div><p class="footprint-result-count" aria-live="polite"></p><div class="footprint-grid">${order.map(footprintCard).join('')}</div><div class="footprint-filter-empty" hidden><h3>这个范围还没有足迹</h3><p>换一个城市，或去开始下一段微旅。</p><a class="text-link" href="${link('index.html')}#cities">发现下一座城 ${icon('arrow')}</a></div><p class="passport-storage-note">仅本浏览器的模拟记录；重复地点不累加，已完成行程按路线与时段去重。${experience.isPersistent()?'':' 当前浏览器存储不可用，刷新或跨页后记录可能无法保留。'}</p></section>`;
  }
  function missingRoute(){
    return `<section class="wrap missing-route"><span class="eyebrow">YOUR NEXT LITTLE ESCAPE</span>${icon('map')}<h1>${params.has('route')?'暂时没有找到这段行程':'先选一段想去的行程'}</h1><p>从目的地或旅行心情出发，找到属于你的微旅。</p><div><a class="btn" href="${link('choose.html')}">选择目的地 ${icon('arrow')}</a><a class="btn btn-outline" href="${link('routes.html')}">浏览路线</a></div></section>`;
  }
  function mount(){
    document.getElementById('ranking-city')?.addEventListener('change',event=>{
      rankingCity=event.target.value;rankingType='places';expanded=false;renderRanking();
    });
    document.addEventListener('click',event=>{
      if(event.target.closest('[data-discovery-period]'))onPeriodChosen();
      if(event.target.closest('[data-selection-expand]')){expanded=!expanded;renderRanking();document.querySelector('[data-selection-expand]')?.focus();}
      const tab=event.target.closest('[data-local-ranking]');
      if(tab){rankingType=tab.dataset.localRanking;renderRanking();document.getElementById(`local-${rankingType}`).focus();}
      const userButton=event.target.closest('[data-local-user]');
      if(userButton){
        const user=data.rankingsByCity[rankingCity].users[Number(userButton.dataset.localUser)];
        openDialog(`<div class="dialog-body explorer-dialog"><span class="demo-pill">模拟用户</span><h2 id="dialog-title">${user.name}的${data.cities[rankingCity].name}手记</h2><p>${user.motto}</p><ul class="explored-places">${user.places.map(id=>`<li>${icon('check')}${data.places[id].name}</li>`).join('')}</ul><p class="dialog-disclaimer">虚构用户与示例记录，仅用于本城探索者榜展示。</p></div>`,userButton);
      }
    });
    document.addEventListener('keydown',event=>{
      if(!event.target.matches('[data-local-ranking]')||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();rankingType=event.key==='Home'?'places':event.key==='End'?'users':rankingType==='places'?'users':'places';renderRanking();document.getElementById(`local-${rankingType}`).focus();
    });
    if(document.getElementById('route-search'))mountRoutes();
    if(document.getElementById('footprint-city'))mountFootprints();
  }
  function mountRoutes(){
    let activeFilter=Object.hasOwn(data.themes,params.get('filter'))?params.get('filter'):'all';
    const region=document.getElementById('route-region'),destination=document.getElementById('route-city'),search=document.getElementById('route-search');
    const values=()=>({city:destination.value||null,region:region.value||null,q:search.value.trim()||null,filter:activeFilter==='all'?null:activeFilter});
    function update(){
      const q=search.value.trim().toLowerCase();let count=0;
      document.querySelectorAll('.route-card').forEach(card=>{
        card.hidden=(region.value&&card.dataset.routeRegion!==region.value)||(activeFilter!=='all'&&card.dataset.theme!==activeFilter)||!card.dataset.search.toLowerCase().includes(q);
        if(!card.hidden)count++;
      });
      document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===activeFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      document.querySelector('.route-empty').hidden=count!==0;
      document.querySelector('.route-result-count').textContent=`${city?city.name:'全部城市'} · 找到 ${count} 条${data.periods[period].name}路线`;
      const url=link('routes.html',values());
      history.replaceState(null,'',url);
      // 详情回到原筛选结果，而不是丢掉全国范围、关键词或兴趣。
      document.querySelectorAll('.route-card a').forEach(a=>{
        const detail=new URL(a.href);detail.searchParams.set('returnTo',url);
        a.setAttribute('href',`detail.html?${detail.searchParams}`);
      });
      document.querySelectorAll('.period-links a').forEach((a,i)=>a.href=link('routes.html',values(),Object.keys(data.periods)[i]));
    }
    search.addEventListener('input',update);
    region.addEventListener('change',()=>{
      if(destination.value&&region.value&&data.cities[destination.value].region!==region.value)location.href=link('routes.html',{city:null,region:region.value,filter:activeFilter==='all'?null:activeFilter});
      else update();
    });
    destination.addEventListener('change',()=>{
      const compatible=!destination.value||!region.value||data.cities[destination.value].region===region.value;
      location.href=link('routes.html',{city:destination.value||null,region:compatible?region.value||null:null,filter:activeFilter==='all'?null:activeFilter});
    });
    document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{activeFilter=button.dataset.filter;update();}));
    document.querySelector('[data-reset-routes]').addEventListener('click',()=>{search.value='';region.value='';activeFilter='all';update();search.focus();});
    update();
  }
  function mountFootprints(){
    let mode=params.get('mode')==='visited'?'visited':'all';
    const destination=document.getElementById('footprint-city');
    function update(){
      let count=0;
      document.querySelectorAll('[data-footprint-city]').forEach(card=>{
        card.hidden=(destination.value&&destination.value!==card.dataset.footprintCity)||(mode==='visited'&&card.dataset.explored!=='true');if(!card.hidden)count++;
      });
      document.querySelectorAll('[data-foot-mode]').forEach(button=>{const active=button.dataset.footMode===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
      document.querySelector('.footprint-result-count').textContent=`${count} 座城市 · ${mode==='visited'?'已探索':'全部足迹范围'}`;
      document.querySelector('.footprint-filter-empty').hidden=count!==0;
      history.replaceState(null,'',link('footprints.html',{city:destination.value||null,mode:mode==='visited'?'visited':null}));
    }
    document.querySelectorAll('[data-foot-mode]').forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.footMode;update();}));
    destination.addEventListener('change',update);update();
  }
  return {home,routesPage,footprintsPage,missingRoute,mount};
};
