/* ViceCore — lightweight progressive enhancements; no cookies or analytics. */
(() => {
  'use strict';
  const body = document.body;
  const lang = body.dataset.lang || 'sk';
  const root = body.dataset.root || '';
  const t = lang === 'cz'
    ? {search:'Hledat na ViceCore…',empty:'Nic jsme nenašli. Zkus jiné slovo.',result:'Zobrazeno',save:'Uložit článek',saved:'Uloženo',share:'Zkopírovat odkaz',copied:'Odkaz zkopírován',savedMessage:'Článek uložený v tomto prohlížeči',removedMessage:'Článek odebraný z uložených',poll:'Volba je uložená pouze v tomto prohlížeči.',reset:'Změnit volbu',nothing:'Zatím nemáš uložené žádné články.',unknown:'Odkaz nelze zkopírovat automaticky.'}
    : {search:'Hľadať na ViceCore…',empty:'Nič sme nenašli. Skús iné slovo.',result:'Zobrazené',save:'Uložiť článok',saved:'Uložené',share:'Skopírovať odkaz',copied:'Odkaz skopírovaný',savedMessage:'Článok uložený v tomto prehliadači',removedMessage:'Článok odstránený z uložených',poll:'Voľba je uložená iba v tomto prehliadači.',reset:'Zmeniť voľbu',nothing:'Zatiaľ nemáš uložené žiadne články.',unknown:'Odkaz sa nepodarilo automaticky skopírovať.'};

  const $$ = (s, e = document) => Array.from(e.querySelectorAll(s));
  const $ = (s, e = document) => e.querySelector(s);
  const inMemoryStore = new Map(); // Safe fallback for file:// or private mode storage restrictions.
  const store = {
    get(key, fallback){
      try {const raw = localStorage.getItem(key); return raw === null ? (inMemoryStore.get(key) ?? fallback) : (JSON.parse(raw) ?? fallback);}
      catch {return inMemoryStore.get(key) ?? fallback;}
    },
    set(key, value){inMemoryStore.set(key,value);try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
  };
  const toast = (message) => {
    let node = $('#toast'); if (!node) return;
    node.textContent = message; node.classList.add('show');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('show'), 2600);
  };

  // Accessible desktop mega menu: closes when moving away or pressing Escape.
  document.addEventListener('click', e => {
    document.querySelectorAll('.vc-mega[open]').forEach(panel => {
      if (!panel.contains(e.target)) panel.open = false;
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.vc-mega[open]').forEach(panel => panel.open = false);
  });

  // Interactive dossier tabs: real working navigation and content changes.
  document.querySelectorAll('[data-intel-tabs]').forEach(decks => {
    const buttons = Array.from(decks.querySelectorAll('[role="tab"]'));
    const sections = Array.from(decks.querySelectorAll('[role="tabpanel"]'));
    const activate = (index, focus = false) => {
      buttons.forEach((btn, i) => {
        btn.setAttribute('aria-selected', String(i === index)); btn.tabIndex = i === index ? 0 : -1;
        btn.classList.toggle('active', i === index);
      });
      sections.forEach((panel, i) => {panel.hidden = i !== index; panel.classList.toggle('active',i===index);});
      if (focus) buttons[index].focus();
    };
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => activate(i));
      btn.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length-1 : (i+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;
          activate(next, true);
        }
      });
    });
    activate(0);
  });

  // Mobile menu
  const menuBtn = $('#menu-toggle'); const mobileMenu = $('#mobile-nav');
  const closeMenu = () => {mobileMenu?.classList.remove('open');menuBtn?.setAttribute('aria-expanded','false');body.classList.remove('menu-open');};
  menuBtn?.addEventListener('click', () => {
    const opening = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', opening);
    menuBtn.setAttribute('aria-expanded', String(opening));
    body.classList.toggle('menu-open', opening);
  });
  $$('a', mobileMenu || document.createElement('div')).forEach(el => el.addEventListener('click',closeMenu));

  // Category filters: all relevant cards are present in HTML (SEO + no network required)
  const filterButtons = $$('.filter-btn');
  if (filterButtons.length) {
    const cards = $$('[data-filter-item]');
    const apply = (category) => {
      let count = 0;
      cards.forEach(card => {
        const visible = category === 'all' || card.dataset.category === category;
        card.hidden = !visible; if(visible) count++;
      });
      filterButtons.forEach(btn => {
        const active = btn.dataset.filter === category;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      const output = $('#result-count');
      if (output) output.textContent = `${t.result}: ${count}`;
      $('#filter-empty')?.classList.toggle('visible', count === 0);
    };
    filterButtons.forEach(btn => btn.addEventListener('click', () => apply(btn.dataset.filter)));
    apply('all');
  }

  // Client-side fuzzy-ish search across the complete bilingual index
  const modal = $('#search-modal'); const searchInput = $('#search-input'); const results = $('#search-results');
  const normalized = (str) => (str || '').toLocaleLowerCase('sk').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  const docList = (window.VICECORE_INDEX || []).filter(d => d.lang === lang);
  const kindLabel = {news: lang === 'cz' ? 'Novinky' : 'Novinky', database:lang==='cz'?'Databáze':'Databáza', theories:lang==='cz'?'Teorie':'Teórie'};
  const openSearch = () => {
    closeMenu(); if(!modal)return;
    modal.classList.add('open');modal.setAttribute('aria-hidden','false');body.classList.add('search-open');
    searchInput.value = ''; renderResults('');setTimeout(() => searchInput.focus(),0);
  };
  const closeSearch = () => {if(!modal)return;modal.classList.remove('open');modal.setAttribute('aria-hidden','true');body.classList.remove('search-open');};
  function renderResults(value){
    if(!results)return;
    const needle=normalized(value.trim());
    const matched = needle ? docList.map(doc => {
      const title=normalized(doc.title), description=normalized(doc.excerpt);
      let score= title.includes(needle)?5:0;
      if(description.includes(needle))score+=2;
      if(normalized(doc.category).includes(needle))score++;
      return {...doc,score};
    }).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,9) : docList.slice(0,7);
    results.replaceChildren();
    if(!matched.length){const empty=document.createElement('div');empty.className='search-empty';empty.textContent=t.empty;results.append(empty);return;}
    matched.forEach(doc => {
      const a=document.createElement('a');a.className='search-result';a.href=root+doc.url+'index.html';
      const im=document.createElement('img');im.src=root+'assets/img/'+doc.image;im.alt='';im.loading='lazy';
      const holder=document.createElement('span');const title=document.createElement('b');title.textContent=doc.title;
      const extra=document.createElement('small');extra.textContent=kindLabel[doc.kind]+' · '+doc.excerpt;
      holder.append(title,extra);a.append(im,holder);results.append(a);
    });
  }
  $$('.search-launch').forEach(btn => btn.addEventListener('click',openSearch));
  $('#search-close')?.addEventListener('click',closeSearch);
  modal?.addEventListener('click',(e)=>{if(e.target===modal)closeSearch();});
  searchInput?.addEventListener('input',(e)=>renderResults(e.target.value));
  document.addEventListener('keydown',(e)=>{
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){e.preventDefault();modal?.classList.contains('open')?closeSearch():openSearch();}
    if(e.key==='Escape'){closeSearch();closeMenu();}
  });

  // Local bookmarks. Saved IDs are language-neutral so switch retains bookmarks.
  const storageKey='vicecore-bookmarks-v1';
  const savedIds=()=>store.get(storageKey,[]);
  function updateBookmarks(){
    const saved=savedIds();
    $$('.bookmark-btn').forEach(btn=>{
      const checked=saved.includes(btn.dataset.id);
      btn.setAttribute('aria-pressed',String(checked));
      const text=btn.querySelector('.bookmark-text'); if(text)text.textContent=checked?t.saved:t.save;
    });
    const target=$('#saved-list');if(target){
      target.replaceChildren();
      const found=docList.filter(d=>saved.includes(d.kind+':'+d.slug));
      if(found.length){found.forEach(d=>{const a=document.createElement('a');a.href=root+d.url+'index.html';a.textContent=d.title+' ↗';target.append(a);});}
      else{const p=document.createElement('p');p.className='muted';p.textContent=t.nothing;target.append(p);}
    }
  }
  $$('.bookmark-btn').forEach(btn=>btn.addEventListener('click',()=>{
    const current=savedIds();const id=btn.dataset.id;const idx=current.indexOf(id);
    if(idx>=0){current.splice(idx,1);toast(t.removedMessage);}else{current.push(id);toast(t.savedMessage);}
    store.set(storageKey,current);updateBookmarks();
  }));
  updateBookmarks();

  $('#share-btn')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(location.href);toast(t.copied);}
    catch{toast(t.unknown);}
  });

  // Example poll, explicitly local-only (no misleading community vote counts)
  const pollKey='vicecore-demo-poll-v1';
  const pollOptions=$$('.poll-option');
  function showPoll(){
    const selected=store.get(pollKey,null);
    pollOptions.forEach(btn=>{
      const active=selected===btn.dataset.value;
      btn.classList.toggle('selected',active);btn.setAttribute('aria-pressed',String(active));
    });
    const note=$('#poll-note');if(note && selected)note.textContent=t.poll;
    const reset=$('#poll-reset');if(reset)reset.hidden=!selected;
  }
  pollOptions.forEach(btn=>btn.addEventListener('click',()=>{store.set(pollKey,btn.dataset.value);showPoll();toast(t.poll);}));
  $('#poll-reset')?.addEventListener('click',()=>{store.set(pollKey,null);showPoll();});
  showPoll();

  // Back to top
  const backToTop=$('#back-to-top');
  const handleScroll=()=>backToTop?.classList.toggle('visible',window.scrollY>600);
  window.addEventListener('scroll',handleScroll,{passive:true});handleScroll();
  backToTop?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
})();
