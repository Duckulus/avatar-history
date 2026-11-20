/* eslint-disable @next/next/no-img-element */
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";
import { Panel } from "../../components/Layout";
import { AvatarGrid } from "../../components/AvatarGrid";
import { UsernameTimeline } from "../../components/UsernameTimeline";
import { HistoryTimeline } from "../../components/HistoryTimeline";
import { ProfileStats } from "../../components/ProfileStats";
import { avatarUrl } from "../../utils/cdn";
import { formatDate, plural } from "../../utils/format";
import { loadSharedProfile, SharedProfile } from "../../utils/sharedProfile";

interface Props {
  shared: SharedProfile;
  guildInvite: string;
  site: string;
}

type Tab = "avatars" | "usernames" | "timeline";
const TABS: { key: Tab; label: string }[] = [
  { key: "avatars", label: "Avatars" },
  { key: "usernames", label: "Usernames" },
  { key: "timeline", label: "Timeline" },
];

// Public, read-only view of a profile its owner shared. The default og tags in
// _document are skipped for this page (see OWN_META_PAGES there).
export const getServerSideProps: GetServerSideProps<Props> = async ({ params, res }) => {
  const shared = await loadSharedProfile(String(params?.id));
  if (!shared) return { notFound: true };
  res.setHeader("Cache-Control", "public, max-age=60");
  return {
    props: {
      shared,
      guildInvite: process.env.GUILD_INVITE ?? "",
      site: (process.env.WEB_URL ?? "").replace(/\/+$/, ""),
    },
  };
};

const SharedProfilePage: NextPage<Props> = ({ shared, guildInvite, site }) => {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>("avatars");
  const { name, avatars, usernames } = shared;
  const current = avatars[0];
  const oldest = [...avatars, ...usernames].map((entry) => entry.createdAt).sort()[0];

  const title = `${name}'s pfp history | avatarhistory`;
  const description =
    `${plural(avatars.length, "pfp")} and ${plural(usernames.length, "username")} archived` +
    (oldest ? ` since ${formatDate(oldest)}` : "") +
    ". See your own Discord avatar history on avatarhistory.";
  const image = `${site}/api/profile/og/${shared.id}.png`;

  return (
    <Panel pageKey={"shared-profile"}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
        <meta property="og:type" content="profile" />
        <meta property="og:site_name" content="avatarhistory" />
        <meta property="og:title" content={`${name}'s pfp history`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${site}/u/${shared.id}`} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={image} />
        <meta name="theme-color" content="#8c84e0" />
      </Head>

      <div className={"profile-head"}>
        {current ? (
          <img className={"profile-avatar"} src={avatarUrl(current.userId, current.id)} alt={""} />
        ) : (
          <span className={"profile-avatar"} />
        )}
        <div>
          <span className={"eyebrow"}>Shared profile</span>
          <h2>
            {name}&apos;s <span className={"gradient-text"}>history</span>
          </h2>
          <span className={"count"}>
            {plural(avatars.length, "avatar")} · {plural(usernames.length, "username")}
            {oldest && <> · tracked since {formatDate(oldest)}</>}
          </span>
        </div>
      </div>

      <ProfileStats avatars={avatars} usernames={usernames} />

      <div className={"tabs"} role={"tablist"}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role={"tab"}
            aria-selected={tab == t.key}
            className={"tab" + (tab == t.key ? " active" : "")}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab == "avatars" ? (
        <AvatarGrid avatars={avatars} />
      ) : tab == "usernames" ? (
        <UsernameTimeline usernames={usernames} />
      ) : (
        <HistoryTimeline avatars={avatars} usernames={usernames} />
      )}

      {!session && (
        <div className={"callout get-yours-callout"}>
          <span>✨</span>
          <p>
            avatarhistory archives every pfp and username of the members of our Discord server.{" "}
            <button className={"link-button"} onClick={() => signIn("discord")}>
              Sign in
            </button>{" "}
            to see your own history
            {guildInvite && (
              <>
                , or{" "}
                <a href={guildInvite} target={"_blank"} rel={"noreferrer"}>
                  join the server
                </a>{" "}
                so yours gets tracked
              </>
            )}
            .
          </p>
        </div>
      )}
    </Panel>
  );
};

export default SharedProfilePage;
