import {DocumentProps, Head, Html, Main, NextScript} from "next/document";

// WEB_URL may or may not end with a slash
const WEB_URL = (process.env.WEB_URL ?? "").replace(/\/+$/, "");
const DESCRIPTION =
    "View your full Discord pfp and username history in one place! Fast, easy, and open-source. Just log in and explore your profile timeline.";

// Pages that set their own description and link preview tags. Crawlers take
// the first og:image, so the defaults must not be rendered for them at all.
const OWN_META_PAGES = ["/w/[id]"];

export default function Document(props: DocumentProps) {
  const defaults = !OWN_META_PAGES.includes(props.__NEXT_DATA__.page);
  return (
      <Html>
        <Head>
          <meta
              name="google-site-verification"
              content={process.env.GOOGLE_VERIFICATION_ID}
          />
          {defaults && <>
          <meta name="theme-color" content="#0b0a1a"/>
          <meta name="description" content={DESCRIPTION}/>
          <meta name="keywords" content="Discord pfp history, Discord avatar history, Discord username history, Discord profile tracker, Discord Profile Pic History, Discord old profile pictures" />
          <meta property="og:type" content="website"/>
          <meta property="og:site_name" content="avatarhistory"/>
          <meta property="og:title" content="Discord Avatar History"/>
          <meta property="og:description" content={DESCRIPTION}/>
          {WEB_URL && <meta property="og:url" content={`${WEB_URL}/`}/>}
          {/* generated from assets/og-image.svg */}
          <meta property="og:image" content={`${WEB_URL}/og-image.png`}/>
          <meta property="og:image:width" content="1200"/>
          <meta property="og:image:height" content="630"/>
          <meta property="og:image:alt" content="avatarhistory - every pfp and username you've ever had, in one place"/>
          <meta name="twitter:card" content="summary_large_image"/>
          <meta name="twitter:title" content="Discord Avatar History"/>
          <meta name="twitter:description" content={DESCRIPTION}/>
          <meta name="twitter:image" content={`${WEB_URL}/og-image.png`}/>
          </>}
        </Head>
        <body>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  );
}
