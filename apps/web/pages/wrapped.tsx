/* eslint-disable @next/next/no-img-element */
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";
import { Panel } from "../components/Layout";
import { MiniAvatar } from "../components/MiniAvatar";
import { avatarUrl } from "../utils/cdn";
import { formatDate, formatDuration, plural } from "../utils/format";
import {
  computeWrapped,
  defaultWrappedYear,
  MONTHS,
  WrappedAvatar,
  WrappedStats,
  WrappedUsername,
  wrappedYears,
} from "../utils/wrapped";
import { renderWrappedCard } from "../utils/wrappedCard";
import type { WrappedRank } from "./api/wrapped/rank";

interface Props {
  session: Session | null;
  guildInvite: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  return {
    props: {
      session: session ? JSON.parse(JSON.stringify(session)) : null,
      guildInvite: process.env.GUILD_INVITE ?? "",
    },
  };
};

const Wrapped: NextPage<Props> = ({ guildInvite }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<{ avatars: WrappedAvatar[]; usernames: WrappedUsername[] } | null>(null);
  const [error, setError] = useState(false);
  const [rank, setRank] = useState<WrappedRank | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([axios.get(`/api/avatars/`), axios.get(`/api/usernames/`)])
      .then(([avatars, usernames]) => setHistory({ avatars: avatars.data, usernames: usernames.data }))
      .catch(() => setError(true));
  }, [session]);

  const years = useMemo(
    () => (history ? wrappedYears(history.avatars, history.usernames) : []),
    [history]
  );
  const requested = Number(router.query.year);
  const year = years.includes(requested) ? requested : defaultWrappedYear(years);
  const stats = useMemo(
    () => (history ? computeWrapped(year, history.avatars, history.usernames) : null),
    [history, year]
  );

  useEffect(() => {
    if (!session) return;
    setRank(null);
    axios.get(`/api/wrapped/rank`, { params: { year } }).then((resp) => setRank(resp.data), () => {});
  }, [session, year]);

  return (
    <Panel pageKey={"wrapped"}>
      <Head>
        <title>{`Discord Wrapped ${year} - Your year in pfps | avatarhistory`}</title>
        <meta
          name="description"
          content="Your Discord year in review: every pfp and username you had this year, your pfp of the year and a shareable recap card."
        />
      </Head>
      {!session ? (
        <SignedOut year={year} />
      ) : error ? (
        <div className={"empty"} role={"alert"}>
          <span className={"empty-icon"}>⚠️</span>
          <p>Your history could not be loaded.</p>
          <button className={"btn btn-small"} onClick={() => router.reload()}>Try again</button>
        </div>
      ) : !stats ? (
        <div className={"spinner"} role={"status"} aria-label={"Loading your Wrapped"} />
      ) : (
        <WrappedView
          stats={stats}
          years={years}
          name={session.user?.name ?? "My"}
          rank={rank?.year == year ? rank : null}
          guildInvite={guildInvite}
          onYear={(y) => router.replace({ query: { year: y } }, undefined, { shallow: true })}
        />
      )}
    </Panel>
  );
};
export default Wrapped;

function SignedOut({ year }: { year: number }) {
  return (
    <section className={"wrapped-hero"}>
      <span className={"eyebrow"}>✨ Wrapped {year}</span>
      <h1>
        Your year in <span className={"gradient-text"}>pfps</span>
      </h1>
      <p className={"lead"}>
        Every avatar and username you had in {year}, your pfp of the year, your Discord persona and a recap card to
        share with your friends.
      </p>
      <div className={"hero-actions"}>
        <button className={"btn btn-primary"} onClick={() => signIn("discord", { callbackUrl: "/wrapped" })}>
          Sign in to see your Wrapped
        </button>
      </div>
    </section>
  );
}

// keeps the round placeholder background instead of a broken image icon
const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const image = e.currentTarget;
  if (image.src == BLANK) return;
  image.alt = "";
  image.src = BLANK;
};

