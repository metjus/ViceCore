// Clock boundary and lifecycle checks; uses controlled time, never waits in real time.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('assets/js/countdown.js','utf8');
const release=JSON.parse(fs.readFileSync('redesign/release.json','utf8'));
const target=Date.parse(release.countdown_target);
function setup({lang='sk',reduced=false,now=target-90061000,exists=true}={}){
 let clock=now,next,animations=0;
 const nodes=Object.fromEntries(['days','hours','minutes','seconds'].map(key=>[`[data-countdown-unit="${key}"]`,{textContent:'—',animate(){animations++}}]));
 for(const part of ['digits','released','title','note'])nodes[`[data-countdown-${part}]`]={hidden:part==='released',textContent:''};
 const root={dataset:{target:release.countdown_target,state:'waiting'},querySelector:s=>nodes[s]};
 const document={body:{dataset:{lang}},hidden:false,querySelector:()=>exists?root:null,addEventListener:(event,fn)=>{document[event]=fn}};
 class Clock extends Date{static now(){return clock}}
 const context={document,Date:Clock,matchMedia:()=>({matches:reduced}),setTimeout:fn=>{next=fn;return 1},clearTimeout:()=>{next=undefined}};
 vm.runInNewContext(source,context);
 return {root,nodes,document,step(value){clock=value;const fn=next;next=undefined;fn?.()},get scheduled(){return !!next},get animations(){return animations}};
}
for(const lang of ['sk','cz']){
 const c=setup({lang});
 assert.deepEqual(['days','hours','minutes','seconds'].map(k=>c.nodes[`[data-countdown-unit="${k}"]`].textContent),['01','01','01','01']);
 assert.equal(c.animations,0);
 c.step(target-90060000);assert.equal(c.nodes['[data-countdown-unit="seconds"]'].textContent,'00');assert.equal(c.animations,1);
 c.document.hidden=true;c.document.visibilitychange();assert.equal(c.scheduled,false);
 c.step(target-500);c.document.hidden=false;c.document.visibilitychange();assert.equal(c.nodes['[data-countdown-unit="seconds"]'].textContent,'01');
 c.step(target);assert.equal(c.root.dataset.state,'released');assert.equal(c.nodes['[data-countdown-digits]'].hidden,true);assert.equal(c.nodes['[data-countdown-released]'].hidden,false);assert.equal(c.scheduled,false);
 assert.match(c.nodes['[data-countdown-note]'].textContent,lang==='cz'?/Prozkoumej/:/Preskúmaj/);
 const quiet=setup({lang,reduced:true});quiet.step(target-90060000);assert.equal(quiet.animations,0);
 const past=setup({lang,now:target+86400000});assert.equal(past.root.dataset.state,'released');assert.equal(past.scheduled,false);
 console.log(`Passed ${lang}: time units, changed-number animation, reduced motion, tab pause/resume, release boundary and expired clock.`);
}
assert.equal(setup({exists:false}).scheduled,false);
