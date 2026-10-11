/* ViceCore homepage. Native scrolling, no animation dependencies. */
(() => {
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 1024px)');
const compactTabs=matchMedia('(max-width: 760px)');
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const lang=document.body.dataset.lang||'sk';
const header=$('.masthead'),menu=$('#mobile-menu'),menuButton=$('.menu-button');
const closeMenu=(restoreFocus=false)=>{const wasOpen=!menu.hidden;menu.hidden=true;menuButton.setAttribute('aria-expanded','false');if(restoreFocus&&wasOpen)menuButton.focus();};
menuButton.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuButton.setAttribute('aria-expanded',String(!menu.hidden));});
menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu();});
mobile.addEventListener('change',()=>{closeMenu();queueFrame();});
const reveal=()=>{
 const nodes=$$('[data-reveal]');
 if(reduced.matches||!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('revealed'));return;}
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}}),{threshold:.08});
 nodes.forEach(n=>observer.observe(n));document.documentElement.classList.add('motion-ready');
};reveal();
const tabs=$$('.category'),panels=$$('.dossier');let active=0;
const tablist=$('.categories');
const orientTabs=()=>{if(tablist)tablist.setAttribute('aria-orientation',compactTabs.matches?'horizontal':'vertical');};
compactTabs.addEventListener('change',orientTabs);orientTabs();
const activate=(n,focus=false)=>{
 if(n===active&&!focus)return;active=n;
 tabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;b.classList.toggle('active',i===n);});
 panels.forEach((p,i)=>{p.hidden=i!==n;p.classList.toggle('active',i===n);});
 $('.world-progress').textContent=`0${n+1} / 05`;
 if(focus)tabs[n].focus();
};
tabs.forEach((b,i)=>{b.addEventListener('click',()=>{activate(i);});b.addEventListener('keydown',e=>{
 const direction=['ArrowDown','ArrowRight'].includes(e.key)?1:['ArrowUp','ArrowLeft'].includes(e.key)?-1:0;
 if(direction||e.key==='Home'||e.key==='End'){e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?4:(active+direction+5)%5;activate(n,true);tabs[n].scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});}
 });});
const progress=$('.reading-progress');
let ticking=false;
function paint(){
 ticking=false;const y=scrollY;header.classList.toggle('scrolled',y>35);
 const max=document.documentElement.scrollHeight-innerHeight;
 progress.style.transform=`scaleX(${max>0?y/max:0})`;

}
function queueFrame(){if(!ticking){ticking=true;requestAnimationFrame(paint);}}
addEventListener('scroll',queueFrame,{passive:true});addEventListener('resize',queueFrame,{passive:true});reduced.addEventListener('change',()=>{reveal();queueFrame();});paint();
// Native dialog supplies focus containment, Escape handling and focus restoration.
const dialog=$('#search-dialog'),input=$('#search-input'),results=$('#search-results');
const normalize=s=>(s||'').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const docs=(window.VICECORE_INDEX||[]).filter(d=>d.lang===lang);
function render(){const q=normalize(input.value.trim());const found=docs.map(d=>({...d,score:normalize(d.title).includes(q)?5:normalize(d.excerpt).includes(q)?2:0})).filter(d=>!q||d.score).sort((a,b)=>b.score-a.score).slice(0,8);results.replaceChildren();
 if(!found.length){const p=document.createElement('p');p.className='search-empty';p.textContent=lang==='cz'?'Nic jsme nenašli. Zkus jiné slovo.':'Nič sme nenašli. Skús iné slovo.';results.append(p);return;}
 found.forEach(d=>{const a=document.createElement('a');a.className='search-result';a.href='/'+d.url;const k=document.createElement('span');k.textContent=d.kind==='database'?(lang==='cz'?'Databáze':'Databáza'):d.kind==='theories'?(lang==='cz'?'Teorie':'Teórie'):'Novinky';const holder=document.createElement('span'),title=document.createElement('strong'),small=document.createElement('small'),arrow=document.createElement('span');title.textContent=d.title;small.textContent=d.excerpt;arrow.textContent='↗';holder.append(title,small);a.append(k,holder,arrow);results.append(a);});}
function openSearch(){closeMenu();input.value='';render();dialog.showModal();input.focus();}
$$('.search-launch').forEach(b=>b.addEventListener('click',openSearch));$('#search-close').addEventListener('click',()=>dialog.close());input.addEventListener('input',render);
dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();dialog.open?dialog.close():openSearch();}if(e.key==='Escape')closeMenu(true);});
})();
