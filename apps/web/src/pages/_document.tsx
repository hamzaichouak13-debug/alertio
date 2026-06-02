// ─────────────────────────────────────────────
// ALERTIO — pages/_document.tsx
// ─────────────────────────────────────────────

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="application-name"      content="Alertio" />
        <meta name="description"           content="Alertes emploi en temps réel avec matching intelligent par code ROME" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable"   content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"     content="Alertio" />
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Alertio" />
        <meta property="og:description" content="Offres d'emploi fraîches, matchées en temps réel" />
        <meta property="og:site_name"   content="Alertio" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
