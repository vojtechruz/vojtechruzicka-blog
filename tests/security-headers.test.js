import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { globSync } from 'glob';
import { SITE_DIR, parseHeaders } from './helpers.js';

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

  it('allowlists every external host the built pages load resources from', () => {
    // A post that embeds an external <img>, <video> or stylesheet would otherwise be blocked by
    // the CSP silently, and only in production (local dev never serves _headers).
    const used = {
      'script-src': new Set(),
      'frame-src': new Set(),
      'img-src': new Set(),
      'media-src': new Set(),
      'style-src': new Set(),
    };
    const origin = (url) => /^(https?:\/\/[^/"]+)/.exec(url ?? '')?.[1];
    const attr = (tag, name) => new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
    for (const file of htmlFiles) {
      const html = readFileSync(file, 'utf-8');
      // Anchored to a real tag start, so escaped code samples in post content do not match
      for (const [tag, name] of html.matchAll(/<(script|iframe|img|video|audio|source|link)\b[^>]*>/g)) {
        const add = (directive, url) => origin(url) && used[directive].add(origin(url));
        if (name === 'script') {
          add('script-src', attr(tag, 'src'));
        } else if (name === 'iframe') {
          add('frame-src', attr(tag, 'src'));
        } else if (name === 'img') {
          add('img-src', attr(tag, 'src'));
        } else if (name === 'link') {
          if (attr(tag, 'rel') === 'stylesheet') {
            add('style-src', attr(tag, 'href'));
          }
        } else {
          // <video>/<audio>/<source>: the media itself, plus a video poster (an image)
          add('media-src', attr(tag, 'src'));
          add('img-src', attr(tag, 'poster'));
        }
      }
    }
    // Sanity check that the scan sees anything at all (Plausible loads on every page).
    expect(used['script-src'].size, 'expected at least one external script in the build output').toBeGreaterThan(0);

    for (const [directive, origins] of Object.entries(used)) {
      for (const host of origins) {
        expect(sources(directive), `built pages load ${host}, which is missing from ${directive}`).toContain(host);
      }
    }
  });

  it('keeps giscus.app in frame-src even though no static page references it', () => {
    // The comments iframe is created client-side by the giscus script, so it never appears
    // in built HTML — a "remove unused sources" cleanup based on page content would break comments.
    expect(sources('frame-src')).toContain('https://giscus.app');
  });

  it('keeps giscus.app in style-src even though no static page references it', () => {
    // The giscus script also injects <link href="https://giscus.app/default.css"> at runtime.
    // Without it every post with comments fires a CSP Violation (2026-08-30 .. 2026-09-19).
    expect(sources('style-src')).toContain('https://giscus.app');
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

describe('Security headers (site-wide block)', () => {
  const rules = parseHeaders(headers);
  const siteWide = rules['/*'] ?? [];

  // Exact values served on every response. Rationale for each (HSTS without preload, no COEP, …)
  // is in docs/SECURITY-HEADERS.md; change the value there and here together.
  const EXPECTED = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    'Timing-Allow-Origin': '*',
  };

  /** Values of a header in one rule; a header listed twice would be comma-joined by Cloudflare. */
  const valuesOf = (lines, name) =>
    lines
      .filter((line) => line.toLowerCase().startsWith(`${name.toLowerCase()}:`))
      .map((line) => line.slice(name.length + 1).trim());

  it.each(Object.entries(EXPECTED))('sets %s exactly once with the expected value', (name, value) => {
    expect(valuesOf(siteWide, name)).toEqual([value]);
  });

  it('never detaches a site-wide security header in a narrower rule, except CORP', () => {
    // `! Header` removes the header for matching paths; only Cross-Origin-Resource-Policy is
    // meant to be swapped (images and icons must be embeddable cross-origin).
    const allowed = new Set(['cross-origin-resource-policy']);
    const guarded = new Set([...Object.keys(EXPECTED), 'Content-Security-Policy'].map((n) => n.toLowerCase()));
    for (const [path, lines] of Object.entries(rules)) {
      for (const line of lines.filter((l) => l.startsWith('!'))) {
        const name = line.slice(1).trim().toLowerCase();
        if (guarded.has(name)) {
          expect(allowed.has(name), `${path} detaches ${name}`).toBe(true);
        }
      }
    }
  });

  it('stays within the Cloudflare Pages limits (100 rules, 2,000 characters per line)', () => {
    // Over the limit Cloudflare drops the rule or line without any build error.
    expect(Object.keys(rules).length).toBeLessThanOrEqual(100);
    for (const line of headers.split(/\r?\n/)) {
      expect(line.length, `line too long: ${line.slice(0, 60)}…`).toBeLessThanOrEqual(2000);
    }
  });
});
