---
description: Health-check the KB for contradictions, orphans, stale content, and broken links
argument-hint: "[scope|fix]"
allowed-tools: Read, Write, Edit, Glob, Grep
effort: high
---

Run a lint pass on the knowledge base. Optional scope: $ARGUMENTS

If a scope is provided (e.g., a theory name, a concept, or a specific directory), focus the lint on that area. Otherwise, lint the entire KB.

Follow these steps exactly in order.

## Step 1: Read the KB state

- Read `kb/index.md` (master hub) and all section indexes (`kb/index-theories.md`, `kb/index-concepts.md`, `kb/index-people.md`, `kb/index-experiments.md`, `kb/index-open-questions.md`) to get the full page inventory.
- Read all compiled pages in `kb/theories/`, `kb/concepts/`, `kb/people/`, `kb/experiments/`, and `kb/open-questions/`.

## Step 2: Check for issues

Scan for each of these issue types:

### Contradictions
- Do any two pages make conflicting claims about the same topic?
- Do different theory pages describe conflicting predictions or assumptions without acknowledging the disagreement?

### Orphan pages
- Are there pages with no incoming links from other pages?
- Are there pages not listed in their section index?

### Stale content
- Are there pages with `updated_at` dates older than 30 days?
- Are there pages whose `sources` files have been updated since the page's `updated_at`?

### Missing or empty descriptions
- Are there pages with a missing or empty `description` field in frontmatter?

### Near-duplicate pages
- Are there two or more pages that cover substantially the same topic under different names (e.g., `quantum-entanglement.md` vs `entanglement.md`)?
- Check for: similar titles, overlapping descriptions, identical `sources`, or pages whose content is >70% redundant.
- Flag each pair with the recommended action: merge into one page.

### Missing evidence tiers
- Are there compiled pages missing the `evidence` frontmatter field?
- Are there pages with evidence claims that don't match their sources (e.g., `evidence: primary` but the source is a Quanta article)?

### Related field format
- Are there pages where the `related` frontmatter uses bare filenames instead of relative paths from `kb/` (e.g., `file.md` instead of `concepts/file.md`)?

### Invalid tags
- Are there compiled pages with `tags` values not in the controlled vocabulary defined in `kb/CLAUDE.md`?
- Flag any unrecognized tags. (Note: the `tags` field is optional — pages without `tags` are not an error, but pages with invalid tags are.)

### Source metadata gaps
- Are there raw sources missing required fields (`url`, `author`, `publication`)?

### Category gaps
Scan for named entities referenced across 2+ compiled pages that lack their own dedicated page:
- **Missing theory pages**: Named physics theories or frameworks referenced 2+ times but no `kb/theories/` page exists (e.g., "Loop Quantum Gravity" mentioned in 5 concept pages but no theory page)
- **Missing experiment pages**: Named experiments, observatories, or instruments referenced 2+ times but no `kb/experiments/` page exists
- **Missing concept pages**: Terms frequently cross-referenced but no `kb/concepts/` page exists
- **Missing people pages**: Named physicists with 3+ source appearances across the KB, or who made a foundational contribution (Nobel Prize, named theorem/effect, founded a subfield), but no `kb/people/` page exists. Do NOT flag people with fewer than 3 appearances unless they meet the foundational contribution criterion.
- **Missing overview pages**: 4+ pages sharing a common parent theme with no hub linking them (e.g., multiple QM interpretation pages but no "Interpretations of Quantum Mechanics" overview)
- **Uningested sources**: Raw sources present in `kb/raw/` but not referenced in any compiled page's `sources` frontmatter

### Broken links
- Do all relative markdown links point to files that actually exist?

### Index consistency
- Does every section index list every compiled page in its category?
- Does any section index reference a page that doesn't exist?
- Does the master hub (`kb/index.md`) link to all five section indexes?
- Does the Raw Sources section in `kb/index.md` list all raw sources?

## Step 3: Report findings

Print a structured report:

```
## Lint Report — YYYY-MM-DD

### Contradictions (X found)
- <description of each contradiction with page paths>

### Orphan Pages (X found)
- <page path> — no incoming links

### Stale Content (X found)
- <page path> — last updated YYYY-MM-DD

### Missing Descriptions (X found)
- <page path> — no description in frontmatter

### Near-Duplicate Pages (X found)
- <page path A> ↔ <page path B> — reason for suspicion, recommended: merge into <target>

### Missing Evidence Tiers (X found)
- <page path> — no `evidence` field / evidence tier mismatch

### Related Field Format Issues (X found)
- <page path> — uses bare filenames instead of relative paths

### Invalid Tags (X found)
- <page path> — unrecognized tag(s): <list>

### Source Metadata Gaps (X found)
- <raw source path> — missing: <list of missing fields>

### Category Gaps (X found)
- Missing theory: "<name>" — referenced in <page paths>, no `kb/theories/` page
- Missing experiment: "<name>" — referenced in <page paths>, no `kb/experiments/` page
- Missing concept: "<term>" — referenced in <page paths>, no `kb/concepts/` page
- Missing person: "<name>" — referenced in <page paths>, no `kb/people/` page
- Missing overview: "<theme>" — 4+ pages share this theme with no hub (e.g., <page paths>)

### Uningested Sources (X found)
- <raw source path> — not referenced by any compiled page

### Broken Links (X found)
- <page path> — links to <missing path>

### Index Issues (X found)
- <description>

### Summary
- Total issues: X
- Critical (contradictions, near-duplicates): X
- Trust (missing evidence tiers, source metadata gaps): X
- Maintenance (orphans, stale, broken links, missing descriptions, related format): X
- Gaps (missing theories/experiments/concepts/people/overviews, uningested sources): X
```

## Step 4: Fix (if requested)

If the user passed "fix" as part of the arguments:

**Before making any changes**, create a git commit of the current state so fixes can be reverted:
```
git add kb/ && git commit -m "pre-lint snapshot (auto)"
```

Then automatically fix:
- Add orphan pages to the relevant section index (`kb/index-theories.md`, `kb/index-concepts.md`, `kb/index-people.md`, `kb/index-experiments.md`, or `kb/index-open-questions.md`)
- Remove entries from section indexes for deleted pages
- Fix broken links where the target can be inferred
- Remove unrecognized `tags` values from pages (replace with nearest valid tag or remove entirely)
- Create stub pages for all category gaps: concept stubs in `kb/concepts/`, theory stubs in `kb/theories/`, experiment stubs in `kb/experiments/`, people stubs in `kb/people/` (only when the 3+ source / foundational contribution threshold is met). Stubs must have valid frontmatter (title, description, type, evidence, created_at, updated_at, related, sources, tags) and a single paragraph summarizing what the page should cover — marked with a `<!-- stub: needs enrichment via kb:ingest -->` comment so future ingestions know to expand them
- Update `updated_at` on pages you touch
- Generate `description` for pages that are missing one
- Add missing `evidence` fields (infer from source type — raw articles → `secondary`, raw papers → `primary`, raw talks → `community`)
- Rewrite bare-filename `related` fields to use relative paths from `kb/`
- Warn about missing source metadata (`url`, `author`, `publication`) but do NOT modify raw files (they are immutable)

Do NOT auto-fix contradictions or near-duplicates — report them for human review.

## Step 5: Log

Prepend an entry to `kb/log.md`:

```
## [YYYY-MM-DD] lint | KB Health Check
Scope: <full or specific scope>
Issues found: X (Y contradictions, Z orphans, ...)
Issues fixed: X (if fix was requested)
```
