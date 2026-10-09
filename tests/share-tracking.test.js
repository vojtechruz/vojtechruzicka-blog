/**
 * @vitest-environment jsdom
 *
 * Both share buttons (components/social-share.njk) report one Plausible event, `Share Post Click`,
 * told apart by `type` — a single goal covers every share.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { SITE_DIR, loadPageHtml } from './helpers.js';

const bundle = readFileSync(`${SITE_DIR}/scripts/analytics.js`, 'utf-8');

/** Events handed to Plausible, as [name, props] pairs. */
const queued = () => window.plausible.q.map(([name, options]) => [name, options.props]);

describe('share tracking', () => {
  beforeAll(() => {
    window.plausible = (...args) => window.plausible.q.push(args);
    window.plausible.q = [];
    window.cspViolations = [];
    // The click listener lives on document, so one run of the bundle serves every test
    new Function(bundle)();
  });

  beforeEach(() => {
    window.plausible.q = [];
    window.history.replaceState(null, '', '/css-flexbox/');
    // The real buttons from a built post, so a renamed class or id breaks the test
    const share = /<nav class="social-share"[\s\S]*?<\/nav>/.exec(loadPageHtml('/css-flexbox/'));
    document.body.innerHTML = share[0];
  });

  it('reports copying the post link as Share Post Click', () => {
    document.querySelector('.share-copy').click();
    expect(queued()).toEqual([['Share Post Click', { type: 'Copy Post Link', shareCopyUrl: '/css-flexbox/' }]]);
  });

  it('reports the native share button as Share Post Click', () => {
    document.querySelector('#native-share-button').click();
    expect(queued()).toEqual([['Share Post Click', { type: 'Native Share', shareCopyUrl: '/css-flexbox/' }]]);
  });
});
