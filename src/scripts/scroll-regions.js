// Code blocks, tables and Mermaid diagrams scroll horizontally inside their box when they are wider
// than the column. Chromium lets the keyboard focus such a box on its own; Firefox and Safari do not,
// so there a keyboard user could never reach the end of a long line (WCAG 2.1.1). This makes exactly
// the boxes that currently overflow focusable (Tab, then arrow keys scroll) and names them for screen
// readers. Boxes that fit stay out of the tab order (the build strips Shiki's tabindex from every
// <pre>, see config/html-transform/remove-code-tabindex.js), and the set is re-evaluated whenever a
// box changes size (rotation, window resize). Without JS the boxes still scroll by mouse and touch.
(() => {
  const KINDS = [
    ['pre.shiki', 'Code'],
    ['.table-wrapper', 'Table'],
    ['.mermaid-diagram', 'Diagram'],
  ];

  const regions = KINDS.flatMap(([selector, label]) =>
    Array.from(document.querySelectorAll(selector), (el) => ({ el, label: `${label} (scrollable)` })),
  );
  if (!regions.length) {
    return;
  }

  function update({ el, label }) {
    const overflows = el.scrollWidth > el.clientWidth;
    if (overflows === el.hasAttribute('data-scroll-region')) {
      return;
    }
    if (overflows) {
      el.setAttribute('data-scroll-region', '');
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'region');
      el.setAttribute('aria-label', label);
    } else {
      el.removeAttribute('data-scroll-region');
      el.removeAttribute('tabindex');
      el.removeAttribute('role');
      el.removeAttribute('aria-label');
    }
  }

  const updateAll = () => regions.forEach(update);

  if ('ResizeObserver' in window) {
    // Also fires once per box right after observe(), which does the initial pass
    const byElement = new Map(regions.map((region) => [region.el, region]));
    const observer = new ResizeObserver((entries) => entries.forEach(({ target }) => update(byElement.get(target))));
    regions.forEach(({ el }) => observer.observe(el));
  } else {
    updateAll();
    window.addEventListener('resize', updateAll);
  }
})();
