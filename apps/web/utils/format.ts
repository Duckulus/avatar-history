export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const plural = (count: number, word: string) =>
  `${count} ${word}${count == 1 ? "" : "s"}`;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

const relativeFormat = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// "3 weeks ago", "yesterday", "just now"
export const formatRelative = (date: string | Date, now = Date.now()) => {
  const seconds = (new Date(date).getTime() - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) {
      return relativeFormat.format(Math.round(seconds / size), unit);
    }
  }
  return "just now";
};

export const formatDateTime = (date: string | Date) =>
  new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// Rough human readable duration: "3 days", "2 months", "less than an hour"
export const formatDuration = (ms: number) => {
  const seconds = Math.max(0, ms / 1000);
  for (const [unit, size] of UNITS) {
    if (unit == "minute") break;
    if (seconds >= size) return plural(Math.floor(seconds / size), unit);
  }
  return "less than an hour";
};
