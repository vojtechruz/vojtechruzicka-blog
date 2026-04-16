/**
 * stripPreTabindex transform
 *
 * Some syntax highlighters or Markdown plugins (including Shiki/markdown-it)
 * may generate <pre> elements with a tabindex attribute (e.g. tabindex="0").
 * These elements then become focusable via keyboard navigation — resulting in
 * invisible "tab stops" inside code blocks, which is a poor accessibility and UX experience.
 *
 * This Eleventy transform runs on the final rendered HTML and removes any
 * tabindex attributes from all <pre> elements, ensuring that code blocks
 * are not inserted into the tab order.
 */

export function stripPreTabindex(content, outputPath) {
  try {
    // Only process final HTML output
    if (!outputPath || !outputPath.endsWith('.html') || typeof content !== 'string') {
      return content;
    }

    // Remove any tabindex="..." from <pre> elements
    const sanitized = content.replace(/(<pre\b[^>]*?)\s+tabindex="[^"]*"/g, '$1');

    return sanitized;
  } catch (error) {
    console.error('stripPreTabindex transform failed:', error);
    return content;
  }
}
