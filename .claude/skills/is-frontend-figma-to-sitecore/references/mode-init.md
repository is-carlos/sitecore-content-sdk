# Mode: init

First-time setup. Safe to re-run: it only creates what's missing and reports what already exists.

## Step 4a — Caches

1. Create `.claude/figma-to-sitecore/` and copy into it, from this skill's `assets/` folder: `url-references.md`, `figma-variables.md`, `figma-styles.md`. Never overwrite existing files.
2. If the project has caches from `is-frontend-figma-to-code` (`.claude/url-references.md`, `.claude/figma-variables.md`, `.claude/figma-styles.md`), offer to copy their entries in.

## Step 4b — Figma document URL

Ask for the Figma file's URL if `## Document` in `url-references.md` is empty. Tip for the user: click an empty part of the canvas, then Cmd+L (Mac) / Ctrl+L (Windows). Strip query params and save it under `## Document`.

## Step 4c — Variables and styles

Follow [mode-variables.md](mode-variables.md) steps 4a–4c. These cache writes don't need the Step 5 confirmation.

## Step 4d — Agree the basics

Ask in one round (multiple choice where possible), using the cache and Detect results to pre-fill answers:
1. **Breakpoints** — names and widths for `$breakpoints`. Offer what the existing CSS uses (e.g. a `max-width: 767px` query → `tablet: 768px`) and the Figma frame widths.
2. **Fluid range** — the mobile and desktop frame widths in Figma (defaults 375px / 1440px) for `$fluid-min-vw` / `$fluid-max-vw`.
3. **Reset** — add a minimal global `base/_reset.scss` (`box-sizing: border-box` on everything, `margin: 0` on body)? It affects every page.
4. **Storybook theme toolbar** — add a color-theme switcher to Storybook (only if Storybook exists)?

## Step 4e — Propose the token-layer skeleton

Plan only what's missing, following [token-layer.md](token-layer.md) → "Files":

| File | Action |
|---|---|
| `src/styles/main.scss` | create: `@use 'tokens'; @use 'base';` |
| `src/styles/abstracts/_index.scss`, `_functions.scss`, `_breakpoints.scss` | create, with the helpers and the agreed breakpoints and fluid range |
| `src/styles/abstracts/_type.scss`, `_buttons.scss`, `_forms.scss` | create empty, with a comment naming the mode that fills them |
| `src/styles/tokens/_index.scss` + one empty partial per token file | create |
| `src/styles/base/_index.scss`, `_reset.scss` (if agreed), `_rich-text.scss`, `_buttons.scss`, `_forms.scss` | create (`_reset.scss` with content; the others empty with a comment) |
| `src/pages/_app.tsx` or root `layout.tsx` | add `import '../styles/main.scss';` (relative to that file) |
| `.storybook/preview.tsx` | import the same global stylesheet; add the theme toolbar if agreed (see [storybook.md](storybook.md)) |
| `sitecore.cli.config.ts` | add `'<component-root>/**/*.stories.*'` and `'<component-root>/**/*.fields.*'` to `componentMap.exclude` if missing — otherwise the map generator registers stories and sample fields as Sitecore components |

If `sass` isn't installed, the first line of the proposal is: ask the user to run `npm install -D sass`.

If the project already has a global stylesheet with tokens in another shape, don't restructure it: describe what exists and ask whether to migrate it into this layout or adapt the skill's paths to it.

Then continue with SKILL.md Step 5.

## Step 4f — After the build

Report which design-system modes to run next, in order: `color` → `type` → `spacing` → `button` / `form`.
