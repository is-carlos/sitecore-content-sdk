# Mode: spacing

Updates `tokens/_spacing-primitives.scss` and `tokens/_spacing.scss` to match Figma. Follows [token-layer.md](token-layer.md).

## Step 4a — Orient

Read both partials and how spacing is used today: `grep -rnE "(margin|padding|gap)[^;]*;" <component root> src/*.module.scss --include=*.scss`. Note hard-coded section spacing (e.g. `--section-spacing: 100px` in `Layout.module.scss`) — it's a candidate for a semantic token; replacing it is part of this proposal only if the user agrees.

## Step 4b — Primitives

The collection of raw sizes (usually `Spacing` / `Spacing Primitives`) → `tokens/_spacing-primitives.scss`, on `:root`, every value as `#{rem(<px>)}` (`0` stays `0`).

- Names come from Figma (`--isds-spacing-xsmall`, `--isds-spacing-16`…). Keep Figma's naming even if it differs from older projects; if names are inconsistent within the collection (mixing `small` and `24`), stop and ask.
- Primitives rarely change. A primitive whose value changed is a breaking change for every token on it: show the affected tokens.

## Step 4c — Semantic tokens

The collection that aliases the primitives (usually `Spacing Tokens`) → `tokens/_spacing.scss`, each value `var(--isds-spacing-<primitive>)`.

- **Modes** like `Desktop` / `Mobile` → mobile-first ([token-layer.md](token-layer.md) → "Responsive tokens"): the mobile value on `:root`, the desktop value under `@include mq(<breakpoint>)`. Ask which breakpoint switches them if it isn't obvious; more than two modes (e.g. `Tablet`) → one `mq()` block per mode.
- A semantic token that is a raw number, not an alias → flag it and ask whether to add a primitive.

Then interview the user about each semantic token's use until you agree (e.g. *"`Section/Padding` — the vertical padding inside each full-width section, or the gap between sections?"*). Write the agreed use as a one-line comment above each token; components rely on these comments to pick the right token.

## Step 4d — Reconcile

| Case | Action |
|---|---|
| In Figma, not in code | Add. |
| In code, not in Figma | Search for uses. Unused → flag and ask. Used → ask what replaces it. |
| Changed alias | Point it at the new primitive. |

## Step 4e — Storybook

Plan to create or update `src/stories/design-system/Spacing.stories.tsx`: a `Primitives` story (one bar per primitive, labeled with name and px) and a `Tokens` story (one bar per semantic token, with its comment), viewable at mobile and desktop widths.

## Step 4f — Proposal

List tokens added, changed or removed, the agreed use per semantic token, the breakpoint per mode, and any uses in components that would change. Then continue with SKILL.md Step 5.
