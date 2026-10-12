/* Portable bookmarks: a local file, validated and merged without replacing a library. */
(() => {
 'use strict';
 const button=document.querySelector('#library-export');
 if(!button)return;
 document.querySelector('[data-library-tools]').hidden=false;
 const cs=document.body.dataset.lang==='cz',tr=(sk,cz)=>cs?cz:sk;
 const input=document.querySelector('#library-file'),importButton=document.querySelector('#library-import'),clear=document.querySelector('#library-clear'),status=document.querySelector('#library-status');
 const store=window.VICECORE_STORE,key='vicecore-bookmarks-v1';
 const valid=new Set((window.VICECORE_INDEX||[]).map(d=>d.kind+':'+d.slug));
 const read=()=>{const ids=store.get(key,[]);return Array.isArray(ids)?[...new Set(ids.filter(id=>valid.has(id)))]:[];};
 function notice(text){status.textContent=text;}
 function state(){button.disabled=clear.disabled=!read().length;}
 function changed(){window.VICECORE_RENDER_SAVED?.();window.VICECORE_REFRESH_SAVES?.();state();}
 button.addEventListener('click',()=>{
  const bookmarks=read();if(!bookmarks.length)return;
  const blob=new Blob([JSON.stringify({app:'vicecore',version:1,bookmarks},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vicecore-temy.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  notice(tr('Záloha je pripravená na uloženie. Súbor môžeš obnoviť v druhom prehliadači.','Záloha je připravená k uložení. Soubor můžeš obnovit v druhém prohlížeči.'));
 });
 importButton.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;
  try{
   if(file.size>100000)throw Error('size');
   const data=JSON.parse(await file.text());
   if(data?.app!=='vicecore'||data.version!==1||!Array.isArray(data.bookmarks)||data.bookmarks.length>1000||data.bookmarks.some(id=>typeof id!=='string'))throw Error('format');
   const supported=[...new Set(data.bookmarks.filter(id=>valid.has(id)))];
   if(!supported.length){notice(tr('V zálohe nie sú žiadne podporované témy. Tvoj výber zostal zachovaný.','V záloze nejsou žádná podporovaná témata. Tvůj výběr zůstal zachovaný.'));return;}
   const previous=read(),merged=[...new Set([...previous,...supported])];
   const persistent=store.set(key,merged);changed();
   notice(persistent?tr(`Pridané témy: ${merged.length-previous.length}. Pôvodné uložené zostali zachované.`,`Přidaná témata: ${merged.length-previous.length}. Původní uložená zůstala zachovaná.`):tr('Obnovené pre túto návštevu. Prehliadač blokuje trvalé ukladanie; ponechaj si zálohu.','Obnoveno pro tuto návštěvu. Prohlížeč blokuje trvalé ukládání; ponech si zálohu.'));
  }catch{notice(tr('Súbor sa nepodarilo obnoviť. Vyber zálohu ViceCore do 100 kB. Tvoj výber zostal zachovaný.','Soubor se nepodařilo obnovit. Vyber zálohu ViceCore do 100 kB. Tvůj výběr zůstal zachovaný.'));}
  finally{input.value='';}
 });
 clear.addEventListener('click',()=>{if(!read().length||!confirm(tr('Vymazať všetky uložené témy v tomto prehliadači?','Smazat všechna uložená témata v tomto prohlížeči?')))return;const persistent=store.set(key,[]);changed();notice(persistent?tr('Uložené témy sú vymazané.','Uložená témata jsou smazaná.'):tr('Výber je vymazaný pre túto návštevu. Prehliadač neumožnil zmeniť trvalé úložisko.','Výběr je smazaný pro tuto návštěvu. Prohlížeč neumožnil změnit trvalé úložiště.'));});
 addEventListener('storage',state);state();
})();
