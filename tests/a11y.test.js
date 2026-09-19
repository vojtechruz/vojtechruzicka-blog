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
  '/search/',
  '/archive/',
  '/archive/chrome-audit-lighthouse-2026-05/',
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
  window.eval(axeSource);

  try {
    const results = await window.axe.run(window.document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      rules: Object.fromEntries(RULES_NEEDING_A_RENDERER.map((rule) => [rule, { enabled: false }])),
      resultTypes: ['violations'],
    });
    return results.violations;
  } finally {
    window.close();
  }
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

describe('axe-core accessibility audit', () => {
  it.each(PAGES)('%s has no WCAG A/AA or best-practice violations', async (url) => {
    const violations = await audit(url);
    expect(violations, `\n${describeViolations(violations)}`).toEqual([]);
  });
});
