import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/search.js. Pagefind UI itself is loaded at runtime
// from /pagefind/ and is not under test here - it is replaced by a stub that
// renders the same skeleton (form, input, drawer) the script wires itself to.
// What IS under test is our own glue: lazy vs. immediate initialisation, the
// header overlay (backdrop, body lock, Escape) and the inline /search/ page
// (query from the URL, URL kept in sync while typing, no overlay chrome).

class PagefindUIStub {
  static instances = [];

  constructor(options) {
    this.options = options;
    this.triggerSearch = vi.fn((term) => {
      this.input.value = term;
      this.drawer.classList.remove('pagefind-ui__hidden');
    });

    const { element } = options;
    element.innerHTML = `
      <div class="pagefind-ui">
        <form class="pagefind-ui__form" role="search">
          <input class="pagefind-ui__search-input" type="text" />
        </form>
        <div class="pagefind-ui__drawer pagefind-ui__hidden"></div>
      </div>
    `;
    this.input = element.querySelector('.pagefind-ui__search-input');
    this.drawer = element.querySelector('.pagefind-ui__drawer');

    // Each test re-imports the script, and its document/window listeners from
    // earlier imports keep pointing at containers that have since been replaced.
    // Only instances mounted in the current DOM count.
    if (element.isConnected) {
      PagefindUIStub.instances.push(this);
    }
  }
}

const HEADER_CONTAINER = `
  <div class="js-pagefind" id="search">
    <div class="pagefind-ui"><form class="pagefind-ui__form"><input class="pagefind-ui__search-input" /></form></div>
  </div>`;

const INLINE_CONTAINER = `
  <div class="js-pagefind search-page-ui" id="search-page" data-search-inline>
    <div class="pagefind-ui"><form class="pagefind-ui__form"><input class="pagefind-ui__search-input" /></form></div>
  </div>`;

