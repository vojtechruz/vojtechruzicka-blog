# Link checking

Links are checked by [linkinator](https://github.com/JustinBeckwith/linkinator) over the built `_site/`, with two
configurations.

| What                 | Command                           | Config                            | When                         |
| -------------------- | --------------------------------- | --------------------------------- | ---------------------------- |
| Internal links       | `npm run validate:links`          | `linkinator.config.json`          | CI on every push, `validate` |
| Links to other sites | `npm run validate:links:external` | `linkinator.config.external.json` | monthly workflow, on demand  |

## Internal links

The internal configuration skips every URL that is not `localhost`, so it checks only the site's own pages, images and
assets. That makes it fast and deterministic enough to fail CI. Links within articles are root-relative (`/slug/`),
never absolute to `https://www.vojtechruzicka.com`, because the internal check would skip an absolute one;
`tests/post-rendering.test.js` guards that.

## Links to other sites

External sites go down, rate-limit and block bots, and a run takes about six minutes, so this check never runs on a
push. `.github/workflows/external-links.yml` runs it on the 1st of every month and on demand (Actions → External links →
Run workflow):

1. A lean, production-shaped build, the same as CI.
2. `npm run --silent validate:links:external -- --format json`. The JSON lists only the broken links, because the config
   sets `verbosity: error`.
3. `scripts/broken-links-report.mjs` turns it into Markdown grouped by page. A link with status `no response` got no
   HTTP answer at all: DNS failure, refused connection, timeout or TLS error.
4. The workflow keeps a single issue labelled `broken-links`, titled "Broken external links". It opens the issue, or
   replaces its body and adds a comment, so each run notifies. The first run that finds nothing closes it.

The workflow itself never fails over broken links; the issue is the signal. It fails only when the check produced no
readable JSON.

The config tunes the check against false alarms:

- `statusCodes`: `401` (a page behind a login, such as the reCAPTCHA admin), `403` and `429` are warnings, not broken
  links. Some sites (Medium, LinkedIn, X, sites behind Cloudflare) block bots, and a bot block is answered by a
  protection layer in front of the site. It means the site is alive, but says nothing about the page, because a deleted
  page gets the same answer. linkinator itself already skips LinkedIn's `999` and a Cloudflare challenge (`403` with
  `cf-mitigated`).
- No site is skipped. Even a site that blocks bots is still checked, so a domain that is gone (no response, DNS failure)
  or a page that answers `404` is reported. Do not circumvent the blocking (headless browser, a spoofed client); a site
  that blocks bots does not want to be crawled.
- What stays undetected is a deleted page on a site that blocks every bot. Only clicking such links in a browser now and
  then finds those.
- `retryErrors` with `retryErrorsCount: 3` and `retryErrorsJitter: 2000`: 5xx and connection errors get three more
  tries, spread out.
- `concurrency: 25` instead of linkinator's default 100, so small sites do not throttle the burst.
- `/archive/` pages are checked too, because an archived copy's links are part of what it preserves.

Run it locally with `npm run build` then `npm run validate:links:external`; add `-- --format json > links.json` and
`node scripts/broken-links-report.mjs links.json` to see the issue body. The script and the config are covered by
`tests/broken-links-report.test.js`.

## Fixing a broken link

- The page moved: replace the link with the new address.
- The whole site is gone: link a [Wayback Machine](https://web.archive.org/) snapshot from the time the article was
  written.
- Delete a link only when it adds nothing to the article.
