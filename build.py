#!/usr/bin/env python3
"""Build retained ViceCore static portal + bilingual editorial homepages.
Requires Pillow; no runtime framework or server dependency.
"""
from pathlib import Path
import runpy,shutil,json
ROOT=Path(__file__).resolve().parent
runpy.run_path(str(ROOT/'redesign/generate.py'),run_name='__main__')
runpy.run_path(str(ROOT/'redesign/portal.py'),run_name='__main__')
runpy.run_path(str(ROOT/'redesign/trailer.py'),run_name='__main__')
home=(ROOT/'sk/index.html').read_text().replace('../assets/','/assets/').replace('href="../manifest.webmanifest"','href="/manifest.webmanifest"').replace('data-root="../"','data-root="/"')
(ROOT/'index.html').write_text(home)
out=ROOT/'dist'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['assets','sk','cz']:
 shutil.copytree(ROOT/name,out/name)
for name in ['index.html','404.html','robots.txt','sitemap.xml','manifest.webmanifest']:
 shutil.copy2(ROOT/name,out/name)
print('Static portal staged in dist. All retained content included.')
