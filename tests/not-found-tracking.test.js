/**
 * @vitest-environment jsdom
 *
 * The 404 page reports the missing URL as a Plausible `404` event (src/scripts/analytics.js),
 * so not-found hits can be filtered instead of mixing with real pageviews.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { SITE_DIR, loadPageHtml } from './helpers.js';

const bundle = readFileSync(`${SITE_DIR}/scripts/analytics.js`, 'utf-8');

/** Run the built bundle against the current document, as the browser would. */
function runBundle() {
  new Function(bundle)();
}

/** Events handed to Plausible, as [name, options] pairs. */
const queued = () => window.plausible.q.map(([name, options]) => [name, options]);

describe('404 tracking', () => {
  beforeEach(() => {
    // Stand in for the inline queue stub from components/analytics.njk
    window.plausible = (...args) => window.plausible.q.push(args);
    window.plausible.q = [];
    window.cspViolations = [];
  });

  it('marks the built 404 page for the tracker', () => {
    expect(loadPageHtml('/404.html')).toContain('data-not-found');
  });

  it('sends a non-interactive 404 event with the missing path', () => {
    window.history.replaceState(null, '', '/topics/java-fx/?ref=x');
    document.body.innerHTML = '<div class="error-404" data-not-found></div>';

    runBundle();

    expect(queued()).toEqual([['404', { props: { path: '/topics/java-fx/' }, interactive: false }]]);
  });

  it('sends nothing on regular pages', () => {
    window.history.replaceState(null, '', '/css-flexbox/');
    document.body.innerHTML = '<main><h1>CSS Flexbox</h1></main>';

    runBundle();

    expect(queued()).toEqual([]);
  });
});
