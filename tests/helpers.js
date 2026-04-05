import { readFileSync } from 'fs';
import { existsSync } from 'fs';
import * as cheerio from 'cheerio';
import matter from 'gray-matter';
import { globSync } from 'glob';

/** Directory where the built site lives */
export const SITE_DIR = '_site';

/**
 * Load and parse an HTML file from the build output.
 * @param {string} urlPath – URL path, e.g. '/break-java-generics-naming-convention/'
 * @returns {cheerio.CheerioAPI}
 */
export function loadPage(urlPath) {
  const filePath = `${SITE_DIR}${urlPath}index.html`;
  if (!existsSync(filePath)) {
    throw new Error(`Built HTML not found: ${filePath}. Run "npm run build" first.`);
  }
  const html = readFileSync(filePath, 'utf-8');
  return cheerio.load(html);
}

/**
 * Load the raw HTML string for a page.
 * @param {string} urlPath
 * @returns {string}
 */
export function loadPageHtml(urlPath) {
  const filePath = `${SITE_DIR}${urlPath}index.html`;
  return readFileSync(filePath, 'utf-8');
}

/**
 * Get all post Markdown files with parsed frontmatter.
 * @returns {Array<{filePath: string, frontmatter: Record<string, any>}>}
 */
export function getAllPosts() {
  const files = globSync('src/posts/**/index.md');
  return files.map((filePath) => {
    const raw = readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    return { filePath, frontmatter: data };
  });
}
