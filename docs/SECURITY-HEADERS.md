# Security Headers & Content Security Policy

All security headers are set in the site-wide `/*` block of `src/static/_headers` (Cloudflare Pages). They apply to
production and preview deploys alike — Cloudflare serves `_headers` on `*.pages.dev` too. They do **not** apply during
local development: the Eleventy dev server never reads `_headers`, so CSP breakage only ever shows up on a deploy (which
is why the hashes below are guarded by tests).

## Headers at a glance

| Header                         | Value                                  | Why                                                                     |
| ------------------------------ | -------------------------------------- | ----------------------------------------------------------------------- |
| `Strict-Transport-Security`    | 1 year, `includeSubDomains`            | HTTPS only — no `preload`, see below                                    |
| `X-Content-Type-Options`       | `nosniff`                              | No MIME sniffing                                                        |
| `X-Frame-Options`              | `DENY`                                 | Legacy fallback for CSP `frame-ancestors 'none'`                        |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`      | Full referrer only same-origin                                          |
| `Cross-Origin-Opener-Policy`   | `same-origin`                          | Isolates the browsing context group                                     |
| `Cross-Origin-Resource-Policy` | `same-origin`                          | Public images override this per path to `cross-origin` — see CACHING.md |
| `Permissions-Policy`           | geolocation/camera/microphone disabled | The site uses none of them                                              |
| `Content-Security-Policy`      | see below                              |                                                                         |

## HSTS and the preload list

The header deliberately stops at `max-age` + `includeSubDomains`: there is **no `preload` token**, and the domain is
**not** on the browser preload lists (`hstspreload.org/api/v2/status?domain=vojtechruzicka.com` reports `unknown`).

That is a decision, not an omission. [hstspreload.org](https://hstspreload.org/) now advises against preloading: modern
browsers upgrade `http://` navigations to HTTPS on their own, so preloading closes a gap that has largely closed itself
— while the cost stays permanent. Delisting takes months to reach users via a Chrome release, with no guarantees for
other browsers, and inclusion commits the apex domain **and every subdomain** to HTTPS indefinitely. The site itself
recommends that tooling not emit `preload` by default for exactly that reason.

So: do not add the token back, and do not submit the domain.

## CSP

**The policy must stay on a single line.** Cloudflare's `_headers` parser silently drops multiline header values — the
CSP was once wrapped for readability and simply not served at all, with no error anywhere (fixed in PR #114/#115).
`tests/security-headers.test.js` fails if the policy is ever split again.

### External hosts

| Host                                    | Directive(s)                | Used by                                                                                                                                 |
| --------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `https://plausible.io`                  | `script-src`, `connect-src` | Analytics script + event reporting (`src/_includes/components/analytics.njk`)                                                           |
| `https://giscus.app`                    | `script-src`, `frame-src`   | Comments. The iframe is injected at **runtime** by the giscus script, so it never appears in static HTML — do not remove it as "unused" |
| `https://www.youtube-nocookie.com`      | `frame-src`                 | `{% youtube %}` shortcode (always emits the nocookie domain)                                                                            |
| `https://codepen.io`                    | `frame-src`                 | `{% codepen %}` shortcode                                                                                                               |
| `https://static.cloudflareinsights.com` | `script-src`                | Cloudflare Web Analytics (RUM) beacon — see below                                                                                       |
| `https://cloudflareinsights.com`        | `connect-src`               | The beacon's event reporting endpoint (`/cdn-cgi/rum`)                                                                                  |

Everything else is `'self'` (plus `data:` for images — LQIP placeholders). There are deliberately no external fonts,
stylesheets or images; when adding a new embed or third-party script, add its origin to the matching directive and keep
the policy on one line — the host-coverage test below fails on any external `script`/`iframe` source that is not
allowlisted.

#### Cloudflare Web Analytics beacon

The beacon script is **injected at the Cloudflare edge** (Web Analytics toggle in the Cloudflare dashboard — not
configured anywhere in this repo), so it never appears in the built HTML and the host-coverage test cannot see it — do
not remove its origins as "unused". Before it was allowlisted (2026-08-30) the CSP blocked it, which logged a console
error on every page load and cost ~8 Lighthouse Best Practices points while measuring nothing.

It is deliberately kept alongside Plausible for one thing Plausible does not collect: **real-user Core Web Vitals**
(LCP/INP/CLS) from actual visitors. The site is too small for Google's CrUX to publish field data, so the Cloudflare RUM
dashboard (Cloudflare dashboard → Web Analytics) is the only source of production CWV numbers. If Web Analytics is ever
switched off in the dashboard, remove both origins from the CSP again.

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

### Violation reporting

There is no `report-uri` / `report-to` directive — Cloudflare Pages has nothing that collects them (Page Shield sends
its _own_ report-only policy to a Cloudflare endpoint; it never sees violations of the policy above), so it would mean
running or paying for a collector, and real-world CSP reports are mostly noise from browser extensions and in-app
browsers.

Instead, violations are reported through Plausible, which the site already loads:

- `src/_includes/components/analytics.njk` registers a `securitypolicyviolation` listener **inline**, next to the
  Plausible queue stub. It has to be inline: most violations fire while the document is still parsing, long before the
  deferred bundle runs. The snippet only buffers into `window.cspViolations`.
- `src/scripts/analytics.js` (`reportCspViolations`) drains that buffer, drops extension-scheme noise, deduplicates by
  directive + blocked URI, caps at 5 per page load, and sends a **`CSP Violation`** event with `directive`, `blocked`
  and `page` props.

So a broken policy in production shows up as events in the Plausible dashboard rather than only in visitors' consoles.
Note this covers production and preview deploys only — analytics is disabled locally, and `_headers` is not served by
the dev server anyway.

Changing that inline snippet **changes its CSP hash** — see [Inline code hashes](#inline-code-hashes) above and
regenerate, or `tests/analytics.test.js` will fail.

### Guardrails

- `tests/analytics.test.js` — the Plausible snippet hash matches the CSP; `plausible.io` is in both `script-src` and
  `connect-src`.
- `tests/csp-violation-reporting.test.js` — the built bundle turns buffered violations into `CSP Violation` events, and
  filters extension noise, duplicates and floods.
- `tests/security-headers.test.js` — the policy is a single line with all directives; every external `script`/`iframe`
  host in the built HTML is allowlisted; every inline event handler in the built HTML is hash-allowlisted; `giscus.app`
  stays in `frame-src`.

Both suites run against `_site/`, so `npm run build` first.
