/* eslint-disable @next/next/no-img-element */
import { ReactNode, useEffect, useState } from "react";
import { Portal } from "./Portal";
import { avatarUrl } from "../utils/cdn";
import { RelativeTime } from "./RelativeTime";
import { formatDuration } from "../utils/format";
import { wornDurations } from "../utils/avatars";

// Shows a placeholder instead of the browser's clipped alt text when the file is missing on the CDN
function AvatarImage({ avatar, alt }: { avatar: AvatarLike; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={"avatar-fallback"}
        role={"img"}
        aria-label={`${alt} (unavailable)`}
      >
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
  const durations = wornDurations(avatars);

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
          const worn = formatDuration(durations[index]);
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
                  {index == 0 && !deleted && (
                    <span className={"tag"}>latest</span>
                  )}
                  {deleted && <span className={"tag danger"}>hidden</span>}
                </span>
                <RelativeTime date={avatar.createdAt} />
                <span className={"worn"}>
                  {index == 0 ? `worn for ${worn} so far` : `worn for ${worn}`}
                </span>
              </figcaption>
              {actions && (
                <div className={"avatar-actions"}>{actions(avatar)}</div>
              )}
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
  const [copied, setCopied] = useState<boolean | null>(null);

  useEffect(() => {
    if (copied == null) return;
    const timeout = setTimeout(() => setCopied(null), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const copy = () =>
    navigator.clipboard
      .writeText(url)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));

  // portaled: the panel's backdrop-filter would otherwise be the containing
  // block of this position: fixed overlay
  return (
    <Portal>
      <div className={"lightbox"} onClick={onClose} role={"dialog"} aria-modal>
        <div className={"lightbox-inner"} onClick={(e) => e.stopPropagation()}>
          <div className={"lightbox-image"}>
            <AvatarImage avatar={avatar} alt={"Avatar"} />
          </div>
          <div className={"hero-actions"}>
            <button className={"btn btn-primary"} onClick={copy}>
              {copied == null
                ? "Copy link"
                : copied
                  ? "Copied ✓"
                  : "Copy failed"}
            </button>
            <a
              className={"btn"}
              href={url}
              target={"_blank"}
              rel={"noreferrer"}
            >
              Open original ↗
            </a>
            <button className={"btn"} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
