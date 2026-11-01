// Backup of every pen used by the `codepen` shortcode, so the demos do not live only on codepen.io: each
// pen's result (compiled HTML, CSS and JS) is saved next to the article as codepen/<id>/ and committed.
// The build packs them into the article's "download all examples" zip (config/codepen-archive.js), and if
// CodePen ever goes away the shortcode can run the demos from here. Run by hand when a pen is added or
// changed, never in the build. Preprocessors are already compiled (SCSS arrives as CSS).
//
//   npm run codepen:backup              only pens that have no backup yet
//   npm run codepen:backup -- --force   all pens again
//   npm run codepen:backup -- ExVPBzM   just these pens (by id)
//
// Source: the result-only view on cdpn.io (the same one scripts/codepen-screenshots.mjs photographs).

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { globSync } from 'glob';
import { codepenCalls } from '../config/shortcodes/codepen.js';
import { backupDir, BACKUP_FILES, splitResult, standalonePage } from '../config/codepen-archive.js';

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((arg) => !arg.startsWith('--')));

const pens = globSync('src/posts/**/index.md', { posix: true }).flatMap((file) =>
  codepenCalls(readFileSync(file, 'utf-8')).map(({ id }) => ({ id, dir: backupDir(dirname(file), id) })),
);

const todo = pens.filter(({ id, dir }) =>
  only.size ? only.has(id) : force || !existsSync(join(dir, BACKUP_FILES.html)),
);
if (only.size) {
  const unknown = [...only].filter((id) => !pens.some((pen) => pen.id === id));
  if (unknown.length) {
    console.error(`No {% codepen %} call uses: ${unknown.join(', ')}`);
    process.exit(1);
  }
}
if (!todo.length) {
  console.log(`All ${pens.length} pens have a backup (--force to fetch them again).`);
  process.exit(0);
}

const failed = [];
for (const [i, { id, dir }] of todo.entries()) {
  console.log(`${i + 1}/${todo.length} ${id} -> ${dir}`);
  try {
    const response = await fetch(`https://cdpn.io/vojtechruz/fullpage/${id}`, {
      headers: { Referer: 'https://codepen.io/' },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const parts = splitResult(await response.text());
    if (!parts.body) {
      throw new Error('empty result page');
    }
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, BACKUP_FILES.html), standalonePage(parts, id));
    if (parts.css) {
      writeFileSync(join(dir, BACKUP_FILES.css), `${parts.css}\n`);
    }
    if (parts.js) {
      writeFileSync(join(dir, BACKUP_FILES.js), `${parts.js}\n`);
    }
  } catch (error) {
    failed.push(id);
    console.error(`  failed: ${error.message}`);
  }
}

if (failed.length) {
  console.error(`\nNo backup for: ${failed.join(', ')}`);
  process.exit(1);
}
