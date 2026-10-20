import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from 'storybook/test';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { createMockPage } from '../../../.storybook/sitecore';
import SingleCta from './SingleCta';
import { SingleCtaFields, singleCtaEmptyFields, singleCtaSampleFields } from './SingleCta.fields';

const FIGMA_URL =
  'https://www.figma.com/design/lBcwJdRahz5XKI2pV8uhJl/USO-Wireframes?node-id=2812-11260';

const editingPage = createMockPage({
  mode: {
    name: LayoutServicePageState.Edit,
    isNormal: false,
    isPreview: false,
    isEditing: true,
    isDesignLibrary: false,
    designLibrary: { isVariantGeneration: false },
  },
});

const DATASOURCE_ID = '{5B1D3C8E-2A4F-4E6B-9C7D-8E9F0A1B2C3D}';

// Page Builder sends field metadata in editing mode; the SDK shows its empty-field
// placeholders only for fields that have it.
const metadataFor = (name: string) => ({
  title: name,
  fieldId: name,
  rawValue: '',
  datasource: { id: DATASOURCE_ID, language: 'en', revision: '', version: 1 },
});

const withEditingMetadata = (fields: SingleCtaFields): SingleCtaFields => ({
  Eyebrow: { ...fields.Eyebrow, metadata: metadataFor('Eyebrow') },
  Title: { ...fields.Title, metadata: metadataFor('Title') },
  Text: { ...fields.Text, metadata: metadataFor('Text') },
  // LinkField's type omits `metadata`, but the SDK's Link reads it at runtime
  PrimaryCTA: {
    ...fields.PrimaryCTA,
    metadata: metadataFor('PrimaryCTA'),
  } as SingleCtaFields['PrimaryCTA'],
});

const meta = {
  title: 'Components/SingleCta',
  component: SingleCta,
  tags: ['autodocs'],
  args: {
    rendering: { componentName: 'SingleCta', dataSource: DATASOURCE_ID },
    params: {},
    fields: singleCtaSampleFields,
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA_URL },
  },
} satisfies Meta<typeof SingleCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Their mission. Your mission.'
    );
    await expect(canvas.getByRole('link', { name: 'Start a fundraiser' })).toHaveAttribute(
      'href',
      '#'
    );
  },
};

export const Empty: Story = {
  args: { fields: withEditingMetadata(singleCtaEmptyFields) },
  parameters: { sitecore: { page: editingPage } },
  play: async ({ canvasElement }) => {
    // Each of the 4 empty fields renders an editable placeholder instead of disappearing
    await expect(within(canvasElement).getAllByText('[No text in field]')).toHaveLength(4);
  },
};

export const EmptyLive: Story = {
  args: { fields: singleCtaEmptyFields },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('heading')).toBeNull();
    await expect(within(canvasElement).queryByRole('link')).toBeNull();
  },
};

export const NoDatasource: Story = {
  args: { rendering: { componentName: 'SingleCta', dataSource: '' } },
  parameters: { sitecore: { page: editingPage } },
};

export const LongContent: Story = {
  args: {
    fields: {
      ...singleCtaSampleFields,
      Eyebrow: { value: 'Fundraise for USO and support service members around the world' },
      Title: {
        value: 'Their mission is our mission, every single day, wherever they are stationed',
      },
      Text: {
        value:
          '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>',
      },
      PrimaryCTA: {
        value: { href: '#', text: 'Start a fundraiser for your community', linktype: 'external' },
      },
    },
  },
};
