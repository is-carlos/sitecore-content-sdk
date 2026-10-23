import type { Meta, StoryObj } from '@storybook/nextjs';
import { Section, TokenList } from './DesignSystem';

// Template from the is-frontend-figma-to-sitecore skill (tokens/_effects.scss: radii and shadows,
// added by the color or spacing mode). Tokens are read from the CSS.

const meta = {
  title: 'Design System/Effects',
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: '__FIGMA_URL__' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Radii: Story = {
  render: () => (
    <Section title="Border radius">
      <TokenList kind="radius" match={{ prefix: '--isds-radius-' }} empty="No radius tokens yet." />
    </Section>
  ),
};

export const Shadows: Story = {
  render: () => (
    <Section title="Shadows">
      <TokenList kind="shadow" match={{ prefix: '--isds-shadow-' }} empty="No shadow tokens yet." />
    </Section>
  ),
};
