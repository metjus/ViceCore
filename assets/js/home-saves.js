/* Shared local storage for bilingual bookmarks and personal choices. */
(() => {
 'use strict';
 const memory=new Map();
 window.VICECORE_STORE={
  get(key,fallback){try{const raw=localStorage.getItem(key);if(raw===null)return memory.has(key)?memory.get(key):fallback;const value=JSON.parse(raw);return value??fallback;}catch{return memory.has(key)?memory.get(key):fallback;}},
  set(key,value){memory.set(key,value);try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
 };
 const store=window.VICECORE_STORE;
 const buttons=Array.from(document.querySelectorAll('[data-save-id]'));
 const cz=document.body.dataset.lang==='cz',key='vicecore-bookmarks-v1';
 const read=()=>{const value=store.get(key,[]);return Array.isArray(value)?value.filter(x=>typeof x==='string'):[];};
 function update(){const saved=read();buttons.forEach(b=>{const yes=saved.includes(b.dataset.saveId);b.setAttribute('aria-pressed',String(yes));b.querySelector('.save-label').textContent=yes?(cz?'Uloženo':'Uložené'):(cz?'Uložit':'Uložiť');b.querySelector('span').textContent=yes?'✓':'＋';});}
 window.VICECORE_REFRESH_SAVES=update;
 let timer;
 function message(s){let out=document.querySelector('.save-feedback');if(!out){out=document.createElement('div');out.className='save-feedback';out.setAttribute('role','status');document.body.append(out);}out.textContent=s;out.hidden=false;clearTimeout(timer);timer=setTimeout(()=>{out.hidden=true;},2600);}
 window.VICECORE_NOTIFY=message;
 buttons.forEach(b=>b.addEventListener('click',()=>{const current=read(),id=b.dataset.saveId,remove=current.includes(id);const next=remove?current.filter(x=>x!==id):[...current,id];const persistent=store.set(key,next);update();message(!persistent?(cz?'Uloženo pro tuto návštěvu. Prohlížeč blokuje trvalé ukládání.':'Uložené pre túto návštevu. Prehliadač blokuje trvalé ukladanie.'):remove?(cz?'Odebráno z uložených článků.':'Odstránené z uložených článkov.'):(cz?'Článek uložený. Najdeš ho v komunitě.':'Článok uložený. Nájdeš ho v komunite.'));}));
 addEventListener('storage',update);update();
})();
