/* eslint-disable @next/next/no-img-element */
import { avatarUrl } from "../utils/cdn";

export function MiniAvatar({
  userId,
  avatarId,
}: {
  userId: string;
  avatarId: string | null;
}) {
  return avatarId ? (
    <img className={"mini-avatar"} src={avatarUrl(userId, avatarId)} alt={""} loading={"lazy"} />
  ) : (
    <span className={"mini-avatar"} style={{ display: "block" }} />
  );
}
