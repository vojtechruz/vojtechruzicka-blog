import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { SITE_DIR } from './helpers.js';

/**
 * Tests for the Cloudflare/Netlify-style `_redirects` file.
 *
 * These redirects preserve inbound links from the legacy Gatsby-era URLs, so a typo
 * in a target, a renamed post, or a broken passthrough copy silently kills SEO.
 * Nothing else validates this file: linkinator only crawls HTML.
 */

const SOURCE_PATH = 'src/static/_redirects';
const BUILT_PATH = `${SITE_DIR}/_redirects`;

/** Parse non-empty, non-comment lines into { source, target, status, line } */
function parseRedirects(content) {
  return content
    .split('\n')
    .map((line, i) => ({ raw: line.trim(), lineNo: i + 1 }))
    .filter(({ raw }) => raw !== '' && !raw.startsWith('#'))
    .map(({ raw, lineNo }) => {
      const parts = raw.split(/\s+/);
      return { source: parts[0], target: parts[1], status: parts[2], lineNo };
    });
}

/** Resolve a redirect target to the built file it should be served from. */
function builtFileForTarget(target) {
  if (target === '/') {
    return `${SITE_DIR}/index.html`;
  }
  if (target.endsWith('/')) {
    return `${SITE_DIR}${target}index.html`;
  }
  // Explicit file target, e.g. /feed.xml
  if (/\.[a-z0-9]+$/i.test(target)) {
    return `${SITE_DIR}${target}`;
  }
  // Extensionless page target
  return `${SITE_DIR}${target}/index.html`;
}

const hasPlaceholder = (p) => p.includes(':') || p.includes('*');

describe('_redirects file', () => {
  it('exists in source and is copied to the build output', () => {
    expect(existsSync(SOURCE_PATH), `${SOURCE_PATH} missing`).toBe(true);
    expect(existsSync(BUILT_PATH), `${BUILT_PATH} missing - passthrough copy of src/static/ is broken`).toBe(true);
  });

  it('built copy matches the source file', () => {
    expect(readFileSync(BUILT_PATH, 'utf-8')).toBe(readFileSync(SOURCE_PATH, 'utf-8'));
  });

  const redirects = existsSync(SOURCE_PATH) ? parseRedirects(readFileSync(SOURCE_PATH, 'utf-8')) : [];

  it('contains at least one redirect rule', () => {
    expect(redirects.length).toBeGreaterThan(0);
  });

  it('every rule has a source, an absolute target, and a valid status code', () => {
    for (const { source, target, status, lineNo } of redirects) {
      expect(source, `line ${lineNo}: missing source`).toBeTruthy();
      expect(target, `line ${lineNo}: missing target`).toBeTruthy();
      expect(source.startsWith('/'), `line ${lineNo}: source must start with / (got "${source}")`).toBe(true);
      expect(target.startsWith('/'), `line ${lineNo}: target must start with / (got "${target}")`).toBe(true);
      expect(['301', '302', '200', undefined], `line ${lineNo}: unexpected status "${status}"`).toContain(status);
    }
  });

  it('every non-wildcard target resolves to a built page or file', () => {
    const checkable = redirects.filter(({ target }) => !hasPlaceholder(target));
    expect(checkable.length).toBeGreaterThan(0);

    for (const { target, lineNo } of checkable) {
      const builtFile = builtFileForTarget(target);
      expect(
        existsSync(builtFile),
        `line ${lineNo}: redirect target ${target} does not resolve to a built page (expected ${builtFile})`,
      ).toBe(true);
    }
  });

  it('no non-wildcard source shadows a real built page', () => {
    const checkable = redirects.filter(({ source }) => !hasPlaceholder(source));

    for (const { source, lineNo } of checkable) {
      const shadowed = builtFileForTarget(source.endsWith('/') ? source : `${source}/`);
      expect(
        existsSync(shadowed),
        `line ${lineNo}: redirect source ${source} collides with a real page at ${shadowed}`,
      ).toBe(false);
    }
  });

  it('has no duplicate sources', () => {
    const sources = redirects.map((r) => r.source);
    expect(new Set(sources).size, `duplicate sources found: ${sources.join(', ')}`).toBe(sources.length);
  });
});
