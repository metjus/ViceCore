// Real user flows through the portable library, with simulated local files and downloads.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(){this.listeners={};this.disabled=false;this.files=[];this.value='';this.textContent='';this.hidden=true}
 addEventListener(k,f){this.listeners[k]=f}emit(k){return this.listeners[k]?.()}click(){return this.emit('click')}remove(){}
}
const index=fs.readFileSync('assets/js/search-index.js','utf8'),script=fs.readFileSync('assets/js/library.js','utf8');
(async()=>{
 for(const lang of ['sk','cz'])for(const persistent of [true,false]){
  let ids=['database:lucia'],download,refresh=0,allowClear=false;
  const nodes=Object.fromEntries(['#library-export','#library-import','#library-clear','#library-file','#library-status','[data-library-tools]'].map(k=>[k,new Element()]));
  const ctx={document:{body:{dataset:{lang},append(){}},querySelector:s=>nodes[s],createElement:()=>new Element()},window:{VICECORE_STORE:{get:()=>ids,set(k,v){ids=v;return persistent}},VICECORE_RENDER_SAVED(){refresh++},VICECORE_REFRESH_SAVES(){}},URL:{createObjectURL(blob){download=JSON.parse(blob.parts[0]);return 'blob:test'},revokeObjectURL(){}},Blob:class{constructor(parts){this.parts=parts}},confirm:()=>allowClear,setTimeout(){},addEventListener(){}};
  vm.createContext(ctx);vm.runInContext(index,ctx);vm.runInContext(script,ctx);
  assert.equal(nodes['[data-library-tools]'].hidden,false);nodes['#library-export'].click();assert.equal(download.app,'vicecore');assert.deepEqual(download.bookmarks,['database:lucia']);
  async function importFile(data,size=100){nodes['#library-file'].files=[{size,async text(){return data}}];return nodes['#library-file'].emit('change')}
  const backup=JSON.stringify({app:'vicecore',version:1,bookmarks:['database:jason','database:jason','database:future-unknown']});
  await importFile(backup);assert.deepEqual(Array.from(ids),['database:lucia','database:jason']);assert.equal(refresh,1);
  if(!persistent)assert.match(nodes['#library-status'].textContent,lang==='cz'?/návštěvu/:/návštevu/);
  for(const bad of ['{bad',JSON.stringify({app:'other',version:1,bookmarks:['database:vice-city']}),JSON.stringify({app:'vicecore',version:2,bookmarks:['database:vice-city']}),JSON.stringify({app:'vicecore',version:1,bookmarks:[null]})]){
   await importFile(bad);assert.deepEqual(Array.from(ids),['database:lucia','database:jason']);
  }
  await importFile(backup,100001);assert.deepEqual(Array.from(ids),['database:lucia','database:jason']);
  await importFile(JSON.stringify({app:'vicecore',version:1,bookmarks:['database:unknown']}));assert.deepEqual(Array.from(ids),['database:lucia','database:jason']);
  nodes['#library-clear'].click();assert.equal(ids.length,2);allowClear=true;nodes['#library-clear'].click();assert.equal(ids.length,0);assert.equal(nodes['#library-export'].disabled,true);
  console.log(`Passed ${lang}, persistent=${persistent}: download, deduplicated merge, invalid/oversized/unknown backups preserve data, blocked storage and cancel/confirm removal.`);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
