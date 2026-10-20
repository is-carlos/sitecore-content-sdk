import { Field, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

export type SingleCtaFields = {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  PrimaryCTA: LinkField;
};

// Sample content from Figma: USO Wireframes, "Single CTA" (node 2812:11260)
export const singleCtaSampleFields: SingleCtaFields = {
  Eyebrow: { value: 'Fundraise for USO' },
  Title: { value: 'Their mission. Your mission.' },
  Text: {
    value:
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>',
  },
  PrimaryCTA: { value: { href: '#', text: 'Start a fundraiser', linktype: 'external' } },
};

export const singleCtaEmptyFields: SingleCtaFields = {
  Eyebrow: { value: '' },
  Title: { value: '' },
  Text: { value: '' },
  PrimaryCTA: { value: { href: '' } },
};
