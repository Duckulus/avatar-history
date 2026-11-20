// Year in review ("Wrapped"), computed in the browser from the user's full
// avatar and username history. All dates use the viewer's local time.

export interface WrappedAvatar {
  id: string;
  userId: string;
  createdAt: string | Date;
}

export interface WrappedUsername {
  id: number;
  value: string;
  createdAt: string | Date;
}

export interface Worn {
  avatar: WrappedAvatar;
  ms: number;
}

export interface Persona {
  emoji: string;
  title: string;
  text: string;
}

export interface WrappedStats {
  year: number;
  // avatars recorded during the year, oldest first
  avatars: WrappedAvatar[];
  // usernames recorded during the year, oldest first
  usernames: WrappedUsername[];
  // what the user looked like when the year started / ended (or now)
  first: WrappedAvatar | null;
  last: WrappedAvatar | null;
  // new avatars per month, january first
  monthly: number[];
  busiestMonth: number | null;
  pfpOfTheYear: Worn | null;
  // shortest lived avatar that was replaced during the year
  shortest: Worn | null;
  persona: Persona;
}

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const time = (date: string | Date) => new Date(date).getTime();

// Years with any recorded activity, newest first
export const wrappedYears = (avatars: WrappedAvatar[], usernames: WrappedUsername[]) =>
  Array.from(
    new Set([...avatars, ...usernames].map((entry) => new Date(entry.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

// The year that is ending (in January still the previous one), or the newest
// year with activity if that one has none
export const defaultWrappedYear = (years: number[], now = new Date()) => {
  const preferred = now.getMonth() == 0 ? now.getFullYear() - 1 : now.getFullYear();
  return years.includes(preferred) || years.length == 0 ? preferred : years[0];
};

const persona = (changes: number): Persona => {
  if (changes == 0)
    return { emoji: "🪨", title: "The Loyalist", text: "One pfp, all year. That's commitment." };
  if (changes <= 2)
    return { emoji: "🎯", title: "The Minimalist", text: "You only change it when it really counts." };
  if (changes <= 6)
    return { emoji: "🌱", title: "The Refresher", text: "A new look every season keeps things fresh." };
  if (changes <= 15)
    return { emoji: "🎭", title: "The Shapeshifter", text: "Your friends never know who they'll see next." };
  return { emoji: "🦎", title: "The Chameleon", text: "A pfp for every mood. Possibly every hour." };
};

export const computeWrapped = (
  year: number,
  allAvatars: WrappedAvatar[],
  allUsernames: WrappedUsername[],
  now = Date.now()
): WrappedStats => {
  const start = new Date(year, 0, 1).getTime();
  const end = Math.min(new Date(year + 1, 0, 1).getTime(), now);
  const chronological = [...allAvatars].sort((a, b) => time(a.createdAt) - time(b.createdAt));

  const avatars = chronological.filter((a) => time(a.createdAt) >= start && time(a.createdAt) < end);
  const carried = chronological.filter((a) => time(a.createdAt) < start).pop() ?? null;
  const usernames = [...allUsernames]
    .sort((a, b) => time(a.createdAt) - time(b.createdAt))
    .filter((u) => time(u.createdAt) >= start && time(u.createdAt) < end);

  // how long each avatar was worn within the year
  const worn = [...(carried ? [carried] : []), ...avatars].map((avatar, index, list) => {
    const from = Math.max(time(avatar.createdAt), start);
    const next = list[index + 1];
    return { avatar, ms: (next ? time(next.createdAt) : end) - from, replaced: !!next };
  });
  const longest = worn.reduce<(typeof worn)[number] | null>((best, w) => (!best || w.ms > best.ms ? w : best), null);
  const replaced = worn.filter((w) => w.replaced);
  const shortest =
    replaced.length > 0 ? replaced.reduce((best, w) => (w.ms < best.ms ? w : best)) : null;

  const monthly = Array.from({ length: 12 }, () => 0);
  for (const avatar of avatars) monthly[new Date(avatar.createdAt).getMonth()]++;
  const max = Math.max(...monthly);

  return {
    year,
    avatars,
    usernames,
    first: carried ?? avatars[0] ?? null,
    last: avatars[avatars.length - 1] ?? carried,
    monthly,
    busiestMonth: max > 0 ? monthly.indexOf(max) : null,
    pfpOfTheYear: longest && { avatar: longest.avatar, ms: longest.ms },
    shortest: shortest && shortest !== longest ? { avatar: shortest.avatar, ms: shortest.ms } : null,
    persona: persona(avatars.length),
  };
};
