/* 页面渲染与交互。普通脚本 + 相对链接，兼容静态托管与直接打开。 */
(() => {
  "use strict";
  const data = window.Daytrip;
  const experience = window.DaytripExperience;
  const { themes, routes, periods } = data;
  const params = new URLSearchParams(location.search);
  const page = document.body.dataset.page;
  let period = experience.normalizePeriod(params);
  const style = Object.hasOwn(themes, params.get("style"))
    ? params.get("style")
    : "nature";
  const baseRoute =
    routes.find((r) => r.id === params.get("route")) || routes[0];
  const route = experience.routeView(baseRoute, period);
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
    `<img src="assets/images/${name}.jpg" alt="${alt}" ${extra}>`;
  const tag = (key) =>
    `<span class="tag ${themes[key].color}">${icon(themes[key].icon)}${themes[key].name}</span>`;
  const demo = '<span class="demo-pill">教学演示</span>';
  const link = (file, extra = {}, targetPeriod = period) =>
    `${file}?${new URLSearchParams({ period: targetPeriod, ...extra })}`;
  const detailURL = (item) =>
    link("detail.html", { route: item.id, style: item.theme });
  const periodBadge = () =>
    `<span class="period-badge">${icon(periods[period].icon)} ${periods[period].name}</span>`;
  const carry = (file, text, extra = "") =>
    `<a data-carry-period href="${link(file)}" ${extra}>${text}</a>`;

  function applyAppearance() {
    document.body.dataset.theme = period === "night" ? "night" : "day";
    document.body.dataset.period = period;
    document.querySelector('meta[name="theme-color"]').content =
      period === "night" ? "#101d2d" : "#287d69";
    const status = document.querySelector(".appearance-label");
    if (status)
      status.innerHTML = `${icon(period === "night" ? "moon" : "sun")} ${period === "night" ? "夜色模式" : "日光模式"}`;
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
    `<div class="nav-wrap"><a data-carry-period class="brand" href="${link("index.html")}" aria-label="拾光微旅 首页">${logo}</a><button class="menu-toggle" aria-label="打开导航菜单" aria-expanded="false" aria-controls="navigation">${icon("menu")}</button><nav id="navigation" aria-label="主导航">${carry("index.html", "首页", page === "home" ? 'aria-current="page"' : "")}${carry("routes.html", "探索路线", ["routes", "detail"].includes(page) ? 'aria-current="page"' : "")}<a data-carry-period href="${link("index.html")}#rankings">城市榜单</a><a data-carry-period href="${link("index.html")}#about">关于我们</a><span class="appearance-label"></span>${carry("choose.html", `开始微旅 ${arrow}`, 'class="btn nav-cta"')}</nav></div>`;
  document.getElementById("site-footer").innerHTML =
    `<div class="footer-main wrap"><div><a data-carry-period class="brand" href="${link("index.html")}">${logo}</a><p>一座城，日夜都有新发现。</p></div><span class="footer-script">One city.<br>Two beautiful sides.</span><div class="footer-links">${carry("routes.html", `探索路线 ${arrow}`)}<a data-carry-period href="${link("index.html")}#rankings">城市榜单 ${arrow}</a><a href="assets/CREDITS.md">摄影素材与授权 ${arrow}</a></div></div><div class="footer-bottom wrap"><span>© ${new Date().getFullYear()} DAYTRIP · 拾光微旅</span><span>大学生创新创业课程 · 静态 UI 演示 <span class="version">v${data.version}</span></span><span>DAYLIGHT & AFTER DARK ${icon("sun")}</span></div>`;
  applyAppearance();

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
        const content = `<div class="theme-photo">${image(theme.image, `${theme.name}氛围摄影`)}<span class="photo-number">0${i + 1} /</span>${choose ? `<span class="selection-mark">${icon("check")}</span>` : `<span class="circle-link">${arrow}</span>`}</div><div class="theme-body"><span class="theme-english">${theme.english}</span><h3>${icon(theme.icon)}${theme.name}</h3><p>${choose ? theme.description : theme.short}</p>${choose ? "" : '<span class="theme-action">找到我的微旅灵感 <span>↗</span></span>'}</div>`;
        return choose
          ? `<label class="theme-card choice-card"><input type="radio" name="style" value="${key}" ${key === style ? "checked" : ""}><span class="choice-content">${content}</span></label>`
          : `<a class="theme-card reveal" href="${link("choose.html", { style: key })}">${content}</a>`;
      })
      .join("");
  }
  function badgePair() {
    const state = experience.getState();
    return `<div class="badge-pair" aria-label="我的日夜纪念章"><span class="collectible ${state.badges.includes("day") ? "earned" : ""}">${icon("sun")}<b>日光章</b><small>${state.badges.includes("day") ? "已点亮" : "等待出发"}</small></span><i>+</i><span class="collectible night ${state.badges.includes("night") ? "earned" : ""}">${icon("moon")}<b>夜游章</b><small>${state.badges.includes("night") ? "已点亮" : "等待出发"}</small></span></div>`;
  }
  let rankingType = "places";
  let rankingExpanded = false;
  function rankingRows() {
    const items = data.rankings[rankingType].slice(0, rankingExpanded ? 5 : 3);
    return `<ol class="ranking-list">${items.map((item, i) => (rankingType === "places" ? `<li><a class="ranking-row" href="${detailURL(routes.find((r) => r.id === item.route))}"><span class="rank-number">0${i + 1}</span><span class="rank-photo">${image(item.image, `${item.name}摄影`)}</span><span class="rank-text"><b>${item.name}</b><small>${item.text}</small></span><span class="rank-value">${item.rating.toFixed(1)}<small>${item.reviews.toLocaleString()} 条示例评价</small></span>${arrow}</a></li>` : `<li><button class="ranking-row user-ranking" data-user="${data.rankings.users.indexOf(item)}"><span class="rank-number">0${i + 1}</span><span class="user-avatar avatar-${i}">${item.initials}</span><span class="rank-text"><b>${item.name}</b><small>${item.motto}</small></span><span class="rank-value">${item.places.length}<small>个不同地点 · 模拟用户</small></span>${arrow}</button></li>`)).join("")}</ol>`;
  }
  function rankings() {
    const count = experience.getState().visited.length;
    return `<section class="ranking-section wrap" id="rankings"><div class="section-heading"><div><div class="eyebrow">THE CITY, THROUGH OUR EYES</div><h2>大家的喜欢，<span class="serif-accent">也是出发的灵感。</span></h2></div><p>看看值得停留的地方，也看看认真探索的人。<br>榜单、评价和用户均为课堂演示内容。</p></div><div class="ranking-grid"><div class="ranking-board"><div class="ranking-tabs" role="tablist" aria-label="城市榜单"><button id="tab-places" role="tab" aria-selected="true" aria-controls="ranking-panel" data-ranking="places">${icon("heart")} 景区好评榜</button><button id="tab-users" role="tab" aria-selected="false" aria-controls="ranking-panel" tabindex="-1" data-ranking="users">${icon("trophy")} 用户探索者榜</button>${demo}</div><div id="ranking-panel" role="tabpanel" aria-labelledby="tab-places">${rankingRows()}</div><button class="ranking-expand" aria-expanded="false" aria-controls="ranking-panel">展开前五名 ${arrow}</button><p class="ranking-note">好评榜按示例评分排序；探索榜按不同地点数排序。合作展示不参与排名。</p></div><aside class="my-progress"><div class="eyebrow">MY LITTLE DISCOVERIES</div><h3>我的武汉探索手记</h3><div class="progress-count"><b>${count.toString().padStart(2, "0")}</b><span>/ 09 个不同地点</span></div><progress max="9" value="${count}" aria-label="我的不同地点探索进度"></progress>${badgePair()}<p>${experience.getState().badges.length === 2 ? "日夜双章已集齐，去纪念卡看看武汉的两面。" : "收集日光与夜色，拼成你的城市双面纪念卡。"}</p><button class="text-link" data-my-record>查看我的探索记录 ${arrow}</button><small>仅此浏览器的模拟记录 · 重复地点不累加</small></aside></div></section>`;
  }
  function hero() {
    const initial = period === "night" ? 2 : 0;
    return `<section class="hero story-carousel" aria-label="微旅行灵感故事" aria-roledescription="轮播" data-slide="${initial}">${data.stories.map((story, i) => `<div class="story-slide ${i === initial ? "active" : ""}" data-story="${i}" aria-hidden="${i !== initial}" ${i !== initial ? "inert" : ""}><div class="hero-image">${image(story.image, `${periods[story.period].name}灵感摄影`, i === initial ? 'fetchpriority="high"' : 'loading="lazy"')}</div><div class="hero-shade"></div><div class="hero-content"><div class="eyebrow light"><span></span>${story.eyebrow}</div><h1>${story.title}<br><span>${story.accent}</span></h1><p>${story.text.replace("\n", "<br>")}</p><a class="btn btn-sand" href="${link("choose.html", {}, story.period)}">${story.button} ${arrow}</a><span class="hero-note">一座城，日夜都有新发现。</span></div></div>`).join("")}<div class="hero-seal"><span>A LITTLE ESCAPE</span>${icon(period === "night" ? "moon" : "sun")}<span>DAYLIGHT & DARK</span></div><div class="hero-bottom"><span class="story-caption">${icon("pin")} ${data.stories[initial].caption}</span><div class="carousel-controls"><span class="story-counter">0${initial + 1} <small>/ 03</small></span><button class="carousel-control" data-carousel="prev" aria-label="上一张故事">${icon("back")}</button><button class="carousel-control" data-carousel="pause" aria-label="暂停轮播" aria-pressed="false">${icon("pause")}</button><button class="carousel-control" data-carousel="next" aria-label="下一张故事">${arrow}</button></div></div><span class="sr-only story-status" aria-live="polite"></span></section>`;
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
  const views = {
    home() {
      return `${hero()}<div class="intro-bar wrap"><div class="intro-bar-title">一座城，<br><strong>两种美好。</strong></div><div>${icon("sun")}<span><b>日光里的小出走</b><small>半天或一天，按自己的节奏出发</small></span></div><div>${icon("moon")}<span><b>亮灯后的新发现</b><small>留一点夜晚，给风景和烟火气</small></span></div><a href="${link("choose.html")}">选择我的时光 ${arrow}</a></div><section class="section wrap" id="discover"><div class="section-heading reveal"><div><div class="eyebrow">FIND YOUR KIND OF ESCAPE</div><h2>这一程，想遇见什么？</h2></div><p>选择心情，再选择时光。<br>同一座城市，总有另一面值得发现。</p></div><div class="theme-grid">${themeCards()}</div></section>${rankings()}<section class="how-section"><div class="wrap"><div class="section-heading"><div><div class="eyebrow">LESS PLANNING, MORE LIVING</div><h2>从出发，到舍不得结束。</h2></div><a class="text-link" href="${link("choose.html")}">开启我的微旅 ${arrow}</a></div><div class="how-grid"><div class="how-step reveal"><span class="step-number">01</span><div class="how-icon">${icon("heart")}</div><h3>跟随心情，挑一段时光</h3><p>日光里，或亮灯后，<br>选一种喜欢的方式认识城市。</p></div><div class="how-step reveal"><span class="step-number">02</span><div class="how-icon">${icon("map")}</div><h3>沿着喜欢，慢慢展开</h3><p>看行程、找灵感，<br>想多留一晚，就接住明早的期待。</p></div><div class="how-step reveal"><span class="step-number">03</span><div class="how-icon">${icon("sun")}</div><h3>收集日夜两枚纪念章</h3><p>不同的时光，不同的城市表情，<br>拼成一张自己的武汉微旅记忆。</p></div></div></div></section><section class="about-section wrap" id="about"><div class="about-photo reveal">${image("forest", "阳光穿过森林的氛围摄影", 'loading="lazy"')}<span class="photo-caption">GO SLOW. DISCOVER MORE.</span><div class="photo-label">生活需要一点<br><em>留白。</em></div></div><div class="about-copy reveal"><div class="eyebrow">THE DAYTRIP PHILOSOPHY</div><h2>旅行不必很远，<br>日夜都有<span class="serif-accent">新发现。</span></h2><p>我们相信，城市有不止一种表情。<br>白天的湖光，亮灯后的街巷，一份热乎的早餐，<br>都值得我们认真停留。</p><p>拾光微旅，让半天、一个夜晚或完整一日，<br>成为刚刚好的小出走。再把这份喜欢，<br>延伸到一晚小住和下一次出发。</p><a class="text-link" href="${link("choose.html")}">把喜欢的时光，留给自己 ${arrow}</a><span class="about-signature">One city. Two beautiful sides.</span><details class="business-model"><summary>我们的合作方式 · 课程演示</summary><p>景区及本地体验导流、酒店民宿预订导流、明确标注的合作展示位。榜单独立排序。当前商家、价格、评价与交易流程均为教学示例。</p></details></div></section>`;
    },
    choose() {
      return `<section class="wrap planner-section">${steps(1)}<div class="page-heading"><div class="eyebrow">YOUR TIME, YOUR LITTLE ESCAPE</div><h1>挑一段时光，遇见<span class="serif-accent">城市的另一面。</span></h1><p>从日光到夜色，从半日轻游到完整一天，找到此刻喜欢的节奏。</p></div><form id="preference-form" action="routes.html" method="get"><fieldset class="duration-fieldset period-fieldset"><legend><span>01</span> 留哪一段时光，给这次微旅？</legend><div class="duration-options">${Object.entries(
        periods,
      )
        .map(
          ([key, item]) =>
            `<label><input type="radio" name="period" value="${key}" ${key === period ? "checked" : ""}><span>${icon(item.icon)}<span><b>${item.name}</b><small>${item.description}</small></span><i></i></span></label>`,
        )
        .join(
          "",
        )}</div></fieldset><fieldset class="style-fieldset"><legend><span>02</span> 再选一种，喜欢的旅行心情 <small>单选一项</small></legend><div class="theme-grid choice-grid">${themeCards(true)}</div></fieldset><div class="choose-bottom"><p>${icon("sparkle")} 白天与夜晚，都有专属行程。<small>三种兴趣 × 三种时段，共九套武汉教学示例。</small></p><button class="btn" type="submit">发现我的微旅路线 ${arrow}</button></div></form></section>`;
    },
    routes() {
      const preferred = Object.hasOwn(themes, params.get("style"));
      const sorted = routes
        .map((r) => experience.routeView(r, period))
        .sort((a, b) => Number(b.theme === style) - Number(a.theme === style));
      return `<section class="wrap routes-section">${steps(2)}<div class="page-heading"><div class="eyebrow">${period === "night" ? "AFTER DARK, BEFORE THE MEMORIES FADE" : "GOOD MOMENTS START HERE"}</div><h1>${period === "night" ? "城市亮起灯，" : "好风景，"}<span class="serif-accent">${period === "night" ? "你的夜晚才刚开始。" : "已经为你准备好了。"}</span></h1><p>同一座武汉，换一段时光，就换一种发现。</p></div>${periodLinks("routes.html", { style })}<div class="route-toolbar"><span class="city-label">${icon("pin")} 中国 · 武汉 <span>WUHAN</span></span><div class="route-filters" aria-label="路线兴趣筛选"><button class="filter active" data-filter="all" aria-pressed="true">全部路线 <small>03</small></button>${Object.entries(
        themes,
      )
        .map(
          ([key, t]) =>
            `<button class="filter" data-filter="${key}" aria-pressed="false">${t.name}</button>`,
        )
        .join(
          "",
        )}</div></div>${preferred ? `<div class="recommend-note">${icon("sparkle")} ${periods[period].name} · 已将「${themes[style].name}」排在首位。<a href="${link("choose.html", { style })}">调整偏好 ${arrow}</a></div>` : ""}<div class="route-grid">${sorted.map((item) => `<article class="route-card" data-theme="${item.theme}"><a class="route-photo" href="${detailURL(item)}" aria-label="查看${item.name}">${image(item.image, `${item.name}主题氛围摄影`)}${preferred && item.theme === style ? '<span class="recommended">为你推荐</span>' : ""}<span class="route-photo-caption">${item.english}</span></a><div class="route-card-body"><div class="route-card-meta">${tag(item.theme)}<span>${icon(periods[period].icon)} ${periods[period].name}</span></div><h2><a href="${detailURL(item)}">${item.name}</a></h2><p>${item.intro}</p><div class="keywords">${item.keywords.map((w) => `<span>${w}</span>`).join("")}</div><div class="route-hours">${icon("clock")} ${item.hours}<span>${item.stops.length} 个时刻</span></div><div class="route-card-bottom"><span><b>✦ ${item.score}<small> / 100</small></b><small>推荐指数 · 演示</small></span><a class="btn btn-small" href="${detailURL(item)}">查看行程 ${arrow}</a></div></div></article>`).join("")}</div><div class="route-footnote">${icon("leaf")} 路线是灵感，步调由你决定。<span>活动、开放时间与推荐指数均为教学示例，出行前请核实实际情况。夜景摄影为武汉氛围示意。</span></div><div class="route-help"><div><span class="eyebrow">DAYLIGHT & AFTER DARK</span><h3>一座城，值得喜欢两次。</h3><p>收集日光章与夜游章，拼成属于你的城市双面纪念卡。</p></div><a class="text-link" href="${link("index.html")}#rankings">看看大家的探索手记 ${arrow}</a></div></section>`;
    },
    detail() {
      const offer = data.offers[route.id];
      return `<section class="detail-hero"><div class="detail-hero-image">${image(route.image, `${route.name}主题氛围摄影`, 'fetchpriority="high"')}</div><div class="detail-overlay"></div><div class="wrap detail-hero-content"><a class="back-light" href="${link("routes.html", { style: route.theme })}">${icon("back")} 返回路线列表</a><div>${tag(route.theme)} ${periodBadge()}<div class="eyebrow light">${route.english.toUpperCase()}</div><h1>${route.name}</h1><p>${route.quote}</p></div><span class="detail-location">${icon("pin")} 武汉 · WUHAN</span></div></section><div class="wrap"><div class="overview"><div>${icon(periods[period].icon)}<span><small>旅行时光</small><b>${periods[period].name} · ${route.hours}</b></span></div><div>${icon("pin")}<span><small>行程节点</small><b>${route.stops.length} 个美好时刻</b></span></div><div>${icon(themes[route.theme].icon)}<span><small>旅行心情</small><b>${themes[route.theme].name}</b></span></div><div>${icon("map")}<span><small>建议出行方式</small><b>${period === "night" ? "步行 / 公共交通" : route.transport}</b></span></div></div><div class="detail-period">${periodLinks("detail.html", { route: route.id, style: route.theme })}</div><div class="detail-grid"><section class="itinerary"><div class="eyebrow">YOUR LITTLE ESCAPE</div><h2>把${period === "night" ? "夜晚" : "今天"}，慢慢展开。</h2><p class="itinerary-intro">${route.intro}</p><ol class="timeline">${route.stops.map((stop, i) => `<li class="timeline-item reveal"><div class="timeline-time"><span>${stop[0]}</span><i>${i + 1}</i></div><article class="timeline-content"><div class="stop-label">${icon(stop[3])} ${stop[4]}</div><h3>${stop[1]}</h3><p>${stop[2]}</p>${stop[5] ? `<div class="stop-photo">${image(stop[5], stop[5] === "night" ? "武汉夜色氛围示意摄影" : `${stop[4]}主题氛围摄影`, 'loading="lazy"')}</div>` : ""}</article></li>`).join("")}</ol><article class="offer-card"><div class="offer-icon">${icon(themes[route.theme].icon)}</div><div><span class="eyebrow">合作体验 · 教学示例</span><h3>${offer.name}</h3><p>给喜欢的主题，多一点体验的深度。</p></div><button class="text-link" data-offer>查看示例套餐 ${arrow}</button></article></section><aside class="journey-sidebar"><div class="mini-map"><span class="eyebrow">A MOMENT TO REMEMBER</span><h3>这次，收集一枚${periods[period].badge}</h3>${badgePair()}<p>同一座城，日夜两种表情。<br>慢慢走，把喜欢的都留下。</p><small>点击完成旅行后记入本地模拟记录</small></div><div class="tips"><h3>${icon(periods[period].icon)} 出发前的小叮咛</h3><ul>${route.tips.map((t) => `<li>${t}</li>`).join("")}</ul></div><div class="demo-note">行程与时间为教学示例。图片为主题氛围示意，不代表每个节点现场。开放区域与交通安排以当天信息为准。</div></aside></div>${staySection()}<div class="detail-finish"><div><span class="eyebrow">KEEP BOTH SIDES OF THE CITY</span><h2>这一程的喜欢，值得被收藏。</h2><p>留下纪念卡，也点亮你的${periods[period].badge}。</p></div><button class="btn" data-complete>完成今日旅行，领取纪念卡 ${arrow}</button></div><a class="text-link detail-back" href="${link("routes.html", { style: route.theme })}">${icon("back")} 返回路线列表</a></div>`;
    },
    finish() {
      const state = experience.getState();
      const dual = state.badges.length === 2;
      const completed = state.completed.includes(`${route.id}:${period}`);
      const stay = experience.selectedStay(route.id, period);
      const now = new Date();
      const date = now.toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return `<section class="finish-section wrap"><div class="page-heading"><span class="completion-check">${icon(completed ? "check" : "camera")}</span><div class="eyebrow">${dual ? "TWO SIDES, ONE BEAUTIFUL CITY" : "LITTLE MOMENTS, LASTING MEMORIES"}</div><h1>${completed ? "这一程的小美好，" : "先看看，"}<span class="serif-accent">${completed ? "已成功收藏。" : "你的微旅纪念卡。"}</span></h1><p>${dual ? "日光与夜色已集齐，武汉的两种美好，都在这里。" : "旅行不在远方，而在每一次认真感受生活的瞬间。"}</p></div><article class="memory-card ${dual ? "dual" : ""}"><div class="memory-photo">${dual ? `<div class="dual-photo">${image("lake", "日光中的武汉东湖")}${image("night", "武汉夜色")}</div><div class="dual-labels"><span>DAYLIGHT</span><span>AFTER DARK</span></div>` : image(route.image, `${route.name}纪念氛围摄影`)}<span class="memory-photo-title">${dual ? "One city. Two beautiful sides." : period === "night" ? "A little night to remember." : "One beautiful escape."}</span><span class="memory-label">DAYTRIP COLLECTION / WUHAN</span></div><div class="memory-content"><div class="memory-topline"><span>我的武汉微旅 · ${dual ? "日夜双面" : "时光"}纪念卡</span>${icon("sparkle")}</div><h2>${route.name}</h2><p>「${route.quote}」</p><div class="memory-stamp"><span>拾 光 微 旅</span>${icon(periods[period].icon)}<b>${completed ? periods[period].badge : "微旅预览"}</b><small>${dual ? "DAY & NIGHT" : "KEEP THE MOMENT"}</small></div><div class="memory-details"><span>${icon("pin")} 武汉 · 中国</span><time datetime="${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}">${date}</time><span>${periods[period].name}</span></div>${stay ? `<div class="memory-stay">${icon("bed")}<span><b>多留一晚 · ${stay.name}</b><small>延住计划已收好 · 未产生真实预订</small></span><a href="${detailURL(baseRoute)}#stays">调整计划</a></div>` : ""}<div class="memory-bottom"><span>KEEP THE MOMENT. FEEL THE JOY.</span><span>拾光微旅 ↗</span></div></div></article><p class="finish-note">${icon(completed ? "check" : "camera")} ${completed ? `模拟完成 · 已探索 ${state.visited.length} 个不同地点，重复地点不累加。` : "此页为纪念卡预览，直接访问不会增加打卡或纪念章。"}</p>${!experience.isPersistent() ? '<p class="storage-note">浏览器存储不可用，本次页面内保留演示状态，刷新后可能丢失。</p>' : ""}<div class="finish-collection">${badgePair()}<p>${dual ? "日夜双章已集齐，下一次也请跟着喜欢出发。" : "再收集另一种时光，就能解锁城市双面纪念卡。"}</p></div><div class="finish-actions"><a class="btn" href="${link("choose.html", {}, period === "night" ? "day" : "night")}">探索${period === "night" ? "日光" : "夜色"} ${arrow}</a><a class="btn btn-outline" href="${link("index.html")}">返回首页 ${icon("back")}</a></div><a class="finish-detail-link" href="${detailURL(baseRoute)}">再看看这次的行程${stay ? "与延住计划" : ""}</a></section>`;
    },
  };
  document.getElementById("main-content").innerHTML = (
    views[page] || views.home
  )();
  document.title = `${page === "detail" ? route.name : page === "finish" ? "收藏微旅记忆" : { home: "一座城，日夜都有新发现", choose: "选择旅行时光", routes: "发现武汉微旅" }[page] || "DAYTRIP"} — 拾光微旅 DAYTRIP`;

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
  function renderRanking() {
    document.querySelectorAll("[data-ranking]").forEach((tab) => {
      const active = tab.dataset.ranking === rankingType;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const panel = document.getElementById("ranking-panel");
    panel.innerHTML = rankingRows();
    panel.setAttribute("aria-labelledby", `tab-${rankingType}`);
    const button = document.querySelector(".ranking-expand");
    button.setAttribute("aria-expanded", String(rankingExpanded));
    button.innerHTML = `${rankingExpanded ? "收起榜单" : "展开前五名"} ${arrow}`;
    watchImages(panel);
  }
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
    if (button.hasAttribute("data-ranking")) {
      rankingType = button.dataset.ranking;
      rankingExpanded = false;
      renderRanking();
    }
    if (button.classList.contains("ranking-expand")) {
      rankingExpanded = !rankingExpanded;
      renderRanking();
    }
    if (button.hasAttribute("data-user")) {
      const user = data.rankings.users[Number(button.dataset.user)];
      if (!user) return;
      openDialog(
        `<div class="dialog-body explorer-dialog">${demo}<span class="user-avatar">${user.initials}</span><h2 id="dialog-title">${user.name}的探索手记</h2><p>${user.motto}</p><p class="explorer-count">${user.places.length} <small>个不同地点 · 模拟用户</small></p><ul class="explored-places">${user.places.map((id) => `<li>${icon("check")}${data.places[id]}</li>`).join("")}</ul><p class="dialog-disclaimer">虚构用户与示例记录，用于展示用户探索者榜。</p></div>`,
        button,
      );
    }
    if (button.hasAttribute("data-my-record")) {
      const state = experience.getState();
      openDialog(
        `<div class="dialog-body explorer-dialog"><div class="eyebrow">MY LITTLE DISCOVERIES</div><h2 id="dialog-title">我的武汉探索手记</h2>${badgePair()}<p>已探索 ${state.visited.length} 个不同地点</p>${state.visited.length ? `<ul class="explored-places">${state.visited.map((id) => `<li>${icon("check")}${data.places[id]}</li>`).join("")}</ul>` : '<p class="empty-record">手记还是空白的，去完成一段喜欢的微旅吧。</p>'}<p class="dialog-disclaimer">只在本浏览器内保存模拟记录，不参与真实用户排名；重复地点不累计。</p></div>`,
        button,
      );
    }
    if (button.hasAttribute("data-complete")) {
      experience.complete(route.id, period);
      location.href = link("finish.html", {
        route: route.id,
        style: route.theme,
      });
    }
  });
  document.querySelectorAll("[data-ranking]").forEach((tab) =>
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      rankingType =
        event.key === "Home"
          ? "places"
          : event.key === "End"
            ? "users"
            : rankingType === "places"
              ? "users"
              : "places";
      rankingExpanded = false;
      renderRanking();
      document.querySelector(`[data-ranking="${rankingType}"]`).focus();
    }),
  );

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
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      document
        .querySelectorAll(".route-card")
        .forEach(
          (card) =>
            (card.hidden =
              button.dataset.filter !== "all" &&
              card.dataset.theme !== button.dataset.filter),
        );
    }),
  );

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
      index = (next + data.stories.length) % data.stories.length;
      carousel.dataset.slide = String(index);
      carousel.querySelectorAll("[data-story]").forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
        slide.setAttribute("aria-hidden", String(i !== index));
        slide.inert = i !== index;
      });
      carousel.querySelector(".story-counter").innerHTML =
        `0${index + 1} <small>/ 03</small>`;
      carousel.querySelector(".story-caption").innerHTML =
        `${icon("pin")} ${data.stories[index].caption}`;
      if (manual)
        carousel.querySelector(".story-status").textContent =
          `已切换到${periods[data.stories[index].period].name}故事，第 ${index + 1} 张，共 3 张。`;
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
