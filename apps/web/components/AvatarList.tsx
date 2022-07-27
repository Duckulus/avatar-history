import { Avatar } from "@prisma/client";
import Image from "next/image";

export function AvatarList({ avatars }: { avatars: Avatar[] }) {
  return (
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
  );
}
