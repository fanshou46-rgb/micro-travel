/* 页面渲染与交互。普通脚本 + 相对链接，兼容静态托管与直接打开。 */
(() => {
  "use strict";
  const data = window.Daytrip;
  const experience = window.DaytripExperience;
  const { themes, routes, periods } = data;
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  let period = experience.normalizePeriod(params);
  // 外观与旅行时段分开：手动切换只改皮肤，明确重选时段后恢复自动联动。
  const appearanceKey = "daytrip.appearance.v1";
  let appearanceOverride = null;
  try {
    const saved = localStorage.getItem(appearanceKey);
    if (saved === "day" || saved === "night") appearanceOverride = saved;
  } catch { /* 存储被禁用时，当前页面仍可切换。 */ }
  function rememberAppearance(value) {
    appearanceOverride = value;
    try {
      if (value) localStorage.setItem(appearanceKey, value);
      else localStorage.removeItem(appearanceKey);
    } catch { /* 不阻断界面操作。 */ }
  }
  const style = Object.hasOwn(themes, params.get("style"))
    ? params.get("style")
    : "nature";
  const context = experience.resolveContext(params, page);
  const { city, cityId, route: baseRoute } = context;
  const stories = data.nationalStories;
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const route = baseRoute ? experience.routeView(baseRoute, period) : null;
  document.body.dataset.scope = context.scope;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const paths = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    back: '<path d="m14 5-7 7 7 7M7 12h14"/>',
    leaf: '<path d="M20 4C10 2 3 8 5 15c2 7 15 5 15-11Z"/><path d="m4 21 11-12M9 15v-5m0 5h5"/>',
    building:
      '<path d="M4 21V8h7v13M11 21V3h9v18M2 21h20M7 11v1m0 4v1m8-10h1m-1 5h1m-1 5h1"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0Zm4 9h10M9 3c-3 3 3 3 0 6m6-6c-3 3 3 3 0 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    moon: '<path d="M20 14A9 9 0 0 1 10 4a9 9 0 1 0 10 10Z"/><path d="M18 3v4m-2-2h4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    bike: '<circle cx="5" cy="16" r="4"/><circle cx="19" cy="16" r="4"/><path d="m5 16 5-9 4 9H5m5-9H7m7 9 3-11h-3"/>',
    camera:
      '<path d="M3 7h5l2-3h4l2 3h5v13H3Z"/><circle cx="12" cy="13" r="4"/>',
    flag: '<path d="M5 22V3m0 1c5-5 9 5 15 0v10c-6 5-10-5-15 0"/>',
    map: '<path d="m3 5 6-2 6 3 6-2v15l-6 2-6-3-6 2ZM9 3v15m6-12v15"/>',
    coffee:
      '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Zm12 0h2a3 3 0 0 1 0 6h-2M8 2v3m4-3v3M2 22h18"/>',
    sparkle: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    heart:
      '<path d="M20 5c-3-3-7-1-8 1-1-2-5-4-8-1-5 5 8 15 8 15S25 10 20 5Z"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="m8 4 12 8-12 8Z"/>',
    bed: '<path d="M3 20V6m0 8h18v6M3 10h6v4M9 9h9a3 3 0 0 1 3 3v2M3 17h18"/>',
    trophy:
      '<path d="M8 3h8v7a4 4 0 0 1-8 0ZM8 5H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4M12 14v6m-5 1h10"/>',
  };
  function icon(name) {
    return `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
  }
  const arrow = icon("arrow");
  const logo = `<svg class="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="27" cy="15" r="8" fill="#E5AE6F"/><path d="M7 29c9-17 18-17 29 0M6 35c10-10 21-10 35-3M12 41c8-6 16-6 25-4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg><span class="brand-words"><strong>拾光微旅<span class="brand-dot">.</span></strong><small>DAYTRIP</small></span>`;
  const image = (name, alt, extra = "") =>
    `<img src="assets/images/${name}.jpg" alt="${alt}" width="1440" height="960" decoding="async" ${extra || 'loading="lazy"'}>`;
  const tag = (key) =>
    `<span class="tag ${themes[key].color}">${icon(themes[key].icon)}${themes[key].name}</span>`;
  const demo = '<span class="demo-pill">教学演示</span>';
  const link = (file, extra = {}, targetPeriod = period) => {
    const values = { period: targetPeriod, style };
    if (cityId && !['index.html','footprints.html'].includes(file)) values.city = cityId;
    Object.assign(values, extra);
    if (file === 'index.html') { delete values.city; delete values.route; }
    for (const key of Object.keys(values)) if (values[key] === null || values[key] === undefined || values[key] === '') delete values[key];
    return `${file}?${new URLSearchParams(values)}`;
  };
  function routeListURL() {
    const back = params.get('returnTo');
    if (back && /^routes\.html(?:\?|$)/.test(back)) return `routes.html?${new URLSearchParams(back.split('?')[1] || '')}`;
    return link('routes.html', {city:route?.cityId,style:route?.theme||style});
  }
  const detailURL = (item) =>
    link("detail.html", { city: item.cityId, route: item.id, style: item.theme });
  const periodBadge = () =>
    `<span class="period-badge">${icon(periods[period].icon)} ${periods[period].name}</span>`;
  const carry = (file, text, extra = "") =>
    `<a data-carry-period href="${link(file)}" ${extra}>${text}</a>`;

  function applyAppearance() {
    const theme = appearanceOverride || (period === "night" ? "night" : "day");
    const night = theme === "night";
    document.body.dataset.theme = theme;
    document.body.dataset.period = period;
    document.querySelector('meta[name="theme-color"]').content =
      night ? "#101d2d" : "#287d69";
    const toggle = document.querySelector(".appearance-toggle");
    if (toggle) {
      toggle.setAttribute("aria-checked", String(night));
      toggle.title = night ? "切换到日光模式" : "切换到夜色模式";
      toggle.innerHTML = `${icon(night ? "moon" : "sun")}<span>${night ? "夜色模式" : "日光模式"}</span><i class="appearance-track" aria-hidden="true"></i>`;
    }
    document.querySelectorAll("[data-carry-period]").forEach((a) => {
      const url = new URL(a.href);
      url.searchParams.set("period", period);
      a.setAttribute(
        "href",
        `${url.pathname.split("/").pop()}${url.search}${url.hash}`,
      );
    });
  }
  document.getElementById("site-header").innerHTML =
    `<div class="nav-wrap"><a data-carry-period class="brand" href="${link("index.html")}" aria-label="拾光微旅 首页">${logo}</a><nav id="navigation" aria-label="主导航">${carry("index.html", "首页", page === "home" ? 'aria-current="page"' : "")}${carry("routes.html", "探索路线", ["routes", "detail"].includes(page) ? 'aria-current="page"' : "")}${carry("footprints.html", "我的足迹", page === "footprints" ? 'aria-current="page"' : "")}<a data-carry-period href="${link("index.html")}#about">关于我们</a>${carry("choose.html", `开始微旅 ${arrow}`, 'class="btn nav-cta"')}</nav><div class="header-controls">${cityPicker("nav-city")}<button type="button" class="appearance-toggle" role="switch" aria-label="夜色模式" aria-checked="false"></button><button class="menu-toggle" aria-label="打开导航菜单" aria-expanded="false" aria-controls="navigation">${icon("menu")}</button></div></div>`;
  document.getElementById("site-footer").innerHTML =
    `<div class="footer-main wrap"><div><a data-carry-period class="brand" href="${link("index.html")}">${logo}</a><p>每座城，日夜都有新发现。</p></div><span class="footer-script">Every city.<br>New little stories.</span><div class="footer-links">${carry("routes.html", `探索路线 ${arrow}`)}${carry("footprints.html", `我的足迹 ${arrow}`)}<a href="assets/CREDITS.md">摄影素材与授权 ${arrow}</a></div></div><div class="footer-bottom wrap"><span>© ${new Date().getFullYear()} DAYTRIP · 拾光微旅</span><span>大学生创新创业课程 · 静态 UI 演示 <span class="version">v${data.version}</span></span><span>DAYLIGHT & AFTER DARK ${icon("sun")}</span></div>`;
  applyAppearance();
  document.querySelector(".appearance-toggle").addEventListener("click", () => {
    rememberAppearance(document.body.dataset.theme === "night" ? "day" : "night");
    applyAppearance();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".period-links a, .story-slide .btn, .finish-actions .btn:not(.btn-outline)")) {
      rememberAppearance(null);
    }
  });

  function steps(current) {
    return `<div class="progress-steps" aria-label="旅行规划进度">${["选择偏好", "发现路线", "收藏微旅"].map((text, i) => `<span class="${i + 1 <= current ? "active" : ""}" ${i + 1 === current ? 'aria-current="step"' : ""}><b>${i + 1 < current ? icon("check") : "0" + (i + 1)}</b>${text}</span>`).join("<i></i>")}</div>`;
  }
  function periodLinks(file, extra = {}) {
    return `<div class="period-links" aria-label="旅行时段">${Object.entries(
      periods,
    )
      .map(
        ([key, item]) =>
          `<a class="${key === period ? "active" : ""}" href="${link(file, extra, key)}" ${key === period ? 'aria-current="true"' : ""}>${icon(item.icon)}${item.name}</a>`,
      )
      .join("")}</div>`;
  }
  function themeCards(choose = false) {
    return Object.entries(themes)
      .map(([key, theme], i) => {
        const content = `<div class="theme-photo">${image((city || data.cities[["beijing","hangzhou","chengdu"][i]]).images[key], `${theme.name}氛围摄影`)}<span class="photo-number">0${i + 1} /</span>${choose ? `<span class="selection-mark">${icon("check")}</span>` : `<span class="circle-link">${arrow}</span>`}</div><div class="theme-body"><span class="theme-english">${theme.english}</span><h3>${icon(theme.icon)}${theme.name}</h3><p>${choose ? theme.description : theme.short}</p>${choose ? "" : '<span class="theme-action">找到我的微旅灵感 <span>↗</span></span>'}</div>`;
        return choose
          ? `<label class="theme-card choice-card"><input type="radio" name="style" value="${key}" ${key === style ? "checked" : ""}><span class="choice-content">${content}</span></label>`
          : `<a class="theme-card reveal" href="${link("choose.html", { style: key })}">${content}</a>`;
      })
      .join("");
  }
  function cityPicker(id,form=false) {
    return `<label class="city-picker ${form?'city-picker-large':''}" for="${id}"><span>${icon('pin')} 目的地</span><select id="${id}" ${form?'name="city" required':''} data-city-switch aria-label="选择目的地"><option value="" ${!cityId?'selected':''} ${form?'disabled':''}>${form?'请选择城市':'全部城市'}</option>${data.discoveryOrder.map(key=>data.cities[key]).map(c=>`<option value="${c.id}" ${c.id===cityId?'selected':''}>${c.name}</option>`).join('')}</select></label>`;
  }
  function cityDirectory() {
    return `<section class="city-discovery wrap" id="cities"><div class="section-heading"><div><div class="eyebrow">TWELVE CITIES, COUNTLESS LITTLE MOMENTS</div><h2>下一站，<span class="serif-accent">想在哪座城慢下来？</span></h2></div><p>12 座城市 · 36 条主题路线 · 108 套时光安排<br>从熟悉的名字，走进真实的街巷。</p></div><div class="discovery-tools"><label for="city-search">搜索城市或景点<input id="city-search" type="search" placeholder="试试杭州、hangzhou 或西湖" autocomplete="off"></label><div class="region-filters" role="group" aria-label="按地区筛选">${['全部','华北','华东','华中','华南','西南','西北'].map((r,i)=>`<button type="button" data-region="${r}" class="filter ${i===0?'active':''}" aria-pressed="${i===0}">${r}</button>`).join('')}</div></div><p id="city-search-status" class="search-status" aria-live="polite">12 座城市，等你出发</p><div class="city-grid">${data.discoveryOrder.map(key=>data.cities[key]).map((c,i)=>`<a class="city-card" data-city-card="${c.id}" href="${link('choose.html',{city:c.id})}"><div class="city-card-photo">${image(c.images.city,`${c.name}城市实景`,'loading="lazy"')}<span>${c.region} · CHINA</span><b>${String(i+1).padStart(2,'0')}</b></div><div class="city-card-copy"><small>${c.english.toUpperCase()}</small><h3>${c.name}<span aria-hidden="true">↗</span></h3><p>${c.intro}</p><div>${c.tags.map(t=>`<span>${t}</span>`).join('')}</div><span class="city-card-action">三种主题，九段时光 ${arrow}</span></div></a>`).join('')}</div><div class="city-empty" hidden><h3>还没找到你想去的地方</h3><p>试试城市名、拼音，或清除地区筛选。</p><button class="btn btn-small" data-reset-cities>查看全部城市</button></div></section>`;
  }
  function setupCityDirectory() {
    const input=document.getElementById('city-search');if(!input)return;
    let region='全部';
    function update(){
      const q=input.value.trim().toLowerCase();let count=0;
      document.querySelectorAll('[data-city-card]').forEach(card=>{
        const c=data.cities[card.dataset.cityCard];
        const ownRoutes=routes.filter(r=>r.cityId===c.id);
        const cityMatch=[c.name,c.id,c.english,c.region].some(t=>t.toLowerCase().includes(q));
        const matched=ownRoutes.find(r=>[r.name,...r.keywords,...Object.values(r.variants).map(v=>v.name),...Object.values(r.variants).flatMap(v=>v.stops.map(s=>s[4]))].some(t=>t.toLowerCase().includes(q)));
        card.hidden=!(region==='全部'||region===c.region)||!(cityMatch||matched);
        card.href=!cityMatch&&matched?link('routes.html',{city:c.id,style:matched.theme,q:input.value.trim()}):link('choose.html',{city:c.id});
        if(!card.hidden)count++;
      });
      document.getElementById('city-search-status').textContent=`找到 ${count} 座城市${q?' · 点击卡片继续探索':''}`;
      document.querySelector('.city-empty').hidden=count!==0;
    }
    input.addEventListener('input',update);
    document.querySelectorAll('[data-region]').forEach(button=>button.addEventListener('click',()=>{
      region=button.dataset.region;
      document.querySelectorAll('[data-region]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});update();
    }));
    document.querySelector('[data-reset-cities]').addEventListener('click',()=>{input.value='';document.querySelector('[data-region="全部"]').click();input.focus();});
  }
  function cityBanner(){
    return `<section class="city-banner">${image(city.images[period==='night'?'night':'city'],`${city.name}实景`)}<div><span class="eyebrow">${city.region} / ${city.english.toUpperCase()}</span><h2>${city.name}，慢慢喜欢。</h2><p>${city.intro}</p><a href="${link('index.html')}#cities">换一座城，看看新的风景 ↗</a></div></section>`;
  }
  function sourceNotes(){
    return `<details class="source-notes"><summary>城市资料与摄影来源</summary><p>景点名称、片区背景核对：2026-10-27。行程是人工教学编排；开放、预约和交通请另查当天信息。</p>${city.sources.map(([name,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${name} ↗</a>`).join('')}<a href="assets/CREDITS.md">摄影作者与授权 ↗</a></details>`;
  }
  function journeySummary(){
    return `<section class="journey-summary" aria-label="行程起止与交通"><div><small>从这里开始</small><b>${route.stops[0][4]}</b></div><div class="journey-transfer">${icon('map')}<span>${route.transport}<small>节点间移动已留在时间轴间隔内，请按实际交通调整</small></span></div><div><small>在这里收尾</small><b>${route.stops.at(-1)[4]}</b></div></section>`;
  }
  function badgePair() {
    const state = experience.getCityState(cityId);
    return `<div class="badge-pair" aria-label="我的日夜纪念章"><span class="collectible ${state.badges.includes("day") ? "earned" : ""}">${icon("sun")}<b>日光章</b><small>${state.badges.includes("day") ? "已点亮" : "等待出发"}</small></span><i>+</i><span class="collectible night ${state.badges.includes("night") ? "earned" : ""}">${icon("moon")}<b>夜游章</b><small>${state.badges.includes("night") ? "已点亮" : "等待出发"}</small></span></div>`;
  }
  function hero() {
    const initial = period === "night" ? 2 : period === "full" ? 1 : 0;
    return `<section class="hero story-carousel" aria-label="微旅行灵感故事" aria-roledescription="轮播" data-slide="${initial}">${stories.map((story, i) => `<div class="story-slide ${i === initial ? "active" : ""}" data-story="${i}" aria-hidden="${i !== initial}" ${i !== initial ? "inert" : ""}><div class="hero-image">${image(story.image, `${periods[story.period].name}灵感摄影`, i === initial ? 'fetchpriority="high"' : 'loading="lazy"')}</div><div class="hero-shade"></div><div class="hero-content"><div class="eyebrow light"><span></span>${story.eyebrow}</div><h1>${story.title}<br><span>${story.accent}</span></h1><p>${story.text.replace("\n", "<br>")}</p><a class="btn btn-sand" href="${link("choose.html", {city:story.cityId,style:story.style}, story.period)}">${story.button} ${arrow}</a><span class="hero-note">每座城，日夜都有新发现。</span></div></div>`).join("")}<div class="hero-seal"><span>A LITTLE ESCAPE</span>${icon(period === "night" ? "moon" : "sun")}<span>DAYLIGHT & DARK</span></div><div class="hero-bottom"><span class="story-caption">${icon("pin")} ${stories[initial].caption}</span><div class="carousel-controls"><span class="story-counter">0${initial + 1} <small>/ 03</small></span><button class="carousel-control" data-carousel="prev" aria-label="上一张故事">${icon("back")}</button><button class="carousel-control" data-carousel="pause" aria-label="暂停轮播" aria-pressed="false">${icon("pause")}</button><button class="carousel-control" data-carousel="next" aria-label="下一张故事">${arrow}</button></div></div><span class="sr-only story-status" aria-live="polite"></span></section>`;
  }
  function staySection() {
    return `<section class="stay-section" id="stays"><div class="section-heading"><div><div class="eyebrow">LET THE GOOD DAY LAST A LITTLE LONGER</div><h2>还没玩尽兴？<br><span class="serif-accent">不如多留一晚。</span></h2></div><p>给今晚一个舒服的落脚点，<br>也给明早，多一个期待。</p></div><div class="stay-grid">${data.stays
      .filter((s) => s.route === route.id)
      .map(
        (s) =>
          `<article class="stay-card" data-stay-card="${s.id}"><div class="stay-photo">${image(s.image, `${s.type}空间氛围示意`, 'loading="lazy"')}<span class="stay-kind">${s.type} · 示例商家</span></div><div class="stay-copy"><div class="stay-card-title"><h3>${s.name}</h3><span>¥${s.price}<small> / 间夜起 · 示例</small></span></div><p class="stay-area">${icon("pin")} ${s.area}</p><p>${s.reason}</p><div class="stay-card-bottom"><span>${icon("sun")} ${s.next}</span><button class="btn btn-small" data-stay-open="${s.id}">查看住宿 ${arrow}</button></div></div></article>`,
      )
      .join(
        "",
      )}</div><div class="stay-selection" aria-live="polite"></div><p class="commercial-note">合作推荐 · 商家、价格与房态均为教学示例，图片为通用空间示意。加入延住计划不产生预订或付款。</p></section>`;
  }
  // 预算与核对提示只辅助阅读人工编排路线，不做实时可行性承诺。
  function planningBudget(id) {
    const parts = data.planning[id].budgets[period];
    return { parts, low: parts.reduce((sum, x) => sum + x[0], 0), high: parts.reduce((sum, x) => sum + x[1], 0) };
  }
  function periodPlanning(id) {
    const plan = data.planning[id];
    const view = experience.routeView(routes.find(r => r.id === id), period);
    if (period !== 'night') return {...plan, access:view.transport};
    return {...plan,access:view.transport,intensity:'公共街区分段慢走，按照明与体力缩短',focus:'当晚通行、营业与返程交通',checks:[`已核对${view.stops[0][4]}周边的当晚通行与营业情况`,'已确认夜线的具体地点，不按白天场馆开放推断夜间可进入'],alternative:`夜线从${view.stops[0][4]}独立开始。若遇关闭、降雨或照明不足，取消户外段，在附近营业休息点调整或直接返程。`};
  }
  function planningCard(item) {
    const plan = periodPlanning(item.id);
    const budget = planningBudget(item.id);
    return `<div class="planning-card"><div class="budget-line"><span>人均预算参考</span><strong>¥${budget.low}–${budget.high}<small> / 人</small></strong></div><p class="budget-kind">人工情景估算 · 不含住宿及往返出发地</p><dl><div><dt>${icon("heart")}适合</dt><dd>${plan.audience}</dd></div><div><dt>${icon("pin")}步调</dt><dd>${plan.intensity}</dd></div><div><dt>${icon("clock")}核对</dt><dd>${plan.focus}${period === "night" ? "、返程末班交通" : ""}</dd></div></dl></div>`;
  }
  function planningDetail() {
    const plan = periodPlanning(route.id);
    const budget = planningBudget(route.id);
    const checks = [...plan.checks, period === "night" ? "已核对末班交通，并预留夜间返程时间" : "已预留到达起点和离开终点的时间", "已查看天气，并与同行者确认步行和休息安排"];
    return `<section class="planning-overview" aria-labelledby="planning-title"><div class="planning-heading"><div><div class="eyebrow">A LITTLE PLANNING, A BETTER DAY</div><h2 id="planning-title">出发之前，心里先有个底。</h2></div><a class="text-link" href="#departure-checklist">查看出发核对 ${arrow}</a></div><div class="planning-detail-grid"><div class="budget-breakdown"><span>这一程的预算参考</span><p class="budget-total">¥${budget.low}–${budget.high}<small> / 人</small></p><dl>${["餐饮", "市内交通", "弹性体验"].map((name, i) => `<div><dt>${name}</dt><dd>¥${budget.parts[i][0]}–${budget.parts[i][1]}</dd></div>`).join("")}</dl><p class="budget-kind">人工情景估算，不是商家报价；不含住宿、购物及往返出发地费用。实际消费按个人选择核实。</p></div><div class="journey-fit"><span class="eyebrow">FIND YOUR PACE</span><h3>这条路线，适合怎样的你？</h3><p>${plan.audience}。</p><ul><li>${icon("clock")} ${route.hours} · ${route.stops.length} 个时间节点</li><li>${icon("map")} ${plan.access}</li><li>${icon("leaf")} ${plan.intensity}</li></ul><p class="planning-boundary">时间轴为预设安排，请另留往返出发地时间。</p></div></div></section><section class="departure-checklist" id="departure-checklist" aria-labelledby="checklist-title"><div class="checklist-intro"><div class="eyebrow">BEFORE YOU GO</div><h2 id="checklist-title">少一点临时慌张。</h2><p>把预约、开放和返程，放在出发前。</p><output class="checklist-status" aria-live="polite">本页自查：0 / ${checks.length} 项已核对</output></div><div class="checklist-items">${checks.map((text) => `<label><input type="checkbox" data-departure-check><span>${text}</span></label>`).join("")}<p>勾选仅作本页自查，不代表预约成功或实时通行确认。</p></div><details class="plan-alternative"><summary>如果临时有变化，怎么调整？</summary><p>${plan.alternative}</p></details></section>`;
  }
  const discovery = window.createDiscoveryUI({data,experience,params,city,cityId,period,style,icon,image,link,periodLinks,cityDirectory,planningCard,openDialog,watchImages,onPeriodChosen:()=>rememberAppearance(null)});
  const views = {
    home() {
      return `${hero()}${discovery.home()}<section class="about-section wrap" id="about"><div class="about-photo reveal">${image("forest", "阳光穿过森林的氛围摄影", 'loading="lazy"')}<span class="photo-caption">GO SLOW. DISCOVER MORE.</span><div class="photo-label">生活需要一点<br><em>留白。</em></div></div><div class="about-copy reveal"><div class="eyebrow">THE DAYTRIP PHILOSOPHY</div><h2>旅行不必很远，<br>日夜都有<span class="serif-accent">新发现。</span></h2><p>我们相信，城市有不止一种表情。<br>白天的湖光，亮灯后的街巷，一份热乎的早餐，<br>都值得我们认真停留。</p><p>拾光微旅，让半天、一个夜晚或完整一日，<br>成为刚刚好的小出走。再把这份喜欢，<br>延伸到一晚小住和下一次出发。</p><a class="text-link" href="${link("choose.html")}">把喜欢的时光，留给自己 ${arrow}</a><span class="about-signature">Every city. New little stories.</span><details class="business-model"><summary>我们的合作方式 · 课程演示</summary><p>景区及本地体验导流、酒店民宿预订导流、明确标注的合作展示位。榜单独立排序。当前商家、价格、评价与交易流程均为教学示例。</p></details></div></section>`;
    },
    footprints() { return discovery.footprintsPage(); },
    choose() {
      return `<section class="wrap planner-section">${steps(1)}<div class="page-heading"><div class="eyebrow">YOUR TIME, YOUR LITTLE ESCAPE</div><h1>挑一段时光，遇见<span class="serif-accent">城市的另一面。</span></h1><p>从日光到夜色，从半日轻游到完整一天，找到此刻喜欢的节奏。</p></div><form id="preference-form" action="routes.html" method="get"><fieldset class="city-fieldset"><legend><span>01</span> 先选一座，想去的城市</legend>${cityPicker("choose-city", true)}<p class="city-choice-intro">${city?.intro || "从想去的地方开始，不预设你的所在地。"}</p></fieldset><fieldset class="duration-fieldset period-fieldset"><legend><span>02</span> 留哪一段时光，给这次微旅？</legend><div class="duration-options">${Object.entries(
        periods,
      )
        .map(
          ([key, item]) =>
            `<label><input type="radio" name="period" value="${key}" ${key === period ? "checked" : ""}><span>${icon(item.icon)}<span><b>${item.name}</b><small>${item.description}</small></span><i></i></span></label>`,
        )
        .join(
          "",
        )}</div></fieldset><fieldset class="style-fieldset"><legend><span>03</span> 再选一种，喜欢的旅行心情 <small>单选一项</small></legend><div class="theme-grid choice-grid">${themeCards(true)}</div></fieldset><div class="choose-bottom"><p>${icon("sparkle")} 白天与夜晚，都有专属行程。<small>12 座城市 × 三种兴趣 × 三种时段，共 108 套教学行程。下一步可对比预算、步调与出发提醒。</small></p><button class="btn" type="submit">发现我的微旅路线 ${arrow}</button></div></form></section>`;
    },
    routes() { return discovery.routesPage(); },
    detail() {
      const offer = data.offers[route.id];
      return `<section class="detail-hero"><div class="detail-hero-image">${image(route.image, `${route.name}主题氛围摄影`, 'fetchpriority="high"')}</div><div class="detail-overlay"></div><div class="wrap detail-hero-content"><a class="back-light" href="${routeListURL()}">${icon("back")} 返回路线列表</a><div>${tag(route.theme)} ${periodBadge()}<div class="eyebrow light">${route.english.toUpperCase()}</div><h1>${route.name}</h1><p>${route.quote}</p></div><span class="detail-location">${icon("pin")} ${city.name} · ${city.english.toUpperCase()}</span></div></section><div class="wrap"><div class="overview"><div>${icon(periods[period].icon)}<span><small>旅行时光</small><b>${periods[period].name} · ${route.hours}</b></span></div><div>${icon("pin")}<span><small>行程节点</small><b>${route.stops.length} 个美好时刻</b></span></div><div>${icon(themes[route.theme].icon)}<span><small>旅行心情</small><b>${themes[route.theme].name}</b></span></div><div>${icon("map")}<span><small>建议出行方式</small><b>${route.transport}</b></span></div></div><div class="detail-period">${periodLinks("detail.html", { route: route.id, style: route.theme, returnTo: params.get("returnTo") })}</div>${journeySummary()}${planningDetail()}<div class="detail-grid"><section class="itinerary"><div class="eyebrow">YOUR LITTLE ESCAPE</div><h2>把${period === "night" ? "夜晚" : "今天"}，慢慢展开。</h2><p class="itinerary-intro">${route.intro}</p><ol class="timeline">${route.stops.map((stop, i) => `<li class="timeline-item reveal"><div class="timeline-time"><span>${stop[0]}</span><i>${i + 1}</i></div><article class="timeline-content"><div class="stop-label">${icon(stop[3])} ${stop[4]}</div><h3>${stop[1]}</h3><p>${stop[2]}</p>${stop[5] ? `<div class="stop-photo">${image(stop[5], stop[5] === "night" ? `${city.name}夜色氛围示意摄影` : `${city.name}主题实景摄影（非节点逐点实拍）`, 'loading="lazy"')}</div>` : ""}</article></li>`).join("")}</ol><article class="offer-card"><div class="offer-icon">${icon(themes[route.theme].icon)}</div><div><span class="eyebrow">合作体验 · 教学示例</span><h3>${offer.name}</h3><p>给喜欢的主题，多一点体验的深度。</p></div><button class="text-link" data-offer>查看示例套餐 ${arrow}</button></article></section><aside class="journey-sidebar"><div class="mini-map"><span class="eyebrow">A MOMENT TO REMEMBER</span><h3>这次，收集一枚${periods[period].badge}</h3>${badgePair()}<p>同一座城，日夜两种表情。<br>慢慢走，把喜欢的都留下。</p><small>点击完成旅行后记入本地模拟记录</small></div><div class="tips"><h3>${icon(periods[period].icon)} 出发前的小叮咛</h3><ul>${route.tips.map((t) => `<li>${t}</li>`).join("")}</ul></div>${sourceNotes()}<div class="demo-note">行程与时间为教学示例。图片为主题氛围示意，不代表每个节点现场。开放区域与交通安排以当天信息为准。</div></aside></div>${staySection()}<div class="detail-finish"><div><span class="eyebrow">KEEP BOTH SIDES OF THE CITY</span><h2>这一程的喜欢，值得被收藏。</h2><p>留下纪念卡，也点亮你的${periods[period].badge}。</p></div><button class="btn" data-complete>完成今日旅行，领取纪念卡 ${arrow}</button></div><a class="text-link local-footprint-link" href="${link("footprints.html", {city:cityId})}">查看${city.name}足迹 ${icon("arrow")}</a><a class="text-link detail-back" href="${routeListURL()}">${icon("back")} 返回路线列表</a></div>`;
    },
    finish() {
      const state = experience.getCityState(cityId);
      const dual = state.badges.length === 2;
      const completed = state.completed.includes(`${route.id}:${period}`);
      const stay = experience.selectedStay(route.id, period);
      const now = new Date();
      const date = now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return `<section class="finish-section wrap"><div class="page-heading"><span class="completion-check">${icon(completed ? "check" : "camera")}</span><div class="eyebrow">${dual ? "TWO SIDES, ONE BEAUTIFUL CITY" : "LITTLE MOMENTS, LASTING MEMORIES"}</div><h1>${completed ? "这一程的小美好，" : "先看看，"}<span class="serif-accent">${completed ? "已成功收藏。" : "你的微旅纪念卡。"}</span></h1><p>${dual ? `日光与夜色已集齐，${city.name}的两种美好，都在这里。` : "旅行不在远方，而在每一次认真感受生活的瞬间。"}</p></div><article class="memory-card ${dual ? "dual" : ""}"><div class="memory-photo">${dual ? `<div class="dual-photo">${image(city.images.nature, `${city.name}日光实景`)}${image(city.images.night, `${city.name}夜色实景`)}</div><div class="dual-labels"><span>DAYLIGHT</span><span>AFTER DARK</span></div>` : image(route.image, `${route.name}纪念氛围摄影`)}<span class="memory-photo-title">${dual ? "One city. Two beautiful sides." : period === "night" ? "A little night to remember." : "One beautiful escape."}</span><span class="memory-label">DAYTRIP COLLECTION / ${city.english.toUpperCase()}</span></div><div class="memory-content"><div class="memory-topline"><span>我的${city.name}微旅 · ${dual ? "日夜双面" : "时光"}纪念卡</span>${icon("sparkle")}</div><h2>${route.name}</h2><p>「${route.quote}」</p><div class="memory-stamp"><span>拾 光 微 旅</span>${icon(periods[period].icon)}<b>${completed ? periods[period].badge : "微旅预览"}</b><small>${dual ? "DAY & NIGHT" : "KEEP THE MOMENT"}</small></div><div class="memory-details"><span>${icon("pin")} ${city.name} · 中国</span><time datetime="${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}">${date}</time><span>${periods[period].name}</span></div>${stay ? `<div class="memory-stay">${icon("bed")}<span><b>多留一晚 · ${stay.name}</b><small>延住计划已收好 · 未产生真实预订</small></span><a href="${detailURL(baseRoute)}#stays">调整计划</a></div>` : ""}<div class="memory-bottom"><span>KEEP THE MOMENT. FEEL THE JOY.</span><span>拾光微旅 ↗</span></div></div></article><p class="finish-note">${icon(completed ? "check" : "camera")} ${completed ? `模拟完成 · 已探索 ${state.visited.length} 个不同地点，重复地点不累加。` : "此页为纪念卡预览，直接访问不会增加打卡或纪念章。"}</p>${!experience.isPersistent() ? '<p class="storage-note">浏览器存储不可用，本次页面内保留演示状态，刷新后可能丢失。</p>' : ""}<div class="finish-collection">${badgePair()}<p>${dual ? "日夜双章已集齐，下一次也请跟着喜欢出发。" : "再收集另一种时光，就能解锁城市双面纪念卡。"}</p></div><div class="finish-passport-links"><a class="text-link" href="${link("footprints.html", {city:cityId})}">查看本城足迹 ${icon("arrow")}</a><a class="text-link" href="${link("footprints.html")}">查看全部足迹 ${icon("map")}</a></div><div class="finish-actions"><a class="btn" href="${link("choose.html", {}, period === "night" ? "day" : "night")}">探索${period === "night" ? "日光" : "夜色"} ${arrow}</a><a class="btn btn-outline" href="${link("index.html")}">返回首页 ${icon("back")}</a></div><a class="finish-detail-link" href="${detailURL(baseRoute)}">再看看这次的行程${stay ? "与延住计划" : ""}</a></section>`;
    },
  };
  const render = ['detail','finish'].includes(page) && !route ? discovery.missingRoute : (views[page] || views.home);
  document.getElementById("main-content").innerHTML = render();
  document.title = `${page === "detail" ? (route?.name || "选择微旅行程") : page === "finish" ? "收藏微旅记忆" : { home: "每座城，日夜都有新发现", choose: "选择旅行时光", routes: city ? `发现${city.name}微旅` : "探索城市路线", footprints: "我的跨城足迹" }[page] || "DAYTRIP"} — 拾光微旅 DAYTRIP`;

  // 原生 dialog 提供 Escape、焦点限制与关闭后的焦点恢复。
  const dialog = document.createElement("dialog");
  dialog.className = "experience-dialog";
  dialog.setAttribute("aria-labelledby", "dialog-title");
  document.body.append(dialog);
  let dialogTrigger = null;
  function openDialog(content, trigger) {
    dialogTrigger = trigger;
    dialog.innerHTML = `<button class="dialog-close" aria-label="关闭弹窗" data-dialog-close>${icon("close")}</button>${content}`;
    dialog.showModal();
  }
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest("[data-dialog-close]"))
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (dialogTrigger?.isConnected) dialogTrigger.focus();
  });
  function stayStatus() {
    if (!route) return;
    const selected = experience.selectedStay(route.id, period);
    const container = document.querySelector(".stay-selection");
    if (!container) return;
    container.innerHTML = selected
      ? `${icon("check")}<span>已加入延住计划：<b>${selected.name}</b><small>选择会出现在本次微旅纪念卡上，不产生真实预订。</small></span><button class="text-link" data-cancel-stay>取消延住计划</button>`
      : `${icon("bed")}<span>喜欢哪一处，就把它加入这次的延住计划。</span>`;
    document
      .querySelectorAll("[data-stay-card]")
      .forEach((card) =>
        card.classList.toggle(
          "selected",
          card.dataset.stayCard === selected?.id,
        ),
      );
  }
  stayStatus();
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-stay-open")) {
      const stay = data.stays.find((s) => s.id === button.dataset.stayOpen);
      if (!stay) return;
      const selected =
        experience.selectedStay(route.id, period)?.id === stay.id;
      openDialog(
        `<div class="dialog-photo">${image(stay.image, "通用住宿空间示意摄影")}</div><div class="dialog-body">${demo}<span class="dialog-kind">合作住宿 · 虚构示例商家</span><h2 id="dialog-title">${stay.name}</h2><p class="dialog-price">¥${stay.price}<small> / 间夜起 · 示例价格</small></p><p>${stay.area}</p><p><b>适合：</b>${stay.audience}</p><div class="amenities">${stay.amenities.map((a) => `<span>${a}</span>`).join("")}</div><h3>为什么留一晚？</h3><p>${stay.reason}</p><div class="next-morning">${icon("sun")}<p>${stay.next}</p></div><p class="dialog-disclaimer">商家、设施、价格与房态均为教学示例。图片不是该商家的实拍，无真实交易。</p><button class="btn dialog-primary" data-stay-select="${stay.id}" data-remove="${selected}">${selected ? "取消延住计划" : "加入延住计划"} ${selected ? icon("close") : arrow}</button></div>`,
        button,
      );
    }
    if (button.hasAttribute("data-stay-select")) {
      experience.selectStay(
        route.id,
        period,
        button.dataset.remove === "true" ? null : button.dataset.staySelect,
      );
      stayStatus();
      dialog.close();
    }
    if (button.hasAttribute("data-cancel-stay")) {
      experience.selectStay(route.id, period, null);
      stayStatus();
      document.querySelector("[data-stay-open]")?.focus();
    }
    if (button.hasAttribute("data-offer")) {
      const offer = data.offers[route.id];
      openDialog(
        `<div class="dialog-body offer-dialog">${demo}<div class="offer-icon">${icon(themes[route.theme].icon)}</div><h2 id="dialog-title">${offer.name}</h2><p class="dialog-price">¥${offer.price}<small> / 人 · 模拟套餐</small></p><p>${offer.description}</p><div class="next-morning"><p>合作方式：用户通过路线发现体验项目，平台可提供合作展示与预订导流。课程演示不收集订单或支付信息。</p></div><p class="dialog-disclaimer">此为独立合作展示，不影响榜单排名；不表示景区实际收费或提供该服务。</p><button class="btn" data-dialog-close>了解了 ${icon("check")}</button></div>`,
        button,
      );
    }
    if (button.hasAttribute("data-complete")) {
      experience.complete(route.id, period);
      location.href = link("finish.html", {
        route: route.id,
        style: route.theme,
        returnTo: params.get('returnTo'),
      });
    }
  });
  document.querySelectorAll("[data-departure-check]").forEach((input) => {
    input.addEventListener("change", () => {
      const inputs = [...document.querySelectorAll("[data-departure-check]")];
      document.querySelector(".checklist-status").textContent = `本页自查：${inputs.filter((x) => x.checked).length} / ${inputs.length} 项已核对`;
    });
  });

  const menu = document.querySelector(".menu-toggle");
  menu.addEventListener("click", () => {
    const expanded = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(expanded));
    menu.setAttribute("aria-label", expanded ? "关闭导航菜单" : "打开导航菜单");
    document.getElementById("navigation").classList.toggle("open", expanded);
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menu.getAttribute("aria-expanded") === "true"
    ) {
      menu.click();
      menu.focus();
    }
  });
  document.querySelectorAll("#navigation a").forEach((a) =>
    a.addEventListener("click", () => {
      if (menu.getAttribute("aria-expanded") === "true") menu.click();
    }),
  );
  if (page === "choose") {
    document.querySelectorAll('[name="period"]').forEach((input) =>
      input.addEventListener("change", () => {
        period = input.value;
        rememberAppearance(null);
        applyAppearance();
      }),
    );
    document
      .getElementById("preference-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        location.href = `routes.html?${new URLSearchParams(values)}`;
      });
  }
  document.querySelectorAll('[data-city-switch]').forEach(select=>select.addEventListener('change',()=>{
    const target=page==='choose'?'choose.html':'routes.html';
    const selectedStyle=document.querySelector('[name="style"]:checked')?.value||style;
    location.href=link(target,{city:select.value||null,style:selectedStyle});
  }));
  setupCityDirectory();
  discovery.mount();

  // 自动播放的暂停原因彼此独立，手动暂停不会被移出鼠标意外取消。
  if (page === "home") {
    const carousel = document.querySelector(".story-carousel");
    let index = Number(carousel.dataset.slide),
      userPaused = false,
      hovered = false,
      focused = false,
      timer;
    const pauseButton = carousel.querySelector('[data-carousel="pause"]');
    function paused() {
      return (
        userPaused || hovered || focused || document.hidden || motion.matches
      );
    }
    function updatePause() {
      const stopped = paused();
      carousel.dataset.paused = String(stopped);
      pauseButton.setAttribute(
        "aria-pressed",
        String(userPaused || motion.matches),
      );
      pauseButton.setAttribute(
        "aria-label",
        motion.matches
          ? "减少动画已开启，轮播使用手动切换"
          : userPaused
            ? "继续轮播"
            : "暂停轮播",
      );
      // 聚焦/悬停只更新暂停原因，避免替换鼠标正按住的 SVG 导致首次点击丢失。
      const symbol = userPaused || motion.matches ? "play" : "pause";
      if (pauseButton.dataset.symbol !== symbol) {
        pauseButton.innerHTML = icon(symbol);
        pauseButton.dataset.symbol = symbol;
      }
      pauseButton.disabled = motion.matches;
    }
    function show(next, manual = false) {
      index = (next + stories.length) % stories.length;
      carousel.dataset.slide = String(index);
      carousel.querySelectorAll("[data-story]").forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
        slide.inert = i !== index;
      });
      carousel.querySelector(".story-counter").innerHTML =
        `0${index + 1} <small>/ 03</small>`;
      carousel.querySelector(".story-caption").innerHTML =
        `${icon("pin")} ${stories[index].caption}`;
      if (manual)
        carousel.querySelector(".story-status").textContent =
          `已切换到${periods[stories[index].period].name}故事，第 ${index + 1} 张，共 3 张。`;
    }
    function restart() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (!paused()) show(index + 1);
      }, 6000);
    }
    carousel.querySelectorAll("[data-carousel]").forEach((button) =>
      button.addEventListener("click", () => {
        if (button.dataset.carousel === "pause") userPaused = !userPaused;
        else {
          show(index + (button.dataset.carousel === "next" ? 1 : -1), true);
          restart();
        }
        updatePause();
      }),
    );
    carousel.addEventListener("mouseenter", () => {
      hovered = true;
      updatePause();
    });
    carousel.addEventListener("mouseleave", () => {
      hovered = false;
      updatePause();
    });
    carousel.addEventListener("focusin", () => {
      focused = true;
      updatePause();
    });
    carousel.addEventListener("focusout", () =>
      queueMicrotask(() => {
        focused = carousel.contains(document.activeElement);
        updatePause();
      }),
    );
    document.addEventListener("visibilitychange", updatePause);
    motion.addEventListener("change", updatePause);
    window.addEventListener("pagehide", () => clearInterval(timer));
    updatePause();
    restart();
  }
  function watchImages(root = document) {
    root.querySelectorAll("img").forEach((img) => {
      const fallback = () => {
        img.style.display = "none";
        img.parentElement.classList.add("image-unavailable");
      };
      img.addEventListener("error", fallback);
      if (img.complete && !img.naturalWidth) fallback();
    });
  }
  watchImages();
  const dialogImages = new MutationObserver(() => watchImages(dialog));
  dialogImages.observe(dialog, { childList: true, subtree: true });
  if ("IntersectionObserver" in window && !motion.matches) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("will-reveal");
      observer.observe(el);
    });
  }
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target)
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "instant" }),
      );
  }
})();
