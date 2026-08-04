import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
// Nunjucks is Eleventy's engine for the .njk templates this site is built from, so it is always
// installed alongside @11ty/eleventy. Rendering the component standalone lets the environment
// gating be tested for all three environments from a single build.
import nunjucks from 'nunjucks';
import siteConfig from '../src/_data/site.js';
import { loadPage, SITE_DIR } from './helpers.js';

const TEMPLATE_PATH = 'src/_includes/components/analytics.njk';
const template = readFileSync(TEMPLATE_PATH, 'utf-8');

/** Pages that must carry analytics in the build output. */
const PAGES = ['/', '/java-records/'];

const { scriptUrl, previewScriptUrl } = siteConfig.plausible;

/**
 * Render the analytics component on its own for a given environment.
 * @param {{isLocalDevelopment?: boolean, isPreview?: boolean}} env
 */
function render({ isLocalDevelopment = false, isPreview = false } = {}) {
  return nunjucks.renderString(template, { isLocalDevelopment, isPreview, site: siteConfig });
}

/**
 * sha256 of the inline Plausible init snippet, in the form CSP expects.
 * Mirrors how the hash in src/static/_headers was generated: the exact text between
 * <script> and </script>, with LF line endings.
 */
function inlineSnippetHash() {
  const [, snippet] = /<script>([\s\S]*?)<\/script>/.exec(template.replace(/\r\n/g, '\n'));
  return `sha256-${createHash('sha256').update(snippet, 'utf-8').digest('base64')}`;
}

describe('Analytics (Plausible)', () => {
  describe('Environment gating', () => {
    it('emits nothing at all during local development', () => {
      // Local page views must never reach production stats — not even the queue stub.
      for (const isPreview of [false, true]) {
        expect(render({ isLocalDevelopment: true, isPreview }).trim()).toBe('');
      }
    });

    it('loads the preview script on preview deploys', () => {
      const html = render({ isPreview: true });

      expect(html).toContain(previewScriptUrl);
      expect(html, 'preview deploys must not report into production stats').not.toContain(scriptUrl);
    });

    it('loads the production script outside preview and local development', () => {
      const html = render({ isPreview: false });

      expect(html).toContain(scriptUrl);
      expect(html).not.toContain(previewScriptUrl);
    });
  });

  describe('Configuration', () => {
    it('keeps the script URLs in site.js rather than hardcoded in the template', () => {
      for (const url of [scriptUrl, previewScriptUrl]) {
        expect(url).toMatch(/^https:\/\/plausible\.io\/js\/\S+\.js$/);
        expect(template, `${url} should be read from site.js, not inlined in the template`).not.toContain(url);
      }
    });

    it('uses a distinct script per environment', () => {
      // Same script in both slots would silently merge preview traffic into production stats.
      expect(previewScriptUrl).not.toBe(scriptUrl);
    });
  });

  describe('Build output', () => {
    it('loads exactly one Plausible script, matching the configured URL', () => {
      for (const path of PAGES) {
        const $ = loadPage(path);
        const sources = $('script[src*="plausible.io"]')
          .map((_, el) => $(el).attr('src'))
          .get();

        expect(sources, `${path} should load exactly one Plausible script`).toHaveLength(1);
        expect([scriptUrl, previewScriptUrl], `${path}: ${sources[0]} is not a configured script URL`).toContain(
          sources[0],
        );
      }
    });

    it('registers the queue stub inline so events fired before the script loads are kept', () => {
      for (const path of PAGES) {
        const $ = loadPage(path);
        const inline = $('script:not([src])')
          .map((_, el) => $(el).html())
          .get()
          .join('\n');

        expect(inline, `${path} is missing the Plausible queue stub`).toContain('window.plausible=window.plausible||');
        expect(inline).toContain('plausible.init()');
      }
    });

    it('loads the custom event wrapper', () => {
      for (const path of PAGES) {
        const $ = loadPage(path);

        expect($('script[src^="/scripts/analytics.js"]').length, `${path} is missing analytics.js`).toBe(1);
      }
    });
  });

  describe('Content Security Policy', () => {
    it('allowlists the inline snippet by its current hash', () => {
      // The CSP carries a sha256 of the inline snippet. Editing the snippet without regenerating
      // the hash would make the browser block it, silently killing all analytics in production.
      const headers = readFileSync(`${SITE_DIR}/_headers`, 'utf-8');

      expect(headers, `CSP is missing the hash of the inline snippet in ${TEMPLATE_PATH} — regenerate it`).toContain(
        inlineSnippetHash(),
      );
    });

    it('allowlists the Plausible origin for both loading and reporting', () => {
      const headers = readFileSync(`${SITE_DIR}/_headers`, 'utf-8');
      const [, csp] = /Content-Security-Policy:\s*(.+)/.exec(headers);
      const directive = (name) => new RegExp(`${name}[^;]*https://plausible\\.io`).test(csp);

      expect(directive('script-src'), 'script-src must allow the Plausible script to load').toBe(true);
      expect(directive('connect-src'), 'connect-src must allow events to be reported').toBe(true);
    });
  });
});
