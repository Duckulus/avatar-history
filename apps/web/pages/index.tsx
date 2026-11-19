/* eslint-disable @next/next/no-img-element */
import type {NextPage} from "next";
import Link from "next/link";
import {useRouter} from "next/router";
import {signIn, useSession} from "next-auth/react";
import axios from "axios";
import {useEffect, useState} from "react";
import {Avatar, Username} from "@prisma/client";
import {APIGuild} from "discord-api-types/v10";
import {Layout, Panel} from "../components/Layout";
import {AvatarGrid} from "../components/AvatarGrid";
import {UsernameTimeline} from "../components/UsernameTimeline";
import {avatarUrl} from "../utils/cdn";

type Tab = "home" | "avatars" | "usernames";
const POLL_INTERVAL = 10_000;

const Home: NextPage = () => {
  const {data: session} = useSession();
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [usernames, setUsernames] = useState<Username[]>([]);
  const [inGuild, setInGuild] = useState<boolean | null>(null);

  const requested = router.query.tab;
  const tab: Tab =
      session && (requested == "avatars" || requested == "usernames")
          ? requested
          : "home";

  useEffect(() => {
    if (!session) return;
    const fetchHistory = () => {
      axios.get(`/api/avatars/`).then((resp) => setAvatars(resp.data));
      axios.get(`/api/usernames/`).then((resp) => setUsernames(resp.data));
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    if (!session || inGuild != null) return;
    axios.get(`/api/guilds/`).then((resp) => {
      const guilds = resp.data as APIGuild[];
      setInGuild(guilds.some((guild) => guild.id == process.env.GUILD_ID));
    });
  }, [session, inGuild]);

  return (
      <Layout active={tab}>
        <Panel pageKey={tab}>
          {inGuild == false && <GuildWarning/>}
          {tab == "home" ? (
              <HomeContent
                  name={session?.user?.name ?? null}
                  avatars={avatars}
                  image={session?.user?.image ?? null}
              />
          ) : tab == "avatars" ? (
              <>
                <div className={"section-head"}>
                  <h2>Your <span className={"gradient-text"}>avatars</span></h2>
                  <span className={"count"}>{avatars.length} archived</span>
                </div>
                <AvatarGrid avatars={avatars}/>
              </>
          ) : (
              <>
                <div className={"section-head"}>
                  <h2>Your <span className={"gradient-text"}>usernames</span></h2>
                  <span className={"count"}>{usernames.length} archived</span>
                </div>
                <UsernameTimeline usernames={usernames}/>
              </>
          )}
        </Panel>
      </Layout>
  );
};
export default Home;

function HomeContent({
                       name,
                       avatars,
                       image,
                     }: {
  name: string | null;
  avatars: Avatar[];
  image: string | null;
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
                  </>
              ) : (
                  <button className={"btn btn-primary"} onClick={() => signIn("discord")}>
                    Sign in with Discord
                  </button>
              )}
              <a className={"btn"} href={process.env.GUILD_INVITE} target={"_blank"} rel={"noreferrer"}>
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
            background: avatar ? undefined : `hsl(${250 + i * 30} 90% 65%)`,
          } as React.CSSProperties;
          return (
              <div key={i} className={"orbit-item"} style={style}>
                {avatar && <img src={avatarUrl(avatar.userId, avatar.id)} alt={""}/>}
              </div>
          );
        })}
      </div>
  );
}

function GuildWarning() {
  return (
      <div className={"callout danger"}>
        <span>🚨</span>
        <p>
          To ensure your avatars and usernames are properly tracked, please make sure you&apos;ve joined
          our Discord server. If you&apos;ve already joined, you can safely ignore this message.{" "}
          <a rel="noreferrer" href={process.env.GUILD_INVITE} target="_blank">Join the server</a>
        </p>
      </div>
  );
}
