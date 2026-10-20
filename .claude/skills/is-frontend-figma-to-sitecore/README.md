# is-frontend-figma-to-sitecore

Builds a Sitecore Content SDK component from a Figma node: extracts the content, proposes the Sitecore fields, and generates the component with Content SDK field components, sample content, Storybook stories, and a template spec for Sitecore. No Sitecore CLI, no setup step, no cache files.

**Version:** 0.6.0 (draft)

**Requirements:**
- A Next.js head on `@sitecore-content-sdk/nextjs` (Pages or App Router). JSS (`@sitecore-jss/*`) is not supported.
- Figma MCP
- Browser MCP (optional, for visual QA)

## Usage

```
/is-frontend-figma-to-sitecore https://www.figma.com/design/<fileKey>/<name>?node-id=<id>
```

1. **Detect** the stack (Content SDK version, router, local mock, styling, Storybook, conventions). Stops on JSS projects.
2. **Extract** from Figma with a read-only script: text + text styles, hyperlinks, instances and their properties, images, prototype links, annotations, repeating groups.
3. **Propose** a field table and ask only about the gaps (name, missing hrefs, parameters).
4. **Generate** the component, fields, styles, stories, and a sample route in the local mock when the project has one.
5. **Verify** with lint/type-check and a browser comparison against the Figma screenshot.
6. **Report** the files, the template spec, and what's left to create in Sitecore.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | The workflow |
| `scripts/extract-content.js` | Read-only Figma Plugin API script run through `use_figma` |
| `references/content-model.md` | Figma → field type mapping, naming, prop shapes |
| `references/stack-targets.md` | Stack detection, Content SDK outputs, preview options, field types |
| `references/tsx-patterns.md` | Rendering, editing-mode, styling, and accessibility rules |

## What the extraction can't know

Field types are inferred, not read. Figma has no link `href`s unless the designer added a hyperlink or prototype URL, no alt text, and generic layer names. The skill fills these from text styles, component names, and annotations, then asks. Designers can make extraction exact by adding a **Content** annotation (e.g. "Field: CTA — General Link") or by exposing component properties.

## Not in this version

- Writing Sitecore items (serialization YAML or CM API)
- Updating existing components
- Design-system modes (color, type, spacing, button, form)

## Changelog

### 0.6.0
- Content SDK only. Removed all JSS output (scaffold script, code-first definitions, `CommonFieldTypes`, disconnected YAML routes, `withDatasourceCheck`/`useSitecoreContext` from JSS, the JSS component-builder filter). Step 1 stops on JSS projects and points to the upgrade.
- Content SDK Pages Router support alongside the App Router: `withDatasourceCheck()` from the Content SDK, `useSitecore().page.mode.isEditing`, component map exclusions for `.stories` / `.fields` files (the map generator registers every `.js`/`.ts`/`.tsx` under the component root).
- Local preview through the project's GraphQL mock (`npm run dev:mock`, a route file in `mock-data/`) instead of disconnected mode.
- Storybook decorator uses `SitecoreProvider` with a mock `Page`; editing stories set `page.mode` to edit. Notes `"moduleResolution": "bundler"` for Storybook 10.
- Repeating content defaults to a Treelist of `<Name>Item` items, delivered inline by the layout. The template spec in the report now lists rendering parameters and placeholder keys.
- Field type table with TS types and layout JSON shapes, replacing the JSS `CommonFieldTypes` table.

### 0.5.0
- Containers and slots: components that hold other components (placeholder in TSX + definition, root placeholders in the layout, Storybook stories with child components, shared site-wide content referenced by `id`).
- Extraction: link hints only for button-sized instances; form inputs detected by shape and placeholder text (`input` / `input-placeholder`); link and input text matched by node id, not layer path.
- TSX rules: list keys use position + id (disconnected ids are identical), SVG images use `Image` not `NextImage`, global element styles must not wrap a placeholder.

### 0.4.2
- Extraction: reports copies of one component shown side by side as `layouts` (with their overrides) instead of repeating content, flags plain grey boxes as likely images (`image?`), and lists boolean properties no layer uses (`unusedProps`).
- Storybook serves `data/media` so stories can use the same sample images as route data.

### 0.4.1
- Extraction: captures strokes (per side), finds repeating content by structure even when layer names differ, and reports optional elements a component property switches off.
- JSS repeating content: Content List field + `<Name>Item` template in `sitecore/definitions/templates/`, items inline in the route YAML.

### 0.4.0
- Every component gets its own folder: `<kebab-name>/<Name>.tsx`, `<Name>.fields.ts`, `<Name>.styles.module.scss`, `<Name>.stories.ts`. Stories are always created.
- CSS modules for component styles; global stylesheet only for tokens and base styles.
- JSS: the component scan must skip `.stories` / `.fields` files.
- Preview fixes learned from the first run: `PUBLIC_URL` must match `PORT`; never build next to a running dev server.

### 0.3.0
- One command, one Figma URL. Removed the `help`, `init`, `variables`, and `learn` modes, the `.claude/` cache files, `sitecore-project.json`, and plan-file handling.
- Removed the Sitecore CLI item generator and project inspector. The skill no longer needs serialization.
- Added `scripts/extract-content.js` (read-only Figma extraction) and `references/stack-targets.md` (JSS and Content SDK outputs).

### 0.2.0
- Aligned structure and wording with `is-frontend-figma-to-code` 1.3.0.

### 0.1.0
- First draft: `help`, `init`, `variables`, `component`, `learn`, with a serialized-items generator.
