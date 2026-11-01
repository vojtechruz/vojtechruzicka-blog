# Code repositories

An article that comes with example code in a GitHub repository names it in its front matter, and the post layout links
it twice: a quiet **On GitHub** chip in the header, for whoever came for the code, and a card below the article
("Example code for this article", the repository name, **View on GitHub**).

```yaml
repository: 'https://github.com/vojtechruz/spring-ai-demo'
```

Several repositories, with optional labels (the default is "Example code for this article"):

```yaml
repository:
  - url: 'https://github.com/vojtechruz/spring-rest-docs-example'
  - url: 'https://github.com/vojtechruz/rest-docs-starter'
    label: 'Starter project to follow along'
```

The header chip links the first one; the card lists them all. Links in the article text stay as they are: the card is
the one place where the repository is always found, not a replacement for "the full code is on GitHub" in context.

## How it renders

- `config/filters/repositories.js` (`repositories` filter) normalises the front matter to `{ url, href, name, label }`
  and **fails the build** on a URL that is not `https://github.com/<owner>/<repo>` (a pull request or file URL, a typo).
- `src/_includes/components/repository-card.njk`, included by `layouts/post.njk` below the article after the CodePen
  examples download ([CODEPEN.md](CODEPEN.md)). Both share `src/styles/components/_resource-cards.scss`; two cards in a
  row sit closer together, several repositories share one card. It is a plain `div` with a `<p>` title (the sidebar is
  the page's complementary landmark, and article headings each get a permalink anchor) and stays out of the search
  index. Print keeps it, with the URL after the link.
- The header chip (`.post-repo-link` in `_post.scss`) shows "On GitHub" (the study-notes repositories are not code); its
  accessible name adds the label and the repository name.
- Nothing is fetched from GitHub at build time (no description or stars): the build stays independent of the API.

## Archived articles

The current article links the repository's default branch, which moves on with the article. When an article is archived
(`/archive-post`, `.claude/commands/archive-post.md`), the command tags each repository's current head as
`archive/<archive-slug>` (the archive's directory name) and the archived copy gets:

```yaml
repositoryRef: 'archive/chrome-audit-lighthouse-2026-05'
```

Its links then go to `/tree/archive/<archive-slug>`, and the card says "the code as of" followed by the archived date. A
tag rather than a branch: it does not move, nobody commits to it by accident, it stays out of the branch list, and
GitHub offers it as a ZIP like a branch. Creating it writes to the other repository, so the command asks first.

## Tests

`tests/repositories.test.js`: the filter (single URL, list with labels, trailing slash, the archive tag, non-repository
URLs rejected); every post's `repository` is valid, every archived copy with one has
`repositoryRef: 'archive/<its directory>'`, and no current article has a `repositoryRef`; on the built
`/spring-rest-docs/` both repositories in the card and the first in the header chip, whose visible text is part of its
accessible name; nothing on an article without a repository.