/** Let the async init (await ensureAssets + queueMicrotask) and MutationObserver callbacks settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

async function loadScript(url, markup) {
  window.history.replaceState(null, '', url);
  document.body.innerHTML = markup;
  document.body.className = '';
  await import('../src/scripts/search.js?t=' + Date.now() + Math.random());
  await flush();
}

function typeInto(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('search.js', () => {
  beforeEach(() => {
    PagefindUIStub.instances = [];
    window.PagefindUI = PagefindUIStub;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.body.className = '';
    delete window.PagefindUI;
    vi.restoreAllMocks();
  });

  describe('header overlay container', () => {
    it('does not initialise Pagefind until the user interacts with it', async () => {
      await loadScript('/about/', HEADER_CONTAINER);

      expect(PagefindUIStub.instances).toHaveLength(0);

      document.getElementById('search').dispatchEvent(new Event('focusin', { bubbles: true }));
      await flush();

      expect(PagefindUIStub.instances).toHaveLength(1);
      expect(document.getElementById('search').dataset.pagefindInited).toBe('1');
    });

    it('creates one instance even when several triggers fire for a single gesture', async () => {
      await loadScript('/about/', HEADER_CONTAINER);
      const container = document.getElementById('search');

      container.dispatchEvent(new Event('pointerdown', { bubbles: true }));
      container.dispatchEvent(new Event('focusin', { bubbles: true }));
      container.dispatchEvent(new Event('click', { bubbles: true }));
      await flush();

      expect(PagefindUIStub.instances).toHaveLength(1);
    });

    it('locks the page behind a backdrop while results are open and releases it on Escape', async () => {
      await loadScript('/about/', HEADER_CONTAINER);
      document.getElementById('search').dispatchEvent(new Event('focusin', { bubbles: true }));
      await flush();

      const [ui] = PagefindUIStub.instances;
      const backdrop = document.querySelector('.backdrop-search');
      expect(backdrop).not.toBeNull();

      // Pagefind reveals the drawer by dropping its hidden class
      ui.input.value = 'java';
      ui.drawer.classList.remove('pagefind-ui__hidden');
      await flush();

      expect(document.body.classList.contains('search-open')).toBe(true);
      expect(backdrop.classList.contains('is-visible')).toBe(true);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await flush();

      expect(document.body.classList.contains('search-open')).toBe(false);
      expect(backdrop.classList.contains('is-visible')).toBe(false);
      expect(ui.input.value).toBe('');
    });

    it('never runs a query from the URL or touches the address bar', async () => {
      await loadScript('/about/?q=java', HEADER_CONTAINER);
      document.getElementById('search').dispatchEvent(new Event('focusin', { bubbles: true }));
      await flush();

      const [ui] = PagefindUIStub.instances;
      expect(ui.triggerSearch).not.toHaveBeenCalled();

      typeInto(ui.input, 'spring');
      expect(window.location.search).toBe('?q=java');
    });
  });

  describe('inline container (/search/ page)', () => {
    it('initialises immediately and runs the query from the URL', async () => {
      await loadScript('/search/?q=java%20records', INLINE_CONTAINER);

      expect(PagefindUIStub.instances).toHaveLength(1);
      const [ui] = PagefindUIStub.instances;
      expect(ui.options.element).toBe(document.getElementById('search-page'));
      expect(ui.triggerSearch).toHaveBeenCalledTimes(1);
      expect(ui.triggerSearch).toHaveBeenCalledWith('java records');
    });

    it('trims the query and skips the search when it is empty', async () => {
      await loadScript('/search/?q=%20%20', INLINE_CONTAINER);
      expect(PagefindUIStub.instances[0].triggerSearch).not.toHaveBeenCalled();

      PagefindUIStub.instances = [];
      await loadScript('/search/?q=%20java%20', INLINE_CONTAINER);
      expect(PagefindUIStub.instances[0].triggerSearch).toHaveBeenCalledWith('java');
    });

    it('does nothing without a query parameter', async () => {
      await loadScript('/search/', INLINE_CONTAINER);

      const [ui] = PagefindUIStub.instances;
      expect(ui.triggerSearch).not.toHaveBeenCalled();
      expect(ui.input.value).toBe('');
    });

    it('keeps the URL in sync with the typed query without growing history', async () => {
      await loadScript('/search/', INLINE_CONTAINER);
      const [ui] = PagefindUIStub.instances;
      const pushState = vi.spyOn(window.history, 'pushState');

      typeInto(ui.input, 'spring boot');
      expect(window.location.pathname + window.location.search).toBe('/search/?q=spring%20boot');

      typeInto(ui.input, '   ');
      expect(window.location.pathname + window.location.search).toBe('/search/');

      expect(pushState).not.toHaveBeenCalled();
    });

    it('renders inline: no backdrop, no body lock, Escape leaves the query alone', async () => {
      await loadScript('/search/?q=java', INLINE_CONTAINER);
      const [ui] = PagefindUIStub.instances;
      await flush();

      expect(document.querySelector('.backdrop-search')).toBeNull();
      expect(document.body.classList.contains('search-open')).toBe(false);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await flush();
      expect(ui.input.value).toBe('java');
    });
  });

  describe('mixed page (header + inline container)', () => {
    it('initialises only the inline container up front and leaves the header lazy', async () => {
      await loadScript('/search/?q=java', HEADER_CONTAINER + INLINE_CONTAINER);

      expect(PagefindUIStub.instances).toHaveLength(1);
      expect(PagefindUIStub.instances[0].options.element.id).toBe('search-page');
      expect(document.getElementById('search').dataset.pagefindInited).toBeUndefined();
    });

    it('routes the keyboard shortcut to the header container', async () => {
      await loadScript('/search/', HEADER_CONTAINER + INLINE_CONTAINER);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      await flush();

      expect(PagefindUIStub.instances.map((ui) => ui.options.element.id)).toEqual(['search-page', 'search']);
    });
  });
});
