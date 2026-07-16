import { getMarkdownParser } from '../utils/markdown-parser.js';

export default (className, icon) => {
  return async (content) => {
    const md = await getMarkdownParser();
    return `
<div class="msg ${className}">
  ${icon}
  <div class="msg-content">
    ${md.render(content)}
  </div>
</div>
`;
  };
};
