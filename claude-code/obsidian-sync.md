# Obsidian Sync

Bridge between Claude Code sessions and your Obsidian vault. Syncs codebase state, dev logs, and architecture diagrams into the vault's Johnny Decimal structure.

## Configuration

```
VAULT_PATH = "/path/to/your/claude-vault"
```

> **IMPORTANT:** Replace the path above with the absolute path to your vault before using this skill.
> If your `~/.claude/commands/` directory doesn't exist yet, create it: `mkdir -p ~/.claude/commands`

## Instructions

When this command is invoked, execute the following phases:

---

### Phase 1: Project Detection

> **Before proceeding:** Verify `VAULT_PATH` exists and contains the expected folder structure (`00-09 System/`, `10-19 Projects/`, etc.). If the path is wrong or missing, stop and ask the user to fix the configuration.

1. **Identify the current project** by matching `cwd` against known project locations:
   - Check vault files in `VAULT_PATH/10-19 Projects/11 Active/` for matching `**Location:**` fields
   - Check `git remote -v` in `cwd` for GitHub URL
   - Match directory name or path against vault filenames

2. **Find the Obsidian file** by scanning ALL `11.XX *.md` files in `VAULT_PATH/10-19 Projects/11 Active/`:
   - **First pass: path match** — Read each file's `**Location:**` field and compare to `cwd`. Exact match wins.
   - **Second pass: name match** — Fuzzy-match `cwd` directory name against vault filenames.
   - **Third pass: keyword match** — Tokenize `cwd` path and vault filenames, look for shared keywords.
   - **If multiple or uncertain matches**, present candidates to user for confirmation.
   - **If no match found**, note this — Phase 3 will offer to create one.

3. **If found**, read the existing Obsidian file completely — parse the YAML frontmatter, all sections, and footer. This is the baseline for updates.

---

### Phase 2: Codebase Analysis

Gather project data from the codebase:

1. **Stack detection** — Read `package.json`, `pyproject.toml`, `requirements.txt`, `Cargo.toml`, or equivalent. Extract framework, language, key dependencies.
2. **Directory structure** — Scan 1-2 levels deep to understand project layout.
3. **Recent git history** — Run `git log --oneline -20` for recent work.
4. **Git remote** — Run `git remote get-url origin` for the GitHub link (if it exists).
5. **Key source files** — Identify the most important files and their roles based on directory structure and naming patterns.

---

### Phase 3: Action Menu

Present the user with an action menu.

**If the project file already exists in Obsidian:**

| Option | Description |
|--------|-------------|
| Update description & stack | Refresh the project description, stack table, and metadata |
| Add dev log entry | Add a dated entry for today's work |
| Update key files table | Refresh the key files section with current codebase |
| Create/update architecture canvas | Generate an Obsidian canvas file mapping the project architecture |
| Update vault map | Add this project (and any new vault content) to the Vault Map canvas |
| Full sync (all of the above) | Run all updates in sequence |

**If no project file exists:**

| Option | Description |
|--------|-------------|
| Create new project file | Auto-assign next JD number, build full project file |
| Create project file + architecture canvas | Create the project file AND an architecture canvas |
| Update vault map | Add new vault content to the Vault Map canvas |

---

### Phase 4: Execute Selected Actions

#### Action: Create New Project File

1. **Auto-increment JD number** — Scan all `11.XX *.md` files in `10-19 Projects/11 Active/` to find the highest XX number. The new file gets `11.{max+1}`.

2. **Build the file** following the gold-standard format:

