# Stack detection and outputs (Content SDK only)

This skill targets the Sitecore **Content SDK** (`@sitecore-content-sdk/nextjs`). It does not
generate JSS code (`@sitecore-jss/*`).

## Detect (Step 1)

| Question | How to tell |
|---|---|
| SDK | `package.json` deps. `@sitecore-content-sdk/nextjs` → continue, and note its version. Only `@sitecore-jss/*` → **stop**: tell the user this skill supports only the Content SDK and point them to Sitecore's JSS → Content SDK upgrade guide (or the `content-sdk-upgrade-assistant` skill if the project ships `.agents/skills`). Both present (mid-migration) → use Content SDK APIs only and say so. |
| Router | `src/app/` → App Router; `src/pages/` → Pages Router |
| Component root | `componentMap.paths` in `sitecore.cli.config.ts` (usually `src/components`) |
| Component map exclusions | `componentMap.exclude` in `sitecore.cli.config.ts` |
| Local sample content | `mock-data/` plus a `dev:mock` script (the local GraphQL mock, see `scripts/mock-sitecore/README.md`) → local mock. Otherwise none: the Content SDK has no disconnected mode. |
| Styling | `tailwind.config.*` or `@import "tailwindcss"` → Tailwind; `*.module.(s)css` next to components → CSS modules; otherwise the global stylesheet imported in `_app.tsx` / `layout.tsx` (note any CSS framework in deps, e.g. Bootstrap) |
| Storybook | `.storybook/`. Also note whether a decorator already wraps stories in `SitecoreProvider` (e.g. `.storybook/sitecore.tsx`) |
| Conventions | `CONVENTIONS.md`, `AGENTS.md`, `CLAUDE.md`, `.agents/skills` — read them; their rules override this skill |
| Serialization | `sitecore.json` — report it only. This skill does not write items |

## Component folder

Every component gets its own kebab-case folder with four files. The `.tsx` file name is the Sitecore component name.

```
<component-root>/<kebab-name>/
  <Name>.tsx                  the component
  <Name>.fields.ts            the fields type + sample values from Figma (+ an empty set)
  <Name>.styles.module.scss   CSS module, imported by the component as `styles`
  <Name>.stories.ts           Storybook stories (CSF, args only: no JSX, so .ts)
```

