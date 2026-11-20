import { MiniAvatar } from "./MiniAvatar";
import { RelativeTime } from "./RelativeTime";

interface AvatarEntry {
  id: string;
  userId: string;
  createdAt: string | Date;
}

interface UsernameEntry {
  id: number;
  value: string;
  createdAt: string | Date;
}

type Event =
  | { kind: "avatar"; at: number; avatar: AvatarEntry; number: number }
  | { kind: "username"; at: number; username: UsernameEntry; first: boolean };

// Avatar and username changes merged into one chronological feed, newest first
export function HistoryTimeline({
  avatars,
  usernames,
}: {
  avatars: AvatarEntry[];
  usernames: UsernameEntry[];
}) {
  const events: Event[] = [
    ...avatars.map((avatar, index) => ({
      kind: "avatar" as const,
      at: new Date(avatar.createdAt).getTime(),
      avatar,
      number: avatars.length - index,
    })),
    ...usernames.map((username, index) => ({
      kind: "username" as const,
      at: new Date(username.createdAt).getTime(),
      username,
      first: index == usernames.length - 1,
    })),
  ].sort((a, b) => b.at - a.at);

  if (events.length == 0) {
    return (
      <div className={"empty"}>
        <span className={"empty-icon"}>🕰️</span>
        Nothing archived yet. Change your avatar or username and check back!
      </div>
    );
  }

  return (
    <ol className={"timeline history"}>
      {events.map((event, index) => (
        <li
          key={event.kind + (event.kind == "avatar" ? event.avatar.id : event.username.id)}
          style={{ "--i": index } as React.CSSProperties}
        >
          {event.kind == "avatar" ? (
            <>
              <MiniAvatar userId={event.avatar.userId} avatarId={event.avatar.id} />
              <div>
                <span className={"name"}>New avatar #{event.number}</span>
                <span className={"since"}>
                  <RelativeTime date={event.avatar.createdAt} />
                </span>
              </div>
            </>
          ) : (
            <>
              <span className={"event-icon"} aria-hidden>
                🏷️
              </span>
              <div>
                <span className={"name"}>
                  {event.first ? "First recorded as " : "Renamed to "}
                  <em>{event.username.value}</em>
                </span>
                <span className={"since"}>
                  <RelativeTime date={event.username.createdAt} />
                </span>
              </div>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
