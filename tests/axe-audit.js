import { JSDOM } from 'jsdom';
import axe from 'axe-core';
import { loadPageHtml } from './helpers.js';

// axe-core run over one built page inside jsdom, shared by tests/a11y.test.js (one page of every
// kind) and scripts/a11y-all.mjs (every page of the build).

// Layout- or colour-dependent rules jsdom cannot evaluate meaningfully.
const RULES_NEEDING_A_RENDERER = ['color-contrast', 'color-contrast-enhanced', 'scrollable-region-focusable'];

export async function audit(urlPath) {
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
  window.eval(axe.source);

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

export function describeViolations(violations) {
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
