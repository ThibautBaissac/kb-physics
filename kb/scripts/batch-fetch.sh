#!/usr/bin/env bash
# Batch fetch and ingest articles into the KB.
# Usage:
#   ./kb/scripts/batch-fetch.sh urls.txt
#   ./kb/scripts/batch-fetch.sh "https://url1" "https://url2" ...

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$SCRIPT_DIR" || exit 1

# ── Stream filter ─────────────────────────────────────────────────────
# Parses stream-json from `claude -p` and prints live progress.
STREAM_SCRIPT='
import sys, json
for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        raw = json.loads(line)
        t = raw.get("type", "")

        if t == "stream_event":
            ev = raw.get("event", {})
            et = ev.get("type", "")

            if et == "content_block_delta":
                delta = ev.get("delta", {})
                if delta.get("type") == "text_delta":
                    print(delta.get("text", ""), end="", flush=True)

            elif et == "content_block_start":
                cb = ev.get("content_block", {})
                if cb.get("type") == "tool_use":
                    print("  -> " + cb.get("name", "tool"), flush=True)

        elif t == "result":
            r = raw.get("result", "")
            if isinstance(r, str) and r:
                print(r, flush=True)

    except json.JSONDecodeError:
        pass
    except (KeyError, TypeError):
        pass
'

stream_filter() {
  python3 -u -c "$STREAM_SCRIPT"
}

# ── Usage ──────────────────────────────────────────────────────────────
usage() {
  cat <<'EOF'
Usage: batch-fetch.sh <urls-file> | batch-fetch.sh <url1> [url2] ...

  <urls-file>  Text file with one URL per line (blank lines and #comments ignored)
  <url>        One or more URLs passed as arguments

Examples:
  ./kb/scripts/batch-fetch.sh urls.txt
  ./kb/scripts/batch-fetch.sh "https://www.quantamagazine.org/..." "https://..."
EOF
  exit 1
}

[[ $# -eq 0 ]] && usage

# ── Collect URLs ───────────────────────────────────────────────────────
urls=()
if [[ $# -eq 1 && -f "$1" ]]; then
  while read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" == \#* ]] && continue
    urls+=("$line")
  done < "$1"
else
  urls=("$@")
fi

total=${#urls[@]}
if [[ $total -eq 0 ]]; then
  echo "No URLs found."
  exit 1
fi

# ── Process each URL ──────────────────────────────────────────────────
succeeded=0
failed_urls=()

echo "=== Batch fetch: $total URL(s) ==="
echo ""

for i in "${!urls[@]}"; do
  url="${urls[$i]}"
  n=$((i + 1))

  echo "──────────────────────────────────────────────────"
  echo "[$n/$total] $url"
  echo "──────────────────────────────────────────────────"

  claude -p "/kb:fetch $url" \
    --verbose \
    --output-format stream-json \
    --include-partial-messages \
    --allowedTools "Read,Write,Edit,Glob,Grep,WebFetch" \
    --append-system-prompt "This is an automated batch operation. Do NOT ask the user for confirmation at any step — proceed directly through ALL steps including ingestion. Auto-confirm everything. Never pause or wait for user input." \
    2>/dev/null | stream_filter

  status=${PIPESTATUS[0]}

  if [[ $status -ne 0 ]]; then
    echo ""
    echo "  FAILED (exit $status)"
    failed_urls+=("$url")
  else
    echo ""
    echo "  OK"
    succeeded=$((succeeded + 1))
  fi

  # Delay between requests (skip after last)
  if [[ $n -lt $total ]]; then
    sleep 2
  fi
done

# ── Summary ────────────────────────────────────────────────────────────
echo ""
echo "=== Batch complete ==="
echo "  Total:     $total"
echo "  Succeeded: $succeeded"
echo "  Failed:    ${#failed_urls[@]}"

if [[ ${#failed_urls[@]} -gt 0 ]]; then
  echo ""
  echo "Failed URLs:"
  for u in "${failed_urls[@]}"; do
    echo "  - $u"
  done
  exit 1
fi
