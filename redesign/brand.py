"""Original angular VC monogram and font-independent outlined wordmarks."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.varLib.instancer import instantiateVariableFont
R=Path(__file__).resolve().parents[1];out=R/'assets/brand';out.mkdir(exist_ok=True)
coral='#ff916f';sand='#f6ead4';ink='#0b181b'
v='M4 8H24L44 65L64 8H84L53 88H35Z'
c='M126 8H90L69 30L53 69L67 88H108L117 70H82L74 62L84 34L94 26H120Z'
font=TTFont(R/'assets/fonts/display.ttf');glyphs=font.getGlyphSet();cmap=font.getBestCmap()
def text_paths(text,x,y,size,colors):
 scale=size/font['head'].unitsPerEm;parts=[]
 for i,char in enumerate(text):
  glyph=cmap[ord(char)];pen=SVGPathPen(glyphs);glyphs[glyph].draw(pen);color=colors(i)
  parts.append(f'<path fill="{color}" transform="translate({x:.3f} {y}) scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}"/>')
  x+=(font['hmtx'][glyph][0]+12)*scale
 return ''.join(parts),x
for mode in ['dark','light','mono']:
 primary=coral if mode!='mono' else sand
 secondary=sand if mode!='light' else ink
 if mode=='mono':secondary=sand
 mark=f'<path fill="{primary}" d="{v}"/><path fill="{secondary}" d="{c}"/>'
 text,end=text_paths('VICECORE',155,77,88,lambda i:primary if i<4 else secondary)
 logo=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {end+5:.3f} 96" role="img" aria-labelledby="title"><title id="title">ViceCore</title>{mark}{text}</svg>'
 (out/f'vicecore-logo-{mode}.svg').write_text(logo)
 (out/f'vicecore-mark-{mode}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 96" role="img" aria-labelledby="title"><title id="title">ViceCore VC</title>{mark}</svg>')
favicon=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="25" fill="{ink}"/><g transform="translate(5 21) scale(.9)"><path fill="{coral}" d="{v}"/><path fill="{sand}" d="{c}"/></g></svg>'
(R/'assets/favicon.svg').write_text(favicon)
maskable=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="{ink}"/><g transform="translate(22 34) scale(.64)"><path fill="{coral}" d="{v}"/><path fill="{sand}" d="{c}"/></g></svg>'
(out/'vicecore-maskable.svg').write_text(maskable)
# SVG presentation sheet is rendered with Inkscape; vector sources remain canonical.
logo=(out/'vicecore-logo-dark.svg').read_text();light=(out/'vicecore-logo-light.svg').read_text()
def embed(svg,x,y,w,h):return svg.replace('<svg ',f'<svg x="{x}" y="{y}" width="{w}" height="{h}" ',1)
board=f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900"><rect width="1440" height="900" fill="{ink}"/><text x="72" y="68" font-family="sans-serif" font-size="13" letter-spacing="3" fill="#a6b7b4">VICECORE / BRAND IDENTITY</text><line x1="72" y1="95" x2="1368" y2="95" stroke="#294044"/>{embed(logo,140,195,1150,240)}<line x1="72" y1="530" x2="1368" y2="530" stroke="#294044"/><rect x="72" y="580" width="820" height="245" rx="2" fill="{sand}"/>{embed(light,127,655,710,100)}{embed(favicon,998,594,150,150)}<text x="1000" y="785" font-family="sans-serif" font-size="12" letter-spacing="2" fill="#a6b7b4">VC / ICON</text><rect x="1270" y="585" width="48" height="48" fill="{coral}"/><rect x="1270" y="648" width="48" height="48" fill="{sand}"/><rect x="1270" y="711" width="48" height="48" fill="#78c8b6"/></svg>'
(out/'vicecore-brand-preview.svg').write_text(board)
print('Created outlined dark/light/mono lockups, transparent VC marks, favicon and vector preview.')
