"""Check real static routes, asset references, responsive dimensions and home structure."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
from PIL import Image
import json
R=Path(__file__).resolve().parents[1]/'dist'
class Tags(HTMLParser):
 def __init__(self):super().__init__();self.tags=[]
 def handle_starttag(self,name,attrs):self.tags.append((name,dict(attrs)))
broken=[];wrong=[];count=0
for p in R.rglob('*.html'):
 parser=Tags();parser.feed(p.read_text());count+=1
 for name,tag in parser.tags:
  for attr in ['href','src']:
   val=tag.get(attr,'');u=urlsplit(val)
   if not val or u.scheme or u.netloc or not u.path:continue
   dest=(R/u.path.lstrip('/')) if u.path.startswith('/') else (p.parent/unquote(u.path)).resolve()
   if dest.is_dir():dest=dest/'index.html'
   if not dest.exists():broken.append((str(p.relative_to(R)),val))
  for item in tag.get('srcset','').split(','):
   if not item.strip():continue
   src,desc=item.strip().split();dest=(R/src.lstrip('/')) if src.startswith('/') else (p.parent/src).resolve()
   if not dest.exists():broken.append((str(p.relative_to(R)),src));continue
   if desc.endswith('w') and int(desc[:-1])!=Image.open(dest).width:wrong.append((src,desc))
for lang in ['sk','cz']:
 parser=Tags();parser.feed((R/lang/'index.html').read_text());tags=parser.tags
 assert sum(n=='h1' for n,t in tags)==1
 assert any(n=='form' and t.get('role')=='search' and t.get('action')==f'/{lang}/databaza/' and t.get('method')=='get' for n,t in tags)
 assert any(n=='input' and t.get('name')=='q' for n,t in tags)
 assert any(n=='a' and t.get('href')==f'/{lang}/databaza/?kategoria=character' for n,t in tags)
 assert any(n=='a' and t.get('href')==f'/{lang}/databaza/?kategoria=location' for n,t in tags)
 assert not any(t.get('id')=='questions' or 'dispatch' in t.get('class','').split() for n,t in tags)
 home=(R/lang/'index.html').read_text()
 assert 'Zatiaľ bez odpovede' not in home and 'Zatím bez odpovědi' not in home
 assert sum('data-countdown-unit' in t for n,t in tags)==4
 assert any('data-countdown' in t for n,t in tags)
 assert sum(n=='a' and t.get('href')==f'/{lang}/mapa/' for n,t in tags)==3
 map_page=(R/lang/'mapa/index.html').read_text()
 assert ('Mapa města bude zpřístupněna po vydání GTA VI.' if lang=='cz' else 'Mapa mesta bude sprístupnená po vydaní GTA VI.') in map_page
 assert f'href="/{"sk" if lang=="cz" else "cz"}/mapa/"' in map_page
 assert f'rel="canonical" href="https://vicecore.matus-sturdik1.workers.dev/{lang}/mapa/"' in map_page
 assert all(t['data-save-id'].startswith('database:') for n,t in tags if 'data-save-id' in t)
 assert sum('category' in t.get('class','').split() for n,t in tags)==5
 assert sum('dossier' in t.get('class','').split() for n,t in tags)==5
 assert sum('story' in t.get('class','').split() for n,t in tags)==3
 assert sum(n=='link' and t.get('rel')=='stylesheet' for n,t in tags)==1
 ids=[t['id'] for n,t in tags if 'id' in t];assert len(ids)==len(set(ids))
 assert not any('built-in method' in p.read_text() for p in (R/lang).rglob('*.html'))
 assert any(n=='link' and t.get('hreflang')=='cs' for n,t in tags)
print(json.dumps({'html_pages':count,'broken_links_or_assets':broken,'wrong_srcset_dimensions':wrong},indent=2))
assert not broken and not wrong
print('Passed: bilingual routes, retained local links, assets, source dimensions and homepage structure.')
