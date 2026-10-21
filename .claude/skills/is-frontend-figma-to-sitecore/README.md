# is-frontend-figma-to-sitecore

Turns a Figma file into a Sitecore Content SDK head app's design system and components: a global SCSS token layer (colors, typography, spacing, buttons, forms) generated from the Figma variables and styles, CSS-module components that render Sitecore fields with the Content SDK field components, Storybook stories, and dev-only showcase pages. Caches the Figma URLs, variables and styles in `.claude/figma-to-sitecore/` so later sessions skip the fetch.

The Sitecore counterpart of `is-frontend-figma-to-code` (Falcore): same modes and token rules, adapted to the Content SDK, Next.js and CSS modules.

**Version:** 1.0.0

**Requirements:**
- A Next.js 16 head on `@sitecore-content-sdk/nextjs` 2.x, Pages Router or App Router. JSS (`@sitecore-jss/*`) is not supported.
- `sass` (dev dependency)
- Figma MCP
- Browser MCP (optional, for visual QA)
- Storybook (recommended; the skill can set it up)

## Usage

```
/is-frontend-figma-to-sitecore <mode> [argument]
```

| Mode | Aliases | What it does |
|---|---|---|
| `help` | `list`, `h` | Describes the modes and the recommended order |
| `init` | `i`, `initialize` | Caches, token-layer skeleton, global stylesheet import, Storybook wiring; fetches variables |
| `variables` | `v`, `styles` | Re-fetches Figma variables and styles into the cache and shows what changed |
| `color` | `c`, `colors`, `colour`, `colours` | Color primitives, semantic tokens, themes, gradients |
| `type` | `t`, `typography` | Font families, type tokens, text-style mixins, rich-text styles |
| `spacing` | `s` | Spacing primitives and responsive semantic tokens |
| `button` | `b`, `buttons` | Button mixins and `.isds-button-*` classes, every state |
| `form` | `f`, `forms` | Form element mixins and `.isds-form` styles, every state |
| `component` | `comp`, `block` | Creates or updates one component from a Figma node (`component <figma-url>`) |
| `page` | `p`, `showcase` | Dev-only showcase page for one component (`page <ComponentName>`) |

### Recommended order

1. `init` once per project
2. `color` → `type` → `spacing` → `button` / `form`
3. `component <figma-url>` per component, then `page <Name>` to see it in the app
4. `variables` whenever the designer changes tokens, then the modes it affects

## How it works

- **Token layer** (`src/styles/`): `tokens/` holds CSS custom properties (`--isds-*`, primitives → semantic tokens), `abstracts/` holds Sass-only helpers and mixins (`rem()`, `fluid()`, `mq()`, text-style, button and form mixins), `base/` holds a few global classes (`.isds-rich-text`, `.isds-button-*`, `.isds-form`). One global import in `_app.tsx` / `layout.tsx`. `@use` only — no `@import`.
- **Components**: one folder per component — `<Name>.tsx`, `<Name>.fields.ts` (type + Figma sample values), `<Name>.module.scss` (tokens and mixins only, no raw values), `<Name>.stories.ts`. Native Content SDK APIs, plain `fields.X` shape.
- **Themes**: Figma variable modes become `[data-color-theme]` selectors that also match `.isds-color-theme-<name>`, so Sitecore authors theme a component by picking a Style (`params.styles`) — no component code.
- **Every mode** detects the stack (stops on JSS), proposes the exact file changes, waits for "ready to build?", builds only what was approved, then verifies (lint, types, a raw-value check, Storybook / showcase comparison against Figma, max 3 rounds).
- **No Sitecore items are written.** The component mode reports a template spec (fields, rendering, variants, placeholders, Style items) for whoever creates them in Sitecore.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Workflow and mode table |
| `references/stack-and-routers.md` | Stack detection and Pages vs. App Router differences |
| `references/token-layer.md` | Token files, naming, helpers, themes, verification |
| `references/figma-cache.md` | URL, variables and styles caches |
| `references/component-patterns.md` | Component, fields file and CSS module rules |
| `references/content-model.md` | Figma → Sitecore field mapping |
| `references/storybook.md` | Storybook setup, component and design-system stories |
| `references/mode-*.md` | One file per mode |
| `scripts/extract-content.js` | Read-only content inventory of one Figma node (`use_figma`) |
| `scripts/export-tokens.js` | Read-only dump of all variable collections and text, color and effect styles, as the cache markdown |
| `assets/*.md` | Cache templates copied by `init` |

## What gets cached

`init` creates `.claude/figma-to-sitecore/` (commit it so the team shares it): `url-references.md`, `figma-variables.md`, `figma-styles.md`. Design-system and component modes refuse to run without a populated variables cache.

## Changelog

### 1.0.0
Restarted from the structure of `is-frontend-figma-to-code` 1.3.0, replacing the 0.6.0 component-only draft.
- Modes: `help`, `init`, `variables`, `color`, `type`, `spacing`, `button`, `form`, `component`, and the new `page` (dev-only showcase pages). No plan files and no `learn` mode.
- Global SCSS token layer generated from Figma (`--isds-*`, primitives and semantic tiers, `[data-color-theme]` themes usable as Sitecore Styles), with CSS modules that may only reference tokens.
- Figma variables and styles exported by one read-only script (`export-tokens.js`) that returns the cache markdown directly.
- Pages Router and App Router, detected; native Content SDK APIs only.
- Kept from 0.6.0: the read-only content extraction script, the field-type mapping, editing-safe rendering rules, Storybook decorator.
