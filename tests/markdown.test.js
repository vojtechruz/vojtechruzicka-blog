import { describe, it, expect } from 'vitest';
import { getMarkdownParser } from '../config/utils/markdown-parser.js';

describe('Markdown Code Blocks', () => {
  it('should render code blocks without double wrapping', async () => {
    const md = await getMarkdownParser();
    const content = '```java\nSystem.out.println("Hello");\n```';
    const result = md.render(content);

    // Check it has the container
    expect(result).toContain('class="code-block-container"');

    // Check it has the Shiki pre
    expect(result).toContain('<pre class="shiki');

    // Check it does NOT have double wrapping <pre><code><div ...>
    // The start should be <div, not <pre><code><div
    expect(result.trim().startsWith('<div class="code-block-container"')).toBe(true);

    // Check that we don't have <pre><code> as immediate parent of <div>
    expect(result).not.toContain('<pre><code><div');
    expect(result).not.toContain('</div></code></pre>');
  });

  it('should handle code block language attributes correctly', async () => {
    const md = await getMarkdownParser();
    const content = '```typescript {2}\nconst x = 1;\nconst y = 2;\n```';
    const result = md.render(content);

    expect(result).toContain('class="code-block-container"');
    expect(result).toContain('data-language="typescript"');
    expect(result).toContain('<pre class="shiki');
  });

  it('should render inline code correctly', async () => {
    const md = await getMarkdownParser();
    const content = 'Use `code` here.';
    const result = md.render(content);

    expect(result).toContain('<code>code</code>');
    expect(result).not.toContain('class="code-block-container"');
  });
});
