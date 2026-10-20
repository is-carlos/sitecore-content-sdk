import type { Meta, StoryObj } from '@storybook/nextjs';
import { expect, within } from 'storybook/test';
import Title from 'components/title/Title';
import { createMockPage } from '../../.storybook/sitecore';

const pageWithTitle = (title: string) =>
  createMockPage({
    layout: {
      sitecore: {
        context: { pageEditing: false, language: 'en', site: { name: 'storybook' } },
        route: { name: title, fields: { Title: { value: title } }, placeholders: {} },
      },
    },
  });

const meta = {
  title: 'Components/Title',
  component: Title,
  tags: ['autodocs'],
  args: {
    rendering: { componentName: 'Title' },
    params: {},
  },
  parameters: {
    sitecore: { page: pageWithTitle('USO') },
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithDatasource: Story = {
  args: {
    fields: { Title: { value: 'Welcome to USO' } },
  },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 1 });
    await expect(heading).toHaveTextContent('Welcome to USO');
  },
};

export const FallsBackToPageTitle: Story = {
  args: {
    fields: { Title: { value: '' } },
  },
  play: async ({ canvasElement }) => {
    const heading = within(canvasElement).getByRole('heading', { level: 1 });
    await expect(heading).toHaveTextContent('USO');
  },
};

export const WithStyles: Story = {
  args: {
    fields: { Title: { value: 'Styled title' } },
    params: { styles: 'title-large' },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('.component.title.title-large')).not.toBeNull();
  },
};
