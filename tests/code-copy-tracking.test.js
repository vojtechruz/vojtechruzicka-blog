/**
 * @vitest-environment jsdom
 *
 * A click on a code block's copy button reports `Code Block Copy Click` with the page path, so the
 * stats show which posts readers copy code from.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { SITE_DIR, loadPageHtml } from './helpers.js';

const bundle = readFileSync(`${SITE_DIR}/scripts/analytics.js`, 'utf-8');
const PAGE = '/css-flexbox/';

/** Events handed to Plausible, as [name, props] pairs. */
const queued = () => window.plausible.q.map(([name, options]) => [name, options.props]);

describe('code copy tracking', () => {
  beforeAll(() => {
    window.plausible = (...args) => window.plausible.q.push(args);
    window.plausible.q = [];
    window.cspViolations = [];
    // The click listener lives on document, so one run of the bundle serves every test
    new Function(bundle)();
  });

  beforeEach(() => {
    window.plausible.q = [];
    window.history.replaceState(null, '', PAGE);
    // A real code block from a built post, so a renamed class breaks the test
    const block = /<div class="code-block-container"[\s\S]*?<\/pre>[\s\S]*?<\/button>\s*<\/div>/.exec(
      loadPageHtml(PAGE),
    );
    document.body.innerHTML = block[0];
  });

  it('reports a click on the copy button, including one on its icon', () => {
    document.querySelector('.copy-code-button').click();
    document.querySelector('.copy-code-button svg').dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(queued()).toEqual([
      ['Code Block Copy Click', { codeBlockUrl: PAGE }],
      ['Code Block Copy Click', { codeBlockUrl: PAGE }],
    ]);
  });

  it('does not report a click inside the code itself', () => {
    document.querySelector('pre').click();
    expect(queued()).toEqual([]);
  });
});
