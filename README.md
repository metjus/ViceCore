# ViceCore

Statický fanúšikovský portál GTA VI v slovenčine a češtine. Má 56 HTML stránok vrátane vstupu a 404, databázu, články a rozbor ôsmich záberov Traileru 1. Uložené články a voľba témy používajú iba lokálne úložisko prehliadača.

Dizajn používa koralovú, pieskovú a tmavú petrolejovú farbu. Logo je SVG, favicon používa monogram VC a fonty sú uložené lokálne. Úvodný nadpis a rozcestník sú v spoločnej mriežke; mobilné menu sa používa do 1024 px. Sekcie rastú podľa obsahu a respektujú znížený pohyb. Tmavé pozadie je nastavené priamo v HTML pred načítaním CSS.

## Build a kontrola

```sh
python -m pip install Pillow lxml
python build.py
python redesign/verify.py
python redesign/verify-layout.py
node redesign/verify-interactions.cjs
node redesign/verify-saves.cjs
node redesign/verify-portal.cjs
node redesign/verify-trailer.cjs
```

Výstup je v `dist/`. Produkcia nepotrebuje Python ani Node.js. Koreňový `index.html` obsahuje slovenskú homepage priamo, bez presmerovania.

`verify-layout.py` kontroluje šírky nadpisov pomocou skutočných lokálnych fontov, priestor v hlavičke, breakpointy a tmavý prvý záber. Skripty JavaScriptu kontrolujú správanie ovládacích prvkov pomocou DOM modelov. Tieto kontroly nenahrádzajú vizuálnu kontrolu v prehliadači.

## Úpravy

- `redesign/generate.py`: obe homepage.
- `redesign/portal.py`: spoločné vnútorné stránky.
- `redesign/trailer.py`: rozbor traileru.
- `assets/css/editorial.css`, `portal.css`, `trailer.css`: spoločný dizajn a doplnkové rozloženia.
- `assets/js/editorial.js`, `home-saves.js`, `portal.js`, `trailer.js`: navigácia, hľadanie, lokálne uloženie a prehrávač.

Oficiálne zábery uvádzajú zdroj Rockstar Games. Ilustračné obrázky sú fan art. Obsah je statický; web zatiaľ nemá redakčný systém ani spoločné používateľské účty. Kanonické URL a sitemap treba pri zmene produkčnej domény aktualizovať.
