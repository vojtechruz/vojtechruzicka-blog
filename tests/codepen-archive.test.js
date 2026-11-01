import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { globSync } from 'glob';
import { unzipSync, strFromU8 } from 'fflate';
import { codepenCalls } from '../config/shortcodes/codepen.js';
import { BACKUP_FILES, backupDir, buildArchive, splitResult, standalonePage } from '../config/codepen-archive.js';
import { loadPage, SITE_DIR } from './helpers.js';

// A trimmed cdpn.io result page: CodePen's own assets around the pen's code
const RESULT_PAGE = `<!DOCTYPE html><html><head>
  <link rel="icon" href="https://cpwebassets.codepen.io/assets/favicon/favicon.ico">
  <title>Flexbox example</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <link rel="stylesheet" href="https://cpwebassets.codepen.io/assets/editor/full.css">
  <style>.box { display: flex; }</style>
  <script>window.console = window.console || function(t) {};</script>
</head><body translate="no">
  <div class="box">1</div>
  <script src="https://cpwebassets.codepen.io/assets/common/stopExecutionOnTimeout.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
  <script id="rendered-js">
for (let i = 0; i < 3; i++) {if (window.CP.shouldStopExecution(0)) break;
  console.log(i);
}window.CP.exitedLoop(0);
  </script>
</body></html>`;

describe('splitResult', () => {
  const parts = splitResult(RESULT_PAGE);

  it("takes the pen's code and leaves CodePen's assets out", () => {
    expect(parts.title).toBe('Flexbox example');
    expect(parts.css).toBe('.box { display: flex; }');
    expect(parts.body).toBe('<div class="box">1</div>');
    expect(parts.stylesheets).toEqual(['https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css']);
    expect(parts.externalScripts).toEqual(['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js']);
  });

  it("drops CodePen's infinite-loop guard, which calls a CodePen script", () => {
    expect(parts.js).not.toContain('window.CP');
    expect(parts.js).toContain('console.log(i);');
  });

  it('makes a page that opens from its folder', () => {
    const page = standalonePage(parts, 'ExVPBzM');
    expect(page).toContain('<link rel="stylesheet" href="style.css">');
    expect(page).toContain('<script src="script.js"></script>');
    expect(page).toContain('https://codepen.io/vojtechruz/pen/ExVPBzM');
    expect(page.indexOf('normalize.min.css')).toBeLessThan(page.indexOf('href="style.css"'));
  });

  it('links no stylesheet or script the pen does not have', () => {
    const page = standalonePage({ ...parts, css: '', js: '' }, 'x');
    expect(page).not.toContain('style.css');
    expect(page).not.toContain('script.js');
  });
});

// A pen added without running `npm run codepen:backup` would live only on codepen.io
describe('codepen backups', () => {
  const pens = globSync('src/posts/**/index.md', { posix: true }).flatMap((file) =>
    codepenCalls(readFileSync(file, 'utf-8')).map(({ id }) => ({ id, dir: backupDir(dirname(file), id) })),
  );

  it.each(pens)('$id has a backup', ({ dir }) => {
    expect(existsSync(join(dir, BACKUP_FILES.html)), `${dir} missing: run npm run codepen:backup`).toBe(true);
  });
});

describe('buildArchive', () => {
  const POST = 'src/posts/css/css-position/index.md';
  const options = { inputPath: POST, slug: 'css-position', title: 'CSS Position', url: 'https://example.com/x/' };

  it('packs every demo of the article in article order, with a README', () => {
    const archive = buildArchive(options);
    const ids = codepenCalls(readFileSync(POST, 'utf-8')).map(({ id }) => id);
    expect(archive.count).toBe(ids.length);
    expect(archive.filename).toBe('css-position-examples.zip');

    const files = unzipSync(archive.bytes);
    const readme = strFromU8(files['css-position-examples/README.md']);
    expect(readme).toContain('https://example.com/x/');
    ids.forEach((id) => expect(readme).toContain(`https://codepen.io/vojtechruz/pen/${id}`));
    expect(readme).toContain('1. [Position relative](01-position-relative/index.html)');

    expect(strFromU8(files['css-position-examples/01-position-relative/index.html'])).toBe(
      readFileSync(join(backupDir(dirname(POST), ids[0]), 'index.html'), 'utf-8'),
    );
    const folders = new Set(Object.keys(files).map((name) => name.split('/')[1]));
    expect(folders.size).toBe(ids.length + 1); // + README.md
  });

  it('makes the same bytes from the same backups', () => {
    expect(buildArchive(options).bytes).toEqual(buildArchive(options).bytes);
  });

  it('is null for an article without demos', () => {
    expect(buildArchive({ ...options, inputPath: 'src/posts/css/css-printing/index.md' })).toBeNull();
  });
});

const NBSP = String.fromCharCode(0xa0);

describe('examples download on the built page', () => {
  it('offers the zip below an article with demos, with its real size', () => {
    const $ = loadPage('/css-flexbox/');
    const card = $('article .examples-download');
    expect(card.length).toBe(1);
    expect(card.attr('data-pagefind-ignore')).toBeDefined();
    const link = card.find('a.examples-download-button');
    expect(link.attr('href')).toBe('/css-flexbox/css-flexbox-examples.zip');
    expect(link.attr('download')).toBeDefined();

    const zip = `${SITE_DIR}/css-flexbox/css-flexbox-examples.zip`;
    expect(existsSync(zip)).toBe(true);
    const kB = Math.ceil(readFileSync(zip).length / 1024);
    expect(link.text()).toContain(`(${kB}${NBSP}kB)`);
    expect(card.text()).toContain('17 demos');
  });

  it('is absent from an article without demos', () => {
    expect(loadPage('/css-printing/')('.examples-download').length).toBe(0);
  });
});
