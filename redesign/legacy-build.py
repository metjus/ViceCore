#!/usr/bin/env python3
"""Build ViceCore static pages from bilingual starter content.

Python 3 + Jinja2 required only to rebuild, NOT on web hosting.
Usage: python build.py
"""
from __future__ import annotations
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape
import json, sys, re
from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'source'))
from content import ARTICLES  # noqa: E402

ENV = Environment(loader=FileSystemLoader(str(ROOT / 'source' / 'templates')),
                  autoescape=select_autoescape(['html','xml']))

T = {
'sk': dict(skip='Preskočiť na obsah',home='Domov',news='Novinky',database='Databáza',theories='Teórie',community='Komunita',about='O projekte',privacy='Ochrana súkromia',main_nav='Hlavná navigácia',mobile_nav='Mobilná navigácia',search='Hľadať',search_placeholder='Hľadať články, lokácie, postavy…',search_hint='Tip: vyhľadávanie otvoríš aj cez Ctrl + K.',language='Jazyk',open_menu='Otvoriť menu',close='Zavrieť',top='Späť hore',footer_desc='Tvoje miesto pre novinky, prehľady a fanúšikovské teórie zo sveta GTA VI. Nezávislý komunitný projekt pre Slovensko a Česko.',explore='Preskúmaj',information='Informácie',disclaimer='Nezávislý fanúšikovský web bez spojenia s Rockstar Games alebo Take-Two Interactive. Grand Theft Auto a GTA sú ochranné známky ich vlastníkov.',hero_line='Vitaj vo',hero_desc='Novinky, články, databáza, teórie a všetko z Leonidy na jednom mieste. Moderný GTA VI fan portál pre Slovensko a Česko.',latest_news='Najnovšie články',explore_db='Preskúmať databázu',fan_project='Nezávislý fan portál',discover='Objav svet',featured_title='Tvoj vstup do Leonidy',editorial='Redakčný výber',news_desc='Zrozumiteľné prehľady, analýzy a kontext — bez vymyslených senzácií.',show_all='Zobraziť všetko',explore_world='Spoznaj Leonidu',explore_heading='Všetko dôležité. Prehľadne na jednom mieste.',explore_copy='Miesta, postavy a tematické sprievodce. Databázu priebežne prepájame s článkami a vždy odlišujeme potvrdené informácie od špekulácií.',open_database='Otvoriť databázu',db_entries='záznamov v databáze',editorial_articles='redakčných článkov',community_theories='fanúšikovských teórií',two_languages='jedna komunita',unconfirmed='Hypotézy a postrehy',theory_heading='Čo ak je to inak?',theory_desc='Teórie sú zaujímavé práve preto, že ešte nemáme všetky odpovede.',news_heading='Novinky & články',news_intro='Všetko podstatné o GTA VI bez informačného chaosu. Prehľady, komentáre aj analýzy s jasným kontextom.',news_list='Všetky články',db_heading='Databáza GTA VI',db_intro='Prehľad postáv, miest a sveta Leonidy. Jednotlivé záznamy prepájame so zdrojmi a súvisiacimi článkami.',db_list='Objav databázu',theories_heading='Teórie & analýzy',theories_intro='Záhady sveta Leonida, príbehové hypotézy a detailné postrehy. Každá teória je označená ako nepotvrdená.',theories_list='Všetky teórie',filters='Filtrovať obsah',all='Všetko',no_results='Pre tento filter zatiaľ nemáme obsah.',reading='čítania',editorial_team='Tím ViceCore',no_publication_date='Úvodný obsah',theory_status='Stav informácie',unconfirmed_notice='Fanúšikovská interpretácia, nie oficiálne potvrdený fakt.',database_note='O databáze',database_status_note='Informácie priebežne dopĺňame a oddeľujeme fakty od interpretácií.',source_title='Odporúčaný východiskový zdroj',source_note='Oficiálna stránka GTA VI na webe',save='Uložiť článok',copy_link='Kopírovať odkaz',back_to_list='Späť na prehľad',read_more='Ďalšie na prečítanie',aside_note='Ilustrácie na tomto webe sú fanúšikovské vizuály, nie oficiálne screenshoty.',community_eyebrow='Jeden svet, dva jazyky',community_title='Komunita ViceCore',community_intro='Miesto pre ľudí, ktorých baví skúmať každý detail GTA VI. Zatiaľ si môžeš ukladať články a vyskúšať malú lokálnu anketu.',local_poll='Mini anketa',poll_question='Na čo sa v GTA VI najviac tešíš?',poll_intro='Vyber si jednu možnosť. Výsledok ostáva iba v tvojom prehliadači; nejde o verejné hlasovanie.',poll_private='Hlasovanie je iba lokálne. Nezbierame žiadne odpovede na server.',change_answer='Zmeniť odpoveď',personal_space='Len pre teba',saved_articles='Uložené články',saved_intro='Články si uložíš hviezdičkou. Zoznam ostane v tomto prehliadači.',coming_soon='Pripravujeme',forum_notice='Spoločné komentáre, diskusné vlákna a používateľské účty si vyžadujú serverovú časť. Spustíme ich až po dokončení moderovania a ochrany účtov.',values='Ako to chceme robiť',community_rules='Pravidlá dobrej komunity',rule_tag='Pravidlo',rule1_title='Diskutuj s rešpektom',rule1_text='Iný názor nie je problém. Osobné útoky a urážky do komunity nepatria.',rule2_title='Označuj spoilery',rule2_text='Nenaruš ostatným prekvapenie. Dôležité dejové odhalenia vždy jasne označ.',rule3_title='Overuj zdroje',rule3_text='Rozlišuj medzi oficiálnou správou, analýzou a čistou fanúšikovskou teóriou.'),
'cz': dict(skip='Přeskočit na obsah',home='Domů',news='Novinky',database='Databáze',theories='Teorie',community='Komunita',about='O projektu',privacy='Ochrana soukromí',main_nav='Hlavní navigace',mobile_nav='Mobilní navigace',search='Hledat',search_placeholder='Hledat články, lokace, postavy…',search_hint='Tip: vyhledávání otevřeš také přes Ctrl + K.',language='Jazyk',open_menu='Otevřít menu',close='Zavřít',top='Zpět nahoru',footer_desc='Tvoje místo pro novinky, přehledy a fanouškovské teorie ze světa GTA VI. Nezávislý komunitní projekt pro Slovensko a Česko.',explore='Prozkoumej',information='Informace',disclaimer='Nezávislý fanouškovský web bez spojení s Rockstar Games nebo Take-Two Interactive. Grand Theft Auto a GTA jsou ochranné známky jejich vlastníků.',hero_line='Vítej na',hero_desc='Novinky, články, databáze, teorie a všechno z Leonidy na jednom místě. Moderní GTA VI fan portál pro Slovensko a Česko.',latest_news='Nejnovější články',explore_db='Prozkoumat databázi',fan_project='Nezávislý fan portál',discover='Objev svět',featured_title='Tvůj vstup do Leonidy',editorial='Redakční výběr',news_desc='Srozumitelné přehledy, analýzy a kontext — bez vymyšlených senzací.',show_all='Zobrazit vše',explore_world='Poznej Leonidu',explore_heading='Všechno důležité. Přehledně na jednom místě.',explore_copy='Místa, postavy a tematické průvodce. Databázi průběžně propojujeme s články a vždy oddělujeme potvrzené informace od spekulací.',open_database='Otevřít databázi',db_entries='záznamů v databázi',editorial_articles='redakčních článků',community_theories='fanouškovských teorií',two_languages='jedna komunita',unconfirmed='Hypotézy a postřehy',theory_heading='Co když je to jinak?',theory_desc='Teorie jsou zajímavé právě proto, že ještě nemáme všechny odpovědi.',news_heading='Novinky & články',news_intro='Všechno podstatné o GTA VI bez informačního chaosu. Přehledy, komentáře i analýzy s jasným kontextem.',news_list='Všechny články',db_heading='Databáze GTA VI',db_intro='Přehled postav, míst a světa Leonidy. Jednotlivé záznamy propojujeme se zdroji a souvisejícími články.',db_list='Objev databázi',theories_heading='Teorie & analýzy',theories_intro='Záhady světa Leonida, příběhové hypotézy a detailní postřehy. Každá teorie je označená jako nepotvrzená.',theories_list='Všechny teorie',filters='Filtrovat obsah',all='Vše',no_results='Pro tento filtr zatím nemáme obsah.',reading='čtení',editorial_team='Tým ViceCore',no_publication_date='Úvodní obsah',theory_status='Stav informace',unconfirmed_notice='Fanouškovská interpretace, nikoli oficiálně potvrzený fakt.',database_note='O databázi',database_status_note='Informace průběžně doplňujeme a oddělujeme fakta od interpretací.',source_title='Doporučený výchozí zdroj',source_note='Oficiální stránka GTA VI na webu',save='Uložit článek',copy_link='Kopírovat odkaz',back_to_list='Zpět na přehled',read_more='Další ke čtení',aside_note='Ilustrace na tomto webu jsou fanouškovské vizuály, nikoli oficiální screenshoty.',community_eyebrow='Jeden svět, dva jazyky',community_title='Komunita ViceCore',community_intro='Místo pro lidi, které baví zkoumat každý detail GTA VI. Zatím si můžeš ukládat články a vyzkoušet malou místní anketu.',local_poll='Mini anketa',poll_question='Na co se v GTA VI nejvíc těšíš?',poll_intro='Vyber si jednu možnost. Výsledek zůstává pouze v tvém prohlížeči; nejde o veřejné hlasování.',poll_private='Hlasování je pouze místní. Nesbíráme žádné odpovědi na server.',change_answer='Změnit odpověď',personal_space='Jen pro tebe',saved_articles='Uložené články',saved_intro='Články si uložíš hvězdičkou. Seznam zůstane v tomto prohlížeči.',coming_soon='Připravujeme',forum_notice='Společné komentáře, diskusní vlákna a uživatelské účty vyžadují serverovou část. Spustíme je až po dokončení moderování a ochrany účtů.',values='Jak to chceme dělat',community_rules='Pravidla dobré komunity',rule_tag='Pravidlo',rule1_title='Diskutuj s respektem',rule1_text='Jiný názor není problém. Osobní útoky a urážky do komunity nepatří.',rule2_title='Označuj spoilery',rule2_text='Nekaz ostatním překvapení. Důležitá dějová odhalení vždy jasně označ.',rule3_title='Ověřuj zdroje',rule3_text='Rozlišuj mezi oficiální zprávou, analýzou a čistě fanouškovskou teorií.')
}

