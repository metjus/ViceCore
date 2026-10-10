const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('assets/js/home-saves.js','utf8');
for(const cz of [false,true])for(const blocked of [false,true]){
 const events={},data={},out={setAttribute(){},textContent:'',hidden:false};
 const label={},icon={};const b={dataset:{saveId:'news:lucia-a-jason'},attrs:{},setAttribute(k,v){this.attrs[k]=v},querySelector(s){return s==='.save-label'?label:icon},addEventListener(k,fn){events[k]=fn}};
 let toast=null;
 const ctx={window:{},document:{body:{dataset:{lang:cz?'cz':'sk'},append(v){toast=v}},querySelectorAll(){return [b]},querySelector(){return toast},createElement(){return out}},localStorage:{getItem(k){if(blocked)throw Error();return data[k]??null},setItem(k,v){if(blocked)throw Error();data[k]=v}},addEventListener(){},clearTimeout(){},setTimeout(){return 1}};
 vm.createContext(ctx);vm.runInContext(code,ctx);assert.equal(b.attrs['aria-pressed'],'false');
 events.click();assert.equal(b.attrs['aria-pressed'],'true');assert.equal(label.textContent,cz?'Uloženo':'Uložené');
 if(!blocked)assert.deepEqual(JSON.parse(data['vicecore-bookmarks-v1']),['news:lucia-a-jason']);
 events.click();assert.equal(b.attrs['aria-pressed'],'false');
 if(!blocked)assert.deepEqual(JSON.parse(data['vicecore-bookmarks-v1']),[]);
}
console.log('Passed: localized save/remove, shared article IDs and blocked-storage fallback.');
