import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Avatar } from "@prisma/client";

const Home: NextPage = () => {
  const { data: session } = useSession();
  const [avatars, setAvatars] = useState([] as Avatar[]);

  useEffect(() => {
    if (session) {
      axios.get(`/api/avatars/${session.id}`).then((resp) => {
        setAvatars(resp.data);
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
        <ul>
          {avatars.map((avatar, index) => {
            return (
              <li key={index}>
                <img
                  src={`https://cdn.duckul.us/avatars/${avatar.userId}/${avatar.id}.png`}
                  alt={"avatar"}
                />
              </li>
            );
          })}
        </ul>
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