CATEGORIES = {
'news': {'overview':('Prehľad','Přehled'),'characters':('Postavy','Postavy'),'analysis':('Analýza','Analýza'),'guide':('Sprievodca','Průvodce'),'community':('Komunita','Komunita')},
'database':{'location':('Lokácie','Lokace'),'character':('Postavy','Postavy'),'world':('Svet','Svět'),'guide':('Sprievodca','Průvodce')},
'theories':{'map':('Mapa','Mapa'),'story':('Príbeh','Příběh'),'world':('Svet','Svět')}
}
NAV_IDS=('home','news','database','theories','community')
SECTIONS={'home':'','news':'novinky','database':'databaza','theories':'teorie','community':'komunita'}

def article_url(article,lang):
    return f"{lang}/{SECTIONS[article['kind']]}/{article['slug']}/"

def page_url(page,lang):
    if page in SECTIONS:return f"{lang}/{SECTIONS[page]}/" if page!='home' else f'{lang}/'
    if page=='about':return f"{lang}/{'o-projekte' if lang=='sk' else 'o-projektu'}/"
    if page=='privacy':return f"{lang}/{'ochrana-sukromia' if lang=='sk' else 'ochrana-soukromi'}/"
    raise ValueError(page)

def local_item(article,lang):
    kind=article['kind']
    return dict(slug=article['slug'],kind=kind,category=article['category'],
        category_label=CATEGORIES[kind][article['category']][0 if lang=='sk' else 1],
        title=article['title'][lang],excerpt=article['excerpt'][lang],
        paragraphs=article['paragraphs'][lang],image=article['image'],read=article['read'],
        url=article_url(article,lang),section=SECTIONS[kind],section_url=page_url(kind,lang),
        alt=('Ilustračný obrázok k téme ' if lang=='sk' else 'Ilustrační obrázek k tématu ')+article['title'][lang])

