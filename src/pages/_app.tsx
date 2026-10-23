import { JSX } from 'react';
import type { AppProps } from 'next/app';
import { I18nProvider } from 'next-localization';
import Bootstrap from 'src/Bootstrap';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import scConfig from 'sitecore.config';
import { cssFontFamily, openSans, poppins, robotoMono, sourceSans, spaceGrotesk } from 'lib/fonts';
import '../styles/main.scss';

function App({ Component, pageProps }: AppProps<SitecorePageProps>): JSX.Element {
  const { dictionary, ...rest } = pageProps;

  return (
    <>
      {/* styled-jsx only interpolates values, so the font families are set one by one */}
      <style jsx global>{`
        :root {
          --font-source-sans: ${cssFontFamily(sourceSans)};
          --font-space-grotesk: ${cssFontFamily(spaceGrotesk)};
          --font-roboto-mono: ${cssFontFamily(robotoMono)};
          --font-poppins: ${cssFontFamily(poppins)};
          --font-open-sans: ${cssFontFamily(openSans)};
        }
      `}</style>
      <Bootstrap {...pageProps} />
      {/*
        // Use the next-localization (w/ rosetta) library to provide our translation dictionary to the app.
        // Note Next.js does not (currently) provide anything for translation, only i18n routing.
        // If your app is not multilingual, next-localization and references to it can be removed.
      */}
      <I18nProvider
        lngDict={dictionary}
        locale={pageProps.page?.locale || scConfig.defaultLanguage}
      >
        <Component {...rest} />
      </I18nProvider>
    </>
  );
}

export default App;
