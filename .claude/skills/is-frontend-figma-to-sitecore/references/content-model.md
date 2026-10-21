# Content model: Figma → Sitecore fields

## Naming
- **Field name**: match the casing the project's components already use (e.g. `Title`, `PrimaryCTA`). No components yet → PascalCase without spaces. Components read `fields.<Name>` directly, so the name in code must equal the Sitecore field name.
- **Field title** (the author-facing label, in the template spec): the friendly name, e.g. `Primary CTA`.
- **Derive names from meaning, not layers.** Layer names are usually generic (`Text`, `Frame 27`). Use, in order: a Content/Development annotation, a component property name, the text style (`Eyebrow/LG` → `Eyebrow`, `Heading/H2` → `Title`, `Body/LG` → `Text`), the component name (`Button_Primary` → `PrimaryCTA`).
- Avoid names that clash with standard Sitecore fields (`Name`, `Created`, `Icon`, anything starting with `__`).

## Extractor `hint` → field type

| `hint` / signal | Field type | TS type | Notes |
|---|---|---|---|
| `text` | Single-Line Text | `Field<string>` | Heading level is code, not content. |
| `rich-text` (lists, mixed styles, inline links, line breaks) | Rich Text | `RichTextField` | Plain body paragraphs are usually Rich Text too — authors expect bold and links. Ask if unsure. |
| `link` (button/btn/cta/link instance, or a hyperlink) | General Link | `LinkField` | The `link-text` inside it is the link's text, not its own field. `href` from a hyperlink or prototype URL, else empty for authors. |
| `image` | Image | `ImageField` | Alt comes from the media item. |
| `image?` (a sizeable plain filled box) | Image, usually | `ImageField` | Wireframes draw images as grey boxes. Confirm it's not decoration. |
| Boolean component property an author toggles | Checkbox | `Field<boolean>` | |
| Date-looking text | Date / Datetime | `Field<string>` | Render with `DateField`. Confirm. |
| Downloadable document | File | `FileField` | |
| Number the author edits (a count, a stat) | Number | `Field<number>` | Stats shown with units ("98%") are usually Single-Line Text. Ask. |
| `repeats` group | Treelist / Multilist | `Item[]` | See "Repeating content". |
| `optional` element switched off in this instance | the element's own type, optional | | The design system allows it here; ask whether to support it. Render only when it has a value. |
| `stroke` | — (styling) | | `INSIDE` strokes sit within the padding: subtract the width from that side's padding. |
| `unusedProps` | — | | A boolean property no layer uses: design-system leftover. Mention it, don't build it. |
| `input` + `input-placeholder` | Single-Line Text per label/placeholder (and the submit label) | `Field<string>` | A form: the controls are code (form mode styles). Ask what submit does. |

Layout JSON shapes, for sample fields: Single-Line/Multi-Line/Rich Text `{ value: '…' }`; General Link `{ value: { href, text, linktype: 'external', target: '' } }`; Image `{ value: { src, alt, width, height } }`; File `{ value: { src, title } }`; Number `{ value: 3 }`; Checkbox `{ value: true }`; Date `{ value: '2026-10-20T00:00:00Z' }`; Treelist/Multilist `[{ id, name, fields: { … } }]`; Droptree/Droplink `{ id, name, fields: { … } }`.

## Variants, parameters, fields

| The author's choice is… | Use |
|---|---|
| A different layout of the same content | A variant (named export + Headless Variant item) |
| A style for any content (theme, alignment, spacing) | A rendering parameter (theme → the Styles parameter with a token-layer class) |
| Part of the content | A field |
| Different content **and** layout | A separate component |

## Layouts shown side by side

`layouts` lists copies of one component placed next to each other, with what each overrides (hidden layers, alignment, padding, width…). They are layouts to support, not repeating content. Compare each copy with the component's own variants — designers sometimes override a variant by hand instead of using the matching one, and the two can disagree; ask which is right. Then decide how authors get each layout: automatically from the content (no image → centered) when it follows from a field, otherwise a variant or a rendering parameter.

Static decoration (icons that never change, dividers, background shapes) is not content: build it in code, or make it a parameter if authors choose between options.

## Containers and slots

A frame holding interchangeable content (a column, a tab panel, a footer that holds "a CTA or a newsletter" card) is a component with a **placeholder**; each card is its own component. Before creating a card component, check whether an existing one already matches; prefer extending it with an optional field. Site-wide containers (header, footer) usually need a root placeholder in `Layout.tsx`, which changes every page — ask first, and list the placeholder settings needed in Sitecore.

## Repeating content
- **A list owned by this component** (stats, slides, rows): default to a Treelist of a small `<Name>Item` template, items stored under the datasource. The layout delivers them inline as `fields.<Name>: [{ id, name, fields }]`. Use component-level data only when the author doesn't pick the items (e.g. "all children"), and ask first.
- **Multilist / Treelist of shared items** — when the items are shared content reused elsewhere (people, articles).
- **Fixed field pairs** (`Stat1Value`, `Stat2Value`…) only when the count can never change; offer it as the alternative, not the default.

## Sample values
Use the Figma text as sample content, verbatim — including placeholder copy like "Lorem ipsum". Links get the extracted text and `href: '#'` (or the real URL if Figma has one). Images use a file in `public/` if the project has suitable ones; otherwise ask whether to export the Figma image (`get_screenshot` on the image node) into `public/showcase/`.
