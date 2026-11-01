// CodePen backups and the per-article "all examples" zip.
//
// Every pen used by the `codepen` shortcode has a committed backup next to its article,
// codepen/<id>/{index.html,style.css,script.js}, fetched by scripts/codepen-backup.mjs - so the demos do
// not live only on codepen.io. The build packs an article's backups into one zip
// (/<article>/<article>-examples.zip) that the post layout offers below the article
// (components/codepen-download.njk). Details in docs/CODEPEN.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import * as cheerio from 'cheerio';
import GithubSlugger from 'github-slugger';
import { zipSync, strToU8 } from 'fflate';
import { codepenCalls } from './shortcodes/codepen.js';

export const BACKUP_FILES = { html: 'index.html', css: 'style.css', js: 'script.js' };

/** Where a pen's backup lives: codepen/<id>/ next to the article's index.md. */
export const backupDir = (postDir, id) => join(postDir, 'codepen', id);

// CodePen's own additions to the result page, not part of the pen
const isCodepenAsset = (url) => /^(https?:)?\/\/([\w-]+\.)*(codepen\.io|cdpn\.io)\//.test(url);

/** The pen's parts from its result page (https://cdpn.io/<user>/fullpage/<id>). */
export function splitResult(html) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const css = $('head style')
    .map((_, el) => $(el).html().trim())
    .get()
    .filter(Boolean)
    .join('\n\n');
  // Stylesheets and scripts the pen pulls in from a CDN (CodePen's "external resources")
  const stylesheets = $('head link[rel="stylesheet"]')
    .map((_, el) => $(el).attr('href'))
    .get()
    .filter((href) => !isCodepenAsset(href));
  const externalScripts = $('script[src]')
    .map((_, el) => $(el).attr('src'))
    .get()
    .filter((src) => !isCodepenAsset(src));
  // The pen's own JS: CodePen marks it as rendered-js. Its infinite-loop guard calls a CodePen script.
  const js = $('script#rendered-js')
    .map((_, el) => $(el).html().trim())
    .get()
    .join('\n\n')
    .replace(/if \(window\.CP\.shouldStopExecution\(\d+\)\) break;\s*/g, '')
    .replace(/\s*window\.CP\.exitedLoop\(\d+\);/g, '');
  const $body = $('body').clone();
  $body.find('script').remove();
  return { title, css, js, body: $body.html().trim(), stylesheets, externalScripts };
}

/** index.html that opens straight from its folder, with style.css and script.js beside it. */
export function standalonePage({ title, css, js, body, stylesheets, externalScripts }, id) {
  const lines = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${title}</title>`,
    `  <!-- https://codepen.io/vojtechruz/pen/${id} -->`,
    ...stylesheets.map((href) => `  <link rel="stylesheet" href="${href}">`),
    css ? `  <link rel="stylesheet" href="${BACKUP_FILES.css}">` : null,
    '</head>',
    '<body>',
    body,
    ...externalScripts.map((src) => `  <script src="${src}"></script>`),
    js ? `  <script src="${BACKUP_FILES.js}"></script>` : null,
    '</body>',
    '</html>',
    '',
  ];
  return lines.filter((line) => line !== null).join('\n');
}

export const archiveFilename = (slug) => `${slug}-examples.zip`;

// Fixed entry dates: the same backups always make the same bytes (no spurious cache invalidation)
const ZIP_DATE = new Date('2020-01-01T00:00:00Z');

/**
 * The article's examples as one zip, or null when it has no pen with a backup.
 * Inside: <slug>-examples/README.md and one numbered folder per demo, in article order.
 */
export function buildArchive({ inputPath, slug, title, url }) {
  const postDir = dirname(inputPath);
  const seen = new Set();
  const pens = codepenCalls(readFileSync(inputPath, 'utf-8')).filter(({ id }) => {
    const fresh = !seen.has(id) && existsSync(join(backupDir(postDir, id), BACKUP_FILES.html));
    seen.add(id);
    return fresh;
  });
  if (!pens.length) {
    return null;
  }

  const root = `${slug}-examples`;
  const slugger = new GithubSlugger();
  const files = {};
  const readme = [
    `# Examples: ${title}`,
    '',
    `The code examples from ${url}, one folder per demo. Open a folder's index.html in a browser.`,
    '',
  ];
  pens.forEach(({ id, title: penTitle }, index) => {
    const name = penTitle || `Example ${index + 1}`;
    const folder = `${String(index + 1).padStart(2, '0')}-${slugger.slug(name).slice(0, 60).replace(/-+$/, '')}`;
    for (const file of Object.values(BACKUP_FILES)) {
      const path = join(backupDir(postDir, id), file);
      if (existsSync(path)) {
        files[`${root}/${folder}/${file}`] = [readFileSync(path), { mtime: ZIP_DATE }];
      }
    }
    readme.push(`${index + 1}. [${name}](${folder}/index.html) (on CodePen: https://codepen.io/vojtechruz/pen/${id})`);
  });
  readme.push('');
  files[`${root}/README.md`] = [strToU8(readme.join('\n')), { mtime: ZIP_DATE }];

  const hasJs = Object.keys(files).some((name) => name.endsWith(`/${BACKUP_FILES.js}`));
  return { bytes: zipSync(files, { level: 9 }), count: pens.length, hasJs, filename: archiveFilename(slug) };
}

export default function registerCodepenArchive(eleventyConfig) {
  // Archives the templates asked for in this build, written once the output exists
  const pending = new Map();

  // {{ page.inputPath | codepenArchive(page.fileSlug, title, page.url, site.url) }}
  //   -> { href, count, size, hasJs } | null
  eleventyConfig.addFilter('codepenArchive', (inputPath, slug, title, url, siteUrl) => {
    const archive = buildArchive({ inputPath, slug, title, url: new URL(url, siteUrl).href });
    if (!archive) {
      return null;
    }
    pending.set(url, archive);
    return {
      href: `${url}${archive.filename}`,
      count: archive.count,
      size: archive.bytes.length,
      hasJs: archive.hasJs,
    };
  });

  eleventyConfig.on('eleventy.after', ({ dir, results }) => {
    for (const { url, outputPath } of results) {
      const archive = pending.get(url);
      if (archive && outputPath) {
        mkdirSync(dirname(outputPath), { recursive: true });
        writeFileSync(join(dirname(outputPath), archive.filename), archive.bytes);
      }
    }
    pending.clear();
    return dir;
  });
}
