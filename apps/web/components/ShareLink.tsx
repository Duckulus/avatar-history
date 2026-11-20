import axios from "axios";
import { ReactNode, useEffect, useState } from "react";

/**
 * Opt-in public link, revocable at any time. `endpoint` answers GET/POST/DELETE
 * with `{ id: string | null }`, the public page lives at `${path}/${id}`.
 */
export function ShareLink({
  endpoint,
  params,
  path,
  shareText,
  createLabel = "🔗 Create share link",
  offNote,
  onNote,
}: {
  endpoint: string;
  params?: Record<string, string | number>;
  path: string;
  shareText: string;
  createLabel?: string;
  offNote: ReactNode;
  onNote: ReactNode;
}) {
  const [id, setId] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const paramKey = JSON.stringify(params ?? {});

  useEffect(() => {
    setId(undefined);
    axios.get(endpoint, { params: JSON.parse(paramKey) }).then((resp) => setId(resp.data.id), () => setId(null));
  }, [endpoint, paramKey]);

  const update = (request: Promise<{ data: { id: string | null } }>) => {
    setBusy(true);
    request
      .then((resp) => setId(resp.data.id))
      .catch(() => {})
      .finally(() => setBusy(false));
  };
  const url = id ? `${window.location.origin}${path}/${id}` : null;

  if (id === undefined) return null;
  if (!url) {
    return (
      <div className={"share-link"}>
        <button className={"btn btn-primary"} disabled={busy} onClick={() => update(axios.post(endpoint, params ?? {}))}>
          {createLabel}
        </button>
        <span className={"share-note"}>{offNote}</span>
      </div>
    );
  }
  return (
    <div className={"share-link"}>
      <div className={"share-url"}>
        <input readOnly value={url} aria-label={"Share link"} onFocus={(e) => e.currentTarget.select()} />
        <button
          className={"btn btn-primary btn-small"}
          onClick={() =>
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <span className={"share-note"}>
        {onNote}{" "}
        {typeof navigator != "undefined" && "share" in navigator && (
          <>
            <button className={"link-button"} onClick={() => navigator.share({ url, text: shareText }).catch(() => {})}>
              Share…
            </button>{" "}
            ·{" "}
          </>
        )}
        <a href={url} target={"_blank"} rel={"noreferrer"}>
          Open
        </a>{" "}
        ·{" "}
        <button
          className={"link-button danger"}
          disabled={busy}
          onClick={() => update(axios.delete(endpoint, { params }))}
        >
          Stop sharing
        </button>
      </span>
    </div>
  );
}
