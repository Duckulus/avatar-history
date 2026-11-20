import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Panel } from "../components/Layout";
import { getOperatorProps, LEGAL_UPDATED, Operator } from "../utils/legal";
import { Missing, OperatorBlock } from "../components/Legal";

export const getServerSideProps = getOperatorProps;

const Terms: NextPage<{ operator: Operator }> = ({ operator }) => {
  return (
    <Panel pageKey={"terms"}>
      <Head>
        <title>Terms of Service | avatarhistory</title>
        <meta name="description" content="The terms for using the avatarhistory website and Discord app." />
      </Head>
      <article className={"legal"}>
        <span className={"eyebrow"}>Legal</span>
        <h1>Terms of Service</h1>
        <p className={"legal-updated"}>Last updated: {LEGAL_UPDATED}</p>

        <p>
          These terms apply to the avatarhistory website{operator.site ? ` (${operator.site})` : ""}, our Discord
          server and our Discord app (together, the &quot;service&quot;). By using the service you agree to them. If
          you do not agree, please do not use the service.
        </p>

        <h2>1. Who we are</h2>
        <p>The service is a free, non-commercial hobby project operated by:</p>
        <OperatorBlock operator={operator} />
        <p>avatarhistory is not affiliated with, endorsed by or sponsored by Discord Inc.</p>

        <h2>2. What the service does</h2>
        <p>
          While you are a member of our Discord server, we archive the avatars and usernames you use on Discord.
          You can view your history on the website after signing in with Discord, and anyone can look up archived
          histories with our Discord app. Details about the data we process are in our{" "}
          <Link href={"/privacy"}>Privacy Policy</Link>.
        </p>

        <h2>3. Who may use it</h2>
        <p>
          You may only use the service if you are allowed to use Discord under{" "}
          <a href={"https://discord.com/terms"} target={"_blank"} rel={"noreferrer"}>
            Discord&apos;s Terms of Service
          </a>{" "}
          and the law of your country. Your use of Discord itself is governed by Discord&apos;s terms.
        </p>

        <h2>4. Acceptable use</h2>
        <p>You agree not to use the service to:</p>
        <ul>
          <li>harass, stalk, threaten, dox or impersonate anyone, for example by tracking someone&apos;s old avatars or names to expose them,</li>
          <li>collect, scrape or bulk-download other people&apos;s data, or build a database of other users from the service,</li>
          <li>overload, attack or disrupt the service, or try to access data or admin functions you are not allowed to access,</li>
          <li>break the law or Discord&apos;s terms or community guidelines.</li>
        </ul>
        <p>
          We may hide content, restrict access to the service or remove users from our server if they break these
          terms.
        </p>

        <h2>5. Your content</h2>
        <p>
          Your avatars and usernames remain yours. By being a member of our server you allow us to store copies of
          them and show them through the service as described in these terms and the privacy policy, for as long as
          they are archived. You can ask us to delete your archived data at any time (see the privacy policy).
          Do not use avatars or usernames you have no rights to.
        </p>

        <h2>6. Availability</h2>
        <p>
          The service is provided free of charge and &quot;as is&quot;. We do our best to keep it running and to
          record every change, but we cannot guarantee that it is always available, complete or free of errors. We
          may change, pause or discontinue the service or individual features at any time. Archived data may be lost,
          so keep your own copies of anything important; the website lets you download your avatars as a ZIP.
        </p>

        <h2>7. Liability</h2>
        <p>
          We are liable without limitation for damage caused intentionally or through gross negligence, for injury
          to life, body or health, and where mandatory law requires it. Otherwise, since the service is provided
          free of charge, we are not liable for slight negligence.
        </p>

        <h2>8. Changes to these terms</h2>
        <p>
          We may update these terms. The date at the top shows the latest version. If you keep using the service after
          a change, the updated terms apply.
        </p>

        <h2>9. Governing law</h2>
        <p>
          These terms are governed by the laws of the Federal Republic of Germany. If you are a consumer living in
          the EU, you keep the protection of the mandatory laws of your country of residence.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms:{" "}
          {operator.email ? <a href={`mailto:${operator.email}`}>{operator.email}</a> : <Missing what={"LEGAL_EMAIL"} />}
        </p>
      </article>
    </Panel>
  );
};

export default Terms;
