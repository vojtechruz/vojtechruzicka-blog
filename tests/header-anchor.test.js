/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Behaviour of src/scripts/header-anchor.js: clicking a heading permalink anchor
// copies the absolute deep-link to the clipboard with the shared `.copied`
// feedback, while leaving the default in-page navigation intact.
describe('header-anchor.js — copy heading permalink', () => {
  let writeTextMock;

  beforeEach(async () => {
    document.body.innerHTML = `
      <div class="post">
        <h2 id="installation">
          Installation
          <a class="header-anchor" href="#installation" aria-label="Permalink to this section"
             title="Copy link to this section"></a>
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
