# Service worker cleanup (Gatsby leftover)

This site does **not** use a service worker. The file `src/static/sw.js` (served at `/sw.js`) exists only to get rid
of the old one.

## Background

The Gatsby version of this site used `gatsby-plugin-offline`, which registered a Workbox service worker at `/sw.js`
for every visitor. That worker precached the Gatsby app shell (HTML, JS bundles) and served pages cache-first.

After the migration to Eleventy (launched 2026-07-17), visitors from the Gatsby era still carry that worker. Effects:

- They may get the stale precached Gatsby shell on their first return visit — often broken, because the old hashed
  bundles no longer exist on the server.
- The stale shell still contains the old Google Analytics (gtag) script, so those visits can show up in GA even
  though the current site only uses Plausible.

## How the cleanup works

A registered service worker never expires on its own. On each navigation the browser re-fetches `/sw.js`
(HTTP caching for SW scripts is capped at 24 hours) and:

- If it gets a **404**, the registration is unregistered per spec — but only after that visit was already served
  from the stale cache.
- If it gets a **new script**, the new worker replaces the old one immediately.

`src/static/sw.js` is a standard *self-destroying service worker*: on `install` it calls `skipWaiting()`, on
`activate` it deletes all Cache Storage entries, unregisters itself, and reloads open tabs via `clients.navigate()`.
This fixes affected visitors on their very first return visit, with no broken page in between.

The `_headers` rule for `/*.js` (`max-age=0, must-revalidate`) applies to `/sw.js`, so updates propagate immediately.

## When to remove

Keep `src/static/sw.js` (and its ESLint block for `src/static/**/*.js` in `eslint.config.js`) until roughly
**mid-2027** — about a year after the Eleventy launch. After deleting it, `/sw.js` returns 404 again, which handles
any remaining stragglers via the spec's 404-unregister fallback.
