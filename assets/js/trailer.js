(() => {
  const panels = [...document.querySelectorAll('.shot-panel')];
  if (!panels.length) return;
  const links = [...document.querySelectorAll('.shot-link')];
  const video = document.getElementById('trailer-video');
  const cover = document.getElementById('video-cover');
  const stop = document.getElementById('video-stop');
  const status = document.getElementById('video-status');
  const fallback = document.getElementById('youtube-fallback');
  const prev = document.getElementById('shot-prev'), next = document.getElementById('shot-next');
  const cs = document.body.dataset.lang === 'cz';
  const tr = (sk, cz) => cs ? cz : sk;
  let selected = 0, pending = null, connected = false;
  function select(index) {
    selected = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => { panel.hidden = i !== selected; });
    links.forEach((link, i) => { if (i === selected) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current'); });
    prev.disabled = selected === 0;
    next.disabled = selected === panels.length - 1;
    document.getElementById('shot-position').textContent = `${String(selected + 1).padStart(2, '0')} / ${String(panels.length).padStart(2, '0')}`;
  }
  function resume() {
    if (pending === null || video.readyState < 1) return;
    video.currentTime = pending; pending = null;
    const attempt = video.play();
    if (attempt && attempt.catch) attempt.catch(() => { status.textContent = tr('Spusti prehrávanie tlačidlom vo videu.', 'Spusť přehrávání tlačítkem ve videu.'); });
  }
  function play(second) {
    pending = second;
    fallback.href = `https://www.youtube.com/watch?v=QdBZY2fkU-0&t=${second}s`;
    cover.hidden = true; stop.hidden = false;
    status.textContent = tr('Načítava sa oficiálne video…', 'Načítá se oficiální video…');
    if (!connected) { connected = true; video.src = video.dataset.src; video.load(); }
    resume();
  }
  links.forEach((link, i) => link.addEventListener('click', event => { event.preventDefault(); select(i); }));
  prev.addEventListener('click', () => select(selected - 1));
  next.addEventListener('click', () => select(selected + 1));
  document.getElementById('video-start').addEventListener('click', () => play(0));
  document.querySelectorAll('.play-moment').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); play(Number(link.dataset.seek));
    video.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  }));
  video.addEventListener('loadedmetadata', resume);
  video.addEventListener('playing', () => { status.textContent = ''; });
  video.addEventListener('error', () => { pending = null; status.textContent = tr('Video sa nepodarilo načítať. Otvor vybraný moment cez odkaz YouTube.', 'Video se nepodařilo načíst. Otevři vybraný moment přes odkaz YouTube.'); });
  stop.addEventListener('click', () => {
    pending = null; connected = false; video.pause(); video.removeAttribute('src'); video.load();
    cover.hidden = false; stop.hidden = true; status.textContent = '';
  });
  document.body.classList.add('screening-ready');
  const hashIndex = panels.findIndex(panel => `#${panel.id}` === location.hash);
  select(hashIndex < 0 ? 0 : hashIndex);
})();