```markdown
---
jd-id: "11.XX"
status: active
tags:
  - Tag1
  - Tag2
---

[[00.01 Home]]

# Project Name

{Description — 2-3 sentences explaining what the project does, its current phase, and key characteristics. Write this from the codebase analysis, not generic filler.}

**Location:** `{absolute path}`
**GitHub:** {remote URL if available}
{**Port:** localhost:XXXX if it's a web app with a dev server}

---

## Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| Framework | {e.g., Next.js 16} | {what it does in this project} |
| UI | {e.g., React 19, Tailwind} | {purpose} |
| Language | {e.g., TypeScript 5} | {purpose} |
| Data | {e.g., REST API} | {purpose} |
| Persistence | {e.g., PostgreSQL} | {purpose} |

{Brief note about the project's architecture philosophy if relevant.}

---

## Architecture

### Core Systems

{Describe the main systems/pipelines. Use arrow notation for data flow:}
{`Source` -> `Transform` -> `Output`}

---

## Key Files

| File | Purpose |
|------|---------|
| `{path}` | {what this file does} |

---

## Dev Log — {Month DD, YYYY}

### {Category}
- {Bullet point describing work done}

---

Parent: [[00.01 Home]] | Tags: #Tag1 #Tag2
```

3. **Infer tags** from the stack — e.g., Next.js project gets `Dev`, React gets `Frontend`, Python gets `Python`, etc. Use 2-5 tags.

4. **Save** to `VAULT_PATH/10-19 Projects/11 Active/11.XX {Project Name}.md`

---

#### Action: Add Dev Log Entry

1. **Format** — Each day gets a dated header, with categorized sub-sections:
```markdown
## Dev Log — {Month DD, YYYY}

### {Category Name}
- {Description of work done}

### {Another Category}
- {Work items}
```

2. **Build the entry** by combining:
   - **Git history** (`git log --oneline -20`) — the factual record of what changed
   - **Current session context** — what was discussed, debugged, decided in this Claude session
   - Group related commits into categories by feature/area
   - Add the "why" from session context, not just the "what" from git

3. **Insert position** — Newest entries go FIRST, directly above existing dev log entries. Find the `---` separator line that precedes the first `## Dev Log` entry, and insert the new block there. If today's date already has an entry, merge into it. Section order: Stack → Architecture → Key Files → Dev Log (newest first) → Footer.

4. **Preserve all existing entries** — Never remove or modify past dev log entries.

---

#### Action: Update Description & Stack

1. Re-analyze the codebase (package.json, directory structure, etc.)
2. Update the description paragraph if the project has evolved
3. Update the Stack table — add new dependencies, update versions
4. Update Location/GitHub/Port fields
5. Update YAML frontmatter tags if the stack has changed
6. **Show a diff** of what will change before writing. Ask the user to confirm.

---

#### Action: Update Key Files Table

1. Scan the project's source directory structure
2. Identify the most important files (entry points, configs, main components, APIs, types)
3. Build an updated key files table
4. **Merge** with existing entries — keep existing descriptions if the file still exists, add new files, remove files that no longer exist
5. **Show the diff** before writing. Ask the user to confirm.

---

#### Action: Create/Update Architecture Canvas

1. **Ask the user**:
   - "What level of detail for the architecture canvas?"
   - Option A: "High-level systems (15-30 nodes)" — major components, data flow, external services
   - Option B: "File-level detail (40+ nodes)" — individual files grouped by architectural layer

2. **Analyze the codebase** to identify architectural layers:
   - Entry points (main files, index files, app routers)
   - UI layer (components, pages, views)
   - State management (stores, context, hooks)
   - Business logic (services, engines, strategies)
   - API layer (routes, endpoints, handlers)
   - Data layer (models, schemas, persistence)
   - External services (APIs, databases, third-party)
   - Configuration (config files, environment)

3. **Build the canvas JSON** — Obsidian `.canvas` files are JSON with two arrays: `nodes` and `edges`.

   **Text node:** `{ "id": "unique_id", "type": "text", "text": "## Title\nDescription", "x": 0, "y": 0, "width": 340, "height": 120, "color": "1" }`
   **File node:** `{ "id": "unique_id", "type": "file", "file": "path/to/file.md", "x": 0, "y": 0, "width": 340, "height": 200 }`
   **Edge:** `{ "id": "edge_id", "fromNode": "source_id", "fromSide": "bottom", "toNode": "target_id", "toSide": "top" }` — optional: `"label"`, `"color"`
   **Side values:** `"top"`, `"bottom"`, `"left"`, `"right"`

4. **Color coding** (Obsidian canvas colors):
   - `"1"` (red) — Core/critical systems, entry points
   - `"2"` (orange) — State management, stores
   - `"3"` (yellow) — Data layer, persistence
   - `"4"` (green) — Output, views, UI components
   - `"5"` (cyan) — API layer, external services
   - `"6"` (purple) — Labels, section headers, configuration

