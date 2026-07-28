import { describe, it, expect, beforeEach } from 'vitest';
import { existsSync } from 'fs';
import { JSDOM } from 'jsdom';
import { loadPage, loadPageHtml, SITE_DIR } from './helpers.js';
import { getBrand, getLogo, getNavToggle, getMenu, getNavLinks } from './queries/header.js';
import { initNav } from '../src/scripts/nav.js';

// ---------------------------------------------------------------------------
// 1. Markup contract — the built HTML the CSS + JS enhancement depend on.
//    A break here means the hamburger silently dies on mobile while desktop
//    still looks fine, so it is worth pinning down.
// ---------------------------------------------------------------------------
describe('Navigation — rendered markup', () => {
  const HOME = '/';

  it('renders the brand as a home link carrying the logo and title', () => {
    const $ = loadPage(HOME);
    const brand = getBrand($);

    expect(brand.length).toBe(1);
    expect(brand.is('a')).toBe(true);
    expect(brand.attr('href')).toBe('/');

    const logo = getLogo($);
    expect(logo.length).toBe(1);
    // Decorative: the adjacent title text names the link, so alt must be empty.
    expect(logo.attr('alt')).toBe('');
    expect(logo.attr('src')).toContain('favicon.svg');
    // Explicit dimensions prevent layout shift.
    expect(logo.attr('width')).toBe('32');
    expect(logo.attr('height')).toBe('32');

    // Title stays in the DOM (it names the link for assistive tech even when the
    // CSS hides it visually on the narrowest screens).
    expect(brand.find('span').text().trim().length).toBeGreaterThan(0);
  });

  it('renders the hamburger button with a complete toggle contract', () => {
    const $ = loadPage(HOME);
    const btn = getNavToggle($);

    expect(btn.length).toBe(1);
    expect(btn.attr('type')).toBe('button');
    expect(btn.attr('aria-label')).toBe('Open menu');
    // Starts collapsed.
    expect(btn.attr('aria-expanded')).toBe('false');
    // aria-controls must resolve to a real element in the same document.
    const controls = btn.attr('aria-controls');
    expect(controls).toBe('nav-menu');
    expect($(`#${controls}`).length).toBe(1);
  });

  it('exposes three decorative bars hidden from assistive tech', () => {
    const $ = loadPage(HOME);
    const box = getNavToggle($).find('.nav-toggle-box');

    expect(box.attr('aria-hidden')).toBe('true');
    expect(box.find('.nav-toggle-bar').length).toBe(3);
  });

  it('wires the collapsible menu (links + search) as the controlled panel', () => {
    const $ = loadPage(HOME);
    const menu = getMenu($);

    expect(menu.length).toBe(1);
    expect(getNavLinks($).length).toBeGreaterThanOrEqual(3);
    expect(menu.find('.nav-search').length).toBe(1);
  });

  it('references the nav script, deferred, and ships the bundle', () => {
    const $ = loadPage(HOME);
    const html = loadPageHtml(HOME);
    const script = $('script[src="/scripts/nav.js"]');

    expect(script.length).toBe(1);
    expect(script.is('[defer]')).toBe(true);
    expect(html).toContain('/scripts/nav.js');
    expect(existsSync(`${SITE_DIR}/scripts/nav.js`)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Interaction — initNav wired against an isolated jsdom document per test.
// ---------------------------------------------------------------------------
const NAV_HTML = `<!doctype html><html><body>
  <header class="main-navigation">
    <nav aria-label="Main navigation">
      <div class="navigation">
        <a class="blog-name" href="/"><img class="blog-logo" alt="" /><span>Blog</span></a>
        <button type="button" class="nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="nav-menu">
          <span class="nav-toggle-box" aria-hidden="true">
            <span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span><span class="nav-toggle-bar"></span>
          </span>
        </button>
        <div class="menu-container" id="nav-menu">
          <ul class="menu-items"><li><a class="link" href="#">Home</a></li></ul>
          <div class="nav-search"></div>
        </div>
      </div>
    </nav>
  </header>
  <main><p id="outside">content</p></main>
</body></html>`;

describe('Navigation — toggle interaction', () => {
  let window;
  let document;
  let nav;
  let btn;
  let fireMediaChange;

  const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  const pressEscape = () =>
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  beforeEach(() => {
    const dom = new JSDOM(NAV_HTML, { url: 'http://localhost/' });
    window = dom.window;
    document = window.document;

    // jsdom has no matchMedia; capture the change handler so we can simulate a
    // resize past the desktop breakpoint.
    fireMediaChange = null;
    window.matchMedia = (media) => ({
      media,
      matches: false,
      addEventListener: (type, handler) => {
        if (type === 'change') {
          fireMediaChange = handler;
        }
      },
      removeEventListener: () => {},
    });

    initNav(document);
    nav = document.querySelector('.main-navigation');
    btn = document.querySelector('.nav-toggle');
  });

  it('enhances the nav so CSS knows JS is active', () => {
    expect(nav.classList.contains('js-nav')).toBe(true);
  });

  it('opens on toggle click and reflects state in ARIA', () => {
    click(btn);
    expect(nav.classList.contains('nav-open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Close menu');
  });

  it('toggles closed on a second click', () => {
    click(btn);
    click(btn);
    expect(nav.classList.contains('nav-open')).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the button', () => {
    click(btn);
    pressEscape();
    expect(nav.classList.contains('nav-open')).toBe(false);
    expect(document.activeElement).toBe(btn);
  });

  it('closes when clicking outside the nav', () => {
    click(btn);
    click(document.getElementById('outside'));
    expect(nav.classList.contains('nav-open')).toBe(false);
  });

  it('stays open when clicking inside the nav', () => {
    click(btn);
    click(document.querySelector('.nav-search'));
    expect(nav.classList.contains('nav-open')).toBe(true);
  });

  it('closes after following a menu link', () => {
    click(btn);
    click(document.querySelector('.menu-items a'));
    expect(nav.classList.contains('nav-open')).toBe(false);
  });

  it('resets to closed when the viewport grows past the mobile breakpoint', () => {
    click(btn);
    expect(nav.classList.contains('nav-open')).toBe(true);
    fireMediaChange({ matches: true });
    expect(nav.classList.contains('nav-open')).toBe(false);
  });

  it('is a no-op (and does not throw) when the toggle is absent', () => {
    const dom = new JSDOM('<!doctype html><body><header class="main-navigation"></header></body>', {
      url: 'http://localhost/',
    });
    expect(() => initNav(dom.window.document)).not.toThrow();
    expect(dom.window.document.querySelector('.main-navigation').classList.contains('js-nav')).toBe(false);
  });
});
