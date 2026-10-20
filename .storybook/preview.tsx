import type { Decorator, Preview } from '@storybook/nextjs';
import { fontVariablesCss } from '../src/lib/fonts';
import { withSitecore } from './sitecore';

// Same font custom properties as src/pages/_app.tsx. Editing-mode stories also emit Page
// Builder's field markers (<code type="text/sitecore">), which only Page Builder consumes.
const withFonts: Decorator = (Story) => (
  <>
    <style>{`${fontVariablesCss} code[type='text/sitecore'] { display: none; }`}</style>
    <Story />
  </>
);

const preview: Preview = {
  decorators: [withSitecore, withFonts],
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
