/* Shared local storage for bilingual bookmarks and personal choices. */
(() => {
 'use strict';
 const memory=new Map();
 window.VICECORE_STORE={
  get(key,fallback){if(memory.has(key))return memory.get(key)??fallback;try{const raw=localStorage.getItem(key);if(raw===null)return fallback;return JSON.parse(raw)??fallback;}catch{return fallback;}},
  set(key,value){memory.set(key,value);try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 };
 addEventListener('storage',event=>{if(event.key)memory.delete(event.key);else memory.clear();});
 const store=window.VICECORE_STORE;
 const buttons=Array.from(document.querySelectorAll('[data-save-id]'));
 const cz=document.body.dataset.lang==='cz',key='vicecore-bookmarks-v1';
 const docs=(window.VICECORE_INDEX||[]).filter(d=>d.lang===(cz?'cz':'sk'));
 function label(id){const doc=docs.find(d=>d.kind+':'+d.slug===id);return doc?.category==='location'?(cz?'Uložit místo':'Uložiť miesto'):doc?.category==='character'?(cz?'Uložit profil':'Uložiť profil'):id.startsWith('news:')?(cz?'Uložit článek':'Uložiť článok'):(cz?'Uložit téma':'Uložiť tému');}
 const read=()=>{const value=store.get(key,[]);return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];};
 function update(){const saved=read();buttons.forEach(b=>{const yes=saved.includes(b.dataset.saveId),doc=docs.find(d=>d.kind+':'+d.slug===b.dataset.saveId),action=yes?(cz?'Zrušit uložení':'Zrušiť uloženie'):label(b.dataset.saveId);b.setAttribute('aria-pressed',String(yes));b.setAttribute('aria-label',action+(doc?': '+doc.title:''));b.title=action;b.querySelector('.save-label').textContent=yes?(cz?'Uloženo':'Uložené'):action;b.querySelector('span').textContent=yes?'✓':'＋';});}
 window.VICECORE_REFRESH_SAVES=update;
 let timer;
 function message(s){let out=document.querySelector('.save-feedback');if(!out){out=document.createElement('div');out.className='save-feedback';out.setAttribute('role','status');document.body.append(out);}out.textContent=s;out.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{out.hidden=true;},2600);}
 window.VICECORE_NOTIFY=message;
 buttons.forEach(b=>b.addEventListener('click',()=>{const current=read(),id=b.dataset.saveId,remove=current.includes(id);const next=remove?current.filter(x=>x!==id):[...current,id];const persistent=store.set(key,next);update();message(!persistent?(cz?'Uloženo pro tuto návštěvu. Prohlížeč blokuje trvalé ukládání.':'Uložené pre túto návštevu. Prehliadač blokuje trvalé ukladanie.'):remove?(cz?'Odebráno z knihovny.':'Odstránené z knižnice.'):(cz?'Přidáno do tvého seznamu v sekci Moje témata.':'Pridané do tvojho zoznamu v sekcii Moje témy.'));}));
 addEventListener('storage',update);update();
})();
