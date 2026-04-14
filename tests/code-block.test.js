import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

describe('code-block.js interactivity', () => {
  let writeTextMock;

  beforeEach(async () => {
    // JSDOM does not fully support innerText, which the code uses.
    // Polyfill it using textContent for tests.
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')) {
      Object.defineProperty(HTMLElement.prototype, 'innerText', {
        get() {
          return this.textContent;
        },
        set(v) {
          this.textContent = v;
        },
        configurable: true,
      });
    }

    // Set up DOM
    document.body.innerHTML = `
      <div class="code-block-container" data-language="javascript">
        <div class="code-block-header">
          <span class="code-block-title">test.js</span>
          <button class="copy-code-button" aria-label="Copy code to clipboard" type="button" title="Copy code to clipboard">
            <span class="copy-icon"></span>
            <span class="copy-status">Copy</span>
          </button>
        </div>
        <pre><code>console.log("hello");</code></pre>
      </div>
    `;

    // Mock clipboard API
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      configurable: true,
    });

    // Mock console.error to avoid noise in tests
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import the script to attach event listeners
    // We use a query parameter to ensure it re-runs if needed, though Vitest should handle it
    await import('../src/scripts/code-block.js?t=' + Date.now());

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('copies code content to clipboard when clicking the button', async () => {
    const button = document.querySelector('.copy-code-button');
    const pre = document.querySelector('pre');

    // In JSDOM, innerText might not work exactly like in browser for nested elements,
    // but code-block.js uses pre.innerText.
    // Let's ensure pre has some text content.
    pre.textContent = 'console.log("hello");';

    button.click();

    // The event listener is async, but click() is synchronous.
    // However, the listener internally uses await.
    // We might need to wait for microtasks.
    await vi.runAllTicks();

    expect(writeTextMock).toHaveBeenCalledWith('console.log("hello");');
  });

  it('updates button state and text after copying', async () => {
    const button = document.querySelector('.copy-code-button');
    const status = button.querySelector('.copy-status');

    button.click();
    await vi.runAllTicks();

    expect(button.classList.contains('copied')).toBe(true);
    expect(status.textContent).toBe('Copied!');
    expect(button.getAttribute('aria-label')).toBe('Copied!');
  });

  it('resets button state after 2 seconds', async () => {
    const button = document.querySelector('.copy-code-button');
    const status = button.querySelector('.copy-status');
    const originalText = status.textContent;
    const originalAriaLabel = button.getAttribute('aria-label');

    button.click();
    await vi.runAllTicks();

    expect(button.classList.contains('copied')).toBe(true);

    // Fast-forward 2 seconds
    vi.advanceTimersByTime(2000);

    expect(button.classList.contains('copied')).toBe(false);
    expect(status.textContent).toBe(originalText);
    expect(button.getAttribute('aria-label')).toBe(originalAriaLabel);
  });

  it('works for code blocks without a title', async () => {
    document.body.innerHTML = `
      <div class="code-block-container" data-language="css">
        <button class="copy-code-button" aria-label="Copy" type="button">
          <span class="copy-status"></span>
        </button>
        <pre>body { color: red; }</pre>
      </div>
    `;

    const button = document.querySelector('.copy-code-button');
    const status = button.querySelector('.copy-status');
    const pre = document.querySelector('pre');
    pre.textContent = 'body { color: red; }';

    button.click();
    await vi.runAllTicks();

    expect(writeTextMock).toHaveBeenCalledWith('body { color: red; }');
    expect(status.textContent).toBe('Copied!');

    vi.advanceTimersByTime(2000);
    expect(status.textContent).toBe('');
  });

  it('handles clipboard failure gracefully', async () => {
    writeTextMock.mockRejectedValue(new Error('Clipboard error'));

    const button = document.querySelector('.copy-code-button');

    button.click();
    await vi.runAllTicks();

    // Should not have 'copied' class
    expect(button.classList.contains('copied')).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});
