"""Render retained portal content with the approved cinematic design system."""
from pathlib import Path
from PIL import Image
import json,re,html,math
R=Path(__file__).resolve().parents[1]
index=json.loads((R/'assets/js/search-index.js').read_text().split('=',1)[1].strip().rstrip(';'))
content=json.loads((R/'redesign/content.json').read_text())
H=lambda s:html.escape(str(s),quote=True)
SECTIONS={'news':'novinky','database':'databaza','theories':'teorie'}
RELATED={
'lucia-a-jason':['lucia','jason','dvojica-a-pribeh'],
'lucia':['jason','lucia-a-jason','dvojica-a-pribeh'],
'jason':['lucia','lucia-a-jason','dvojica-a-pribeh'],
'vice-city':['leonida','vice-city-navrat','pobrezie'],
'leonida':['vice-city','rozloha-mapy','tajomstva-leonidy'],
'vice-city-navrat':['vice-city','leonida','leonida-v-detailoch'],
'rozloha-mapy':['leonida','vice-city','rozpoznavanie-teorii'],
'dvojica-a-pribeh':['lucia','jason','lucia-a-jason'],
'internet-a-mesto':['zivot-ulic','svet-a-atmosfera','fakty-a-spekulacie'],
'oficialne-materialy':['oficialne-zdroje','fakty-a-spekulacie','rozpoznavanie-teorii'],
'oficialne-zdroje':['oficialne-materialy','fakty-a-spekulacie','rozpoznavanie-teorii'],
}
# Prefer crisp retained illustrations over the small legacy thumbnails.
IMAGES={'vice-city':'coast-cinema','vice-city-navrat':'coast-cinema','leonida':'sunset-palm','lucia-a-jason':'rockstar-lucia-jason','lucia':'rockstar-lucia-jason','jason':'rockstar-lucia-jason','leonida-v-detailoch':'sunset-palm','rozloha-mapy':'coast-cinema','zivot-ulic':'night-drive','internet-a-mesto':'night-drive','oficialne-zdroje':'coast-cinema','oficialne-materialy':'coast-cinema','rozpoznavanie-teorii':'night-drive','fakty-a-spekulacie':'night-drive','pobrezie':'coast-cinema'}
for lang in ['sk','cz']:
 cz=lang=='cz';other='sk' if cz else 'cz';base='/'+lang+'/'
 def tr(sk,cs):return cs if cz else sk
 labels={'news':tr('Čítareň','Čítárna'),'database':tr('Databáza','Databáze'),'theories':tr('Teórie','Teorie'),'community':tr('Moje témy','Moje témata'),'trailers':'Trailery'}
 cats={'overview':tr('Prehľad','Přehled'),'characters':'Postavy','character':'Postavy','analysis':tr('Rozbory','Rozbory'),'guide':tr('Zdroje a návody','Zdroje a návody'),'community':tr('Moje témy','Moje témata'),'location':tr('Lokácie','Lokace'),'world':tr('Svet','Svět'),'map':'Mapa','story':tr('Príbeh','Příběh')}
 docs=[d for d in index if d['lang']==lang and not d.get('feature')]
 def url(d):return '/'+d['url']
 def minutes(d):
  body=content[d['url']];words=len(re.sub('<[^>]+>',' ',body).split());return max(1,math.ceil(words/220))
 def picture(d,cls=''):
  name=IMAGES.get(d['slug'],Path(d['image']).stem);im=Image.open(R/'assets/img'/f'{name}.webp');w,h=im.size
  variant=R/'assets/img'/f'{name}-960.webp';ss=f' srcset="/assets/img/{name}-960.webp 960w, /assets/img/{name}.webp {w}w" sizes="(max-width:760px) 100vw, 50vw"' if variant.exists() and w>960 else ''
  alt=('Rockstar Games: '+d['title']) if name=='rockstar-lucia-jason' else tr('Ilustrácia: ','Ilustrace: ')+d['title']
  return f'<picture class="{cls}"><img src="/assets/img/{name}.webp"{ss} alt="{H(alt)}" loading="lazy" width="{w}" height="{h}"></picture>'
 def save(d):return f'<button type="button" class="home-save" data-save-id="{d["kind"]}:{d["slug"]}" aria-pressed="false" aria-label="{tr("Uložiť: ","Uložit: ")+H(d["title"])}"><span aria-hidden="true">＋</span><span class="save-label">{tr("Uložiť","Uložit")}</span></button>'
 def card(d,filterable=False):
  status=tr('Teória','Teorie') if d['kind']=='theories' else cats.get(d['category'],labels[d['kind']])
  attrs=f'data-filter-item data-category="{H(d["category"])}" data-search="{H(d["title"]+" "+d["excerpt"])}"' if filterable else ''
  return f'<article class="portal-card" {attrs}><a class="portal-card-image" href="{url(d)}">{picture(d)}</a><div class="portal-card-copy"><div class="portal-card-meta"><span>{status}</span><span>{minutes(d)} {tr("min čítania","min čtení")}</span></div><h3><a href="{url(d)}">{H(d['title'])}</a></h3><p>{H(d['excerpt'])}</p><div class="portal-card-bottom">{save(d)}<a href="{url(d)}" aria-label="{H(d['title'])}">↗</a></div></div></article>'
 def nav(section):return ''.join(f'<a href="{base}{p}/" {"aria-current=page" if section==k else ""}>{labels[k]}</a>' for k,p in [('database','databaza'),('community','komunita'),('news','novinky'),('trailers','trailery'),('theories','teorie')])
 def render(path,title,desc,main,section,extra=''):
  p=R/path/'index.html';old=p.read_text();head=old.split('<body',1)[0]
  head=re.sub(r'<link rel="(?:stylesheet|preload)"[^>]+>','',head)
  head=re.sub(r'<title>.*?</title>',f'<title>{H(title)} | ViceCore</title>',head)
  head=re.sub(r'<meta name="theme-color"[^>]+>','<meta name="theme-color" content="#0b181b">',head)
  head=re.sub(r'(<link rel="icon"[^>]*href=")[^"]+(")', r'\1/assets/favicon.svg?v=vc2\2',head)
  head=re.sub(r'<link rel="apple-touch-icon"[^>]+>','',head)
  head=re.sub(r'<link rel="shortcut icon"[^>]+>','',head)
  head=re.sub(r'<style id="vc-first-paint">.*?</style>','',head,flags=re.S)
  head=head.replace('<head>','<head><style id="vc-first-paint">:root{color-scheme:dark}html,body{margin:0;background:#0b181b;color:#f6ead4}body{font-family:Arial,sans-serif}</style>')
  head=head.replace('</head>','<link rel="shortcut icon" href="/assets/favicon.ico?v=vc2"><link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png?v=vc2"><link rel="stylesheet" href="/assets/css/editorial.css"><link rel="stylesheet" href="/assets/css/portal.css"></head>')
  switch='/'+other+'/'+str(path).split('/',1)[1]+'/'
  if section=='legal':switch=base.replace(lang,other)+('o-projektu/' if cz==False and 'o-projekte' in str(path) else 'o-projekte/' if cz and 'o-projektu' in str(path) else 'ochrana-soukromi/' if not cz else 'ochrana-sukromia/')
  about=base+('o-projektu/' if cz else 'o-projekte/');privacy=base+('ochrana-soukromi/' if cz else 'ochrana-sukromia/')
  body=f'''<body class="portal" data-lang="{lang}" data-section="{section}"><a class="skip" href="#main">{tr('Preskočiť na obsah','Přeskočit na obsah')}</a><div class="reading-progress" aria-hidden="true"></div>
<header class="masthead"><a class="wordmark" href="{base}" aria-label="ViceCore"><img class="brand-logo" src="/assets/brand/vicecore-logo-dark.svg" alt="ViceCore" width="205" height="42"></a><nav class="primary-nav" aria-label="{tr('Hlavná navigácia','Hlavní navigace')}">{nav(section)}</nav><div class="nav-tools"><button class="search-launch" aria-label="{tr('Hľadať','Hledat')}" title="Ctrl / ⌘ K"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button><div class="languages"><a href="{'/'+path.as_posix()+'/' if lang=='sk' else switch}" {"aria-current=page" if lang=='sk' else ''}>SK</a><a href="{'/'+path.as_posix()+'/' if lang=='cz' else switch}" {"aria-current=page" if lang=='cz' else ''}>CZ</a></div><button class="menu-button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Menu"><span></span><span></span></button></div><nav id="mobile-menu" class="mobile-menu" aria-label="Menu" hidden>{nav(section)}</nav></header>
<main id="main" class="portal-main shell {extra}">{main}</main>
<footer class="footer shell"><div class="footer-top"><a class="footer-logo" href="{base}" aria-label="ViceCore"><img class="brand-logo" src="/assets/brand/vicecore-logo-dark.svg" alt="ViceCore" width="260" height="53"></a><div class="footer-links">{nav('')}</div><a class="back-top" href="#main">↑ {tr('Späť hore','Zpět nahoru')}</a></div><div class="footer-bottom"><span>© 2026 VICECORE</span><p>{tr('Neoficiálny fanúšikovský projekt bez spojenia s Rockstar Games. Oficiálne zábery sú označené; ostatné obrázky sú fan art.','Neoficiální fanouškovský projekt bez spojení s Rockstar Games. Oficiální záběry jsou označené; ostatní obrázky jsou fan art.')}</p><div><a href="{about}">{tr('O projekte','O projektu')}</a><a href="{privacy}">{tr('Ochrana súkromia','Ochrana soukromí')}</a></div></div></footer>
<dialog id="search-dialog" aria-label="{tr('Hľadať','Hledat')}"><div class="search-top"><label class="sr-only" for="search-input">{tr('Hľadať','Hledat')}</label><input id="search-input" type="search" placeholder="{tr('Hľadaj postavy, miesta alebo články.','Hledej postavy, místa nebo články.')}" autocomplete="off"><button id="search-close" aria-label="{tr('Zavrieť','Zavřít')}">✕</button></div><div id="search-results" aria-live="polite"></div><div class="search-footer">CTRL / ⌘ K<span>ESC</span></div></dialog>
<script defer src="/assets/js/search-index.js"></script><script defer src="/assets/js/editorial.js"></script><script defer src="/assets/js/home-saves.js"></script><script defer src="/assets/js/portal.js"></script></body></html>'''
  p.write_text(head+body)
 def breadcrumb(items):return '<nav class="portal-crumbs" aria-label="'+tr('Navigácia stránky','Navigace stránky')+'"><a href="'+base+'">'+tr('Domov','Domů')+'</a>'+''.join('<span>/</span>'+ (f'<a href="{u}">{H(t)}</a>' if u else f'<span aria-current="page">{H(t)}</span>') for t,u in items)+'</nav>'
 def heading(title,desc,eye):return f'<div class="portal-heading"><p class="eyebrow">{eye}</p><h1>{H(title)}</h1><p class="portal-deck">{H(desc)}</p></div>'
 for kind,folder in SECTIONS.items():
  selected=[d for d in docs if d['kind']==kind]
  title={'news':tr('Čítareň.','Čítárna.'),'database':tr('Kto. Kde. S kým.','Kdo. Kde. S kým.'),'theories':tr('Zatiaľ bez odpovede.','Zatím bez odpovědi.')}[kind]
  desc={'news':tr('Rozbory, prehľady a súvislosti zo sveta GTA VI.','Rozbory, přehledy a souvislosti ze světa GTA VI.'),'database':tr('Profily postáv, miesta a zdroje. Vyber si stopu a pokračuj po súvislostiach.','Profily postav, místa a zdroje. Vyber si stopu a pokračuj po souvislostech.'),'theories':tr('Fanúšikovské hypotézy. Zaujímavá otázka ešte nie je potvrdená informácia.','Fanouškovské hypotézy. Zajímavá otázka ještě není potvrzená informace.')}[kind]
  categories=list(dict.fromkeys(d['category'] for d in selected))
  filters=f'<div class="portal-filters" role="group" aria-label="{tr("Filtrovať témy","Filtrovat témata")}"><button class="filter-btn" data-filter="all" aria-pressed="true">{tr("Všetko","Vše")}</button>'+''.join(f'<button class="filter-btn" data-filter="{c}" aria-pressed="false">{cats[c]}</button>' for c in categories)+'</div>'
  tools=f'<div class="portal-toolbar">{filters}<label class="portal-local-search"><span class="sr-only">{tr("Hľadať v témach","Hledat v tématech")}</span><input id="listing-query" type="search" placeholder="{tr("Nájdi tému…","Najdi téma…")}"></label></div><p id="listing-count" class="listing-count" aria-live="polite">{len(selected)} {tr("tém","témat")}</p>'
  main=breadcrumb([(labels[kind],None)])+heading(title,desc,labels[kind]+' / VICECORE')
  if kind=='theories':main+=f'<div class="portal-notice"><span>?</span><p>{tr("Tieto texty skúmajú možnosti. Potvrdené východiská a naše domnienky sú v texte oddelené.","Tyto texty zkoumají možnosti. Potvrzená východiska a naše domněnky jsou v textu oddělené.")}</p><a href="{base}databaza/rozpoznavanie-teorii/">{tr("Ako čítať teórie","Jak číst teorie")} ↗</a></div>'
  main+=tools+f'<noscript><p class="listing-count">{tr("Vyhľadávanie a filtre vyžadujú JavaScript. Všetky témy nájdeš v zozname nižšie.","Vyhledávání a filtry vyžadují JavaScript. Všechna témata najdeš v seznamu níže.")}</p></noscript>'+'<div class="portal-grid">'+''.join(card(d,True) for d in selected)+'</div>'+f'<div id="listing-empty" class="portal-empty" hidden><h2>{tr("Žiadna stopa.","Žádná stopa.")}</h2><p>{tr("Skús iné slovo alebo zobraz všetky témy.","Zkus jiné slovo nebo zobraz všechna témata.")}</p><button id="listing-reset" class="button ghost">{tr("Zrušiť filtre","Zrušit filtry")}</button></div>'
  render(Path(lang)/folder,title,desc,main,kind)
 for d in docs:
  body=content[d['url']];toc=[]
  def add_heading(m):
   n=len(toc)+1;text=html.unescape(re.sub('<[^>]+>','',m.group(1)));toc.append((f'chapter-{n}',text));return f'<h2 id="chapter-{n}">{m.group(1)}</h2>'
  body=re.sub(r'<h2[^>]*>(.*?)</h2>',add_heading,body,flags=re.S)
  related=[next(x for x in docs if x['slug']==slug) for slug in RELATED.get(d['slug'],[]) if any(x['slug']==slug for x in docs)]
  if d['kind']=='database':related=[x for x in related if x['kind']=='database']
  if len(related)<3:
   candidates=sorted((x for x in docs if x['slug']!=d['slug'] and x not in related),key=lambda x:(x['kind']!=d['kind'],x['category']!=d['category']))
   related=(related+candidates)[:3]
  note=tr('FANÚŠIKOVSKÁ TEÓRIA','FANOUŠKOVSKÁ TEORIE') if d['kind']=='theories' else tr('PROFIL','PROFIL') if d['kind']=='database' else tr('REDAKČNÝ ROZBOR','REDAKČNÍ ROZBOR')
  source='ROCKSTAR GAMES' if IMAGES.get(d['slug'])=='rockstar-lucia-jason' else 'VICECORE / FAN ART'
  toc_html='<nav class="article-toc" aria-label="'+tr('Obsah článku','Obsah článku')+'"><p class="eyebrow">'+tr('V TOMTO SPISE','V TOMTO SPISE')+'</p>'+''.join(f'<a href="#{id}">{H(text)}</a>' for id,text in toc)+'</nav>' if toc else ''
  sidebar=toc_html+f'<div class="article-trails"><p class="eyebrow">{tr("SÚVISIACE STOPY","SOUVISEJÍCÍ STOPY")}</p>'+''.join(f'<a href="{url(x)}"><span>{labels[x["kind"]]}</span><strong>{H(x["title"])}</strong><b>↗</b></a>' for x in related)+'</div>'
  main=breadcrumb([(labels[d['kind']],base+SECTIONS[d['kind']]+'/'),(d['title'],None)])+heading(d['title'],d['excerpt'],note+' / '+cats.get(d['category'],''))
  main+=f'<div class="article-top-meta"><span>{minutes(d)} {tr("min čítania","min čtení")}</span><span>VICECORE</span>{save(d)}</div><figure class="portal-hero">{picture(d)}<figcaption>{source}'+(' · <a href="https://www.rockstargames.com/VI/only-in-leonida" target="_blank" rel="noopener noreferrer">'+tr('Pôvodný zdroj','Původní zdroj')+' ↗</a>' if source=='ROCKSTAR GAMES' else '')+'</figcaption></figure>'
  if d['kind']=='theories':main+=f'<p class="theory-disclaimer">{tr("Tento text obsahuje nepotvrdené hypotézy. Nejde o oznámenie Rockstar Games.","Tento text obsahuje nepotvrzené hypotézy. Nejde o oznámení Rockstar Games.")}</p>'
  main+=f'<div class="portal-reading"><article class="doc-body">{body}<div class="article-actions">{save(d)}<button class="share-link button ghost" type="button">{tr("Skopírovať odkaz","Zkopírovat odkaz")} ↗</button></div></article><aside class="portal-aside">{sidebar}</aside></div><section class="portal-related"><div class="section-heading"><div><p class="eyebrow">{tr("POKRAČUJ PO STOPE","POKRAČUJ PO STOPĚ")}</p><h2>{tr("Čo ďalej?","Co dál?")}</h2></div></div><div class="portal-grid">'+''.join(card(x) for x in related)+'</div></section>'
  render(Path(d['url'].rstrip('/')),d['title'],d['excerpt'],main,d['kind'],'article-page')
 # Personal area: existing local poll + existing language-neutral saved IDs.
 title=tr('Tvoja knižnica.','Tvoje knihovna.');desc=tr('Uložené profily, miesta a články. Tvoj výber bez registrácie.','Uložené profily, místa a články. Tvůj výběr bez registrace.')
 main=breadcrumb([(labels['community'],None)])+heading(title,desc,tr('MOJE TÉMY','MOJE TÉMATA')+' / VICECORE')
 main+=f'<div class="personal-grid"><section class="personal-panel"><p class="eyebrow">{tr("NA NESKÔR","NA POZDĚJI")}</p><h2>{tr("Uložené témy","Uložená témata")}</h2><p>{tr("Výber zostáva v tomto prehliadači a funguje aj po prepnutí jazyka.","Výběr zůstává v tomto prohlížeči a funguje i po přepnutí jazyka.")}</p><div id="saved-list" class="portal-saved" aria-live="polite"><p>{tr("Na zobrazenie uložených tém zapni JavaScript.","Pro zobrazení uložených témat zapni JavaScript.")}</p></div></section><section class="personal-panel"><p class="eyebrow">{tr("TVOJ VÝBER","TVŮJ VÝBĚR")}</p><h2>{tr("Čo ťa láka?","Co tě láká?")}</h2><p>{tr("Vyber si tému, ktorú chceš preskúmať. Voľba je iba tvoja; nejde o verejnú anketu.","Vyber si téma, které chceš prozkoumat. Volba je jen tvoje; nejde o veřejnou anketu.")}</p><div class="portal-poll">'
 for val,text,target in [('world',tr('Svet a objavovanie','Svět a objevování'),'databaza/leonida'),('story',tr('Lucia a Jason','Lucia a Jason'),'databaza/lucia'),('vehicles',tr('Jazdenie a atmosféra','Jízda a atmosféra'),'databaza/svet-a-atmosfera'),('atmosphere',tr('Vice City','Vice City'),'databaza/vice-city')]:main+=f'<button class="poll-option" data-value="{val}" data-target="{base}{target}/" aria-pressed="false">{text}<span>↗</span></button>'
 main+=f'</div><p id="poll-note" class="personal-note" aria-live="polite">{tr("Uložené iba v tomto prehliadači.","Uloženo pouze v tomto prohlížeči.")}</p><a id="poll-explore" class="button coral" hidden>{tr("Preskúmať tému","Prozkoumat téma")} ↗</a><button id="poll-reset" class="personal-reset" hidden>{tr("Zmeniť výber","Změnit výběr")}</button></section></div><div class="portal-notice"><span>↗</span><p>{tr("Tvoja knižnica je osobná. Uložené témy zostávajú v tomto prehliadači; zdieľané účty a diskusie nie sú súčasťou tejto verzie.","Tvoje knihovna je osobní. Uložená témata zůstávají v tomto prohlížeči; sdílené účty a diskuse nejsou součástí této verze.")}</p></div>'
 render(Path(lang)/'komunita',title,desc,main,'community')
 for slug in [('o-projektu' if cz else 'o-projekte'),('ochrana-soukromi' if cz else 'ochrana-sukromia')]:
  path=Path(lang)/slug;key=path.as_posix()+'/';body=content[key]
  if 'o-proj' in slug:
   body=body.replace('Použité ilustrácie predstavujú fanúšikovskú atmosféru Vice City a nie sú označované za oficiálne zábery z hry.','Oficiálne zábery Rockstar Games označujeme a odkazujeme na pôvodný zdroj. Ostatné ilustrácie sú fan art.').replace('Použité ilustrace představují fanouškovskou atmosféru Vice City a nejsou označovány za oficiální záběry ze hry.','Oficiální záběry Rockstar Games označujeme a odkazujeme na původní zdroj. Ostatní ilustrace jsou fan art.')
  title=tr('O projekte','O projektu') if 'o-proj' in slug else tr('Ochrana súkromia','Ochrana soukromí')
  main=breadcrumb([(title,None)])+heading(title,'','VICECORE')+'<article class="doc-body portal-legal">'+body+'</article>'
  render(path,title,'',main,'legal')
print('Rendered 50 retained portal pages using shared navigation, article templates and local interactions.')
