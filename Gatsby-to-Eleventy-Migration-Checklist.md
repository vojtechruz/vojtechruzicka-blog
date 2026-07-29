# Gatsby → Eleventy Migration Checklist

### 2.2 Permalinks and URL parity
- [ ] Document current Gatsby URL structure (with/without trailing slash, date-based, tag pages, pagination URLs).
- [ ] Implement Eleventy permalinks to match Gatsby URLs exactly.
  - [ ] Post permalink pattern (e.g., /blog/yyyy/mm/dd/slug/ or /blog/slug/).
  - [ ] Page URLs (e.g., /about/, /contact/).
  - [ ] Tag URLs (e.g., /tags/{tag}/) and tag index (/tags/).
  - [ ] Pagination URLs (e.g., /page/2/, /tags/{tag}/page/2/).
- [ ] Set pathPrefix/basePath equivalent if previously used in Gatsby.

## 5) Markdown/MDX processing
- [ ] Configure markdown-it (or default) options:
  - [ ] Smart quotes, typographer
  - [ ] External link attributes (target, rel)
  - [ ] Heading anchors and table of contents (TOC)
  - [ ] Footnotes and task lists (if used)
- [ ] Syntax highlighting for code blocks (Prism or eleventy-plugin-syntaxhighlight):
  - [ ] Line numbers

## 6) Images and static assets
- [ ] Optimize SVGs; keep accessibility (role, title, desc where appropriate).

## 7) SEO, metadata, and social
- [ ] Site metadata moved from gatsby-config to Eleventy global data (_data/site.json or .js).
- [ ] Title template and meta description handling.
- [ ] Canonical URLs.
- [ ] Open Graph and Twitter Card tags (image, title, description, type, url).
- [ ] JSON-LD (BlogPosting, BreadcrumbList, WebSite search action) if previously used.
- [ ] Pagination rel=prev/next and index/noindex as needed.

## 8) Feeds, sitemap, robots, headers
- [ ] RSS/Atom feed parity using @11ty/eleventy-plugin-rss.
- [ ] Sitemap using @11ty/eleventy-plugin-sitemap (provide site URL, lastmod).

## 9) Redirects and legacy URLs
- [ ] Verify 301 status codes and canonicalization (trailing slash, www/non-www, http→https).

## 10) Analytics, comments, search, forms
- [ ] Newsletter/signup forms (Netlify Forms, Mailchimp, Buttondown, etc.).
  - [ ] Validate form attributes and spam protection (honeypot/reCAPTCHA if used).

## 11) CSS, JS, and bundling
- [ ] Port global styles; ensure class names and structure survive template change.
- [ ] Decide bundling strategy (Vite/Rollup/ESBuild/Eleventy + PostCSS).
- [ ] PostCSS/Sass pipeline parity (autoprefixer, nesting, imports).
- [ ] Purge/treeshake CSS if previously done.
- [ ] Minify and fingerprint assets (hashing) if needed.
- [ ] Verify third-party scripts loading strategy (async/defer, module/nomodule).

## 12) Environment variables and configuration
- [ ] Replicate .env usage (site URL, analytics keys, API tokens).
- [ ] Ensure env variables are read by Eleventy/build tool and not sent to client unless intended.
- [ ] Update package.json scripts:
  - [ ] "start" / "dev": eleventy --serve (or with bundler)
  - [ ] "build": eleventy (plus asset build)
  - [ ] "clean": remove _site and artifacts

## 13) Build, deploy, and hosting
- [ ] 404 page behavior verified in hosting environment.
- [ ] Caching rules for static assets and HTML.
- [ ] Image optimization cache directory persisted across builds (if supported).

## 15) Accessibility and performance
- [ ] Accessibility pass (semantics, labels, contrast, focus states, skip links).
- [ ] Lighthouse: performance, accessibility, best practices, SEO matches or exceeds Gatsby.
- [ ] Lazy-loading of images/iframes; preconnect/preload critical resources.
- [ ] Core Web Vitals verified in production.

## 16) Quality assurance and content checks
- [ ] Validate all internal links (no broken links after path changes).
- [ ] Validate external links (optionally add rel=noopener for target=_blank).
- [ ] Check date formatting, timezones, and localized formats.
- [ ] Confirm code blocks render with correct languages and highlighting.
- [ ] Review lists, tables, blockquotes, admonitions, and custom Markdown extensions.
- [ ] Ensure embedded media (YouTube, Tweets, iframes) still render and are responsive.
- [ ] Verify RSS feed validity (W3C validator) and discoverability.

## 18) Optional features parity
- [ ] Social image generation (OG images) via SSG step (Satori/Puppeteer/Cloud function).

## 19) Security and privacy
- [ ] Review third-party scripts; defer and limit scopes.
- [ ] CSP and security headers ported (Netlify headers or meta http-equiv as last resort).
- [ ] Remove unused APIs, tokens, and plugins.

## 20) Final verification and launch checklist
- [ ] Crawl the Eleventy site locally and on a staging deploy; compare against Gatsby pages count.
- [ ] Spot-check high-traffic posts and ensure visual parity.
- [ ] Validate canonical tags and 301s with a sample set of old URLs.
- [ ] Submit updated sitemap in Search Console.
- [ ] Monitor logs/analytics for 404s and fix redirects as needed.
- [ ] Tag the repo/release and note migration date in README.