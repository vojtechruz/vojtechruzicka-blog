/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { globSync } from 'glob';
import { loadPage, loadPageHtml, getAllPosts, SITE_DIR } from './helpers.js';

const POST_PATH = '/break-java-generics-naming-convention/';

// Pages rendered by layouts other than post.njk — they must not ship the progress bar.
const NON_POST_PATHS = ['/', '/about/', '/topics/', '/topics/java/', '/archive/', '/series/', '/pages/2/'];

describe('Reading progress — rendered markup', () => {
  it('renders the progressbar with a complete accessibility contract', () => {
    const $ = loadPage(POST_PATH);
    const bar = $('#reading-progress');

    expect(bar.length).toBe(1);
    expect(bar.attr('role')).toBe('progressbar');
    expect(bar.attr('aria-label')).toBe('Reading progress');
    expect(bar.attr('aria-valuemin')).toBe('0');
    expect(bar.attr('aria-valuemax')).toBe('100');
    expect(bar.attr('aria-valuenow')).toBe('0');
  });

  it('starts hidden so it is not announced before the script measures the article', () => {
    const $ = loadPage(POST_PATH);

    expect($('#reading-progress').attr('hidden')).toBeDefined();
  });

  it('exposes exactly one decorative inner bar that is hidden from assistive tech', () => {
    const $ = loadPage(POST_PATH);
    const inner = $('#reading-progress .reading-progress__bar');

    expect(inner.length).toBe(1);
    expect(inner.attr('aria-hidden')).toBe('true');
    // The inner bar is purely visual: it must carry no text content of its own.
    expect(inner.text().trim()).toBe('');
  });

  it('references the reading progress script, deferred, and the bundle exists in the build', () => {
    const html = loadPageHtml(POST_PATH);
    const $ = loadPage(POST_PATH);
    const script = $('script[src="/scripts/reading-progress.js"]');

    expect(script.length).toBe(1);
    expect(html).toContain('/scripts/reading-progress.js');
    expect(script.is('[defer]')).toBe(true);
    expect(existsSync(`${SITE_DIR}/scripts/reading-progress.js`)).toBe(true);
  });

  it('appears on every published post page', () => {
    const published = getAllPosts().filter((post) => !post.frontmatter.draftStatus && post.frontmatter.path);

    expect(published.length).toBeGreaterThan(0);

    for (const { frontmatter } of published) {
      const $ = loadPage(frontmatter.path);
      expect($('#reading-progress').length, `Missing reading progress bar on ${frontmatter.path}`).toBe(1);
    }
  });

  it('does not appear on non-post pages', () => {
    for (const path of NON_POST_PATHS) {
      const $ = loadPage(path);
      expect($('#reading-progress').length, `Unexpected reading progress bar on ${path}`).toBe(0);
      expect($('script[src="/scripts/reading-progress.js"]').length, `Unexpected script on ${path}`).toBe(0);
    }
  });

  it('is rendered on post pages only — no other page in the build carries it', () => {
    const pagesWithBar = globSync(`${SITE_DIR}/**/*.html`).filter((file) =>
      readFileSync(file, 'utf-8').includes('id="reading-progress"'),
    );
    const publishedPosts = getAllPosts().filter((post) => !post.frontmatter.draftStatus && post.frontmatter.path);

    expect(pagesWithBar.length).toBe(publishedPosts.length);
  });
});

