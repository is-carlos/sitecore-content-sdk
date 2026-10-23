# Mode: button

Updates `abstracts/_buttons.scss` (one mixin per button type) and `base/_buttons.scss` (global `.isds-button-<name>` classes built from the mixins). Run after `color` and `type`. Follows [token-layer.md](token-layer.md).

Why both: components style a Sitecore `<Link>` field as a button with `@include button-primary;` inside their CSS module; the global classes cover links inside Rich Text fields and buttons authors pick with the Styles rendering parameter.

## Step 4a — Orient

Read both files and find every use: `grep -rn "button-" src/styles <component root>`.

## Step 4b — Audit existing types

Show the button types in the code as a bulleted list and ask: *"Which of these are no longer needed?"*

- **Not needed** → ask what replaces it (if anything); plan to remove its mixin and class, replace its uses as instructed, and remove its entry from `## Buttons` in `url-references.md`.
- **Still needed** → find its Figma URL under `## Buttons`; if missing, ask for it and save it as `- <name>: <url>`.

## Step 4c — New types

Show the updated list and ask: *"Are there button types in Figma that aren't in code yet?"* For each new one, ask which existing type it's closest to (the structural starting point) and for its Figma URL.

## Step 4d — Fetch

For each button's Figma URL: load `figma-use` (if not loaded), `create_session`, then `get_design_context` and `get_screenshot` on the component set, and `get_variable_defs` for its tokens. If a fetch fails, stop and ask the user to fix the connection or the URL.

## Step 4e — Plan each button

- Every state: **default, hover, focus-visible, active, disabled** — and any extra variants Figma has (sizes, icon-only, on-dark). Disabled covers `:disabled` and `[aria-disabled='true']`.
- Colors from semantic tokens. Missing token → add it to `tokens/_color.scss` in this proposal, flagged; a state Figma doesn't show → magenta token.
- Type from the type mixins; padding, gap and radius from spacing/effect tokens. A size with no token → flag it before adding one.
- Focus: a visible `:focus-visible` outline using a token, never `outline: none` alone.
- Transitions respect `@media (prefers-reduced-motion: reduce)`.
- Shape of the mixin:

  ```scss
  @mixin button-base { /* shared layout, type, transition */ }

  @mixin button-primary {
    @include button-base;
    background: var(--isds-color-button-primary-background);
    color: var(--isds-color-button-primary-text);

    &:hover { background: var(--isds-color-button-primary-background-hover); }
    &:focus-visible { outline: 2px solid var(--isds-color-focus-ring); outline-offset: 2px; }
    &:disabled, &[aria-disabled='true'] { /* … */ }
  }
  ```

  ```scss
  // base/_buttons.scss
  @use '../abstracts' as *;

  .isds-button-primary { @include button-primary; }
  ```

## Step 4f — Storybook

Plan to copy `Buttons.stories.tsx` from the template if it doesn't exist ([storybook.md](storybook.md) → "Design-system stories"). It finds every `.isds-button-*` class in the CSS and shows each as an `<a>` and a `<button>`, default and disabled, in every theme. Hover, focus and active can't be forced without `storybook-addon-pseudo-states`: if it's installed, add a story per state with `parameters.pseudo`.

## Step 4g — Proposal

Summarize buttons **kept** (with Figma URLs), **added** and **removed** (and their replacements), tokens added, and every file whose usage changes. Then continue with SKILL.md Step 5.
