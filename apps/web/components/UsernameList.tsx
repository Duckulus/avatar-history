import { Username } from "@prisma/client";
import {useEffect, useRef} from "react";
import autoAnimate from "@formkit/auto-animate";

export function UsernameList({ usernames }: { usernames: Username[] }) {
  const parent = useRef(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current)
  }, [parent]);

  return (
    <ol ref={parent}>
      {usernames.map((username, index) => {
        return (
          <li key={index}>
            <a>{username.value}</a>
          </li>
        );
      })}
    </ol>
  );
}
