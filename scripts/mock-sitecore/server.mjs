/**
 * Local stand-in for Sitecore's GraphQL endpoint (/sitecore/api/graph/edge).
 * Answers the queries the Content SDK sends from the JSON fixtures in mock-data/
 * (create them with `npm run mock:snapshot`). Unknown queries get an empty result.
 *
 * Usage: npm run mock:server   (or `npm run dev:mock` to start it together with the app)
 */
import http from 'node:http';
import { MOCK_DATA_DIR, MOCK_PORT, fixturePaths, listRoutes, readJson } from './fixtures.mjs';

const DEFAULT_LANGUAGE = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

// Matches the SDK's layout query: layout(site:"x", routePath:"/y", language:"en")
const LAYOUT_QUERY =
  /\blayout\(\s*site:\s*"([^"]*)"\s*,\s*routePath:\s*"([^"]*)"(?:\s*,\s*language:\s*"([^"]*)")?\s*\)/;

/** Query handlers, checked in order. Each returns the GraphQL `data` payload. */
const handlers = [
  {
    name: 'layout',
    match: (query) => LAYOUT_QUERY.test(query),
    resolve: async (query) => {
      const [, site, routePath, language = DEFAULT_LANGUAGE] = query.match(LAYOUT_QUERY);
      const rendered = await readJson(fixturePaths.layout(site, language, routePath));
      if (!rendered) {
        console.log(`  no fixture for ${site} ${language} ${routePath} -> not found`);
      }
      return { layout: rendered ? { item: { rendered } } : null };
    },
  },
  {
    name: 'dictionary',
    match: (query) => /\bdictionary\s*\(/.test(query),
    resolve: async (_query, variables) => {
      const phrases = (await readJson(fixturePaths.dictionary(variables.siteName, variables.language))) || {};
      return {
        site: {
          siteInfo: {
            dictionary: {
              pageInfo: { endCursor: '', hasNext: false },
              results: Object.entries(phrases).map(([key, value]) => ({ key, value })),
            },
          },
        },
      };
    },
  },
  {
    name: 'sites',
    match: (query) => /\bsiteInfoCollection\b/.test(query),
    resolve: async () => ({
      site: { siteInfoCollection: (await readJson(fixturePaths.sites())) || [] },
    }),
  },
  {
    name: 'routes',
    match: (query) => /\broutes\s*\(/.test(query),
    resolve: async (_query, variables) => {
      const routes = await listRoutes(variables.siteName, variables.language);
      return {
        site: {
          siteInfo: {
            routes: {
              total: routes.length,
              pageInfo: { endCursor: '', hasNext: false },
              results: routes.map((routePath) => ({ path: routePath })),
            },
          },
        },
      };
    },
  },
];

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const send = (res, status, payload) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    // The app's browser bundle may also call this endpoint in mock mode
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  });
  res.end(JSON.stringify(payload));
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET') return send(res, 200, { status: 'ok', mockDataDir: MOCK_DATA_DIR });
  if (req.method !== 'POST') return send(res, 405, { errors: [{ message: 'Use POST' }] });

  try {
    const { query = '', variables = {} } = JSON.parse(await readBody(req));
    const handler = handlers.find((h) => h.match(query));
    if (!handler) {
      const operation = query.match(/\b(?:query|mutation)\s+(\w+)/)?.[1] || 'anonymous query';
      console.log(`[mock] unhandled ${operation} -> empty result`);
      // Site-level queries (error pages, robots, redirects...) treat a null siteInfo as "not configured"
      return send(res, 200, { data: /\bsiteInfo\s*\(/.test(query) ? { site: { siteInfo: null } } : {} });
    }
    console.log(`[mock] ${handler.name}`);
    return send(res, 200, { data: await handler.resolve(query, variables) });
  } catch (error) {
    console.error('[mock] request failed:', error);
    return send(res, 500, { errors: [{ message: error.message }] });
  }
});

server.listen(MOCK_PORT, () => {
  console.log(`[mock] Sitecore GraphQL mock on http://localhost:${MOCK_PORT}, serving ${MOCK_DATA_DIR}`);
});
