/* 使用普通脚本与 URL 参数，兼容直接双击 HTML 的 file:// 演示。 */
(() => {
  "use strict";
  const { themes, routes, version } = window.Daytrip;
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const selectedTheme = Object.hasOwn(themes, params.get("style"))
    ? params.get("style")
    : "nature";
  const duration = params.get("duration") === "half" ? "half" : "day";
  const route =
    routes.find((item) => item.id === params.get("route")) || routes[0];
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
  };
  function icon(name, className = "") {
    return `<svg class="icon ${className}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.sparkle}</svg>`;
  }
  const arrow = icon("arrow");
  const logo = `<svg class="brand-symbol" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="27" cy="15" r="8" fill="#E5AE6F"/><path d="M7 29c9-17 18-17 29 0M6 35c10-10 21-10 35-3M12 41c8-6 16-6 25-4" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg><span class="brand-words"><strong>拾光漫游<span class="brand-dot">.</span></strong><small>DAYTRIP</small></span>`;
  const image = (name, alt, extra = "") =>
    `<img src="assets/images/${name}.jpg" alt="${alt}" ${extra}>`;
  const tag = (key) =>
    `<span class="tag ${themes[key].color}">${icon(themes[key].icon)}${themes[key].name}</span>`;
  function detailURL(item) {
    return `detail.html?route=${item.id}&style=${item.theme}&duration=${duration}`;
  }

  document.getElementById("site-header").innerHTML =
    `<div class="nav-wrap"><a class="brand" href="index.html" aria-label="拾光漫游 首页">${logo}</a><button class="menu-toggle" aria-label="打开导航菜单" aria-expanded="false" aria-controls="navigation">${icon("menu")}</button><nav id="navigation" aria-label="主导航"><a href="index.html" ${page === "home" ? 'aria-current="page"' : ""}>首页</a><a href="routes.html" ${["routes", "detail"].includes(page) ? 'aria-current="page"' : ""}>探索路线</a><a href="index.html#about">关于我们</a><a class="btn nav-cta" href="choose.html">开始旅行 ${arrow}</a></nav></div>`;
  document.getElementById("site-footer").innerHTML =
    `<div class="footer-main wrap"><div><a class="brand" href="index.html">${logo}</a><p>用一天时间，发现城市里的小美好。</p></div><span class="footer-script">A little escape,<br>a beautiful day.</span><div class="footer-links"><a href="routes.html">探索路线 ${arrow}</a><a href="index.html#about">关于拾光漫游 ${arrow}</a><a href="assets/CREDITS.md">摄影素材与授权 ${arrow}</a></div></div><div class="footer-bottom wrap"><span>© ${new Date().getFullYear()} DAYTRIP · 拾光漫游</span><span>大学生创新创业课程 · 静态 UI 演示 <span class="version">v${version}</span></span><span>Made for a beautiful day ${icon("sun")}</span></div>`;

  function themeCards(choose = false) {
    return Object.entries(themes)
      .map(([key, theme], i) => {
        const content = `<div class="theme-photo">${image(theme.image, `${theme.name}旅行摄影`)}<span class="photo-number">0${i + 1} /</span>${choose ? `<span class="selection-mark">${icon("check")}</span>` : `<span class="circle-link">${arrow}</span>`}</div><div class="theme-body"><span class="theme-english">${theme.english}</span><h3>${icon(theme.icon)}${theme.name}</h3><p>${choose ? theme.description : theme.short}</p>${choose ? "" : '<span class="theme-action">发现这份美好 <span>↗</span></span>'}</div>`;
        return choose
          ? `<label class="theme-card choice-card"><input type="radio" name="style" value="${key}" ${key === selectedTheme ? "checked" : ""}><span class="choice-content">${content}</span></label>`
          : `<a class="theme-card reveal" href="choose.html?style=${key}">${content}</a>`;
      })
      .join("");
  }
  function steps(current) {
    return `<div class="progress-steps" aria-label="旅行规划进度">${["选择偏好", "发现路线", "开启旅行"].map((text, i) => `<span class="${i + 1 <= current ? "active" : ""}" ${i + 1 === current ? 'aria-current="step"' : ""}><b>${i + 1 < current ? icon("check") : "0" + (i + 1)}</b>${text}</span>`).join("<i></i>")}</div>`;
  }

  const views = {
    home() {
      return `<section class="hero"><div class="hero-image">${image("hero", "湖水、森林与远山交织的宁静旅行灵感风景", 'fetchpriority="high"')}</div><div class="hero-shade"></div><div class="hero-content"><div class="eyebrow light"><span></span> ESCAPE THE ORDINARY</div><h1>把平凡的一天，<br>过成值得收藏的<span>风景。</span></h1><p>不必远行，不必等待。<br>从熟悉的城市出发，开启属于你的微旅行。</p><a class="btn btn-sand" href="choose.html">开启我的微旅行 ${arrow}</a><span class="hero-note">给生活放个小假，从今天开始。</span></div><div class="hero-bottom"><span>${icon("pin")} 美好，不必在远方 <i> / </i><small>TRAVEL INSPIRATION</small></span><a href="#discover" class="scroll-link">向下发现 ${icon("arrow")}</a></div><div class="hero-seal"><span>A LITTLE ESCAPE</span>${icon("sun")}<span>A BEAUTIFUL DAY</span></div></section>
      <div class="intro-bar wrap"><div class="intro-bar-title">去发现，<br><strong>生活的另一面。</strong></div><div>${icon("map")}<span><b>一座城市，无限可能</b><small>从身边出发，重新发现熟悉的地方</small></span></div><div>${icon("clock")}<span><b>刚刚好的一天</b><small>无需长假，让日常也有旅行的松弛感</small></span></div><a href="routes.html">看看今日灵感 ${arrow}</a></div>
      <section class="section wrap" id="discover"><div class="section-heading reveal"><div><div class="eyebrow">FIND YOUR KIND OF DAY</div><h2>今天，想怎样<span class="serif-accent">出发？</span></h2></div><p>每一种心情，都有一段刚刚好的旅程。<br>挑一个喜欢的方式，把时间留给自己。</p></div><div class="theme-grid">${themeCards()}</div></section>
      <section class="how-section"><div class="wrap"><div class="section-heading reveal"><div><div class="eyebrow">LESS PLANNING, MORE LIVING</div><h2>出发，其实很简单。</h2></div><a class="text-link" href="choose.html">开启我的一天 ${arrow}</a></div><div class="how-grid"><div class="how-step reveal"><span class="step-number">01</span><div class="how-icon">${icon("heart")}</div><h3>跟随此刻的心情</h3><p>选一种喜欢的风格，<br>自然、街巷，或一口烟火气。</p></div><div class="how-step reveal"><span class="step-number">02</span><div class="how-icon">${icon("map")}</div><h3>遇见心动的路线</h3><p>看看为你准备的一日灵感，<br>把繁琐的计划，变成简单的选择。</p></div><div class="how-step reveal"><span class="step-number">03</span><div class="how-icon">${icon("sun")}</div><h3>收藏今天的小美好</h3><p>轻轻出发，慢慢感受，<br>为平凡的一天留下一张纪念卡。</p></div></div></div></section>
      <section class="about-section wrap" id="about"><div class="about-photo reveal">${image("forest", "阳光穿过绿色森林的旅行灵感摄影", 'loading="lazy"')}<span class="photo-caption">TAKE A BREATH. TAKE A DAY.</span><div class="photo-label">生活需要一点<br><em>留白。</em></div></div><div class="about-copy reveal"><div class="eyebrow">THE DAYTRIP PHILOSOPHY</div><h2>旅行不必很远，<br>快乐可以<span class="serif-accent">很近。</span></h2><p>我们相信，值得珍藏的风景，不只存在于远方。<br>它可能是湖边的一阵风，巷口的一碗热干面，<br>也可能是一条你从未认真走过的街。</p><p>拾光漫游，把一日微旅行的灵感带到你身边。<br>少一点计划，多一点感受。用一天时间，<br>重新喜欢上生活的地方。</p><a class="text-link" href="choose.html">给自己，一个美好的今天 ${arrow}</a><span class="about-signature">Go slow. Feel more.</span></div></section>`;
    },
    choose() {
      return `<section class="wrap planner-section">${steps(1)}<div class="page-heading"><div class="eyebrow">A DAY, YOUR WAY</div><h1>今天，你想遇见怎样的<span class="serif-accent">风景？</span></h1><p>选择喜欢的旅行方式，让每一次出发都恰到好处。</p></div><form id="preference-form" action="routes.html" method="get"><fieldset class="style-fieldset"><legend><span>01</span> 选择你的旅行风格 <small>跟随心情，单选一项</small></legend><div class="theme-grid choice-grid">${themeCards(true)}</div></fieldset><fieldset class="duration-fieldset"><legend><span>02</span> 留多少时间，给今天的小美好？</legend><div class="duration-options"><label><input type="radio" name="duration" value="half" ${duration === "half" ? "checked" : ""}><span>${icon("sun")}<span><b>半日轻游</b><small>偷得半日闲，轻松去走走</small></span><i></i></span></label><label><input type="radio" name="duration" value="day" ${duration === "day" ? "checked" : ""}><span>${icon("clock")}<span><b>一日漫游</b><small>把一整天，留给喜欢的风景</small></span><i></i></span></label></div></fieldset><div class="choose-bottom"><p>${icon("sparkle")} 不必做很多准备，带上好心情就好。<small>当前提供三条武汉一日示例路线，时间选项用于偏好展示。</small></p><button class="btn" type="submit">为我推荐路线 ${arrow}</button></div></form></section>`;
    },
    routes() {
      const preferred =
        params.has("style") && Object.hasOwn(themes, params.get("style"));
      const sorted = [...routes].sort(
        (a, b) =>
          Number(b.theme === selectedTheme) - Number(a.theme === selectedTheme),
      );
      return `<section class="wrap routes-section">${steps(2)}<div class="page-heading"><div class="eyebrow">GOOD DAYS START HERE</div><h1>好风景，已经为你<span class="serif-accent">准备好了。</span></h1><p>从城市的一角开始，收藏今天的每一份美好。</p></div><div class="route-toolbar"><span class="city-label">${icon("pin")} 中国 · 武汉 <span>WUHAN</span></span><div class="route-filters" aria-label="路线主题筛选"><button class="filter active" data-filter="all" aria-pressed="true">全部路线 <small>03</small></button>${Object.entries(
        themes,
      )
        .map(
          ([key, theme]) =>
            `<button class="filter" data-filter="${key}" aria-pressed="false">${theme.name}</button>`,
        )
        .join(
          "",
        )}</div></div>${preferred ? `<div class="recommend-note">${icon("sparkle")} 已将「${themes[selectedTheme].name}」放在首位，愿你遇见喜欢的风景。<a href="choose.html?style=${selectedTheme}&duration=${duration}">调整偏好 ${arrow}</a></div>` : ""}<div class="route-grid">${sorted.map((item) => `<article class="route-card" data-theme="${item.theme}"><a class="route-photo" href="${detailURL(item)}" aria-label="查看${item.name}">${image(item.image, `${item.name}代表摄影`)}${preferred && item.theme === selectedTheme ? '<span class="recommended">为你推荐</span>' : ""}<span class="route-photo-caption">${item.english}</span></a><div class="route-card-body"><div class="route-card-meta">${tag(item.theme)}<span>${icon("clock")} 一日漫游</span></div><h2><a href="${detailURL(item)}">${item.name}</a></h2><p>${item.intro}</p><div class="keywords">${item.keywords.map((word) => `<span>${word}</span>`).join("")}</div><div class="route-card-bottom"><span><b>✦ ${item.score}<small> / 100</small></b><small>推荐指数 · 演示</small></span><a class="btn btn-small" href="${detailURL(item)}">查看行程 ${arrow}</a></div></div></article>`).join("")}</div><div class="route-footnote">${icon("leaf")} 路线是灵感，步调由你决定。<span>以上行程、时长与推荐指数均为教学演示，出行前请核实实际情况。${duration === "half" ? " 已记录半日轻游偏好；当前展示一日示例，可按需节选。" : ""}</span></div><div class="route-help"><div><span class="eyebrow">FOLLOW YOUR OWN RHYTHM</span><h3>不赶路，去感受路。</h3><p>好旅行没有标准答案，适合自己的节奏，就是最好的安排。</p></div><a class="text-link" href="choose.html">换个心情，重新选择 ${arrow}</a></div></section>`;
    },
    detail() {
      const theme = themes[route.theme];
      return `<section class="detail-hero"><div class="detail-hero-image">${image(route.image, `${route.name}风景`, 'fetchpriority="high"')}</div><div class="detail-overlay"></div><div class="wrap detail-hero-content"><a class="back-light" href="routes.html?style=${route.theme}&duration=${duration}">${icon("back")} 返回路线列表</a><div>${tag(route.theme)}<div class="eyebrow light">${route.english.toUpperCase()}</div><h1>${route.name}</h1><p>${route.quote}</p></div><span class="detail-location">${icon("pin")} 武汉 · WUHAN</span></div></section><div class="wrap"><div class="overview"><div>${icon("clock")}<span><small>游玩时间</small><b>一日 · ${route.hours}</b></span></div><div>${icon("pin")}<span><small>行程节点</small><b>6 个美好时刻</b></span></div><div>${icon(theme.icon)}<span><small>旅行主题</small><b>${theme.name}</b></span></div><div>${icon(route.theme === "nature" ? "bike" : "map")}<span><small>建议出行方式</small><b>${route.transport}</b></span></div></div><div class="detail-grid"><section class="itinerary"><div class="eyebrow">YOUR LITTLE ESCAPE</div><h2>把今天，慢慢展开。</h2><p class="itinerary-intro">${route.intro}</p><ol class="timeline">${route.stops.map((stop, index) => `<li class="timeline-item reveal"><div class="timeline-time"><span>${stop[0]}</span><i>${index + 1}</i></div><article class="timeline-content"><div class="stop-label">${icon(stop[3])} ${stop[4]}</div><h3>${stop[1]}</h3><p>${stop[2]}</p>${stop[5] ? `<div class="stop-photo">${image(stop[5], stop[4] + "旅行摄影", 'loading="lazy"')}</div>` : ""}</article></li>`).join("")}</ol></section><aside class="journey-sidebar"><div class="mini-map"><span class="eyebrow">A DAY TO REMEMBER</span><h3>今天的漫游手记</h3><svg class="route-drawing" viewBox="0 0 280 210" fill="none" aria-hidden="true"><path d="M-10 35C60 0 70 140 150 110S230 180 300 140" stroke="#d4e4dc" stroke-width="37"/><path d="M45 155C100 200 65 45 150 55s20 120 85 45" stroke="#8da997" stroke-width="2" stroke-dasharray="5 6"/><circle cx="45" cy="155" r="7" fill="#287D69"/><circle cx="150" cy="55" r="7" fill="#287D69"/><circle cx="235" cy="100" r="9" fill="#e1a45c"/><path d="m230 100 4 4 6-7" stroke="white" stroke-width="2"/><text x="23" y="184">出发</text><text x="128" y="36">慢慢走</text><text x="217" y="128">收藏</text></svg><p>没有必须抵达的坐标，<br>只有值得停留的瞬间。</p><small>示意路线 · 非真实地图</small></div><div class="tips"><h3>${icon("sun")} 出发前的小叮咛</h3><ul>${route.tips.map((tip) => `<li>${tip}</li>`).join("")}</ul></div><div class="demo-note">行程时间与活动为教学示例，不代表实时交通、开放时间或服务承诺。${duration === "half" ? " 你选择了半日轻游偏好；当前提供一日示例，可自行节选。" : ""}</div></aside></div><div class="detail-finish"><div><span class="eyebrow">EVERY LITTLE MOMENT COUNTS</span><h2>今天的风景，值得被收藏。</h2><p>为这一段小小的出走，留下一张专属纪念卡。</p></div><a class="btn" href="finish.html?route=${route.id}&name=${encodeURIComponent(route.name)}&duration=${duration}">完成今日旅行，领取纪念卡 ${arrow}</a></div><a class="text-link detail-back" href="routes.html?style=${route.theme}&duration=${duration}">${icon("back")} 返回路线列表</a></div>`;
    },
    finish() {
      const date = new Date().toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return `<section class="finish-section wrap"><div class="page-heading"><span class="completion-check">${icon("check")}</span><div class="eyebrow">LITTLE MOMENTS, LASTING MEMORIES</div><h1>今日份的小美好，<span class="serif-accent">已成功收藏。</span></h1><p>旅行不在远方，而在每一次认真感受生活的瞬间。</p></div><article class="memory-card"><div class="memory-photo">${image(route.image, `${route.name}纪念摄影`)}<span class="memory-photo-title">One beautiful day.</span><span class="memory-label">DAYTRIP COLLECTION / 001</span></div><div class="memory-content"><div class="memory-topline"><span>我的一日微旅行 · 纪念卡</span>${icon("sparkle")}</div><h2>${route.name}</h2><p>「${route.quote}」</p><div class="memory-stamp"><span>拾 光 漫 游</span>${icon("sun")}<b>美好已收藏</b><small>DAY WELL SPENT</small></div><div class="memory-details"><span>${icon("pin")} 武汉 · 中国</span><time datetime="${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}">${date}</time></div><div class="memory-bottom"><span>KEEP THE MOMENT. FEEL THE JOY.</span><span>DAYTRIP ↗</span></div></div></article><p class="finish-note">${icon("check")} 模拟旅行完成 · 愿这份好心情，陪你回到日常。</p><div class="finish-actions"><a class="btn" href="choose.html">再次探索 ${arrow}</a><a class="btn btn-outline" href="index.html">返回首页 ${icon("back")}</a></div><a class="finish-detail-link" href="${detailURL(route)}">再看看今天的行程</a></section>`;
    },
  };
  document.getElementById("main-content").innerHTML = (
    views[page] || views.home
  )();

  // 移动导航使用原生按钮，支持键盘与展开状态读取。
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
  document.querySelectorAll("#navigation a").forEach((link) =>
    link.addEventListener("click", () => {
      if (menu.getAttribute("aria-expanded") === "true") menu.click();
    }),
  );

  if (page === "choose") {
    document
      .getElementById("preference-form")
      .addEventListener("submit", (event) => {
        event.preventDefault();
        const values = new FormData(event.currentTarget);
        location.href = `routes.html?${new URLSearchParams(values).toString()}`;
      });
  }
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => {
        item.classList.toggle("active", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      document.querySelectorAll(".route-card").forEach((card) => {
        card.hidden =
          button.dataset.filter !== "all" &&
          card.dataset.theme !== button.dataset.filter;
      });
    }),
  );
  // 图片加载失败时保留柔和底色和简洁说明，避免出现破图图标。
  document.querySelectorAll("img").forEach((img) => {
    const fallback = () => {
      img.style.display = "none";
      img.parentElement.classList.add("image-unavailable");
    };
    img.addEventListener("error", fallback);
    if (img.complete && img.naturalWidth === 0) fallback();
  });
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
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
    document.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("will-reveal");
      observer.observe(element);
    });
  }
  // 跨页进入「关于我们」时，等待动态内容插入再定位。
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target)
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "instant" }),
      );
  }
})();
