export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const plural = (count: number, word: string) =>
  `${count} ${word}${count == 1 ? "" : "s"}`;
