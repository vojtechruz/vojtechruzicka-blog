import { describe, it, expect } from 'vitest';
import { audit, describeViolations } from './axe-audit.js';

// Automated accessibility audit of built pages with axe-core, run inside jsdom.
// It complements the Lighthouse a11y gate in CI (4 pages, score-based) with a
// zero-violations rule on one page of every kind. jsdom has no layout engine,
// so rules that need rendered geometry or computed colours are excluded; those
// (colour contrast in particular) stay with Lighthouse and the manual pass.
// The same audit runs over every built page with `npm run a11y:all` (scripts/a11y-all.mjs).

const PAGES = [
  '/',
  '/pages/2/',
  '/about/',
  '/topics/',
  '/topics/java/',
  '/series/',
  '/series/angular-tutorial/',
  '/css-flexbox/',
  '/angular/01-getting-started/',
  '/documenting-angular-apps-with-typedoc-compodoc-and-angulardoc/', // <video> embeds
  '/search/',
  '/archive/',
  '/archive/chrome-audit-lighthouse-2026-05/',
  '/404.html', // two search forms (header + page): their landmarks must have distinct names
];

// Both tests below read the same run of a page
const audits = new Map();
const auditOnce = (url) => {
  if (!audits.has(url)) {
    audits.set(url, audit(url));
  }
  return audits.get(url);
};

describe('axe-core accessibility audit', () => {
  it.each(PAGES)('%s has no WCAG A/AA or best-practice violations', async (url) => {
    const { violations } = await auditOnce(url);
    expect(violations, `\n${describeViolations(violations)}`).toEqual([]);
  });

  it.each(PAGES)('%s runs every axe rule without an error', async (url) => {
    const { errored } = await auditOnce(url);
    expect(errored).toEqual([]);
  });
});
