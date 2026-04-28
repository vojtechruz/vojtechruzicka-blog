// Collapsible series TOC with localStorage persistence
(() => {
  const nav = document.querySelector('nav.series-toc');
  if (!nav) {
    return;
  }

  const btn = nav.querySelector('.series-toc-toggle');
  const list = document.getElementById('series-toc-list');
  if (!btn || !list) {
    return;
  }

  const STORAGE_KEY = 'series-toc-collapsed';

  function setCollapsed(collapsed) {
    list.hidden = collapsed;
    btn.setAttribute('aria-expanded', String(!collapsed));
    btn.title = collapsed ? 'Expand series list' : 'Collapse series list';
    nav.classList.toggle('series-toc--collapsed', collapsed);
    if (collapsed) {
      localStorage.setItem(STORAGE_KEY, '1');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Restore saved preference
  setCollapsed(localStorage.getItem(STORAGE_KEY) === '1');

  btn.addEventListener('click', () => {
    setCollapsed(btn.getAttribute('aria-expanded') === 'true');
  });
})();
