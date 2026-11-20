interface Dated {
  createdAt: string | Date;
}

// Milliseconds each avatar was worn: until the next (newer) avatar was
// recorded, the newest one until now. Expects avatars newest first.
export const wornDurations = (avatars: Dated[], now = Date.now()) =>
  avatars.map((avatar, index) => {
    const until = index == 0 ? now : new Date(avatars[index - 1].createdAt).getTime();
    return until - new Date(avatar.createdAt).getTime();
  });
