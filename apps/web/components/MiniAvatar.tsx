/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { avatarUrl } from "../utils/cdn";

export function MiniAvatar({
  userId,
  avatarId,
}: {
  userId: string;
  avatarId: string | null;
}) {
  const [failed, setFailed] = useState(false);
  return avatarId && !failed ? (
    <img
      className={"mini-avatar"}
      src={avatarUrl(userId, avatarId)}
      alt={""}
      loading={"lazy"}
      onError={() => setFailed(true)}
    />
  ) : (
    <span className={"mini-avatar"} style={{ display: "block" }} />
  );
}
