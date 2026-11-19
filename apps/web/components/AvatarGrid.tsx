/* eslint-disable @next/next/no-img-element */
import { ReactNode, useEffect, useState } from "react";
import { avatarUrl } from "../utils/cdn";
import { formatDate } from "../utils/format";

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
                <img
                  src={avatarUrl(avatar.userId, avatar.id)}
                  alt={`Avatar #${number}`}
                  loading={"lazy"}
                />
              </button>
              <figcaption className={"avatar-meta"}>
                <span className={"avatar-no"}>
                  #{number}
                  {index == 0 && !deleted && <span className={"tag"}>latest</span>}
                  {deleted && <span className={"tag danger"}>hidden</span>}
                </span>
                <time>{formatDate(avatar.createdAt)}</time>
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
        <img src={url} alt={"Avatar"} />
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
