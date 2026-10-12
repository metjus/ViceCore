# ViceCore

Statický fanúšikovský portál GTA VI v slovenčine a češtine. Beta 01 má 60 HTML stránok vrátane vstupu a 404, databázu, články a rozbor ôsmich záberov Traileru 1. Uložené profily, miesta, články a voľba témy používajú iba lokálne úložisko prehliadača. Homepage je rozcestník databázy s animovaným odpočtom do dňa vydania. Po dosiahnutí dátumu odpočet automaticky vystrieda stav „GTA VI je vonku“. Položka „Mapa mesta“ otvára stránku s informáciou, že mapa bude sprístupnená po vydaní; samotná mapa ešte nie je implementovaná. Knižnica umožňuje zálohu do JSON súboru, bezpečné zlúčenie pri obnovení a vymazanie po potvrdení. Sekcia Beta 01 vysvetľuje rozsah bety a pripraví hlásenie chyby na GitHube; používateľ ho odošle až na GitHube.

Formulár v úvode smeruje do databázy pomocou `?q=`; kategórie používajú `?kategoria=`.

Dizajn používa koralovú, pieskovú a tmavú petrolejovú farbu. Logo je SVG, favicon používa monogram VC a fonty sú uložené lokálne. Úvodný nadpis a desktopový rozcestník sú v spoločnej mriežke; mobilné menu sa používa do 1024 px. Sekcie rastú podľa obsahu a respektujú znížený pohyb. Tmavé pozadie je nastavené priamo v HTML pred načítaním CSS.

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
node redesign/verify-countdown.cjs
node redesign/verify-library.cjs
```

Výstup je v `dist/`. Produkcia nepotrebuje Python ani Node.js. Koreňový `index.html` obsahuje slovenskú homepage priamo, bez presmerovania.

`verify-layout.py` kontroluje šírky nadpisov pomocou skutočných lokálnych fontov, priestor v hlavičke, breakpointy a tmavý prvý záber. Skripty JavaScriptu kontrolujú správanie ovládacích prvkov pomocou DOM modelov. Tieto kontroly nenahrádzajú vizuálnu kontrolu v prehliadači.

## Úpravy

- `redesign/generate.py`: obe homepage.
- `redesign/release.json`: dátum vydania a odpočet do začiatku daného dňa v Bratislave (nejde o potvrdenú hodinu spustenia). Pri zmene termínu ho treba aktualizovať a web znovu publikovať.
- `redesign/portal.py`: spoločné vnútorné stránky.
- `redesign/trailer.py`: rozbor traileru.
- `redesign/finish.py`: spoločné meta údaje, jazykové alternatívy, footer, 404 a sitemap.
- `redesign/content.json`: zachovaný obsah a stručné profily so zdrojmi.
- `assets/css/editorial.css`, `portal.css`, `trailer.css`, `beta.css`: spoločný dizajn a doplnkové rozloženia.
- `assets/js/editorial.js`, `home-saves.js`, `portal.js`, `trailer.js`, `countdown.js`, `library.js`: navigácia, hľadanie, lokálne uloženie a prehrávač.

Oficiálne zábery uvádzajú zdroj Rockstar Games. Ilustračné obrázky sú fan art. Obsah je statický; web zatiaľ nemá redakčný systém ani spoločné používateľské účty. Kanonické URL a sitemap treba pri zmene produkčnej domény aktualizovať.

## Beta 01

Beta je statický portál bez účtov a verejných diskusií. Mapa je zámerne stránka dostupnosti po vydaní. Export knižnice sa vytvára v prehliadači a import iba pridáva rozpoznané témy; poškodený alebo nepodporovaný súbor pôvodné uloženie nemení. Pri zaplnenom úložisku funguje výber počas návštevy.

Pred verejným spustením treba overiť vzhľad a ovládanie na reálnom mobile a počítači. Prejsť úvod, globálne hľadanie, filtrovaný zoznam a návrat späť, prepnutie jazyka, uloženie/odstránenie/zálohu/obnovenie, trailer, 404 a hlásenie chyby. V tomto prostredí boli vykonané zdrojové a DOM kontroly; browser QA nebolo dostupné.
