# Blízko — prvá verzia bazára

Pracovný názov. Slovenský bazár s interným chatom, dobrovoľným telefónnym kontaktom a upozorneniami pri rizikových správach. Projekt sa v repozitári ViceCore nachádza v `marketplace/`; pôvodný GTA web zostáva zachovaný.

## Funkcie

- Hľadanie a filtre podľa kategórie, mesta a ceny; zoraďovanie podľa ceny.
- Profil s prezývkou, mestom a voliteľným telefónom. E-mail sa nezobrazuje.
- Vytvorenie inzerátu s fotografiou, cena, stav a označenie ako predané.
- Serverové záložky a rozhovory medzi kupujúcim a predajcom; správy sa obnovujú každých 5 sekúnd.
- Nahlásenie inzerátu alebo konkrétnej správy, blokovanie komunikácie.
- Textové upozornenia pri externých odkazoch, kuriérskych požiadavkách a údajoch karty. Odkazy v správach nie sú automaticky klikateľné.
- Osem jasne označených ukážkových ponúk a izolovaná ukážka chatu. Žiadne falošné odosielanie ani simulovaní skutoční predajcovia.

## Technológie a dáta

Vinext/React/TypeScript, Cloudflare Workers, D1 databáza (`DB`) a R2 fotografie (`BUCKET`). Migrácie v `drizzle/` sú generované zo schémy `db/schema.ts`. Dáta používateľov nie sú v git repozitári. API autorizuje vlastníctvo inzerátov, účastníkov rozhovoru, súkromné kontakty aj dôkazy v hláseniach na serveri.

V súkromnom Sites náhľade účty použí­vajú platformové prihlásenie cez ChatGPT. Verejné spustenie pre bežných návštevníkov potrebuje samostatne dohodnutý podporovaný spôsob prihlasovania; projekt zatiaľ nie je verejný bazár.

## Vývoj

Použi podporovaný Sites postup pre inštaláciu a zostavenie. Pre standalone prostredie: Node 22.13+, inštalácia podľa `pnpm-lock.yaml`, potom `pnpm build`. Starter obsahuje build integráciu Sites; zachovaj ju.

Kontroly:

```sh
node tests/api.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Testy používajú reálny SQLite s D1 adaptérom a preverujú celý tok profilu → fotografia → inzerát → rozhovor medzi dvoma účtami → správy → hlásenie/blokovanie. Ďalej overujú odmietnutie cudzieho účtu, súkromie telefónu, vlastníctvo obrázkov, uložené ponuky, vstupy a pôvod požiadaviek.

## Rozsah tejto verzie

- Náhľad je owner-private; živý rozhovor dvoch používateľov vyžaduje autorizované testovacie účty/audience.
- Nie je implementovaná platba, doprava, overenie telefónu/totožnosti ani garantovaná ochrana kupujúceho.
- Hlásenia sa ukladajú; moderátorský panel, jeho role a proces vybavovania sú ďalší krok. Automatické upozornenia nezachytia všetky podvody.
- Pred verejným spustením: moderovanie, mazanie účtu a retencia, pravidlá služby a prevádzkovateľ, upload limity a prevádzkové monitorovanie. Predbežné per-user limity sú na serveri.
- Prehľad načíta najviac 200 aktívnych ponúk a rozhovor 500 správ. Pre rozsiahlejší bazár doplniť stránkovanie.
- Browser QA nebolo v aktuálnom prostredí dostupné. Overené sú zostavenie, TypeScript, SSR a serverové integračné testy.
