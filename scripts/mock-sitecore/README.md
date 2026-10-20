# Local Sitecore mock

Run the head app without Sitecore. A small local GraphQL server stands in for Sitecore
Experience Edge and answers the app's content queries from JSON files in `mock-data/`.
A snapshot script fills those files from a real Sitecore instance, and you can edit or
write them by hand.

- [Quick start](#quick-start)
- [How it works](#how-it-works)
- [Commands](#commands)
- [Configuration](#configuration)
- [Fixture files](#fixture-files)
- [Query handling](#query-handling)
- [Common tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Limitations](#limitations)
- [File reference](#file-reference)

## Quick start

```bash
# 1. Optional: capture real content (needs Sitecore credentials in .env.local)
npm run mock:snapshot -- --site ascrs --limit 25

# 2. Run the app against the mock
npm run dev:mock
```

Open `http://localhost:3000/` (or the port in `PORT`). No Sitecore credentials or
network access are needed for step 2. `npm run dev` is unchanged and still uses Sitecore.

## How it works

```mermaid
flowchart LR
  subgraph snapshot["npm run mock:snapshot (one-off)"]
    S[snapshot.mjs] -- "SDK services:<br/>same queries as the app" --> E[(Sitecore Edge)]
    S -- writes JSON --> D[(mock-data/)]
  end
  subgraph run["npm run dev:mock"]
    A[Next.js app<br/>NEXT_PUBLIC_SITECORE_MOCK=true] -- "GraphQL POST<br/>localhost:4000/sitecore/api/graph/edge" --> M[server.mjs]
    T[sitecore-tools build] -- site list query --> M
    M -- reads per request --> D
  end
```

1. **The app only talks to Sitecore over GraphQL.** The Content SDK accepts a "local"
   API (`api.local.apiHost` + `apiKey`) and sends every query to
   `${apiHost}/sitecore/api/graph/edge`.
2. **`sitecore.config.ts` switches to the mock** when `NEXT_PUBLIC_SITECORE_MOCK=true`:
   it sets `api.local` to `http://localhost:4000` and clears the Edge context IDs. The
   clearing matters: when an Edge context ID is set (from `.env.local`), the SDK always
   prefers Edge over `api.local`.
3. **`server.mjs` recognizes each query** (layout, dictionary, site list, routes),
   reads the matching fixture file and returns it in the shape the SDK expects.
   Anything it doesn't recognize gets an empty result, which the SDK treats as "not
   found" or "not configured".
4. **`snapshot.mjs` uses the SDK's own services** (`LayoutService`, `DictionaryService`,
   `SiteInfoService`, `SitePathService`), so it sends exactly the queries the app sends,
   and saves the results as fixtures.

The app code (pages, proxy, components) is unchanged. Only the GraphQL endpoint differs.

## Commands

| Command | What it does |
|---|---|
| `npm run dev:mock` | Starts the mock server and `npm run dev` together, with `NEXT_PUBLIC_SITECORE_MOCK=true`. |
| `npm run mock:server` | Starts only the mock server on port 4000. Useful when running the app another way. |
| `npm run mock:snapshot -- <options>` | Captures content from Sitecore into `mock-data/`. Reads `.env` and `.env.local`. |

### Snapshot options

| Option | Default | Description |
|---|---|---|
| `--site <name[,name]>` | `NEXT_PUBLIC_DEFAULT_SITE_NAME` | Site(s) to capture. Repeat the flag or comma-separate. Names are matched case-insensitively against Sitecore's site list. |
| `--routes </a,/b>` | crawl | Capture only these routes. Without it, the script lists the site's routes from Sitecore and captures them. |
| `--limit <n>` | `100` | Maximum routes per site when crawling. `/` is always included. |
| `--lang <code>` | site's language, else `en` | Language to capture. |
| `-h`, `--help` | | Print usage. |

Examples:

```bash
npm run mock:snapshot -- --site ascrs                       # crawl up to 100 routes
npm run mock:snapshot -- --site ascrs --limit 20
npm run mock:snapshot -- --site ascrs,asoa --routes /,/about-us
npm run mock:snapshot -- --site ascrs --lang en
```

Every run rewrites `mock-data/sites.json` and the dictionary for each captured site,
and writes (or overwrites) one file per captured route. It never deletes fixtures, so
routes captured earlier stay until you remove them. Routes Sitecore reports as missing
are listed and skipped.

## Configuration

| Variable | Used by | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITECORE_MOCK` | app | `true` switches `sitecore.config.ts` to the mock. Set by `npm run dev:mock`; you don't need it in `.env.local`. It's a `NEXT_PUBLIC_` variable so the browser bundle uses the mock too. |
| `SITECORE_MOCK_DATA_DIR` | server, snapshot | Fixture folder. Default `mock-data` (relative to the project root). |
| `NEXT_PUBLIC_DEFAULT_LANGUAGE` | server | Language used when a layout query has none. Default `en`. |
| `SITECORE_EDGE_CONTEXT_ID` | snapshot | Edge credentials to snapshot from. |
| `SITECORE_API_HOST` + `SITECORE_API_KEY` | snapshot | Alternative: snapshot from a local CM (`NEXT_PUBLIC_` variants also work). |
| `SITECORE_EDGE_PLATFORM_HOSTNAME` | snapshot | Non-default Edge hostname (`NEXT_PUBLIC_` variant also works). |
| `NEXT_PUBLIC_DEFAULT_SITE_NAME` | snapshot | Site captured when `--site` is omitted. |

**Port:** the mock always listens on `4000`. To change it, update `MOCK_PORT` in
`fixtures.mjs` and the `apiHost` in `sitecore.config.ts`.

## Fixture files

```
mock-data/
  sites.json                               site list
  <site>/<lang>/dictionary.json            dictionary phrases
  <site>/<lang>/routes/_root.json          page at "/"
  <site>/<lang>/routes/about-us.json       page at "/about-us"
  <site>/<lang>/routes/about-us/team.json  page at "/about-us/team"
```

Route paths are lowercased and trailing slashes are ignored, so `/About-Us/` reads
`about-us.json`. `/` is stored as `_root.json`.

### `sites.json`

The site list Sitecore returns. `sitecore-tools project build` turns it into
`.sitecore/sites.json`, which the multisite proxy uses to pick a site from the request
hostname.

```json
[
  { "name": "ascrs", "hostName": "dev.ascrs.org|local.ascrs.org|localhost", "language": "en" }
]
```

`hostName` can hold several hosts separated by `|`, `,` or `;`, and `*` wildcards.
Exact hosts win over wildcards, so adding `localhost` to a site makes it the site for
`http://localhost:<port>/` even when another site uses `*`. In this repo `ascrs` has
`localhost`.

### `dictionary.json`

A flat object of phrases. `src/pages/_app.tsx` passes it to `next-localization`'s
`I18nProvider`, so components read it with `useI18n()`:

```json
{ "Header.Search": "Search", "Footer.Copyright": "© 2026" }
```

### Route files (`routes/**/*.json`)

The layout Sitecore renders for a page: `{ sitecore: { context, route } }`. This is
exactly what `client.getPage()` receives, so components see the same props as in
production.

```jsonc
{
  "sitecore": {
    "context": {
      "pageEditing": false,
      "site": { "name": "ascrs" },
      "pageState": "normal",
      "language": "en",
      "itemPath": "/"
    },
    "route": {
      "name": "USO",
      "fields": {
        "Title": { "value": "USO" }            // page fields
      },
      "placeholders": {
        "headless-header": [],
        "headless-main": [
          {
            "uid": "5d2e9b1a-3c4f-4a6b-8d7e-9f0a1b2c3d4e",
            "componentName": "Title",            // must match a component in the component map
            "dataSource": "{8C3F2A1B-4D5E-4F6A-9B7C-1D2E3F4A5B6C}",
            "params": {},                         // rendering parameters (styles, etc.)
            "fields": {
              "Title": { "value": "Welcome to USO" }  // datasource fields
            }
          }
        ],
        "headless-footer": []
      }
    }
  }
}
```

- `route.placeholders` keys must match the placeholders the layout renders:
  `headless-header`, `headless-main` and `headless-footer` in `src/Layout.tsx`.
  Components can define nested placeholders under their own `placeholders` key.
- `componentName` picks the React component from `.sitecore/component-map.ts`. An
  unknown name renders the SDK's orange "missing React implementation" box.
- Field values use the usual Sitecore shapes: `{ "value": "text" }` for text and rich
  text, `{ "value": { "href": "/x", "text": "Go" } }` for links,
  `{ "value": { "src": "https://...", "alt": "", "width": 800, "height": 600 } }` for
  images. For other field types, snapshot a real page that uses them and copy its shape.
- Ignore the `uid` and GUID values: any unique string works.

## Query handling

`server.mjs` checks queries in this order. The first match wins.

| Query | Recognized by | Fixture | Response when missing |
|---|---|---|---|
| Layout (`client.getPage`) | `layout(site:"…", routePath:"…", language:"…")` | `<site>/<lang>/routes/<path>.json` | `layout: null`, so the app shows its 404 page. The server logs `no fixture for <site> <lang> <path>`. |
| Dictionary (`client.getDictionary`) | `dictionary(` | `<site>/<lang>/dictionary.json` | Empty dictionary. |
| Site list (`sitecore-tools project build`) | `siteInfoCollection` | `sites.json` | Empty list. |
| Site routes (static paths) | `routes(` | Lists the route files on disk | Empty list. |
| Other `siteInfo(…)` queries: error pages, robots, redirects, sitemap, llms.txt | `siteInfo(` | none | `site.siteInfo: null` ("not configured"). |
| Anything else | | none | `{}` and an `[mock] unhandled <operation>` log line. |

The server answers `GET /` with a status JSON (`{ "status": "ok", "mockDataDir": … }`),
which is a quick way to check it's running. It sends permissive CORS headers so
browser-side GraphQL calls work too.

## Common tasks

### Add a page by hand

1. Copy an existing route file, e.g. `routes/_root.json` to `routes/events.json`.
2. Edit `route.name`, `context.itemPath`, page fields and placeholders.
3. Open `/events`. No restart needed: route files are read on every request.

### Make a page the home page

Save it as `routes/_root.json`. The USO page in this repo is set up this way.

### Add a component and see it with mock data

1. Create it under `src/components/`, e.g. `src/components/title/Title.tsx`. While
   `npm run dev:mock` runs, the component map watcher registers it automatically.
   Otherwise run `npm run sitecore-tools:generate-map`.
2. Add a rendering with that `componentName` to a route file's placeholder, with the
   `fields` and `params` the component expects.
3. Reload the page.
4. Optionally, add a Storybook story under `src/stories/` (outside `src/components/`,
   which the component map generator scans). See `src/stories/Title.stories.tsx`:
   stories can pass a mock page through `parameters.sitecore.page`, and `play`
   functions show PASS/FAIL in the Interactions panel.

### Test edge cases

Edit fixture values directly: empty strings, very long text, missing images, extra
items in a list. This is the main advantage over a live Sitecore instance.

### Serve a different site on localhost

Move `localhost` to that site's `hostName` in `mock-data/sites.json` and restart
`npm run dev:mock`. You can also pick a site per request with `?sc_site=<name>`.

### Refresh from Sitecore

Re-run `npm run mock:snapshot`. Hand edits to captured routes are overwritten, and
`sites.json` is replaced, so re-add `localhost` to the site you serve locally.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| Every page is a 404 | The request resolved to a site with no fixture, often `Shared Site` / `Default` (hostName `*`). Check the server log line `no fixture for <site> <lang> <path>`. Add `localhost` to the right site in `sites.json`, or use `?sc_site=`. |
| Changes to `sites.json` don't apply | The site list is read at startup by `sitecore-tools project build`. Restart `npm run dev:mock`. |
| Dictionary changes don't show | The SDK caches dictionaries for 60 seconds. Wait or restart. |
| Requests still go to Sitecore | The app was started with `npm run dev` instead of `npm run dev:mock`, so `NEXT_PUBLIC_SITECORE_MOCK` isn't set. |
| `EADDRINUSE :4000` | Another mock server, or another app, is using port 4000. Stop it, or change the port (see [Configuration](#configuration)). |
| `[MV-007] Provide either "contextId" or both "apiHost" and "apiKey"` | The mock switch is off and `.env.local` has no Sitecore credentials. Start with `npm run dev:mock`, not `npm run dev`. |
| Orange "missing React implementation" boxes | The fixture references a `componentName` that doesn't exist in `src/components/` yet. |
| `Missing Sitecore credentials` from the snapshot | Set `SITECORE_EDGE_CONTEXT_ID` in `.env.local`. Only the snapshot needs it. |

## Limitations

- Only pages with a route file exist. Everything else returns the 404 page.
- Images and media URLs in fixtures still point at Sitecore's media servers, so they
  don't load offline.
- Page Builder editing, preview, personalization and redirects are off in mock mode.
- Error pages, robots.txt, sitemap.xml and llms.txt behave as "not configured".
- Captured content is a point-in-time copy. It doesn't update until you re-snapshot.

## File reference

| File | Role |
|---|---|
| `scripts/mock-sitecore/server.mjs` | The mock GraphQL server and its query handlers. |
| `scripts/mock-sitecore/snapshot.mjs` | Captures fixtures from Sitecore through the SDK services. |
| `scripts/mock-sitecore/fixtures.mjs` | Shared fixture paths, JSON read/write, route listing, port. Refuses paths outside the fixture folder. |
| `sitecore.config.ts` | The `NEXT_PUBLIC_SITECORE_MOCK` switch. |
| `package.json` | `dev:mock`, `mock:server` and `mock:snapshot` scripts. |
| `mock-data/` | The fixtures. |
| `.claude/launch.json` | `next-dev-mock` entry for Claude's browser preview (port 3001). |
