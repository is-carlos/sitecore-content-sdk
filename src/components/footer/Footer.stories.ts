import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from 'storybook/test';
import { ComponentRendering, LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { createMockPage } from '../../../.storybook/sitecore';
import SingleCta from '../single-cta/SingleCta';
import { singleCtaSampleFields } from '../single-cta/SingleCta.fields';
import Footer from './Footer';
import { FooterFields, footerEmptyFields, footerLink, footerSampleFields } from './Footer.fields';

const FIGMA_URL =
  'https://www.figma.com/design/lBcwJdRahz5XKI2pV8uhJl/USO-Wireframes?node-id=2812-12615';

const DATASOURCE_ID = '{3D7E1A2B-6C4F-4B8E-9A1D-2F3E4B5C6D7E}';

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

// Page Builder sends field metadata in editing mode; the SDK shows its empty-field
// placeholders only for fields that have it. Treelists are edited in the field editor.
const withEditingMetadata = (fields: FooterFields): FooterFields => {
  const result: Record<string, unknown> = { ...fields };
  for (const [name, field] of Object.entries(fields)) {
    if (Array.isArray(field)) continue;
    result[name] = {
      ...field,
      metadata: {
        title: name,
        fieldId: name,
        rawValue: '',
        datasource: { id: DATASOURCE_ID, language: 'en', revision: '', version: 1 },
      },
    };
  }
  return result as FooterFields;
};

// "Find your USO" card from the Figma variations, rendered by the existing SingleCta
const ctaCard: ComponentRendering = {
  uid: 'footer-cta-card',
  componentName: 'SingleCta',
  dataSource: '{9E8D7C6B-5A4F-4E3D-8C2B-1A0F9E8D7C6B}',
  fields: {
    Eyebrow: { value: '' },
    Title: { value: 'Find your USO' },
    Text: { value: singleCtaSampleFields.Text.value ?? '' },
    PrimaryCTA: { value: { href: '#', text: 'Find support near you', linktype: 'external' } },
  },
};

const rendering = (
  cards: ComponentRendering[],
  dataSource = DATASOURCE_ID
): ComponentRendering => ({
  componentName: 'Footer',
  dataSource,
  placeholders: { 'footer-cta': cards },
});

const meta = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  args: {
    rendering: rendering([ctaCard]),
    params: {},
    fields: footerSampleFields,
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA_URL },
    sitecore: { componentMap: new Map([['SingleCta', SingleCta]]) },
  },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { name: 'Find your USO' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Ways to Give' })).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', '#');
    await expect(canvas.getByRole('link', { name: '+1 (888) 484 3876' })).toHaveAttribute(
      'href',
      'tel:+18884843876'
    );
  },
};

export const NoCta: Story = {
  args: { rendering: rendering([]) },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('heading')).toBeNull();
  },
};

export const Empty: Story = {
  args: { rendering: rendering([]), fields: withEditingMetadata(footerEmptyFields) },
  parameters: { sitecore: { page: editingPage } },
};

export const NoDatasource: Story = {
  args: { rendering: rendering([], '') },
  parameters: { sitecore: { page: editingPage } },
};

export const LongContent: Story = {
  args: {
    fields: {
      ...footerSampleFields,
      PrimaryLinks: [
        ...footerSampleFields.PrimaryLinks,
        footerLink('Programs and services for military families'),
        footerLink('Events'),
      ],
      SecondaryLinks: [
        ...footerSampleFields.SecondaryLinks,
        footerLink('Annual reports and financial statements'),
      ],
      LegalLinks: [
        ...footerSampleFields.LegalLinks,
        footerLink('Accessibility'),
        footerLink('Cookie Settings'),
      ],
    },
  },
};
