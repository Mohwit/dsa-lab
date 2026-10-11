# dsa-coach skill

A Claude Code skill that teaches data structures and algorithms by pattern, with animated step-through pages in a local DSA Lab site and spaced review.

## Install

Copy the `dsa-coach` folder into your Claude Code skills directory:

```bash
# personal (all projects)
cp -R skills/dsa-coach ~/.claude/skills/

# or project-only
mkdir -p .claude/skills && cp -R skills/dsa-coach .claude/skills/
```

Restart Claude Code, then run `/dsa-coach` (or `/dsa-coach today`).

## Requirements

- `python3` (standard library only)
- Node.js + npm (the workspace init installs Playwright for page checks)

## First run

The skill creates its workspace at `~/Desktop/dsa-lab` by default:

```bash
sh ~/.claude/skills/dsa-coach/scripts/init_workspace.sh [workspace]
```

Open the lab through the bundled server so progress is saved to `tracking/lab-state.json` and survives refreshes:

```bash
python3 ~/Desktop/dsa-lab/tools/serve.py     # then open http://localhost:8765
```

## Commands

`today`, `hint`, `check`, `pattern <name>`, `problem <name or number>`, `review`, `mock`, `progress`, `explain <idea>`. See `dsa-coach/SKILL.md` for details.

## Publish online (GitHub Pages)

The workspace includes `.github/workflows/pages.yml`. Push the workspace to a GitHub repo, then in the repo's Settings > Pages set Source to "GitHub Actions". Every push to `main` rebuilds the site with your latest `tracking/lab-state.json` and publishes it, so the online copy shows your progress as of your last push. Changes made on the online copy stay in that browser only.
