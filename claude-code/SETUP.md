# `/obsidian` Skill

Syncs your projects into this Obsidian vault from Claude Code. Creates project files, writes dev logs, generates architecture canvases.

## Setup

```bash
cp claude-code/obsidian-sync.md ~/.claude/commands/obsidian.md
```

Open the copied file and set `VAULT_PATH` to your vault's absolute path. That's it.

## What It Does

Run `/obsidian` from any project directory. Claude will:

1. **Detect** — matches your cwd to an existing vault file by path, name, or keywords
2. **Analyze** — reads package.json / pyproject.toml, scans directory structure, checks git log
3. **Ask** — gives you a menu of actions (or offers to create a new project file if none exists)
4. **Execute** — writes/updates the vault file, appends dev logs, generates canvas files
5. **Report** — summarizes what changed

### Actions

| Action | What happens |
|--------|-------------|
| Create project file | Auto-assigns next `11.XX` number, builds full file from codebase analysis |
| Update description & stack | Re-reads your codebase, shows a diff before writing |
| Add dev log entry | Combines git history + session context into categorized entries |
| Update key files | Refreshes the important files table |
| Architecture canvas | Generates a color-coded `.canvas` file mapping your project |
| Update vault map | Scans the vault and adds new projects/notes to the Vault Map canvas |
| Full sync | All of the above |

### Key Details

- Dev logs are append-only — newest first, old entries never touched
- Project files follow the format in `00-09 System/01 Templates/01.01 Project.md`
- Canvas JSON format is documented inline in the skill file (and also in `canvas-reference.md` for human reference)
- Claude shows diffs before overwriting existing sections

The full skill definition is in `obsidian-sync.md` — it's readable markdown, not code. Open it up if you want to understand or change any of the phases.
