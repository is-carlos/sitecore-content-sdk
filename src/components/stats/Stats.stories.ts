import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from 'storybook/test';
import { LayoutServicePageState } from '@sitecore-content-sdk/nextjs';
import { createMockPage } from '../../../.storybook/sitecore';
import Stats from './Stats';
import { StatsFields, statItem, statsEmptyFields, statsSampleFields } from './Stats.fields';

const FIGMA_URL =
  'https://www.figma.com/design/lBcwJdRahz5XKI2pV8uhJl/USO-Wireframes?node-id=2767-10171';

const DATASOURCE_ID = '{7A1B2C3D-4E5F-4A6B-8C7D-9E0F1A2B3C4D}';

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
// placeholders only for fields that have it. The Treelist is edited in the field editor.
const withEditingMetadata = (fields: StatsFields): StatsFields => ({
  ...fields,
  Title: {
    ...fields.Title,
    metadata: {
      title: 'Title',
      fieldId: 'Title',
      rawValue: '',
      datasource: { id: DATASOURCE_ID, language: 'en', revision: '', version: 1 },
    },
  },
});

const meta = {
  title: 'Components/Stats',
  component: Stats,
  tags: ['autodocs'],
  args: {
    rendering: { componentName: 'Stats', dataSource: DATASOURCE_ID },
    params: {},
    fields: statsSampleFields,
  },
  parameters: {
    layout: 'fullscreen',
    design: { type: 'figma', url: FIGMA_URL },
  },
} satisfies Meta<typeof Stats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Your impact in action'
    );
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    await expect(canvas.getByText('11.3M+')).toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { fields: withEditingMetadata(statsEmptyFields) },
  parameters: { sitecore: { page: editingPage } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('[No text in field]')).toBeInTheDocument();
  },
};

export const EmptyLive: Story = {
  args: { fields: statsEmptyFields },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('heading')).toBeNull();
    await expect(within(canvasElement).queryByRole('list')).toBeNull();
  },
};

export const NoDatasource: Story = {
  args: { rendering: { componentName: 'Stats', dataSource: '' } },
  parameters: { sitecore: { page: editingPage } },
};

export const LongContent: Story = {
  args: {
    fields: {
      Title: { value: 'Your impact in action, across every base, deployment and homecoming' },
      Stats: [
        ...statsSampleFields.Stats,
        statItem('1,000,000+', 'care packages and comfort items delivered to deployed troops'),
        statItem('35,000', 'volunteers giving their time at USO locations around the world'),
      ],
    },
  },
};
