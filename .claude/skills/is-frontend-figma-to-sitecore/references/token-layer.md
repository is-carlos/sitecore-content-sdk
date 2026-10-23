# Token layer

One global token layer, generated from the Figma variables and styles. Components are CSS modules that **only reference tokens**; they never hold raw design values. Themes, author-picked styles and multisite all work by re-mapping tokens, so components contain no theme code.

## Files

The token layer lives in `src/styles/`.

```
src/styles/
  main.scss                  global entry: @use 'tokens'; @use 'base'; — imported once (stack-and-routers.md)
  abstracts/                 Sass-only helpers. Emit NO CSS on their own.
    _index.scss              @forward 'functions'; @forward 'breakpoints'; @forward 'type'; @forward 'buttons'; @forward 'forms';
    _functions.scss          rem(), fluid()                                    — init
    _breakpoints.scss        $breakpoints, mq()                                — init
    _type.scss               one mixin per Figma text style                    — type mode
    _buttons.scss            one mixin per button type                         — button mode
    _forms.scss              form element mixins                               — form mode
  tokens/                    CSS custom properties
    _index.scss              @use each partial below
    _color-primitives.scss   — color mode
    _color.scss              semantic colors, themes, gradients                — color mode
    _typography.scss         families, sizes, weights, line heights            — type mode
    _spacing-primitives.scss — spacing mode
    _spacing.scss            semantic spacing                                  — spacing mode
    _effects.scss            shadows, radii, when Figma has them               — color/spacing mode (ask)
  base/                      global element styles; keep minimal
    _index.scss
    _reset.scss              box-sizing and other resets                       — init (ask)
    _rich-text.scss          .isds-rich-text descendant styles                 — type mode
    _buttons.scss            .isds-button-<name> classes from the mixins       — button mode
    _forms.scss              :where(.isds-form) element styles                 — form mode
```

Partials that a mode hasn't filled yet exist but stay empty (a comment naming the mode that fills them), so `@forward`/`@use` never break.

## Sass rules (Next.js 16 / Turbopack)

- `@use` and `@forward` only. **Never `@import`** (deprecated; removed in Dart Sass 3).
- Don't use `:export`, `@value`, `sassOptions.functions` or `~` imports; Turbopack doesn't support them.
- CSS modules load helpers with a **relative** path: `@use '../../styles/abstracts' as *;` (adjust the depth). No `includePaths` config is needed.
- `abstracts/` must emit nothing by itself (only `@function`, `@mixin`, variables), because every module that `@use`s it would duplicate the output.
- A Sass function inside a custom property must be interpolated: `--x: #{rem(16px)};`. Without `#{}` Sass prints `rem(16px)` literally.

## Helpers (`abstracts/_functions.scss`, `abstracts/_breakpoints.scss`)

```scss
@use 'sass:math';

$base-font-size: 16px !default;
// Viewport range for fluid values: the Figma mobile and desktop frame widths (set in init).
$fluid-min-vw: 375px !default;
$fluid-max-vw: 1440px !default;

@function rem($px) {
  @return math.div($px, $base-font-size) * 1rem;
}

// A value that scales from $mobile (at $fluid-min-vw) to $desktop (at $fluid-max-vw).
@function fluid($mobile, $desktop) {
  @if $mobile == $desktop {
    @return rem($mobile);
  }
  $slope: math.div($desktop - $mobile, $fluid-max-vw - $fluid-min-vw);
  $intercept: $mobile - $slope * $fluid-min-vw;
  @return clamp(#{rem(math.min($mobile, $desktop))}, #{rem($intercept)} + #{$slope * 100}vw, #{rem(math.max($mobile, $desktop))});
}
```

```scss
@use 'sass:map';

// Mobile-first. Values agreed in init (from the Figma frames / the existing CSS).
$breakpoints: (
  tablet: 768px,
  laptop: 1024px,
  desktop: 1440px,
) !default;

@mixin mq($name) {
  @media (min-width: map.get($breakpoints, $name)) {
    @content;
  }
}
```

Media queries can't read custom properties, so breakpoints are Sass variables, not tokens.

## Naming

Prefix every custom property with `--isds-`. Derive names from the Figma variable path: lowercase, `/` and spaces → `-`.

