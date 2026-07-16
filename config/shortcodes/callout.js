import { getMarkdownParser } from '../utils/markdown-parser.js';
import { readableDateUTC } from '../utils/formatting.js';
import { shieldCheck, infoCircle, alertTriangle, alertOctagon, refreshCw } from '../utils/icons.js';

const ICONS = {
  success: shieldCheck,
  info: infoCircle,
  warning: alertTriangle,
  error: alertOctagon,
  update: refreshCw,
};

/** "2021" -> "2021", "2021-11" -> "November 2021", "2021-11-05" -> "November 5, 2021" */
function formatCalloutDate(date) {
  if (/^\d{4}$/.test(date)) {
    return date;
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const d = new Date(`${date}-01T00:00:00Z`);
    return `${d.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
  }
  return readableDateUTC(date);
}

export default async (content, variant, title, date) => {
  if (!ICONS[variant]) {
    throw new Error(`Unknown callout variant "${variant}". Use one of: ${Object.keys(ICONS).join(', ')}`);
  }
  const md = await getMarkdownParser();
  // YYYY, YYYY-MM and YYYY-MM-DD are all valid <time datetime> values
  const dateHtml = date ? `<time class="callout-date" datetime="${date}">${formatCalloutDate(date)}</time>` : '';
  return `
<aside class="callout callout--${variant}">
  <p class="callout-title">${ICONS[variant]}${title}${dateHtml}</p>
  <div class="callout-body">
    ${md.render(content)}
  </div>
</aside>
`;
};
