// Mobile navigation toggle. The menu is collapsed behind the hamburger by
// default in CSS (so enhancing it causes no layout shift); with JS disabled a
// <noscript> style block in layouts/base.njk restores the plain visible stack.
// The `.js-nav` marker class is kept as a "JS is active" hook, but no styles
// depend on it any more.
//
// On a compact screen the header also hides while scrolling down and comes back on scrolling up
// (initHideOnScroll below).
//
// The logic is wrapped in initNav(doc) so unit tests can run it against an isolated
// jsdom document; the browser bundle auto-runs it against the real document below.

// The compact header: one row (logo + hamburger), hidden while scrolling down. Same query as
// $query-compact-nav in src/styles/_variables.scss and the <noscript> block in layouts/base.njk.
export const COMPACT_NAV_QUERY = '(max-width: 1024px), (max-height: 500px)';
// Scroll distance (px) that counts as a direction change, so a jittery finger does not flicker the header
const SCROLL_THRESHOLD = 8;

export function initNav(doc = document) {
  const view = doc.defaultView || (typeof window !== 'undefined' ? window : null);
  const nav = doc.querySelector('.main-navigation');
  const btn = nav?.querySelector('.nav-toggle');
  const panel = nav?.querySelector('#nav-menu');

  if (!nav || !btn || !panel) {
    return;
  }

  nav.classList.add('js-nav');

  const isOpen = () => nav.classList.contains('nav-open');

  const setOpen = (open) => {
    nav.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  btn.addEventListener('click', () => setOpen(!isOpen()));

  // Close on Escape and return focus to the trigger.
  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  // Close when clicking outside the nav.
  doc.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target)) {
      setOpen(false);
    }
  });

  // Close after following a menu link.
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  if (!view?.matchMedia) {
    return;
  }
  const compact = view.matchMedia(COMPACT_NAV_QUERY);
  // Reset to a clean state when leaving the compact layout (wider, or taller after rotating).
  compact.addEventListener('change', (event) => {
    if (!event.matches) {
      setOpen(false);
    }
  });
  initHideOnScroll(doc, view, nav, compact, isOpen);
}

/**
 * Hides the compact header while scrolling down, shows it again on scrolling up. It stays put near the
 * top of the page, while the menu or the search is open, and while keyboard focus is in it; focus
 * moving into it (Tab back to the top) brings it back.
 */
function initHideOnScroll(doc, view, nav, compact, isOpen) {
  let lastY = Math.max(0, view.scrollY);
  let scheduled = false;

  const setHidden = (hidden) => nav.classList.toggle('nav-hidden', hidden);
  const mustShow = (y) =>
    !compact.matches ||
    isOpen() ||
    doc.body.classList.contains('search-open') ||
    Boolean(nav.querySelector(':focus-visible')) ||
    // Near the top the header is in its place in the page anyway
    y <= nav.offsetHeight;

  const update = () => {
    scheduled = false;
    // Overscroll on iOS reports a negative position
    const y = Math.max(0, view.scrollY);
    if (mustShow(y)) {
      setHidden(false);
      lastY = y;
      return;
    }
    if (Math.abs(y - lastY) < SCROLL_THRESHOLD) {
      return;
    }
    setHidden(y > lastY);
    lastY = y;
  };

  view.addEventListener(
    'scroll',
    () => {
      if (!scheduled) {
        scheduled = true;
        view.requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  nav.addEventListener('focusin', () => setHidden(false));
  compact.addEventListener('change', () => setHidden(false));
}

// Auto-initialise in the browser bundle. In unit tests initNav is imported and
// called explicitly, and this run is a harmless no-op (no nav in the document yet).
if (typeof document !== 'undefined') {
  initNav(document);
}
