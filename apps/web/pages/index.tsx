/* eslint-disable @next/next/no-img-element */
import type {GetServerSideProps, NextPage} from "next";
import Link from "next/link";
import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";
import axios from "axios";
import {useCallback, useEffect, useState} from "react";
import {Avatar, Username} from "@prisma/client";
import {Session} from "next-auth";
import {getServerSession} from "next-auth/next";
import {authOptions} from "./api/auth/[...nextauth]";
import {APIGuild} from "discord-api-types/v10";
import {Panel} from "../components/Layout";
import {AvatarGrid} from "../components/AvatarGrid";
import {UsernameTimeline} from "../components/UsernameTimeline";
import {ProfileStats} from "../components/ProfileStats";
import {HistoryTimeline} from "../components/HistoryTimeline";
import {avatarUrl} from "../utils/cdn";

type Tab = "home" | "avatars" | "usernames" | "timeline";
const POLL_INTERVAL = 10_000;

interface Props {
  guildId: string;
  guildInvite: string;
  session: Session | null;
}

// Rendered on demand so guild settings come from the runtime environment
// instead of being baked into the bundle when the docker image is built.
// The session is loaded here too, otherwise a reload of e.g. /?tab=avatars
// would briefly render the home tab until the client has fetched the session.
export const getServerSideProps: GetServerSideProps<Props> = async ({req, res}) => {
  const session = await getServerSession(req, res, authOptions);
  return {
    props: {
      guildId: process.env.GUILD_ID ?? "",
      guildInvite: process.env.GUILD_INVITE ?? "",
      // props must be JSON serializable (no undefined values)
      session: session ? JSON.parse(JSON.stringify(session)) : null,
    },
  };
};

