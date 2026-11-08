/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync } from 'fs';
import { HEADER_ANCHOR_LABEL_PREFIX } from '../config/utils/markdown-parser.js';
import { loadPage, getAllPosts, SITE_DIR } from './helpers.js';

/** Posts that are actually published in the production build */
function publishedPosts() {
  return getAllPosts().filter((p) => !p.frontmatter.draftStatus && !p.frontmatter.archivedStatus && p.frontmatter.path);
}

// ---------------------------------------------------------------------------
// 1. Built output — every published post (the renderer itself: header-anchor-markdown.test.js).
// ---------------------------------------------------------------------------
describe('heading anchors — built posts', () => {
  const posts = publishedPosts();

  it('gives every article heading exactly one well-formed permalink anchor', () => {
    let headingCount = 0;

    for (const post of posts) {
      const $ = loadPage(post.frontmatter.path);

      $('article :is(h2, h3, h4, h5, h6)[id]').each((_, el) => {
        headingCount++;
        const id = $(el).attr('id');
        const anchors = $(el).find('a.header-anchor');
        const anchor = anchors.first();
        const text = $(el).clone().find('a.header-anchor').remove().end().text().trim();
        const label = HEADER_ANCHOR_LABEL_PREFIX + text;
        const where = `${post.frontmatter.path} #${id}`;

        expect(anchors.length, where).toBe(1);
        expect(anchor.attr('href'), where).toBe(`#${id}`);
        expect(anchor.attr('aria-label'), where).toBe(label);
        expect(anchor.attr('title'), where).toBe(label);
        expect(anchor.attr('tabindex'), where).toBe('-1');
        expect(anchor.attr('aria-hidden'), where).toBe('true');
        expect(anchor.text(), where).toBe('');
        expect($(el).children().last().is('a.header-anchor'), `${where}: anchor is not the last child`).toBe(true);
        expect($(el).attr('tabindex'), where).toBeUndefined();
      });
    }

    expect(headingCount).toBeGreaterThan(100);
  });

  it('produces clean slug ids — no percent-encoding, apostrophes or dots', () => {
    for (const post of posts) {
      const $ = loadPage(post.frontmatter.path);
      $('article :is(h2, h3, h4, h5, h6)[id]').each((_, el) => {
        const id = $(el).attr('id');
        expect(id, `${post.frontmatter.path} #${id}`).toMatch(/^[a-z0-9_-]+$/);
      });
    }
  });

  it('keeps the Gatsby-era ids for headings with punctuation', () => {
    // "What is OWASP?" was #what-is-owasp on the old site and must stay reachable.
    const $ = loadPage('/owasp-top-ten-2017/');
    expect($('article h2#what-is-owasp').length).toBe(1);
    expect($('article [id*="%"]').length).toBe(0);
  });

  it('loads the header-anchor script, deferred, on posts only and ships the bundle', () => {
    const postPath = posts[0].frontmatter.path;
    const script = loadPage(postPath)('script[src^="/scripts/header-anchor.js"]');

    expect(script.length).toBe(1);
    expect(script.is('[defer]')).toBe(true);
    expect(existsSync(`${SITE_DIR}/scripts/header-anchor.js`)).toBe(true);
    expect(loadPage('/')('script[src^="/scripts/header-anchor.js"]').length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Behaviour of src/scripts/header-anchor.js: clicking a heading permalink
// anchor copies the absolute deep-link to the clipboard with the shared
// `.copied` feedback, while leaving the default in-page navigation intact.
// ---------------------------------------------------------------------------
describe('header-anchor.js — copy heading permalink', () => {
  let writeTextMock;

  beforeEach(async () => {
    document.body.innerHTML = `
      <div class="post">
        <h2 id="installation">
          Installation
          <a class="header-anchor" href="#installation" aria-label="Copy link to this section: Installation"
             title="Copy link to this section: Installation" tabindex="-1"></a>
        </h2>
        <p>Some prose with no anchor.</p>
      </div>
    `;

    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      configurable: true,
    });

    await import('../src/scripts/header-anchor.js?t=' + Date.now());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  const anchor = () => document.querySelector('.header-anchor');

  it('copies the absolute deep-link (including the #fragment) to the clipboard', async () => {
    anchor().click();
    await vi.runAllTicks();

    const expected = new URL('#installation', location.href).href;
    expect(writeTextMock).toHaveBeenCalledWith(expected);
    expect(expected).toMatch(/#installation$/);
  });

  it('drops the query string (tracking parameters) from the copied link', async () => {
    const original = location.href;
    history.replaceState(null, '', `${location.pathname}?utm_source=newsletter&ref=x`);
    try {
      anchor().click();
      await vi.runAllTicks();

      expect(writeTextMock).toHaveBeenCalledWith(`${location.origin}${location.pathname}#installation`);
    } finally {
      history.replaceState(null, '', original);
    }
  });

  it('does not prevent the default click, so the browser still follows the #fragment', () => {
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor().dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('flags the anchor as copied and announces it via aria-label', async () => {
    anchor().click();
    await vi.runAllTicks();

    expect(anchor().classList.contains('copied')).toBe(true);
    expect(anchor().getAttribute('aria-label')).toBe('Link copied');
  });

  it('restores the original state after 2 seconds', async () => {
    const original = anchor().getAttribute('aria-label');

    anchor().click();
    await vi.runAllTicks();
    expect(anchor().classList.contains('copied')).toBe(true);

    vi.advanceTimersByTime(2000);

    expect(anchor().classList.contains('copied')).toBe(false);
    expect(anchor().getAttribute('aria-label')).toBe(original);
  });

  it('ignores clicks that are not on a header anchor', async () => {
    document.querySelector('p').click();
    await vi.runAllTicks();

    expect(writeTextMock).not.toHaveBeenCalled();
  });

  it('does not throw or flag copied when the clipboard write fails', async () => {
    writeTextMock.mockRejectedValue(new Error('denied'));

    expect(() => anchor().click()).not.toThrow();
    await vi.runAllTicks();

    expect(anchor().classList.contains('copied')).toBe(false);
  });
});
