# Physics Knowledge Base

A personal LLM-maintained knowledge base about physics, cosmology, and quantum physics — following [Karpathy's LLM Knowledge Base architecture](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). No vector databases, no RAG infrastructure — just structured markdown compiled and maintained by an LLM.

The LLM acts as a **compiler**, not a retriever. It reads raw source material (articles, papers, talks) and produces a structured, interlinked physics wiki. The wiki is a persistent, compounding artifact — cross-references are already there, contradictions have already been flagged.

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping." — Andrej Karpathy

## Why This Exists

- **Physics knowledge is scattered.** Across Quanta articles, arxiv papers, textbooks, YouTube lectures. This KB compiles it into one interlinked wiki.
- **Context is lost between LLM conversations.** The LLM has persistent, structured context about physics topics, so each conversation builds on prior understanding.
- **Traditional notes die.** They die because maintenance is tedious. The LLM handles all the bookkeeping — cross-references, indexes, summaries — at near-zero cost. You just curate what goes in.

## How It Works

### Three Layers

| Layer | Owner | What it contains |
|-------|-------|-----------------|
| **Raw sources** (`kb/raw/`) | You curate | Immutable source documents — articles, papers, book excerpts, lecture transcripts |
| **Compiled wiki** (`kb/theories/`, `kb/concepts/`, `kb/people/`, `kb/experiments/`, `kb/open-questions/`) | LLM maintains | Structured markdown pages — summaries, concept pages, theory pages, physicist profiles, all interlinked |
| **Schema** (`kb/CLAUDE.md`) | You define | Configuration telling the LLM how the wiki is structured, what conventions to follow |

### Five Operations

```
  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
  │  FETCH  │     │ INGEST  │     │  QUERY  │     │  LINT   │     │ COMPILE │
  │         │     │         │     │         │     │         │     │         │
  │ URL ──► │     │ Source   │     │ Ask a   │     │ Health  │     │ Generate│
  │ raw +   │     │ ──► Wiki │     │ question│     │ check   │     │ outputs │
  │ wiki    │     │ pages   │     │ get an  │     │ find    │     │ guides, │
  │ pages   │     │ + index │     │ answer  │     │ issues  │     │ tables  │
  └─────────┘     └─────────┘     └─────────┘     └─────────┘     └─────────┘
```

| Operation | What happens | When to use |
|-----------|-------------|-------------|
| **Fetch** | LLM fetches an article from a URL, creates a raw source file, and ingests it in one step. | You find an interesting article online |
| **Ingest** | LLM reads a raw source, writes summaries, creates/updates concept and theory pages, adds cross-references, updates index and log. One source typically touches **10-15 wiki pages**. | A new paper, article, or lecture transcript is added manually |
| **Query** | LLM reads the index, navigates to relevant pages, synthesizes an answer with citations. Substantial answers get filed back as new wiki pages. | You want to understand a topic or connection |
| **Lint** | LLM scans for contradictions, stale content, orphan pages, missing concepts, broken links. Can auto-fix safe issues. | Periodically, or when the KB grows |
| **Compile** | LLM generates derived artifacts from wiki content — topic overviews, concept maps, comparison tables, timelines. | On demand |

## Quick Start

### 1. Fetch an article (easiest)

```
/kb:fetch https://www.quantamagazine.org/are-strings-still-our-best-hope-for-a-theory-of-everything-20260323/
```

This fetches the article, creates a raw source file, and ingests it into the wiki — all in one step.

### 2. Add a source manually

**Markdown** — drop it into the appropriate `kb/raw/` subdirectory with frontmatter:

```yaml
---
title: "Bootstrap Arguments for String Theory"
description: Recent bootstrap research suggesting string theory emerges uniquely from certain assumptions
created_at: 2026-03-23
source: external
type: article
url: https://www.quantamagazine.org/...
author: Natalie Wolchover
publication: Quanta Magazine
---
```

**Any other format** (PDF, DOCX, PPTX, HTML) — convert first:

```bash
./kb/scripts/convert.sh ~/Downloads/paper.pdf papers
```

### 3. Ingest

```
/kb:ingest kb/raw/articles/2026-03-23-bootstrap-string-theory.md
```

### 4. Query

```
/kb:query What is the bootstrap approach to string theory?
```

### 5. Lint

```
/kb:lint              # Full KB health check
/kb:lint fix          # Auto-fix safe issues
```

## Directory Structure

```
.
├── .claude/
│   └── commands/kb/        # Slash commands (run from repo root)
│       ├── fetch.md        #   /kb:fetch  — URL → raw source → wiki pages
│       ├── ingest.md       #   /kb:ingest — raw source → wiki pages
│       ├── query.md        #   /kb:query  — answer with citations
│       └── lint.md         #   /kb:lint   — health check + auto-fix
│
├── kb/
│   ├── CLAUDE.md           # Schema — conventions, page formats, operations
│   ├── index.md            # Master index of all compiled pages
│   ├── log.md              # Append-only activity log
│   │
│   ├── raw/                # Source material (human-curated, immutable)
│   │   ├── _originals/     #   Local cache of non-markdown originals (git-ignored)
│   │   ├── articles/       #   Science journalism (Quanta, Nature News, etc.)
│   │   ├── papers/         #   Arxiv preprints, peer-reviewed papers, lecture notes
│   │   ├── books/          #   Book chapters, textbook excerpts
│   │   └── talks/          #   Conference talks, lectures, interviews
│   │
│   ├── scripts/
│   │   └── convert.sh      # Format conversion (PDF, DOCX, PPTX, etc. to markdown)
│   │
│   ├── theories/           # Compiled: physics theories and frameworks
│   ├── concepts/           # Compiled: cross-cutting physics concepts
│   ├── people/             # Compiled: physicists and their contributions
│   ├── experiments/        # Compiled: experiments, observatories, instruments
│   └── open-questions/     # Compiled: unsolved problems and active debates
│
├── README.md
└── .gitignore
```

## Slash Commands

All operations are standardized as Claude Code slash commands in `.claude/commands/kb/`.

| Command | Usage | What it does |
|---------|-------|-------------|
| `/kb:fetch` | `/kb:fetch https://www.quantamagazine.org/...` | Fetches article, creates raw source, ingests into wiki |
| `/kb:ingest` | `/kb:ingest kb/raw/articles/2026-03-23-doc.md` | Reads source, creates/updates wiki pages, updates index and log |
| `/kb:query` | `/kb:query What is quantum entanglement?` | Navigates the KB, synthesizes an answer with citations, optionally files it as a new page |
| `/kb:lint` | `/kb:lint` or `/kb:lint fix` | Checks for contradictions, orphans, stale content, missing descriptions, broken links |

## Frontmatter Reference

### Raw sources (`kb/raw/`)

```yaml
---
title: "Article or Paper Title"                  # Required
description: One-line summary for LLM scanning  # Required
created_at: 2026-03-23                           # Required — publication date
source: external                                 # Required — origin
type: article                                    # Required — matches subdirectory
url: https://...                                 # Required — original URL
author: Author Name                              # Required
publication: Quanta Magazine                     # Required
original: _originals/paper.pdf                   # Optional — non-markdown original
---
```

### Compiled wiki pages

```yaml
---
title: String Theory                                       # Required
description: Framework proposing 1D strings as fundamental # Required
type: theory                                               # Required — see page types
evidence: secondary                                        # Required — evidence tier
created_at: 2026-04-06                                     # Required
updated_at: 2026-04-06                                     # Required
related: [concepts/supersymmetry.md, people/witten.md]     # Optional — relative from kb/
sources: [2026-03-23-bootstrap-string-theory]               # Required — raw source filenames
---
```

**Page types:**

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

**Evidence tiers:**

| Tier | Meaning | Example |
|------|---------|---------|
| `primary` | Peer-reviewed papers, textbooks, arxiv preprints | Nature Physics paper, Weinberg's QFT textbook |
| `secondary` | Science journalism summarizing primary research | Quanta Magazine, Nature News |
| `community` | Blog posts, YouTube, Reddit, popular science | PBS Space Time, Sabine Hossenfelder's blog |

## Converting Non-Markdown Sources

`kb/scripts/convert.sh` converts files to markdown and caches the original locally (git-ignored).

```bash
./kb/scripts/convert.sh <input-file> [category]
# category: articles | papers | books | talks (default: articles)
```

| Format | Extension | Converter |
|--------|-----------|-----------|
| PDF | `.pdf` | pandoc / pdftotext / LLM-native fallback |
| HTML | `.html` `.htm` | pandoc |
| Word | `.docx` | pandoc |
| PowerPoint | `.pptx` | python-pptx (text + speaker notes) |
| CSV | `.csv` | Built-in (markdown table) |
| JSON | `.json` | Built-in (fenced code block) |
| Plain text | `.txt` | Built-in |
| Markdown | `.md` | Built-in (adds frontmatter if missing) |
| Images | `.png` `.jpg` `.gif` `.webp` `.svg` | Stub (LLM reads via vision during ingestion) |

**Prerequisites:** `brew install pandoc` for PDF/HTML/DOCX. `pip install python-pptx` for slides.

## Rules

1. **`kb/raw/` is immutable.** Once a source is added, never modify it. It's the historical record.
2. **The LLM owns everything else in `kb/`.** Don't manually edit compiled pages — they'll be overwritten on the next ingest or lint pass.
3. **You curate, the LLM compiles.** You decide what goes in. The LLM does the bookkeeping.
4. **Every claim traces to a source.** Compiled pages link back to raw sources. No source links = needs a lint pass.
5. **All links are relative.** Use `[Link Text](../path/to/page.md)`. No orphan pages.

## Credits

- Architecture: [Andrej Karpathy's LLM Knowledge Bases](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (April 2026)
- Tooling: [Claude Code](https://claude.ai/claude-code) slash commands for standardized operations
