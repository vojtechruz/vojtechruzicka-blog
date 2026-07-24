// Mobile navigation toggle. Progressive enhancement: the `.js-nav` class is only
// added here, so if this script never runs the menu falls back to a plain visible
// stack (see _navigation.scss). Once enhanced, the hamburger collapses the links +
// search behind an accessible toggle button.
const nav = document.querySelector('.main-navigation');
const btn = nav?.querySelector('.nav-toggle');
const panel = nav?.querySelector('#nav-menu');

if (nav && btn && panel) {
  nav.classList.add('js-nav');

  const setOpen = (open) => {
    nav.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  const isOpen = () => nav.classList.contains('nav-open');

  btn.addEventListener('click', () => setOpen(!isOpen()));

  // Close on Escape and return focus to the trigger.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      setOpen(false);
      btn.focus();
    }
  });

  // Close when clicking outside the nav.
  document.addEventListener('click', (event) => {
    if (isOpen() && !nav.contains(event.target)) {
      setOpen(false);
    }
  });

  // Close after following a menu link.
  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Reset to a clean state when growing past the mobile breakpoint.
  const desktop = window.matchMedia('(min-width: 769px)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) {
      setOpen(false);
    }
  });
}
