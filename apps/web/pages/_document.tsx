import {Head, Html, Main, NextScript} from "next/document";

export default function Document() {
  return (
      <Html>
        <Head>
          <meta
              name="google-site-verification"
              content={process.env.GOOGLE_VERIFICATION_ID}
          />
          <meta
              name="description"
              content="View your full Discord Profile Picture & Username history in one place! Fast, easy, and open-source. Just log in and explore your profile timeline."
          />
          <meta name="keywords" content="Discord avatar history, Discord username history, Discord profile tracker, Discord Profile Pic History, Discord old profile pictures" />
          <meta property="og:title" content="Discord Avatar History" />
          <meta
              property="og:description"
              content="View your full Discord Profile Picture & username history in one place! Fast, easy, and open-source. Just log in and explore your profile timeline."
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
