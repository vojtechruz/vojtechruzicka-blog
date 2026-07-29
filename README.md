# Vojtech Ruzicka's Programming Blog

This repository contains the source code for [vojtechruzicka.com](https://www.vojtechruzicka.com), a blog about
Full-stack Software Development, Clean Code, Design Patterns, Java, Spring, JavaScript, and more. Built with
[Eleventy](https://www.11ty.dev/) static site generator.

## Running Locally

To run the blog locally for development, follow these steps:

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
- `npm run test`: Run Vitest unit tests.
- `npm run validate`: Run all validation checks (HTML, CSS, JS, Markdown, Links).
- `npm run format`: Format the codebase using Prettier.
- `npm run clean`: Remove the `_site` directory.

## Documentation

Design notes and internal documentation live in the [`docs/`](docs/) directory:

- [MERMAID.md](docs/MERMAID.md) — build-time Mermaid diagram rendering: design decisions, accessibility, the Chromium
  dependency
- [IMAGES.md](docs/IMAGES.md) — responsive image pipeline and the persistent build cache (local, GitHub Actions,
  Cloudflare Pages)
- [FEEDS.md](docs/FEEDS.md) — RSS/Atom feed generation and the content processing that keeps feeds readable

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
