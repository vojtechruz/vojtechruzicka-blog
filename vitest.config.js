import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // getMarkdownParser() bootstraps Shiki (themes + language grammars) lazily, once per worker
    // process. That one-time cost lands on whichever test calls it first in each file: ~3s
    // locally, but 6-10s on a CI runner under load, which was overrunning the old 10s limit.
    // The timeout is here to catch hangs, and 30s still does that.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
