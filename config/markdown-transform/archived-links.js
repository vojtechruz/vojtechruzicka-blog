// config/markdown-transform/archived-links.js
// Marks links to a Wayback Machine snapshot (https://web.archive.org/web/<timestamp>/<url>) so
// readers know they are leaving for an archived copy rather than the live page. Used when the
// original page is gone (docs/LINKS.md). Details in docs/LINKS.md ("Archived-link cue").
//
// The snapshot date comes from the URL's timestamp, so authors only paste the Wayback URL:
//   <a class="archived-link" title="…archived copy from March 2017…">text&#8288;<span
//     class="archived-link-cue"><span class="visually-hidden"> (archived copy, March 2017)</span></span></a>
// - the cue sits inside the link, so its text is part of the link's accessible name
// - the icon is drawn by CSS on the cue (src/styles/components/_archived-link.scss), not on
//   a::after, which the print styles use to print the link target
// - the word joiner (U+2060) keeps the icon on the same line as the last word
// - feeds ship this markup without the site CSS, so the hidden text becomes a visible
//   " (archived copy, March 2017)" there, which is the intended fallback
//
// Rendered at parse time rather than by an HTML transform so the page and the feed
// (post.templateContent, which is pre-transform) see the same markup.

const WAYBACK_URL = /^https?:\/\/web\.archive\.org\/web\/(\d{4})(\d{2})?\d*(?:[a-z_]{2,4})?\/./i;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * The snapshot date of a Wayback Machine URL as "March 2017" (or "2017" when the
 * timestamp has no month), or null when the URL is not a Wayback snapshot.
 */
export function waybackSnapshotDate(href) {
  const match = WAYBACK_URL.exec(href || '');
  if (!match) {
    return null;
  }
  const [, year, month] = match;
  const monthIndex = month ? Number(month) - 1 : -1;
  return monthIndex >= 0 && monthIndex < 12 ? `${MONTHS[monthIndex]} ${year}` : year;
}

export function archivedLinksPlugin(md) {
  md.core.ruler.push('archived_links', (state) => {
    for (const blockToken of state.tokens) {
      if (blockToken.type !== 'inline' || !blockToken.children) {
        continue;
      }
      const children = blockToken.children;
      for (let i = 0; i < children.length; i++) {
        const token = children[i];
        if (token.type !== 'link_open') {
          continue;
        }
        const date = waybackSnapshotDate(token.attrGet('href'));
        if (!date) {
          continue;
        }
        const closeIndex = children.findIndex((t, j) => j > i && t.type === 'link_close');
        if (closeIndex === -1) {
          continue;
        }

        token.attrJoin('class', 'archived-link');
        if (!token.attrGet('title')) {
          token.attrSet(
            'title',
            `The original page is no longer available. This is an archived copy from ${date} (Wayback Machine).`,
          );
        }

        const cue = new state.Token('html_inline', '', 0);
        cue.content =
          '&#8288;<span class="archived-link-cue">' +
          `<span class="visually-hidden"> (archived copy, ${date})</span></span>`;
        children.splice(closeIndex, 0, cue);
        i = closeIndex + 1;
      }
    }
  });
}
