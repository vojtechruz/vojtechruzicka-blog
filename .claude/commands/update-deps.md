Check outdated npm dependencies, decide whether the update is safe, apply it, and verify the site still builds, tests
and validates. Never commits.

## Arguments: $ARGUMENTS

$ARGUMENTS may contain a pasted `npm-check-updates` / `npm outdated` list, or package names to limit the update to. If
empty, update everything that is outdated.

## Step 1 — Inventory

Run `npm outdated` and `git status --short`. If the working tree is dirty in `package.json` / `package-lock.json`, stop
and ask — the update must be reviewable as its own diff.

Classify every outdated package:

- **in-range** — patch/minor bump inside the existing `^` range (`Wanted` = `Latest`)
- **major** — `Latest` is outside the range (a new major, or a new minor for `0.x` packages)

## Step 2 — Safety check

In-range bumps are considered safe by semver; no changelog review needed unless a package is known to be risky for this
repo (see the list below), in which case skim its release notes (`gh release list` / `gh release view` on the package's
repo, or Context7).

For **major** bumps, do not update them automatically. For each one, read the release notes / migration guide (Context7
first, then GitHub releases), and report: what breaks, whether this repo uses the affected API (grep `config/`,
`scripts/`, `eleventy.config.mjs`, config files), and a recommendation. Then ask the user which majors to include.

Packages that touch generated output and deserve a closer look even on minor bumps:

- `@11ty/*` — config API, collections, incremental/watch behaviour
- `shiki`, `@shikijs/*` — highlighted code markup (`<pre>` transforms, feed output)
- `markdown-it*` — heading ids/anchors (docs/HEADING-ANCHORS.md), callouts, TOC
- `mermaid-isomorphic`, `playwright*` — Mermaid build-time rendering and Chromium install (docs/MERMAID.md)
- `sharp`, `@11ty/eleventy-img` — image pipeline; output hashes may change, image cache stays safe (docs/IMAGES.md)
- `pagefind` — search index and `data-pagefind-body` handling

## Step 3 — Audit baseline

Record the current audit state before changing anything:

```bash
npm audit --package-lock-only 2>&1 | grep vulnerabilities
```

## Step 4 — Update

In-range only:

```bash
npx npm-check-updates -u --target minor [package names]
npm install
```

Approved majors: `npx npm-check-updates -u <package>` for each, then `npm install`. Apply any required code/config
migrations from Step 2.

Then run `npm audit --package-lock-only` again and compare with the baseline. New vulnerabilities introduced by the
update are a blocker — report them. Pre-existing ones are out of scope; just mention the count.

## Step 5 — Verify

Run all three and check exit codes:

```bash
npm run build
npm test
npm run validate
```

All must pass. On failure, find out whether the update caused it (`git stash` → rebuild/retest → `git stash pop`). If it
did, fix it if the fix is small and clearly correct; otherwise roll back the offending package to its previous version
and report.

Do not use `npx prettier --check .` as a gate — it reports many pre-existing differences unrelated to the update.

## Step 6 — Log and report

Add a sub-bullet to the `- Blog` entry in today's Obsidian daily note, per the rules in CLAUDE.md (Czech without
diacritics), e.g. `- Update zavislosti (shiki 4.5, eslint 10.12, ...), build + testy + validace OK`.

Report to the user: what was updated (table old → new), what was skipped and why (majors), verification results (test
count), audit before/after. Do not commit — leave the changes for the user to review.
