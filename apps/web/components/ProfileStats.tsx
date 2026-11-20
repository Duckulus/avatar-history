import { wornDurations } from "../utils/avatars";
import { formatDuration, formatRelative } from "../utils/format";

interface Dated {
  createdAt: string | Date;
}

// Summary of the signed in user's own history, computed from the data that is already loaded
export function ProfileStats({ avatars, usernames }: { avatars: Dated[]; usernames: Dated[] }) {
  if (avatars.length == 0) return null;

  const durations = wornDurations(avatars);
  const longest = durations.indexOf(Math.max(...durations));
  const oldest = new Date(avatars[avatars.length - 1].createdAt).getTime();
  const newest = new Date(avatars[0].createdAt).getTime();
  const average = avatars.length > 1 ? (newest - oldest) / (avatars.length - 1) : null;

  const stats: { value: string; label: string }[] = [
    { value: String(avatars.length), label: avatars.length == 1 ? "avatar" : "avatars" },
    { value: String(usernames.length), label: usernames.length == 1 ? "username" : "usernames" },
    {
      value: average == null ? "–" : formatDuration(average),
      label: "between avatar changes on average",
    },
    {
      value: formatDuration(durations[longest]),
      label: `longest worn (#${avatars.length - longest})`,
    },
    { value: formatRelative(new Date(oldest)), label: "first avatar recorded" },
  ];

  return (
    <div className={"stats profile-stats"}>
      {stats.map((stat, i) => (
        <div key={stat.label} className={"stat"} style={{ "--i": i } as React.CSSProperties}>
          <strong>{stat.value}</strong>
          <span>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
