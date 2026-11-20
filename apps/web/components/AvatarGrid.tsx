/* eslint-disable @next/next/no-img-element */
import { ReactNode, useEffect, useState } from "react";
import { avatarUrl } from "../utils/cdn";
import { RelativeTime } from "./RelativeTime";
import { formatDuration } from "../utils/format";

// Shows a placeholder instead of the browser's clipped alt text when the file is missing on the CDN
function AvatarImage({ avatar, alt }: { avatar: AvatarLike; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={"avatar-fallback"} role={"img"} aria-label={`${alt} (unavailable)`}>
        <span aria-hidden>?</span>
        <small>unavailable</small>
      </span>
    );
  }
  return (
    <img
      src={avatarUrl(avatar.userId, avatar.id)}
      alt={alt}
      loading={"lazy"}
      onError={() => setFailed(true)}
    />
  );
}

export interface AvatarLike {
  id: string;
  userId: string;
  createdAt: string | Date;
  deletedAt?: string | Date | null;
}

export function AvatarGrid<T extends AvatarLike>({
  avatars,
  actions,
}: {
  avatars: T[];
  actions?: (avatar: T) => ReactNode;
}) {
  const [open, setOpen] = useState<T | null>(null);
  const now = Date.now();

  if (avatars.length == 0) {
    return (
      <div className={"empty"}>
        <span className={"empty-icon"}>🖼️</span>
        No avatars archived yet. Change your profile picture and check back!
      </div>
    );
  }

  return (
    <>
      <div className={"avatar-grid"}>
        {avatars.map((avatar, index) => {
          // avatars arrive newest first; number them chronologically
          const number = avatars.length - index;
          const deleted = !!avatar.deletedAt;
          // worn until the next (newer) avatar was recorded, the newest one until now
          const until = index == 0 ? now : new Date(avatars[index - 1].createdAt).getTime();
          const worn = formatDuration(until - new Date(avatar.createdAt).getTime());
          return (
            <figure
              key={avatar.id}
              className={"avatar-card" + (deleted ? " is-deleted" : "")}
              style={{ "--i": index } as React.CSSProperties}
            >
              <button
                className={"avatar-ring"}
                onClick={() => setOpen(avatar)}
                aria-label={`Show avatar #${number}`}
              >
                <AvatarImage avatar={avatar} alt={`Avatar #${number}`} />
              </button>
              <figcaption className={"avatar-meta"}>
                <span className={"avatar-no"}>
                  #{number}
                  {index == 0 && !deleted && <span className={"tag"}>latest</span>}
                  {deleted && <span className={"tag danger"}>hidden</span>}
                </span>
                <RelativeTime date={avatar.createdAt} />
                <span className={"worn"}>
                  {index == 0 ? `worn for ${worn} so far` : `worn for ${worn}`}
                </span>
              </figcaption>
              {actions && <div className={"avatar-actions"}>{actions(avatar)}</div>}
            </figure>
          );
        })}
      </div>
      {open && <Lightbox avatar={open} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({
  avatar,
  onClose,
}: {
  avatar: AvatarLike;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key == "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const url = avatarUrl(avatar.userId, avatar.id);
  return (
    <div className={"lightbox"} onClick={onClose} role={"dialog"} aria-modal>
      <div className={"lightbox-inner"} onClick={(e) => e.stopPropagation()}>
        <div className={"lightbox-image"}>
          <AvatarImage avatar={avatar} alt={"Avatar"} />
        </div>
        <div className={"hero-actions"}>
          <a className={"btn"} href={url} target={"_blank"} rel={"noreferrer"}>
            Open original ↗
          </a>
          <button className={"btn"} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
