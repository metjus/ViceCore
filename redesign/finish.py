"""Shared release polish: metadata, beta navigation, nested-path-safe 404 and sitemap."""
from pathlib import Path
from urllib.parse import urljoin
import re,html
from lxml import html as dom
R=Path(__file__).resolve().parents[1]
origin='https://vicecore.matus-sturdik1.workers.dev'
for lang in ['sk','cz']:
 for p in (R/lang).rglob('index.html'):
  source=p.read_text();tree=dom.fromstring(source);head=tree.find('head')
  route='/'+p.parent.relative_to(R).as_posix()+'/'
  other=route.replace('/'+lang+'/', '/'+('cz' if lang=='sk' else 'sk')+'/',1)
  for sk,cs in [('o-projekte','o-projektu'),('ochrana-sukromia','ochrana-soukromi')]:other=other.replace(sk,cs) if lang=='sk' else other.replace(cs,sk)
  title=tree.find('.//title').text
  deck=tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," portal-deck ")]')
  old=head.xpath('meta[@name="description"]')
  desc=deck[0].text_content().strip() if deck else old[0].get('content','') if old else ''
  if not desc:desc='ViceCore — '+('neoficiálny sprievodca svetom GTA VI.' if lang=='sk' else 'neoficiální průvodce světem GTA VI.')
  pictures=tree.xpath('//main//img')
  picture=urljoin(origin+route,pictures[0].get('src')) if pictures else origin+'/assets/img/night-drive.webp'
  def meta(attr,key,value):
   nodes=head.xpath(f'meta[@{attr}="{key}"]')
   node=nodes[0] if nodes else dom.Element('meta',**{attr:key})
   node.set('content',value)
   if not nodes:head.append(node)
  for attr,key,value in [('name','description',desc),('property','og:title',title),('property','og:description',desc),('property','og:url',origin+route),('property','og:image',picture),('property','og:locale','sk_SK' if lang=='sk' else 'cs_CZ'),('name','twitter:card','summary_large_image'),('name','twitter:title',title),('name','twitter:description',desc),('name','twitter:image',picture)]:meta(attr,key,value)
  for node in head.xpath('link[@rel="canonical"]|link[@rel="alternate" and @hreflang]'):head.remove(node)
  head.append(dom.Element('link',rel='canonical',href=origin+route))
  for code,path in [('sk',route if lang=='sk' else other),('cs',route if lang=='cz' else other),('x-default',route if lang=='sk' else other)]:head.append(dom.Element('link',rel='alternate',hreflang=code,href=origin+path))
  source=re.sub(r'<head>.*?</head>',lambda _:dom.tostring(head,encoding='unicode',method='html'),source,count=1,flags=re.S)
  footer=tree.xpath('//footer')[0]
  links=footer.xpath('.//div[@class="footer-bottom"]/div')[0]
  if not links.xpath('a[contains(@href,"/beta/")]'):
   a=dom.Element('a',href='/'+lang+'/beta/',**{'class':'beta-link'});a.text='Beta 01';links.append(a)
  source=re.sub(r'<footer\b.*?</footer>',lambda _:dom.tostring(footer,encoding='unicode',method='html'),source,count=1,flags=re.S)
  p.write_text(source)
parts=[]
for lang in ['sk','cz']:
 cs=lang=='cz';tr=lambda sk,cz:cz if cs else sk
 parts.append(f'''<section data-error-lang="{lang}"><p class="eyebrow">VICECORE / 404</p><h2>{tr('Túto stránku<br>sme nenašli.','Tuto stránku<br>jsme nenašli.')}</h2><p>{tr('Odkaz už nemusí byť aktuálny. Pokračuj na úvod alebo si vyber tému v databáze.','Odkaz už nemusí být aktuální. Pokračuj na úvod nebo si vyber téma v databázi.')}</p><div class="error-actions"><a class="button coral" href="/{lang}/">{tr('Späť na úvod','Zpět na úvod')} ↗</a><a class="button ghost" href="/{lang}/databaza/">{tr('Otvoriť databázu','Otevřít databázi')} ↗</a></div></section>''')
error=f'''<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style id="vc-first-paint">:root{{color-scheme:dark}}html,body{{margin:0;background:#0b181b;color:#f6ead4}}body{{font-family:Arial,sans-serif}}html[lang="sk"] [data-error-lang="cz"],html[lang="cs"] [data-error-lang="sk"]{{display:none}}</style><script>document.documentElement.lang=location.pathname.startsWith('/cz/')?'cs':'sk';</script><meta name="robots" content="noindex"><meta name="theme-color" content="#0b181b"><title>404 | ViceCore</title><link rel="icon" href="/assets/favicon.svg?v=vc2"><link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png?v=vc2"><link rel="stylesheet" href="/assets/css/editorial.css"><link rel="stylesheet" href="/assets/css/beta.css"></head><body class="error-page"><header class="error-header shell"><a href="/sk/" id="error-home" aria-label="ViceCore"><img src="/assets/brand/vicecore-logo-dark.svg" alt="ViceCore" width="205" height="42"></a><nav class="languages" aria-label="Jazyk"><a href="/sk/" lang="sk">SK</a><a href="/cz/" lang="cs">CZ</a></nav></header><main class="error-main shell"><h1>404<span aria-hidden="true">.</span></h1><div>{''.join(parts)}</div></main><script>document.getElementById('error-home').href=document.documentElement.lang==='cs'?'/cz/':'/sk/';</script></body></html>'''
(R/'404.html').write_text(error)
routes=['/'+p.parent.relative_to(R).as_posix()+'/' for lang in ['sk','cz'] for p in (R/lang).rglob('index.html')]
(R/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('<url><loc>'+origin+html.escape(route)+'</loc></url>\n' for route in sorted(routes))+'</urlset>\n')
print('Finalized page metadata, Beta 01 footer links, bilingual 404 and sitemap.')
