import { formatDate } from "../utils/format";

export function UsernameTimeline({
  usernames,
}: {
  usernames: { id: number; value: string; createdAt: string | Date }[];
}) {
  if (usernames.length == 0) {
    return (
      <div className={"empty"}>
        <span className={"empty-icon"}>🏷️</span>
        No usernames archived yet.
      </div>
    );
  }
  return (
    <ol className={"timeline"}>
      {usernames.map((username, index) => (
        <li key={username.id} style={{ "--i": index } as React.CSSProperties}>
          <span className={"name"}>{username.value}</span>
          {index == 0 && <span className={"tag"}>current</span>}
          <time>since {formatDate(username.createdAt)}</time>
        </li>
      ))}
    </ol>
  );
}
