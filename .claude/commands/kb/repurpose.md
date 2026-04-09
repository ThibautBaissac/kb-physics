---
description: Repurpose the KB for a different topic — cleans content, rewrites schema, updates tooling and viz
argument-hint: "<topic>"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
effort: high
---

Repurpose this knowledge base for a new topic. The new topic is: $ARGUMENTS

This command transforms the entire project — schema, commands, skills, visualization, and documentation — from the current domain to the new one. Follow these steps exactly in order. Do NOT skip any step.

## Step 1: Design the new KB structure

Based on the topic, design the full KB structure. Consider what makes sense for this specific domain.

### Wiki categories

The current categories are `theories/`, `concepts/`, `people/`, `experiments/`, `open-questions/`. Decide whether to keep them or replace them with domain-appropriate alternatives. Examples:

- **Science domains** (biology, chemistry): theories, concepts, people, experiments, open-questions (keep as-is)
- **History / archeology**: periods, concepts, people, sites, open-questions
- **Law**: doctrines, concepts, people, case-law, open-questions
- **Web development**: frameworks, concepts, people, tools, open-questions
- **Music**: genres, concepts, people, works, open-questions

Aim for 4–6 categories. Each category needs a corresponding page type and index file.

### Raw source categories

The current categories are `articles/`, `papers/`, `books/`, `talks/`. These work for most academic/journalism domains. Consider alternatives only if the domain has clearly different source types (e.g., `filings/`, `datasets/`, `transcripts/`).

### Tag vocabulary

Design 10–20 tags that cover the major sub-areas of the topic. Each tag should have a short description of what it covers. Use kebab-case. Examples:

- **Archeology**: `prehistory`, `classical-antiquity`, `medieval`, `dating-methods`, `excavation-techniques`, `ceramics`, `lithics`, `funerary-practices`, `settlement-patterns`, `maritime-archaeology`, `digital-methods`, `conservation`, `cultural-heritage`
- **Web development**: `frontend`, `backend`, `databases`, `devops`, `security`, `performance`, `accessibility`, `testing`, `api-design`, `architecture`, `css`, `javascript`, `typescript`, `react`, `node`

### Evidence tiers

The default tiers (`primary`, `secondary`, `community`) work for most domains. Only customize if the domain has a clearly different trust hierarchy. For example:

- **Law**: `statute` (legislation), `case-law` (judicial decisions), `commentary` (legal scholarship)
- **Most other domains**: keep `primary`, `secondary`, `community`

### Page types

Map each wiki category to a page type. Keep `summary`, `overview`, `principle` as universal types. The category-specific types replace the current `concept`, `theory`, `person`, `experiment`, `open-question`.

### Present the proposal

Print the full proposal in a structured format:

```
## Proposed KB Structure for: <Topic>

### Wiki Categories
| Directory | Page Type | Purpose |
|-----------|-----------|---------|
| <dir>/    | <type>    | <desc>  |

### Raw Source Categories
- <category>/ — <description>

### Tag Vocabulary
| Tag | Covers |
|-----|--------|
| <tag> | <description> |

### Evidence Tiers
| Tier | Meaning | Example |
|------|---------|---------|
| <tier> | <meaning> | <example> |

### Page Types
| Type | Purpose | Location |
|------|---------|----------|
| <type> | <desc> | <dir>/   |
```

**Ask the user to confirm or adjust before proceeding.** Do not continue until the user approves.

## Step 2: Create a safety commit

Before making any destructive changes, commit the current state so changes can be reverted:

```bash
git add -A && git commit -m "pre-repurpose snapshot (auto)"
```

## Step 3: Clean all content

Delete all compiled wiki pages, raw sources, and viz artifacts. Keep directory structure intact.

