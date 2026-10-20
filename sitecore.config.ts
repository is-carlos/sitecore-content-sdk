import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

// When NEXT_PUBLIC_SITECORE_MOCK=true (set by `npm run dev:mock`), content comes from the
// local mock GraphQL server in scripts/mock-sitecore instead of Sitecore.
const useMock = process.env.NEXT_PUBLIC_SITECORE_MOCK === 'true';

/**
 * @type {import('@sitecore-content-sdk/nextjs/config').SitecoreConfig}
 * See the documentation for `defineConfig`:
 * https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html
 */
const config = defineConfig(
  useMock ? { api: { local: { apiHost: 'http://localhost:4000', apiKey: 'mock' } } } : {}
);

if (useMock) {
  // Edge settings from .env.local take precedence over api.local, so clear them in mock mode
  config.api.edge.contextId = '';
  config.api.edge.clientContextId = '';
}

export default config;
