# Stack detection and outputs

## Detect (Step 1)

| Question | How to tell |
|---|---|
| SDK | `package.json` deps: `@sitecore-content-sdk/nextjs` → **Content SDK**; `@sitecore-jss/sitecore-jss-nextjs` → **JSS** |
| Router | `src/app/` → App Router; `src/pages/` → Pages Router |
| Code-first definitions | `sitecore/definitions/components/` exists (JSS) |
| Sample content for local preview | `data/routes/` exists and a `start` script sets `JSS_MODE=disconnected` (JSS) |
| Scaffold command | a `scaffold` script in `package.json` (JSS `jss scaffold`) |
| Styling | `tailwind.config.*` or `@import "tailwindcss"` → Tailwind; `*.module.(s)css` next to components → CSS modules; otherwise the global stylesheet imported in `_app.tsx` / `layout.tsx` (note any CSS framework in deps, e.g. Bootstrap) |
| Storybook | `.storybook/` |
| Conventions | `CONVENTIONS.md`, `AGENTS.md`, `CLAUDE.md` — read them; their rules override this skill |
| Serialization | `sitecore.json` — report it only. This skill does not write items |

## Component folder (both stacks)

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
- **Stories:** always created. Use `title: 'Components/<Name>'` and put the Figma URL in `parameters.design`. Stories: `Default` (sample fields), one per variant, `Empty` (empty fields, editing on), `NoDatasource` (empty `rendering.dataSource`, editing on), and `LongContent` when text can grow. Editing mode is set per story with `parameters: { sitecore: { pageEditing: true } }`, read by a decorator in `.storybook/preview.tsx` that wraps stories in `SitecoreContext`. A component with a placeholder gets stories with child components in `rendering.placeholders`, plus `parameters.sitecore.components: { Name: Component }` so the decorator's `componentFactory` can render them.
- **No Storybook or no `sass`?** Ask before installing: `npm install -D sass storybook @storybook/nextjs` (pin versions that support the project's Next/React), then add `.storybook/main.ts` (stories glob `../src/components/**/*.stories.@(ts|tsx)`, framework `@storybook/nextjs`), `.storybook/preview.tsx` (global CSS from `_app` + the `SitecoreContext` decorator), and `storybook` / `build-storybook` scripts. Installing may need the user to run the command.

## JSS (Pages Router)

| Output | Where | How |
|---|---|---|
| Component folder | `src/components/<kebab-name>/` (files above) | Create with the scaffold script (`npm run scaffold <kebab-name>/<Name>`), then replace the boilerplate and add the other three files. |
| Definition | `sitecore/definitions/components/<Name>.sitecore.ts` | Created by the scaffold script when the folder exists (under the same sub-path you scaffolded). Fill `fields` with `CommonFieldTypes` (below). |
| Item template (repeating content) | `sitecore/definitions/templates/<Name>Item.sitecore.ts` | `manifest.addTemplate({ name: '<Name>Item', fields: [...] })`; the component gets a `CommonFieldTypes.ContentList` field for it. |
| Sample content | a new route `data/routes/<kebab-name>/en.yml` | Only when disconnected data exists. Mirrors the sample values in `<Name>.fields.ts`; Content List items go inline as `- template: <Name>Item` + `fields:`. Never edit existing routes without asking. |

- **Component scan:** JSS registers *every* `.ts`/`.tsx` under `src/components` as a component, so `<Name>.stories.ts` and `<Name>.fields.ts` would be bundled into the app as components. The project's `scripts/generate-component-builder/plugins/component-builder.ts` must skip `.stories` / `.fields` / `.test` / `.spec` files. Check `src/temp/componentBuilder.ts` after adding files; if they are registered, add that filter (write the file with `getComponentBuilderTemplate` and your own scan + chokidar watch) and tell the user to restart the dev server, since its watcher runs the old code.
- Import field types and components from `@sitecore-jss/sitecore-jss-nextjs`; props type `ComponentProps` from `lib/component-props`.
- Wrap the default export in `withDatasourceCheck()` like the existing components.
- Editing state: `useSitecoreContext().sitecoreContext.pageEditing`.
- `temp/componentBuilder.ts` is regenerated by `bootstrap`. Never edit `temp/`.
- New files must match the repo's formatting (Prettier may require CRLF): run `npx eslint --fix` on them.
- Check: `npm run lint` and `npx tsc --noEmit`. Run `npm run build` (bootstrap + `next build`) **only when no dev server is running**. If one is running, ask the user first or leave the build for them. The build rewrites `src/temp/config.js` for production, which breaks the dev server ("Invalid URL" from the layout service). Regenerating the config to fix that recompiles everything under the running server and can leave open browser tabs stuck in a Fast Refresh reload loop (hot-update `.json` 404s) until the dev server is restarted.
- Preview: a disconnected dev server, then `http://localhost:<port>/<kebab-name>`. It needs `FETCH_WITH=REST` (the disconnected bootstrap refuses GraphQL), `PORT` set to a free port, and `PUBLIC_URL` on that same port. `publicUrl` (Next's `assetPrefix`) ignores `PORT` and falls back to `http://localhost:3000`; otherwise every script and stylesheet is requested from the wrong port and the page stays blank (`body{display:none}`). Example: `npx cross-env FETCH_WITH=REST PORT=3001 PUBLIC_URL=http://localhost:3001 npm run start`. If the user has one running, use it; otherwise ask them to start it, or use the static-render fallback below. Never edit `.env`.

**Static-render fallback (no preview, no Storybook):** in the scratchpad, render the component with `react-dom/server` inside `SitecoreContext` (`componentFactory={() => null}`, `layoutData` with `pageEditing: false`) and a mock Next `RouterContext.Provider` (JSS `RichText`/`Link` call `useRouter`). Run it with `ts-node --transpile-only` and `NODE_PATH=<repo>/node_modules`, write an HTML page that links the app's global CSS, serve it with a throwaway static server, and compare it at the Figma width. This checks the real field components and CSS, not data fetching.

`CommonFieldTypes` (from `@sitecore-jss/sitecore-jss-dev-tools`):

| Field type | Enum |
|---|---|
| Single-Line Text | `SingleLineText` |
| Multi-Line Text | `MultiLineText` |
| Rich Text | `RichText` |
| General Link | `GeneralLink` |
| Image | `Image` |
| File | `File` |
| Number | `Number` |
| Checkbox | `Checkbox` |
| Date / Datetime | `Date` / `DateTime` |
| Treelist (content list) | `ContentList` |
| Droptree (item link) | `ItemLink` |

Sample-content YAML shapes: text and rich text are plain values; a link is `{ href, text }`; an image is `{ src, alt }`.

**Shared (site-wide) content:** put the datasource once in `data/component-content/<Name>/<Item>/en.yml` with an `id`, and reference it from each route with `- id: <id>`. The reference can add its own `placeholders:` (e.g. a different card in the footer slot per page) — the shared item's keys are copied over the reference, so anything the shared item doesn't define survives. New root placeholders go in `Layout.tsx` and `package.json` → `config.rootPlaceholders`, and get a display name in `sitecore/definitions/placeholders.sitecore.ts`.

## Content SDK (App Router)

| Output | Where | How |
|---|---|---|
| Component folder | `<kebab-name>/` under the project's component root (files above) | Named exports, `Default` first; one story per named export. |
| Template spec | in the final report | A field table (name, title, type, source, shared) for whoever creates the template in Sitecore. There is no code-first definition in the Content SDK. |

- Exclude `*.fields.ts` and `*.stories.ts` from the component map (`componentMap.exclude` in `sitecore.cli.config.ts`).

- Import from `@sitecore-content-sdk/nextjs`.
- Editing state: `page.mode.isEditing` (server) or `useSitecore()` (client), as the project does.
- Missing datasource: check `props.rendering.dataSource` — `props.fields` is never `undefined` in App Router.
- After adding a component: `npm run sitecore-tools:generate-map` (never hand-edit `.sitecore/component-map*.ts`).
- Check: lint + type-check; Storybook renders.
