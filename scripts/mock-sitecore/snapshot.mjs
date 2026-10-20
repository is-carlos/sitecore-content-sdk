/**
 * Captures real Sitecore content into mock-data/ so the app can run against the
 * local mock server (scripts/mock-sitecore/server.mjs) without Sitecore.
 * Uses the Content SDK's own services, so it sends the same queries as the app.
 * Reads credentials from .env / .env.local (SITECORE_EDGE_CONTEXT_ID, or
 * SITECORE_API_HOST + SITECORE_API_KEY for a local CM).
 *
 * Usage:
 *   npm run mock:snapshot -- --site my-site                 crawl up to 100 routes of a site
 *   npm run mock:snapshot -- --site my-site --limit 20
 *   npm run mock:snapshot -- --site my-site,other-site --routes /,/about
 *   npm run mock:snapshot -- --site my-site --lang en
 */
import { createRequire } from 'node:module';
import { parseArgs } from 'node:util';
import { MOCK_DATA_DIR, fixturePaths, writeJson } from './fixtures.mjs';

const require = createRequire(import.meta.url);
const { createGraphQLClientFactory } = require('@sitecore-content-sdk/content/client');
const { LayoutService } = require('@sitecore-content-sdk/content/layout');
const { DictionaryService } = require('@sitecore-content-sdk/content/i18n');
const { SiteInfoService, SitePathService } = require('@sitecore-content-sdk/content/site');

const CONCURRENCY = 4;

const { values: args } = parseArgs({
  options: {
    site: { type: 'string', multiple: true },
    lang: { type: 'string' },
    routes: { type: 'string', multiple: true },
    limit: { type: 'string', default: '100' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (args.help) {
  console.log(
    'Usage: npm run mock:snapshot -- --site <name[,name]> [--routes /,/about] [--limit 100] [--lang en]'
  );
  process.exit(0);
}

const splitList = (values = []) =>
  values.flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean);

const env = process.env;
const contextId = env.SITECORE_EDGE_CONTEXT_ID;
const apiHost = env.SITECORE_API_HOST || env.NEXT_PUBLIC_SITECORE_API_HOST;
const apiKey = env.SITECORE_API_KEY || env.NEXT_PUBLIC_SITECORE_API_KEY;

if (!contextId && !(apiHost && apiKey)) {
  console.error(
    'Missing Sitecore credentials. Set SITECORE_EDGE_CONTEXT_ID (or SITECORE_API_HOST and SITECORE_API_KEY) in .env.local.'
  );
  process.exit(1);
}

const clientFactory = createGraphQLClientFactory({
  api: {
    edge: {
      contextId,
      edgeUrl:
        env.SITECORE_EDGE_PLATFORM_HOSTNAME || env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME || undefined,
    },
    local: { apiHost, apiKey, path: '/sitecore/api/graph/edge' },
  },
});

const layoutService = new LayoutService({ clientFactory, formatLayoutQuery: null });
const dictionaryService = new DictionaryService({ clientFactory, cacheEnabled: false });
const sitePathService = new SitePathService({ clientFactory, pageSize: 100 });

/**
 * Runs an async worker over items with limited concurrency
 * @param {T[]} items items to process
 * @param {(item: T) => Promise<void>} worker async worker
 * @template T
 */
const runPool = async (items, worker) => {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) await worker(queue.shift());
  });
  await Promise.all(runners);
};

/**
 * Lists the routes to capture for a site: the ones passed with --routes, or a crawl
 * of the site's routes (capped by --limit). "/" is always included.
 * @param {string} site site name
 * @param {string} language language code
 * @returns {Promise<string[]>} route paths
 */
const getRoutes = async (site, language) => {
  const requested = splitList(args.routes);
  if (requested.length) return requested;

  const limit = Number(args.limit) || 100;
  const crawled = await sitePathService.fetchLanguageSitePaths(language, site);
  // The SDK prefixes paths with a multisite rewrite (/_site_<name>/...); fixtures use plain paths
  const paths = crawled.map((item) => item.path.replace(/^\/_site_[^/]+/, '') || '/');
  return [...new Set(['/', ...paths])].slice(0, limit);
};

const main = async () => {
  console.log(`Writing fixtures to ${MOCK_DATA_DIR}`);

  const sites = await new SiteInfoService({ clientFactory, cacheEnabled: false }).fetchSiteInfo();
  await writeJson(fixturePaths.sites(), sites);
  console.log(`sites.json: ${sites.length} sites`);

  const siteNames = splitList(args.site);
  if (!siteNames.length && env.NEXT_PUBLIC_DEFAULT_SITE_NAME) {
    siteNames.push(env.NEXT_PUBLIC_DEFAULT_SITE_NAME);
  }
  if (!siteNames.length) {
    console.error(`Pass --site <name>. Available: ${sites.map((s) => s.name).join(', ')}`);
    process.exit(1);
  }

  for (const siteName of siteNames) {
    const siteInfo = sites.find((s) => s.name.toLowerCase() === siteName.toLowerCase());
    if (!siteInfo) {
      console.error(`Unknown site "${siteName}". Available: ${sites.map((s) => s.name).join(', ')}`);
      process.exitCode = 1;
      continue;
    }
    const site = siteInfo.name;
    const language = args.lang || siteInfo.language || 'en';

    const dictionary = await dictionaryService.fetchDictionaryData(language, site);
    await writeJson(fixturePaths.dictionary(site, language), dictionary);
    console.log(`${site}/${language}: dictionary (${Object.keys(dictionary).length} phrases)`);

    const routes = await getRoutes(site, language);
    let saved = 0;
    const missing = [];
    await runPool(routes, async (routePath) => {
      const layout = await layoutService.fetchLayoutData(routePath, { site, locale: language });
      if (!layout.sitecore.route) {
        missing.push(routePath);
        return;
      }
      await writeJson(fixturePaths.layout(site, language, routePath), layout);
      saved++;
    });
    console.log(`${site}/${language}: ${saved} route(s) saved`);
    if (missing.length) console.log(`  not found in Sitecore: ${missing.join(', ')}`);
  }

  console.log('Done. Run `npm run dev:mock` to serve the site from these fixtures.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
