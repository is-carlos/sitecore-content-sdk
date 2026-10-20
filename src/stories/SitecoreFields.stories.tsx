import type { Meta, StoryObj } from '@storybook/nextjs';
import { Field, Link, LinkField, RichText, Text } from '@sitecore-content-sdk/nextjs';

type PromoFields = {
  heading: Field<string>;
  body: Field<string>;
  cta: LinkField;
};

/**
 * Example of the shape most Sitecore renderings take: `fields` from the layout
 * response rendered through the SDK field components. Copy this pattern when
 * writing stories for components in src/components.
 * @param {object} props - Component props
 * @param {PromoFields} props.fields - Mock Sitecore fields
 * @returns {JSX.Element} The rendered promo
 */
const Promo = ({ fields }: { fields: PromoFields }) => (
  <section style={{ fontFamily: 'sans-serif', maxWidth: 480 }}>
    <Text tag="h2" field={fields.heading} />
    <RichText field={fields.body} />
    <Link field={fields.cta} />
  </section>
);

const meta = {
  title: 'Sitecore/Field components',
  component: Promo,
  tags: ['autodocs'],
  args: {
    fields: {
      heading: { value: 'Hello from Storybook' },
      body: { value: '<p>Rich text from a <strong>mock</strong> Sitecore field.</p>' },
      cta: { value: { href: '/about', text: 'Learn more' } },
    },
  },
} satisfies Meta<typeof Promo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyFields: Story = {
  args: {
    fields: {
      heading: { value: '' },
      body: { value: '' },
      cta: { value: { href: '' } },
    },
  },
};
