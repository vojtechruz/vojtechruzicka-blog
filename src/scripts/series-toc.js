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

  // localStorage throws (SecurityError) when site data is blocked, e.g. Safari with all cookies
  // blocked or some private modes. The preference is a convenience: without storage the list
  // simply starts expanded and the toggle still works for the current page.
  function readCollapsed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  function writeCollapsed(collapsed) {
    try {
      if (collapsed) {
        localStorage.setItem(STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // storage unavailable - keep the in-page state only
    }
  }

  function setCollapsed(collapsed) {
    list.hidden = collapsed;
    btn.setAttribute('aria-expanded', String(!collapsed));
    const label = collapsed ? 'Expand series list' : 'Collapse series list';
    btn.title = label;
    btn.setAttribute('aria-label', label);
    nav.classList.toggle('series-toc--collapsed', collapsed);
    writeCollapsed(collapsed);
  }

  // Restore saved preference
  setCollapsed(readCollapsed());

  btn.addEventListener('click', () => {
    setCollapsed(btn.getAttribute('aria-expanded') === 'true');
  });
})();