| Kind | Figma | CSS |
|---|---|---|
| Color primitive | `Color Primitives` › `Blue/500` | `--isds-color-blue-500` |
| Semantic color | `Color Tokens` › `Text/Primary` | `--isds-color-text-primary` |
| Semantic color, nested | `Button/Primary/Background Hover` | `--isds-color-button-primary-background-hover` |
| Gradient stop / gradient | `Gradients/Hero/A`, style `Gradients/Hero` | `--isds-color-gradient-hero-a`, `--isds-gradient-hero` |
| Font family | `Font/Heading` | `--isds-font-family-heading` |
| Font size scale | variable `Font Size/Heading/XL` | `--isds-font-size-heading-xl` (the `Font Size/` group dropped) |
| Font size of an unbound style / line height / weight / tracking | text style `Heading/H2` | `--isds-font-size-heading-h2` (only when the style's size isn't bound to a size variable), `--isds-line-height-heading-h2`, `--isds-font-weight-heading-h2`, `--isds-letter-spacing-heading-h2` |
| Spacing primitive | `Spacing` › `xsmall` | `--isds-spacing-xsmall` |
| Semantic spacing | `Spacing Tokens` › `Section/Padding` | `--isds-spacing-section-padding` |
| Text-style mixin | `Heading/H2` | `@mixin heading-h2` |
| Radius | `Border Radius/L` | `--isds-radius-l` |
| Shadow | effect style `Nav Dropdown Shadow 1` | `--isds-shadow-nav-dropdown-shadow-1` |
| Button mixin / class | `Button/Primary` | `@mixin button-primary` / `.isds-button-primary` |

If a Figma name can't follow this (e.g. a primitive named `Brand` instead of `Color/Step`), stop and ask the user to resolve it with the designer, or to pick a name.

## Tiers

- **Primitives** hold raw values (hex, `#{rem(…)}`). Nothing outside `tokens/` references a raw value.
- **Semantic tokens** reference primitives only: `--isds-color-text-primary: var(--isds-color-gray-900);`. Never a raw value.
- **Components** reference semantic tokens. A primitive in a component is a smell: say so in the proposal.
- **Component-local tokens**, only when a value is truly unique to one component (confirm with the user): declare them at the top of the module's root class, referencing a token or primitive, never a raw value:

  ```scss
  .singleCta {
    --single-cta-panel-background: var(--isds-color-gray-50);
  }
  ```

- **Missing values**: when a token is still needed but Figma has no value (e.g. a hover state), keep it and point it at magenta so it's obvious: `--isds-color-button-primary-background-hover: var(--isds-color-magenta-500);`. If the primitive doesn't exist, create `--isds-color-magenta-500: hsl(292, 100%, 38%);`. List every magenta token in the report.

## Themes

Themes re-map **semantic** tokens, never primitives. (A semantic token declared on `:root` is resolved there; redefining a primitive inside a themed container doesn't change it.)

```scss
:root,
[data-color-theme='default'],
.isds-color-theme-default {
  --isds-color-text-primary: var(--isds-color-gray-900);
  --isds-color-surface: var(--isds-color-white-500);
}

[data-color-theme='dark'],
.isds-color-theme-dark {
  // Only the tokens whose value differs from the default mode
  --isds-color-text-primary: var(--isds-color-white-500);
  --isds-color-surface: var(--isds-color-gray-900);
}
```

- One theme per Figma mode of the semantic color collection. No modes → no theme selectors at all.
- The default block repeats `[data-color-theme='default']` so a default-themed section inside a dark one resets correctly.
- **Semantic → semantic aliases** (a Figma token whose value is another semantic token, e.g. `Interactive/Link/Default` → `Color Tokens/Interactive/Default`): write `var(--isds-color-interactive-default)`, and **re-declare it in every theme block**, even when its own Figma value is the same in each mode. A custom property's `var()` is resolved where it's declared, so one declared only on `:root` keeps the default theme's value inside a themed container. Add a comment saying why it's repeated.
- **Sitecore authors pick themes with the Styles rendering parameter.** A Style item's *Value* is a class name; `params.styles` lands on the component's root element unhashed, so `.isds-color-theme-dark` themes the component with no code. List these class names in the report so someone creates the Style items.
- **Site-wide themes / multisite brands** (Figma modes like `Pro Default`, `Pro Dark`): put the site attribute on `<body>` or the layout root (`data-site-theme="pro"`, set from `page.siteName` in `Layout.tsx`; ask first) and combine selectors: `[data-site-theme='pro'] [data-color-theme='dark'] { … }`.

## Responsive tokens

- Figma modes such as `Desktop` / `Mobile` on a semantic collection → mobile-first: the `Mobile` value on `:root`, the `Desktop` value inside `@include mq(<breakpoint>) { :root { … } }`. Ask which breakpoint when it isn't obvious.
- Font sizes that scale → `#{fluid($mobile, $desktop)}`. Equal values → `#{rem($px)}`.

## Verify

Run on every `.scss` file you touched:

```bash
grep -nE '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(' <files>
grep -nE '[0-9.]+px' <files>
```

- The first must print nothing outside `tokens/_color-primitives.scss` (and the magenta primitive).
- Every `px` hit must be inside `rem(…)`, `fluid(…)`, a `$breakpoints` value, or a hairline border (`1px`). Anything else is a raw value: replace it with a token, or ask.

**Optional enforcement** (ask before adding dependencies): `stylelint` with `stylelint-declaration-strict-value` to require `var(--isds-*)` for color, font and spacing properties in `*.module.scss`.
