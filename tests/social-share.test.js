import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/social-share.js: the copy-link button (universal
// fallback) and the native share button (revealed only when navigator.share exists).

const POST_URL = 'https://www.vojtechruzicka.com/css-flexbox/';

const MARKUP = `
  <nav class="social-share" aria-label="Share this post">
    <ul role="list" class="share-list">
      <li>
        <button type="button" class="share-icon share-native" id="native-share-button"
                aria-label="Share using your apps" data-url="${POST_URL}" hidden>share</button>
      </li>
      <li>
        <button type="button" class="share-icon share-copy" aria-label="Copy link to clipboard"
                data-url="${POST_URL}">copy</button>
      </li>
    </ul>
  </nav>`;

/** Let the async clipboard write and its feedback settle (microtasks only, timers stay faked). */
async function flushPromises() {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
}

// The script attaches a delegated click listener to `document` on import, so it
// is imported once per describe block: every extra import would add another
// listener and multiply the copy/prompt calls the assertions count.
async function loadScript() {
  await import('../src/scripts/social-share.js?t=' + Date.now() + Math.random());
}

function setClipboard(value) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}

function setShare(value) {
  Object.defineProperty(navigator, 'share', { value, configurable: true });
}

function renderPage() {
  document.body.innerHTML = MARKUP;
  document.head.innerHTML = '<meta name="description" content="Flexbox explained">';
  document.title = 'CSS Flexbox'; // after the head reset, which would drop the <title> element
}

describe('social-share.js', () => {
  let promptMock;

  beforeEach(() => {
    renderPage();
    promptMock = vi.fn();
    Object.defineProperty(window, 'prompt', { value: promptMock, configurable: true });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('copy link button', () => {
    beforeAll(async () => {
      renderPage();
      setShare(undefined);
      await loadScript();
    });

    it('copies the post URL from data-url and announces success', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard({ writeText });

      const btn = document.querySelector('.share-copy');
      btn.click();
      await flushPromises();

      expect(writeText).toHaveBeenCalledTimes(1);
      expect(writeText).toHaveBeenCalledWith(POST_URL);
      expect(btn.classList.contains('copied')).toBe(true);
      expect(btn.getAttribute('aria-label')).toBe('Link copied');
      expect(promptMock).not.toHaveBeenCalled();
    });

    it('restores the original label after the feedback period', async () => {
      setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });

      const btn = document.querySelector('.share-copy');
      btn.click();
      await flushPromises();
      expect(btn.classList.contains('copied')).toBe(true);

      vi.advanceTimersByTime(1999);
      expect(btn.classList.contains('copied')).toBe(true);

      vi.advanceTimersByTime(1);
      expect(btn.classList.contains('copied')).toBe(false);
      expect(btn.getAttribute('aria-label')).toBe('Copy link to clipboard');
    });

    it('keeps a single feedback window across rapid repeated clicks', async () => {
      setClipboard({ writeText: vi.fn().mockResolvedValue(undefined) });

      const btn = document.querySelector('.share-copy');
      btn.click();
      await flushPromises();
      vi.advanceTimersByTime(1500);
      btn.click();
      await flushPromises();

      // The second click restarted the 2 s window: still copied at 2.5 s after the first click...
      vi.advanceTimersByTime(1000);
      expect(btn.classList.contains('copied')).toBe(true);
      // ...and cleared 2 s after the second click, with the original label back.
      vi.advanceTimersByTime(1000);
      expect(btn.classList.contains('copied')).toBe(false);
      expect(btn.getAttribute('aria-label')).toBe('Copy link to clipboard');
    });

    it('falls back to window.prompt when the Clipboard API is missing (non-secure context)', async () => {
      setClipboard(undefined);

      const btn = document.querySelector('.share-copy');
      btn.click();
      await flushPromises();

      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledWith('Copy this URL:', POST_URL);
      expect(btn.classList.contains('copied')).toBe(false);
      expect(btn.getAttribute('aria-label')).toBe('Copy link to clipboard');
    });

    it('falls back to window.prompt when the clipboard write is rejected', async () => {
      setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('denied')) });

      document.querySelector('.share-copy').click();
      await flushPromises();

      expect(promptMock).toHaveBeenCalledTimes(1);
      expect(promptMock).toHaveBeenCalledWith('Copy this URL:', POST_URL);
    });

    it('ignores clicks elsewhere in the share nav', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      setClipboard({ writeText });

      document.querySelector('.share-list').click();
      await flushPromises();

      expect(writeText).not.toHaveBeenCalled();
      expect(promptMock).not.toHaveBeenCalled();
    });
  });

  describe('native share button', () => {
    // navigator.share is read once at import time, so each case loads the script itself.
    it('stays hidden when navigator.share is not supported', async () => {
      setShare(undefined);
      setClipboard({ writeText: vi.fn() });
      await loadScript();

      expect(document.getElementById('native-share-button').hidden).toBe(true);
    });

    it('is revealed and shares title, description and URL when supported', async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      setShare(share);
      setClipboard({ writeText: vi.fn() });
      await loadScript();

      const btn = document.getElementById('native-share-button');
      expect(btn.hidden).toBe(false);

      btn.click();
      await flushPromises();

      expect(share).toHaveBeenCalledTimes(1);
      expect(share).toHaveBeenCalledWith({ title: 'CSS Flexbox', text: 'Flexbox explained', url: POST_URL });
    });

    it('swallows a cancelled share dialog', async () => {
      setShare(vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError')));
      setClipboard({ writeText: vi.fn() });
      await loadScript();

      document.getElementById('native-share-button').click();
      await expect(flushPromises()).resolves.toBeUndefined();
    });
  });
});
