(() => {
 'use strict';
 const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
 const cz=document.body.dataset.lang==='cz',lang=cz?'cz':'sk';
 const normalize=s=>(s||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const cards=$$('[data-filter-item]'),filters=$$('.filter-btn'),query=$('#listing-query');let category='all';
 if(cards.length){
  const params=new URLSearchParams(location.search);
  const initial=params.get('kategoria');
  if(filters.some(b=>b.dataset.filter===initial))category=initial;
  if(query)query.value=params.get('q')||'';
 }
 function syncUrl(mode){
  const u=new URL(location.href);
  if(query.value.trim())u.searchParams.set('q',query.value.trim());else u.searchParams.delete('q');
  if(category!=='all')u.searchParams.set('kategoria',category);else u.searchParams.delete('kategoria');
  if(u.href!==location.href)history[mode==='push'?'pushState':'replaceState'](null,'',u.pathname+u.search+u.hash);
 }
 function languageLinks(){document.querySelectorAll('.languages a').forEach(a=>{const u=new URL(a.href,location.href);for(const k of ['q','kategoria']){const value=k==='q'?query.value.trim():category==='all'?'':category;if(value)u.searchParams.set(k,value);else u.searchParams.delete(k);}a.href=u.pathname+u.search+u.hash;});}
 function apply(mode){const q=normalize(query?.value.trim());let n=0;cards.forEach(c=>{const yes=(category==='all'||c.dataset.category===category)&&(!q||normalize(c.dataset.search).includes(q));c.hidden=!yes;if(yes)n++;});filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));if($('#listing-count'))$('#listing-count').textContent=`${n} / ${cards.length} ${cz?'témat':'tém'}`;if($('#listing-empty'))$('#listing-empty').hidden=n!==0;if(cards.length){if(mode)syncUrl(mode);languageLinks();}}
 filters.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.filter;apply('push');}));query?.addEventListener('input',()=>apply('replace'));$('#listing-reset')?.addEventListener('click',()=>{category='all';query.value='';apply('push');query.focus();});if(cards.length)apply();
 addEventListener('popstate',()=>{if(!cards.length)return;const params=new URLSearchParams(location.search),value=params.get('kategoria');category=filters.some(b=>b.dataset.filter===value)?value:'all';query.value=params.get('q')||'';apply();});
 const docs=(window.VICECORE_INDEX||[]).filter(d=>d.lang===lang);
 const store=window.VICECORE_STORE;
 const savedKey='vicecore-bookmarks-v1';
 const kindLabel=k=>k==='database'?(cz?'Databáze':'Databáza'):k==='theories'?(cz?'Teorie':'Teórie'):(cz?'Čítárna':'Čítareň');
 function renderSaved(){const host=$('#saved-list');if(!host)return;const ids=store.get(savedKey,[]);const found=Array.isArray(ids)?[...new Set(ids)].reverse().map(id=>docs.find(d=>d.kind+':'+d.slug===id)).filter(Boolean):[];host.replaceChildren();
  if(!found.length){const div=document.createElement('div');div.className='saved-empty';const p=document.createElement('p');p.textContent=cz?'Tvoje knihovna je zatím prázdná. Ulož si profil, místo nebo článek tlačítkem Uložit.':'Tvoja knižnica je zatiaľ prázdna. Ulož si profil, miesto alebo článok tlačidlom Uložiť.';const a=document.createElement('a');a.href='/'+lang+'/databaza/';a.className='button coral';a.textContent=cz?'Prozkoumat databázi ↗':'Preskúmať databázu ↗';div.append(p,a);host.append(div);return;}
  found.forEach(d=>{const row=document.createElement('div');row.className='saved-item';const a=document.createElement('a');a.href='/'+d.url;const k=document.createElement('span');k.textContent=kindLabel(d.kind);const h=document.createElement('strong');h.textContent=d.title;a.append(k,h);const b=document.createElement('button');b.type='button';b.textContent=cz?'Odebrat':'Odstrániť';b.setAttribute('aria-label',(cz?'Odebrat: ':'Odstrániť: ')+d.title);b.addEventListener('click',()=>{const current=store.get(savedKey,[]);store.set(savedKey,Array.isArray(current)?current.filter(id=>id!==d.kind+':'+d.slug):[]);renderSaved();window.VICECORE_REFRESH_SAVES();});row.append(a,b);host.append(row);});}
 window.VICECORE_RENDER_SAVED=renderSaved;renderSaved();addEventListener('storage',renderSaved);
 const pollKey='vicecore-demo-poll-v1',options=$$('.poll-option');
 function renderPoll(){const value=store.get(pollKey,null);options.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.value===value)));const selected=options.find(b=>b.dataset.value===value);const explore=$('#poll-explore'),reset=$('#poll-reset');if(explore){explore.hidden=!selected;if(selected)explore.href=selected.dataset.target;}if(reset)reset.hidden=!selected;}
 options.forEach(b=>b.addEventListener('click',()=>{const persistent=store.set(pollKey,b.dataset.value);renderPoll();if($('#poll-note'))$('#poll-note').textContent=persistent?(cz?'Tvoje volba je uložená pouze v tomto prohlížeči.':'Tvoja voľba je uložená iba v tomto prehliadači.'):(cz?'Volba platí pro tuto návštěvu. Prohlížeč blokuje trvalé ukládání.':'Voľba platí pre túto návštevu. Prehliadač blokuje trvalé ukladanie.');}));$('#poll-reset')?.addEventListener('click',()=>{store.set(pollKey,null);renderPoll();});renderPoll();
 $$('.share-link').forEach(b=>b.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);window.VICECORE_NOTIFY(cz?'Odkaz zkopírován.':'Odkaz skopírovaný.');}catch{window.VICECORE_NOTIFY(cz?'Odkaz můžeš zkopírovat z adresního řádku.':'Odkaz môžeš skopírovať z adresného riadku.');}}));
})();
