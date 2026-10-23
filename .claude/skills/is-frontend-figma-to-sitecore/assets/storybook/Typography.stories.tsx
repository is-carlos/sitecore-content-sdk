import type { Meta, StoryObj } from '@storybook/nextjs';
import { Section, TextStyleList, TokenList } from './DesignSystem';
import typeStyles from './Typography.stories.module.scss';

// Template from the is-frontend-figma-to-sitecore skill (type mode). Font tokens are read from
// the CSS. TEXT_STYLES lists one entry per Figma text style; the type mode keeps it and
// Typography.stories.module.scss (one class per text-style mixin) in sync.

const TEXT_STYLES: { label: string; className: string }[] = [
  // { label: 'Heading/H2', className: typeStyles.headingH2 },
];

const RICH_TEXT_SAMPLE = `
  <h2>Heading 2</h2><p>Body copy with <a href="#">a link</a>, <strong>bold</strong> and <em>italic</em> text.</p>
  <h3>Heading 3</h3><ul><li>List item one</li><li>List item two</li></ul>
  <h4>Heading 4</h4><ol><li>Ordered item</li><li>Ordered item</li></ol>
  <blockquote><p>A quotation.</p></blockquote>
`;

const meta = {
  title: 'Design System/Typography',
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: '__FIGMA_URL__' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const EMPTY = 'No type tokens yet. Run /is-frontend-figma-to-sitecore type.';

export const Styles: Story = {
  render: () => (
    <Section
      title="Text styles"
      description="One mixin per Figma text style. Resize to see fluid sizes change."
    >
      {TEXT_STYLES.length ? <TextStyleList items={TEXT_STYLES} /> : <p>{EMPTY}</p>}
    </Section>
  ),
};

export const Tokens: Story = {
  render: () => (
    <>
      <Section title="Font families">
        <TokenList kind="font-family" match={{ prefix: '--isds-font-family-' }} empty={EMPTY} />
      </Section>
      <Section title="Font sizes">
        <TokenList kind="font-size" match={{ prefix: '--isds-font-size-' }} empty={EMPTY} />
      </Section>
      <Section title="Line heights, weights, letter spacing">
        <TokenList kind="value" match={{ prefix: '--isds-line-height-' }} empty={EMPTY} />
        <TokenList kind="value" match={{ prefix: '--isds-font-weight-' }} empty="" />
        <TokenList kind="value" match={{ prefix: '--isds-letter-spacing-' }} empty="" />
      </Section>
    </>
  ),
};

export const RichText: Story = {
  render: () => (
    <Section title="Rich text" description="Sitecore Rich Text fields, styled by .isds-rich-text.">
      <div className={`isds-rich-text ${typeStyles.richText}`} dangerouslySetInnerHTML={{ __html: RICH_TEXT_SAMPLE }} />
    </Section>
  ),
};
