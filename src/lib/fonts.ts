import { Open_Sans, Poppins } from 'next/font/google';

// Web fonts from the USO designs: Poppins (headings, body) and Open Sans Condensed
// (eyebrows, buttons), which is the Open Sans variable font at a narrow width.
export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const openSans = Open_Sans({ subsets: ['latin'], axes: ['wdth'], display: 'swap' });

/**
 * CSS custom properties components use to reference the fonts:
 * `font-family: var(--font-poppins)` and `font-family: var(--font-open-sans); font-stretch: 75%`.
 */
export const fontVariablesCss = `:root {
  --font-poppins: ${poppins.style.fontFamily};
  --font-open-sans: ${openSans.style.fontFamily};
}`;
