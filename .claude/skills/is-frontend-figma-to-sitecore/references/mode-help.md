# Mode: help

## Teach the user

Describe the skill in two sentences: it turns a Figma file into a Sitecore Content SDK head app's design system (a global SCSS token layer) and components (CSS modules that render Sitecore fields), with Storybook stories and dev-only showcase pages.

Show the mode table from SKILL.md Step 1, with aliases.

## Recommended order

1. `/is-frontend-figma-to-sitecore init` — once per project.
2. The design system, in this order (later ones use the earlier tokens):
   - `color`
   - `type`
   - `spacing`
   - `button` and `form` last.
3. Components, one per run: `/is-frontend-figma-to-sitecore component <figma-node-url>`.
4. A showcase page for a component: `/is-frontend-figma-to-sitecore page <ComponentName>`.
5. `variables` whenever the designer changes tokens; then re-run the design-system modes it affects.

Tips:
- Several sessions can run different design-system modes at once only if they touch different partials (color, type and spacing do; button and form read the others, so run them after).
- If a mode says `.claude/figma-to-sitecore/figma-variables.md` is missing, run `init`.

## Bail

The rest of SKILL.md does not apply to `help`.
