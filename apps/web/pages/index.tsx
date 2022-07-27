import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Avatar, Username } from "@prisma/client";
import Image from "next/image";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

const Home: NextPage = () => {
  const { data: session } = useSession();
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

  if (session) {
    return (
      <>
        <nav>
          {" "}
          Signed in as {session.user!.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </nav>
        <Tabs>
          <TabList>
            <Tab>Avatars</Tab>
            <Tab>Usernames</Tab>
          </TabList>

          <TabPanel>
            <ul className={"no-dot"}>
              {avatars.map((avatar, index) => {
                return (
                  <li key={index}>
                    <Image
                      src={`https://cdn.duckul.us/avatars/${avatar.userId}/${avatar.id}.png`}
                      alt={"avatar"}
                      width={100}
                      height={100}
                    />
                  </li>
                );
              })}
            </ul>
          </TabPanel>
          <TabPanel>
            <ul className={"no-dot"}>
              {usernames.map((username, index) => {
                return (
                  <li key={index}>
                    <a>{username.value}</a>
                  </li>
                );
              })}
            </ul>
          </TabPanel>
        </Tabs>
      </>
    );
  }
  return (
    <>
      {" "}
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in</button>
    </>
  );
};
export default Home;
