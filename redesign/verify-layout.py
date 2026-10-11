"""Source-level layout regressions using the bundled fonts, not browser QA."""
from pathlib import Path
import re
from PIL import ImageFont
from lxml import html
ROOT=Path(__file__).resolve().parents[1]
CSS=(ROOT/'assets/css/editorial.css').read_text()
CSS=re.sub(r'/\*.*?\*/','',CSS,flags=re.S)

def rules(source,width):
    pos=0
    while pos<len(source):
        start=source.find('{',pos)
        if start<0:return
        prelude=source[pos:start].strip()
        depth=1;end=start+1
        while depth:
            if source[end]=='{':depth+=1
            elif source[end]=='}':depth-=1
            end+=1
        body=source[start+1:end-1];pos=end
        if prelude.startswith('@media'):
            limits=re.findall(r'(max|min)-width:\s*(\d+)px',prelude)
            if limits and all(width<=int(n) if kind=='max' else width>=int(n) for kind,n in limits):
                yield from rules(body,width)
        elif not prelude.startswith('@'):
            yield [x.strip() for x in prelude.split(',')],dict(re.findall(r'([\w-]+)\s*:\s*([^;]+)',body))

def style(selectors,width):
    out={}
    for group,props in rules(CSS,width):
        if any(s in group for s in selectors):out.update(props)
    return out

def length(expr,width):
    expr=expr.strip()
    if expr.startswith('clamp('):
        lo,val,hi=[length(x,width) for x in expr[6:-1].split(',')]
        return max(lo,min(val,hi))
    if expr.endswith('vw'):return float(expr[:-2])*width/100
    if expr.endswith('px'):return float(expr[:-2])
    return float(expr)

def text_width(text,size,spacing):
    # Large font measurement avoids rounding tiny fractional viewport sizes.
    font=ImageFont.truetype(str(ROOT/'assets/fonts/display.ttf'),1024)
    return font.getlength(text)*size/1024+max(0,len(text)-1)*spacing

widths=[320,360,390,480,650,760,768,820,1024,1025,1200,1440,1920]
checks=0
for width in widths:
    gutter=20 if width<=380 else max(24,min(width*.05,90))
    shell=min(width,1680)-2*gutter
    hero_width=shell if width<=1024 else shell-285-64
    community_width=shell if width<=760 else (shell-(32 if width<=1024 else 50))*1.4/2.4
    world_width=shell if width<=760 else (shell-(30 if width<=1200 else 48))*.37
    for lang in ['sk','cz']:
        tree=html.parse(str(ROOT/lang/'index.html'))
        for ident,selectors,budget in [
            ('hero-title',['.cinema h1'],hero_width),
            ('discover-title',['h2','.world-copy h2'],world_width),
            ('case-title',['h2','.section-heading h2','.casefile h2'],shell),
            ('community',['h2','.community h2'],community_width),
        ]:
            node=tree.xpath('//*[@id="'+ident+'"]')[0] if ident!='community' else tree.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," community-heading ")]/h2')[0]
            props=style(selectors,width);size=length(props['font-size'],width)
            spacing=float(props.get('letter-spacing','0').removesuffix('em'))*size
            pieces=re.split(r'<br\s*/?>',html.tostring(node,encoding='unicode'))
            for piece in pieces:
                text=html.fromstring('<div>'+piece+'</div>').text_content().strip().upper()
                measured=text_width(text,size,spacing)
                assert measured<=budget+1,f'{lang} {ident} at {width}px: text {measured:.1f}px exceeds {budget:.1f}px'
                checks+=1
    menu=style(['.primary-nav'],width)
    button=style(['.menu-button'],width)
    assert (menu.get('display')=='none') == (width<=1024)
    assert (button.get('display')=='block') == (width<=1024)
    # Every header control must fit beside the unshrinking logo on mobile/tablet.
    if width<=1024:
        logo=length(style(['.wordmark .brand-logo'],width)['width'],width)
        search=length(style(['.search-launch'],width)['width'],width)
        menu_size=length(button['width'],width)
        languages=2*length(style(['.languages a'],width)['min-width'],width)+length(style(['.languages'],width)['gap'],width)
        tools=search+menu_size+languages+2*length(style(['.nav-tools'],width)['gap'],width)
        gap=length(style(['.masthead'],width)['gap'],width)
        assert logo+tools+gap<=width-2*gutter,f'Header overflow at {width}px'
fontface=re.findall(r'@font-face\{([^}]+)\}',CSS)
assert any('font-family:Text;' in f and 'font-weight:400;' in f for f in fontface)
for page in [ROOT/'index.html',*(ROOT/'sk').rglob('*.html'),*(ROOT/'cz').rglob('*.html')]:
    source=page.read_text()
    assert source.index('id="vc-first-paint"')<source.index('rel="stylesheet"'),page
print(f'Passed {checks} real-font heading width checks at {len(widths)} viewport widths; header budgets, breakpoints, static font weight and dark first paint. Source checks only.')
