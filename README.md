# Physics Knowledge Base

A personal LLM-maintained knowledge base about physics, cosmology, and quantum physics — following [Karpathy's LLM Knowledge Base architecture](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).

No vector databases, no RAG. Just structured markdown compiled and maintained by an LLM. **The architecture is domain-agnostic — [adapt it to any topic](#adapting-to-another-topic).**

The LLM acts as a **compiler**: it reads raw sources (articles, papers, talks) and produces a structured, interlinked physics wiki. Cross-references are already there, contradictions have already been flagged.

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping." — Andrej Karpathy

---

## Setup

This KB is operated entirely through [Claude Code](https://claude.ai/code) — Anthropic's CLI agent. The slash commands (`/kb:fetch`, `/kb:ingest`, etc.) and the auto-activating `/kb:query` skill all run inside Claude Code sessions.

### Prerequisites

| Tool | What for | Install |
|------|----------|---------|
| [Claude Code](https://claude.ai/code) | All KB operations (fetch, ingest, query, lint) | `npm install -g @anthropic-ai/claude-code` |
| `pandoc` | Converting PDF/HTML/DOCX to markdown | `brew install pandoc` |
| `python-pptx` | Converting PowerPoint slides | `pip install python-pptx` |

Pandoc and python-pptx are only needed if you ingest non-markdown files via `convert.sh`.

### Authentication

Claude Code needs an API key or OAuth token. Set one of these in your environment:

```bash
# Option A: API key (personal use)
export ANTHROPIC_API_KEY=sk-ant-...

# Option B: OAuth token (team / managed auth)
export CLAUDE_CODE_OAUTH_TOKEN=...
```

The Visual Explorer's agent backend (`viz/server/`) reads from a `.env` file at the repo root — create one with your key if you plan to use the chat feature:

```bash
# .env (git-ignored)
ANTHROPIC_API_KEY=sk-ant-...
```

### First run

```bash
git clone <this-repo> && cd kb-physics
claude    # opens Claude Code in this directory — slash commands are ready
```

---

## Quick Start

**Fetch an article** (one step — fetches, saves, and ingests):

```
/kb:fetch https://www.some-article.com/
```

**Add a source manually**, then ingest it:

```bash
# Markdown: drop into kb/raw/articles/ with frontmatter, then:
/kb:ingest kb/raw/articles/2026-03-23-bootstrap-string-theory.md

# PDF, DOCX, PPTX, HTML: convert first, then ingest:
./kb/scripts/convert.sh ~/Downloads/paper.pdf papers
/kb:ingest kb/raw/papers/2026-03-23-paper.md
```

**Batch-fetch** multiple articles at once:

```bash
./kb/scripts/batch-fetch.sh urls.txt                    # one URL per line
./kb/scripts/batch-fetch.sh "https://url1" "https://url2"
```

**Ask a question** (cites wiki pages, optionally files the answer):

```
/kb:query What is the bootstrap approach to string theory?
```

**Health check** the KB:

```
/kb:lint          # report issues
/kb:lint fix      # auto-fix safe ones
```

---

## How It Works

### You curate. The LLM compiles.

You decide what goes in. The LLM does all the bookkeeping — summaries, cross-references, indexes, evidence tiers.

| Layer | Owner | Contents |
|-------|-------|----------|
| **Raw sources** (`kb/raw/`) | You | Immutable source documents — articles, papers, book excerpts, talks |
| **Compiled wiki** (`kb/theories/`, `concepts/`, `people/`, `experiments/`, `open-questions/`) | LLM | Interlinked markdown pages with frontmatter, backlinks, and source citations |
| **Schema** (`kb/CLAUDE.md`) | You | Conventions the LLM follows — page format, evidence tiers, linking rules |

### Operations

| Operation | Command | What happens |
|-----------|---------|-------------|
| **Fetch** | `/kb:fetch <url>` | URL → raw source → wiki pages (all-in-one) |
| **Ingest** | `/kb:ingest <path>` | Raw source → summaries, concept/theory/people pages, index, log. One source typically touches **10-15 pages**. |
| **Query** | `/kb:query <question>` | Navigates KB, synthesizes cited answer, optionally files as a new page |
| **Lint** | `/kb:lint [fix]` | Finds contradictions, orphans, stale content, broken links. `fix` auto-repairs safe issues. |

`/kb:query` also auto-activates when you ask physics questions without invoking it.

---

## Directory Structure

```
kb/
├── CLAUDE.md              # Schema — the authoritative reference for all conventions
├── index.md               # Master index of all compiled pages
├── log.md                 # Append-only activity log
│
├── raw/                   # Source material (immutable once added)
│   ├── articles/          #   Science journalism (Quanta, Nature News, ...)
│   ├── papers/            #   Arxiv, peer-reviewed, lecture notes
│   ├── books/             #   Book chapters, textbook excerpts
│   ├── talks/             #   Conference talks, lectures, interviews
│   └── _originals/        #   Non-markdown originals (git-ignored)
│
├── theories/              # Compiled: physics theories and frameworks
├── concepts/              # Compiled: cross-cutting concepts and principles
├── people/                # Compiled: physicists and contributions
├── experiments/           # Compiled: experiments, observatories, instruments
├── open-questions/        # Compiled: unsolved problems, active debates
│
└── scripts/
    ├── convert.sh         # PDF/DOCX/PPTX/HTML → markdown
    └── batch-fetch.sh     # Fetch multiple URLs in one go

viz/                       # Visual Explorer (optional, see below)
```

---

## Raw Source Format

Every file in `kb/raw/` is markdown with YAML frontmatter:

```yaml
---
title: "Article Title"
description: One-line summary
created_at: 2026-03-23        # publication date, not today
source: external
type: article                  # matches subdirectory: article, paper, book, talk
url: https://...
author: Author Name
publication: Quanta Magazine
---

Full article text here...
```

For non-markdown files, convert first:

```bash
./kb/scripts/convert.sh <file> [category]
# categories: articles (default), papers, books, talks
# requires: pandoc (PDF/HTML/DOCX), python-pptx (PPTX)
```

---

## Rules

1. **`kb/raw/` is immutable.** Never modify a source after adding it.
2. **The LLM owns everything else in `kb/`.** Don't hand-edit compiled pages — they get overwritten on next ingest or lint.
3. **Every claim traces to a source.** No source links = needs a lint pass.
4. **All links are relative.** `[Text](../path/to/page.md)` — no orphan pages.
5. **`kb/CLAUDE.md` is the schema.** Page format, evidence tiers, linking conventions — all defined there.

---

## Visual Explorer

An interactive web app for exploring the KB as a graph. Built with Vite, D3.js, and a Claude agent backend.

```bash
cd viz && npm install       # first time only
./viz/start.sh              # starts Vite (:5173) + API (:3001)
open http://localhost:5173
./viz/stop.sh               # when done
```

**Four views:**

| View | What it shows |
|------|---------------|
| **Graph** | Force-directed network of all pages, colored by type, sized by connections |
| **Timeline** | Temporal axis of sources and compiled pages |
| **Diagram** | Concept maps and hierarchy trees (agent-generated) |
| **Table** | Sortable, filterable list of all pages with metadata |

The built-in **Chat** panel sends questions to a Claude agent that reads the KB and can generate visual artifacts rendered live in the browser.

---

## Adapting to Another Topic

The architecture is domain-agnostic. You can fork this repo and repurpose it for any knowledge domain (biology, history, law, etc.). Here's how to clean it up.

### 1. Clear the content

Remove all physics-specific content but keep the directory structure and tooling:

```bash
# Delete compiled wiki pages
rm kb/theories/* kb/concepts/* kb/people/* kb/experiments/* kb/open-questions/*

# Delete raw sources (keep the directories)
rm -rf kb/raw/articles/* kb/raw/papers/* kb/raw/books/* kb/raw/talks/*

# Delete viz artifacts and chat history
rm -f viz/artifacts/*.json viz/chats/*.json
```

Reset the index and log to empty shells:

```markdown
<!-- kb/index.md -->
# Knowledge Base Index

## Theories

## Concepts

## People

## Experiments

## Open Questions
```

```markdown
<!-- kb/log.md -->
# Activity Log
```

### 2. Rename directories (optional)

The folder names `theories/`, `concepts/`, `people/`, `experiments/`, `open-questions/` work for many domains. But if your domain calls for different categories (e.g. `case-law/`, `species/`, `events/`), rename them. Then update references in these files:

| File | What to change |
|------|----------------|
| `kb/CLAUDE.md` | Directory tree, page types table, operations, index format |
| `kb/index.md` | Section headings to match new directories |
| `.claude/commands/kb/ingest.md` | Step 3 — the list of page types to create/update |
| `.claude/commands/kb/lint.md` | Steps 1-2 — directories to scan and issue types |
| `.claude/skills/kb-query/SKILL.md` | Description and step 1 |

### 3. Update the domain references

Search-and-replace the physics-specific language across configuration files:

| File | What to change |
|------|----------------|
| `kb/CLAUDE.md` | Opening line ("physics, cosmology, and quantum physics"), evidence tier examples, page type descriptions |
| `.claude/commands/kb/ingest.md` | "physics concepts", "physics theory" → your domain terms |
| `.claude/skills/kb-query/SKILL.md` | "physics question" → your domain |
| `viz/server/agent-prompt.md` | "physics knowledge base assistant", directory descriptions, example content |
| `CLAUDE.md` | "physics, cosmology, and quantum physics" in the intro |
| `README.md` | Everything |

### 4. Adjust evidence tiers (optional)

The default tiers (`primary`, `secondary`, `community`) map to academic publishing norms. If your domain has different trust hierarchies, redefine them in `kb/CLAUDE.md`. For example, a legal KB might use `statute`, `case-law`, `commentary`.

### 5. Adjust raw source categories (optional)

The default categories (`articles/`, `papers/`, `books/`, `talks/`) cover academic and journalism sources. If your domain has different source types (e.g. `filings/`, `transcripts/`, `datasets/`), rename the directories under `kb/raw/` and update:

- `kb/CLAUDE.md` — the raw sources section
- `.claude/commands/kb/fetch.md` — step 2 (category detection)
- `kb/scripts/convert.sh` — the `VALID_CATEGORIES` variable

### 6. Start fresh

```bash
claude
/kb:fetch https://your-first-source.com/article
```

The slash commands, skill auto-activation, lint, batch-fetch, and the Visual Explorer all work unchanged — they operate on the structure, not the domain.

---

## Credits

- Architecture: [Andrej Karpathy's LLM Knowledge Bases](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- Tooling: [Claude Code](https://claude.ai/code) slash commands and skills
- Visual Explorer agent: [Claude Agent SDK](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)
