# Vojtech Ruzicka's Programming Blog

This repository contains the source code for [vojtechruzicka.com](https://www.vojtechruzicka.com), a blog about
Full-stack Software Development, Clean Code, Design Patterns, Java, Spring, JavaScript, and more. Built with
[Eleventy](https://www.11ty.dev/) static site generator.

## Running Locally

Requires **Node.js 24.15+** (the exact version is pinned in `.node-version`, which CI and Cloudflare Pages both read —
`nvm`, `fnm` and `volta` pick it up automatically). The version must stay pinned exactly: a bare `24` resolves to
whatever 24.x the Cloudflare build image has cached, which can be older than the `engines` minimum in `package.json` and
fail the install (`engine-strict` is on).

Then follow these steps:

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Start the development server**:

   ```bash
   npm run dev
   ```

   This will start a local server at `http://localhost:8080` with hot-reloading.

### Other Commands

- `npm run build`: Build the site for production.
- `npm run test`: Run Vitest unit tests (most of them assert against `_site/`, so build first).
- `npm run validate`: Run all validation checks (HTML, CSS, JS, Markdown, XML).
- `npm run validate:links`: Check internal links in `_site/` (runs in CI); `npm run validate:links:external` also checks
  every outbound link (slow, run on demand).
- `npm run lighthouse`: Lighthouse CI audit of the built site (`lighthouserc.json`); needs a running server, e.g. after
  `npm run dev` in another terminal.
- `npm run format`: Format the codebase using Prettier.
- `npm run clean`: Remove the `_site` directory.

### Drafts

Unpublished posts live in `src/posts/_drafts/` with `draftStatus: draft | review | ready` in their frontmatter.
`npm run dev` shows all of them; `npm run build` includes none (production) or only `ready` ones (Cloudflare preview
deploys of non-`master` branches). Override with the `INCLUDE_DRAFTS` env var: `all`, `none`, or a stage name, which
includes that stage and everything riper (`INCLUDE_DRAFTS=review npm run build`). `npm run build:with-drafts` is a
shortcut for `INCLUDE_DRAFTS=all`. The rules are implemented in `config/draft-utils.js`.

## Documentation

Design notes and internal documentation live in the [`docs/`](docs/) directory:

- [MERMAID.md](docs/MERMAID.md) — build-time Mermaid diagram rendering: design decisions, accessibility, the Chromium
  dependency
- [IMAGES.md](docs/IMAGES.md) — responsive image pipeline and the persistent build cache (local, GitHub Actions,
  Cloudflare Pages)
- [FEEDS.md](docs/FEEDS.md) — RSS/Atom feed generation and the content processing that keeps feeds readable
- [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Cloudflare Pages settings, preview vs production URLs, and what differs between
  build environments

## Contributing

Contributions are welcome! If you find a typo, broken link, or have a suggestion, please see
[CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Forking

Feel free to fork this repository and use the code for your purposes. Be sure to delete all the posts and personal
configuration.

## License

### Content

All blog content (posts, images, etc.) is licensed under
[Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

### Code

The source code of this project is licensed under the [MIT License](LICENSE.md).
