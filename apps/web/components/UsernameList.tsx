import { Username } from "@prisma/client";

export function UsernameList({ usernames }: { usernames: Username[] }) {
  return (
    <ul className={"no-dot"}>
      {usernames.map((username, index) => {
        return (
          <li key={index}>
            <a>{username.value}</a>
          </li>
        );
      })}
    </ul>
  );
}
