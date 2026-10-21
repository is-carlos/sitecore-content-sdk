# Figma caches

The skill caches Figma URLs, variables and styles in the project, in `.claude/figma-to-sitecore/`, so later sessions skip the fetch. The files are committed so the whole team shares them. `init` creates them from this skill's [assets](../assets/) folder.

| File | Holds | Written by |
|---|---|---|
| `url-references.md` | Figma URLs, requirements docs and Teamwork tasks, by section | Any mode, as the user provides URLs |
| `figma-variables.md` | Exact dump of every variable collection | `variables` (via [export-tokens.js](../scripts/export-tokens.js)) |
| `figma-styles.md` | Exact dump of text, color and effect styles | `variables` (via [export-tokens.js](../scripts/export-tokens.js)) |

## URL references

Before asking for any URL:

- **If `.claude/figma-to-sitecore/url-references.md` exists**, read it. If the entry you need is there, print which URL you're using so the user can interrupt if it's stale. Append new entries as the user provides them, under the sections the file's comment lists. Never modify or remove existing entries unless the user gives a new URL for that entry.
- **If it doesn't exist**, recommend running `/is-frontend-figma-to-sitecore init` first. If the user declines, ask for URLs as usual without writing anywhere.

URL parsing:
- `figma.com/design/<fileKey>/<name>?node-id=<a>-<b>` → `fileKey`, node id `<a>:<b>`.
- `figma.com/design/<fileKey>/branch/<branchKey>/<name>` → use `branchKey` as the file key.
- The **document URL** is the URL without query params (in Figma: click an empty part of the canvas, then Cmd+L / Ctrl+L).

## Variables and styles cache

Before `color`, `type`, `spacing`, `button`, `form` and `component`:

- If `.claude/figma-to-sitecore/figma-variables.md` and `figma-styles.md` are missing, or neither has any tables, **stop** and tell the user to run `/is-frontend-figma-to-sitecore init`. (Some files keep their palette and type only in styles, with few or no variables; that's fine.)
- Otherwise, announce that you're using the cache and its last-modified date (`git log -1 --format=%cd -- <file>`, or the file's mtime if it's uncommitted), and say: if the designer may have changed tokens since then, interrupt and run `/is-frontend-figma-to-sitecore variables`.

The caches are the source of truth for token values. In the component mode, `get_variable_defs` on the node tells you which tokens the design uses; cross-check them against the cache, and flag any variable that isn't in it (the cache is stale, or the variable comes from a library).