5. **Layout** — Arrange nodes in a top-down flow:
   - Title node at top
   - Label nodes on the left column (x: -40, width: 180) to name each layer
   - Content nodes in the main area (x: 200+), grouped by layer
   - ~200px vertical gap between layers, ~40px gap between nodes in a row
   - Standard sizes: labels 180x60, content 340x120-200

6. **Edges** connect data flow — `"bottom"` to `"top"` for vertical, `"right"` to `"left"` for horizontal.

7. **Save** to `VAULT_PATH/10-19 Projects/11 Active/{Project Name} Architecture.canvas`

---

#### Action: Update Vault Map

Reads the current `00-09 System/00 Meta/00.02 Vault Map.canvas` and updates it to reflect the actual vault contents.

1. **Read the existing canvas** — parse the JSON from `VAULT_PATH/00-09 System/00 Meta/00.02 Vault Map.canvas`.

2. **Scan the vault** for content to represent:
   - **JD areas** — read top-level folders (`00-09`, `10-19`, etc.). If a new area exists that isn't on the canvas, add it.
   - **Active projects** — scan `10-19 Projects/11 Active/` for `11.XX *.md` files. Each project should have a node.
   - **Key notes** — scan other areas for non-template `.md` files that have meaningful content (skip `.gitkeep`, skip template files in `01 Templates/`).

3. **Diff against existing nodes** — compare what's on the canvas vs what's in the vault:
   - **New items** — create nodes for projects/notes not yet on the canvas
   - **Removed items** — if a file no longer exists, remove its node and any connected edges
   - **Existing items** — leave them where they are (preserve user's manual layout adjustments)

4. **Build new nodes** for anything missing:
   - **Project nodes**: color `"2"` (orange), text is `## {Project Name}\n{first line of description}`, width 280, height 100
   - **Note nodes**: color matching their JD area (use the same color codes as the area parent), width 240, height 80
   - **Position new nodes** near their parent area node — offset below and slightly right of the area node, stacked vertically with 40px gaps. Don't overlap existing nodes.

5. **Add edges** from each new node to its parent area node (`fromSide: "left"`, `toSide: "right"` for left-column areas; `fromSide: "right"`, `toSide: "left"` for right-column areas). Match the existing edge pattern.

6. **Write the updated canvas** back to `VAULT_PATH/00-09 System/00 Meta/00.02 Vault Map.canvas`. Must be valid JSON.

7. **Report** what changed — how many nodes added, how many removed, which projects/notes were new.

---

### Phase 5: Report

After completing all actions, present a summary:

```
## Obsidian Sync Complete

**Project:** {name} (11.XX)
**Vault path:** 10-19 Projects/11 Active/{filename}

**Actions performed:**
- [x] {action 1}
- [x] {action 2}

**Key details:**
- {Notable detail about what was synced}
- {Any items that need manual attention}
```

---

## Reference

| Convention | Detail |
|---|---|
| Active projects | `10-19 Projects/11 Active/` |
| Project file format | `11.XX {Project Name}.md` |
| Canvas file format | `{Project Name} Architecture.canvas` |
| Vault map | `00-09 System/00 Meta/00.02 Vault Map.canvas` |
| JD numbering | Sequential in `11.XX` range, auto-increment |
| YAML frontmatter | `jd-id` (quoted string), `status`, `tags` (array) |
| Dev log dates | `## Dev Log — {Month DD, YYYY}` |
| Footer | `Parent: [[00.01 Home]] \| Tags: #Tag1 #Tag2` |

## Guidelines

- **Never remove content** from existing files without asking — only add or update
- **Show diffs** before writing changes to existing sections
- **Dev log entries are append-only** — never edit past entries
- **Tags should match content** — infer from stack, not generic labels
- **Canvas files must be valid JSON** — test-parse before saving
- **Descriptions should be specific** — write from actual codebase analysis, not templates
- **Merge intelligently** — when updating tables, preserve existing rows that are still accurate