def common_context(lang,path,alt_path,title,description,page_section):
    parts=Path(path+'index.html').parent.parts
    root='../'*len(parts)
    sk_path=path if lang=='sk' else alt_path
    cz_path=alt_path if lang=='sk' else path
    labels=T[lang]
    navs=[dict(id=name,name=labels['home' if name=='home' else name],href=page_url(name,lang)) for name in NAV_IDS]
    return dict(lang=lang,html_lang='sk' if lang=='sk' else 'cs',root=root,path=path,sk_path=sk_path,cz_path=cz_path,title=title+' | ViceCore',description=description,og_type='website',t=labels,navs=navs,page_section=page_section)

def render(template,lang,path,other_path,title,description,page_section,**extra):
    context=common_context(lang,path,other_path,title,description,page_section)
    context.update(extra)
    if template=='detail.html':context['og_type']='article'
    html=ENV.get_template(template).render(**context)
    # Never link to a bare directory: Chrome/Edge file:// displays a folder index.
    # Explicit index.html works on disk AND over HTTP, including deep nested pages.
    def fix_local_href(match):
        href=match.group(2)
        if href.startswith(('http:', 'https:', '//', '#', 'mailto:', 'tel:', 'javascript:')) or '?' in href:
            return match.group(0)
        if href.endswith('/'):
            return match.group(1)+href+'index.html'+match.group(3)
        return match.group(0)
    html=re.sub(r'(href=[\"\'])([^\"\']+)([\"\'])',fix_local_href,html)
    output=ROOT / path / 'index.html'
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(html,encoding='utf-8')
    return path

