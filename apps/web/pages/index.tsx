import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Avatar, Username } from "@prisma/client";
import { NavBar, NavBarButton } from "../components/NavBar";
import { Layout } from "../components/Layout";
import { AvatarList } from "../components/AvatarList";
import { UsernameList } from "../components/UsernameList";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [page, setPage] = useState("home");
  const [avatars, setAvatars] = useState([] as Avatar[]);
  const [usernames, setUsernames] = useState([] as Username[]);

  useEffect(() => {
    if (session) {
      axios.get(`/api/avatars/`).then((resp) => {
        setAvatars(resp.data);
      });
      axios.get(`/api/usernames/`).then((resp) => {
        setUsernames(resp.data);
      });
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

      <div className={"border p10"}>
        {page == "home" ? (
          session && session.user ? (
            <>
              <h2>Avatar History</h2>
              <p>Welcome {session.user.name},</p>
              This Webpage can be used to view your Discord Avatar and Username
              History. Click the buttons in the bar at the top to get started!
            </>
          ) : (
            <>
              <h2>Avatar History</h2>
              <p>Welcome,</p>

              <p>
                This Webpage can be used to view your Discord Avatar and
                Username History.{" "}
                <a className={"bold"} onClick={() => signIn("discord")}>
                  Sign in
                </a>{" "}
                with your Discord Account to get started!
              </p>
            </>
          )
        ) : page == "avatars" ? (
          <AvatarList avatars={avatars} />
        ) : page == "usernames" ? (
          <UsernameList usernames={usernames} />
        ) : (
          <></>
        )}
      </div>
    </Layout>
  );
};
export default Home;
