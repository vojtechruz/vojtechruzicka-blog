import { describe, it, expect } from 'vitest';
import info from '../config/shortcodes/info.js';
import warning from '../config/shortcodes/warning.js';
import error from '../config/shortcodes/error.js';

describe('Message Shortcodes', () => {
  it('should render info message with markdown', async () => {
    const result = await info('**Bold text**');
    expect(result).toContain('msg msg-info');
    expect(result).toContain('<strong>Bold text</strong>');
  });

  it('should render warning message with markdown', async () => {
    const result = await warning('*Italic text*');
    expect(result).toContain('msg msg-warn');
    expect(result).toContain('<em>Italic text</em>');
  });

  it('should render error message with markdown', async () => {
    const result = await error('[Link](http://example.com)');
    expect(result).toContain('msg msg-error');
    expect(result).toContain('<a href="http://example.com">Link</a>');
  });

  it('should handle multi-line markdown', async () => {
    const content = `* Item 1\n* Item 2`;
    const result = await info(content);
    expect(result).toContain('<li>Item 1</li>');
    expect(result).toContain('<li>Item 2</li>');
  });

  it('should render headings inside shortcodes', async () => {
    const content = `### Heading inside`;
    const result = await info(content);
    expect(result).toContain('<h3');
    expect(result).toContain('Heading inside</h3>');
  });
});
