import type { Meta, StoryObj } from '@storybook/nextjs';
import { Section, TokenList } from './DesignSystem';

// Template from the is-frontend-figma-to-sitecore skill (spacing mode). Tokens are read from the
// CSS. Semantic spacing is mobile-first: resize the canvas (or use the viewport toolbar) to see
// the desktop values.

const meta = {
  title: 'Design System/Spacing',
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: '__FIGMA_URL__' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const EMPTY = 'No spacing tokens yet. Run /is-frontend-figma-to-sitecore spacing.';

export const Primitives: Story = {
  render: () => (
    <Section title="Spacing primitives" description="Raw sizes. Components never use these directly.">
      <TokenList kind="spacing" match={{ prefix: '--isds-spacing-', tier: 'primitive' }} empty={EMPTY} />
    </Section>
  ),
};

export const Tokens: Story = {
  render: () => (
    <Section
      title="Spacing tokens"
      description="Semantic spacing, at the current viewport width. Resize to see other breakpoints."
    >
      <TokenList kind="spacing" match={{ prefix: '--isds-spacing-', tier: 'semantic' }} empty={EMPTY} />
    </Section>
  ),
};
