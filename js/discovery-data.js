/* 全国内容为人工精选，不把演示评分当作全国排名。每个入口绑定明确的路线和时段。 */
(() => {
  const d=window.Daytrip;
  d.discoveryOrder=['beijing','shanghai','wuhan','guangzhou','chengdu','xian','hangzhou','changsha','chongqing','nanjing','suzhou','xiamen'];
  const selected=[
    ['beijing','颐和园','nature','day','把半天留给长廊、湖面与山水园林。'],
    ['shanghai','外滩','city','night','在黄浦江边，看看城市亮灯后的另一面。'],
    ['wuhan','东湖','nature','day','沿湖慢走，让绿道和湖风接住一个上午。'],
    ['guangzhou','沙面','city','day','沿树荫与建筑外观，慢读广州街区。'],
    ['chengdu','宽窄巷子','city','day','街巷里看看院落，把时间留给一杯茶。'],
    ['xian','大唐不夜城','city','night','从雁塔广场出发，走一段唐风灯火。'],
    ['hangzhou','西湖','nature','day','北山街到湖滨，只走一段喜欢的湖岸。'],
    ['changsha','橘子洲','city','day','用局部慢行，看看开阔的湘江与两岸城市。'],
    ['chongqing','洪崖洞','city','night','在开放公共道路，读山城的立体夜色。'],
    ['nanjing','老门东','city','day','瓦檐与街巷之间，认识南京城南。'],
    ['suzhou','平江路','city','night','沿公共水巷，收集姑苏的桥与灯影。'],
    ['xiamen','鼓浪屿','city','day','按船票到岛上，慢慢看近码头的建筑街巷。'],
  ];
  const routeId=(cityId,theme)=>d.routes.find(r=>r.cityId===cityId&&r.theme===theme).id;
  d.nationalSelections=selected.map(([cityId,name,theme,period,reason])=>({cityId,name,theme,period,reason,routeId:routeId(cityId,theme),image:d.cities[cityId].images[period==='night'?'night':theme]}));
  d.nationalStories=[
    {cityId:'beijing',
      day:{style:'nature',period:'day',image:'beijing-nature',alt:'北京颐和园日间湖光实景参考',eyebrow:'BEIJING / A LITTLE SUNSHINE',title:'留半天，走进园林，',accent:'让湖风慢慢吹。',text:'北京的长廊与湖面，值得从容看一眼。\n下一次小出走，从想去的地方开始。',button:'去北京，遇见日间湖光',caption:'北京 · 颐和园 / 日间灵感'},
      night:{style:'food',period:'night',image:'beijing-night',alt:'北京前门街区灯火与牌楼夜景实景参考',eyebrow:'BEIJING / LIGHTS ALONG THE LANES',title:'等前门灯火亮起，',accent:'慢慢尝一口京味。',text:'沿前门与大栅栏的街巷，看看灯下的老北京。\n把晚餐和散步，留给同一个夜晚。',button:'去北京，漫游前门夜色',caption:'北京 · 前门街区 / 夜游灵感'}},
    {cityId:'hangzhou',
      day:{style:'nature',period:'full',image:'hangzhou-nature',alt:'杭州西湖日间湖面与游船实景参考',eyebrow:'HANGZHOU / A DAY WELL SPENT',title:'把一天交给湖山，',accent:'把喜欢留给自己。',text:'杭州的湖岸与街巷，藏着刚刚好的松弛。\n十二座城市，各有值得停留的日常。',button:'去杭州，收藏一日时光',caption:'杭州 · 西湖 / 一日灵感'},
      night:{style:'nature',period:'night',image:'hangzhou-night',alt:'杭州西湖夜间湖岸灯影实景参考',eyebrow:'HANGZHOU / A LITTLE LAKE AFTER DARK',title:'把脚步放轻一点，',accent:'听西湖入夜的风。',text:'沿近处的公共湖岸，看看水面上的灯影。\n晚餐之后，给自己留一段湖边时光。',button:'去杭州，遇见西湖夜色',caption:'杭州 · 西湖湖岸 / 夜游灵感'}},
    {cityId:'chongqing',
      day:{style:'city',period:'day',image:'chongqing-city',alt:'重庆解放碑商圈日间街景实景参考',eyebrow:'CHONGQING / STREETS IN THE SUNLIGHT',title:'跟着街巷的起伏，',accent:'慢慢读懂山城。',text:'从解放碑出发，看看阳光里的街道与建筑。\n留一点步行的时间，认识立体重庆。',button:'去重庆，发现日间山城',caption:'重庆 · 解放碑 / 日间灵感'},
      night:{style:'city',period:'night',image:'chongqing-night',alt:'重庆洪崖洞吊脚楼夜间灯火实景参考',eyebrow:'CHONGQING / AFTER DARK',title:'当山城亮起灯，',accent:'去遇见另一种风景。',text:'重庆的街道与江岸，夜里换一种表情。\n跟着喜欢出发，把旅程写进自己的足迹。',button:'去重庆，探索山城夜色',caption:'重庆 · 洪崖洞 / 夜游灵感'}},
  ];
  // 显式选取代表景点，排除行程中的入口、休息点与返程站。
  // 每行字段：景点、主题路线、匹配时段、图像主题。
  const cityPlaces={
    wuhan:[['东湖','nature','day','nature'],['江汉路','city','day','city'],['汉口江滩','city','night','night'],['黎黄陂路','city','night','city'],['昙华林','food','day','city']],
    beijing:[['颐和园','nature','day','nature'],['景山公园','city','day','city'],['前门大街','food','day','city'],['大栅栏','food','day','food'],['什刹海','nature','night','night']],
    shanghai:[['外滩','city','night','night'],['南京路步行街','city','day','city'],['世纪公园','nature','day','nature'],['豫园商圈','food','day','food'],['陆家嘴滨江','nature','night','night']],
    xian:[['大唐不夜城','city','night','night'],['大雁塔广场','city','day','city'],['曲江池','nature','day','nature'],['洒金桥','food','day','food'],['钟鼓楼街区','food','night','city']],
    chengdu:[['浣花溪公园','nature','day','nature'],['宽窄巷子','city','day','city'],['人民公园','city','day','nature'],['玉林东路','food','day','city'],['玉林西路','food','night','food']],
    hangzhou:[['西湖','nature','day','nature'],['断桥','nature','day','nature'],['清河坊','city','day','city'],['南宋御街','city','night','night'],['武林街区','food','night','food']],
    chongqing:[['洪崖洞','city','night','night'],['解放碑','city','day','city'],['南山','nature','day','nature'],['南滨路','nature','night','night'],['观音桥','food','night','food']],
    nanjing:[['玄武湖','nature','day','nature'],['老门东','city','day','city'],['秦淮街区','city','night','night'],['夫子庙街区','food','night','food'],['小西湖街区','city','full','city']],
    guangzhou:[['白云山','nature','day','nature'],['沙面','city','day','city'],['永庆坊','city','night','night'],['上下九','food','day','city'],['西关街区','food','full','food']],
    suzhou:[['金鸡湖','nature','day','nature'],['拙政园','city','day','city'],['平江路','city','night','night'],['观前街','food','day','city'],['双塔街区','food','day','food']],
    xiamen:[['环岛路黄厝段','nature','day','nature'],['鼓浪屿','city','day','city'],['鹭江道','city','night','night'],['中山路','food','night','city'],['八市','food','day','food']],
    changsha:[['岳麓山','nature','day','nature'],['橘子洲','city','day','city'],['湘江东岸','city','night','night'],['太平老街','food','day','city'],['坡子街','food','night','food']],
  };
  for(const [cityId,rows] of Object.entries(cityPlaces)) {
    d.rankingsByCity[cityId].places=rows.map(([name,theme,period,image],i)=>({name,cityId,route:routeId(cityId,theme),period,image:d.cities[cityId].images[image],rating:4.9-i*.1,reviews:968-i*127,text:`${d.cities[cityId].name} · ${d.themes[theme].name} · ${d.periods[period].short}灵感`}));
  }
})();
