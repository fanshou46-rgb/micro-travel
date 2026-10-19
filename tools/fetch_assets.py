"""下载静态摄影素材；来源与授权记录在 assets/CREDITS.md。"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from io import BytesIO
import re
from urllib.request import Request, urlopen
from urllib.parse import quote
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
ASSETS = {
    'hero': 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=88',
    'forest': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85',
    'lake': 'https://commons.wikimedia.org/wiki/File:Wuhan_East_Lake_02.jpg',
    'city': 'https://commons.wikimedia.org/wiki/File:江汉路步行街.jpg',
    'food': 'https://commons.wikimedia.org/wiki/File:Hot_dry_noodles.jpg',
}

def download(item):
    name, url = item
    url = quote(url, safe=':/?=&%')
    headers = {'User-Agent': 'DaytripCoursePrototype/1.0 (educational static site)'}
    if 'commons.wikimedia' in url:
        with urlopen(Request(url, headers=headers), timeout=45) as response:
            page = response.read().decode('utf-8')
        match = re.search(r'class="fullImageLink"[^>]*>\s*<a href="([^"]+)"', page)
        if not match:
            match = re.search(r'<a href="(https://upload.wikimedia.org/[^"]+)"[^>]*class="internal"', page)
        if not match:
            raise RuntimeError(f'No original URL: {name}')
        url = match.group(1).replace('&amp;', '&')
    url = quote(url, safe=':/?=&%')
    with urlopen(Request(url, headers=headers), timeout=60) as response:
        content = response.read()
    img = ImageOps.exif_transpose(Image.open(BytesIO(content))).convert('RGB')
    img.thumbnail((2400, 1600) if name == 'hero' else (1400, 1200))
    img.save(OUT / f'{name}.jpg', quality=88, optimize=True)
    return f'{name}: {img.size}, {(OUT / (name + ".jpg")).stat().st_size} bytes'

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=5) as pool:
        jobs = [pool.submit(download, item) for item in ASSETS.items()]
        for job in jobs:
            try:
                print(job.result())
            except Exception as error:
                print('ASSET ERROR:', error)
