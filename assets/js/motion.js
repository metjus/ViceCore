/* ViceCore 2026: progressive visual motion. No third-party scripts or tracking. */
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const bar = document.querySelector('.scroll-progress');
  const hero = document.querySelector('.vc-hero-scene');
  const aura = document.querySelector('.cursor-aura');
  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle('is-scrolled', y > 45);
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if (bar) bar.style.transform = `scaleX(${Math.min(1, y / max)})`;
      if (hero && !reduced.matches) hero.style.transform = `translate3d(0, ${Math.min(100, y * .14)}px, 0)`;
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  if (reduced.matches) return;
  document.documentElement.classList.add('has-motion');
  const items = document.querySelectorAll('[data-reveal], .stories-grid > .story-card, .db-grid > .db-card, .theory-grid > .theory-card, .guidelines > .guide-card');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .075, rootMargin: '0px 0px -25px 0px' });
    items.forEach(el => { el.setAttribute('data-reveal',''); observer.observe(el); });
  } else {
    items.forEach(el => el.classList.add('in-view'));
  }

  // Small ambient cursor light. Strictly decorative; links remain standard links.
  if (window.matchMedia('(pointer:fine)').matches && aura) {
    let px = -500, py = -500, tx = -500, ty = -500;
    let active = false;
    document.addEventListener('pointermove', e => {
      tx = e.clientX - 190; ty = e.clientY - 190;
      if (!active) { active = true; aura.style.opacity = '.85'; requestAnimationFrame(frame); }
    }, {passive:true});
    document.addEventListener('pointerleave', () => { aura.style.opacity = '0'; });
    function frame() {
      px += (tx - px) * .16; py += (ty - py) * .16;
      aura.style.transform = `translate3d(${px}px,${py}px,0)`;
      if (Math.abs(tx-px) + Math.abs(ty-py) > .3) requestAnimationFrame(frame);
      else active = false;
    }
    document.querySelectorAll('.vc-image-card, .vc-portal-tile').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, {passive: true});
    });
  }
})();
