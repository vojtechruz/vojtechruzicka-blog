import { describe, it, expect } from 'vitest';
import codepen from '../config/shortcodes/codepen.js';

describe('codepen shortcode', () => {
  it('should construct embed URL from slug', () => {
    const result = codepen('yMdQpQ');
    expect(result).toContain('src="https://codepen.io/vojtechruz/embed/yMdQpQ?default-tab=result&height=400"');
  });

  it('should show caption by default', () => {
    const result = codepen('slug', 'A Cool Pen');
    expect(result).toContain('<figcaption');
    expect(result).toContain('A Cool Pen');
    expect(result).toContain('aria-labelledby');
  });

  it('should hide caption if requested', () => {
    const result = codepen('slug', 'A Cool Pen', 400, 'result', false);
    expect(result).not.toContain('<figcaption');
    expect(result).toContain('title="A Cool Pen"');
  });
});
