import type { Meta, StoryObj } from '@storybook/nextjs';
import { ClassGallery, Section, ThemeColumns } from './DesignSystem';

// Template from the is-frontend-figma-to-sitecore skill (button mode). Every .isds-button-* class
// in the CSS is shown as a link and a button, default and disabled. Hover, focus and active need
// the pointer and keyboard (or storybook-addon-pseudo-states).

const meta = {
  title: 'Design System/Buttons',
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: '__FIGMA_URL__' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const renderButton = (className: string) => (
  <>
    <a href="#" className={className}>
      Link button
    </a>
    <button type="button" className={className}>
      Button
    </button>
    <button type="button" className={className} disabled>
      Disabled
    </button>
  </>
);

export const AllButtons: Story = {
  render: () => (
    <Section title="Buttons" description="In every color theme. Hover and tab through them.">
      <ThemeColumns>
        {() => (
          <ClassGallery
            prefix="isds-button-"
            render={renderButton}
            empty="No buttons yet. Run /is-frontend-figma-to-sitecore button."
          />
        )}
      </ThemeColumns>
    </Section>
  ),
};
