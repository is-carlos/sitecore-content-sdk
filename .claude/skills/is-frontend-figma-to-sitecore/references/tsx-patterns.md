# TSX patterns

The project's conventions (`CONVENTIONS.md`, `AGENTS.md`, `CLAUDE.md`) win over anything here. If the project ships the official Content SDK agent skills (`.agents/skills`), read the ones that apply too. Import paths and editing-state access differ per SDK — see [stack-targets.md](stack-targets.md).

## Props and fields
- Type every field: `Field<string>` (text, rich text), `RichTextField`, `LinkField`, `ImageField`, `Field<boolean>`, `Field<string>` for dates.
- Render fields with the SDK components — `Text`, `RichText`, `Link`, `Image`/`NextImage`, `DateField`. Never print a field's raw `.value` into the DOM when an SDK component exists; that breaks inline editing.
- Heading level is set in TSX: `<Text tag="h2" field={fields.heading} />`.
- A CTA renders as `<Link field={fields.link} className="…" />` — the link text comes from the field, not from a separate label field.
- Use optional chaining on nested values and guard arrays: `(items ?? []).map(...)`.
- **List keys:** key Content List items by position plus id — `` key={`${index}-${item.id ?? item.name}`} ``. In disconnected mode every item's `id` is the same placeholder string (`available-in-connected-mode`), so `key={item.id}` produces duplicate-key errors.
- **SVG images** (logos, icons): render with the plain `Image` component, not `NextImage` — the Next.js image optimizer rejects SVG by default.

## Placeholders (components that hold other components)
- Render `<Placeholder name="<key>" rendering={rendering} />` and declare the key in the code-first definition (`placeholders: ['<key>']`) — without it Sitecore drops whatever authors place inside.
- To change layout when the slot is empty, check `rendering.placeholders?.['<key>']?.length`; keep the slot visible in editing mode so authors can add to it.
- Scope any global element styles (e.g. `a { color: inherit }`) to the component's own part, never the root that wraps the placeholder, or they leak into the child components.

## Editing mode
- With no datasource: use the project's existing pattern (`withDatasourceCheck()` in JSS; check `rendering.dataSource` in Content SDK App Router).
- **Value-or-editing:** wrap optional fields as `{(field?.value || isEditing) && <Text field={field} />}` so empty fields stay selectable in the editor but vanish on the live site. Links: test `field?.value?.href`; images: `field?.value?.src`.
- Decorative overlays, gradients, and `::before` layers must not sit above editable fields — add `pointer-events: none`.

## Rendering parameters
- Read from `props.params` (`props.params.theme`). Values are strings; give each a default.

## Server vs. client
- Default to no client code. Add `'use client'` (App Router) only to the smallest piece that needs state, effects, or events.
- No browser globals (`window`, `document`) during render.

## Styling
- Use the project's existing tokens, utility classes, and naming. Map Figma text styles and variables to them (e.g. `Heading/H2` → the project's h2 class/token).
- **Never invent a color, type, or spacing value silently.** If the design needs one the project doesn't have, ask; if the user approves a raw value, keep it in one place (a local custom property at the top of the component's styles) and say so in the report.
- Default: the component's `<Name>.styles.module.scss` (see the component folder in [stack-targets.md](stack-targets.md)). Every class used in TSX must exist in the module — a missing key renders `undefined` silently.
- Tailwind projects: theme classes only, no arbitrary values (`text-[17px]`) unless approved as above; the module then holds only what utilities can't express.

## Accessibility (minimum)
- One clear heading per component.
- Images: alt from the image field; decorative images `alt=""`.
- Interactive parts are real `<a>` / `<button>` elements with visible focus. Respect `prefers-reduced-motion`.
