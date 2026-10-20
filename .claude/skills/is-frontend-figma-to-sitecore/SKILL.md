---
name: is-frontend-figma-to-sitecore
description: Builds a Sitecore Content SDK (Next.js) component from a Figma node URL — extracts the content from Figma, proposes the Sitecore fields, and generates the component with Content SDK field components (Text, RichText, Link, Image…), sample content, Storybook stories, and a template spec for Sitecore. Content SDK only, not JSS. No Sitecore CLI needed. Use when the user runs /is-frontend-figma-to-sitecore <figma-url>, or asks to build a Sitecore component from a Figma design.
compatibility: Claude Code. Requires the Figma MCP. A browser MCP is used for visual QA when available. Requires @sitecore-content-sdk/nextjs; JSS (@sitecore-jss/*) projects are not supported.
metadata:
  author: Interactive Strategies
  version: '0.6.0'
---

# Figma to Sitecore

```
/is-frontend-figma-to-sitecore <figma-node-url>
```

One component per run. If no URL is given, ask for a Figma URL that includes `node-id`.

Do each step in order.


## Step 1 — Detect the project

Follow the "Detect" table in [stack-targets.md](references/stack-targets.md). Report the result in one line, e.g. *"Content SDK 2.4 · Pages Router · local mock (mock-data) · CSS modules · Storybook"*. Read the conventions files it finds.

If the project uses JSS (`@sitecore-jss/*`) and not the Content SDK, stop here: this skill only builds Content SDK components. Say so and point the user to the JSS → Content SDK upgrade.


## Step 2 — Extract from Figma

From the URL take the `fileKey` and the `nodeId` (`node-id=2812-11260` → `2812:11260`).

1. Load the `figma-use` skill, then call `create_session` for the file.
2. Run [scripts/extract-content.js](scripts/extract-content.js) with `use_figma`, replacing `__NODE_ID__`. It is read-only.
3. Call `get_screenshot` on the node and look at it.
4. Call `get_variable_defs` on the node for the tokens it uses.

If the root frame is much larger than its content, or the content is a single instance, say so — the component is that instance, not the empty canvas around it. If `layouts` lists several copies of one component, they are layouts to support (see content-model.md), not repeating content.


## Step 3 — Propose the content model

Using [content-model.md](references/content-model.md), turn the extraction into one table and show it:

| Field | Type | Sample value (from Figma) | Source (layer / text style) |
|---|---|---|---|

Below it, list only what Figma could not answer, and ask about those in **one** `AskUserQuestion` round (up to 4 questions). Typical gaps:
- The component name (default: the Figma frame/component name in PascalCase).
- Field names, when the inference is weak.
- Link `href`s Figma didn't have (default: empty for authors to fill, `#` in sample content).
- Whether a visual option (background, alignment) is static or a rendering parameter.

Everything else, decide and state it. Do not write files until the user has answered.


## Step 4 — Generate

Follow the outputs for the detected stack in [stack-targets.md](references/stack-targets.md) and the rules in [tsx-patterns.md](references/tsx-patterns.md). Every component gets its own folder:

```
<kebab-name>/<Name>.tsx · <Name>.fields.ts · <Name>.styles.module.scss · <Name>.stories.ts
```

- `<Name>.tsx`: renders every field with the field components from `@sitecore-content-sdk/nextjs`.
- `<Name>.fields.ts`: the fields type, the extracted Figma values as sample fields, and an empty set.
- `<Name>.module.scss`: maps the Figma text styles and variables onto the project's tokens.
- `<Name>.stories.ts`: `Default`, one per variant, `Empty`, `NoDatasource` (and `LongContent`), built from the fields file. If Storybook or `sass` is missing, ask to install them first.
- A sample route in the local mock (`mock-data/`), when the project has one.
- The component map exclusions for `.stories` / `.fields` files, if they're missing (ask first).

Only create or edit the files listed in the stack's output table. Anything else needs the user's OK first.


## Step 5 — Verify

1. Run the stack's checks (lint, type-check/build). Fix what fails.
2. Preview it (local mock route, Storybook, or the static-render fallback in [stack-targets.md](references/stack-targets.md)) with the browser MCP at the Figma frame's width. Compare against the Figma screenshot, and measure element boxes against the extracted sizes: layout, spacing, type, color. Fix and reload — at most **3 rounds**. Stop any server you started; never restart or reconfigure one the user is running.


## Step 6 — Report

Tell the user, briefly:
- The files created/changed (as links).
- The template spec: the final field table (name · title · type · shared), rendering parameters, and placeholder keys.
- What an author or developer still has to do: create the template, rendering and any placeholder settings in Sitecore (the Content SDK has no code-first definitions), set the CTA link, and so on.
- Any visual differences left from Step 5.
