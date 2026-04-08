# Knowledge Base Schema

This is an LLM-maintained knowledge base for physics, cosmology, and quantum physics — following Karpathy's LLM Knowledge Base architecture. The LLM compiles raw source material into a structured, interlinked markdown wiki.

## Architecture

```
kb/
├── raw/              # Immutable source material (human-curated, LLM never modifies)
│   ├── _originals/   # Non-markdown originals (PDF, PPTX, images, etc.)
│   ├── articles/     # Science journalism (Quanta, Nature News, New Scientist, etc.)
│   ├── papers/       # Arxiv preprints, peer-reviewed papers, lecture notes
│   ├── books/        # Book chapters, textbook excerpts
│   └── talks/        # Conference talks, lectures, interviews
├── scripts/          # Conversion and maintenance scripts
├── theories/         # Compiled wiki: physics theories and frameworks
├── concepts/         # Compiled wiki: cross-cutting physics concepts
├── people/           # Compiled wiki: physicists and their contributions
├── experiments/      # Compiled wiki: experiments, observatories, instruments
├── open-questions/   # Compiled wiki: unsolved problems, active debates
├── index.md          # Master index (LLM-maintained)
└── log.md            # Append-only activity log
```

## Roles

- **Humans**: Curate what goes into `kb/raw/`, define the schema, direct analysis, review compiled output.
- **LLM**: Reads raw sources, compiles wiki pages, maintains cross-references, updates indexes, runs lint passes. The LLM owns everything outside `kb/raw/`.

## Raw Sources (`kb/raw/`)

Source material is organized by type:

- `kb/raw/articles/` — Science journalism: Quanta Magazine, Nature News, New Scientist, Scientific American, etc.
- `kb/raw/papers/` — Arxiv preprints, peer-reviewed papers, lecture notes, textbook excerpts
- `kb/raw/books/` — Book chapters, popular science book excerpts
- `kb/raw/talks/` — Conference talks, lecture transcripts, podcast transcripts, interviews
- `kb/raw/_originals/` — Local-only cache of non-markdown originals (PDF, PPTX, images, etc.). **Git-ignored** — not committed to the repo. Never read by the LLM directly unless explicitly asked.

### File Format

All files in `kb/raw/` subdirectories (except `_originals/`) must be **markdown**. Non-markdown sources are converted using `kb/scripts/convert.sh`, which:
1. Copies the original to `kb/raw/_originals/` (local only, git-ignored)
2. Converts the content to markdown
3. Adds frontmatter with an `original:` field pointing to the local cache path

### Conversion

Run the conversion script for non-markdown files:

```bash
./kb/scripts/convert.sh <input-file> [category]
# Example: ./kb/scripts/convert.sh ~/Downloads/paper.pdf papers
```

Supported formats: PDF, HTML, DOCX, PPTX, CSV, JSON, TXT, images (PNG/JPG/GIF/WebP/SVG).

For images and unconvertible PDFs, the script creates a stub. During ingestion, read the original file directly (Claude can read PDFs and images natively) and update the stub with the extracted content.

### Rules

- Files in `kb/raw/` are **immutable** once added. Never modify them.
- Name files: `YYYY-MM-DD-short-title.md`
- Add YAML frontmatter with at minimum: `title`, `description`, `created_at`, `source`, `type`
- **Required metadata for external sources**: `url` (original URL, or "n/a" if pasted), `author`, `publication`
- If a file has an `original:` field in frontmatter, the non-markdown original may be available locally at that path (git-ignored, only on the machine that ran the conversion)

## Compiled Wiki Pages

### Page Format

Every compiled wiki page must follow this structure:

```markdown
---
title: Page Title
description: One-line summary helping the LLM decide if this page is relevant
type: <concept|theory|person|experiment|summary|open-question|principle|overview>
evidence: <primary|secondary|community>
created_at: YYYY-MM-DD
updated_at: YYYY-MM-DD
related: [path/to/page.md, path/to/other.md]
sources: [list, of, raw, source, filenames]
tags: [tag1, tag2]
---

# Page Title

Page content with **backlinks** to related pages using relative markdown links: [Related Concept](../concepts/related-concept.md).

## Sources

- [Source Title](../raw/type/filename.md)
```

### Evidence Tiers

Every compiled page must declare an `evidence` level in frontmatter:

| Tier | Meaning | Example |
|------|---------|---------|
| `primary` | Peer-reviewed papers, textbooks, arxiv preprints, official experimental results | A Nature Physics paper, Weinberg's QFT textbook, LIGO data release |
| `secondary` | Science journalism summarizing primary research | Quanta Magazine article, Nature News piece, New Scientist feature |
| `community` | Blog posts, YouTube lectures, Reddit discussions, popular science | Sabine Hossenfelder's blog, PBS Space Time, r/physics threads |

When a page draws from multiple sources at different tiers, use the **lowest** (weakest) tier.

### Page Types

