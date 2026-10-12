const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class E{constructor(dataset={}){this.dataset=dataset;this.handlers={};this.attrs={};this.hidden=false;this.readyState=0;this.loads=0;}addEventListener(k,f){this.handlers[k]=f}emit(k){this.handlers[k]?.({preventDefault(){}})}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k];if(k==='src')delete this.src}load(){this.loads++}play(){this.played=true;return Promise.resolve()}pause(){this.paused=true}focus(){this.focused=true}scrollIntoView(){this.scrolled=true}}
for(const lang of ['sk','cz']){
 const shots=[6,16,23,30,40,49,68,76],panels=shots.map(t=>{const e=new E({moment:t});e.id='moment-'+t;return e}),links=shots.map(t=>new E({shot:t})),plays=shots.map(t=>new E({seek:t}));
 const ids=Object.fromEntries(['trailer-video','video-cover','video-stop','video-status','youtube-fallback','shot-prev','shot-next','shot-position','video-start'].map(k=>[k,new E()]));ids['trailer-video'].dataset.src='https://example.test/trailer.mp4';
 const events={};const history={replaceState(_state,_title,hash){ctx.location.hash=hash}};
 const ctx={history,addEventListener(k,f){events[k]=f},document:{body:{dataset:{lang},classList:{add(){}}},querySelectorAll(s){return s==='.shot-panel'?panels:s==='.shot-link'?links:plays},getElementById(k){return ids[k]}},location:{hash:''},matchMedia(){return{matches:true}}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('assets/js/trailer.js','utf8'),ctx);
 const video=ids['trailer-video'];assert.equal(video.src,undefined);assert.equal(video.loads,0);assert.equal(panels.filter(p=>!p.hidden).length,1);assert.equal(ids['shot-prev'].disabled,true);
 links[7].emit('click');assert.equal(video.loads,0);assert.equal(panels[7].hidden,false);assert.equal(ids['shot-next'].disabled,true);assert.equal(ctx.location.hash,'#moment-76');assert.ok(panels[7].focused&&panels[7].scrolled);ids['shot-prev'].emit('click');assert.equal(panels[6].hidden,false);
 ctx.location.hash='#moment-30';events.hashchange();assert.equal(panels[3].hidden,false);
 plays[2].emit('click');plays[5].emit('click');assert.equal(video.loads,1);assert.ok(ids['youtube-fallback'].href.endsWith('49s'));video.readyState=1;video.emit('loadedmetadata');assert.equal(video.currentTime,49);assert.equal(video.played,true);
 video.emit('error');assert.ok(ids['video-status'].textContent.includes('YouTube'));ids['video-stop'].emit('click');assert.equal(video.src,undefined);assert.equal(video.paused,true);assert.equal(ids['video-cover'].hidden,false);
 ids['video-start'].emit('click');assert.equal(video.currentTime,0);assert.equal(video.loads,3);console.log('Passed '+lang+': selection without media requests, boundaries, deferred last seek, playback fallback and disconnect.');
}
