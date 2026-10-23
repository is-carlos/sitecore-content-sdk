import type { Meta, StoryObj } from '@storybook/nextjs';
import { ReactNode } from 'react';
import { Section } from './DesignSystem';

// Template from the is-frontend-figma-to-sitecore skill (form mode). Every element and state,
// inside .isds-form. Hover and focus need the pointer and keyboard.

const meta = {
  title: 'Design System/Forms',
  parameters: {
    layout: 'padded',
    design: { type: 'figma', url: '__FIGMA_URL__' },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label style={{ display: 'grid', gap: '0.25rem', marginBlockEnd: '1rem' }}>
    <span>{label}</span>
    {children}
  </label>
);

export const Elements: Story = {
  render: () => (
    <Section title="Form elements" description="Default, filled, error and disabled states.">
      <form className="isds-form" onSubmit={(e) => e.preventDefault()}>
        <Field label="Text input">
          <input type="text" placeholder="Placeholder" />
        </Field>
        <Field label="Filled">
          <input type="text" defaultValue="Filled value" />
        </Field>
        <Field label="Error">
          <input type="email" defaultValue="not-an-email" aria-invalid="true" />
        </Field>
        <Field label="Disabled">
          <input type="text" placeholder="Disabled" disabled />
        </Field>
        <Field label="Textarea">
          <textarea placeholder="Placeholder" rows={3} />
        </Field>
        <Field label="Select">
          <select defaultValue="">
            <option value="" disabled>
              Choose one
            </option>
            <option>Option one</option>
            <option>Option two</option>
          </select>
        </Field>
        <fieldset>
          <legend>Checkboxes</legend>
          <label>
            <input type="checkbox" /> Default
          </label>
          <label>
            <input type="checkbox" defaultChecked /> Checked
          </label>
          <label>
            <input type="checkbox" disabled /> Disabled
          </label>
        </fieldset>
        <fieldset>
          <legend>Radios</legend>
          <label>
            <input type="radio" name="radio" /> Default
          </label>
          <label>
            <input type="radio" name="radio" defaultChecked /> Selected
          </label>
          <label>
            <input type="radio" name="radio-disabled" disabled /> Disabled
          </label>
        </fieldset>
      </form>
    </Section>
  ),
};
