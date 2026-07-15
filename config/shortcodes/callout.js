import { getMarkdownParser } from '../utils/markdown-parser.js';
import { shieldCheck, infoCircle, alertTriangle, alertOctagon, refreshCw } from '../utils/icons.js';

const ICONS = {
  success: shieldCheck,
  info: infoCircle,
  warning: alertTriangle,
  error: alertOctagon,
  update: refreshCw,
};

export default async (content, variant, title) => {
  if (!ICONS[variant]) {
    throw new Error(`Unknown callout variant "${variant}". Use one of: ${Object.keys(ICONS).join(', ')}`);
  }
  const md = await getMarkdownParser();
  return `
<aside class="callout callout--${variant}">
  <p class="callout-title">${ICONS[variant]}${title}</p>
  <div class="callout-body">
    ${md.render(content)}
  </div>
</aside>
`;
};
