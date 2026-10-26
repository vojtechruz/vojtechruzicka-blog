// Horizontal overflow check for a page open in Playwright, shared by tests/responsive-browser.test.js
// (one page of every kind) and scripts/overflow-all.mjs (every page of the build).

/**
 * How far the page scrolls sideways, and the outermost elements that stick out past the viewport.
 * Elements inside a box that scrolls on its own (code blocks, table and diagram wrappers) are fine.
 * @returns {Promise<{ overflow: number, culprits: string[] }>}
 */
export function measureOverflow(page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    const overflow = document.documentElement.scrollWidth - width;
    const culprits = [];
    if (overflow > 0) {
      const scrollsOnItsOwn = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(p).overflowX)) {
            return true;
          }
        }
        return false;
      };
      for (const el of document.body.querySelectorAll('*')) {
        if (el.getBoundingClientRect().right > width + 1 && !scrollsOnItsOwn(el)) {
          // Report the outermost offender only, not every descendant of it
          if (!culprits.some((c) => c.contains(el))) {
            culprits.push(el);
          }
        }
      }
    }
    const describe = (el) =>
      el.tagName.toLowerCase() +
      (el.id ? `#${el.id}` : '') +
      [...el.classList].map((c) => `.${c}`).join('') +
      ` (right ${Math.round(el.getBoundingClientRect().right)})`;
    return { overflow, culprits: culprits.slice(0, 5).map(describe) };
  });
}