export function WrappedView({
  stats,
  years,
  name,
  rank,
  guildInvite,
  onYear,
}: {
  stats: WrappedStats;
  years: number[];
  name: string;
  rank: WrappedRank | null;
  guildInvite: string;
  onYear: (year: number) => void;
}) {
  const empty = stats.avatars.length == 0 && stats.usernames.length == 0 && !stats.first;
  const maxMonth = Math.max(1, ...stats.monthly);
  const showGlowup = !!stats.first && !!stats.last && stats.first.id != stats.last.id;
  const smallCards = [showGlowup, !!stats.shortest, rank?.beatenPercent != null].filter(Boolean).length;
  let card = 0;
  const next = () => ({ "--i": card++ }) as React.CSSProperties;

  return (
    <>
      <section className={"wrapped-hero"}>
        <span className={"eyebrow"}>✨ Wrapped</span>
        <h1>
          Your <span className={"gradient-text"}>{stats.year}</span> in pfps
        </h1>
        {years.length > 1 && (
          <div className={"year-switch"} role={"tablist"} aria-label={"Year"}>
            {years.map((y) => (
              <button
                key={y}
                role={"tab"}
                aria-selected={y == stats.year}
                className={"btn btn-small" + (y == stats.year ? " btn-primary" : "")}
                onClick={() => onYear(y)}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </section>

      {empty ? (
        <div className={"empty"}>
          <span className={"empty-icon"}>🕰️</span>
          <p>Nothing was recorded for you in {stats.year}. Tracking only runs while you&apos;re on the server.</p>
          {guildInvite && (
            <a className={"btn btn-small"} href={guildInvite} target={"_blank"} rel={"noreferrer"}>
              Join the server ↗
            </a>
          )}
        </div>
      ) : (
        <div className={"wrapped-grid"}>
          <div className={"wrapped-card big"} style={next()}>
            <span className={"wrapped-label"}>This year you wore</span>
            <strong className={"wrapped-number gradient-text"}>{stats.avatars.length}</strong>
            <span className={"wrapped-sub"}>
              new {stats.avatars.length == 1 ? "pfp" : "pfps"} and {plural(stats.usernames.length, "new username")}
            </span>
          </div>

          <div className={"wrapped-card persona"} style={next()}>
            <span className={"wrapped-emoji"} aria-hidden>{stats.persona.emoji}</span>
            <span className={"wrapped-label"}>Your persona</span>
            <strong className={"wrapped-title"}>{stats.persona.title}</strong>
            <span className={"wrapped-sub"}>{stats.persona.text}</span>
          </div>

          {stats.pfpOfTheYear && (
            <div className={"wrapped-card feature-pfp"} style={next()}>
              <span className={"wrapped-label"}>🏆 Pfp of the year</span>
              <img
                className={"wrapped-pfp"}
                src={avatarUrl(stats.pfpOfTheYear.avatar.userId, stats.pfpOfTheYear.avatar.id)}
                alt={""}
                onError={hideBroken}
              />
              <span className={"wrapped-sub"}>
                Worn for <b>{formatDuration(stats.pfpOfTheYear.ms)}</b>
              </span>
            </div>
          )}

          <div className={"wrapped-card months"} style={next()}>
            <span className={"wrapped-label"}>Pfp changes per month</span>
            <div className={"month-bars"}>
              {stats.monthly.map((count, month) => (
                <div
                  key={month}
                  className={"month-bar" + (month == stats.busiestMonth ? " top" : "")}
                  title={`${MONTHS[month]}: ${plural(count, "new pfp")}`}
                >
                  <span style={{ "--h": count / maxMonth } as React.CSSProperties} />
                  <small>{MONTHS[month][0]}</small>
                </div>
              ))}
            </div>
            <span className={"wrapped-sub"}>
              {stats.busiestMonth != null ? (
                <>
                  Busiest month: <b>{MONTHS[stats.busiestMonth]}</b>
                </>
              ) : (
                "No new pfps this year"
              )}
            </span>
          </div>

          {showGlowup && stats.first && stats.last && (
            <div className={"wrapped-card glowup"} style={next()}>
              <span className={"wrapped-label"}>✨ The glow up</span>
              <div className={"glowup-pair"}>
                <figure>
                  <MiniAvatar userId={stats.first.userId} avatarId={stats.first.id} />
                  <figcaption>start of {stats.year}</figcaption>
                </figure>
                <span className={"glowup-arrow"} aria-hidden>→</span>
                <figure>
                  <MiniAvatar userId={stats.last.userId} avatarId={stats.last.id} />
                  <figcaption>{stats.year == new Date().getFullYear() ? "now" : `end of ${stats.year}`}</figcaption>
                </figure>
              </div>
            </div>
          )}

          {stats.shortest && (
            <div className={"wrapped-card"} style={next()}>
              <span className={"wrapped-label"}>⚡ Speedrun</span>
              <div className={"wrapped-row"}>
                <MiniAvatar userId={stats.shortest.avatar.userId} avatarId={stats.shortest.avatar.id} />
                <span className={"wrapped-sub"}>
                  Gone after just <b>{formatDuration(stats.shortest.ms)}</b>
                </span>
              </div>
            </div>
          )}

          {rank?.beatenPercent != null && (
            // the pfp of the year leaves two slots next to it, a third small card gets its own row
            <div className={"wrapped-card" + (smallCards > 2 && stats.pfpOfTheYear ? " wide" : "")} style={next()}>
              <span className={"wrapped-label"}>📈 Compared to everyone</span>
              <strong className={"wrapped-title gradient-text"}>
                Top {Math.max(1, 100 - rank.beatenPercent)}%
              </strong>
              <span className={"wrapped-sub"}>
                You changed your pfp more often than {rank.beatenPercent}% of {rank.trackedUsers} tracked users.
              </span>
            </div>
          )}

          {stats.avatars.length > 0 && (
            <div className={"wrapped-card wide"} style={next()}>
              <span className={"wrapped-label"}>Every pfp of {stats.year}</span>
              <div className={"wrapped-collage"}>
                {stats.avatars.map((avatar, i) => (
                  <img
                    key={avatar.id}
                    src={avatarUrl(avatar.userId, avatar.id)}
                    alt={""}
                    title={formatDate(avatar.createdAt)}
                    loading={"lazy"}
                    onError={hideBroken}
                    style={{ "--j": i } as React.CSSProperties}
                  />
                ))}
              </div>
            </div>
          )}

          {stats.usernames.length > 0 && (
            <div className={"wrapped-card wide"} style={next()}>
              <span className={"wrapped-label"}>Names you went by</span>
              <div className={"wrapped-names"}>
                {stats.usernames.map((username) => (
                  <span key={username.id} title={formatDate(username.createdAt)}>{username.value}</span>
                ))}
              </div>
            </div>
          )}

          <ShareCard stats={stats} name={name} beatenPercent={rank?.beatenPercent ?? null} style={next()} />
        </div>
      )}
    </>
  );
}

function ShareCard({
  stats,
  name,
  beatenPercent,
  style,
}: {
  stats: WrappedStats;
  name: string;
  beatenPercent: number | null;
  style: React.CSSProperties;
}) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setImage(null);
    setFailed(false);
    renderWrappedCard(stats, name, beatenPercent, window.location.host)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [stats, name, beatenPercent]);

  const fileName = `avatarhistory-wrapped-${stats.year}.png`;
  const file = image && new File([image.blob], fileName, { type: "image/png" });
  const canShare = !!file && typeof navigator != "undefined" && !!navigator.canShare?.({ files: [file] });

  return (
    <div className={"wrapped-card wide share"} style={style}>
      <div className={"share-text"}>
        <span className={"wrapped-label"}>📤 Share your Wrapped</span>
        <strong className={"wrapped-title"}>Show off your year</strong>
        <span className={"wrapped-sub"}>
          Post your recap card in your server, your story or on X and let your friends find out what their year
          looked like.
        </span>
        <div className={"hero-actions"}>
          {image ? (
            <>
              <a className={"btn btn-primary"} href={image.url} download={fileName}>
                Download image
              </a>
              {canShare && (
                <button
                  className={"btn"}
                  onClick={() =>
                    navigator
                      .share({ files: [file!], text: `My ${stats.year} in pfps`, url: window.location.origin })
                      .catch(() => {})
                  }
                >
                  Share…
                </button>
              )}
            </>
          ) : failed ? (
            <span className={"wrapped-sub"}>The image could not be created. Try reloading the page.</span>
          ) : (
            <span className={"wrapped-sub"}>Rendering your card…</span>
          )}
        </div>
      </div>
      <div className={"share-preview"}>
        {image ? <img src={image.url} alt={"Your Wrapped share card"} /> : <div className={"spinner"} />}
      </div>
    </div>
  );
}
