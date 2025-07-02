import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="canonical" href="https://xquests.site" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* SEO & Best Practice Meta Tags */}
        <meta name="description" content="Tweet. Engage. Earn." />
        <meta name="keywords" content="XQuests, tweet, engage, earn" />
        <meta name="author" content="XQuests" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:title" content="XQuests" />
        <meta property="og:description" content="Tweet. Engage. Earn." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xquests.site" />
        <meta property="og:image" content="/assets/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="XQuests" />
        <meta name="twitter:description" content="Tweet. Engage. Earn." />
        <meta name="twitter:image" content="/assets/images/twitter-image.png" />
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}
