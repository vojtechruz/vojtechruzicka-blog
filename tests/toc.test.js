/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import pluginTOC from 'eleventy-plugin-nesting-toc';
import { loadPage, loadPageHtml, getAllPosts, SITE_DIR } from './helpers.js';
import registerTextFilters from '../config/filters/text.js';

/** Posts that are actually published in the production build */
function publishedPosts() {
  return getAllPosts().filter((p) => !p.frontmatter.draftStatus && !p.frontmatter.archivedStatus && p.frontmatter.path);
}

/** Register a plugin/filter module against a fake Eleventy config and return the filter map */
function getFilters(registerFn, options) {
  const filters = new Map();
  const eleventyConfig = {
    addFilter(name, callback) {
      filters.set(name, callback);
    },
  };
  registerFn(eleventyConfig, options);
  return filters;
}

describe('Table of contents – rendered output', () => {
  // A post with a flat (h2-only) TOC and percent-encoded heading ids
  const flatPostPath = '/break-java-generics-naming-convention/';
  // A post that nests h3 headings under h2 headings
  const nestedPostPath = '/staticman/';

  it('renders a labelled TOC nav with a heading and a single top-level list', () => {
    const $ = loadPage(flatPostPath);
    const nav = $('nav.toc');

    expect(nav.length).toBe(1);
    expect(nav.attr('aria-label')).toBe('Table of contents');
    expect(nav.find('.toc-heading').text().trim()).toBe('Table of contents');
    expect(nav.find('> .toc-list > ol').length).toBe(1);
    expect(nav.find('> .toc-list > ol > li').length).toBeGreaterThan(1);
  });

  it('strips the nav element emitted by the toc plugin so no nav is nested inside nav.toc', () => {
    const $ = loadPage(nestedPostPath);

    expect($('nav.toc nav').length).toBe(0);
    // The plugin's own wrapper markup must not survive into the page
    expect(loadPageHtml(nestedPostPath)).not.toContain('<nav class="toc">\n');
  });

  it('lists exactly the h2/h3 headings of the article, in document order, with matching text', () => {
    const $ = loadPage(nestedPostPath);

    const headings = $('article')
      .find('h2[id], h3[id]')
      .map((i, el) => ({ id: $(el).attr('id'), text: $(el).text().trim() }))
      .get();
    const entries = $('nav.toc .toc-list a')
      .map((i, el) => ({ id: $(el).attr('href').slice(1), text: $(el).text().trim() }))
      .get();

    expect(headings.length).toBeGreaterThan(3);
    expect(entries).toEqual(headings);
  });

  it('never links to headings deeper than h3 (plugin is configured for h2/h3 only)', () => {
    const $ = loadPage(nestedPostPath);

    const tocIds = new Set(
      $('nav.toc .toc-list a')
        .map((i, el) => $(el).attr('href').slice(1))
        .get(),
    );
    const deeperIds = $('article')
      .find('h4[id], h5[id], h6[id]')
      .map((i, el) => $(el).attr('id'))
      .get();

    for (const id of deeperIds) {
      expect(tocIds.has(id), `TOC should not link to deep heading #${id}`).toBe(false);
    }
    // h3 entries live one level deeper than h2 entries, never deeper than that
    expect($('nav.toc .toc-list ol ol li').length).toBeGreaterThan(0);
    expect($('nav.toc .toc-list ol ol ol').length).toBe(0);
  });

  it('nests h3 entries inside the list item of the preceding h2', () => {
    const $ = loadPage(nestedPostPath);

    const nestedLink = $('nav.toc .toc-list ol ol a').first();
    const nestedId = nestedLink.attr('href').slice(1);
    expect($(`article h3[id="${nestedId}"]`).length).toBe(1);

    // The parent <li> of the nested list must be the entry of an h2
    const parentLink = nestedLink.closest('ol').parent('li').children('a').first();
    const parentId = parentLink.attr('href').slice(1);
    expect($(`article h2[id="${parentId}"]`).length).toBe(1);
  });

  it('renders the flat TOC of a post without subheadings without any nested list', () => {
    const $ = loadPage(flatPostPath);

    expect($('article').find('h3[id]').length).toBe(0);
    expect($('nav.toc .toc-list ol ol').length).toBe(0);
    expect($('nav.toc .toc-list a').length).toBe($('article').find('h2[id]').length);
  });

  it('uses in-page fragments that resolve to real heading ids on every published post', () => {
    for (const { frontmatter } of publishedPosts()) {
      if (!existsSync(`${SITE_DIR}${frontmatter.path}index.html`)) {
        continue;
      }
      const $ = loadPage(frontmatter.path);
      const links = $('nav.toc .toc-list a');
      if (links.length === 0) {
        continue;
      }

      links.each((i, el) => {
        const href = $(el).attr('href');
        expect(href, `${frontmatter.path}: TOC link must be an in-page fragment`).toMatch(/^#.+/);

        const id = href.slice(1);
        const target = $('article')
          .find('h2[id], h3[id]')
          .filter((j, h) => $(h).attr('id') === id);
        expect(target.length, `${frontmatter.path}: no heading matches TOC fragment ${href}`).toBe(1);
      });
    }
  });

  it('renders the TOC block exactly for pages that have headings, and loads the scrollspy with it', () => {
    for (const { frontmatter } of publishedPosts()) {
      if (!existsSync(`${SITE_DIR}${frontmatter.path}index.html`)) {
        continue;
      }
      const $ = loadPage(frontmatter.path);
      const hasHeadings = $('article').find('h2[id], h3[id]').length > 0;

      expect($('nav.toc').length, `${frontmatter.path}: TOC block presence should follow heading presence`).toBe(
        hasHeadings ? 1 : 0,
      );
      expect($('script[src^="/scripts/toc-scrollspy.js"]').length, `${frontmatter.path}: scrollspy script`).toBe(
        hasHeadings ? 1 : 0,
      );
    }
  });

  it('does not render a TOC on pages that are not posts', () => {
    for (const path of ['/topics/', '/archive/', '/series/']) {
      const $ = loadPage(path);
      expect($('nav.toc').length, `${path} should have no TOC`).toBe(0);
    }
  });
});

describe('Table of contents – empty-TOC guard', () => {
  const toc = getFilters(pluginTOC.configFunction, { tags: ['h2', 'h3'] }).get('toc');
  const stripNav = getFilters(registerTextFilters).get('stripNav');

  it('the toc filter yields no content for markup without h2/h3 headings', () => {
    // This is what makes `{% if tocHtml and (tocHtml | trim) %}` in post.njk suppress the block
    expect(toc('<p>Just a paragraph.</p><h4 id="deep">Deep</h4>').trim()).toBe('');
  });

  it('the toc filter yields a nav wrapper when h2/h3 headings exist', () => {
    const html = toc('<h2 id="a">A</h2><h3 id="b">B</h3>');

    expect(html.trim()).not.toBe('');
    expect(html).toContain('<nav class="toc">');
    expect(html).toContain('href="#a"');
    expect(html).toContain('href="#b"');
  });

  it('stripNav removes the plugin nav wrapper but keeps the list markup', () => {
    const stripped = stripNav(toc('<h2 id="a">A</h2>'));

    expect(stripped).not.toContain('<nav');
    expect(stripped).not.toContain('</nav>');
    expect(stripped).toContain('href="#a"');
    expect(stripped).toContain('<ol>');
  });

  it('stripNav passes through empty input unchanged', () => {
    expect(stripNav('')).toBe('');
  });
});

describe('toc-scrollspy.js behaviour', () => {
  // The script is an IIFE, so each run needs a fresh module URL
  let runCount = 0;
  let scrollToMock;

  /**
   * Build a TOC + heading DOM and run the scrollspy against it.
   * @param {{id: string, top: number, tag?: string}[]} headings
   * @param {{extraLinks?: string, bodyHeight?: number, scrollY?: number, tocMarkup?: string}} options
   */
  async function renderAndRun(headings, options = {}) {
    const { extraLinks = '', bodyHeight = 5000, scrollY = 0, tocMarkup = null } = options;

    const items = headings.map((h) => `<li><a href="#${h.id}">${h.id}</a></li>`).join('');
    const body = headings.map((h) => `<${h.tag || 'h2'} id="${h.id}">${h.id}</${h.tag || 'h2'}>`).join('');

    document.body.innerHTML =
      tocMarkup === null
        ? `<nav class="toc" aria-label="Table of contents">
             <p class="toc-heading">Table of contents</p>
             <div class="toc-list"><ol>${items}</ol></div>
             ${extraLinks}
           </nav>
           <article>${body}</article>`
        : `${tocMarkup}<article>${body}</article>`;

    setScrollPosition(headings, scrollY, bodyHeight);
    await import('../src/scripts/toc-scrollspy.js?run=' + runCount++);
  }

  /** Reposition headings / the viewport without re-running the script */
  function setScrollPosition(headings, scrollY, bodyHeight) {
    Object.defineProperty(document.body, 'offsetHeight', { value: bodyHeight, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: scrollY, configurable: true, writable: true });

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) {
        el.getBoundingClientRect = () => ({ top: h.top, bottom: h.top + 30, left: 0, right: 0, height: 30, width: 0 });
      }
    }
  }

  /** ids of currently active TOC links */
  function activeIds() {
    return Array.from(document.querySelectorAll('a.is-active')).map((a) => a.getAttribute('href').slice(1));
  }

  beforeEach(() => {
    vi.stubGlobal('requestAnimationFrame', (cb) => {
      cb(0);
      return 0;
    });
    scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('marks the last heading above the anchor line as active on load', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: -10 },
      { id: 'gamma', top: 900 },
    ];
    await renderAndRun(headings);

    expect(activeIds()).toEqual(['beta']);
    expect(document.querySelector('a[href="#beta"]').getAttribute('aria-current')).toBe('true');
    expect(document.querySelector('a[href="#alpha"]').hasAttribute('aria-current')).toBe(false);
  });

  it('moves the active marker on scroll and clears it from the previous entry', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: 900 },
    ];
    await renderAndRun(headings);
    expect(activeIds()).toEqual(['alpha']);

    headings[1].top = 2;
    setScrollPosition(headings, 900, 5000);
    window.dispatchEvent(new window.Event('scroll'));

    expect(activeIds()).toEqual(['beta']);
    expect(document.querySelector('a[href="#alpha"]').hasAttribute('aria-current')).toBe(false);
  });

  it('highlights the first heading when the page is scrolled near the very top', async () => {
    // No heading is above the anchor line, but the first one is well inside the viewport
    await renderAndRun([
      { id: 'alpha', top: 100 },
      { id: 'beta', top: 900 },
    ]);

    expect(activeIds()).toEqual(['alpha']);
  });

  it('marks nothing active when the first heading is still far down the viewport', async () => {
    // innerHeight * 0.6 === 480, so a heading at 700 is not "near the top" yet
    await renderAndRun([
      { id: 'alpha', top: 700 },
      { id: 'beta', top: 1500 },
    ]);

    expect(activeIds()).toEqual([]);
  });

  it('always highlights the last heading once the page is scrolled to the bottom', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: 400 },
      { id: 'gamma', top: 1200 },
    ];
    // innerHeight (800) + scrollY (1500) >= bodyHeight (2000) - 10
    await renderAndRun(headings, { scrollY: 1500, bodyHeight: 2000 });

    expect(activeIds()).toEqual(['gamma']);
  });

  it('ignores TOC links whose target heading does not exist', async () => {
    const headings = [{ id: 'alpha', top: -10 }];
    const tocMarkup = `
      <nav class="toc">
        <div class="toc-list"><ol>
          <li><a href="#ghost">ghost</a></li>
          <li><a href="#alpha">alpha</a></li>
        </ol></div>
      </nav>`;
    await renderAndRun(headings, { tocMarkup });

    expect(activeIds()).toEqual(['alpha']);
    expect(document.querySelector('a[href="#ghost"]').classList.contains('is-active')).toBe(false);
  });

  it('does not register scroll handling when the page has no TOC', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    document.body.innerHTML = '<article><h2 id="alpha">alpha</h2></article>';

    await import('../src/scripts/toc-scrollspy.js?run=' + runCount++);

    expect(addSpy.mock.calls.some(([type]) => type === 'scroll')).toBe(false);
    addSpy.mockRestore();
  });

  it('does not register scroll handling when no TOC link resolves to a heading', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    document.body.innerHTML = `
      <nav class="toc"><div class="toc-list"><ol><li><a href="#ghost">ghost</a></li></ol></div></nav>
      <article><h2 id="alpha">alpha</h2></article>`;

    await import('../src/scripts/toc-scrollspy.js?run=' + runCount++);

    expect(addSpy.mock.calls.some(([type]) => type === 'scroll')).toBe(false);
    addSpy.mockRestore();
  });

  it('takes over TOC clicks: prevents default, highlights the target and scrolls with the anchor offset', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: 900 },
    ];
    await renderAndRun(headings, { scrollY: 200 });
    expect(activeIds()).toEqual(['alpha']);

    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('a[href="#beta"]').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(activeIds()).toEqual(['beta']);
    // scrollY (200) + rect.top (900) - offset (0, no CSS var in jsdom)
    expect(scrollToMock).toHaveBeenCalledWith({ top: 1100, behavior: 'smooth' });
  });

  it('suspends the scrollspy after a click and resumes it on a real user scroll', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: 900 },
    ];
    await renderAndRun(headings);

    document
      .querySelector('a[href="#beta"]')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(activeIds()).toEqual(['beta']);

    // Programmatic scrolling must not steal the highlight back
    window.dispatchEvent(new window.Event('scroll'));
    expect(activeIds()).toEqual(['beta']);

    // A genuine user gesture re-enables the spy and re-evaluates immediately
    window.dispatchEvent(new window.Event('wheel'));
    expect(activeIds()).toEqual(['alpha']);
  });

  it('resumes the scrollspy on keyboard scrolling keys but not on unrelated keys', async () => {
    const headings = [
      { id: 'alpha', top: -40 },
      { id: 'beta', top: 900 },
    ];
    await renderAndRun(headings);

    document
      .querySelector('a[href="#beta"]')
      .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a' }));
    expect(activeIds()).toEqual(['beta']);

    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'PageDown' }));
    expect(activeIds()).toEqual(['alpha']);
  });

  it('leaves non-fragment links inside the TOC to the browser', async () => {
    const headings = [{ id: 'alpha', top: -10 }];
    await renderAndRun(headings, { extraLinks: '<a class="outside" href="/elsewhere/">Elsewhere</a>' });

    const event = new window.MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('a.outside').dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(scrollToMock).not.toHaveBeenCalled();
    expect(document.querySelector('a.outside').classList.contains('is-active')).toBe(false);
  });

  it('only tracks links inside .toc-list, not other anchors in the TOC nav', async () => {
    const headings = [{ id: 'alpha', top: -10 }];
    await renderAndRun(headings, { extraLinks: '<a class="outside" href="#alpha">Skip</a>' });

    expect(activeIds()).toEqual(['alpha']);
    expect(document.querySelector('a.outside').classList.contains('is-active')).toBe(false);
  });

  it('matches heading ids that contain percent-encoded characters', async () => {
    // Real posts produce ids such as "option-1.-follow-the-convention%2C-explain-in-javadoc"
    const headings = [
      { id: 'option-1.-follow%2C-explain', top: -10 },
      { id: 'conclusion', top: 900 },
    ];
    await renderAndRun(headings);

    expect(activeIds()).toEqual(['option-1.-follow%2C-explain']);
  });
});
