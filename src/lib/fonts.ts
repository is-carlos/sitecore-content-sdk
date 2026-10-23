import { Open_Sans, Poppins, Roboto_Mono, Source_Sans_3, Space_Grotesk } from 'next/font/google';

// Web fonts from the SPP designs, used by the type tokens (src/styles/tokens/_typography.scss):
// Source Sans 3 (Figma's "Source Sans Pro", renamed by Google) for headings and body, Space
// Grotesk for the accent styles (eyebrows, card dates), Roboto Mono for code.
export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], weight: ['700'], display: 'swap' });

export const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['700'], display: 'swap' });

// Web fonts from the USO designs, still used by the SingleCta, Footer and Stats components:
// Poppins (headings, body) and Open Sans Condensed (eyebrows, buttons), which is the Open Sans
// variable font at a narrow width.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const openSans = Open_Sans({ subsets: ['latin'], axes: ['wdth'], display: 'swap' });

const GENERIC_FAMILIES = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'];

/**
 * A font's family list with every name quoted. Storybook's next/font returns names unquoted
 * (`Source Sans 3`), and an unquoted name with a word starting with a digit is invalid CSS, which
 * drops the whole font-family declaration. Next.js already quotes them; those pass through.
 * @param {{ style: { fontFamily: string } }} font - A next/font font
 * @returns {string} The CSS font-family list
 */
export const cssFontFamily = (font: { style: { fontFamily: string } }): string =>
  font.style.fontFamily
    .split(',')
    .map((name) => name.trim())
    .map((name) => (/^['"]/.test(name) || GENERIC_FAMILIES.includes(name) ? name : `'${name}'`))
    .join(', ');

/**
 * CSS custom properties for the fonts. The type tokens use the SPP ones; the USO components use
 * `font-family: var(--font-poppins)` and `font-family: var(--font-open-sans); font-stretch: 75%`.
 */
export const fontVariablesCss = `:root {
  --font-source-sans: ${cssFontFamily(sourceSans)};
  --font-space-grotesk: ${cssFontFamily(spaceGrotesk)};
  --font-roboto-mono: ${cssFontFamily(robotoMono)};
  --font-poppins: ${cssFontFamily(poppins)};
  --font-open-sans: ${cssFontFamily(openSans)};
}`;
