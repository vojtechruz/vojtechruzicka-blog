import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { formatReport, groupByPage, pageUrl } from '../scripts/broken-links-report.mjs';

// The issue body of .github/workflows/external-links.yml, from linkinator's --format json (docs/LINKS.md)

const SITE = 'https://www.vojtechruzicka.com';
const broken = (url, parent, status = 404) => ({ url, parent, status, state: 'BROKEN' });

describe('pageUrl', () => {
  it('turns the linking file into the page URL, from Linux and Windows paths alike', () => {
    expect(pageUrl('css-flexbox/index.html')).toBe(`${SITE}/css-flexbox/`);
    expect(pageUrl('css-flexbox\\')).toBe(`${SITE}/css-flexbox/`);
    expect(pageUrl('./index.html')).toBe(`${SITE}/`);
    expect(pageUrl('404.html')).toBe(`${SITE}/404.html`);
  });
});

describe('groupByPage', () => {
  it('groups broken links by page, sorted, each link once, ignoring links that passed', () => {
    const pages = groupByPage({
      links: [
        broken('https://b.example/', 'z-post/index.html'),
        broken('https://b.example/', 'a-post/index.html', 0),
        broken('https://a.example/', 'a-post/index.html'),
        broken('https://a.example/', 'a-post/index.html'),
        { url: 'https://ok.example/', parent: 'a-post/index.html', status: 200, state: 'OK' },
      ],
    });
    expect(pages).toEqual([
      {
        page: `${SITE}/a-post/`,
        links: [
          { url: 'https://a.example/', status: '404' },
          { url: 'https://b.example/', status: 'no response' },
        ],
      },
      { page: `${SITE}/z-post/`, links: [{ url: 'https://b.example/', status: '404' }] },
    ]);
  });
});

describe('formatReport', () => {
  it('is null when nothing is broken, so the workflow closes the issue', () => {
    expect(formatReport({ links: [], passed: true })).toBeNull();
  });

  it('counts the links and lists them under their page, with the run link', () => {
    const body = formatReport(
      { links: [broken('https://gone.example/x', 'post/index.html'), broken('https://gone.example/y', 'post/')] },
      { runUrl: 'https://github.com/o/r/actions/runs/1' },
    );
    expect(body).toMatch(/^The scheduled external link check found \*\*2 broken links\*\* on 1 page\./);
    expect(body).toContain('Run: https://github.com/o/r/actions/runs/1');
    // The advice matches the config: bot blocks are warnings, no site is skipped (docs/LINKS.md)
    expect(body).toContain('Bot blocks (401, 403, 429) are only warnings');
    expect(body).not.toContain('skip');
    expect(body).toContain(
      `### ${SITE}/post/\n\n- \`404\` <https://gone.example/x>\n- \`404\` <https://gone.example/y>`,
    );
  });

  it('stays under the GitHub issue body limit', () => {
    const links = Array.from({ length: 3000 }, (_, i) =>
      broken(`https://gone.example/${'x'.repeat(40)}/${i}`, `post-${i}/index.html`),
    );
    const body = formatReport({ links });
    expect(body.length).toBeLessThan(65536);
    expect(body).toContain('the full list is in the run log');
  });
});

describe('the CLI the workflow calls', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'broken-links-'));
  const run = (result) => {
    const file = path.join(dir, 'linkinator.json');
    writeFileSync(file, JSON.stringify(result));
    return spawnSync(process.execPath, ['scripts/broken-links-report.mjs', file], { encoding: 'utf-8' });
  };

  it('prints the report and exits 0 when links are broken', () => {
    const { status, stdout } = run({ links: [broken('https://gone.example/', 'post/index.html')], passed: false });
    expect(status).toBe(0);
    expect(stdout).toContain('**1 broken link** on 1 page');
  });

  it('exits 2 when nothing is broken', () => {
    expect(run({ links: [], passed: true }).status).toBe(2);
  });

  it('exits 1 when linkinator produced no JSON', () => {
    const file = path.join(dir, 'empty.json');
    writeFileSync(file, '');
    expect(() =>
      execFileSync(process.execPath, ['scripts/broken-links-report.mjs', file], { stdio: 'pipe' }),
    ).toThrow();
  });
});

describe('external link check setup', () => {
  const config = JSON.parse(readFileSync('linkinator.config.external.json', 'utf-8'));
  const workflow = readFileSync('.github/workflows/external-links.yml', 'utf-8');

  // A bot block (403, 429) says the site is alive, not whether the page is: a warning, not an issue. Every
  // site is still checked, so a domain that is gone gets reported even when it used to block bots.
  it('treats bot blocks as warnings instead of skipping sites', () => {
    expect(config.statusCodes).toEqual({ 401: 'warn', 403: 'warn', 429: 'warn' });
    expect(config.skip).toEqual(['http://localhost:4200']);
  });

  it('retries errors with a lower concurrency than the default 100', () => {
    expect(config).toMatchObject({ retryErrors: true, retryErrorsCount: 3, retryErrorsJitter: 2000, concurrency: 25 });
  });

  it('runs monthly and on demand, never on push', () => {
    expect(workflow).toMatch(/schedule:\s*\n\s*- cron: '\d+ \d+ 1 \* \*'/);
    expect(workflow).toContain('workflow_dispatch:');
    expect(workflow).not.toMatch(/^\s*(push|pull_request):/m);
  });
});
