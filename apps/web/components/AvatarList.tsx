import { Avatar } from "@prisma/client";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export function AvatarList({ avatars }: { avatars: Avatar[] }) {
  const [parent] = useAutoAnimate<HTMLDivElement>();

  return (
    <div ref={parent} className={"avatar-list"}>
      {avatars.map((avatar, index) => {
        return <Avatar key={index} avatar={avatar} index={index} />;
      })}
    </div>
  );
}

function Avatar({ avatar, index }: { avatar: Avatar; index: number }) {
  const url = `https://cdn.duckul.us/avatars/${avatar.userId}/${avatar.id}.png`;
  return (
    <div className={"avatar"}>
      <div style={{}}>
        <a rel={"noreferrer"} target={"_blank"} href={url}>
          Avatar no. {index + 1}
        </a>
        <br />
        <a>{new Date(avatar.createdAt).toDateString()}</a>
        <br />

        <img src={url} alt={"avatar"} width={100} height={100} />
      </div>
    </div>
  );
}
