import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { source as axeSource } from 'axe-core';
import { loadPageHtml } from './helpers.js';

// Automated accessibility audit of built pages with axe-core, run inside jsdom.
// It complements the Lighthouse a11y gate in CI (4 pages, score-based) with a
// zero-violations rule on one page of every kind. jsdom has no layout engine,
// so rules that need rendered geometry or computed colours are excluded; those
// (colour contrast in particular) stay with Lighthouse and the manual pass.

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

// Layout- or colour-dependent rules jsdom cannot evaluate meaningfully.
const RULES_NEEDING_A_RENDERER = ['color-contrast', 'color-contrast-enhanced', 'scrollable-region-focusable'];

async function audit(urlPath) {
  const dom = new JSDOM(loadPageHtml(urlPath), {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: `https://www.vojtechruzicka.com${urlPath}`,
  });
  const { window } = dom;
  // axe's modal check calls elementFromPoint, which jsdom lacks; without it page-level rules
  // (landmark-one-main, page-has-heading-one) throw and end up in `incomplete` instead of running.
  // null means "nothing covers that point", so no modal counts as open.
  window.document.elementFromPoint = () => null;
  window.eval(axeSource);

  try {
    const results = await window.axe.run(window.document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      rules: Object.fromEntries(RULES_NEEDING_A_RENDERER.map((rule) => [rule, { enabled: false }])),
      resultTypes: ['violations', 'incomplete'],
    });
    return { violations: results.violations, errored: erroredRules(results.incomplete) };
  } finally {
    window.close();
  }
}

// Rules axe could not run because they threw. axe files them under `incomplete`, so without this
// check a broken rule would pass silently. Other incomplete results (cross-origin CodePen frames,
// video captions) need a human and are deliberately not asserted.
function erroredRules(incomplete) {
  return incomplete.flatMap((result) => {
    const error = result.nodes
      .flatMap((node) => [...node.any, ...node.all, ...node.none])
      .find((check) => check.id === 'error-occurred');
    return error ? [`${result.id}: ${error.data?.message ?? 'unknown error'}`] : [];
  });
}

function describeViolations(violations) {
  return violations
    .map((v) => {
      const targets = v.nodes
        .slice(0, 3)
        .map((node) => node.target.join(' '))
        .join(' | ');
      return `${v.id} [${v.impact}] ${v.help} (${v.nodes.length}×): ${targets}`;
    })
    .join('\n');
}

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
