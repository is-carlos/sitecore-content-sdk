# Mode: type

Updates `tokens/_typography.scss`, `abstracts/_type.scss` and `base/_rich-text.scss` to match Figma. Follows [token-layer.md](token-layer.md). Run after `color`.

## Step 4a — Orient

Read the three files above, the project's font loading (`next/font` in e.g. `src/lib/fonts.ts`, and the `--font-*` properties it exposes), and how components use type today (`grep -rn "font-\|@include" <component root> --include=*.scss`).

## Step 4b — Font families

- One `--isds-font-family-<role>` per family role in Figma (variables like `Font/Heading`, or the families the text styles use).
- With `next/font`: `--isds-font-family-heading: var(--font-poppins), 'Poppins', sans-serif;` — the `next/font` property first, then the family name and a generic fallback.
- A family in the text styles that the project doesn't load → ask: add it to `next/font` (an app file outside the token layer, so it must be in the proposal) or substitute.
- Two different families among headings → two roles; ask how to name them.
- Variable-font axes Figma uses (e.g. a condensed width) become tokens too: `--isds-font-stretch-condensed: 75%;`.

## Step 4c — Tokens per text style

For each text style in `figma-styles.md`, in `tokens/_typography.scss`:

- `--isds-font-size-<style>`: px wrapped as `#{rem(32px)}`. If the size differs between Figma modes or between a desktop and a mobile style (`Heading/H2` and `Heading/H2 Mobile`), use `#{fluid($mobile, $desktop)}`.
- `--isds-line-height-<style>`: unitless. `130%` → `1.3`; px → divide by the font size (`24px` on `16px` → `1.5`); `auto` → `normal`.
- `--isds-letter-spacing-<style>`: em. `4%` → `0.04em`; px → divide by the font size; `0` → omit.
- `--isds-font-weight-<style>`: the numeric weight of the Figma font style (`Bold` → `700`, `SemiBold` → `600`, `Medium` → `500`, `Regular` → `400`).
- Bound variables in the style (from the `Bound variables` column) mean the token should reference that variable's token instead of a raw value.

A size used by only one component that isn't a text style → don't add it; it belongs in that component (ask).

## Step 4d — Mixins (`abstracts/_type.scss`)

One mixin per text style, using only the tokens:

```scss
@mixin heading-h2 {
  font-family: var(--isds-font-family-heading);
  font-size: var(--isds-font-size-heading-h2);
  font-weight: var(--isds-font-weight-heading-h2);
  line-height: var(--isds-line-height-heading-h2);
  letter-spacing: var(--isds-letter-spacing-heading-h2);
}
```

Add `text-transform` / `text-decoration` when the style sets a case or decoration. Components use them as `@include heading-h2;`.

Styles in Figma but not in code → create them even if unused, with `// Unused?`. Fonts used in the designs with no text style or variable behind them are probably designer errors: flag them and ask.

## Step 4e — Rich text (`base/_rich-text.scss`)

Sitecore Rich Text fields render raw HTML (`h2`, `p`, `ul`, `a`, `strong`…). Style it once, globally, under `.isds-rich-text` with the mixins, so components only add the class to `<RichText>`:

```scss
@use '../abstracts' as *;

.isds-rich-text {
  > * + * { margin-top: var(--isds-spacing-rich-text-gap, 1em); }
  h2 { @include heading-h2; }
  p, li { @include body-md; }
  a { color: var(--isds-color-link); text-decoration: underline; }
}
```

Ask which text style each element maps to when Figma has a "Rich text" / "WYSIWYG" frame; otherwise propose a mapping. If rich text needs different sizes than the main styles, override the size tokens under `.isds-rich-text` instead of writing new rules.

## Step 4f — Storybook

Plan to create or update `src/stories/design-system/Typography.stories.tsx`: one row per text style (name + sample text rendered with the mixin) and a `RichText` story with every element (see [storybook.md](storybook.md)).

## Step 4g — Proposal

List tokens and mixins added, changed, renamed or deleted, the rich-text mapping, font-loading changes, and every file that references a renamed or deleted token or mixin. Then continue with SKILL.md Step 5.
