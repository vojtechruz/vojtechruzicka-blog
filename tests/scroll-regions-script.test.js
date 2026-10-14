import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * @vitest-environment jsdom
 */

// Unit tests for src/scripts/scroll-regions.js: only code blocks, tables and diagrams that overflow
// their box become focusable, named regions. jsdom has no layout, so each box gets a settable
// scrollWidth/clientWidth; the real-browser behaviour is in tests/scroll-regions-browser.test.js.

let observerCallback;
let observed;

function box(html, { scrollWidth, clientWidth = 600 }) {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const el = holder.firstElementChild;
  const size = { scrollWidth, clientWidth };
  Object.defineProperty(el, 'scrollWidth', { get: () => size.scrollWidth, configurable: true });
  Object.defineProperty(el, 'clientWidth', { get: () => size.clientWidth, configurable: true });
  document.body.appendChild(el);
  el.resize = (clientWidthNow) => {
    size.clientWidth = clientWidthNow;
  };
  return el;
}

const code = (sizes) => box('<pre class="shiki"><code>x</code></pre>', sizes);
const table = (sizes) => box('<div class="table-wrapper"><table></table></div>', sizes);
const diagram = (sizes) => box('<div class="mermaid-diagram"><svg></svg></div>', sizes);

async function loadScript() {
  await import('../src/scripts/scroll-regions.js?t=' + Date.now() + Math.random());
}

const isRegion = (el) =>
  el.getAttribute('tabindex') === '0' && el.getAttribute('role') === 'region' && el.hasAttribute('aria-label');

describe('scroll-regions.js without ResizeObserver', () => {
  beforeEach(() => {
    delete window.ResizeObserver;
    document.body.innerHTML = '';
  });

  it('makes overflowing code, tables and diagrams focusable regions with a name', async () => {
    const wideCode = code({ scrollWidth: 900 });
    const wideTable = table({ scrollWidth: 900 });
    const wideDiagram = diagram({ scrollWidth: 900 });
    await loadScript();

    expect([wideCode, wideTable, wideDiagram].map(isRegion)).toEqual([true, true, true]);
    expect(wideCode.getAttribute('aria-label')).toBe('Code (scrollable)');
    expect(wideTable.getAttribute('aria-label')).toBe('Table (scrollable)');
    expect(wideDiagram.getAttribute('aria-label')).toBe('Diagram (scrollable)');
  });

  it('leaves boxes that fit out of the tab order and unnamed', async () => {
    const fitting = [code({ scrollWidth: 600 }), table({ scrollWidth: 400 }), diagram({ scrollWidth: 600 })];
    await loadScript();

    for (const el of fitting) {
      expect(el.hasAttribute('tabindex')).toBe(false);
      expect(el.hasAttribute('role')).toBe(false);
      expect(el.hasAttribute('aria-label')).toBe(false);
    }
  });

  it('ignores other scrolling elements, such as a plain <pre> without Shiki', async () => {
    const plain = box('<pre><code>x</code></pre>', { scrollWidth: 900 });
    await loadScript();

    expect(plain.hasAttribute('tabindex')).toBe(false);
  });

  it('re-evaluates on window resize', async () => {
    const block = code({ scrollWidth: 700, clientWidth: 800 });
    await loadScript();
    expect(block.hasAttribute('tabindex')).toBe(false);

    block.resize(350); // phone width
    window.dispatchEvent(new Event('resize'));
    expect(isRegion(block)).toBe(true);

    block.resize(800); // back to desktop
    window.dispatchEvent(new Event('resize'));
    expect(block.hasAttribute('tabindex')).toBe(false);
    expect(block.hasAttribute('role')).toBe(false);
    expect(block.hasAttribute('aria-label')).toBe(false);
  });
});

describe('scroll-regions.js with ResizeObserver', () => {
  beforeEach(() => {
    observed = [];
    window.ResizeObserver = class {
      constructor(callback) {
        observerCallback = callback;
      }
      observe(el) {
        observed.push(el);
      }
    };
    document.body.innerHTML = '';
  });

  afterEach(() => {
    delete window.ResizeObserver;
  });

  it('observes every box and updates the ones reported as resized', async () => {
    const block = code({ scrollWidth: 700, clientWidth: 800 });
    const wideTable = table({ scrollWidth: 900 });
    await loadScript();
    expect(observed).toEqual([block, wideTable]);

    // The initial notification ResizeObserver sends for each observed box
    observerCallback([{ target: block }, { target: wideTable }]);
    expect(block.hasAttribute('tabindex')).toBe(false);
    expect(isRegion(wideTable)).toBe(true);

    block.resize(350);
    observerCallback([{ target: block }]);
    expect(isRegion(block)).toBe(true);
  });

  it('does nothing on a page without such boxes', async () => {
    await loadScript();
    expect(observed).toEqual([]);
  });
});
