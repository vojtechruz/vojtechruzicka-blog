import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { globSync } from 'glob';
import { SITE_DIR } from './helpers.js';

const headers = readFileSync(`${SITE_DIR}/_headers`, 'utf-8');
const cspLines = headers.split(/\r?\n/).filter((line) => line.trim().startsWith('Content-Security-Policy:'));
const csp = (cspLines[0] ?? '').replace(/^\s*Content-Security-Policy:\s*/, '');

/** Source list of a CSP directive, as an array of tokens. */
function sources(directive) {
  const match = new RegExp(`(?:^|;)\\s*${directive}\\s+([^;]+)`).exec(csp);
  return match ? match[1].trim().split(/\s+/) : [];
}

const htmlFiles = globSync(`${SITE_DIR}/**/*.html`);

describe('Security headers (Content Security Policy)', () => {
  it('keeps the entire policy on a single line', () => {
    // Cloudflare's _headers parser silently drops multiline header values — while the CSP
    // was wrapped across lines it was not served at all (see the comment in src/static/_headers).
    // If someone re-wraps it, the trailing directives land outside the header line.
    expect(cspLines, 'expected exactly one Content-Security-Policy line').toHaveLength(1);
    for (const directive of [
      'default-src',
      'base-uri',
      'form-action',
      'frame-ancestors',
      'object-src',
      'img-src',
      'font-src',
      'style-src',
      'script-src',
      'connect-src',
      'frame-src',
      'media-src',
    ]) {
      expect(csp, `${directive} must be on the same line as the header name`).toContain(directive);
    }
  });

  it('allowlists every external script and iframe host used in the built site', () => {
    const used = { 'script-src': new Set(), 'frame-src': new Set() };
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      for (const [, tag, origin] of html.matchAll(/<(script|iframe)\b[^>]*\ssrc="(https?:\/\/[^/"]+)/g)) {
        used[tag === 'script' ? 'script-src' : 'frame-src'].add(origin);
      }
    }
    // Sanity check that the scan sees anything at all (Plausible loads on every page).
    expect(used['script-src'].size, 'expected at least one external script in the build output').toBeGreaterThan(0);

    for (const [directive, origins] of Object.entries(used)) {
      for (const origin of origins) {
        expect(sources(directive), `built pages load ${origin}, which is missing from ${directive}`).toContain(origin);
      }
    }
  });

  it('keeps giscus.app in frame-src even though no static page references it', () => {
    // The comments iframe is created client-side by the giscus script, so it never appears
    // in built HTML — a "remove unused sources" cleanup based on page content would break comments.
    expect(sources('frame-src')).toContain('https://giscus.app');
  });

  it('allowlists every inline event handler by its hash', () => {
    // config/html-transform/lqip-svg-transform.js emits onload="this.dataset.loaded=1;" on every
    // image. Editing that string without regenerating the sha256 in the CSP would make browsers
    // block the handler, leaving LQIP placeholders permanently visible — silently, and only in
    // production, because local dev never serves _headers. Same for any handler added later.
    // (The inline Plausible snippet has the equivalent guard in tests/analytics.test.js.)
    const handlers = new Set();
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      // Anchored to a real tag start: an unescaped "<tagname" cannot occur inside escaped
      // code samples, so attribute-lookalikes in post content do not match.
      for (const [, code] of html.matchAll(/<[a-z][^>]*\son[a-z]+="([^"]+)"/g)) {
        handlers.add(code);
      }
    }
    expect(handlers.size, 'expected at least the LQIP onload handler in the build output').toBeGreaterThan(0);
    expect(sources('script-src'), "inline event handlers need 'unsafe-hashes'").toContain("'unsafe-hashes'");

    for (const code of handlers) {
      const hash = `'sha256-${createHash('sha256').update(code, 'utf-8').digest('base64')}'`;
      expect(sources('script-src'), `inline handler "${code}" needs ${hash} in script-src`).toContain(hash);
    }
  });
});
