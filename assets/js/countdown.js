/* Counts to the advertised release day in Bratislava, not an announced launch hour. */
(() => {
 'use strict';
 const root=document.querySelector('[data-countdown]');
 if(!root)return;
 const target=Date.parse(root.dataset.target);
 if(!Number.isFinite(target))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const cz=document.body.dataset.lang==='cz';
 const keys=['days','hours','minutes','seconds'];
 const values=keys.map(key=>root.querySelector(`[data-countdown-unit="${key}"]`));
 let timer;
 function paint(){
  const remaining=Math.max(0,Math.ceil((target-Date.now())/1000));
  if(!remaining){
   root.dataset.state='released';
   root.querySelector('[data-countdown-digits]').hidden=true;
   root.querySelector('[data-countdown-released]').hidden=false;
   root.querySelector('[data-countdown-title]').textContent=cz?'VÍTEJ V LEONIDĚ':'VITAJ V LEONIDE';
   root.querySelector('[data-countdown-note]').textContent=cz?'Prozkoumej postavy a místa v databázi.':'Preskúmaj postavy a miesta v databáze.';
   return false;
  }
  const parts=[Math.floor(remaining/86400),Math.floor(remaining/3600)%24,Math.floor(remaining/60)%60,remaining%60];
  values.forEach((node,i)=>{
   const next=String(parts[i]).padStart(2,'0');
   if(node.textContent===next)return;
   const animate=node.textContent!=='—'&&!reduced.matches&&typeof node.animate==='function';
   node.textContent=next;
   if(animate)node.animate([{transform:'translateY(35%)',opacity:0},{transform:'translateY(0)',opacity:1}],{duration:420,easing:'cubic-bezier(.22,1,.36,1)'});
  });
  return true;
 }
 function resume(){
  clearTimeout(timer);
  if(document.hidden)return;
  if(paint())timer=setTimeout(resume,1000-Date.now()%1000);
 }
 document.addEventListener('visibilitychange',resume);
 resume();
})();