```bash
# Delete compiled wiki pages (current category dirs)
rm -f kb/theories/* kb/concepts/* kb/people/* kb/experiments/* kb/open-questions/*

# Delete raw sources (keep directories)
rm -f kb/raw/articles/* kb/raw/papers/* kb/raw/books/* kb/raw/talks/*

# Delete viz artifacts and chat history
rm -f viz/artifacts/*.json viz/chats/*.json

# Delete generated graph data
rm -f viz/src/data/kb-graph.json
```

## Step 4: Restructure directories

If the wiki categories changed from the defaults (theories, concepts, people, experiments, open-questions):

1. Create new wiki directories under `kb/`
2. Remove old wiki directories that are no longer needed
3. Create new index files (`kb/index-<category>.md`) for each new category
4. Remove old index files for removed categories

If the raw source categories changed from the defaults (articles, papers, books, talks):

1. Create new directories under `kb/raw/`
2. Remove old directories that are no longer needed

## Step 5: Rewrite `kb/CLAUDE.md`

Rewrite the entire file, preserving the overall structure but replacing all domain-specific content. Use the approved proposal from Step 1. The file must include:

- Domain intro (line 1–3)
- Updated directory tree matching the new categories
- Raw source descriptions for the new source categories
- Evidence tier table with domain-appropriate examples
- Page type table matching the new categories
- Person/people page threshold (adapt the criterion to the domain — e.g., "3+ source appearances or foundational contribution")
- Linking conventions (unchanged)
- Tag vocabulary table with all approved tags and descriptions
- Operations section (ingest, fetch, query, lint, compile — update category references)
- Index and log format (update category references)

Read the current `kb/CLAUDE.md` first to preserve the full structure, then rewrite it completely.

## Step 6: Update commands and skills

### `.claude/commands/kb/ingest.md`

Read the file and replace:
- All references to "physics concepts", "physics theory", "physics" with the new domain
- All references to wiki categories (theories/, concepts/, people/, experiments/, open-questions/) with the new categories if they changed
- All references to index files (index-theories.md, index-concepts.md, etc.) with the new index files if categories changed
- Update the page creation criteria section to use domain-appropriate terminology
- Update the "Overview page" example to use a domain-relevant example

### `.claude/commands/kb/lint.md`

Read the file and replace:
- The "Missing theory pages" example (line 59) with a domain-appropriate example
- All references to wiki categories and index files if they changed
- The "Missing people pages" criterion — adapt to the domain

### `.claude/commands/kb/fetch.md`

Read the file and replace:
- Source category descriptions in Step 2 (lines 98–100) with the new raw source categories and their descriptions
- The example URL in the placeholder if physics-specific

### `.claude/skills/kb-query/SKILL.md`

Read the file and replace:
- "physics question" in the description with the new domain
- "theories, concepts, people, experiments" with the new category names
- All references to index files if they changed
- All references to wiki categories if they changed

## Step 7: Update viz layer

### `viz/src/constants.js`

Replace the `TAG_COLORS` object (lines 19–37) with the new tags. Assign distinct, visually appealing hex colors to each tag. Use a spread of hues from this palette:

```
purples: #a78bfa, #818cf8, #6366f1, #c084fc, #e879f9, #c4b5fd
pinks/reds: #f472b6, #f87171, #fb7185
oranges/yellows: #fb923c, #f97316, #fbbf24, #feca57
greens: #34d399, #7ee787, #2dd4bf, #a3e635
blues: #60a5fa, #58a6ff, #38bdf8
grays: #94a3b8, #d4d4d8
```

The `TYPE_COLORS` object (lines 11–17) should be updated if page types changed — map each new page type to a color.

### `viz/src/index.html`

- Line 6: Update `<title>` from "KB Physics Explorer" to "KB <Topic> Explorer"
- Line 14: Update `alt` text
- Line 15: Update toolbar text from `KB <strong>Physics</strong>` to `KB <strong><Topic></strong>`
- Line 72: Update placeholder from "Ask a question about physics..." to "Ask a question about <topic>..."
- Line 88: Update the placeholder URL to a domain-appropriate example

### `viz/server/index.ts`

