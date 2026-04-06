---
description: Fetch an article from a URL, create a raw source file, and ingest it into the KB
argument-hint: "<url>"
allowed-tools: Read, Write, Edit, Glob, Grep, WebFetch
effort: high
---

Fetch an article from a URL and ingest it into the knowledge base. The URL is: $ARGUMENTS

Follow these steps exactly in order. Do NOT skip any step.

## Step 1: Fetch the article

- Use WebFetch to retrieve the article content from the provided URL.
- Extract: title, author, publication date, publication name, and the full article text.
- If the fetch fails or the content is paywalled/empty, stop and tell the user.

## Step 2: Determine the raw source category

Based on the source:
- **articles** — Science journalism (Quanta Magazine, Nature News, New Scientist, Scientific American, Ars Technica, etc.)
- **papers** — Arxiv preprints, peer-reviewed papers, lecture notes
- **books** — Book excerpts, chapter summaries
- **talks** — Conference talks, lecture transcripts, interviews, podcasts

Default to `articles` if unclear.

## Step 3: Create the raw source file

- Generate the filename: `YYYY-MM-DD-short-title.md` where the date is the article's publication date (not today's date).
- Write the file to `kb/raw/<category>/` with this frontmatter:

```yaml
---
title: "<article title>"
description: "<one-line summary of the article>"
created_at: YYYY-MM-DD
source: external
type: <category>
url: <the original URL>
author: <author name>
publication: <publication name>
---
```

- Below the frontmatter, write the full article content in markdown.
- Keep the article text faithful to the original — do not summarize or editorialize in the raw file.

## Step 4: Confirm with the user

- Show the user the raw source file path and a brief summary of what was fetched.
- Ask if they want to proceed with ingestion or review/edit the raw file first.

## Step 5: Ingest

- If the user confirms, proceed with the full ingestion process (same as `/kb:ingest`):
  1. Read KB state and check for prior ingestion
  2. Identify pages to create or update
  3. Write/update pages with proper frontmatter, backlinks, evidence tiers
  4. Update `kb/index.md`
  5. Update `kb/log.md`
  6. Report summary

- Log the fetch in `kb/log.md` using:

```
## [YYYY-MM-DD] fetch | Source Title
Fetched from <url>
Raw source: `kb/raw/<category>/<filename>`
Summary: <one-sentence summary>
Pages created: <list>
Pages updated: <list>
```