def filter_data(kind,lang):
    data=[{'id':'all','label':T[lang]['all']}]
    for category,labels in CATEGORIES[kind].items():
        data.append({'id':category,'label':labels[0 if lang=='sk' else 1]})
    return data

INFO={
'sk':{
'about':(
    'O projekte ViceCore', 'Fanúšikovská platforma vytvorená pre ľudí, ktorí chcú objavovať svet GTA VI bez informačného chaosu.',
    [('Prečo ViceCore existuje',['Chceme na jednom mieste zhromaždiť čitateľné novinky, prehľadnú databázu a zaujímavé teórie. Každý obsah je k dispozícii po slovensky aj po česky.','Projekt budujeme ako nezávislé médium pre fanúšikov, nie ako oficiálny web hry.']),('Ako pristupujeme k informáciám',['Oficiálne potvrdené fakty oddeľujeme od analýz a nepotvrdených hypotéz. Pri vývoji projektu budeme dopĺňať odkazy na pôvodné zdroje a aktualizovať staršie texty.','Aktuálne texty sú štartovací redakčný obsah pripravený na dopracovanie pred verejným spustením.']),('Nezávislosť a vizuály',['ViceCore nie je prepojený s Rockstar Games ani Take-Two Interactive. Grand Theft Auto, GTA a súvisiace názvy patria ich príslušným vlastníkom.','Použité ilustrácie predstavujú fanúšikovskú atmosféru Vice City a nie sú označované za oficiálne zábery z hry.'])]),
'privacy':(
    'Ochrana súkromia','Jednoduché a transparentné vysvetlenie toho, aké údaje táto verzia webu spracúva.',
    [('Lokálne ukladanie v prehliadači',['Táto statická verzia ViceCore používa localStorage iba na ukladanie hviezdičkou označených článkov a voľby v malej ankete. Informácie zostávajú v tvojom zariadení, neodosielajú sa na server a môžeš ich vymazať cez nastavenia prehliadača.']),('Vyhľadávanie a cookies',['Vyhľadávanie prebieha priamo v prehliadači, bez posielania dotazov na server aplikácie. Web vo svojej základnej verzii nepoužíva analytické ani reklamné cookies.','Poskytovateľ hostingu môže viesť technické serverové logy podľa vlastných pravidiel. Po výbere hostingu je potrebné doplniť údaje o prevádzkovateľovi a jeho zásadách ochrany osobných údajov.']),('Externé odkazy',['Odkazy na Rockstar Games smerujú na externú stránku a jej pravidlá ochrany súkromia sa môžu líšiť.','Pred uvedením webu do verejnej prevádzky je potrebné tieto informácie aktualizovať podľa skutočne používaných služieb a právnych požiadaviek.'])])
},
'cz':{
'about':(
    'O projektu ViceCore','Fanouškovská platforma vytvořená pro lidi, kteří chtějí objevovat svět GTA VI bez informačního chaosu.',
    [('Proč ViceCore existuje',['Chceme na jednom místě shromáždit srozumitelné novinky, přehlednou databázi a zajímavé teorie. Každý obsah je k dispozici slovensky i česky.','Projekt budujeme jako nezávislé médium pro fanoušky, nikoli jako oficiální web hry.']),('Jak přistupujeme k informacím',['Oficiálně potvrzená fakta oddělujeme od analýz a nepotvrzených hypotéz. Při rozvoji projektu budeme doplňovat odkazy na původní zdroje a aktualizovat starší texty.','Současné texty jsou úvodní redakční obsah určený k dopracování před veřejným spuštěním.']),('Nezávislost a vizuály',['ViceCore není propojený s Rockstar Games ani Take-Two Interactive. Grand Theft Auto, GTA a související názvy patří příslušným vlastníkům.','Použité ilustrace představují fanouškovskou atmosféru Vice City a nejsou označovány za oficiální záběry ze hry.'])]),
'privacy':(
    'Ochrana soukromí','Jednoduché a transparentní vysvětlení toho, jaké údaje tato verze webu zpracovává.',
    [('Místní ukládání v prohlížeči',['Tato statická verze ViceCore používá localStorage pouze k ukládání článků označených hvězdičkou a volby v malé anketě. Informace zůstávají ve tvém zařízení, neodesílají se na server a můžeš je vymazat v nastavení prohlížeče.']),('Vyhledávání a cookies',['Vyhledávání probíhá přímo v prohlížeči, bez odesílání dotazů na server aplikace. Web v základní verzi nepoužívá analytické ani reklamní cookies.','Poskytovatel hostingu může vést technické serverové logy podle vlastních pravidel. Po výběru hostingu je nutné doplnit údaje o provozovateli a jeho zásadách ochrany osobních údajů.']),('Externí odkazy',['Odkazy na Rockstar Games směřují na externí stránku a její pravidla ochrany soukromí se mohou lišit.','Před uvedením webu do veřejného provozu je třeba tyto informace aktualizovat podle skutečně používaných služeb a právních požadavků.'])])
}}

