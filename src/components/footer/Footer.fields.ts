import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

/** An item of the FooterLink template, as a Treelist delivers it in the layout */
export type FooterLinkItem = {
  id?: string;
  name: string;
  displayName?: string;
  fields: {
    Link: LinkField;
  };
};

export type FooterFields = {
  PrimaryLinks: FooterLinkItem[];
  SecondaryLinks: FooterLinkItem[];
  Logo: ImageField;
  Address: Field<string>;
  Phone: LinkField;
  FacebookLink: LinkField;
  XLink: LinkField;
  LinkedInLink: LinkField;
  InstagramLink: LinkField;
  YouTubeLink: LinkField;
  Copyright: Field<string>;
  Disclaimer: Field<string>;
  LegalLinks: FooterLinkItem[];
};

/**
 * Builds a FooterLink item for sample content
 * @param {string} text link text
 * @param {string} [href] link URL
 * @returns {FooterLinkItem} the item
 */
export const footerLink = (text: string, href = '#'): FooterLinkItem => ({
  id: `sample-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  name: text,
  fields: { Link: { value: { href, text, linktype: 'external' } } },
});

// The USO logo from Figma (Footer-Base > USO Logo), used as the sample Logo image
const USO_LOGO_SVG = `<svg width="115" height="66" viewBox="0 0 115 66" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H115V66H0V0Z" fill="#BFBFBF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M5.77563 5.6839H109.248V60.2675H5.77563V5.6839Z" fill="white"/><path d="M3.61426 4.17188V61.7818H111.386V4.17188H3.61426ZM107.748 58.7533H7.2766V7.19827H107.748V58.7533ZM38.3866 12.7519H42.9721V45.7629C42.9721 50.7692 40.5152 53.2238 35.5775 53.2238H34.1598C29.198 53.2238 26.7652 50.7449 26.7652 45.7629V12.7519H31.3004V45.9793C31.3004 48.0299 32.2456 49.0055 34.2998 49.0055H35.387C37.4195 49.0055 38.3864 48.0519 38.3864 45.9793L38.3866 12.7519ZM65.4144 40.0901V45.9308C65.4144 50.9371 62.9575 53.3917 58.0197 53.3917H56.7683C51.8785 53.3917 49.4918 50.9128 49.4918 46.05V37.6355H53.9329V46.2398C53.9329 48.2905 54.8781 49.2661 56.9323 49.2661H57.8293C59.8617 49.2661 60.8287 48.3124 60.8287 46.2398V40.2336C60.8287 38.2316 60.1439 37.3729 58.8444 36.3951L53.27 32.3204C50.3165 30.1991 49.4677 28.1264 49.4677 24.8595V20.0452C49.4677 15.0389 51.9246 12.5843 56.8623 12.5843H57.9956C62.8853 12.5843 65.2721 15.0632 65.2721 19.926V27.1243H60.8069V19.7362C60.8069 17.6855 59.8617 16.7099 57.8075 16.7099H57.0046C54.9721 16.7099 54.0052 17.6636 54.0052 19.7362V24.7889C54.0052 26.7909 54.7622 27.6496 56.0596 28.6274L61.588 32.6316C64.4692 34.7527 65.3903 36.6598 65.4144 40.0901ZM22.16 44.8336L18.6879 47.3831L20.0115 51.5307L16.5373 48.9812L13.0413 51.5307L14.3869 47.3831L10.9148 44.8336H15.2139L16.5375 40.7345L17.8611 44.8336H22.16ZM17.8588 31.6999H22.1577L18.6856 34.2273L20.0092 38.3749L16.5372 35.8254L13.0412 38.3749L14.3867 34.2273L10.9147 31.6778H15.2137L16.5373 27.603L17.8588 31.6999ZM17.8588 18.5684H22.1577L18.6856 21.1179L20.0092 25.2655L16.5372 22.716L13.0412 25.2655L14.3867 21.1179L10.9147 18.5684H15.2137L16.5373 14.4693L17.8588 18.5684ZM99.7622 18.5684H104.061L100.589 21.1179L101.913 25.2655L98.4406 22.716L94.9447 25.2655L96.2902 21.1179L92.8182 18.5684H97.117L98.4406 14.4693L99.7622 18.5684ZM80.8643 12.5842H79.1645C74.2267 12.5842 71.7698 15.0388 71.7698 20.0451V45.9551C71.7698 50.9371 74.2026 53.416 79.1645 53.416H80.8643C85.8262 53.3917 88.259 50.9128 88.259 45.9308V20.0451C88.259 15.0631 85.824 12.5842 80.8643 12.5842ZM83.7216 46.1691C83.7216 48.2418 82.7525 49.1953 80.7222 49.1953H79.3527C77.2984 49.1953 76.3534 48.2175 76.3534 46.1691V19.8066C76.3534 17.7338 77.3225 16.7804 79.3527 16.7804H80.7222C82.7547 16.7804 83.7216 17.734 83.7216 19.8066V46.1691ZM99.7622 31.6999H104.061L100.589 34.2273L101.913 38.3749L98.4406 35.8254L94.9447 38.3749L96.2902 34.2273L92.8182 31.6778H97.117L98.4406 27.603L99.7622 31.6999ZM104.063 44.8336L100.591 47.3831L101.915 51.5307L98.443 48.9812L94.947 51.5307L96.2925 47.3831L92.8205 44.8336H97.1195L98.4431 40.7345L99.7667 44.8336H104.063Z" fill="#262626"/></svg>`;

// Sample content from Figma: USO Wireframes, "Footer Variations" > Footer-Base (node 2812:12615)
export const footerSampleFields: FooterFields = {
  PrimaryLinks: [
    footerLink('Find a USO'),
    footerLink('Ways to Give'),
    footerLink('Volunteer'),
    footerLink('USO Store'),
  ],
  SecondaryLinks: [
    footerLink('About Us'),
    footerLink('Careers'),
    footerLink('USO Admissions Policy'),
    footerLink('Get in Touch'),
  ],
  Logo: {
    value: {
      src: `data:image/svg+xml,${encodeURIComponent(USO_LOGO_SVG)}`,
      alt: 'USO',
      width: '115',
      height: '66',
    },
  },
  Address: { value: 'PO Box 96860\nWashington, DC 20077-7677' },
  Phone: { value: { href: 'tel:+18884843876', text: '+1 (888) 484 3876', linktype: 'external' } },
  FacebookLink: { value: { href: '#', text: 'Facebook', linktype: 'external' } },
  XLink: { value: { href: '#', text: 'X', linktype: 'external' } },
  LinkedInLink: { value: { href: '#', text: 'LinkedIn', linktype: 'external' } },
  InstagramLink: { value: { href: '#', text: 'Instagram', linktype: 'external' } },
  YouTubeLink: { value: { href: '#', text: 'YouTube', linktype: 'external' } },
  Copyright: { value: '©2026 USO, Inc. All Rights Reserved.' },
  Disclaimer: {
    value:
      'The USO is a private, 501(c)(3) nonprofit, charitable organization, not a government agency.',
  },
  LegalLinks: [footerLink('Terms of Use'), footerLink('Privacy'), footerLink('State Disclosures')],
};

export const footerEmptyFields: FooterFields = {
  PrimaryLinks: [],
  SecondaryLinks: [],
  Logo: { value: {} },
  Address: { value: '' },
  Phone: { value: { href: '' } },
  FacebookLink: { value: { href: '' } },
  XLink: { value: { href: '' } },
  LinkedInLink: { value: { href: '' } },
  InstagramLink: { value: { href: '' } },
  YouTubeLink: { value: { href: '' } },
  Copyright: { value: '' },
  Disclaimer: { value: '' },
  LegalLinks: [],
};
