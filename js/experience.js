/* 时段兼容、本地演示记录和延住选择。无账号、定位或服务器写入。 */
(() => {
  "use strict";
  const data = window.Daytrip;
  const key = "daytrip.exploration.v1";
  const blank = () => ({ visited: [], badges: [], completed: [], stays: {} });
  let memory = blank();
  let storageAvailable = true;
  function sanitize(raw) {
    const valid = (items, allow) =>
      Array.isArray(items)
        ? [...new Set(items.filter((x) => allow.includes(x)))]
        : [];
    const completedIds = data.routes.flatMap((r) =>
      Object.keys(data.periods).map((p) => `${r.id}:${p}`),
    );
    const stays = {};
    for (const r of data.routes)
      for (const p of Object.keys(data.periods)) {
        const selected = raw?.stays?.[`${r.id}:${p}`];
        if (data.stays.some((s) => s.id === selected && s.route === r.id))
          stays[`${r.id}:${p}`] = selected;
      }
    return {
      visited: valid(raw?.visited, Object.keys(data.places)),
      badges: valid(raw?.badges, ["day", "night"]),
      completed: valid(raw?.completed, completedIds),
      stays,
    };
  }
  let stored = null;
  try {
    stored = localStorage.getItem(key);
  } catch {
    storageAvailable = false;
  }
  // 损坏的旧记录回退为空；不将 JSON 损坏误报为浏览器禁用存储。
  try {
    memory = sanitize(JSON.parse(stored || "null"));
  } catch {
    memory = blank();
  }
  function save(next) {
    memory = sanitize(next);
    try {
      localStorage.setItem(key, JSON.stringify(memory));
      storageAvailable = true;
    } catch {
      storageAvailable = false;
    }
    return getState();
  }
  function getState() {
    return JSON.parse(JSON.stringify(memory));
  }
  function normalizePeriod(params) {
    if (params.has("period"))
      return Object.hasOwn(data.periods, params.get("period"))
        ? params.get("period")
        : "full";
    return params.get("duration") === "half" ? "day" : "full";
  }
  function routeView(route, period) {
    return { ...route, ...route.variants[period], period };
  }
  function selectedStay(routeId, period) {
    return (
      data.stays.find(
        (s) =>
          s.id === memory.stays[`${routeId}:${period}`] && s.route === routeId,
      ) || null
    );
  }
  function selectStay(routeId, period, stayId) {
    const next = getState();
    const entry = `${routeId}:${period}`;
    if (!stayId) delete next.stays[entry];
    else if (data.stays.some((s) => s.id === stayId && s.route === routeId))
      next.stays[entry] = stayId;
    return save(next);
  }
  function complete(routeId, period) {
    const route = data.routes.find((r) => r.id === routeId);
    if (!route || !Object.hasOwn(data.periods, period)) return getState();
    const next = getState();
    next.visited.push(...route.variants[period].placeIds);
    next.badges.push(period === "night" ? "night" : "day");
    next.completed.push(`${routeId}:${period}`);
    return save(next);
  }
  window.DaytripExperience = {
    getState,
    normalizePeriod,
    routeView,
    selectedStay,
    selectStay,
    complete,
    isPersistent: () => storageAvailable,
  };
})();
