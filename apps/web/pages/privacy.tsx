import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Panel } from "../components/Layout";
import { getOperatorProps, LEGAL_UPDATED, Operator } from "../utils/legal";
import { Missing, OperatorBlock } from "../components/Legal";

export const getServerSideProps = getOperatorProps;

const Privacy: NextPage<{ operator: Operator }> = ({ operator }) => {
  const contact = operator.email ? (
    <a href={`mailto:${operator.email}`}>{operator.email}</a>
  ) : (
    <Missing what={"LEGAL_EMAIL"} />
  );

  return (
    <Panel pageKey={"privacy"}>
      <Head>
        <title>Privacy Policy | avatarhistory</title>
        <meta name="description" content="How avatarhistory collects, uses and stores your Discord data." />
      </Head>
      <article className={"legal"}>
        <span className={"eyebrow"}>Legal</span>
        <h1>Privacy Policy</h1>
        <p className={"legal-updated"}>Last updated: {LEGAL_UPDATED}</p>

        <p>
          avatarhistory (&quot;we&quot;, &quot;us&quot;) archives the Discord avatars and usernames of the members of
          our Discord server and lets people view them on this website and through our Discord app. This policy
          explains which personal data we process, why, and what rights you have under the EU General Data
          Protection Regulation (GDPR).
        </p>

        <h2>1. Who is responsible</h2>
        <p>The controller responsible for data processing on this website and in the Discord app is:</p>
        <OperatorBlock operator={operator} />
        <p>For any privacy request, contact us at {contact}.</p>

        <h2>2. Data we collect about server members</h2>
        <p>
          While you are a member of our Discord server, our bot regularly reads the public profile data Discord
          provides for server members and stores:
        </p>
        <ul>
          <li>your Discord user ID,</li>
          <li>every avatar (profile picture) you use, as an image file together with its Discord avatar ID,</li>
          <li>every username you use,</li>
          <li>the time each avatar and username was first recorded.</li>
        </ul>
        <p>
          Recording starts when you join the server and stops when you leave it. Avatars and usernames you used
          before joining are not collected. When you join, the bot also posts a welcome message in the server that
          mentions you and shows your current avatar.
        </p>
        <p>
          <b>Purpose and legal basis:</b> providing the archive that is the purpose of the server (Art. 6(1)(f)
          GDPR, legitimate interest). Joining the server is voluntary, and the server explains that it exists to
          track avatar and username history.
        </p>

        <h2>3. Who can see archived data</h2>
        <ul>
          <li>
            <b>Discord app:</b> anyone who uses our app&apos;s commands (for example <code>/avatars</code> or{" "}
            <code>/usernames</code>) can look up the archived avatars and usernames of any user, in our server or,
            if they added the app to their account, in other servers and direct messages. The responses are
            visible to the people in that channel.
          </li>
          <li>
            <b>Image files:</b> archived avatar images are served from our content delivery server under a URL that
            contains your user ID and the avatar ID. Anyone who knows such a URL can open the image.
          </li>
          <li>
            <b>Website:</b> when signed in, you can only see your own history, your yearly Wrapped and a ranking
            computed from the anonymous number of avatar changes of all users.
          </li>
          <li>
            <b>Administrators:</b> a small number of administrators can view any user&apos;s history in an admin
            panel and hide avatars from the website and the app, for example to remove inappropriate content.
          </li>
        </ul>

        <h2>4. Signing in on the website</h2>
        <p>
          You can sign in with your Discord account (Discord OAuth2, scopes <code>identify</code> and{" "}
          <code>guilds</code>). We then store:
        </p>
        <ul>
          <li>your Discord user ID, display name and the URL of your current avatar,</li>
          <li>the access and refresh tokens Discord issues for your sign-in,</li>
          <li>a session record that keeps you signed in.</li>
        </ul>
        <p>
          With the <code>guilds</code> scope we fetch the list of servers you are in, only to check whether you are
          a member of our server and show a hint if you are not. The list is not stored. We do not request your
          email address.
        </p>
        <p>
          <b>Legal basis:</b> providing the service you requested (Art. 6(1)(b) GDPR).
        </p>

        <h2>5. Cookies and local processing</h2>
        <p>
          We only use cookies that are strictly necessary for signing in: a session cookie, a CSRF protection
          cookie and a cookie that remembers which page to return to after signing in. We do not use analytics,
          advertising or tracking cookies, and we do not embed third-party trackers. Fonts are served from our own
          server.
        </p>
        <p>
          Your Wrapped and its share image are computed and drawn in your browser. The image is only saved or
          shared if you choose to download or share it.
        </p>

        <h2>6. Using our Discord app</h2>
        <p>
          When you use a command, Discord sends us the interaction, including your user ID, username and the
          options you chose. We use this to answer the command and write a short entry to our server logs (who ran
          which command with which options), which we use to keep the service running and to prevent abuse
          (Art. 6(1)(f) GDPR).
        </p>

        <h2>7. Server logs</h2>
        <p>
          Like any web server, our servers process your IP address and technical request data (time, requested
          page, browser) to deliver the website and the avatar images and to keep them secure (Art. 6(1)(f) GDPR).
          This data is not combined with other data and is only kept as long as needed for operation and
          security.
        </p>

        <h2>8. Recipients and hosting</h2>
        <ul>
          <li>
            <b>Discord</b> (Discord Inc., USA) is the source of the archived data and handles sign-in. Discord&apos;s
            own <a href={"https://discord.com/privacy"} target={"_blank"} rel={"noreferrer"}>privacy policy</a>{" "}
            applies to your use of Discord.
          </li>
          <li>
            <b>Hosting:</b>{" "}
            {operator.hosting || <Missing what={"LEGAL_HOSTING"} />}. The hosting provider processes data on our
            behalf.
          </li>
        </ul>
        <p>We do not sell your data or share it with anyone else.</p>

        <h2>9. How long we keep data</h2>
        <ul>
          <li>
            Archived avatars and usernames are kept for as long as the service runs, also after you leave the
            server, because keeping your history is the purpose of the service. You can ask us to delete them at
            any time.
          </li>
          <li>Sessions expire after 30 days of inactivity or when you sign out.</li>
          <li>Your sign-in account record and Discord tokens are kept until you ask us to delete them.</li>
        </ul>

        <h2>10. Your rights</h2>
        <p>Under the GDPR you have the right to:</p>
        <ul>
          <li>access the data we hold about you (Art. 15),</li>
          <li>have incorrect data corrected (Art. 16),</li>
          <li>have your data deleted (Art. 17),</li>
          <li>restrict processing (Art. 18),</li>
          <li>receive your data in a portable format (Art. 20); you can also download all your avatars as a ZIP on this website,</li>
          <li>
            <b>object</b> to processing based on legitimate interest (Art. 21). To stop new data being recorded,
            you can also simply leave our Discord server.
          </li>
        </ul>
        <p>
          To exercise these rights, contact {contact} from or mentioning your Discord account so we can verify it is
          yours. You also have the right to lodge a complaint with a data protection supervisory authority, in
          particular in the EU member state where you live.
        </p>

        <h2>11. Children</h2>
        <p>
          Our service is only meant for people who are allowed to use Discord under Discord&apos;s terms and the law of
          their country.
        </p>

        <h2>12. Changes</h2>
        <p>
          We may update this policy when the service changes. The date at the top shows the latest version. See
          also our <Link href={"/terms"}>Terms of Service</Link>.
        </p>
      </article>
    </Panel>
  );
};

export default Privacy;
