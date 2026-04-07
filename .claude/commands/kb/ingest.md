---
description: Ingest a raw source file into the KB — creates/updates wiki pages, index, and log
argument-hint: "<path-to-raw-source>"
allowed-tools: Read, Write, Edit, Glob, Grep
effort: high
---

Ingest a raw source file into the knowledge base. The file path is: $ARGUMENTS

Follow these steps exactly in order. Do NOT skip any step.

## Step 1: Validate the source

- Confirm the file exists and is in a `kb/raw/` subdirectory (articles, papers, books, or talks).
- If the file is NOT in a `kb/raw/` subdirectory, stop and tell the user to place it there first or use `./kb/scripts/convert.sh`.
- Read the file completely. If the frontmatter has an `original:` field pointing to a PDF or image, also read that original file (under `kb/raw/`) to get the full content.
- **Validate source metadata**: Check that the frontmatter includes `url`, `author`, and `publication`. If any are missing, warn the user and list the missing fields. Proceed only after the user confirms or provides the missing values (use "n/a" if genuinely unavailable).

## Step 2: Read the current state of the KB and check for prior ingestion

- Read `kb/index.md` to understand what pages already exist.
- Read `kb/log.md` to see recent activity.
- **Idempotency check**: Grep all compiled pages for the source filename in their `sources:` frontmatter. If this source has already been ingested, warn the user and ask whether to **update** existing pages with any new information, or **abort**. Do not create duplicate pages.
- Scan existing pages in `kb/theories/`, `kb/concepts/`, `kb/people/`, `kb/experiments/`, and `kb/open-questions/` that might be related to this source.

## Step 3: Identify what to create or update

Based on the source content, determine:

- **Summary page**: Where should the summary live? (`kb/theories/`, `kb/concepts/`, `kb/experiments/`, or `kb/open-questions/`)
- **Concept pages**: What cross-cutting physics concepts does this source touch? Check `kb/concepts/` — do pages already exist that need updating, or do new ones need to be created?
- **Theory pages**: Does this source describe or advance a physics theory or framework? Check `kb/theories/`.
- **People pages**: Does this source feature key physicists whose contributions should be documented? Check `kb/people/`.
- **Experiment pages**: Does this source reference specific experiments, observatories, or instruments? Check `kb/experiments/`.
- **Open question pages**: Does this source discuss unsolved problems or active debates in physics? Check `kb/open-questions/`.
- **Existing pages**: Which existing pages need backlinks or content updates to reflect this new source?

### Page creation criteria by category

Apply these thresholds independently for each category. Prefer fewer, richer pages over many thin stubs — when in doubt, keep a topic as a section in the summary page and only extract it once the threshold is clearly met.

**Concept page** (`kb/concepts/`) — create when at least one is true:
- The concept is already referenced by 2+ existing KB pages
- The concept is a distinct, reusable idea likely to appear in future sources
- It would need more than 2 paragraphs to explain properly

**Theory page** (`kb/theories/`) — create when at least one is true:
- A named physics theory or framework is a central topic of this source
- The theory is referenced in 2+ existing KB pages but has no dedicated theory page yet
- The theory has distinct predictions, assumptions, or open problems worth tracking separately

**Experiment page** (`kb/experiments/`) — create when at least one is true:
- A named experiment, observatory, detector, or instrument is a central topic of this source
- The experiment is referenced in 2+ existing KB pages but has no dedicated experiment page yet
- The experiment has a distinct status (ongoing, proposed, completed) and unique scientific goals

**People page** (`kb/people/`) — create when at least one is true:
- A physicist is a named contributor to results described in this source
- They are referenced in 2+ existing KB pages but have no dedicated people page yet

**Overview page** (`kb/concepts/` or `kb/theories/`) — create when:
- 4+ existing pages share a common parent theme with no hub linking them (e.g., multiple QM interpretation pages with no "Interpretations of Quantum Mechanics" overview)

**Open question page** (`kb/open-questions/`) — create when:
- The source explicitly frames an unsolved problem or active scientific debate as a distinct research frontier

### Near-duplicate check

Before creating a new page, check existing pages for overlapping topics. Look for pages with similar titles, descriptions, or subject matter. If a near-match exists, **update** the existing page rather than creating a new one.

List all pages you plan to create or update before proceeding.

## Step 4: Write and update pages

For each page you create or update:

- Use the standard page format from kb/CLAUDE.md (frontmatter with title, description, type, evidence, created_at, updated_at, related, sources).
- Write a concise `description` that helps the LLM decide if this page is relevant when scanning the KB.
- Set the `evidence` tier (`primary`, `secondary`, or `community`) based on the source material. See kb/CLAUDE.md for tier definitions. When mixing tiers, use the lowest.
- Set `created_at` to today's date for new pages. Set `updated_at` to today's date for both new and updated pages.
- Use **relative paths from `kb/`** in the `related` frontmatter field (e.g., `related: [theories/string-theory.md, concepts/supersymmetry.md]`), not bare filenames.
- Add backlinks to related pages using relative markdown links.
- Add a Sources section at the bottom linking to the raw source file.
- For existing pages: add the new source to frontmatter `sources:` list, update content to reflect new information, add backlinks to new pages, bump `updated_at`.

## Step 5: Update kb/index.md

- Add entries for every new page created, in the correct section (Theories, Concepts, People, Experiments, Open Questions).
- Each entry: `- [Page Title](path/to/page.md) — one-line description`
- Keep entries sorted alphabetically within each section.

## Step 6: Update kb/log.md

Prepend a new entry at the top (after the frontmatter and heading), using this exact format:

```
## [YYYY-MM-DD] ingest | Source Title
Ingested from `kb/raw/<category>/<filename>`.
Summary: <one-sentence summary of the source content>
Pages created: <list of new pages>
Pages updated: <list of updated pages>
```

## Step 7: Report

Print a summary of what was done:
- Source file ingested
- Pages created (with paths)
- Pages updated (with paths)
- Total pages affected
