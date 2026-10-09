import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/series-toc.js: the collapse toggle and its remembered state,
// including browsers where localStorage throws (site data blocked).

const MARKUP = `
  <nav class="series-toc" aria-label="Series navigation">
    <p class="toc-heading">
      <span>All posts in the series</span>
      <button class="series-toc-toggle" type="button" aria-expanded="true" aria-controls="series-toc-list"></button>
    </p>
    <ol class="toc-list" id="series-toc-list"><li><a href="/a/">A</a></li></ol>
  </nav>`;

async function loadScript() {
  document.body.innerHTML = MARKUP;
  await import('../src/scripts/series-toc.js?t=' + Date.now() + Math.random());
  return {
    nav: document.querySelector('nav.series-toc'),
    button: document.querySelector('.series-toc-toggle'),
    list: document.getElementById('series-toc-list'),
  };
}

describe('series-toc.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('starts expanded and collapses on click, remembering the choice', async () => {
    const { nav, button, list } = await loadScript();
    expect(list.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    button.click();

    expect(list.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Expand series list');
    expect(nav.classList.contains('series-toc--collapsed')).toBe(true);
    expect(localStorage.getItem('series-toc-collapsed')).toBe('1');
  });

  it('restores the collapsed state on the next page', async () => {
    localStorage.setItem('series-toc-collapsed', '1');
    const { button, list } = await loadScript();
    expect(list.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    expect(list.hidden).toBe(false);
    expect(localStorage.getItem('series-toc-collapsed')).toBeNull();
  });

  it('still toggles when localStorage throws (site data blocked)', async () => {
    const blocked = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(blocked);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(blocked);

    const { button, list } = await loadScript();
    expect(list.hidden).toBe(false);

    button.click();
    expect(list.hidden).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');

    button.click();
    expect(list.hidden).toBe(false);
  });
});
