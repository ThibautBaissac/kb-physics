---
description: Fetch an article from a URL, create a raw source file, and ingest it into the KB
argument-hint: "<url>"
allowed-tools: Read, Write, Edit, Glob, Grep, WebFetch, Bash
effort: high
---

Fetch an article from a URL and ingest it into the knowledge base. The URL is: $ARGUMENTS

Follow these steps exactly in order. Do NOT skip any step.

## Step 0: Detect arXiv URLs

Check if the URL matches `arxiv.org`. If it contains `arxiv.org/abs/` or `arxiv.org/pdf/`, this is an arXiv paper — follow the **arXiv path** below, then skip to Step 4.

If the URL is NOT an arXiv link, skip this step and continue to Step 1.

### arXiv path

#### (a) Normalize the URL

Extract the arXiv ID from the URL. Handle all variants:
- `https://arxiv.org/abs/2411.17893` → ID is `2411.17893`
- `https://arxiv.org/pdf/2411.17893` → ID is `2411.17893`
- Version suffixes like `2411.17893v2` → keep the version in the ID
- Old-format IDs like `hep-th/9905111` → ID is `hep-th/9905111`
- With or without `www.` prefix

Derive both URLs:
- Abstract page: `https://arxiv.org/abs/<id>`
- PDF: `https://arxiv.org/pdf/<id>`

#### (b) Download the PDF

Use Bash to download the PDF to the local originals cache:

```bash
mkdir -p kb/raw/_originals
curl -sL -o "kb/raw/_originals/<id>.pdf" "https://arxiv.org/pdf/<id>"
```

For old-format IDs containing `/` (e.g., `hep-th/9905111`), replace the `/` with `-` in the filename (e.g., `hep-th-9905111.pdf`).

Verify the download succeeded: the file must exist and have nonzero size. If it fails, stop and tell the user.

#### (c) Fetch metadata and create raw source

Use WebFetch on the abstract page (`https://arxiv.org/abs/<id>`) to extract:
- **Title** of the paper
- **Authors** (full list)
- **Submission date** (original submission, not latest revision)
- **Abstract** text

Create the raw source file at `kb/raw/papers/YYYY-MM-DD-short-title.md` (date is the original submission date) with this frontmatter:

```yaml
---
title: "<paper title>"
description: "<one-line summary derived from the abstract>"
created_at: YYYY-MM-DD
source: external
type: paper
url: https://arxiv.org/abs/<id>
author: "<First Author et al.>"
publication: arXiv
arxiv_id: "<id>"
original: _originals/<id>.pdf
---
```

Use "First Author et al." when there are more than 3 authors. Use the full author list when there are 3 or fewer.

For old-format IDs, use the `-` form in the `original:` field to match the downloaded filename (e.g., `_originals/hep-th-9905111.pdf`).

Below the frontmatter, write the full abstract as the body content. This is the raw source text — the full paper content will be read from the PDF during ingestion via the `original:` field.

**After creating the raw source file, skip to Step 4.**

---

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
  3. Write/update pages with proper frontmatter, backlinks, evidence tiers, tags
  4. Update the relevant section indexes and `kb/index.md` Raw Sources section
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
