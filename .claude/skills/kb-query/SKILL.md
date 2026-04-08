---
name: kb-query
description: >-
  Answer a question from the KB with citations, optionally filing the answer as a new page.
  Use when the user asks a physics question, wants to query the knowledge base,
  or asks about topics covered in the KB (theories, concepts, people, experiments, open questions).
  WHEN NOT: Ingesting new sources (use kb:ingest), fetching articles (use kb:fetch),
  or health-checking the KB (use kb:lint).
argument-hint: "<your question>"
allowed-tools: Read, Write, Edit, Glob, Grep
effort: medium
context: fork
---

Answer a question against the knowledge base. The question is: $ARGUMENTS

Follow these steps exactly in order.

## Step 1: Navigate the KB

- Read `kb/index.md` (master hub) to identify which sections are relevant to the question.
- Read the relevant section index(es) (e.g., `kb/index-concepts.md`, `kb/index-theories.md`) to find specific pages.
- When the question targets a specific domain, use `tags` in page frontmatter to narrow your search (e.g., for a cosmology question, prioritize pages tagged `cosmology`).
- Read the relevant pages. If they reference other pages that seem relevant, read those too.
- Do NOT read raw sources unless the compiled pages are insufficient.

## Step 2: Synthesize an answer

- Answer the question using information from the compiled wiki pages.
- Cite specific pages for every claim: `[Page Title](kb/path/to/page.md)`.
- **Weight claims by evidence tier**: Prefer `primary` over `secondary` over `community`. If the only support for a claim comes from `community`-tier pages, note that explicitly (e.g., "per community discussion (unverified)...").
- If the KB doesn't have enough information to answer, say so explicitly and list what's missing.
- If pages contradict each other, flag the contradiction rather than picking a side.

## Step 3: File the answer (if substantial)

If the answer is substantial, reusable, and not already covered by an existing page:

- Create a new page in the most appropriate location (`kb/theories/`, `kb/concepts/`, `kb/people/`, `kb/experiments/`, or `kb/open-questions/`).
- Use standard page format from kb/CLAUDE.md.
- Set `type: summary` or `type: concept` as appropriate.
- Add relevant `tags` from the controlled vocabulary in `kb/CLAUDE.md`. Use 1-4 tags per page.
- Link to the pages that informed the answer in the Sources section.
- Update the relevant section index (`kb/index-theories.md`, `kb/index-concepts.md`, etc.) and the page counts in `kb/index.md`.
- Prepend to `kb/log.md`:

```
## [YYYY-MM-DD] query | <Short question summary>
Question: <the question>
Answer filed: <path to new page, or "not filed — too narrow/already covered">
Pages consulted: <list of pages read>
```

If the answer is narrow or already covered, still log it but skip creating a page.
