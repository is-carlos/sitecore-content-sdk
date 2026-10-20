import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Fixture layout (all JSON, safe to hand-edit):
 *   mock-data/sites.json                              site list  ({ name, hostName, language }[])
 *   mock-data/<site>/<language>/dictionary.json       dictionary ({ [key]: phrase })
 *   mock-data/<site>/<language>/routes/_root.json     layout for "/"
 *   mock-data/<site>/<language>/routes/about/team.json layout for "/about/team"
 *   mock-data/<site>/<language>/partial-design.json   renderings added to every page
 *                                                      ({ placeholders: { [key]: rendering[] } })
 * Layout files hold the `rendered` layout JSON ({ sitecore: { context, route } }).
 */
export const MOCK_DATA_DIR = path.resolve(process.env.SITECORE_MOCK_DATA_DIR || 'mock-data');

export const MOCK_PORT = 4000;

const ROOT_ROUTE_FILE = '_root';

/**
 * Resolves a path inside the mock data folder, refusing anything that escapes it
 * @param {...string} segments path segments relative to the mock data folder
 * @returns {string} absolute path
 */
const resolveInside = (...segments) => {
  const resolved = path.resolve(MOCK_DATA_DIR, ...segments);
  if (resolved !== MOCK_DATA_DIR && !resolved.startsWith(MOCK_DATA_DIR + path.sep)) {
    throw new Error(`Refusing to access fixture outside ${MOCK_DATA_DIR}: ${resolved}`);
  }
  return resolved;
};

export const fixturePaths = {
  sites: () => resolveInside('sites.json'),
  dictionary: (site, language) => resolveInside(site, language, 'dictionary.json'),
  routesDir: (site, language) => resolveInside(site, language, 'routes'),
  partialDesign: (site, language) => resolveInside(site, language, 'partial-design.json'),
  layout: (site, language, routePath) => {
    const route = routePath.toLowerCase().replace(/^\/+|\/+$/g, '');
    return resolveInside(site, language, 'routes', `${route || ROOT_ROUTE_FILE}.json`);
  },
};

/**
 * @param {string} file absolute path
 * @returns {Promise<unknown | null>} parsed JSON, or null when the file does not exist
 */
export const readJson = async (file) => {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
};

/**
 * @param {string} file absolute path
 * @param {unknown} data value to write as pretty-printed JSON
 */
export const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + '\n');
};

/**
 * Lists the routes that have a layout fixture for a site and language
 * @param {string} site site name
 * @param {string} language language code
 * @returns {Promise<string[]>} route paths, e.g. ['/', '/about']
 */
export const listRoutes = async (site, language) => {
  const dir = fixturePaths.routesDir(site, language);
  let entries;
  try {
    entries = await fs.readdir(dir, { recursive: true });
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  return entries
    .filter((entry) => entry.endsWith('.json'))
    .map((entry) => {
      const route = entry.slice(0, -'.json'.length).split(path.sep).join('/');
      return route === ROOT_ROUTE_FILE ? '/' : `/${route}`;
    })
    .sort();
};
