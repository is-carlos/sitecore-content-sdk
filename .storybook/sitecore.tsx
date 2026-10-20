import {
  ComponentMap,
  LayoutServicePageState,
  Page,
  SitecoreProvider,
} from '@sitecore-content-sdk/nextjs';
import type { Decorator } from '@storybook/nextjs';

/**
 * Builds a minimal page in normal (published) mode so Sitecore field components
 * render plain markup, without editing chromes.
 * @param {Partial<Page>} overrides - Values to merge over the mock page
 * @returns {Page} The mock page
 */
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

/**
 * Wraps every story in SitecoreProvider, mirroring src/Providers.tsx without
 * calling Sitecore. Stories can pass `parameters.sitecore.page` or
 * `parameters.sitecore.componentMap` to override the defaults (e.g. to render
 * components inside a Placeholder).
 */
export const withSitecore: Decorator = (Story, context) => {
  const { page, componentMap } = (context.parameters.sitecore || {}) as {
    page?: Page;
    componentMap?: ComponentMap;
  };

  return (
    <SitecoreProvider
      // Stories never call Sitecore, so no API credentials are needed
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
