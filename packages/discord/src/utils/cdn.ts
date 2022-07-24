import { CDN_URL } from "@avatar-history/env";

export const cdn = (avatarId: string, userId: string) => {
  return `https://${CDN_URL}/avatars/${userId}/${avatarId}.png`;
};
