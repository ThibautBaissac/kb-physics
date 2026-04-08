# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A personal LLM-maintained knowledge base about physics, cosmology, and quantum physics — following Karpathy's architecture. No code to build or test — the repo is structured markdown compiled and maintained by an LLM via slash commands. The LLM acts as a **compiler**: it reads raw sources (articles, papers, talks) and produces a structured, interlinked physics wiki.

## Commands

Operations are slash commands (`.claude/commands/kb/`) and skills (`.claude/skills/`):

| Command | Usage | Purpose |
|---------|-------|---------|
| `/kb:fetch` | `/kb:fetch https://www.quantamagazine.org/...` | Fetch article from URL, create raw source, then ingest into KB |
| `/kb:ingest` | `/kb:ingest kb/raw/articles/2026-04-06-doc.md` | 7-step process: read source, create/update wiki pages, update index + log |
| `/kb:query` | `/kb:query What is the holographic principle?` | Navigate KB, synthesize answer with citations, optionally file as new page |
| `/kb:lint` | `/kb:lint` or `/kb:lint fix` | Health check: contradictions, orphans, stale content, broken links |

`/kb:query` is a skill (`.claude/skills/kb-query/`) — it auto-activates when you ask physics questions.

Convert non-markdown files before ingesting:
```bash
./kb/scripts/convert.sh <input-file> [category]
# categories: articles, papers, books, talks (default: articles)
# requires: pandoc (PDF/HTML/DOCX), python-pptx (slides)
```

Batch-fetch multiple articles at once:
```bash
# From a file (one URL per line, # comments and blank lines ignored):
./kb/scripts/batch-fetch.sh urls.txt

# From arguments:
./kb/scripts/batch-fetch.sh "https://url1" "https://url2" "https://url3"
```
Each URL runs `/kb:fetch` in its own non-interactive Claude session (`claude -p`), auto-confirming ingestion. Prints progress and a pass/fail summary at the end.

## Architecture

Three layers with strict ownership:

- **`kb/raw/`** — Immutable source material. Humans curate, LLM never modifies. Files named `YYYY-MM-DD-short-title.md` with YAML frontmatter (`title`, `description`, `created_at`, `source`, `type`; external sources also require `url`, `author`, `publication`).
- **`kb/theories/`, `kb/concepts/`, `kb/people/`, `kb/experiments/`, `kb/open-questions/`** — Compiled wiki. LLM owns entirely. Every page has frontmatter (`title`, `description`, `type`, `evidence`, `created_at`, `updated_at`, `related`, `sources`, and optional `tags` from a controlled vocabulary) and backlinks via relative markdown links. The `related` field uses relative paths from `kb/` (not bare filenames). The `evidence` field is `primary`, `secondary`, or `community`.
- **`kb/CLAUDE.md`** — The authoritative schema. Defines page format, page types, evidence tiers, linking conventions, and operation procedures. **Read this before any KB operation.**
- **`viz/`** — Optional visualization layer (Vite + D3 app). Generates an interactive knowledge graph from compiled wiki pages. Not part of KB operations — used for exploring the graph visually.

Supporting files:
- **`kb/index.md`** — Master hub linking to section indexes (`kb/index-theories.md`, `kb/index-concepts.md`, `kb/index-people.md`, `kb/index-experiments.md`, `kb/index-open-questions.md`). Read the hub first, then drill into the relevant section.
- **`kb/log.md`** — Append-only reverse-chronological activity log.

## Viz Development

The `viz/` app is a Vite + D3 frontend with an Express + TypeScript backend. All commands run from `viz/`:

```bash
cd viz
npm run dev      # dev server (Vite + Express + file watcher)
npm run build    # parse KB + production build
npm run parse    # regenerate src/data/kb-graph.json from KB
npm run server   # Express API only
```

## Key Rules

1. `kb/raw/` is immutable — never modify source files after adding them
2. All compiled pages trace back to sources — no unsourced claims
3. All links are relative markdown links (`[Text](../path/to/page.md)`)
4. No orphan pages — every page links to at least one other
5. Don't manually edit compiled pages — they get overwritten on next ingest/lint
6. Page types: `concept`, `theory`, `person`, `experiment`, `summary`, `open-question`, `principle`, `overview` (see `kb/CLAUDE.md` for where each lives)
