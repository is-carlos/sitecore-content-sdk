import type { Meta, StoryObj } from '@storybook/nextjs';
import { Section, ThemeColumns, TokenList } from './DesignSystem';

// Template from the is-frontend-figma-to-sitecore skill (color mode). Tokens are read from the
// CSS, so this file doesn't change when tokens do.

const meta = {
  title: 'Design System/Color',
  parameters: {
    layout: 'padded',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/c0EdXo5GbzQkDQ673Fptxl/%3CINT%3E-SPP-Page-Designs?node-id=2093-566',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const EMPTY = 'No color tokens yet. Run /is-frontend-figma-to-sitecore color.';

export const Primitives: Story = {
  render: () => (
    <Section
      title="Color primitives"
      description="Raw values. Components never use these directly."
    >
      <TokenList
        kind="color"
        match={{ prefix: '--isds-color-', exclude: ['--isds-color-gradient-'], tier: 'primitive' }}
        empty={EMPTY}
      />
    </Section>
  ),
};

export const Tokens: Story = {
  render: () => (
    <Section title="Color tokens" description="Semantic colors, in every color theme.">
      <ThemeColumns>
        {() => (
          <TokenList
            kind="color"
            match={{
              prefix: '--isds-color-',
              exclude: ['--isds-color-gradient-'],
              tier: 'semantic',
            }}
            empty={EMPTY}
          />
        )}
      </ThemeColumns>
    </Section>
  ),
};

export const Gradients: Story = {
  render: () => (
    <>
      <Section title="Gradient stops">
        <TokenList kind="color" match={{ prefix: '--isds-color-gradient-' }} empty={EMPTY} />
      </Section>
      <Section title="Gradients">
        <TokenList kind="gradient" match={{ prefix: '--isds-gradient-' }} empty={EMPTY} />
      </Section>
    </>
  ),
};