def main():
    generated=[]
    index=[]
    for lang in ('sk','cz'):
        t=T[lang]
        items=[local_item(a,lang) for a in ARTICLES]
        bykind={kind:[x for x in items if x['kind']==kind] for kind in ('news','database','theories')}
        home_desc=t['hero_desc']
        generated.append(render('home.html',lang,page_url('home',lang),page_url('home','cz' if lang=='sk' else 'sk'),t['hero_line']+' ViceCore',home_desc,'home',featured_news=bykind['news'][1],featured_database=bykind['database'][0],featured_theory=bykind['theories'][1],latest_news=bykind['news'][:6],featured_theories=bykind['theories'][:2],news_count=len(bykind['news']),db_count=len(bykind['database']),theory_count=len(bykind['theories'])))
        for kind in ('news','database','theories'):
            generated.append(render('listing.html',lang,page_url(kind,lang),page_url(kind,'cz' if lang=='sk' else 'sk'),t[{'news':'news_heading','database':'db_heading','theories':'theories_heading'}[kind]],t[{'news':'news_intro','database':'db_intro','theories':'theories_intro'}[kind]],kind,
                page_name=t[kind],heading=t[{'news':'news_heading','database':'db_heading','theories':'theories_heading'}[kind]],intro=t[{'news':'news_intro','database':'db_intro','theories':'theories_intro'}[kind]],list_title=t[{'news':'news_list','database':'db_list','theories':'theories_list'}[kind]],items=bykind[kind],filters=filter_data(kind,lang),listing_kind=kind,grid_class={'news':'stories-grid','database':'db-grid','theories':'theory-grid'}[kind]))
        poll_options=[{'key':'world','name':'Otvorený svet a objavovanie' if lang=='sk' else 'Otevřený svět a objevování'}, {'key':'story','name':'Príbeh Lucie a Jasona' if lang=='sk' else 'Příběh Lucie a Jasona'}, {'key':'vehicles','name':'Autá a jazdenie' if lang=='sk' else 'Auta a ježdění'}, {'key':'atmosphere','name':'Atmosféra Vice City' if lang=='sk' else 'Atmosféra Vice City'}]
        generated.append(render('community.html',lang,page_url('community',lang),page_url('community','cz' if lang=='sk' else 'sk'),t['community_title'],t['community_intro'],'community',poll_options=poll_options))
        for key in ('about','privacy'):
            heading,intro,sections=INFO[lang][key]
            formatted=[{'heading':head,'paragraphs':paragraphs} for head,paragraphs in sections]
            generated.append(render('info.html',lang,page_url(key,lang),page_url(key,'cz' if lang=='sk' else 'sk'),heading,intro,key,info_title=heading,info_intro=intro,info_sections=formatted))
        for article in ARTICLES:
            item=local_item(article,lang)
            related=[a for a in bykind[item['kind']] if a['slug']!=item['slug']][:4]
            generated.append(render('detail.html',lang,item['url'],article_url(article,'cz' if lang=='sk' else 'sk'),item['title'],item['excerpt'],item['kind'],item=item,section_name=t[item['kind']],related=related))
            index.append({k:item[k] for k in ('slug','kind','category','title','excerpt','image','url')}|{'lang':lang})
    # Search data stays in a local .js file, so file:// preview doesn't need fetch or API.
    (ROOT/'assets/js/search-index.js').write_text('window.VICECORE_INDEX = '+json.dumps(index,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
    # HTTP servers automatically show the Slovak page when opening /.
    (ROOT/'index.html').write_text('''<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=sk/index.html"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ViceCore — GTA VI fan portál</title></head><body><p><a href="sk/index.html">Vstúpiť na ViceCore →</a></p></body></html>''',encoding='utf-8')
    (ROOT/'404.html').write_text('''<!doctype html><html lang="sk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="assets/css/style.css"><link rel="stylesheet" href="assets/css/2026.css"><title>404 | ViceCore</title></head><body><main class="container not-found"><div><h1>404</h1><h2>Táto stránka neexistuje.</h2><p>Skús sa vrátiť na úvodnú stránku ViceCore.</p><a class="btn btn-primary" href="sk/index.html">Späť domov →</a></div></main></body></html>''',encoding='utf-8')
    sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>https://vicecore.sk/{xml_escape(path)}</loc></url>\n' for path in generated)+'</urlset>\n'
    (ROOT/'sitemap.xml').write_text(sitemap,encoding='utf-8')
    (ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://vicecore.sk/sitemap.xml\n',encoding='utf-8')
    print(f'Built {len(generated)} localized pages + index + 404; {len(index)} searchable entries.')

if __name__=='__main__':main()
