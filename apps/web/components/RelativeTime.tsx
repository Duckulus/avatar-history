import { formatDateTime, formatRelative } from "../utils/format";

// Relative time with the exact date as tooltip
export function RelativeTime({ date }: { date: string | Date }) {
  const value = new Date(date);
  return (
    <time dateTime={value.toISOString()} title={formatDateTime(value)}>
      {formatRelative(value)}
    </time>
  );
}