- Line 9: Update console message from "KB Physics API server" to "KB <Topic> API server"

### `viz/server/agent-prompt.md`

- Line 1: Update from "physics knowledge base assistant" to "<topic> knowledge base assistant"
- Line 3: Update from "physics questions" to "<topic> questions"

### `viz/server/kb-parser.ts`

Only update if categories changed:
- Line 8: Update `WIKI_DIRS` array to match new wiki categories
- Line 9: Update `RAW_DIRS` array to match new raw source categories

### `viz/package.json`

- Line 2: Update `name` from "kb-physics-viz" to "kb-<topic-slug>-viz"

## Step 8: Update root documentation

### `CLAUDE.md` (root)

Read the file and update:
- The domain intro ("A personal LLM-maintained knowledge base about physics, cosmology, and quantum physics") with the new topic
- The architecture section — update directory descriptions to match new categories
- The "Key Rules" section — update page types list
- The command table descriptions if relevant
- Preserve everything that is domain-agnostic (development instructions, scripts, viz commands)

### `README.md`

Read the file and update:
- Title and intro (lines 1–10) with the new topic
- Architecture section — update directory descriptions
- All physics-specific references in the body (lines 1–220)
- Keep the "Adapting to Another Topic" section (lines 224–309) as-is — it's still useful
- Keep the Credits section as-is

## Step 9: Reset indexes and log

### `kb/index.md`

Rewrite as an empty master hub with the new categories:

```markdown
---
title: Knowledge Base Index
description: Master hub linking to all section indexes — read this first when navigating the KB
created_at: <today>
updated_at: <today>
---

# Knowledge Base Index

Master hub for the <topic> knowledge base. Start here, then drill into the relevant section index.

| Section | Pages | Index |
|---------|------:|-------|
| <Category 1> | 0 | [index-<cat1>.md](index-<cat1>.md) |
| <Category 2> | 0 | [index-<cat2>.md](index-<cat2>.md) |
...

## Raw Sources

(none yet)
```

### Section index files

Create one empty index file per wiki category:

```markdown
---
title: <Category> Index
description: All <category> entries in the knowledge base
created_at: <today>
updated_at: <today>
---

# <Category>

(no entries yet)
```

### `kb/log.md`

Reset to:

```markdown
---
title: Knowledge Base Activity Log
description: Append-only reverse-chronological record of all KB operations
created_at: <today>
---

# Activity Log

## [<today>] repurpose | Repurposed KB for <topic>
Repurposed from physics to <topic>.
Categories: <list of wiki categories>
Tags: <list of tags>
```

### `kb/scripts/convert.sh`

Only update if raw source categories changed:
- Line 52: Update `VALID_CATEGORIES` to match new raw source categories

## Step 10: Rebuild viz data

```bash
cd viz && npm run parse
```

This regenerates `viz/src/data/kb-graph.json` with the (now empty) graph.

## Step 11: Report

Print a summary:

```
## Repurpose Complete

**Topic**: <topic>

### Wiki Categories
<list with directory names>

### Tags
<list of tags>

### Files Modified
- kb/CLAUDE.md (rewritten)
- kb/index.md + section indexes (reset)
- kb/log.md (reset)
- .claude/commands/kb/ingest.md (updated)
- .claude/commands/kb/lint.md (updated)
- .claude/commands/kb/fetch.md (updated)
- .claude/skills/kb-query/SKILL.md (updated)
- viz/src/constants.js (updated)
- viz/src/index.html (updated)
- viz/server/index.ts (updated)
- viz/server/agent-prompt.md (updated)
- viz/server/kb-parser.ts (updated if categories changed)
- viz/package.json (updated)
- CLAUDE.md (updated)
- README.md (updated)
- kb/scripts/convert.sh (updated if raw categories changed)

### Next Steps
1. Review the changes: `git diff`
2. Start adding sources: `/kb:fetch <url>`
3. Or batch-fetch: `./kb/scripts/batch-fetch.sh urls.txt`
```
