import type { Decorator, Preview } from '@storybook/nextjs';
import { fontVariablesCss } from '../src/lib/fonts';
import { withSitecore } from './sitecore';
import '../src/styles/main.scss';

// Same font custom properties as src/pages/_app.tsx. Editing-mode stories also emit Page
// Builder's field markers (<code type="text/sitecore">), which only Page Builder consumes.
const withFonts: Decorator = (Story) => (
  <>
    <style>{`${fontVariablesCss} code[type='text/sitecore'] { display: none; }`}</style>
    <Story />
  </>
);

// Wraps every story in the color theme picked in the toolbar (the themes in src/styles/tokens/_color.scss)
const withColorTheme: Decorator = (Story, { globals }) => (
  <div data-color-theme={globals.colorTheme}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [withColorTheme, withSitecore, withFonts],
  globalTypes: {
    colorTheme: {
      description: 'Color theme (data-color-theme)',
      toolbar: { icon: 'paintbrush', items: ['default', 'on-dark'], dynamicTitle: true },
    },
  },
  initialGlobals: { colorTheme: 'default' },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
