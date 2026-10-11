// Contract tests for combined filters, local reading list and local topic choice.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class El{
 constructor(dataset={}){this.dataset=dataset;this.attrs={};this.handlers={};this.children=[];this.value='';this.hidden=false;}
 addEventListener(k,f){this.handlers[k]=f}emit(k){this.handlers[k]?.()}setAttribute(k,v){this.attrs[k]=v}append(...v){this.children.push(...v)}replaceChildren(){this.children=[]}focus(){this.focused=true}
}
for(const lang of ['sk','cz'])for(const initialQuery of ['', '?q=L%C3%BAcia', '?kategoria=location', '?q=LEONIDA&kategoria=unknown']){
 const data={'vicecore-bookmarks-v1':['news:lucia-a-jason','database:lucia']};let refresh=0;
 const cards=[new El({category:'character',search:'Lucia Caminos'}),new El({category:'location',search:'Vice City'}),new El({category:'location',search:'Leonida'})];
 const filters=[new El({filter:'all'}),new El({filter:'character'}),new El({filter:'location'})];
 const options=[new El({value:'world',target:`/${lang}/databaza/leonida/`}),new El({value:'story',target:`/${lang}/novinky/lucia-a-jason/`})];
 const nodes=Object.fromEntries(['#listing-query','#listing-count','#listing-empty','#listing-reset','#saved-list','#poll-explore','#poll-reset','#poll-note'].map(k=>[k,new El()]));
 const ctx={URLSearchParams,location:{search:initialQuery},window:{VICECORE_STORE:{get(k,f){return data[k]??f},set(k,v){data[k]=v;return true}},VICECORE_REFRESH_SAVES(){refresh++}},document:{body:{dataset:{lang}},querySelector(s){return nodes[s]||null},querySelectorAll(s){return s==='[data-filter-item]'?cards:s==='.filter-btn'?filters:s==='.poll-option'?options:[]},createElement(){return new El()}},addEventListener(){}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/js/search-index.js','utf8'),ctx);vm.runInContext(fs.readFileSync('assets/js/portal.js','utf8'),ctx);
 const initialExpected=initialQuery.includes('L%C3%BAcia')?[false,true,true]:initialQuery.includes('=location')?[true,false,false]:initialQuery.includes('LEONIDA')?[true,true,false]:[false,false,false];
 assert.deepEqual(cards.map(c=>c.hidden),initialExpected);nodes['#listing-reset'].emit('click');filters[1].emit('click');assert.deepEqual(cards.map(c=>c.hidden),[false,true,true]);
 nodes['#listing-query'].value='Vice';nodes['#listing-query'].emit('input');assert.ok(cards.every(c=>c.hidden));assert.equal(nodes['#listing-empty'].hidden,false);
 nodes['#listing-reset'].emit('click');assert.ok(cards.every(c=>!c.hidden));assert.equal(nodes['#listing-query'].value,'');
 nodes['#listing-query'].value='Lúcia';nodes['#listing-query'].emit('input');assert.deepEqual(cards.map(c=>c.hidden),[false,true,true]);
 const saved=nodes['#saved-list'];assert.equal(saved.children.length,2);assert.ok(saved.children.every(r=>r.children[0].href.startsWith('/'+lang+'/')));
 saved.children[0].children[1].emit('click');assert.equal(saved.children.length,1);assert.equal(data['vicecore-bookmarks-v1'].length,1);assert.equal(refresh,1);
 saved.children[0].children[1].emit('click');assert.equal(data['vicecore-bookmarks-v1'].length,0);assert.equal(saved.children[0].className,'saved-empty');assert.equal(saved.children[0].children[1].href,`/${lang}/databaza/`);
 options[1].emit('click');assert.equal(data['vicecore-demo-poll-v1'],'story');assert.equal(nodes['#poll-explore'].href,`/${lang}/novinky/lucia-a-jason/`);assert.equal(nodes['#poll-explore'].hidden,false);
 nodes['#poll-reset'].emit('click');assert.equal(nodes['#poll-explore'].hidden,true);
 console.log('Passed '+lang+' with '+(initialQuery||'no query')+': combined filters, empty/reset/diacritics, bilingual bookmarks/removal, local topic choice/reset.');
}
