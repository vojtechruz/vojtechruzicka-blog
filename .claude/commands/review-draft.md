Do a thorough editorial review of a single draft blog post and output findings directly in the conversation.

## Arguments: $ARGUMENTS

$ARGUMENTS must contain a path to the post directory or its `index.md` (e.g. `/review-draft src/posts/_drafts/my-post` or `/review-draft src/posts/_drafts/my-post/index.md`). If no path is given, ask the user for it before proceeding.

## Step 1 — Read the post

Resolve the directory from $ARGUMENTS. Read `index.md` inside it. Extract:
- All frontmatter fields (`title`, `excerpt`, `topics`, `draftStatus`, `series`, etc.)
- The full body content

## Step 2 — Review

Evaluate the post across all of the following dimensions. Be specific: quote or paraphrase the problematic passage, then explain the issue and give a concrete suggestion. Skip any dimension that has nothing worth noting — do not pad.

### A. Metadata

- **Title** — is it specific, descriptive, and good for search? Suggest an alternative if it is vague or too long.
- **Excerpt** — does it accurately summarise the post? Is it compelling? Flag if missing or too thin.
- **Topics** — are the chosen topics appropriate for the content?

### B. Structure & flow

- Does the post have a clear introduction that sets context and tells the reader what they will learn?
- Are headings logical, consistently styled (sentence case vs. title case), and parallel in structure?
- Does the content follow a logical progression, or are there jumps or missing transitions?
- Does the post end with a clear conclusion or call to action?
- Are code examples placed where the reader needs them, or do they appear too early/late?

### C. Clarity & writing quality

- Passive voice used where active would be clearer
- Overly long or convoluted sentences
- Jargon or acronyms used without definition (on first use)
- Redundant phrasing or filler ("basically", "it's worth noting that", "in order to")
- Inconsistent terminology (e.g. switching between two names for the same thing)

### D. Grammar & typos

List every spelling mistake, grammatical error, punctuation issue, or awkward phrasing you find. For each one: quote the original text → show the corrected version. Group minor fixes together if there are many.

### E. Technical accuracy

- Are code snippets syntactically correct?
- Are API names, method signatures, CLI flags, and version numbers accurate to your knowledge?
- Are any claims oversimplified, misleading, or likely to cause confusion?
- Flag anything you are uncertain about so the author can verify.

### F. Suggestions & improvements

Ideas that would meaningfully improve the post but are not outright errors:
- Missing topics or angles the reader would expect
- Examples that could be added or expanded
- Diagrams, tables, or code comparisons that would help
- Sections that could be cut without loss

## Step 3 — Output format

Print the review directly in the conversation. Use this structure:

---

## Review: <post title>

### A. Metadata
...

### B. Structure & flow
...

### C. Clarity & writing quality
...

### D. Grammar & typos
...

### E. Technical accuracy
...

### F. Suggestions & improvements
...

---

**Overall:** One short paragraph — the post's biggest strength, the single most important thing to fix before publishing, and an overall readiness verdict (e.g. "needs significant work", "almost ready", "ready with minor fixes").

---

Rules:
- Be direct and specific. Vague observations ("could be clearer") are useless without a quoted example and a fix.
- Omit any section that has nothing to say — do not write empty headings or "No issues found."
- Do not rewrite large chunks of the post — point to the problem and suggest the fix, let the author do the writing.
- Do not write a `review.md` file. Output only in the conversation.
