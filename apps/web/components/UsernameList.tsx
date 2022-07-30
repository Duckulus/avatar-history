import { Username } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function UsernameList({ usernames }: { usernames: Username[] }) {
  const [parent] = useAutoAnimate<HTMLOListElement>();

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
