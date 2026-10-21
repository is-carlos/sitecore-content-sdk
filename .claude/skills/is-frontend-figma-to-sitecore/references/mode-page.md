# Mode: page

Creates or updates a **dev-only showcase page** for one component: `/showcase/<kebab-name>` renders every variant of the component with its Figma sample fields, in every color theme, without Sitecore or a mock. Production builds return 404 for it. It's for developers, designers and QA to look at the component in the real app shell (global CSS, fonts, Next.js), next to Storybook.

## Step 4a — Which component?

Use the argument, or ask. The component must exist with a fields file (`<component-root>/<kebab-name>/<Name>.fields.ts` exporting sample fields). No fields file → offer to run the component mode first, or to write sample fields now from the Figma URL in `## Components` (same rules as [content-model.md](content-model.md) → "Sample values").

Read the component (its named exports are the variants), its fields file, and its Figma URL in `url-references.md`.

## Step 4b — One-time setup (only what's missing)

Router specifics are in [stack-and-routers.md](stack-and-routers.md) → "Router differences".

1. **Showcase helpers** — `src/lib/showcase/`:
   - `showcase-page.ts`: `createShowcasePage()`, a mock `Page` in normal mode (same shape as the Storybook mock page in [storybook.md](storybook.md); if `.storybook/` already has one, copy its shape, don't import from `.storybook/` into app code).
   - `themes.ts`: `export const COLOR_THEMES = ['default', 'dark'] as const;` — the themes in `tokens/_color.scss`. Update it when they differ.
   - `ShowcaseFrame.tsx`: a client component (`'use client'` first line — harmless in the Pages Router). It renders a small header (component name, Figma link, a theme `<select>` over `COLOR_THEMES`), wraps its children in `SitecoreProvider` (`api` with empty `edge` and `local` settings, `componentMap={new Map()}`, `page={createShowcasePage()}`) and in `<div data-color-theme={theme}>`. Style it with its own `ShowcaseFrame.module.scss` using tokens; it's not a Sitecore component, so it stays out of the component root.
   - `ShowcaseSection` (exported from the same file): a labeled block (`<section aria-label>` + a small heading with the variant name) so each variant is easy to find.
2. **Index page** — `/showcase` listing every showcase page (`src/pages/showcase/index.tsx` or `src/app/showcase/page.tsx`), from a plain array this mode appends to.
3. **Proxy matcher** — the Content SDK proxy (multisite, redirects, personalize) runs on every matched path; the multisite proxy rewrites `/showcase/…` to a site path that the Sitecore catch-all route then 404s. Exclude it in `src/proxy.ts`'s `config.matcher`, e.g. `'/((?!api/|_next/|healthz|sitecore/api/|-/|showcase|favicon.ico|sc_logo.svg).*)'`. This file is sensitive: show the exact diff and ask. Mention that a Sitecore content route starting with `showcase` would also skip the proxy; if the site has one, use another prefix.

## Step 4c — The page

**Pages Router** — `src/pages/showcase/<kebab-name>.tsx`:

```tsx
import type { GetStaticProps } from 'next';
import { JSX } from 'react';
import ShowcaseFrame, { ShowcaseSection } from 'lib/showcase/ShowcaseFrame';
import SingleCta, { Centered } from 'components/single-cta/SingleCta';
import { singleCtaSampleFields } from 'components/single-cta/SingleCta.fields';

const FIGMA_URL = 'https://www.figma.com/design/…?node-id=…';
const rendering = { componentName: 'SingleCta', dataSource: 'showcase' };

const SingleCtaShowcase = (): JSX.Element => (
  <ShowcaseFrame title="SingleCta" figmaUrl={FIGMA_URL}>
    <ShowcaseSection label="Default">
      <SingleCta rendering={rendering} params={{}} fields={singleCtaSampleFields} />
    </ShowcaseSection>
    <ShowcaseSection label="Centered">
      <Centered rendering={rendering} params={{}} fields={singleCtaSampleFields} />
    </ShowcaseSection>
  </ShowcaseFrame>
);

// Dev only: production builds return 404
export const getStaticProps: GetStaticProps = async () =>
  process.env.NODE_ENV === 'production' ? { notFound: true } : { props: {} };

export default SingleCtaShowcase;
```

**App Router** — `src/app/showcase/<kebab-name>/page.tsx`: a server component that calls `notFound()` (from `next/navigation`) when `process.env.NODE_ENV === 'production'`, then renders the same frame and sections. Server components get `page={createShowcasePage()}` as a prop, since they read editing state from it. If no root layout covers `/showcase`, add `src/app/showcase/layout.tsx` with `<html>`/`<body>` and the global stylesheet import (ask). Verify the App Router variant on its first real run and note anything that differed.

Rules:
- Import paths: use the project's aliases (`components/*`, `lib/*`) if `tsconfig.json` defines them, else relative paths.
- One section per variant (named export), plus a **long content** section when text can grow (repeat the sample text) and, for list fields, a section with one item and one with many.
- `rendering.dataSource` must be non-empty, or `withDatasourceCheck` hides the component.
- Rendering parameters the component reads (e.g. `params.styles`) get one section per meaningful value.
- No Sitecore calls, no `getServerSideProps` data, no edits to the component itself.

## Step 4d — Proposal

The files to create or update (helpers and index only the first time; the proxy diff), and the sections the page will show. Then continue with SKILL.md Step 5.

## Step 4e — Verify (SKILL.md Step 7)

Open `http://localhost:<port>/showcase/<kebab-name>` with the browser MCP (use the project's running dev server or `.claude/launch.json`; `npm run dev` needs Sitecore credentials for its build step — `npm run dev:mock` doesn't, when the project has the local mock). Check the console for errors (missing keys, hydration), switch each theme, and compare the default variant with the Figma screenshot at the frame's width.
