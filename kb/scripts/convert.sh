#!/usr/bin/env bash
#
# convert.sh — Convert source files to markdown for KB ingestion
#
# Usage:
#   ./kb/scripts/convert.sh <input-file> [category]
#
# Categories: articles, papers, books, talks (default: articles)
#
# Examples:
#   ./kb/scripts/convert.sh ~/Downloads/paper.pdf papers
#   ./kb/scripts/convert.sh ~/Downloads/article.html articles
#   ./kb/scripts/convert.sh ~/Downloads/lecture-notes.docx talks
#   ./kb/scripts/convert.sh ~/Downloads/data.csv articles
#   ./kb/scripts/convert.sh ~/Downloads/slides.pptx talks
#
# Supported formats:
#   - PDF (.pdf)             → pandoc or pdftotext
#   - HTML (.html, .htm)     → pandoc
#   - Word (.docx)           → pandoc
#   - PowerPoint (.pptx)     → python-pptx (extracts text + notes)
#   - CSV (.csv)             → markdown table
#   - JSON (.json)           → fenced code block
#   - Plain text (.txt)      → direct copy with frontmatter
#   - Markdown (.md)         → direct copy (adds frontmatter if missing)
#   - Images (.png/jpg/etc)  → copies to _originals, creates stub for LLM vision
#
# The original file is always preserved in raw/_originals/

set -euo pipefail

KB_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="$KB_ROOT/raw"
ORIGINALS_DIR="$RAW_DIR/_originals"

# --- Args ---

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <input-file> [category]"
  echo "Categories: articles, papers, books, talks"
  exit 1
fi

INPUT_FILE="$1"
CATEGORY="${2:-articles}"

if [[ ! -f "$INPUT_FILE" ]]; then
  echo "Error: File not found: $INPUT_FILE"
  exit 1
fi

VALID_CATEGORIES="articles papers books talks"
if [[ ! " $VALID_CATEGORIES " =~ " $CATEGORY " ]]; then
  echo "Error: Invalid category '$CATEGORY'. Must be one of: $VALID_CATEGORIES"
  exit 1
fi

# --- Helpers ---

BASENAME="$(basename "$INPUT_FILE")"
EXTENSION="${BASENAME##*.}"
NAME="${BASENAME%.*}"
DATE="$(date +%Y-%m-%d)"
SLUG="$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')"
OUTPUT_NAME="${DATE}-${SLUG}.md"
OUTPUT_PATH="$RAW_DIR/$CATEGORY/$OUTPUT_NAME"
ORIGINAL_PATH="$ORIGINALS_DIR/$BASENAME"

# Don't overwrite existing files
if [[ -f "$OUTPUT_PATH" ]]; then
  echo "Error: Output file already exists: $OUTPUT_PATH"
  echo "Rename the input file or remove the existing output."
  exit 1
fi

mkdir -p "$RAW_DIR/$CATEGORY"
mkdir -p "$ORIGINALS_DIR"

# Copy original (local cache only, git-ignored)
cp "$INPUT_FILE" "$ORIGINAL_PATH"
echo "Original cached locally: $ORIGINAL_PATH (git-ignored)"

add_frontmatter() {
  local content="$1"
  local format="$2"
  cat <<EOF
---
title: $NAME
description: ""
created_at: $DATE
source: converted from $format
type: $CATEGORY
original: _originals/$BASENAME
---

$content
EOF
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo "Error: '$1' is not installed."
    echo "Install it with: $2"
    exit 1
  fi
}

# --- Convert by format ---