- **Fields file:** `export type <Name>Fields = { … }` (SDK field types), `export const <name>SampleFields` (the extracted Figma values, verbatim), `export const <name>EmptyFields`. The component imports the type; the stories import the values.
- **Styles:** CSS modules. Plain `.scss` can't be imported by a component in the Pages Router, and modules keep classes scoped and code-split. Use camelCase class names (`styles.heading`). Shared tokens and base styles stay in the global stylesheet; use `:global(...)` for classes that authors add from Sitecore (`params.styles`). Needs `sass` installed.
- **Stories:** always created. Use `title: 'Components/<Name>'` and put the Figma URL in `parameters.design`. Stories: `Default` (sample fields), one per variant, `Empty` (empty fields, editing on), `NoDatasource` (empty `rendering.dataSource`, editing on), and `LongContent` when text can grow.
- **Storybook decorator:** stories need a decorator in `.storybook/preview.tsx` that wraps them in `SitecoreProvider` (`api`, `componentMap`, `page`) with a mock `Page` in normal mode. Reuse the project's decorator if there is one and follow its parameters; otherwise add one that reads `parameters.sitecore.page` and `parameters.sitecore.componentMap`. Editing stories pass a page whose `mode` is edit (`name: 'edit'`, `isEditing: true`, `isNormal: false`). A component with a placeholder gets stories with child components in `rendering.placeholders`, plus `parameters.sitecore.componentMap: new Map([['Child', Child]])` so `Placeholder` can render them.
- **No Storybook or no `sass`?** Ask before installing: `npm install -D sass storybook @storybook/nextjs` (pin versions that support the project's Next/React), then add `.storybook/main.ts` (stories glob `../src/components/**/*.stories.@(ts|tsx)`, framework `@storybook/nextjs`), `.storybook/preview.tsx` (global CSS from `_app` + the `SitecoreProvider` decorator), and `storybook` / `build-storybook` scripts. Storybook 10's types need `"moduleResolution": "bundler"` in `tsconfig.json`; with `"node"`, `next build`'s type check fails on the story files. Installing may need the user to run the command.

## Outputs

| Output | Where | How |
|---|---|---|
| Component folder | `<component-root>/<kebab-name>/` (files above) | Match the export style of the existing components. Variants are additional named exports, with `Default` as the base layout; one story per variant. |
| Component map exclusions | `sitecore.cli.config.ts` → `componentMap.exclude` | The map generator registers **every** `.js`/`.ts`/`.tsx` under the component root, so `<Name>.stories.ts` and `<Name>.fields.ts` would become Sitecore components. If they aren't excluded yet, ask, then add `'<component-root>/**/*.stories.*'` and `'<component-root>/**/*.fields.*'` (glob patterns). Check `.sitecore/component-map.ts` afterwards. |
| Sample route | `mock-data/<site>/<lang>/routes/<kebab-name>.json` | Only when the local mock exists. A layout file (`{ sitecore: { context, route } }`, copy the shape of an existing route file) with one rendering of the component in `headless-main` (or the layout's main placeholder): `componentName`, a `dataSource` id, `params`, and `fields` mirroring `<Name>SampleFields`. Never edit existing route files without asking. |
| Template spec | in the final report | A field table (name, title, type, source, shared), the rendering parameters, and any placeholder keys, for whoever creates the template, rendering and placeholder settings in Sitecore. The Content SDK has no code-first definitions. |

## Rules

- Import field components and types (`Text`, `RichText`, `Link`, `Image`, `NextImage`, `DateField`, `Placeholder`, `Field`, `LinkField`, `ImageField`…), `withDatasourceCheck` and `useSitecore` from `@sitecore-content-sdk/nextjs`; the props type `ComponentProps` from `lib/component-props`. Never import from `@sitecore-jss/*`.
- **Missing datasource:** Pages Router → follow the existing components: `withDatasourceCheck()` from the SDK around the default export, or a `rendering.dataSource` check. App Router → check `props.rendering.dataSource`; `props.fields` is never `undefined` there.
- **Editing state:** Pages Router → `useSitecore().page.mode.isEditing`. App Router → `page.mode.isEditing` from props in server components, `useSitecore()` in client components.
- **Component map:** regenerated by the dev server's watcher (`npm run dev` / `npm run dev:mock`) or `npm run sitecore-tools:generate-map`. Never hand-edit `.sitecore/component-map*.ts`.
- **Data beyond the layout** (e.g. items the author doesn't pick): a component-level query, via `getComponentServerProps` (Pages Router) or the project's App Router data pattern. Ask first; most components only need their fields.
- New files must match the repo's formatting (Prettier may require CRLF): run `npx eslint --fix` or `npx prettier --write` on them.
- **Checks:** `npm run lint` and `npx tsc --noEmit`. `npm run build` first runs `sitecore-tools project build`, which needs Sitecore credentials (or `NEXT_PUBLIC_SITECORE_MOCK=true` with the mock server running), then `next build`. Never build into the `.next` folder a running dev server is using: ask the user, or build to another folder if `next.config.js` supports it (e.g. `NEXTJS_DIST_DIR=.next-build`).
- **Preview:**
  1. **Local mock** (preferred when it exists): `npm run dev:mock`, then `http://localhost:<port>/<kebab-name>`, adding `?sc_site=<site>` unless that site's `hostName` in `mock-data/sites.json` includes `localhost`. Route files are read on every request, so no restart is needed. If the user has a dev server running, use it; otherwise ask them to start one, or start it yourself on a free `PORT` and stop it afterwards.
  2. **Storybook**, at the Figma frame's width.
  3. **Static-render fallback** (below).
  Never edit `.env` or `.env.local`.

**Static-render fallback (no preview, no Storybook):** in the scratchpad, render the component with `react-dom/server` inside `SitecoreProvider` (`api` with empty `edge` and `local` settings, `componentMap: new Map()`, a mock `page` in normal mode) and a mock Next `RouterContext.Provider`, because the SDK's `Link` and `RichText` call `useRouter`. Run it with a TypeScript runner (`ts-node --transpile-only` or `tsx`) and `NODE_PATH=<repo>/node_modules`, write an HTML page that links the app's global CSS, serve it with a throwaway static server, and compare it at the Figma width. This checks the real field components and CSS, not data fetching.

## Field types

Use these in the fields file, the sample route, and the template spec.

| Sitecore field type | TS type | Layout JSON (`fields.<name>`) |
|---|---|---|
| Single-Line Text | `Field<string>` | `{ "value": "Text" }` |
| Multi-Line Text | `Field<string>` | `{ "value": "Line 1\nLine 2" }` |
| Rich Text | `RichTextField` | `{ "value": "<p>…</p>" }` |
| General Link | `LinkField` | `{ "value": { "href": "#", "text": "Learn more", "linktype": "external", "target": "" } }` |
| Image | `ImageField` | `{ "value": { "src": "…", "alt": "", "width": 800, "height": 600 } }` |
| File | `FileField` | `{ "value": { "src": "…", "title": "Brochure" } }` |
| Number | `Field<number>` | `{ "value": 3 }` |
| Checkbox | `Field<boolean>` | `{ "value": true }` |
| Date / Datetime | `Field<string>` | `{ "value": "2026-10-20T00:00:00Z" }` |
| Treelist / Multilist (items) | `Item[]` | `[{ "id": "…", "name": "…", "fields": { … } }]` |
| Droptree / Droplink (one item) | `Item` | `{ "id": "…", "name": "…", "fields": { … } }` |

**Shared (site-wide) content:** in Sitecore it's one shared datasource item that each page's rendering points to; say so in the template spec. In the local mock, each route file carries its own copy of the rendering (same `dataSource` id and fields). New root placeholders go in `Layout.tsx` (ask first, since it changes every page) and need placeholder settings in Sitecore; list them in the report.
