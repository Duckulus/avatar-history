import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { Panel } from "../../components/Layout";
import { WrappedView } from "../wrapped";
import { loadSharedWrapped, SharedWrapped } from "../../utils/sharedWrapped";
import { plural } from "../../utils/format";

interface Props {
  shared: SharedWrapped;
  guildInvite: string;
  site: string;
}

// Public, read-only view of a Wrapped its owner shared. The default og tags in
// _document are skipped for this page (see SHARE_PAGE there).
export const getServerSideProps: GetServerSideProps<Props> = async ({ params, res }) => {
  const shared = await loadSharedWrapped(String(params?.id));
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

const SharedWrappedPage: NextPage<Props> = ({ shared, guildInvite, site }) => {
  const { stats, name, rank } = shared;
  const title = `${name}'s ${stats.year} in pfps | avatarhistory Wrapped`;
  const description =
    `${plural(stats.avatars.length, "new pfp")} · ${stats.persona.title}` +
    (rank.beatenPercent != null ? ` · Top ${Math.max(1, 100 - rank.beatenPercent)}% of all members` : "") +
    ". See your own Discord Wrapped on avatarhistory.";
  const image = `${site}/api/wrapped/og/${shared.id}.png`;

  return (
    <Panel pageKey={"shared-wrapped"}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="robots" content="noindex" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="avatarhistory" />
        <meta property="og:title" content={`${name}'s ${stats.year} Wrapped`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${site}/w/${shared.id}`} />
        <meta property="og:image" content={image} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={image} />
        <meta name="theme-color" content="#8c84e0" />
      </Head>
      <WrappedView
        stats={stats}
        years={[stats.year]}
        name={name}
        owner={name}
        rank={rank}
        guildInvite={guildInvite}
        onYear={() => {}}
      />
    </Panel>
  );
};

export default SharedWrappedPage;
