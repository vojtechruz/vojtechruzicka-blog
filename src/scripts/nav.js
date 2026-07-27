// Mobile navigation toggle. Progressive enhancement: the `.js-nav` class is only
// added here, so if this script never runs the menu falls back to a plain visible
// stack (see _navigation.scss). Once enhanced, the hamburger collapses the links +
// search behind an accessible toggle button.
//
// The logic is wrapped in initNav(doc) so unit tests can run it against an isolated
// jsdom document; the browser bundle auto-runs it against the real document below.
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

  // Reset to a clean state when growing past the mobile breakpoint.
  if (view?.matchMedia) {
    const desktop = view.matchMedia('(min-width: 769px)');
    desktop.addEventListener('change', (event) => {
      if (event.matches) {
        setOpen(false);
      }
    });
  }
}

// Auto-initialise in the browser bundle. In unit tests initNav is imported and
// called explicitly, and this run is a harmless no-op (no nav in the document yet).
if (typeof document !== 'undefined') {
  initNav(document);
}
