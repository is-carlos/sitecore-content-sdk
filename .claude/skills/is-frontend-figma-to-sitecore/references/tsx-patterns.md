# TSX patterns

The project's conventions (`CONVENTIONS.md`, `AGENTS.md`, `CLAUDE.md`) win over anything here. If the project ships the official Content SDK agent skills (`.agents/skills`), read the ones that apply too. Import everything from `@sitecore-content-sdk/nextjs`, never from `@sitecore-jss/*`. Editing-state access differs per router — see [stack-targets.md](stack-targets.md).

## Props and fields
- Type every field: `Field<string>` (text, rich text), `RichTextField`, `LinkField`, `ImageField`, `Field<boolean>`, `Field<string>` for dates.
- Render fields with the SDK components — `Text`, `RichText`, `Link`, `Image`/`NextImage`, `DateField`. Never print a field's raw `.value` into the DOM when an SDK component exists; that breaks inline editing.
- Heading level is set in TSX: `<Text tag="h2" field={fields.heading} />`.
- A CTA renders as `<Link field={fields.link} className="…" />` — the link text comes from the field, not from a separate label field.
- Use optional chaining on nested values and guard arrays: `(items ?? []).map(...)`.
- **List keys:** key list items (Treelist/Multilist) by position plus id — `` key={`${index}-${item.id ?? item.name}`} ``. Sample fields, stories and mock fixtures often reuse or omit ids, so `key={item.id}` alone produces duplicate-key errors.
- **SVG images** (logos, icons): render with the plain `Image` component, not `NextImage` — the Next.js image optimizer rejects SVG by default.

## Placeholders (components that hold other components)
- Render `<Placeholder name="<key>" rendering={rendering} />` and list the key in the report's template spec. Authors need placeholder settings for that key in Sitecore to add components to it.
- To change layout when the slot is empty, check `rendering.placeholders?.['<key>']?.length`; keep the slot visible in editing mode so authors can add to it.
- Scope any global element styles (e.g. `a { color: inherit }`) to the component's own part, never the root that wraps the placeholder, or they leak into the child components.

## Editing mode
- With no datasource: use the project's existing pattern — `withDatasourceCheck()` from `@sitecore-content-sdk/nextjs` or a `rendering.dataSource` check in the Pages Router; a `rendering.dataSource` check in the App Router.
- `isEditing` comes from `page.mode.isEditing` (via `useSitecore()` or the `page` prop, per router).
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
