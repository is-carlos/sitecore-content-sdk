# Storybook

Storybook is the primary place to QA components and the design system. The official Sitecore starter kits don't ship it; this skill adds it when the user agrees.

## Setup (init, when missing or incomplete)

- **No Storybook** → ask before installing: `npx storybook@latest init` for Next.js (pin versions that support the project's Next/React; `@storybook/nextjs-vite` is the recommended framework for Storybook 10, `@storybook/nextjs` also works). Installing may need the user to run the command.
- `tsconfig.json` needs `"moduleResolution": "bundler"`; with `"node"`, `next build`'s type check fails on Storybook 10's types.
- `.storybook/main.ts`: stories glob covering `../src/**/*.stories.@(ts|tsx)` and `../src/**/*.mdx`; `staticDirs: ['../public']`.
- With `@storybook/nextjs-vite`, Sass options go in Vite's `css.preprocessorOptions`, not `next.config.js`'s `sassOptions`.
- `.storybook/preview.tsx`:
  - imports the global stylesheet (`import '../src/styles/main.scss';`) and anything else `_app.tsx` / the root layout sets globally (e.g. `next/font` custom properties);
  - wraps every story in `SitecoreProvider` (decorator below);
  - optional color-theme toolbar (below).

### Sitecore decorator

Reuse the project's decorator if there is one (e.g. `.storybook/sitecore.tsx`) and follow its parameters. Otherwise add one:

```tsx
import { ComponentMap, LayoutServicePageState, Page, SitecoreProvider } from '@sitecore-content-sdk/nextjs';
import type { Decorator } from '@storybook/nextjs';

export const createMockPage = (overrides: Partial<Page> = {}): Page => ({
  locale: 'en',
  siteName: 'storybook',
  mode: {
    name: LayoutServicePageState.Normal,
    isNormal: true,
    isPreview: false,
    isEditing: false,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
  layout: {
    sitecore: {
      context: { pageEditing: false, language: 'en', site: { name: 'storybook' } },
      route: { name: 'storybook', placeholders: {} },
    },
  },
  ...overrides,
});

export const withSitecore: Decorator = (Story, context) => {
  const { page, componentMap } = (context.parameters.sitecore || {}) as {
    page?: Page;
    componentMap?: ComponentMap;
  };

  return (
    <SitecoreProvider
      // Stories never call Sitecore
      api={{
        edge: { contextId: '', clientContextId: '', edgeUrl: '' },
        local: { apiKey: '', apiHost: '', path: '' },
      }}
      componentMap={componentMap || new Map()}
      page={page || createMockPage()}
    >
      <Story />
    </SitecoreProvider>
  );
};
```

Check the `Page` / `mode` shape against the installed SDK version's types (`npx tsc --noEmit` catches drift).

### Color-theme toolbar

```tsx
// preview.tsx
globalTypes: {
  colorTheme: {
    description: 'Color theme (data-color-theme)',
    toolbar: { icon: 'paintbrush', items: ['default', 'dark'], dynamicTitle: true },
  },
},
initialGlobals: { colorTheme: 'default' },
decorators: [
  (Story, { globals }) => (
    <div data-color-theme={globals.colorTheme}>
      <Story />
    </div>
  ),
  withSitecore,
],
```

The items are the themes in `tokens/_color.scss`; the color mode keeps them in sync.

## Component stories (`<Name>.stories.ts`)

CSF with args only (no JSX, so `.ts`). Built from the fields file.

```ts
const meta = {
  title: 'Components/<Name>',
  component: <Name>,
  tags: ['autodocs'],
  args: {
    rendering: { componentName: '<Name>', dataSource: DATASOURCE_ID },
    params: {},
    fields: <name>SampleFields,
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA_URL },
    references: [
      { label: 'Requirements', url: '…' },
      { label: 'Teamwork Task', url: '…' },
    ],
  },
} satisfies Meta<typeof <Name>>;
```

Stories:
- `Default` — sample fields.
- One per variant (render the named export via `render` or a separate `component`).
- `Empty` — empty fields with editing on: `parameters.sitecore.page` = a mock page whose `mode` is edit (`name: LayoutServicePageState.Edit`, `isEditing: true`, `isNormal: false`). Give each field `metadata` (`{ title, fieldId, rawValue: '', datasource: { id, language, revision, version } }`), because the SDK shows its empty-field placeholders only for fields with metadata.
- `NoDatasource` — `rendering.dataSource: ''`, editing on.
- `LongContent` — when text can grow.
- One per meaningful rendering-parameter value (e.g. `Dark` with `params.styles: 'isds-color-theme-dark'`).
- Components with placeholders: child renderings in `rendering.placeholders`, plus `parameters.sitecore.componentMap: new Map([['Child', Child]])`.
- Add `play` checks for the essentials (heading text, link `href`) when the project's stories already use `storybook/test`.

## Design-system stories

Built from the templates in this skill's [assets/storybook/](../assets/storybook/), into `src/stories/design-system/` (or the project's equivalent). Titles are `Design System/<Area>`, so ids are `design-system-<area>--<story>`.

**The kit** — `DesignSystem.tsx` + `DesignSystem.module.scss`, copied by `init`. It reads the `--isds-*` tokens, color themes and `isds-*` classes straight from the page's stylesheets, so **stories have no token lists to keep in sync**: a token added to the token layer shows up on the next reload.

| Export | Shows |
|---|---|
| `TokenList` | every token matching `{ prefix, exclude?, tier? }` (`tier`: `primitive` = raw value, `semantic` = `var()` alias), previewed as `kind`: `color`, `gradient`, `spacing`, `radius`, `shadow`, `font-size`, `font-family` or `value`. Each row has the token's value where it's shown and its resolved px value, re-read on resize. |
| `ThemeColumns` | its children once per color theme found in the CSS, side by side |
| `TextStyleList` | one sample per text style, with its computed family, weight, size, line height and letter spacing |
| `ClassGallery` | every global class with a prefix (e.g. `isds-button-`), rendered by a function |
| `Section` | a titled block |

**The stories** — each mode copies its template when the file doesn't exist yet, replacing `__FIGMA_URL__` with the area's URL from `url-references.md` (or `## Document`):

| Template | Stories | Copied by |
|---|---|---|
| `Color.stories.tsx` | `Primitives`, `Tokens` (every theme), `Gradients` | color |
| `Typography.stories.tsx` + `Typography.stories.module.scss` | `Styles`, `Tokens`, `RichText` | type — the only template the mode edits: one `TEXT_STYLES` entry and one module class (`@include <mixin>;`) per text style |
| `Spacing.stories.tsx` | `Primitives`, `Tokens` (resize to see breakpoints) | spacing |
| `Effects.stories.tsx` | `Radii`, `Shadows` | whichever mode adds `tokens/_effects.scss` |
| `Buttons.stories.tsx` | `AllButtons` (every `.isds-button-*`, every theme) | button |
| `Forms.stories.tsx` | `Elements` (every element and state in `.isds-form`) | form |

Never overwrite a story file the project already has; if it differs from the template, say so and ask. After copying, run Prettier on it (SKILL.md Step 6).

## QA

Find stories through `<storybook-url>/index.json`. Open each story with the browser MCP at the Figma frame's width (and the mobile width when there's a mobile design), compare with the Figma screenshot, fix and reload — at most 3 rounds (SKILL.md Step 7).
