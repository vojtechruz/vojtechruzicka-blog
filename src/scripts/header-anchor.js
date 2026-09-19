import { copyWithFeedback } from './clipboard.js';

// Heading permalink anchors: the icon link markdown-it-anchor appends to every
// heading (config/utils/markdown-parser.js). Clicking still follows the
// in-page #fragment link (updates the URL, scrolls, makes the heading :target);
// on top of that we copy the absolute deep-link to the clipboard so the
// "Copy link to this section" label is truthful. The `.copied` feedback matches
// the social-share and code-block copy buttons (see clipboard.js).
//
// If the Clipboard API is unavailable (insecure context, old browser) nothing
// extra happens: the fragment navigation has already put the link in the
// address bar, which is the fallback.
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
