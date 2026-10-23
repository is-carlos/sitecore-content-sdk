# Mode: type

Updates `tokens/_typography.scss`, `abstracts/_type.scss` and `base/_rich-text.scss` to match Figma. Follows [token-layer.md](token-layer.md). Run after `color`.

## Step 4a — Orient

Read the three files above, the project's font loading (`next/font` in e.g. `src/lib/fonts.ts`, and the `--font-*` properties it exposes), and how components use type today (`grep -rn "font-\|@include" <component root> --include=*.scss`).

## Step 4b — Font families

- One `--isds-font-family-<role>` per family role in Figma (variables like `Font/Heading`, or the families the text styles use).
- With `next/font`: `--isds-font-family-heading: var(--font-poppins), 'Poppins', sans-serif;` — the `next/font` property first, then the family name and a generic fallback.
- A family in the text styles that the project doesn't load → ask: add it to `next/font` (an app file outside the token layer, so it must be in the proposal) or substitute. Google Fonts may have renamed it: `Source Sans Pro` is `Source_Sans_3` in `next/font/google`. Check the export in `node_modules/next/dist/compiled/@next/font/dist/google/index.d.ts`, and keep the Figma name as a fallback in the token.
- **Quote the family names** when writing `next/font` families into the `--font-*` custom properties (the project's `fonts.ts` / root layout / Storybook preview). Storybook's `next/font` returns them unquoted (`Source Sans 3`), and an unquoted name with a word that starts with a digit is invalid CSS, which drops the whole `font-family` (the text falls back to Times). Next.js itself quotes them. Use a helper that quotes every name that isn't quoted or generic, and use it everywhere the properties are written:

  ```ts
  const GENERIC_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

  export const cssFontFamily = (font: { style: { fontFamily: string } }): string =>
    font.style.fontFamily
      .split(',')
      .map((name) => name.trim())
      .map((name) => (/^['"]/.test(name) || GENERIC_FAMILIES.includes(name) ? name : `'${name}'`))
      .join(', ');

  // `--font-source-sans: ${cssFontFamily(sourceSans)};`
  ```

  Verify in Storybook that each family actually renders (`document.fonts` shows it `loaded`, and the computed `font-family` isn't the browser default).
- Two different families among headings → two roles; ask how to name them.
- Variable-font axes Figma uses (e.g. a condensed width) become tokens too: `--isds-font-stretch-condensed: 75%;`.

## Step 4c — Tokens per text style

**Size scale first.** When Figma has font-size variables (e.g. `Typography` › `Font Size/Heading/XL`), make one scale token per variable, named after the variable without its `Font Size/` group: `--isds-font-size-heading-xl`. Sizes that differ between modes use `#{fluid($mobile, $desktop)}`; equal ones `#{rem(…)}`.

Then, for each text style in `figma-styles.md`, in `tokens/_typography.scss`:

- **Font size:**
  - **Bound** to a size variable (the `Bound variables` column has `fontSize → …`) → no per-style token. The mixin uses the scale token directly: `font-size: var(--isds-font-size-heading-xl);`. An alias token adds nothing and can collide with the scale token's name (`Body/Body L` and `Font Size/Body/L` both become `--isds-font-size-body-l`), creating a self-referencing custom property that is invalid.
  - **Unbound** → `--isds-font-size-<style>`, px wrapped as `#{rem(32px)}`. If the size differs between a desktop and a mobile style (`Heading/H2` and `Heading/H2 Mobile`), use `#{fluid($mobile, $desktop)}`. Check the name doesn't collide with a scale token.
- `--isds-line-height-<style>`: unitless. `130%` → `1.3`; px → divide by the font size (`24px` on `16px` → `1.5`); `auto` → `normal`.
- `--isds-letter-spacing-<style>`: em. `4%` → `0.04em`; px → divide by the font size; `0` → omit.
- `--isds-font-weight-<style>`: the numeric weight of the Figma font style (`Bold` → `700`, `SemiBold` → `600`, `Medium` → `500`, `Regular` → `400`).
- Bound variables in the style (from the `Bound variables` column) mean the token should reference that variable's token instead of a raw value. A binding marked `(deleted)` or `(library)` has no token in the cache: show the style's own value and ask whether to use it, map it to an existing token, or wait for the designer.

A size used by only one component that isn't a text style → don't add it; it belongs in that component (ask).

## Step 4d — Mixins (`abstracts/_type.scss`)

One mixin per text style, using only the tokens:

```scss
// Display/XL (font size bound to Font Size/Heading/XL, no letter spacing)
@mixin display-xl {
  font-family: var(--isds-font-family-heading);
  font-size: var(--isds-font-size-heading-xl);
  font-weight: var(--isds-font-weight-display-xl);
  line-height: var(--isds-line-height-display-xl);
  letter-spacing: 0;
}

// Other/Eyebrow (letter spacing 14%, uppercase)
@mixin other-eyebrow {
  font-family: var(--isds-font-family-accent);
  font-size: var(--isds-font-size-body-s);
  font-weight: var(--isds-font-weight-other-eyebrow);
  line-height: var(--isds-line-height-other-eyebrow);
  letter-spacing: var(--isds-letter-spacing-other-eyebrow);
  text-transform: uppercase;
}
```

- **Always set `letter-spacing`**: the style's token, or `0` when the style has none. Letter spacing is inherited, so a mixin that leaves it out picks up a parent's tracking (text inside an eyebrow would get its 0.14em). Never write `var()` to a letter-spacing token that doesn't exist: an undefined `var()` also falls back to the inherited value.
- Add `text-transform` / `text-decoration` when the style sets a case or decoration.
- Components use them as `@include display-xl;`.

**Generate, then verify.** With more than a handful of styles, generate the tokens, the mixins and the story's classes and `TEXT_STYLES` from one data table (a scratchpad script), so the files can't drift apart. Then check every mixin against `figma-styles.md` programmatically: family, size (bound scale token or raw px), line height, weight, letter spacing and case.

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

Plan to copy `Typography.stories.tsx` and `Typography.stories.module.scss` from the template if they don't exist ([storybook.md](storybook.md) → "Design-system stories"), then fill them: one `TEXT_STYLES` entry (`{ label: 'Heading/H2', className: typeStyles.headingH2 }`) and one module class (`.headingH2 { @include heading-h2; }`) per text-style mixin, in Figma's order. Font, size, line-height, weight and letter-spacing tokens and the `RichText` story need no edits.

## Step 4g — Proposal

List tokens and mixins added, changed, renamed or deleted, the rich-text mapping, font-loading changes, and every file that references a renamed or deleted token or mixin. Then continue with SKILL.md Step 5.
