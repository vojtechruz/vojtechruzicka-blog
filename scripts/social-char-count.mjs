#!/usr/bin/env node
// Character-count validator for generated social media posts (see .claude/commands/social-posts.md).
//
// Usage:
//   node scripts/social-char-count.mjs _out/social/<slug>            # whole directory
//   node scripts/social-char-count.mjs _out/social/<slug>/x.md       # single file
//
// Each ```text fenced block in the file is treated as one post variant. The platform is derived
// from the file name (mastodon.md / x.md / bluesky.md).
//
// Counting rules differ per platform:
//   X        — 280 chars, every URL counts as 23 (t.co shortening)
//   Mastodon — 500 chars, URLs count as 23, the @instance.tld part of a remote mention is free
//   Bluesky  — 300 graphemes, everything counts at full length (no shortening)

import fs from 'fs';
import path from 'path';

const URL_PATTERN = /https?:\/\/\S+/g;
const REMOTE_MENTION_PATTERN = /(@[a-z0-9_]+)@[a-z0-9.-]+/gi;
const SHORTENED_URL_LENGTH = 23;

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const countGraphemes = (text) => [...segmenter.segment(text)].length;

const PLATFORMS = {
  x: {
    limit: 280,
    count: (text) => countGraphemes(text.replace(URL_PATTERN, 'x'.repeat(SHORTENED_URL_LENGTH))),
  },
  mastodon: {
    limit: 500,
    count: (text) =>
      countGraphemes(text.replace(URL_PATTERN, 'x'.repeat(SHORTENED_URL_LENGTH)).replace(REMOTE_MENTION_PATTERN, '$1')),
  },
  bluesky: {
    limit: 300,
    count: countGraphemes,
  },
};

function collectFiles(target) {
  const stats = fs.statSync(target);
  if (!stats.isDirectory()) {
    return [target];
  }
  return fs
    .readdirSync(target)
    .filter((name) => name.endsWith('.md'))
    .map((name) => path.join(target, name));
}

function checkFile(file) {
  const platformName = path.basename(file, '.md').toLowerCase();
  const platform = PLATFORMS[platformName];

  if (!platform) {
    console.log(`SKIP ${file} — unknown platform (expected mastodon.md, x.md or bluesky.md)`);
    return true;
  }

  const blocks = [...fs.readFileSync(file, 'utf8').matchAll(/```text\r?\n([\s\S]*?)```/g)].map((match) =>
    match[1].trimEnd(),
  );

  if (blocks.length === 0) {
    console.log(`WARN ${file} — no \`\`\`text blocks found`);
    return true;
  }

  console.log(`\n${file} (limit ${platform.limit})`);
  let allValid = true;

  blocks.forEach((block, index) => {
    const counted = platform.count(block);
    const valid = counted <= platform.limit;
    allValid = allValid && valid;
    const raw = countGraphemes(block);
    const rawNote = raw === counted ? '' : ` — ${raw} raw`;
    console.log(`  ${valid ? 'OK  ' : 'OVER'} option ${index + 1}: ${counted}/${platform.limit}${rawNote}`);
  });

  return allValid;
}

const target = process.argv[2];

if (!target) {
  console.error('Usage: node scripts/social-char-count.mjs <file-or-directory>');
  process.exit(1);
}

const results = collectFiles(target).map(checkFile);

if (results.includes(false)) {
  console.error('\nSome variants exceed their platform limit.');
  process.exit(1);
}

console.log('\nAll variants within limits.');
