import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import callout from '../config/shortcodes/callout.js';
import { loadPage } from './helpers.js';

const CONTENT = `
- First mitigation
- Second mitigation

Some *closing* paragraph.
`;

describe('callout shortcode', () => {
  it('renders an aside with the variant class, title and icon', async () => {
    const output = await callout(CONTENT, 'success', 'How to prevent it');
    const $ = cheerio.load(output);

    const aside = $('aside.callout.callout--success');
    expect(aside.length).toBe(1);
    expect(aside.find('.callout-title').text()).toBe('How to prevent it');
    expect(aside.find('.callout-title svg[aria-hidden="true"]').length).toBe(1);
  });

  it('renders inner content as markdown', async () => {
    const output = await callout(CONTENT, 'info', 'Note');
    const $ = cheerio.load(output);

    expect($('.callout-body ul li').length).toBe(2);
    expect($('.callout-body ul li').first().text()).toBe('First mitigation');
    expect($('.callout-body p em').text()).toBe('closing');
  });

  it.each(['success', 'info', 'warning', 'error', 'update'])('supports the %s variant', async (variant) => {
    const output = await callout('Text', variant, 'Title');
    const $ = cheerio.load(output);

    expect($(`aside.callout--${variant}`).length).toBe(1);
  });

  it('throws on an unknown variant', async () => {
    await expect(callout('Text', 'purple', 'Title')).rejects.toThrow(/Unknown callout variant "purple"/);
  });
});

describe('callouts in built output', () => {
  it('renders the OWASP mitigation callouts', () => {
    const $ = loadPage('/owasp-top-10-2025/');

    const callouts = $('aside.callout.callout--success');
    expect(callouts.length).toBe(5);
    callouts.each((_, el) => {
      expect($(el).find('.callout-title').text()).toBe('How to prevent it');
      expect($(el).find('.callout-body ul li').length).toBeGreaterThan(0);
    });
  });
});
