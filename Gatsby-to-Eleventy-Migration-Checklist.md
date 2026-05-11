# Gatsby → Eleventy Migration Checklist

## 1) Project setup and goals
- [ ] Define success criteria (identical URLs, SEO parity, page speed, core features).
- [ ] Node version alignment (.node-version / .nvmrc) and engines field in package.json.
- [x] Install Eleventy and essential plugins as devDependencies.
  - [x] @11ty/eleventy
  - [x] @11ty/eleventy-plugin-rss (if RSS)
  - [x] @11ty/eleventy-plugin-syntaxhighlight (or Prism integration)
  - [x] eleventy-img (responsive images)
  - [x] @11ty/eleventy-plugin-sitemap (if using sitemap)
  - [x] markdown-it and plugins as needed
- [x] Create/validate .eleventy.js config file.

## 2) Content inventory and migration
- [ ] Inventory all content types in Gatsby:
  - [ ] Blog posts (Markdown/MDX)
  - [ ] Pages (about, contact, legal)
  - [ ] Tag/category pages
  - [ ] Drafts
  - [ ] Media assets (images, video, downloads)
- [ ] Decide Eleventy input directory layout (e.g., src/site, content/, posts/, pages/).
- [ ] Copy content files (.md/.mdx) to Eleventy structure.
- [ ] Normalize front matter across posts/pages.

### 2.1 Front matter mapping (Gatsby → Eleventy)
For each content file, ensure the following keys and types exist or are transformed as needed:
- [ ] title → title (string)
- [ ] date → date (ISO date or YYYY-MM-DD)
- [ ] updated / lastmod → updated (optional; used for sitemap/SEO)
- [ ] description / excerpt → description (string)
- [ ] tags / categories → tags (array or string; Eleventy collections use tags)
- [ ] slug / path → permalink (string pattern or computed)
- [ ] draft → draft (boolean; used to exclude from production builds)
- [ ] cover / image / thumbnail → image (path/URL for social cards, list previews)
- [ ] canonical_url → canonical (optional)
- [ ] author → author (string or reference to data file)
- [ ] lang → lang (optional; i18n)

### 2.2 Permalinks and URL parity
- [ ] Document current Gatsby URL structure (with/without trailing slash, date-based, tag pages, pagination URLs).
- [ ] Implement Eleventy permalinks to match Gatsby URLs exactly.
  - [ ] Post permalink pattern (e.g., /blog/yyyy/mm/dd/slug/ or /blog/slug/).
  - [ ] Page URLs (e.g., /about/, /contact/).
  - [ ] Tag URLs (e.g., /tags/{tag}/) and tag index (/tags/).
  - [ ] Pagination URLs (e.g., /page/2/, /tags/{tag}/page/2/).
- [ ] Set pathPrefix/basePath equivalent if previously used in Gatsby.

## 3) Collections, taxonomies, and pagination
- [ ] Configure Eleventy collections for posts, pages, drafts filtered out.
- [ ] Establish tag collection and tag list page generation.
- [ ] Optional category collection (if categories are distinct from tags).
- [ ] Implement pagination for the home/blog index and tag archives.

## 4) Templates, layouts, and partials
- [ ] Choose/implement base layout (HTML skeleton with head, header, footer, scripts).
- [ ] Post layout (title, meta, date, tags, share buttons, next/prev links).
- [ ] Page layout (generic static pages).
- [ ] Index/blog list layout with pagination UI.
- [ ] Tag list and tag detail page layouts.
- [ ] 404 page layout.
- [ ] Partials/includes (head, meta tags, header/nav, footer, analytics, open graph, Twitter cards).
- [ ] Template filters/shortcodes for:
  - [ ] Date formatting and timezone handling
  - [ ] Markdown rendering in templates (if needed)
  - [ ] Responsive images (eleventy-img shortcode)
  - [ ] External embeds (YouTube, Tweets, CodePen, etc.)

## 5) Markdown/MDX processing
- [ ] If Gatsby used MDX, choose approach:
  - [ ] Use Eleventy with MDX (eleventy-plugin-mdx) OR
  - [ ] Convert MDX components/shortcodes to Liquid/Nunjucks/EJS + shortcodes.
- [ ] Configure markdown-it (or default) options:
  - [ ] Smart quotes, typographer
  - [ ] External link attributes (target, rel)
  - [ ] Heading anchors and table of contents (TOC)
  - [ ] Footnotes and task lists (if used)
- [ ] Syntax highlighting for code blocks (Prism or eleventy-plugin-syntaxhighlight):
  - [ ] Line numbers

## 6) Images and static assets
- [ ] Migrate images from Gatsby static/src directories to Eleventy input/static dirs.
- [ ] Replace gatsby-image / gatsby-plugin-image logic with eleventy-img shortcode.
- [ ] Generate responsive sizes, modern formats (AVIF/WebP), and fallbacks.
- [ ] Ensure content image paths work (absolute vs relative).
- [ ] Favicons and app icons migrated; update <link rel> tags.
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
- [ ] 410 for removed content when intentional.

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
- [ ] Breadcrumbs and related posts logic.
- [ ] Table of contents component on long posts.
- [ ] Dark mode toggle and theme persistence.
- [ ] Comments moderation and spam workflows.

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