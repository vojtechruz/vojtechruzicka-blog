// config/html-transform/wrap-tables-transform.js
// Wraps every content <table> in <div class="table-wrapper"> so wide tables
// (markdown tables have min-width: 36rem) scroll horizontally on narrow screens
// instead of overflowing the page. Idempotent: already-wrapped tables are skipped.

import { load } from 'cheerio';

export function wrapTablesTransform(content, outputPath) {
  if (!outputPath || !outputPath.endsWith('.html') || !content.includes('<table')) {
    return content;
  }

  const $ = load(content);
  const $tables = $('table').filter((_, el) => !$(el).parent().hasClass('table-wrapper'));

  if ($tables.length === 0) {
    return content;
  }

  $tables.wrap('<div class="table-wrapper"></div>');
  return $.html();
}
