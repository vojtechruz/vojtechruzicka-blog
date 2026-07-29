Generate promotional Mastodon, X, Bluesky, LinkedIn and Facebook posts for a published blog post,
respecting each platform's character limit and conventions.

## Arguments: $ARGUMENTS

$ARGUMENTS may contain a post path (`src/posts/security/owasp-top-ten-2025/`), a URL slug
(`owasp-top-10-2025`), a post title, or be empty.

If empty, list the 10 most recently dated posts under `src/posts/` (excluding `_drafts/` and `archives/`)
and ask the user which one to promote.

## Step 1 — Read the post

Resolve $ARGUMENTS to a single `src/posts/<topic-dir>/<slug>/index.md` and read it in full. From the
frontmatter take `title`, `excerpt`, `topics`, and `path`. The canonical URL is `https://www.vojtechruzicka.com`
plus `path`.

Do not promote a post with `draft: true` or `draftStatus` in its frontmatter — it is not live yet. Warn the
user and stop.

From the body, pick **exactly 3 concrete, specific hooks** — the things a reader would not already know. Prefer:

- surprising numbers and statistics ("every single application in the dataset had one")
- what changed, moved, was added or removed
- a counterintuitive claim the post argues for
- a short, quotable takeaway

Avoid generic filler ("a deep dive into…", "everything you need to know about…").

These 3 hooks become options 1, 2 and 3 on **every** platform. The user picks one hook and posts that same
angle everywhere — so option 2 on Mastodon, X and Bluesky all cover the same hook, and only the wording
changes to fit the platform's length and conventions. Do not give each platform a different hook.

## Step 2 — Pick accounts to tag

Tag accounts only when the post genuinely relates to them — 1–2 per variant. Verify any handle you are not
certain about with a web search before using it; a wrong handle tags a stranger.

Known-good handles:

| Entity | Mastodon | X | Bluesky | LinkedIn | Facebook |
|---|---|---|---|---|---|
| OWASP Foundation | `@owasp@infosec.exchange` | `@owasp` | `@owasp.org` | `OWASP® Foundation` | `OWASP Foundation` |
| OWASP ASVS | — | — | `@asvs.owasp.org` | — | — |
| MITRE CWE Program | — | `@CweCapec` | — | — | — |
| Snyk | — | `@snyksec` | — | `Snyk` | — |
| Spring | — | `@springcentral` | — | — | — |
| JetBrains IntelliJ IDEA | — | `@intellijidea` | — | `JetBrains` | `JetBrains` |

LinkedIn and Facebook mentions cannot be pre-written in plain text — they are resolved by typing `@` in the
platform's editor and picking the page. Write the plain page name in the post text and list the pages to tag
in the file's **Accounts to tag** line instead.

If the post's topic has no entry here, search the vendor's or project's official site for its social links
rather than guessing. Leave the mention out entirely if you cannot confirm it — an untagged post is better
than a misattributed one.

## Step 3 — Write the variants

Produce **3 options per platform** — option N on every platform covers hook N from Step 1, reworded to fit.

**Every variant must read as the author announcing their own new article, not as someone resharing a link
they found.** This is the single most important thing to get right. Say it in the first sentence, and vary
the phrasing across platforms rather than repeating one formula:

- Good: "New post on my blog: I went through…", "I published a walkthrough of…", "Just published: my…",
  "The change I found most telling while writing up…", "Writing up X, I spent the longest on…"
- Bad: "OWASP Top 10 2025 is out.", "X just released Y." — these read as news sharing, and the reader has no
  reason to think the link is yours.

First person throughout. The post is the user's own work, so "I", "my", "I found", "I spent the longest on".

| Platform | Limit | Link counts as | Hashtags | Mentions |
|---|---|---|---|---|
| Mastodon | 500 chars | 23 chars | 4–5, CamelCase (`#AppSec`) | `@user@instance.tld`; the `@instance.tld` part is free |
| X | 280 chars | 23 chars (t.co) | 1–2 max | `@handle` |
| Bluesky | 300 graphemes | **its full length** | 1–2 | `@domain.tld` — handles are domains |
| LinkedIn | 3000 chars | its full length | 3–5, at the end | typed in the editor — see Step 2 |
| Facebook | 63206 chars (aim under 500) | its full length | 0–2, they carry little weight | typed in the editor — see Step 2 |

Platform conventions to respect:

- **Mastodon** has no algorithmic feed, so hashtags are the only discovery mechanism — use 4–5 and CamelCase
  them for screen readers. Put the link on its own line; the preview card comes from the last link in the post.
- **X** punishes hashtag stuffing. One or two, at the end.
- **Bluesky** is the tightest budget because the raw URL counts in full (a typical post URL is ~49 characters).
  Note in the file that the user can delete the raw URL once the preview card renders.
- **LinkedIn** collapses everything after roughly the first 200 characters behind "…see more" — the hook must
  land in the first sentence, before the fold. Use short paragraphs and line breaks; 3 concise paragraphs
  (hook → what the post covers → link + hashtags) beat one wall of text. Aim for 500–1,200 characters even
  though the hard limit is 3,000. Professional tone is fine, but keep the author's plain, direct voice.
- **Facebook** truncates around ~480 characters with "See more", and short posts perform best — aim under 500
  even though the technical limit is enormous. Hashtags carry little weight there; use 0–2 or none.
  Conversational tone works better than on LinkedIn. The preview card renders from the URL; note in the file
  that the raw URL can be deleted once the card appears.
- Never write `#` directly before a number (`#6 → #3`) — it reads as a broken hashtag. Write `6th → 3rd`.
- Use the post's own voice: plain, direct, no hype, no "🚀 excited to share".
- Emoji are fine as list markers on Mastodon, sparing elsewhere.

## Step 4 — Write the files

Write one file per platform to `_out/social/<slug>/` (gitignored scratch output):

- `_out/social/<slug>/mastodon.md`
- `_out/social/<slug>/x.md`
- `_out/social/<slug>/bluesky.md`
- `_out/social/<slug>/linkedin.md`
- `_out/social/<slug>/facebook.md`

Each file follows this structure:

````markdown
# <Platform> — <Post title>

**Post:** [<title>](<canonical url>)
**Limit:** <limit + how links are counted>
**Accounts to tag:** `<handle>` (<who>), …
**Notes:** <platform-specific guidance that applies to these variants>

Each option shares its hook with the same option number in `<other two files>` — only the wording differs.

---

## Option 1 — <angle> (recommended)

*<counted> / <limit> characters*

```text
<the post text, exactly as it should be pasted>
```

## Option 2 — <angle>

…
````

The post text must live inside a ` ```text ` fenced block and contain nothing but what gets pasted — no
commentary, no surrounding quotes.

## Step 5 — Verify the character counts

Run the validator, which parses the ` ```text ` blocks and applies each platform's counting rules:

```bash
node scripts/social-char-count.mjs _out/social/<slug>
```

Rewrite any variant reported as `OVER` and re-run until every variant passes. Then fill the
`*<counted> / <limit> characters*` line under each option with the counted value the script reported —
do not estimate these by hand.

## Step 6 — Confirm

Tell the user:

- the three file paths
- the 3 hooks, and the counted length each one came out at on each platform
- which accounts you tagged, and any handle you deliberately left out because you could not verify it
