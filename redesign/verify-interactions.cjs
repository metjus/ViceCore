// DOM contract checks without pretending to be a rendered browser test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.hidden=false;this.attrs={};this.handlers={};this.style={};this.children=[];this.value='';this.open=false;this.offsetHeight=900;this.classList={toggle:()=>{},add:()=>{}};}
 addEventListener(n,f){(this.handlers[n]??=[]).push(f)}
 emit(n,e={}){for(const f of this.handlers[n]||[])f(e)}
 setAttribute(n,v){this.attrs[n]=v}focus(){this.focused=true}scrollIntoView(){}contains(){return false}
 replaceChildren(...v){this.children=v}append(...v){this.children.push(...v)}
 getBoundingClientRect(){return {top:100,left:20,right:600,bottom:1500}}showModal(){this.open=true}close(){this.open=false}
}
const source=fs.readFileSync('assets/js/editorial.js','utf8');
const index=fs.readFileSync('assets/js/search-index.js','utf8');
for(const lang of ['sk','cz'])for(const width of [360,820,1440]){
 const selectors=['.categories','.masthead','#mobile-menu','.menu-button','.world-progress','.world-story','.cinema','.hero-image','.reading-progress','#search-dialog','#search-input','#search-results','#search-close'];
 const nodes=Object.fromEntries(selectors.map(s=>[s,new Element()]));nodes['#mobile-menu'].hidden=true;
 const tabs=Array.from({length:5},()=>new Element()),panels=Array.from({length:5},()=>new Element()),launch=new Element();
 const doc=new Element();doc.body={dataset:{lang}};doc.documentElement=new Element();doc.documentElement.scrollHeight=3500;
 doc.querySelector=s=>nodes[s];doc.querySelectorAll=s=>s==='.category'?tabs:s==='.dossier'?panels:s==='.search-launch'?[launch]:[];doc.createElement=()=>new Element();
 const media={};
 const context={document:doc,window:{},matchMedia:q=>media[q]??=(Object.assign(new Element(),{matches:q.includes('reduce')||width<=Number(q.match(/max-width: (\d+)/)?.[1]||0)})),addEventListener:()=>{},requestAnimationFrame:f=>f(),scrollY:0,innerHeight:900,console};
 vm.createContext(context);vm.runInContext(index,context);vm.runInContext(source,context);
 nodes['.menu-button'].emit('click');assert.equal(nodes['#mobile-menu'].hidden,false);assert.equal(nodes['.menu-button'].attrs['aria-expanded'],'true');
 doc.emit('keydown',{key:'Escape'});assert.equal(nodes['#mobile-menu'].hidden,true);assert.ok(nodes['.menu-button'].focused);
 assert.equal(nodes['.categories'].attrs['aria-orientation'],width<=760?'horizontal':'vertical');
 nodes['.menu-button'].emit('click');const navMedia=media['(max-width: 1024px)'];assert.ok(navMedia);navMedia.matches=!navMedia.matches;navMedia.emit('change');assert.equal(nodes['#mobile-menu'].hidden,true);
 const tabMedia=media['(max-width: 760px)'];tabMedia.matches=!tabMedia.matches;tabMedia.emit('change');assert.equal(nodes['.categories'].attrs['aria-orientation'],width<=760?'vertical':'horizontal');
 tabs[3].emit('click');assert.equal(tabs[3].attrs['aria-selected'],'true');assert.equal(panels[3].hidden,false);assert.equal(panels[0].hidden,true);
 tabs[3].emit('keydown',{key:'End',preventDefault(){}});assert.equal(tabs[4].attrs['aria-selected'],'true');assert.ok(tabs[4].focused);
 launch.emit('click');assert.ok(nodes['#search-dialog'].open);assert.equal(nodes['#search-results'].children.length,8);
 nodes['#search-input'].value='Lúcia';nodes['#search-input'].emit('input');assert.ok(nodes['#search-results'].children.some(n=>n.href.includes('lucia')));
 assert.ok(nodes['#search-results'].children.every(n=>n.href.startsWith('/'+lang+'/')));
 nodes['#search-input'].value='zzzzunlikely';nodes['#search-input'].emit('input');assert.equal(nodes['#search-results'].children[0].className,'search-empty');
 nodes['#search-close'].emit('click');assert.equal(nodes['#search-dialog'].open,false);
 doc.emit('keydown',{key:'k',ctrlKey:true,preventDefault(){}});assert.ok(nodes['#search-dialog'].open);
 console.log('Passed '+lang+' at '+width+'px: menu/Escape, tabs/keyboard, localized search/diacritics/empty result, dialog controls and shortcut.');
}
