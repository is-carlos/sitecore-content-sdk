# Mode: form

Updates `abstracts/_forms.scss` (one mixin per form element) and `base/_forms.scss` (global styles under `:where(.isds-form)`). Run after `color`, `type` and `spacing`. Follows [token-layer.md](token-layer.md).

Form inputs are code, not Sitecore fields: authors edit labels and placeholder text, not the controls. If the project embeds Sitecore Forms (or another form service), its markup is not ours — ask whether these styles must also target it, and how (its wrapper class).

## Step 4a — Orient

Read both files and find existing form markup and styles: `grep -rnE "<(input|select|textarea|label)|isds-form" <component root> src`.

## Step 4b — Figma references

Use or ask for these under `## Forms` in `url-references.md`:
- `- Forms page: <url>` — a page showing every form element.
- `- Main form field: <url>` — the text field component, with variants for default, hover, focus, filled, error and disabled.
- `- Radio/checkbox: <url>` — with a state setting (default, hover, focus, selected, disabled) and a type setting (radio, checkbox).
- Any others the design has (select, textarea, switch, file).

## Step 4c — Fetch

`create_session`, then `get_design_context`, `get_screenshot` and `get_variable_defs` on each URL. If a fetch fails, stop and ask.

## Step 4d — Plan

For each element (label, help text, text input, textarea, select, checkbox, radio, switch, error message, fieldset/legend):
- Every state: **default, hover, focus-visible, filled, error (`[aria-invalid='true']`), disabled**, and checked/selected for checkbox, radio and switch.
- Colors, type, spacing and radius from tokens only. A missing token → flag it before adding; a state Figma doesn't show → magenta.
- Custom checkbox/radio/select visuals must keep the native element focusable and accessible (`appearance: none` on the real input, not a hidden input with a fake box).
- Mixins in `abstracts/_forms.scss` (`@mixin form-input`, `@mixin form-checkbox`…); `base/_forms.scss` applies them to elements inside `:where(.isds-form)` so they cost no specificity:

  ```scss
  @use '../abstracts' as *;

  :where(.isds-form) {
    input:not([type='checkbox'], [type='radio']), textarea, select { @include form-input; }
    input[type='checkbox'] { @include form-checkbox; }
  }
  ```

## Step 4e — Storybook

Plan to copy `Forms.stories.tsx` from the template if it doesn't exist ([storybook.md](storybook.md) → "Design-system stories"): every element and state inside `<form className="isds-form">`. Add the elements the design has that the template doesn't (switch, file input…).

## Step 4f — Proposal

List the elements, their states, the tokens added (flagged) and the files changed. Then continue with SKILL.md Step 5.
