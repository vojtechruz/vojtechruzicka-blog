import { getMarkdownParser } from '../utils/markdown-parser.js';

export default (className) => {
  return async (content) => {
    const md = await getMarkdownParser();
    return `
<div class="msg ${className}">
  ${md.render(content)}
</div>
`;
  };
};
