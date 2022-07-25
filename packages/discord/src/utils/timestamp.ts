import { TimestampStylesString } from "discord.js";

export const timestamp = (date: Date, style: TimestampStylesString) => {
  return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
};
