/* ViceCore premium interactions: native scroll + rAF, IO; no motion library or network dependency. */
(() => {
 'use strict';
 const hero = document.querySelector('[data-scene-gallery]');
 const gallery = document.querySelector('[data-gallery-scroll]');
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer = window.matchMedia('(pointer: fine)');
 const canMove = () => !reduced.matches;
 // Only animate on a device that actually supports it; don't conceal content permanently.
 if (canMove() && 'IntersectionObserver' in window) {
   document.documentElement.classList.add('vc3-motion');
   const children = Array.from(document.querySelectorAll('[data-reveal], [data-vc3-chapter]'));
   const observer = new IntersectionObserver(items => items.forEach(item => {
     if (!item.isIntersecting) return;
     item.target.classList.add('in-view');
     observer.unobserve(item.target);
   }), {rootMargin:'0px 0px -4% 0px',threshold:.055});
   children.forEach(el => observer.observe(el));
 }
 // Animate atmosphere on scrolling. One passive listener, one rAF; no layout reads in the loop.
 let scheduled = false;
 const updateScene = () => {
   scheduled = false;
   if (!hero || !canMove()) return;
   const distance = Math.min(hero.offsetHeight, window.scrollY);
   hero.style.setProperty('--v3-hero-scroll', `${Math.round(distance * .16)}px`);
 };
 if (hero) {
   window.addEventListener('scroll', () => {
     if (!scheduled){ scheduled = true; requestAnimationFrame(updateScene); }
   }, {passive:true});
   updateScene();
 }
 // Hero scene picker. Source paths remain local so file:// previews still work.
 if (hero) {
  const buttons = Array.from(hero.querySelectorAll('[data-scene]'));
  const backdrops = [hero.querySelector('.vc3-backdrop-a'),hero.querySelector('.vc3-backdrop-b')];
  const counter = hero.querySelector('[data-scene-count]');
  let front = 0;
  buttons.forEach(btn => btn.addEventListener('click', () => {
   const idx = Number(btn.dataset.scene);
   if (btn.classList.contains('active')) return;
   buttons.forEach(other => {other.classList.toggle('active',other===btn);other.setAttribute('aria-pressed',String(other===btn));});
   const hidden = 1-front;
   backdrops[hidden].src = btn.dataset.src;
   if (!canMove()){backdrops[front].classList.remove('is-visible');backdrops[hidden].classList.add('is-visible');front=hidden;}
   else {
    // Wait for decoding to prevent blank frames on slower devices.
    backdrops[hidden].decode().catch(()=>{}).then(()=>{backdrops[hidden].classList.add('is-visible');backdrops[front].classList.remove('is-visible');front=hidden;});
   }
   if(counter)counter.textContent=`0${idx+1} / 03`;
  }));
 }
 if (gallery){
  const cards = [...gallery.querySelectorAll('.vc3-gallery-card')];
  const prev = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  const count = document.querySelector('[data-gallery-current]');
  const move = direction => {
    const first = cards[0];if(!first) return;
    const gap = parseFloat(getComputedStyle(gallery).gap)||22;
    const amount = first.getBoundingClientRect().width+gap;
    gallery.scrollBy({left:direction*amount,behavior:canMove()?'smooth':'instant'});
  };
  prev?.addEventListener('click',()=>move(-1));
  next?.addEventListener('click',()=>move(1));
  let updating = false;
  gallery.addEventListener('scroll',()=>{
   if(updating)return;
   updating=true;
   requestAnimationFrame(()=>{
    updating=false;
    const left=gallery.getBoundingClientRect().left;
    let closest=0,dist=Infinity;
    cards.forEach((card,i)=>{const value=Math.abs(card.getBoundingClientRect().left-left);if(value<dist){dist=value;closest=i;}});
    if(count)count.textContent=`0${closest+1}`;
   });
  },{passive:true});
 }
 // Cinematic photo drift tied to scrolling (single animation frame per event).
 if (gallery && canMove()) {
   let queued=false;
   const updatePhotos=()=>{
     queued=false;
     if(!canMove() || innerWidth<780)return;
     const r=gallery.getBoundingClientRect();
     if(r.bottom<0 || r.top>innerHeight)return;
     const progress=Math.max(-1,Math.min(1,(r.top+r.height/2-innerHeight/2)/innerHeight));
     gallery.style.setProperty('--vc3-gallery-pan',`${(-progress*14).toFixed(1)}px`);
   };
   window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updatePhotos);}}, {passive:true});
   updatePhotos();
 }
 // Reveal behavior is enhancement only; print and reduced-motion stay fully readable.
 reduced.addEventListener?.('change', e => {
  if(e.matches){document.documentElement.classList.remove('vc3-motion');hero?.style.removeProperty('--v3-hero-scroll');}
 });
})();
