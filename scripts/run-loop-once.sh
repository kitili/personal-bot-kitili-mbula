#!/usr/bin/env bash
# Move a tasks.json entry waiting → working → done around a wrap-up run.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TASKS="$ROOT/tasks.json"
TASK_ID="${1:-m06-wrapup-2026-10-06}"
TRIGGER="${WRAPUP_TRIGGER:-loop}"
export TASKS TASK_ID TRIGGER ROOT

python3 - <<'PY'
import json, os
from datetime import datetime, timezone, timedelta
from pathlib import Path

path = Path(os.environ["TASKS"])
task_id = os.environ["TASK_ID"]
trigger = os.environ["TRIGGER"]
data = json.loads(path.read_text())
now = datetime.now(timezone(timedelta(hours=3))).isoformat(timespec="seconds")

for t in data["tasks"]:
    if t["id"] == task_id:
        t["status"] = "working"
        t.setdefault("history", []).append({
            "status": "working",
            "at": now,
            "note": f"Loop started (trigger={trigger})",
        })
        break
else:
    raise SystemExit(f"task not found: {task_id}")

path.write_text(json.dumps(data, indent=2) + "\n")
print(f"tasks.json → working ({task_id})")
PY

WRAPUP_TRIGGER="$TRIGGER" bash "$ROOT/scripts/daily-wrap-up.sh"

python3 - <<'PY'
import json, os
from datetime import datetime, timezone, timedelta
from pathlib import Path

path = Path(os.environ["TASKS"])
task_id = os.environ["TASK_ID"]
root = Path(os.environ["ROOT"])
data = json.loads(path.read_text())
now = datetime.now(timezone(timedelta(hours=3))).isoformat(timespec="seconds")
out = root / "log" / f"{datetime.now().strftime('%Y-%m-%d')}-wrapup.md"
for t in data["tasks"]:
    if t["id"] == task_id:
        t["status"] = "done"
        t["output"] = str(out.relative_to(root))
        t.setdefault("history", []).append({
            "status": "done",
            "at": now,
            "note": f"Wrap-up written to {out.name}",
        })
        break
path.write_text(json.dumps(data, indent=2) + "\n")
print(f"tasks.json → done ({task_id})")
PY