describe('reading-progress.js behaviour', () => {
  let rafQueue;
  let trackMock;
  let moduleCounter = 0;

  const ARTICLE_HEIGHT = 2768;
  const VIEWPORT_HEIGHT = 768;
  // total scrollable distance inside the article = height - viewport
  const TOTAL = ARTICLE_HEIGHT - VIEWPORT_HEIGHT;

  const BAR_MARKUP = `
    <div id="reading-progress" class="reading-progress" role="progressbar" aria-label="Reading progress"
      aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" hidden>
      <span class="reading-progress__bar" aria-hidden="true"></span>
    </div>`;

  function setScrollY(value) {
    Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true });
  }

  function flushRaf() {
    const queued = rafQueue;
    rafQueue = [];
    queued.forEach((cb) => cb());
  }

  /**
   * Build the DOM, stub layout metrics jsdom cannot compute, then run the IIFE.
   */
  async function boot({ bar = true, article = true, articleHeight = ARTICLE_HEIGHT } = {}) {
    document.body.innerHTML = `
      ${bar ? BAR_MARKUP : ''}
      <main id="content" class="post content">
        ${article ? '<article><p>Post body</p></article>' : ''}
      </main>`;

    const articleEl = document.querySelector('main.post article');
    if (articleEl) {
      Object.defineProperty(articleEl, 'offsetHeight', { value: articleHeight, configurable: true });
      // jsdom performs no layout: emulate an article pinned to the top of the document.
      articleEl.getBoundingClientRect = () => ({
        top: -window.scrollY,
        bottom: articleHeight - window.scrollY,
        left: 0,
        right: 0,
        height: articleHeight,
        width: 0,
      });
    }

    setScrollY(0);
    await import('../src/scripts/reading-progress.js?t=' + Date.now() + '_' + moduleCounter++);
    // The module ends with its own onScroll(); run that frame so the internal throttle resets.
    flushRaf();
  }

  function scrollTo(value) {
    setScrollY(value);
    window.dispatchEvent(new Event('scroll'));
    flushRaf();
  }

  const valueNow = () => document.getElementById('reading-progress').getAttribute('aria-valuenow');

  // Each test imports a fresh copy of the IIFE, which registers window listeners.
  // Track them so a previous instance cannot react to a later test's events.
  let listeners;
  const addEventListenerImpl = window.addEventListener.bind(window);

  beforeEach(() => {
    rafQueue = [];
    listeners = [];
    vi.stubGlobal('requestAnimationFrame', (cb) => rafQueue.push(cb));
    vi.spyOn(window, 'addEventListener').mockImplementation((type, handler, options) => {
      listeners.push([type, handler, options]);
      addEventListenerImpl(type, handler, options);
    });
    window.innerHeight = VIEWPORT_HEIGHT;
    trackMock = vi.fn();
    window.trackAnalyticsEvent = trackMock;
    window._postReadTracked = false;
  });

  afterEach(() => {
    listeners.forEach(([type, handler, options]) => window.removeEventListener(type, handler, options));
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('reports 0% at the top of the article', async () => {
    await boot();

    expect(valueNow()).toBe('0');
  });

  it('reports 50% halfway through the scrollable range', async () => {
    await boot();

    scrollTo(TOTAL / 2);

    expect(valueNow()).toBe('50');
  });

  it('reports 100% at the bottom of the scrollable range', async () => {
    await boot();

    scrollTo(TOTAL);

    expect(valueNow()).toBe('100');
  });

  it('clamps to 100 when scrolled past the end of the article', async () => {
    await boot();

    scrollTo(TOTAL * 5);

    expect(valueNow()).toBe('100');
  });

  it('clamps to 0 for negative scroll offsets (overscroll / rubber banding)', async () => {
    await boot();

    scrollTo(TOTAL / 2);
    expect(valueNow()).toBe('50');

    scrollTo(-500);
    expect(valueNow()).toBe('0');
  });

  it('scales the inner bar horizontally by the same ratio it reports', async () => {
    await boot();
    const inner = document.querySelector('.reading-progress__bar');

    scrollTo(TOTAL / 4);

    expect(valueNow()).toBe('25');
    expect(inner.style.transform).toBe('scaleX(0.25)');
  });

  it('reveals the bar once the article is longer than the viewport', async () => {
    await boot();

    expect(document.getElementById('reading-progress').hasAttribute('hidden')).toBe(false);
  });

  it('stays hidden and never updates when the article fits within the viewport', async () => {
    await boot({ articleHeight: VIEWPORT_HEIGHT - 200 });
    const bar = document.getElementById('reading-progress');

    expect(bar.hasAttribute('hidden')).toBe(true);

    scrollTo(1000);

    expect(bar.hasAttribute('hidden')).toBe(true);
    expect(valueNow()).toBe('0');
    expect(document.querySelector('.reading-progress__bar').style.transform).toBe('');
  });

  it('throttles bursts of scroll events into a single animation frame', async () => {
    await boot();

    setScrollY(TOTAL / 2);
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));
    window.dispatchEvent(new Event('scroll'));

    expect(rafQueue.length).toBe(1);

    flushRaf();
    expect(valueNow()).toBe('50');

    // After the frame runs, a later scroll schedules a fresh frame.
    setScrollY(TOTAL);
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue.length).toBe(1);
  });

  it('recomputes progress on resize when the viewport height changes', async () => {
    await boot();

    scrollTo(TOTAL / 2);
    expect(valueNow()).toBe('50');

    // Taller viewport shrinks the scrollable range, so the same offset means more progress.
    window.innerHeight = ARTICLE_HEIGHT - 1000;
    window.dispatchEvent(new Event('resize'));

    expect(Number(valueNow())).toBeGreaterThan(50);
  });

  it('tracks "Post Read" exactly once after passing 90%', async () => {
    await boot();

    scrollTo(TOTAL * 0.5);
    expect(trackMock).not.toHaveBeenCalled();

    scrollTo(TOTAL * 0.95);
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith('Post Read', { readPostUrl: location.pathname });

    scrollTo(TOTAL);
    expect(trackMock).toHaveBeenCalledTimes(1);
  });

  it('does not throw and keeps updating when trackAnalyticsEvent is unavailable past 90%', async () => {
    // analytics.js defines window.trackAnalyticsEvent and is deferred AFTER this
    // script, and an ad blocker can suppress it entirely — so on the initial
    // measure of a page restored near the end, the function may not exist yet.
    delete window.trackAnalyticsEvent;
    await boot();

    expect(() => scrollTo(TOTAL * 0.95)).not.toThrow();
    // The guard must not abort the rest of the update.
    expect(valueNow()).toBe('95');
  });

  it('is a no-op when the progress bar element is absent', async () => {
    await expect(boot({ bar: false })).resolves.not.toThrow();

    expect(document.getElementById('reading-progress')).toBeNull();

    // No listeners were attached, so scrolling schedules no work at all.
    setScrollY(1000);
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue.length).toBe(0);
  });

  it('hides the bar and bails out when the post has no article element', async () => {
    await boot({ article: false });
    const bar = document.getElementById('reading-progress');

    expect(bar.hasAttribute('hidden')).toBe(true);

    setScrollY(1000);
    window.dispatchEvent(new Event('scroll'));
    expect(rafQueue.length).toBe(0);
    expect(valueNow()).toBe('0');
  });
});