| Type | Purpose | Location |
|------|---------|----------|
| `concept` | Cross-cutting physics concept | `kb/concepts/` |
| `theory` | Physics theory or framework | `kb/theories/` |
| `person` | Physicist and their contributions | `kb/people/` |
| `experiment` | Experiment, observatory, or instrument | `kb/experiments/` |
| `summary` | Summary of a raw source | any compiled folder |
| `open-question` | Unsolved problem or active debate | `kb/open-questions/` |
| `principle` | Fundamental principle or law | `kb/concepts/` |
| `overview` | High-level orientation page | any compiled folder |

> **Person page threshold**: Only create a `person` page when the individual has 3+ source appearances across the KB, or made a foundational contribution (Nobel Prize, named theorem/effect, founded a subfield). Otherwise, mention the person inline in the relevant concept/theory/experiment page.

### Linking Conventions

- Always use relative markdown links: `[Link Text](../path/to/page.md)`
- The `related` frontmatter field uses **relative paths from `kb/`** (e.g., `related: [theories/string-theory.md, concepts/supersymmetry.md]`), not bare filenames
- Every page should link to at least one other page (no orphans)
- When a concept spans multiple theories, create a shared page in `kb/concepts/` and link from theory pages

### Tags

The `tags` frontmatter field is optional. Use only tags from the vocabulary below. Assign 1-4 tags per page.

| Tag | Covers |
|-----|--------|
| `quantum-mechanics` | Wave function, measurement, entanglement, decoherence |
| `quantum-field-theory` | QFT formalism, renormalization, scattering amplitudes |
| `quantum-information` | Qubits, qudits, magic states, quantum computation, quantum simulation |
| `quantum-gravity` | Approaches to quantizing gravity: string theory, quadratic gravity, loops |
| `string-theory` | String-specific: landscape, compactification, extra dimensions, bootstrap |
| `general-relativity` | Spacetime curvature, gravitational waves, cosmological solutions |
| `cosmology` | Inflation, dark energy, dark matter, cosmological constant, early universe |
| `black-holes` | Entropy, information paradox, Hawking radiation, no-hair, PBH |
| `particle-physics` | Standard Model, Higgs, collider results, BSM searches |
| `nuclear-and-subatomic` | Strong force, QCD, quarks, antimatter, CPT |
| `astrophysics` | Supernovae, neutrinos, gravitational lensing, time-domain astronomy |
| `condensed-matter` | Electron hydrodynamics, graphene, quantum materials |
| `thermodynamics` | Quantum thermodynamics, zero-point energy, entropy |
| `mathematical-physics` | Hilbert space, complex numbers, holography, bootstrap formalism |
| `experimental-methods` | Detectors, observatories, colliders, muography, simulation techniques |
| `foundations` | Interpretations, measurement problem, Bell's theorem, contextuality |
| `history-and-philosophy` | Historical context, paradigm shifts, philosophy of science |

## Operations

### 1. Ingest

When a new source is added to `kb/raw/`:

1. Read the source completely
2. Write a summary page in the appropriate location
3. Update or create concept/theory/person/experiment pages touched by this source
4. Add backlinks from existing pages to new content
5. Update `kb/index.md` with new entries
6. Append an entry to `kb/log.md`

A single source typically touches 10-15 wiki pages.

### 2. Fetch

When given a URL to an article or paper:

1. Fetch the article content via WebFetch
2. Create a raw source file in the appropriate `kb/raw/` subdirectory with proper frontmatter
3. Chain into the Ingest operation

### 3. Query

When answering questions against the KB:

1. Read `kb/index.md` (master hub) and relevant section indexes to find pages
2. Read the relevant pages
3. Synthesize an answer with citations to specific pages
4. If the answer is substantial and reusable, file it as a new wiki page

### 4. Lint

Periodic health checks (run on request):

- Find contradictions between pages
- Identify orphan pages (no incoming links)
- Flag stale content (old `updated_at` dates)
- Suggest missing concept pages based on frequently referenced but undefined terms
- Check cross-theory consistency

### 5. Compile Outputs

On request, generate derived artifacts from wiki content:

- Topic overviews
- Concept maps
- Comparison tables
- Timeline summaries

## Index and Log

### `kb/index.md` (Master Hub)

The master index is a slim hub linking to section indexes:

- `kb/index-theories.md` — all theory entries
- `kb/index-concepts.md` — all concept entries
- `kb/index-people.md` — all people entries
- `kb/index-experiments.md` — all experiment entries
- `kb/index-open-questions.md` — all open question entries

The master hub also contains the Raw Sources listing directly.

Each section index follows the format:

```markdown
- [Page Title](category/filename.md) — one-line description
```

Entries are sorted alphabetically within each section index. Update page counts in the master hub table when adding or removing pages.

### `kb/log.md`

Append-only, reverse chronological. Each entry:

```markdown
## [YYYY-MM-DD] action | Title
Brief description of what was done.
Pages affected: [list of pages created or updated]
```

Valid actions: `ingest`, `fetch`, `query`, `lint`, `compile`, `update`
