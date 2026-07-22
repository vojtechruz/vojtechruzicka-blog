import { copyWithFeedback } from './clipboard.js';

// Heading permalink anchors (the gutter icon markdown-it-anchor adds next to
// h2-h4). Clicking still follows the in-page #fragment link (updates the URL
// and scrolls); on top of that we copy the absolute deep-link to the clipboard
// so the `title="Copy link to this section"` affordance is truthful. The
// `.copied` feedback matches the social-share copy button (see clipboard.js).
(() => {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a.header-anchor');
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) {
      return;
    }

    const url = new URL(href, location.href).href;
    copyWithFeedback(anchor, url, { copiedAriaLabel: 'Link copied' });
  });
})();
