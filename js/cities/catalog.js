/* 城市目录与内容注册。普通脚本按 HTML 顺序执行，不依赖 fetch 或构建工具。 */
(() => {
  const d = window.Daytrip;
  const rows = [
    ['wuhan','武汉','Wuhan','华中','湖光与江城烟火，把日子过得热气腾腾。','江城 / 湖光 / 过早'],
    ['beijing','北京','Beijing','华北','在园林、红墙与胡同之间，读一页京城故事。','皇家园林 / 中轴 / 京味'],
    ['shanghai','上海','Shanghai','华东','从绿意到江岸，走进海派城市的日常。','滨江 / 街区 / 海派'],
    ['xian','西安',"Xi’an",'西北','城墙内外，盛唐风物与市井香气相遇。','古都 / 唐风 / 面食'],
    ['chengdu','成都','Chengdu','西南','溪边散步，街角喝茶，慢慢尝一口成都。','公园 / 茶馆 / 川味'],
    ['hangzhou','杭州','Hangzhou','华东','一半湖山，一半街巷，留一点时间给江南。','西湖 / 宋韵 / 茶香'],
    ['chongqing','重庆','Chongqing','西南','沿着山城的阶梯，遇见江风和万家灯火。','山城 / 江岸 / 火锅'],
    ['nanjing','南京','Nanjing','华东','湖边看云，城南听故事，秦淮灯影正温柔。','湖城 / 城南 / 秦淮'],
    ['guangzhou','广州','Guangzhou','华南','白云山下，骑楼之间，一盅两件的从容。','山色 / 骑楼 / 早茶'],
    ['suzhou','苏州','Suzhou','华东','园林藏着山水，街巷流淌着姑苏的日常。','园林 / 水巷 / 苏味'],
    ['xiamen','厦门','Xiamen','华东','把脚步交给海风，去听骑楼与小岛的故事。','海岸 / 小岛 / 闽南'],
    ['changsha','长沙','Changsha','华中','山水洲城里，白天有诗意，入夜有烟火。','岳麓 / 湘江 / 湘味'],
  ];
  d.cities = Object.fromEntries(rows.map(([id,name,english,region,intro,tags]) => [id, {
    id,name,english,region,intro,tags:tags.split(' / '),
    images: id === 'wuhan' ? {nature:'lake',city:'city',food:'food',night:'night'} : Object.fromEntries(['nature','city','food','night'].map(t=>[t,`${id}-${t}`])),
  }]));
  d.rankingsByCity = {wuhan:d.rankings};
  d.cities.wuhan.sources = [
    ['东湖出游提示','https://www.whdonghu.gov.cn/zwgk_6255/xxgkml/gysyjs/lyly/'],
    ['昙华林街区','https://sw.wuhan.gov.cn/xwdt/gzdt/202609/t20260917_2849032.shtml'],
    ['昙华林片区背景','https://www.wuhan.gov.cn/ztzl/jytabl/swlj/sjyta/202003/t20200316_949075.shtml']
  ];
  for (const r of d.routes) r.cityId = 'wuhan';
  d.places = Object.fromEntries(Object.entries(d.places).map(([id,name])=>[id,{name,cityId:'wuhan',image:id==='tingtao'||id==='greenway'||id==='lakefront'?'lake':id==='liangdao'?'food':'city'}]));

  // 行程节点逐城编写；这里只统一数据格式和共同的教学展示字段。
  d.registerCity = function(cityId, sources, entries) {
    const city = d.cities[cityId];
    city.sources = sources;
    for (const e of entries) {
      const id = `${cityId}-${e.theme}`;
      const image = city.images[e.theme];
      const variants = {};
      for (const [period, rows] of Object.entries(e.trips)) {
        const times = e.times?.[period] || (period === 'day' ? ['09:00','10:00','11:30','13:00'] : period === 'night' ? ['18:00','19:00','20:00','21:00'] : ['09:00','10:30','12:00','14:00','16:00','17:30']);
        const img = period === 'night' ? city.images.night : image;
        const placeIds = [];
        const stops = rows.map(([name,title,text],i) => {
          const placeId = `${cityId}-${name}`;
          d.places[placeId] ||= {name,cityId,image:img};
          if (!placeIds.includes(placeId)) placeIds.push(placeId);
          return [times[i], title, text, i === rows.length-1?'flag':e.theme === 'food'?'bowl':e.theme === 'nature'?'leaf':'building',name,i === 0 || i === 2?img:null];
        });
        const nightNames = {
          'beijing-nature':'什刹海湖岸夜风','beijing-city':'南锣鼓巷胡同夜色',
          'shanghai-nature':'陆家嘴滨江夜风','chengdu-nature':'青华路街角夜风',
          'chongqing-nature':'南滨路江风慢行','guangzhou-nature':'珠江岸线夜风',
          'xiamen-city':'鹭江道隔海夜色','changsha-nature':'湘江西岸晚风','changsha-city':'湘江东岸夜色'
        };
        const nightName = period==='night'&&nightNames[id];
        variants[period] = {name:`${nightName||e.name} · ${d.periods[period].short}`,hours:`${times[0]} — ${times.at(-1)}`,image:img,intro:nightName?`这是一条独立夜线：从${rows[0][0]}开始，到${rows.at(-1)[0]}结束，只选择当晚开放且照明良好的公共路段。`:(e.intros?.[period]||e.intro),quote:e.quote,stops,placeIds,tips:[...e.tips,period==='night'?'仅选择现场开放且照明良好的公共区域，提前确认返程交通。':'入园、船班及场馆预约请在出发前核对官方信息。'],transport:period==='night'?(e.nightTransport||'公共交通 / 分段步行'):e.transport};
      }
      d.routes.push({id,cityId,theme:e.theme,name:e.name,english:e.english,image,intro:e.intro,quote:e.quote,keywords:e.keywords,transport:e.transport,score:'96',...variants.full,name:e.name,variants});
      const base = e.budget || [40,65,15,30,20,50];
      const makeBudget = factor => [[Math.round(base[0]*factor),Math.round(base[1]*factor)],[base[2],base[3]],[Math.round(base[4]*factor),Math.round(base[5]*factor)]];
      d.planning[id] = {audience:e.audience,intensity:e.intensity,access:e.transport,focus:e.focus,alternative:e.alternative,checks:e.checks,budgets:{day:makeBudget(1),night:makeBudget(1.1),full:makeBudget(1.6)}};
      d.offers[id] = {name:`${e.name}主题手记`,price:e.theme==='food'?29:49,description:`围绕${e.keywords.slice(0,2).join('与')}的模拟讲解体验。用于课堂展示合作导流，不表示景区提供此项服务。`};
      ['room','house'].forEach((kind,i)=>d.stays.push({id:`${id}-${kind}`,route:id,name:`${city.name}·${e.stayName}${i?'小院':'旅居'}`,type:i?'民宿':'酒店',image:i?'stay-house':'stay-room',price:(i?228:328)+(cityId==='shanghai'||cityId==='beijing'?80:0),area:`${e.area} · 位置示意`,audience:e.audience,reason:`沿着${e.keywords[0]}主题，把休息接在行程之后。`,next:`明早在${e.area}附近选择一份当地早餐，按自己的节奏继续出发。`,amenities:['双人房示例',i?'小院风格示例':'早餐方案示例','无真实预订']}));
    }
    const ids = Object.keys(d.places).filter(id=>d.places[id].cityId===cityId);
    d.rankingsByCity[cityId] = {
      // 景点榜由 discovery-data.js 明确配置，不从行程节点顺序生成。
      places: [],
      users: ['小鹿同学','晚风来信','橘子汽水','阿远慢慢走','一颗栗子'].map((name,i)=>({name,initials:['鹿','风','橘','远','栗'][i],places:ids.slice(0,Math.max(1,ids.length-i*2)),motto:`在${city.name}，收藏一段自己的时光。`}))
    };
  };
})();