case "${EXTENSION,,}" in

  md|markdown)
    # Check if frontmatter already exists
    if head -1 "$INPUT_FILE" | grep -q '^---'; then
      cp "$INPUT_FILE" "$OUTPUT_PATH"
    else
      add_frontmatter "$(cat "$INPUT_FILE")" "markdown" > "$OUTPUT_PATH"
    fi
    ;;

  txt)
    add_frontmatter "$(cat "$INPUT_FILE")" "plain text" > "$OUTPUT_PATH"
    ;;

  pdf)
    if command -v pandoc &> /dev/null; then
      CONTENT="$(pandoc -f pdf -t markdown --wrap=none "$INPUT_FILE" 2>/dev/null || true)"
    fi
    if [[ -z "${CONTENT:-}" ]] && command -v pdftotext &> /dev/null; then
      CONTENT="$(pdftotext -layout "$INPUT_FILE" - 2>/dev/null || true)"
    fi
    if [[ -z "${CONTENT:-}" ]]; then
      # Fallback: create a stub pointing to the original for LLM to read directly
      CONTENT=$(cat <<STUB
> This PDF could not be converted automatically.
> Ask the LLM to read the original file directly: \`raw/_originals/$BASENAME\`
>
> Claude and other modern LLMs can read PDF files natively.
STUB
      )
      echo "Warning: No PDF converter available. Created stub for LLM to read directly."
    fi
    add_frontmatter "$CONTENT" "pdf" > "$OUTPUT_PATH"
    ;;

  html|htm)
    check_command pandoc "brew install pandoc"
    CONTENT="$(pandoc -f html -t markdown --wrap=none "$INPUT_FILE")"
    add_frontmatter "$CONTENT" "html" > "$OUTPUT_PATH"
    ;;

  docx)
    check_command pandoc "brew install pandoc"
    CONTENT="$(pandoc -f docx -t markdown --wrap=none "$INPUT_FILE")"
    add_frontmatter "$CONTENT" "docx" > "$OUTPUT_PATH"
    ;;

  pptx)
    if command -v python3 &> /dev/null && python3 -c "import pptx" 2>/dev/null; then
      CONTENT="$(python3 -c "
from pptx import Presentation
import sys

prs = Presentation(sys.argv[1])
for i, slide in enumerate(prs.slides, 1):
    print(f'## Slide {i}')
    print()
    for shape in slide.shapes:
        if shape.has_text_frame:
            for para in shape.text_frame.paragraphs:
                text = para.text.strip()
                if text:
                    print(text)
    if slide.has_notes_slide and slide.notes_slide.notes_text_frame:
        notes = slide.notes_slide.notes_text_frame.text.strip()
        if notes:
            print()
            print(f'> **Speaker notes:** {notes}')
    print()
" "$INPUT_FILE")"
      add_frontmatter "$CONTENT" "pptx" > "$OUTPUT_PATH"
    else
      echo "Warning: python-pptx not available. Install with: pip install python-pptx"
      CONTENT=$(cat <<STUB
> This PowerPoint file could not be converted automatically.
> Install python-pptx (\`pip install python-pptx\`) and re-run, or convert manually.
> Original: \`raw/_originals/$BASENAME\`
STUB
      )
      add_frontmatter "$CONTENT" "pptx" > "$OUTPUT_PATH"
    fi
    ;;

  csv)
    # Convert CSV to markdown table
    CONTENT="$(python3 -c "
import csv, sys

with open(sys.argv[1], newline='', encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    rows = list(reader)

if not rows:
    sys.exit(0)

header = rows[0]
print('| ' + ' | '.join(header) + ' |')
print('| ' + ' | '.join(['---'] * len(header)) + ' |')
for row in rows[1:]:
    # Pad row if shorter than header
    padded = row + [''] * (len(header) - len(row))
    print('| ' + ' | '.join(padded[:len(header)]) + ' |')
" "$INPUT_FILE")"
    add_frontmatter "$CONTENT" "csv" > "$OUTPUT_PATH"
    ;;

  json)
    CONTENT=$(cat <<BLOCK
\`\`\`json
$(cat "$INPUT_FILE")
\`\`\`
BLOCK
    )
    add_frontmatter "$CONTENT" "json" > "$OUTPUT_PATH"
    ;;

  png|jpg|jpeg|gif|webp|svg)
    # Images can't be converted to text — create a stub for LLM vision
    CONTENT=$(cat <<STUB
> This is an image file. Use LLM vision to analyze it.
> Original: \`raw/_originals/$BASENAME\`
>
> To ingest: ask the LLM to read the image at \`raw/_originals/$BASENAME\` and describe its contents,
> then update this file with the description.
STUB
    )
    add_frontmatter "$CONTENT" "image ($EXTENSION)" > "$OUTPUT_PATH"
    echo "Note: Image saved. Ask the LLM to read and describe it during ingestion."
    ;;

  *)
    echo "Error: Unsupported format '.$EXTENSION'"
    echo "Supported: md, txt, pdf, html, docx, pptx, csv, json, png, jpg, gif, webp, svg"
    echo ""
    echo "For unsupported formats, manually convert to markdown and drop in raw/$CATEGORY/"
    # Clean up the copied original since we're failing
    rm -f "$ORIGINAL_PATH"
    exit 1
    ;;

esac

echo "Converted: $OUTPUT_PATH"
echo ""
echo "Next step: tell the LLM to ingest it:"
echo "  /kb:ingest kb/raw/$CATEGORY/$OUTPUT_NAME"
