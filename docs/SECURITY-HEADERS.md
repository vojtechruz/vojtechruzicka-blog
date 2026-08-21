# Security Headers & Content Security Policy

All security headers are set in the site-wide `/*` block of `src/static/_headers` (Cloudflare Pages). They apply to
production and preview deploys alike — Cloudflare serves `_headers` on `*.pages.dev` too. They do **not** apply during
local development: the Eleventy dev server never reads `_headers`, so CSP breakage only ever shows up on a deploy (which
is why the hashes below are guarded by tests).

## Headers at a glance

| Header                         | Value                                  | Why                                                                     |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------------------- |
| `Strict-Transport-Security`    | 1 year, `includeSubDomains; preload`   | HTTPS only; the domain is on the browser preload lists                  |
| `X-Content-Type-Options`       | `nosniff`                              | No MIME sniffing                                                        |
| `X-Frame-Options`              | `DENY`                                 | Legacy fallback for CSP `frame-ancestors 'none'`                        |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`      | Full referrer only same-origin                                          |
| `Cross-Origin-Opener-Policy`   | `same-origin`                          | Isolates the browsing context group                                     |
| `Cross-Origin-Resource-Policy` | `same-origin`                          | Public images override this per path to `cross-origin` — see CACHING.md |
| `Permissions-Policy`           | geolocation/camera/microphone disabled | The site uses none of them                                              |
| `Content-Security-Policy`      | see below                              |                                                                         |

## CSP

**The policy must stay on a single line.** Cloudflare's `_headers` parser silently drops multiline header values — the
CSP was once wrapped for readability and simply not served at all, with no error anywhere (fixed in PR #114/#115).
`tests/security-headers.test.js` fails if the policy is ever split again.

### External hosts

| Host                               | Directive(s)                | Used by                                                                                                                                 |
| ---------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `https://plausible.io`             | `script-src`, `connect-src` | Analytics script + event reporting (`src/_includes/components/analytics.njk`)                                                           |
| `https://giscus.app`               | `script-src`, `frame-src`   | Comments. The iframe is injected at **runtime** by the giscus script, so it never appears in static HTML — do not remove it as "unused" |
| `https://www.youtube-nocookie.com` | `frame-src`                 | `{% youtube %}` shortcode (always emits the nocookie domain)                                                                            |
| `https://codepen.io`               | `frame-src`                 | `{% codepen %}` shortcode                                                                                                               |

Everything else is `'self'` (plus `data:` for images — LQIP placeholders). There are deliberately no external fonts,
stylesheets or images; when adding a new embed or third-party script, add its origin to the matching directive and keep
the policy on one line — the host-coverage test below fails on any external `script`/`iframe` source that is not
allowlisted.

### Inline code hashes

Two pieces of inline code are allowlisted by sha256 hash instead of `'unsafe-inline'`:

1. **The Plausible init snippet** in `src/_includes/components/analytics.njk` — hash of the exact text between
   `<script>` and `</script>`, LF line endings.
2. **The LQIP `onload` attribute** (`this.dataset.loaded=1;`) emitted by `config/html-transform/lqip-svg-transform.js` —
   attribute hashes additionally require `'unsafe-hashes'` in `script-src`.

**When either piece of code changes, the hash in `src/static/_headers` must be regenerated** — otherwise browsers block
it silently in production (analytics stops reporting / LQIP placeholders never fade out). Regenerate with:

```bash
# Plausible snippet
node -e "const{createHash}=require('crypto');const s=require('fs').readFileSync('src/_includes/components/analytics.njk','utf8').replace(/\r\n/g,'\n');console.log('sha256-'+createHash('sha256').update(/<script>([\s\S]*?)<\/script>/.exec(s)[1]).digest('base64'))"

# An event-handler attribute (hash of the attribute value, exactly as emitted)
node -e "console.log('sha256-'+require('crypto').createHash('sha256').update('this.dataset.loaded=1;').digest('base64'))"
```

### Guardrails

- `tests/analytics.test.js` — the Plausible snippet hash matches the CSP; `plausible.io` is in both `script-src` and
  `connect-src`.
- `tests/security-headers.test.js` — the policy is a single line with all directives; every external `script`/`iframe`
  host in the built HTML is allowlisted; every inline event handler in the built HTML is hash-allowlisted; `giscus.app`
  stays in `frame-src`.

Both suites run against `_site/`, so `npm run build` first.
