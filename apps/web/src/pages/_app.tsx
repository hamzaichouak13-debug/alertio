// ─────────────────────────────────────────────
// ALERTIO — pages/_app.tsx
// ─────────────────────────────────────────────

import type { AppProps } from "next/app";
import Head              from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0E0F11" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
