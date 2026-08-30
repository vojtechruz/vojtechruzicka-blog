/**
 * @vitest-environment jsdom
 *
 * The site has no CSP `report-uri` endpoint, so violations are reported as Plausible events
 * instead (see docs/SECURITY-HEADERS.md). This runs the built bundle to check that pipeline:
 * inline buffer -> drain -> filter -> `CSP Violation` event on the Plausible queue.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';

const bundle = readFileSync(`${SITE_DIR}/scripts/analytics.js`, 'utf-8');

/** A minimal stand-in for SecurityPolicyViolationEvent — only the fields the reporter reads. */
function violation(props) {
  return { blockedURI: '', effectiveDirective: '', violatedDirective: '', ...props };
}

/** Run the bundle against the current window, as the browser would. */
function runBundle() {
  new Function(bundle)();
}

/** The events the bundle handed to Plausible, as [name, props] pairs. */
function reported() {
  return window.plausible.q.map(([name, options]) => [name, options.props]);
}

describe('CSP violation reporting', () => {
  beforeEach(() => {
    // Stand in for the inline queue stub from components/analytics.njk.
    window.plausible = (...args) => window.plausible.q.push(args);
    window.plausible.q = [];
  });

  it('reports violations buffered before the bundle ran, and live ones after', () => {
    window.cspViolations = [violation({ blockedURI: 'https://evil.test/a.js?x=1', effectiveDirective: 'script-src' })];

    runBundle();
    window.cspViolations.push(violation({ effectiveDirective: 'style-src-elem' }));

    expect(reported()).toEqual([
      // The query string is dropped: it only fragments otherwise identical reports.
      ['CSP Violation', { directive: 'script-src', blocked: 'https://evil.test/a.js', page: '/' }],
      ['CSP Violation', { directive: 'style-src-elem', blocked: 'inline', page: '/' }],
    ]);
  });

  it('ignores violations caused by browser extensions', () => {
    window.cspViolations = ['chrome-extension', 'moz-extension', 'safari-web-extension', 'resource'].map((scheme) =>
      violation({ blockedURI: `${scheme}://abc/injected.js`, effectiveDirective: 'script-src' }),
    );

    runBundle();

    expect(reported()).toEqual([]);
  });

  it('deduplicates and caps reports, so one broken directive cannot flood the stats', () => {
    window.cspViolations = [
      ...Array.from({ length: 3 }, () =>
        violation({ blockedURI: 'https://a.test/x.js', effectiveDirective: 'script-src' }),
      ),
      ...Array.from({ length: 9 }, (_, i) =>
        violation({ blockedURI: `https://b${i}.test/x.png`, effectiveDirective: 'img-src' }),
      ),
    ];

    runBundle();

    expect(reported()).toHaveLength(5);
    expect(new Set(reported().map(([, props]) => props.blocked)).size, 'duplicates were reported').toBe(5);
  });
});
