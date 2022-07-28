import { Avatar } from "@prisma/client";
import Image from "next/image";

export function AvatarList({ avatars }: { avatars: Avatar[] }) {
  return (
    <div className={"avatar-list"}>
      {avatars.map((avatar, index) => {
        return <Avatar avatar={avatar} index={index} />;
      })}
    </div>
  );
}

function Avatar({ avatar, index }: { avatar: Avatar; index: number }) {
  const url = `https://cdn.duckul.us/avatars/${avatar.userId}/${avatar.id}.png`;
  return (
    <div className={"avatar"}>
      <a target={"_blank"} href={url}>
        Avatar no. {index + 1}
      </a>
      <br />
      <a>{new Date(avatar.createdAt).toDateString()}</a>
      <br />
      <Image src={url} alt={"avatar"} width={100} height={100} />
    </div>
  );
}
