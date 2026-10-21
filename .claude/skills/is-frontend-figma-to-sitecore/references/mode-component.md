# Mode: component

Creates or updates **one** Sitecore component from a Figma node. Uses [content-model.md](content-model.md), [component-patterns.md](component-patterns.md), [token-layer.md](token-layer.md) and [storybook.md](storybook.md).

## Step 4a — Gather references

Show all of these questions first, as a short list, then ask them. If the user answers several at once, take them and ask only what's left. Pre-fill from the argument and `## Components` in `url-references.md`.

1. **Which component?** Its Sitecore name (PascalCase). Look for `<component-root>/<kebab-name>/<Name>.tsx` (or a file exported under that name). Found → we're **updating**; not found → **creating**.
2. **URLs** — Figma node URLs (desktop, and mobile if it exists), requirements doc, Teamwork task. Save them under `### <Name>` in `## Components`.
3. **Mobile** — with no mobile URL: how does it change on small screens, and at which breakpoint (a `$breakpoints` name)?
4. **Interactivity** — anything that needs JavaScript (carousel, tabs, accordion, modal, analytics)?
5. **Anything else** — notes, edge cases, content limits.

## Step 4b — Extract from Figma

From each URL take the file key and node id (`node-id=2812-11260` → `2812:11260`).

1. Load the `figma-use` skill, then `create_session` for the file.
2. Run [extract-content.js](../scripts/extract-content.js) with `use_figma`, replacing `__NODE_ID__`. It is read-only (it only switches the current page to the node's page).
3. `get_screenshot` on the node, and look at it.
4. `get_variable_defs` on the node: the tokens it uses. Cross-check against `figma-variables.md`.
5. Optionally `get_design_context` for structure. Its React + Tailwind output is a reference only: never copy Tailwind classes or raw values.

Read the result:
- A root frame much larger than its content, or holding a single instance → the component is that instance, not the canvas around it.
- `layouts` → copies of one component shown side by side: layouts to support, not repeating content ([content-model.md](content-model.md) → "Layouts shown side by side").
- `repeats` → repeating content (a list field).
- Annotations (Dev Mode, "Content", "Development") are the designer's intent: follow them.

## Step 4c — Read the existing code (updating only)

Read every file in the component folder (`.tsx`, `.fields.ts`, module, stories), its showcase page if any, and where else it's used. Rules for updates:
- **Never rename** an existing field, the component's file/export name, or a variant export without asking: Sitecore content and Headless Variant items reference those names, and renaming orphans authored content.
- Removing a field → ask; authors may have content in it.

## Step 4d — Content model

Using [content-model.md](content-model.md), show one table:

| Field | Type | Sample value (from Figma) | Source (layer / text style) | Status |
|---|---|---|---|---|

`Status`: `create` / `update` / `keep` / `delete` (updating only).

Below it, the **variants** (named exports), the **rendering parameters**, and any **placeholders** the component holds. Then list only what Figma couldn't answer and ask, in one round (up to 4 questions). Typical gaps: the component name, weak field names, link `href`s, whether a visual option is static or a rendering parameter, Rich Text vs. Single-Line Text for body copy.

## Step 4e — Styling plan

Map every visual value in the extraction to the token layer:

| Figma | Token / mixin |
|---|---|
| `Grey/50` fill | `var(--isds-color-surface-muted)` |
| `Heading/H2` | `@include heading-h2;` |
| padding 100 / gap 30 | `var(--isds-spacing-section-padding)` / `var(--isds-spacing-stack-lg)` |
| Button_Primary instance | `@include button-primary;` |

- A Figma variable that maps to a primitive with no semantic token → prefer the semantic token whose use matches; otherwise flag it.
- **Hard stop** if the design needs a color, text style or spacing the token layer doesn't have: ask whether to run the matching design-system mode first, add the token in this proposal (flagged), or use a component-local token ([token-layer.md](token-layer.md) → "Tiers").
- If the token layer is empty (no `init` / design-system modes yet), say so and recommend running them first. If the user wants to continue anyway, put the raw values in component-local tokens at the top of the module (one place to swap for real tokens later) and list each one as a TODO.

## Step 4f — Files

Plan these, following [component-patterns.md](component-patterns.md):

```
<component-root>/<kebab-name>/
  <Name>.tsx          the component; variants are named exports, `Default` the base
  <Name>.fields.ts    fields type + sample fields (verbatim Figma values) + empty fields
  <Name>.module.scss  CSS module (follow the project's existing module naming)
  <Name>.stories.ts   Storybook stories (storybook.md)
```

Also, when needed: tokens added to the token layer (flagged), `componentMap.exclude` entries in `sitecore.cli.config.ts` if `.stories.*` / `.fields.*` aren't excluded yet, and a JavaScript plan for interactivity (client component boundaries per [stack-and-routers.md](stack-and-routers.md), any third-party package — never added without approval).

Only these files. Anything else (Layout, other components, proxy) needs the user's OK first.

## Step 4g — Proposal

The content model, the styling map, the file list and the open risks. Then continue with SKILL.md Step 5. Split the build into chunks you can verify one at a time (fields → component → styles → stories) and ask whether to pause between them.

## In the report (SKILL.md Step 8)

Add the **template spec** for whoever creates the Sitecore items — this skill doesn't create them:
- Template `<Name>` (and `<Name>Item` for list items): field name · title · type · shared/unversioned · source.
- Rendering: a JSON Rendering whose `componentName` is `<Name>`, its datasource template and location, the parameters template (with `IStyling` for Styles if the component reads `params.styles`), and the Headless Variant items (one per named export).
- Placeholder keys and their allowed components.
- Style items to create (e.g. color-theme classes).

And suggest: `/is-frontend-figma-to-sitecore page <Name>` to create its showcase page.
