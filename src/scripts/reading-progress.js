// Lightweight reading progress bar for post pages
(() => {
  const bar = document.getElementById('reading-progress');
  if (!bar) {
    return;
  }

  const barInner = bar.querySelector('.reading-progress__bar');
  const article = document.querySelector('main.post article');
  if (!article || !barInner) {
    bar?.setAttribute('hidden', '');
    return;
  }

  // The sticky navigation covers the top of the viewport: progress starts once the article
  // scrolls under it. Measured, because the navigation wraps (and grows) on narrow screens.
  const nav = document.querySelector('.main-navigation');

  let headerOffset = 0;
  let start = 0;
  let total = 0;
  let postReadTracked = false;

  // trackAnalyticsEvent comes from analytics.js and may be missing (ad blocker), so the flag is
  // only set once the event was actually handed over - a later update retries.
  function trackPostRead(options = {}) {
    if (postReadTracked || typeof window.trackAnalyticsEvent !== 'function') {
      return;
    }
    window.trackAnalyticsEvent('Post Read', { readPostUrl: location.pathname }, options);
    postReadTracked = true;
  }

  function measure() {
    headerOffset = nav ? nav.offsetHeight : 0;
    start = article.getBoundingClientRect().top + window.scrollY;
    total = article.offsetHeight - (window.innerHeight - headerOffset);
    // Hide if there is nothing to scroll within the article
    if (total <= 0) {
      bar.setAttribute('hidden', '');
      // The whole article fits on screen, so it never reaches the 90 % below. Non-interactive:
      // merely opening a short post must not turn a bounce into an engaged visit.
      trackPostRead({ interactive: false });
    } else {
      bar.removeAttribute('hidden');
    }
    update();
  }

  let ticking = false;
  function onScroll() {
    if (ticking) {
      return;
    }

    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function update() {
    if (total <= 0) {
      return;
    }

    const scrolledInside = window.scrollY - (start - headerOffset);
    const ratio = clamp(scrolledInside / total, 0, 1);
    const percent = Math.round(ratio * 100);

    // Track when user has read most of the post
    if (percent >= 90) {
      trackPostRead();
    }

    barInner.style.transform = `scaleX(${ratio})`;
    bar.setAttribute('aria-valuenow', String(percent));
  }

  // Recalculate when the viewport or the article changes size - images, web fonts and embeds
  // can all change the article height after the first measure.
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', onScroll, { passive: true });
  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(article);
  }

  // Initial measure + paint
  measure();
  onScroll();
})();
