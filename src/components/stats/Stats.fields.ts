import { Field } from '@sitecore-content-sdk/nextjs';

/** An item of the StatItem template, as a Treelist delivers it in the layout */
export type StatItem = {
  id?: string;
  name: string;
  displayName?: string;
  fields: {
    Value: Field<string>;
    Label: Field<string>;
  };
};

export type StatsFields = {
  Title: Field<string>;
  Stats: StatItem[];
};

/**
 * Builds a StatItem for sample content
 * @param {string} value the figure, e.g. "250+"
 * @param {string} label what the figure counts
 * @returns {StatItem} the item
 */
export const statItem = (value: string, label: string): StatItem => ({
  id: `sample-${value.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase()}`,
  name: value,
  fields: { Value: { value }, Label: { value: label } },
});

// Sample content from Figma: USO Wireframes, "Stats" (node 2767:10171)
export const statsSampleFields: StatsFields = {
  Title: { value: 'Your impact in action' },
  Stats: [
    statItem('11.3M+', 'USO programs and services delivered each year'),
    statItem('250+', 'USO centers serving the military community worldwide'),
    statItem('~7.3M', 'visits to USO centers each year'),
  ],
};

export const statsEmptyFields: StatsFields = {
  Title: { value: '' },
  Stats: [],
};