const Home: NextPage<Props> = ({guildId, guildInvite}) => {
  const {data: session} = useSession();
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[] | null>(null);
  const [usernames, setUsernames] = useState<Username[] | null>(null);
  const [inGuild, setInGuild] = useState<boolean | null>(null);
  // Only relevant while nothing has been loaded yet; a failed poll keeps the old data
  const [loadError, setLoadError] = useState(false);

  const requested = router.query.tab;
  const tab: Tab =
      session && (requested == "avatars" || requested == "usernames" || requested == "timeline")
          ? requested
          : "home";

  const signedIn = !!session;
  const fetchHistory = useCallback(() => {
    if (!signedIn) return;
    Promise.all([axios.get(`/api/avatars/`), axios.get(`/api/usernames/`)])
        .then(([avatarResp, usernameResp]) => {
          setAvatars(avatarResp.data);
          setUsernames(usernameResp.data);
          setLoadError(false);
        })
        .catch(() => setLoadError(true));
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) return;
    fetchHistory();
    const interval = setInterval(fetchHistory, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [signedIn, fetchHistory]);

  const placeholder = (what: string) =>
      loadError ? <LoadError what={what} onRetry={fetchHistory}/> :
          <div className={"spinner"} role={"status"} aria-label={`Loading ${what}`}/>;

  useEffect(() => {
    if (!session || inGuild != null) return;
    axios.get(`/api/guilds/`).then((resp) => {
      const guilds = resp.data as APIGuild[];
      setInGuild(guilds.some((guild) => guild.id == guildId));
    });
  }, [session, inGuild, guildId]);

  return (
        <Panel pageKey={tab}>
          {inGuild == false && <GuildWarning invite={guildInvite}/>}
          {tab == "home" ? (
              <HomeContent
                  name={session?.user?.name ?? null}
                  avatars={avatars ?? []}
                  image={session?.user?.image ?? null}
                  guildInvite={guildInvite}
              />
          ) : tab == "avatars" ? (
              <>
                <div className={"section-head"}>
                  <h2>Your <span className={"gradient-text"}>avatars</span></h2>
                  {avatars && (
                      <div className={"section-actions"}>
                        <span className={"count"}>{avatars.length} archived</span>
                        {avatars.length > 0 && (
                            <a className={"btn btn-small"} href={"/api/avatars/download"} download>
                              Download all (.zip)
                            </a>
                        )}
                      </div>
                  )}
                </div>
                {avatars && usernames ? (
                    <>
                      <ProfileStats avatars={avatars} usernames={usernames}/>
                      <AvatarGrid avatars={avatars}/>
                    </>
                ) : placeholder("avatars")}
              </>
          ) : tab == "timeline" ? (
              <>
                <div className={"section-head"}>
                  <h2>Your <span className={"gradient-text"}>timeline</span></h2>
                </div>
                {avatars && usernames ? <HistoryTimeline avatars={avatars} usernames={usernames}/> : placeholder("history")}
              </>
          ) : (
              <>
                <div className={"section-head"}>
                  <h2>Your <span className={"gradient-text"}>usernames</span></h2>
                  {usernames && <span className={"count"}>{usernames.length} archived</span>}
                </div>
                {usernames ? <UsernameTimeline usernames={usernames}/> : placeholder("usernames")}
              </>
          )}
        </Panel>
  );
};
export default Home;

function HomeContent({
                       name,
                       avatars,
                       image,
                       guildInvite,
                     }: {
  name: string | null;
  avatars: Avatar[];
  image: string | null;
  guildInvite: string;
}) {
  return (
      <>
        <section className={"hero"}>
          <div>
            <span className={"eyebrow"}>Discord profile archive</span>
            <h1>
              {name ? <>Welcome back,<br/></> : <>Every face<br/>you&apos;ve </>}
              <span className={"gradient-text"}>{name ?? "ever worn."}</span>
            </h1>
            <p className={"lead"}>
              {name
                  ? "Your profile timeline is waiting. Jump into your archived avatars and usernames using the bar above."
                  : "Easily explore your Discord avatar and username history - all in one place. Sign in with Discord to get started."}
            </p>
            <div className={"hero-actions"}>
              {name ? (
                  <>
                    <Link className={"btn btn-primary"} href={"/?tab=avatars"} shallow>View avatars</Link>
                    <Link className={"btn"} href={"/?tab=usernames"} shallow>View usernames</Link>
                    <Link className={"btn"} href={"/?tab=timeline"} shallow>View timeline</Link>
                  </>
              ) : (
                  <button className={"btn btn-primary"} onClick={() => signIn("discord")}>
                    Sign in with Discord
                  </button>
              )}
              <a className={"btn"} href={guildInvite} target={"_blank"} rel={"noreferrer"}>
                Join the server ↗
              </a>
            </div>
          </div>
          <Orbit avatars={avatars} image={image}/>
        </section>

        <div className={"features"}>
          <Feature i={0} icon={"🤖"} title={"Tracked automatically"}>
            A Discord bot watches the server and records every new pfp and username.
          </Feature>
          <Feature i={1} icon={"🕰️"} title={"Your full timeline"}>
            Browse every avatar in full resolution, ordered from newest to oldest.
          </Feature>
          <Feature i={2} icon={"🔓"} title={"Open source"}>
            Check out the code on{" "}
            <a target={"_blank"} rel={"noreferrer"} href={"https://github.com/Duckulus/avatar-history"}>
              GitHub
            </a>
            .
          </Feature>
        </div>

        <p className={"footnote"}>
          ⚠️ Tracking begins the moment you join the server. Previous avatars and usernames are{" "}
          <i>not</i> stored or accessible.
        </p>
      </>
  );
}

function Feature({
                   i,
                   icon,
                   title,
                   children,
                 }: React.PropsWithChildren<{ i: number; icon: string; title: string }>) {
  return (
      <div className={"feature"} style={{"--i": i} as React.CSSProperties}>
        <div className={"feature-icon"}>{icon}</div>
        <h3>{title}</h3>
        <p>{children}</p>
      </div>
  );
}

// Decorative orbit. Uses the user's own archived avatars when available.
function Orbit({avatars, image}: { avatars: Avatar[]; image: string | null }) {
  const shown = avatars.slice(0, 6);
  const slots = shown.length > 0 ? shown.length : 5;
  return (
      <div className={"orbit"} aria-hidden>
        <div className={"orbit-ring"}/>
        <div className={"orbit-ring inner"}/>
        <div className={"orbit-core"}>{image && <img src={image} alt={""} onError={(e) => (e.currentTarget.style.display = "none")}/>}</div>
        {Array.from({length: slots}).map((_, i) => {
          const avatar = shown[i];
          const style = {
            "--angle": `${(360 / slots) * i}deg`,
            "--r": i % 2 == 0 ? "150%" : "105%",
            background: `hsl(${250 + i * 25} 35% 58%)`,
          } as React.CSSProperties;
          return (
              <div key={i} className={"orbit-item"} style={style}>
                {avatar && (
                    <img
                        src={avatarUrl(avatar.userId, avatar.id)}
                        alt={""}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                )}
              </div>
          );
        })}
      </div>
  );
}

function LoadError({what, onRetry}: { what: string; onRetry: () => void }) {
  return (
      <div className={"empty"} role={"alert"}>
        <span className={"empty-icon"}>⚠️</span>
        <p>Your {what} could not be loaded. We&apos;ll keep retrying in the background.</p>
        <button className={"btn btn-small"} onClick={onRetry}>Try again</button>
      </div>
  );
}

function GuildWarning({invite}: { invite: string }) {
  return (
      <div className={"callout danger"}>
        <span>🚨</span>
        <p>
          To ensure your avatars and usernames are properly tracked, please make sure you&apos;ve joined
          our Discord server. If you&apos;ve already joined, you can safely ignore this message.{" "}
          <a rel="noreferrer" href={invite} target="_blank">Join the server</a>
        </p>
      </div>
  );
}
