# Mode: color

Updates `tokens/_color-primitives.scss` and `tokens/_color.scss` to match Figma. Follows [token-layer.md](token-layer.md).

## Step 4a — Orient

Read the two color partials, `tokens/_effects.scss` if it exists, and every place that uses color tokens: `grep -rn "var(--isds-color" src/styles <component root>`. Note any raw colors in components (`#…`, `rgb(`) — they are candidates to move onto tokens later; don't change them in this mode.

## Step 4b — Map Figma to code

From `figma-variables.md` (and `figma-styles.md` for color styles and gradients):

- **Primitives** — the collection holding raw colors (usually `Color Primitives`) → `tokens/_color-primitives.scss`, on `:root`. Names must look like `<Color>/<Step>` (`Blue/500`); if one doesn't, stop and ask.
- **Semantic tokens** — the collection that aliases primitives (usually `Color Tokens`) → `tokens/_color.scss`. Every value is `var(--isds-color-<primitive>)`. A semantic token whose Figma value is a raw color (not an alias) is a designer error: flag it and ask whether to add a primitive.
- **No color variables** (common in wireframe and older files: the palette is color *styles* like `Grey/900`) → the color styles named `<Color>/<Step>` (or single names like `White`, `Black`) are the primitives. Figma then has no semantic layer: propose semantic tokens from how the designs use the colors (text, surfaces, borders, links — check a few key frames with `get_variable_defs` / the component extraction), show the proposed list with each primitive it points to, and agree it with the user before writing. Note in the report that the designer should add variables so the mapping lives in Figma.
- **Modes** of the semantic collection → themes ([token-layer.md](token-layer.md) → "Themes"). The first mode is the default. Re-declare in a theme only the tokens whose value differs. No modes anywhere → no theme selectors.
- **Site-wide themes** (modes like `Pro Default` / `Pro Dark`) → ask how the site theme is chosen, then combine selectors as in token-layer.md.
- **Gradients** — color styles with gradient paints, or gradients the user points out:

  ```scss
  --isds-color-gradient-hero-a: var(--isds-color-blue-200);
  --isds-color-gradient-hero-b: var(--isds-color-blue-700);
  --isds-gradient-hero: linear-gradient(to right, var(--isds-color-gradient-hero-a) 0%, var(--isds-color-gradient-hero-b) 100%);
  ```

  A stop bound to a variable uses that variable's token; a raw stop color needs a primitive (ask).
- **Effects** — effect styles with shadow colors → `tokens/_effects.scss` (`--isds-shadow-<name>`), only if the user agrees.

## Step 4c — Reconcile

| Case | Action |
|---|---|
| In Figma, not in code | Add. |
| In code, not in Figma | Search for uses. Unused → propose deleting. Used → ask what replaces it, and plan to update each use. |
| Renamed (same value, new name) | Rename and update every reference in `src/styles` and the component modules. |
| Still needed, but Figma has no value (e.g. no hover color) | Keep it, point it at magenta ([token-layer.md](token-layer.md) → "Tiers"). |

## Step 4d — Storybook

If Storybook exists, check for `src/stories/design-system/Color.stories.tsx` (or the project's equivalent). Plan to create or update it: a `Primitives` story with a swatch per primitive and a `Tokens` story with a swatch per semantic token, rendered in every theme (see [storybook.md](storybook.md) → "Design-system stories").

## Step 4e — Proposal

List every token added, changed, renamed or deleted (name · old → new), every file that references a renamed or deleted token, and every magenta token. Then continue with SKILL.md Step 5. This mode never edits component files except to update references to renamed or deleted tokens.
