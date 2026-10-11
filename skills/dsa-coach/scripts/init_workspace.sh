#!/bin/sh
# Create (or refresh the tooling of) a DSA Lab workspace. Never overwrites learner data.
#   sh init_workspace.sh [workspace]      default: ~/Desktop/dsa-lab
set -e
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
WS="${1:-$HOME/Desktop/dsa-lab}"
mkdir -p "$WS/site/_build" "$WS/tools" "$WS/tracking" "$WS/problems" "$WS/patterns"
# tooling: always refreshed from the skill (these are not learner data)
cp "$SKILL"/assets/site/_build/* "$WS/site/_build/"
cp "$SKILL"/assets/tools/* "$WS/tools/"
# learner data: only created when missing
[ -f "$WS/registry.json" ] || cp "$SKILL/assets/registry.template.json" "$WS/registry.json"
[ -f "$WS/tracking/dsa-progress.md" ] || cp "$SKILL/assets/progress.template.md" "$WS/tracking/dsa-progress.md"
[ -f "$WS/tracking/today.json" ] || printf '{"date": "", "items": []}\n' > "$WS/tracking/today.json"
[ -f "$WS/tracking/lab-state.json" ] || printf '{}\n' > "$WS/tracking/lab-state.json"
# GitHub Pages deploy (rebuilds and publishes on every push to main) and .gitignore: only when missing
mkdir -p "$WS/.github/workflows"
[ -f "$WS/.github/workflows/pages.yml" ] || cp "$SKILL/assets/repo/.github/workflows/pages.yml" "$WS/.github/workflows/pages.yml"
[ -f "$WS/.gitignore" ] || cp "$SKILL/assets/repo/gitignore" "$WS/.gitignore"
# headless browser for page checks
if [ ! -d "$WS/node_modules/playwright" ]; then
  (cd "$WS" && [ -f package.json ] || (cd "$WS" && npm init -y >/dev/null)) && (cd "$WS" && npm i -D playwright >/dev/null 2>&1 && npx playwright install chromium >/dev/null 2>&1) || echo "note: playwright install failed; page checks will be skipped"
fi
python3 "$WS/site/_build/build.py"
echo "workspace ready: $WS  (run: python3 $WS/tools/serve.py, then open http://localhost:8765)"
