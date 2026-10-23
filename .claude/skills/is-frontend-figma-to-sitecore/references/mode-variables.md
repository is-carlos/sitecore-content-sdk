# Mode: variables

Re-fetches the Figma variables and styles into `.claude/figma-to-sitecore/`. It writes only those two cache files, so it doesn't need the Step 5 confirmation.

## Step 4a — Figma document URL

Use `## Document` from `url-references.md`; if it's empty, ask for it (see [mode-init.md](mode-init.md) Step 4b).

## Step 4b — Export variables and styles

1. Load the `figma-use` skill, then call `create_session` for the file key.
2. Run [export-tokens.js](../scripts/export-tokens.js) with `use_figma`, unchanged (it dumps every variable collection and every text, color and effect style).
   - Response too large / truncated → set `__PART__` to `'variables'` and then `'styles'` and run it twice. Still too large → with `'variables'`, also set `__COLLECTION__` to one collection's name per run (the error or `collections` lists them).
   - `remoteOnly: true`, or only a handful of variables while the designs clearly use more → the tokens live elsewhere: in a library file (ask for its URL; `get_libraries` lists linked libraries — then run the script there), or only in styles. Say which in the summary. Never import library variables into the file to read them: that changes the file.
3. Write `variablesMarkdown` **verbatim** to `figma-variables.md` and `stylesMarkdown` verbatim to `figma-styles.md`, each after the file's heading and comment. Don't interpret, rename or clean anything up — the caches must match Figma exactly.

## Step 4c — Summary

- First fetch → say how many collections, variables and styles were saved.
- **Unlisted variables** — always report `unlistedVariables` (variables or styles reference them, but no collection in the cache lists them), as a table: name · reason · used by. They're marked `(deleted)` / `(library)` in the cache too.
  - `deleted` — removed from its collection, but still bound somewhere (e.g. a text style's paragraph spacing). The value is no longer in Figma's tables. Flag it for the designer; the modes that hit it (`type`, `spacing`…) must ask what to use instead.
  - `library` — comes from a library file. Offer to export that file too (ask for its URL).
  - `missing` — can't be resolved at all. Flag it.
- Re-fetch → show a table of what changed: name, old value, new value (added and removed too). Use `git diff` on the cache files when they're committed. Then list the design-system modes the changes affect (e.g. a changed `Color Tokens` value → `color`).

## Bail

When run on its own, the rest of SKILL.md (Steps 5–7) doesn't apply. Go to Step 8 and report.
