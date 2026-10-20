# Content model: Figma → Sitecore fields

## Naming
- **Field name:** match the casing that existing components in the project use (e.g. `heading` in JSS starters, `Title` in many Content SDK projects). If there are none, use no-space PascalCase. Never use spaces — components read `fields.<name>` directly.
- **Field title** (author label, when the target supports it): the friendly name, e.g. `Primary CTA`.
- **Derive names from meaning, not layers.** Layer names are usually generic (`Text`, `Frame 27`). Use, in order: a `Content` annotation, a component property name, the text style (`Eyebrow/LG` → `eyebrow`, `Heading/H2` → `heading`, `Body/LG` → `body`), the component name (`Button_Primary` → `link` / `primaryCta`).
- Avoid names that collide with standard Sitecore fields (`name`, `created`, `icon`, anything starting with `__`).

## Extractor `hint` → field type

| `hint` / signal | Field type | Prop shape | Notes |
|---|---|---|---|
| `text` | Single-Line Text | `{ value: 'Text' }` | Heading **level** is not content — set it in TSX. |
| `rich-text` (lists, mixed styles, inline links, line breaks) | Rich Text | `{ value: '<p>…</p>' }` | Plain paragraph body copy is usually Rich Text too — authors expect bold/links. Ask if unsure. |
| `link` (instance named button/btn/cta/link, or a hyperlink) | General Link | `{ value: { href, text, target, linktype } }` | The `link-text` inside it is the link's `text`, not its own field. `href` comes from a hyperlink or prototype URL, else it is left empty for authors. |
| `image` | Image | `{ value: { src, alt, width, height } }` | Alt comes from the media item. |
| `image?` (a sizeable plain filled box) | Image, usually | as above | Wireframes draw images as grey boxes. Confirm it's an image, not decoration. |
| Boolean component property an author toggles | Checkbox | `{ value: true }` | |
| Date-looking text | Date | `{ value: '2026-10-20T00:00:00Z' }` | Confirm with the user. |
| Downloadable document | File | `{ value: { src, title } }` | |
| `repeats` group (same component, or same structure under different layer names) | Content List / child items | `[{ id, name, fields: { … } }]` | See below. One item template; its fields come from one repeated frame. |
| `optional` element that is **off** in this instance (e.g. a hidden text button) | The element's own type (often General Link), optional | as above | The design system allows it here; ask whether to support it. Render only when it has a value. |
| `stroke` on a frame | — (styling) | — | A rule or border. `INSIDE` strokes sit within the padding: subtract the stroke width from that side's CSS padding. |
| `unusedProps` on an instance | — | — | A boolean property no layer uses: a design-system leftover. Not a field; mention it, don't build it. |
| `input` + `input-placeholder` | Single-Line Text per placeholder (and one for the submit label) | `{ value: 'Enter your email…' }` | A form. The inputs themselves are code; authors edit their placeholder/label text. Ask what submit does — there is rarely a backend yet. |

## Containers and slots

When a design shows one frame holding interchangeable content (a footer with "a CTA or a newsletter" card, a tab panel, a column), the holder is a component with a **placeholder**, and each card is its own component:
- Before creating a card component, check whether an existing component already matches it (same panel, type, buttons); prefer extending it with an optional field over a near-duplicate.
- Site-wide components (footer, header) usually need a **root placeholder** in the layout — that edits the layout file and the root-placeholder config, so ask first.
- Their content is shared across pages: one shared datasource, not a copy per page (see [stack-targets.md](stack-targets.md)).

## Layouts shown side by side

`layouts` lists copies of one component placed next to each other on the canvas, with what each copy overrides (`visible` = a layer hidden, `textAlignHorizontal`, padding, width…). They show layouts the component must support, not repeating content. Compare each copy against the component's own variants: designers sometimes override a variant by hand instead of using the matching one, and the two can disagree (e.g. different gutters) — ask which is right. Then decide how authors get each layout: automatically from the content (e.g. no image → centered) when the difference follows from a field, otherwise a variant or a rendering parameter.

Static decoration (icons that never change, dividers, background shapes, the panel color) is **not** content. Build it in code, or make it a rendering parameter if authors pick between options.

## Repeating content
- **A list owned by this component** (stats, slides of one carousel, rows of one table): authors add, remove and reorder items. Default to the stack's list pattern — in JSS, a Content List field of a small item template (see [stack-targets.md](stack-targets.md)); in the Content SDK, child items read with a component query.
- **Multilist / Treelist of shared items** — the items are shared content reused elsewhere (people, articles).
- **Fixed field pairs** (`stat1Value`, `stat2Value`…) only when the count can never change; offer it as the alternative, not the default.

## Variants, parameters, fields

| The author's choice is… | Use |
|---|---|
| A different layout of the same content | A variant (named export in Content SDK / a param switch in JSS) |
| A style toggle for any content (theme, alignment, spacing) | A rendering parameter |
| Part of the content itself | A field |
| Different content **and** layout | A separate component |

## Sample values
Use the text extracted from Figma as the sample/mock content, verbatim — including placeholder copy like "Lorem ipsum". Links get the extracted text and `href: '#'` (or the real URL if Figma had one).
