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

首页山湖主视觉为通用旅行灵感摄影，不是武汉东湖实景；森林照片同样为氛围示意。日间路线主图分别使用东湖、江汉路、武汉热干面的摄影；夜景为武汉城市夜色，用于夜游主题氛围，不代表各个节点的现场实拍。

两张住宿摄影均为通用空间示意（原始作品来自境外住宿空间），不是武汉示例商家的实拍。页面中六家商家均为虚构教学示例，图文组合不表示摄影作者、实际住宿经营者与本项目存在合作关系。新增三张图片均经尺寸调整与 JPEG 压缩，展示时有 CSS 裁切。

Logo、路线示意图、图标均为项目内联 SVG；无第三方图标库、远程字体或地图服务。

获取日期：2026-10-19。可选素材下载工具位于 `tools/fetch_assets.py`，重新下载不是启动网站的必要步骤。
