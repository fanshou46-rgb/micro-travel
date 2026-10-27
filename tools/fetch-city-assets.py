"""下载可再分发的 Commons 摄影及完整授权信息；不在运行时请求远程图片。"""
import concurrent.futures, html, io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/images'
MANIFEST=ROOT/'assets/city-photos.json'
QUERIES={
 'beijing':['Summer Palace Kunming Lake','Beijing Jingshan Forbidden City','Beijing zhajiangmian noodles','Beijing Qianmen night'],
 'shanghai':['Shanghai Century Park','Shanghai Bund skyline day','Shanghai xiaolongbao','Shanghai Bund night'],
 'xian':['Qujiang Pool','Giant Wild Goose Pagoda','roujiamo','Grand Tang Mall night'],
 'chengdu':['Chengdu Huanhuaxi Park','Chengdu Kuanzhai Alley','Sichuan dan dan noodles','Chengdu night Anshun Bridge'],
 'hangzhou':['Hangzhou West Lake','Hangzhou Hefang Street','Hangzhou Dongpo pork','Hangzhou West Lake night'],
 'chongqing':['Chongqing Nanshan mountain','Chongqing Jiefangbei 2023','Chongqing hot pot','Hongyadong night'],
 'nanjing':['Nanjing Xuanwu Lake','Nanjing Laomendong','Nanjing duck blood vermicelli soup','Nanjing Qinhuai night'],
 'guangzhou':['Guangzhou Baiyun Mountain','Guangzhou Shamian','Cantonese dim sum','Guangzhou Canton Tower night'],
 'suzhou':['Suzhou Jinji Lake','Suzhou Pingjiang Road','Suzhou noodles','Suzhou Jinji Lake night'],
 'xiamen':['Xiamen Huangcuo beach','Gulangyu architecture','shacha noodles','Xiamen night skyline'],
 'changsha':['Changsha Yuelu Mountain','Changsha Orange Isle','Changsha stinky tofu','Changsha night Xiang river'],
}
HEADERS={'User-Agent':'DaytripEducationalPrototype/1.5 (local classroom travel project)'}
def get(url):
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=45) as r:return r.read()
        except Exception:
            if attempt==3:raise
            time.sleep(2+attempt*3)
def clean(v):return html.unescape(re.sub('<[^>]+>','',v or '')).strip()
def download(task):
    city,kind,query=task;key=f'{city}-{kind}'
    locked=json.loads(MANIFEST.read_text('utf-8')) if MANIFEST.exists() else {}
    params={'action':'query','prop':'imageinfo','iiprop':'url|size|extmetadata','iiurlwidth':1280,'format':'json'}
    if key in locked:
        # 交付的 manifest 锁定经过人工核对的作品；补图时不重新猜选搜索结果。
        params['titles']=locked[key]['title']
    else:params.update({'generator':'search','gsrsearch':query+' filetype:bitmap','gsrnamespace':6,'gsrlimit':8})
    url='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode(params)
    pages=json.loads(get(url)).get('query',{}).get('pages',{})
    candidates=sorted(pages.values(),key=lambda p:p.get('index',999))
    errors=[]
    for page in candidates:
        info=page['imageinfo'][0];meta=info.get('extmetadata',{})
        license=clean(meta.get('LicenseShortName',{}).get('value',''))
        if not re.search(r'CC BY|CC0|Public domain',license,re.I):continue
        if info.get('width',0)<600 or info.get('height',0)<350:continue
        try:
            raw=get(info.get('thumburl',info['url']))
            image=ImageOps.exif_transpose(Image.open(io.BytesIO(raw))).convert('RGB')
            image.thumbnail((1440,1100))
            image.save(OUT/f'{key}.jpg',quality=84,optimize=True)
            return key,{'query':query,'title':page['title'],'source':info['descriptionurl'],'original':info['url'],'artist':clean(meta.get('Artist',{}).get('value','')),'license':license,'licenseUrl':meta.get('LicenseUrl',{}).get('value',''),'description':clean(meta.get('ImageDescription',{}).get('value',''))[:1200],'width':image.width,'height':image.height,'modified':'EXIF orientation, resized, JPEG compression; display crop','retrieved':'2026-10-27'}
        except Exception as ex:errors.append(str(ex))
    raise RuntimeError(f'{key}: no usable image {errors}')
if __name__=='__main__':
    old=json.loads(MANIFEST.read_text('utf-8')) if MANIFEST.exists() else {}
    tasks=[(city,kind,query) for city,queries in QUERIES.items() for kind,query in zip(['nature','city','food','night'],queries) if f'{city}-{kind}' not in old or not (OUT/f'{city}-{kind}.jpg').exists()]
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
        futures={pool.submit(download,t):t for t in tasks}
        for future in concurrent.futures.as_completed(futures):
            try:
                key,value=future.result();old[key]=value;MANIFEST.write_text(json.dumps(old,ensure_ascii=False,indent=2),'utf-8');print('OK',key,value['title'],flush=True)
            except Exception as ex:print('FAIL',futures[future],str(ex),flush=True)
    print('TOTAL',len(old),'/ 44',flush=True)
