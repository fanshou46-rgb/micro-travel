# 摄影素材与授权

本项目为「拾光微旅 DAYTRIP」课程静态原型。摄影文件已保存至 `assets/images/`，页面运行时不请求远程图片。

| 本地文件 | 作者 | 原始作品 | 授权 |
| --- | --- | --- | --- |
| `hero.jpg` | Luca Bravo | [Brown house near body of water](https://unsplash.com/photos/brown-house-near-body-of-water-zAjdgNXsMeg) | [Unsplash License](https://unsplash.com/license) |
| `forest.jpg` | Sebastian Unrau | [Trees on forest with sun rays](https://unsplash.com/photos/trees-on-forest-with-sun-rays-sp-p7uuT0tw) | [Unsplash License](https://unsplash.com/license) |
| `lake.jpg` | Fxqf | [Wuhan East Lake 02.jpg](https://commons.wikimedia.org/wiki/File:Wuhan_East_Lake_02.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `city.jpg` | 螺钉 | [江汉路步行街.jpg](https://commons.wikimedia.org/wiki/File:江汉路步行街.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `food.jpg` | Syouziiye | [Hot dry noodles.jpg](https://commons.wikimedia.org/wiki/File:Hot_dry_noodles.jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `night.jpg` | Dynamic Hong Kong | [City skyline illuminated at night with colorful lights](https://unsplash.com/photos/city-skyline-illuminated-at-night-with-colorful-lights-VEtPMjOwAl4) | [Unsplash License](https://unsplash.com/license) |
| `stay-room.jpg` | [reisetopia](https://reisetopia.de/) | [White bed near brown window curtain](https://unsplash.com/photos/white-bed-near-brown-window-curtain-Y7WfCuz5tn0) | [Unsplash License](https://unsplash.com/license) |
| `stay-house.jpg` | Saubhagya gandharv | [A hotel room with a bed and a chair](https://unsplash.com/photos/a-hotel-room-with-a-bed-and-a-chair-u9qPQg4Tw5c) | [Unsplash License](https://unsplash.com/license) |

图片处理：调整 EXIF 朝向、缩小尺寸、JPEG 压缩；展示时通过 CSS `object-fit: cover` 裁切并叠加渐变。东湖与江汉路图片的修改版本继续按 CC BY-SA 4.0 提供，热干面图片修改版本按 CC BY 4.0 提供。图片授权独立于页面代码。

历史版本的首页山湖主视觉（hero.jpg）为通用旅行灵感摄影，不是武汉东湖实景；森林照片同样为氛围示意。1.5 首页随当前城市使用对应城市摄影。日间路线主图分别使用东湖、江汉路、武汉热干面的摄影；夜景为武汉城市夜色，用于夜游主题氛围，不代表各个节点的现场实拍。

两张住宿摄影均为通用空间示意（原始作品来自境外住宿空间），不是武汉示例商家的实拍。页面中六家商家均为虚构教学示例，图文组合不表示摄影作者、实际住宿经营者与本项目存在合作关系。新增三张图片均经尺寸调整与 JPEG 压缩，展示时有 CSS 裁切。

Logo、路线示意图、图标均为项目内联 SVG；无第三方图标库、远程字体或地图服务。

获取日期：2026-10-19。可选素材下载工具位于 `tools/fetch_assets.py`，重新下载不是启动网站的必要步骤。


## 1.5 新增城市摄影

以下 44 张来自 Wikimedia Commons 的摄影已本地保存，逐张核对地点、类型与授权。获取日期：2026-10-27。

城市摄影用于对应城市的主题表现；夜景为同城氛围参考，不代表路线每个节点的现场。菜品照片用于地方饮食主题，不构成对某一家店的推荐。原作拍摄日期可能较早，不用于说明当前营业、设施或开放状态。住宿图片继续作为通用空间示意。

图片经 EXIF 朝向处理、缩小尺寸及 JPEG 压缩，展示时有裁切与渐变。下表中的 CC BY-SA 修改版本继续适用对应的同版本授权；作者、原作链接与授权链接均保留。完整元数据见 [city-photos.json](city-photos.json)。

| 本地文件 | 作者 | 原始作品 | 授权 |
| --- | --- | --- | --- |
| `beijing-city.jpg` | Pixelflake | [The Forbidden City - View from Coal Hill.jpg](https://commons.wikimedia.org/wiki/File:The_Forbidden_City_-_View_from_Coal_Hill.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `beijing-food.jpg` | N509FZ | [Zhajiangmian after stirring at Fangzhuanchang (20210115131416).jpg](https://commons.wikimedia.org/wiki/File:Zhajiangmian_after_stirring_at_Fangzhuanchang_(20210115131416).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `beijing-nature.jpg` | xiquinhosilva | [Longevity Hill of the Summer Palace.jpg](https://commons.wikimedia.org/wiki/File:Longevity_Hill_of_the_Summer_Palace.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| `beijing-night.jpg` | AsAuSo | [Qianmen SOHO China.jpg](https://commons.wikimedia.org/wiki/File:Qianmen_SOHO_China.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `changsha-city.jpg` | Li Ming (sculptor) | [Mao Zedong youth art sculpture 6.jpg](https://commons.wikimedia.org/wiki/File:Mao_Zedong_youth_art_sculpture_6.jpg) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| `changsha-food.jpg` | N509FZ | [Changsha-style Stinky Tofu at Huogongdian (20180222183104).jpg](https://commons.wikimedia.org/wiki/File:Changsha-style_Stinky_Tofu_at_Huogongdian_(20180222183104).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `changsha-nature.jpg` | 上海道台 | [湖南 長沙 嶽麓山上小道.jpg](https://commons.wikimedia.org/wiki/File:%E6%B9%96%E5%8D%97_%E9%95%B7%E6%B2%99_%E5%B6%BD%E9%BA%93%E5%B1%B1%E4%B8%8A%E5%B0%8F%E9%81%93.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `changsha-night.jpg` | Huangdan2060 | [Night view of Xiang River in Changsha 2025031304.jpg](https://commons.wikimedia.org/wiki/File:Night_view_of_Xiang_River_in_Changsha_2025031304.jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| `chengdu-city.jpg` | JianEn Yu | [Chengdu travel 011 (36057373821).jpg](https://commons.wikimedia.org/wiki/File:Chengdu_travel_011_(36057373821).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| `chengdu-food.jpg` | N509FZ | [Dandanmian in Chengdu (20180218142856).jpg](https://commons.wikimedia.org/wiki/File:Dandanmian_in_Chengdu_(20180218142856).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `chengdu-nature.jpg` | wuzhongj | [浣花溪公园－ - panoramio.jpg](https://commons.wikimedia.org/wiki/File:%E6%B5%A3%E8%8A%B1%E6%BA%AA%E5%85%AC%E5%9B%AD%EF%BC%8D_-_panoramio.jpg) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| `chengdu-night.jpg` | Daniel Lu (User:dllu) | [Anshun Bridge Jin River Chengdu night 2026 dllu.jpg](https://commons.wikimedia.org/wiki/File:Anshun_Bridge_Jin_River_Chengdu_night_2026_dllu.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `chongqing-city.jpg` | HoweyYuan | [Jiefangbei CBD 20240721.jpg](https://commons.wikimedia.org/wiki/File:Jiefangbei_CBD_20240721.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `chongqing-food.jpg` | N509FZ | [Concentric hot pot in Chongqing (20180217165607).jpg](https://commons.wikimedia.org/wiki/File:Concentric_hot_pot_in_Chongqing_(20180217165607).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `chongqing-nature.jpg` | Col Ford and Natasha de Vere | [BonsaiGardenNanshan.jpg](https://commons.wikimedia.org/wiki/File:BonsaiGardenNanshan.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| `chongqing-night.jpg` | Lianguanlun | [Hongyadong night lights Chongqing.jpg](https://commons.wikimedia.org/wiki/File:Hongyadong_night_lights_Chongqing.jpg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| `guangzhou-city.jpg` | Ricky Chow | [ShaMianBuildings.JPG](https://commons.wikimedia.org/wiki/File:ShaMianBuildings.JPG) | [CC BY-SA 3.0](http://creativecommons.org/licenses/by-sa/3.0/) |
| `guangzhou-food.jpg` | Geoffreyrabbit | [Dim sum collection in Cantonese restaurant.jpg](https://commons.wikimedia.org/wiki/File:Dim_sum_collection_in_Cantonese_restaurant.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `guangzhou-nature.jpg` | LumHoTsing | [Forest in Baak Wan Mountain Canton.jpg](https://commons.wikimedia.org/wiki/File:Forest_in_Baak_Wan_Mountain_Canton.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `guangzhou-night.jpg` | Daniel Lu (User:dllu) | [Canton Tower at night Guangzhou 2024 dllu.jpg](https://commons.wikimedia.org/wiki/File:Canton_Tower_at_night_Guangzhou_2024_dllu.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `hangzhou-city.jpg` | HoweyYuan | [Hefang Street 20240729.jpg](https://commons.wikimedia.org/wiki/File:Hefang_Street_20240729.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `hangzhou-food.jpg` | Pauloleong2002 | [Dongpo pork (a Hangzhou dish).jpg](https://commons.wikimedia.org/wiki/File:Dongpo_pork_(a_Hangzhou_dish).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `hangzhou-nature.jpg` | Jakub Hałun | [20090524 Hangzhou West Lake 7531.jpg](https://commons.wikimedia.org/wiki/File:20090524_Hangzhou_West_Lake_7531.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `hangzhou-night.jpg` | J Aaron Farr | [Hangzhou West Lake at Night.jpg](https://commons.wikimedia.org/wiki/File:Hangzhou_West_Lake_at_Night.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| `nanjing-city.jpg` | Zhou Guanhuai | [Laomendong (Nanjing).jpg](https://commons.wikimedia.org/wiki/File:Laomendong_(Nanjing).jpg) | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| `nanjing-food.jpg` | N509FZ | [Duck blood vermicelli soup and soup-filled buns in Nanjing (20190224120657).jpg](https://commons.wikimedia.org/wiki/File:Duck_blood_vermicelli_soup_and_soup-filled_buns_in_Nanjing_(20190224120657).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `nanjing-nature.jpg` | Windmemories | [20260803 Xuanwu Lake and Nanjing Railway Station.jpg](https://commons.wikimedia.org/wiki/File:20260803_Xuanwu_Lake_and_Nanjing_Railway_Station.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `nanjing-night.jpg` | Dick Rochester | [Confucius Temple and Qinhuai River, Nanjing Night.jpg](https://commons.wikimedia.org/wiki/File:Confucius_Temple_and_Qinhuai_River,_Nanjing_Night.jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| `shanghai-city.jpg` | King of Hearts | [Pudong Shanghai November 2017 panorama.jpg](https://commons.wikimedia.org/wiki/File:Pudong_Shanghai_November_2017_panorama.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `shanghai-food.jpg` | Robigasp | [Xiaolongbao Shanghai.jpg](https://commons.wikimedia.org/wiki/File:Xiaolongbao_Shanghai.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `shanghai-nature.jpg` | Emcc83 | [Century Park 002.JPG](https://commons.wikimedia.org/wiki/File:Century_Park_002.JPG) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `shanghai-night.jpg` | Dllu | [Blue hour view of the Bund from the Shanghai World Financial Center dllu.jpg](https://commons.wikimedia.org/wiki/File:Blue_hour_view_of_the_Bund_from_the_Shanghai_World_Financial_Center_dllu.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `suzhou-city.jpg` | ZhengZhou | [Gate of Pingjiang Road, Suzhou.jpg](https://commons.wikimedia.org/wiki/File:Gate_of_Pingjiang_Road,_Suzhou.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `suzhou-food.jpg` | Windmemories | [20240205 Set-meal served at Songhelou.jpg](https://commons.wikimedia.org/wiki/File:20240205_Set-meal_served_at_Songhelou.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `suzhou-nature.jpg` | 钉钉 | [Jinji Lake Suzhou Jiangsu.jpg](https://commons.wikimedia.org/wiki/File:Jinji_Lake_Suzhou_Jiangsu.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `suzhou-night.jpg` | kevinmcgill from Den Bosch, Netherlands | [Moon Harbour 月光码头 (6439426883).jpg](https://commons.wikimedia.org/wiki/File:Moon_Harbour_%E6%9C%88%E5%85%89%E7%A0%81%E5%A4%B4_(6439426883).jpg) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0) |
| `xiamen-city.jpg` | Rolfmueller | [Gulangyu mansion 2011 12.jpg](https://commons.wikimedia.org/wiki/File:Gulangyu_mansion_2011_12.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `xiamen-food.jpg` | N509FZ | [Shacha Noodles at Dazhong's (20170119204328).jpg](https://commons.wikimedia.org/wiki/File:Shacha_Noodles_at_Dazhong%27s_(20170119204328).jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `xiamen-nature.jpg` | HorsefaCe | [厦门环岛路沙滩.jpg](https://commons.wikimedia.org/wiki/File:%E5%8E%A6%E9%97%A8%E7%8E%AF%E5%B2%9B%E8%B7%AF%E6%B2%99%E6%BB%A9.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `xiamen-night.jpg` | Popolon | [Xiamen night Skyline from Gulangyu.JPG](https://commons.wikimedia.org/wiki/File:Xiamen_night_Skyline_from_Gulangyu.JPG) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| `xian-city.jpg` | Alexey Komarov | [Giant Wild Goose Pagoda, Xi'an, May, 2018-1.jpg](https://commons.wikimedia.org/wiki/File:Giant_Wild_Goose_Pagoda,_Xi%27an,_May,_2018-1.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `xian-food.jpg` | Fumikas Sagisavas | [Laotongguan thousand layer roujiamo.jpg](https://commons.wikimedia.org/wiki/File:Laotongguan_thousand_layer_roujiamo.jpg) | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) |
| `xian-nature.jpg` | Ghrkya | [曲江池公园航拍图.jpg](https://commons.wikimedia.org/wiki/File:%E6%9B%B2%E6%B1%9F%E6%B1%A0%E5%85%AC%E5%9B%AD%E8%88%AA%E6%8B%8D%E5%9B%BE.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| `xian-night.jpg` | Khvlia | [大唐不夜城.jpg](https://commons.wikimedia.org/wiki/File:%E5%A4%A7%E5%94%90%E4%B8%8D%E5%A4%9C%E5%9F%8E.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
