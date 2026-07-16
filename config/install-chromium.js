// Installs the Chromium that build-time Mermaid rendering needs (mermaid-isomorphic
// via Playwright). Runs as the npm "prebuild" hook — a fast no-op when the browser
// is already present.
import { spawnSync } from 'node:child_process';
import { configurePlaywrightBrowserPath } from './env-utils.js';

configurePlaywrightBrowserPath();

const result = spawnSync('npx', ['playwright', 'install', 'chromium'], { stdio: 'inherit', shell: true });
process.exit(result.status ?? 1);
