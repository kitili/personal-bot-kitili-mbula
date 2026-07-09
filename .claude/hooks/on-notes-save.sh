#!/usr/bin/env bash
# Hook: run Daily Wrap-Up when a file in notes/ is saved (Write|Edit)
set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('file_path','') or d.get('file_path',''))" 2>/dev/null || echo "")

# Only fire for notes/ directory
if [[ "$FILE_PATH" != *"/notes/"* ]] && [[ "$FILE_PATH" != *"notes/"* ]]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
export WRAPUP_TRIGGER=hook
bash "$ROOT/scripts/daily-wrap-up.sh"

# Tell Claude the wrap-up ran
echo '{"additionalContext": "Daily Wrap-Up hook fired after notes save. Summary written to log/."}'
