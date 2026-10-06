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

    // The page URL without its query string: a visitor who arrived via ?utm_source=… must not pass
    // the tracking parameters on. Not <link rel="canonical">: on an archived copy it points to the
    // current version of the post (different sections), and on a preview deploy to a production
    // URL where a draft does not exist yet.
    const url = `${location.origin}${location.pathname}${href}`;
    copyWithFeedback(anchor, url, { copiedAriaLabel: 'Link copied' });
  });
})();
