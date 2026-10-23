---
name: is-frontend-figma-to-sitecore
description: Builds the design system and components of a Sitecore Content SDK (Next.js) head app from a Figma file — a global SCSS token layer (colors, typography, spacing, buttons, forms) generated from Figma variables and styles, CSS-module components that render Sitecore fields with the Content SDK field components, Storybook stories, and dev-only showcase pages. Content SDK only, not JSS. Use when the user runs /is-frontend-figma-to-sitecore <mode>, or asks to build Sitecore design tokens or a Sitecore component from a Figma design.
compatibility: Claude Code or Cursor Agent mode. Requires the Figma MCP. A browser MCP is used for visual QA when available. Requires @sitecore-content-sdk/nextjs (Pages Router or App Router); JSS (@sitecore-jss/*) projects are not supported.
metadata:
  author: Interactive Strategies
  version: 1.3.0
---


# Figma to Sitecore

```
/is-frontend-figma-to-sitecore <mode> [argument]
```

Do each step **in order**. Do not skip or combine steps.


## Step 1 — Mode choice

The first argument is `<mode>`. It must be **one** of:

| Mode      | Aliases                    | Reference file                                     | What it does |
|-----------|----------------------------|----------------------------------------------------|--------------|
| help      | list, h                    | [mode-help.md](references/mode-help.md)            | Describes the skill, its modes and the recommended order. |
| init      | i, initialize              | [mode-init.md](references/mode-init.md)            | First-time setup: Figma caches, token-layer skeleton, global import, Storybook wiring. Runs `variables`. |
| variables | v, styles                  | [mode-variables.md](references/mode-variables.md)  | Re-fetches the Figma variables and styles into the project cache. |
| color     | c, colors, colour, colours | [mode-color.md](references/mode-color.md)          | Color primitives, semantic tokens, color themes and gradients. |
| type      | t, typography              | [mode-type.md](references/mode-type.md)            | Font families, type tokens, text-style mixins and rich-text styles. |
| spacing   | s                          | [mode-spacing.md](references/mode-spacing.md)      | Spacing primitives and responsive semantic spacing tokens. |
| button    | b, buttons                 | [mode-button.md](references/mode-button.md)        | Button mixins and global button classes, with every state. |
| form      | f, forms                   | [mode-form.md](references/mode-form.md)            | Form element mixins and global form styles, with every state. |
| component | comp, block                | [mode-component.md](references/mode-component.md)  | Creates or updates one Sitecore component from a Figma node. Optional argument: a Figma node URL or a component name. |
| page      | p, showcase                | [mode-page.md](references/mode-page.md)            | Creates or updates a dev-only showcase page for one component. Optional argument: the component name. |

- Only **one** mode per command. A Figma URL with no mode means `component`.
- A missing or unrecognized mode runs `help`.


## Step 2 — Detect the project

Skip for `help`.

Follow [stack-and-routers.md](references/stack-and-routers.md) → "Detect". Report the result in one line, e.g. *"Content SDK 2.4.1 · Pages Router · styles root src/styles · tokens: color, type · Storybook 10 · local mock"*. Read the conventions files it lists; their rules win over this skill.

If the project uses JSS (`@sitecore-jss/*`) and not the Content SDK, **stop**: say this skill only supports the Content SDK and point to the JSS → Content SDK upgrade guide (or the project's `content-sdk-upgrade-assistant` skill).


## Step 3 — Figma caches

Skip for `help` and `init` (init creates them).

Follow [figma-cache.md](references/figma-cache.md): use the cached URLs before asking for one, and check the variables cache before any design-system or component mode.


## Step 4 — Run the mode

Open the reference file for the chosen mode and follow it. Every mode that writes files ends its work in this step with a **proposal**: a table of the files it will create or edit and, per file, what changes. The shared rules live in:

- [token-layer.md](references/token-layer.md) — files, naming, helpers, themes. Every mode follows it.
- [component-patterns.md](references/component-patterns.md) — component code (component and page modes).
- [content-model.md](references/content-model.md) — Figma → Sitecore fields (component mode).
- [storybook.md](references/storybook.md) — stories and Storybook wiring.

**Ambiguity:** do not assume. Ask, ideally multiple choice, in as few rounds as possible (batch up to 4 questions per round).


## Step 5 — Confirm

Show the proposal and ask: *"Ready to build?"* Do not create or edit any file until the user confirms. (`help` and `variables` don't need this step; `variables` only writes its cache files.)


## Step 6 — Build

- Create or edit **only** the files in the approved proposal. Anything else needs the user's OK first.
- Never edit `.env*`, `.sitecore/*` (generated), `node_modules/`, `.next/`.
- If part of the work is too hard or uncertain, leave a `// TODO(figma-to-sitecore): …` comment and list it in the report.
- New files must match the repo's formatting: run `npx prettier --write <files>` (or `npx eslint --fix`) on them.


## Step 7 — Verify

1. Run `npm run lint` and `npx tsc --noEmit`. Fix what fails in the files you touched.
2. Run the token check from [token-layer.md](references/token-layer.md) → "Verify" on every `.scss` file you touched.
3. If the `is-frontend-playbook` skill is available, check the work against it.
4. Visual QA, when the mode has something to look at: Storybook first, else the component's showcase page (see [storybook.md](references/storybook.md) and [mode-page.md](references/mode-page.md)). Use the browser MCP at the Figma frame's width, compare against the Figma screenshot, fix and reload — at most **3 rounds**. If Storybook isn't running, ask the user to start it or for its URL; never restart or reconfigure a server the user is running, and stop any server you started.

Never run `npm run build` into a `.next` folder a running dev server is using.


## Step 8 — Report

Tell the user, briefly:
- The files created or changed, as links.
- What still has to be done by hand: TODOs, values Figma didn't have (magenta tokens), and Sitecore items to create (component mode: the template spec).
- Visual differences left from Step 7.
- The suggested next mode (see the recommended order in [mode-help.md](references/mode-help.md)).
