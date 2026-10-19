/* 检验真正影响用户的状态规则：去重、刷新、双章、延住与兼容。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const storage = new Map();
function boot(options = {}) {
  const context = {
    window: {},
    localStorage: {
      getItem(key) { if (options.blocked) throw new Error('Storage blocked'); return storage.get(key) || null; },
      setItem(key, value) { if (options.blocked) throw new Error('Storage blocked'); storage.set(key, value); }
    }
  };
  for (const file of ['data.js', 'experience.js']) vm.runInNewContext(fs.readFileSync(path.join(root, 'js', file), 'utf8'), context);
  return { data: context.window.Daytrip, api: context.window.DaytripExperience };
}
let { data, api } = boot();
const tripSignatures = new Set();
for (const route of data.routes) {
  for (const period of ['day', 'night', 'full']) {
    const trip = route.variants[period];
    assert.equal(trip.stops.length, period === 'full' ? 6 : 4, '时段节点数错误');
    let previous = -1;
    for (const stop of trip.stops) {
      assert.match(stop[0], /^\d{2}:\d{2}$/);
      const [h, m] = stop[0].split(':').map(Number);
      assert.ok(h < 24 && m < 60 && h * 60 + m > previous, '行程时间须递增');
      previous = h * 60 + m;
      assert.ok(stop[1] && stop[2] && stop[3] && stop[4]);
      if (stop[5]) assert.ok(fs.existsSync(path.join(root, 'assets/images', stop[5] + '.jpg')));
    }
    assert.ok(trip.placeIds.length > 0);
    assert.ok(trip.placeIds.every(id => Object.hasOwn(data.places, id)));
    tripSignatures.add(JSON.stringify(trip.stops));
    assert.ok(fs.existsSync(path.join(root, 'assets/images', trip.image + '.jpg')));
  }
  assert.equal(data.stays.filter(stay => stay.route === route.id).length, 2);
}
assert.equal(tripSignatures.size, 9, '九套行程必须各自不同');
for (const [query, expected] of [ ['', 'full'], ['duration=half', 'day'], ['duration=day', 'full'], ['duration=invalid', 'full'], ['period=night&duration=half', 'night'], ['period=bad&duration=half', 'full'], ['period=__proto__', 'full'] ]) {
  assert.equal(api.normalizePeriod(new URLSearchParams(query)), expected, 'URL 兼容错误');
}
assert.equal(api.getState().visited.length, 0);
api.complete('donghu', 'day');
assert.equal(api.getState().visited.length, 3);
api.complete('donghu', 'day');
api.complete('donghu', 'full');
assert.equal(api.getState().visited.length, 3, '同一地点跨时段不重复计数');
assert.equal(api.getState().badges.length, 1, '完整一日不会错误发放夜游章');
api.complete('jianghan', 'night');
assert.equal(api.getState().visited.length, 6);
assert.equal(api.getState().badges.length, 2);
api.complete('bad-route', 'night');
api.complete('donghu', 'bad-period');
assert.equal(api.getState().visited.length, 6, '无效输入不能增加打卡');
api.selectStay('donghu', 'day', 'lake-room');
assert.equal(api.selectedStay('donghu', 'day').id, 'lake-room');
assert.equal(api.selectedStay('donghu', 'night'), null, '延住按路线和时段隔离');
api.selectStay('donghu', 'day', 'city-room');
assert.equal(api.selectedStay('donghu', 'day').id, 'lake-room', '不能选入其他路线的住宿');
api = boot().api;
assert.equal(api.getState().visited.length, 6, '刷新后读取已有记录');
assert.equal(api.selectedStay('donghu', 'day').id, 'lake-room');
api.selectStay('donghu', 'day', null);
assert.equal(api.selectedStay('donghu', 'day'), null, '取消延住');
storage.set('daytrip.exploration.v1', '{bad-json');
api = boot().api;
assert.equal(api.getState().visited.length, 0);
assert.equal(api.isPersistent(), true);
api = boot({ blocked: true }).api;
api.complete('donghu', 'day');
assert.equal(api.getState().visited.length, 3, '禁用存储时保留本页面内存状态');
assert.equal(api.isPersistent(), false);
for (const user of data.rankings.users) {
  assert.equal(new Set(user.places).size, user.places.length);
  assert.ok(user.places.every(id => Object.hasOwn(data.places, id)));
}
for (let i = 1; i < data.rankings.places.length; i++) assert.ok(data.rankings.places[i - 1].rating >= data.rankings.places[i].rating);
for (let i = 1; i < data.rankings.users.length; i++) assert.ok(data.rankings.users[i - 1].places.length >= data.rankings.users[i].places.length);
console.log('PASS · 九套独立行程、URL 兼容、打卡去重、双章、延住隔离与取消、存储异常和榜单排序。');
