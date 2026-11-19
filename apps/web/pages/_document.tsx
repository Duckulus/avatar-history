import {Head, Html, Main, NextScript} from "next/document";

export default function Document() {
  return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin=""/>
          <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
              rel="stylesheet"
          />
          <meta name="theme-color" content="#0b0a1a"/>
          <meta
              name="google-site-verification"
              content={process.env.GOOGLE_VERIFICATION_ID}
          />
          <meta
              name="description"
              content="View your full Discord pfp and username history in one place! Fast, easy, and open-source. Just log in and explore your profile timeline."
          />
          <meta name="keywords" content="Discord pfp history, Discord avatar history, Discord username history, Discord profile tracker, Discord Profile Pic History, Discord old profile pictures" />
          <meta property="og:title" content="Discord Avatar History" />
          <meta
              property="og:description"
              content="View your full Discord pfp and username history in one place! Fast, easy, and open-source. Just log in and explore your profile timeline."
          />
          <meta
              property="og:image"
              content={`${process.env.WEB_URL}/apple-touch-icon.png`}
          />
        </Head>
        <body>
        <Main/>
        <NextScript/>
        </body>
      </Html>
  );
}
