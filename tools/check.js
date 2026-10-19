/* 无依赖交付检查：node tools/check.js。浏览器验收见 TEST_REPORT.md。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const context = { window: {} };
vm.runInNewContext(read('js/data.js'), context);
const data = context.window.Daytrip;
assert.equal(Object.keys(data.themes).length, 3, '应有三种旅行主题');
assert.equal(data.routes.length, 3, '应有三条路线');
assert.equal(new Set(data.routes.map(route => route.id)).size, 3, '路线 ID 必须不同');
assert.equal(new Set(data.routes.map(route => JSON.stringify(route.stops))).size, 3, '三条路线不能共用同一套行程');
for (const route of data.routes) {
  assert.equal(route.stops.length, 6, `${route.id} 应有六个完整时间节点`);
  assert.ok(data.themes[route.theme], `未知主题：${route.theme}`);
  for (const stop of route.stops) {
    assert.match(stop[0], /^\d{2}:\d{2}$/);
    assert.ok(stop[1] && stop[2] && stop[3] && stop[4], '时间节点内容不完整');
  }
}
for (const file of ['js/main.js', 'js/data.js', 'tools/serve.js']) {
  new vm.Script(read(file), { filename: file });
}
const pages = ['index.html', 'choose.html', 'routes.html', 'detail.html', 'finish.html'];
for (const file of [...pages, 'js/main.js']) {
  const source = read(file);
  for (const match of source.matchAll(/(?:src|href)="([^"\s]+)"/g)) {
    const target = match[1].split(/[?#]/)[0];
    if (!target || target.includes('${') || /^(https?:|data:)/.test(target)) continue;
    assert.ok(fs.existsSync(path.join(root, target)), `${file} 引用了不存在的文件：${target}`);
  }
}
for (const name of ['hero', 'forest', 'lake', 'city', 'food']) {
  const bytes = fs.readFileSync(path.join(root, 'assets/images', `${name}.jpg`));
  assert.ok(bytes.length > 10000 && bytes[0] === 0xff && bytes[1] === 0xd8, `${name} 不是有效 JPEG 文件`);
}
assert.ok(read('css/style.css').includes('prefers-reduced-motion'));
assert.ok(read('css/style.css').includes(':focus-visible'));
assert.ok(!read('js/main.js').includes('fetch('), '页面不应依赖网络数据加载');
console.log(`PASS · DAYTRIP v${data.version} · 五个页面、三套行程、本地引用、摄影素材与脚本语法检查通过。`);
