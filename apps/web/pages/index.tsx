import type {NextPage} from "next";
import {signIn, signOut, useSession} from "next-auth/react";
import axios from "axios";
import {useEffect, useState} from "react";
import {Avatar, Username} from "@prisma/client";
import {NavBar, NavBarButton} from "../components/NavBar";
import {Layout} from "../components/Layout";
import {AvatarList} from "../components/AvatarList";
import {UsernameList} from "../components/UsernameList";
import {APIGuild} from "discord-api-types/v10";
import {useAutoAnimate} from "@formkit/auto-animate/react";

const Home: NextPage = () => {
  const {data: session} = useSession();
  const [page, setPage] = useState("home");
  const [avatars, setAvatars] = useState([] as Avatar[]);
  const [inGuild, setInGuild] = useState(0); // -1 not joined 1 joined 0 fetching TODO think of a better solution
  const [usernames, setUsernames] = useState([] as Username[]);

  const [parent] = useAutoAnimate<HTMLDivElement>({
    easing: "ease-in",
  });

  const fetchAvatars = () => {
    if (session) {
      axios.get(`/api/avatars/`).then((resp) => {
        setAvatars(resp.data);
      });
    }
  };

  const fetchUsernames = () => {
    if (session) {
      axios.get(`/api/usernames/`).then((resp) => {
        setUsernames(resp.data);
      });
    }
  };

  useEffect(() => {
    setTimeout(fetchAvatars, 5000);
  }, [avatars]);

  useEffect(() => {
    setTimeout(fetchUsernames, 5000);
  }, [usernames]);

  useEffect(() => {
    if (session) {
      fetchAvatars();
      fetchUsernames();
      if (inGuild == 0) {
        setInGuild(-2);
        axios.get(`/api/guilds/`).then((resp) => {
          const guilds = resp.data as APIGuild[];
          setInGuild(
              !!guilds.filter((guild) => {
                return guild.id == process.env.GUILD_ID;
              })[0]
                  ? 1
                  : -1
          );
        });
      }
    }
  }, [session]);

  return (
      <Layout>
        <NavBar>
          <NavBarButton
              bold={page == "home"}
              text={"Home"}
              onClick={() => setPage("home")}
          />
          {session && session.user ? (
              <>
                <NavBarButton
                    bold={page == "avatars"}
                    text={"Avatars"}
                    onClick={() => setPage("avatars")}
                />
                <NavBarButton
                    bold={page == "usernames"}
                    text={"Usernames"}
                    onClick={() => setPage("usernames")}
                />
              </>
          ) : (
              <></>
          )}

          {session && session.user ? (
              <NavBarButton
                  className={"right purple"}
                  bold={true}
                  text={"Sign Out"}
                  onClick={() => signOut()}
              />
          ) : (
              <NavBarButton
                  className={"right purple"}
                  bold={true}
                  text={"Sign In"}
                  onClick={() => signIn("discord")}
              />
          )}
        </NavBar>

        <div ref={parent} className={"border p10"}>
          <GuildWarning inGuild={inGuild}/>
          {page == "home" ? (
              <>
                {session && session.user ? (
                <>
                  <h2>Avatar History</h2>
                  <p>Welcome {session.user.name},</p>
                  <p>
                    This Webpage can be used to view your Discord Avatar and
                    Username History. Click the buttons in the bar at the top to get
                    started!
                  </p>
                </>
                ) : (
                <>
                  <h2>Avatar History</h2>
                  <p>Welcome,</p>

                  <p>
                    Easily explore your Discord avatar and username history - all in one place.{" "}
                    <a className={"bold"} onClick={() => signIn("discord")}>
                      Sign in
                    </a>{" "}
                    with your Discord Account to get started!
                  </p>
                </>
                )}
                <p>
                  This tool uses a Discord bot to track your avatar and username history. Just <a href={process.env.GUILD_INVITE} target="_blank" rel="noreferrer">join our server</a> and your changes will be recorded automatically!
                </p>
                <GitHubLink/>
              </>
          ) : page == "avatars" ? (
              <AvatarList avatars={avatars}/>
          ) : page == "usernames" ? (
              <UsernameList usernames={usernames}/>
          ) : (
              <></>
          )}
        </div>
      </Layout>
  );
};
export default Home;

function GitHubLink() {
  return (
      <p>
        You can check out the source code of this application at{" "}
        <a
            target={"_blank"}
            rel={"noreferrer"}
            href={"https://github.com/Duckulus/avatar-history"}
        >
          GitHub
        </a>
      </p>
  );
}

function GuildWarning({inGuild}: { inGuild: number }) {
  if (inGuild == -1) {
    return (
        <p
            style={{
              color: "red",
              textDecoration: "underline",
            }}
        >
          You are currently not in our Discord Server. Being in the Server is
          required to keep track of your Avatars and Usernames. Click{" "}
          <a rel={"noreferrer"} href={process.env.GUILD_INVITE} target={"_blank"}>
            here
          </a>{" "}
          to join!
        </p>
    );
  } else {
    return <></>;
  }
}
