import { PropsWithChildren } from "react";
import { NavKey, SiteNav } from "./SiteNav";

export function Layout({
  children,
  active,
}: PropsWithChildren<{ active?: NavKey }>) {
  return (
    <>
      <div className={"backdrop"} aria-hidden>
        <div className={"grid-lines"} />
        <div className={"blob blob-1"} />
        <div className={"blob blob-2"} />
        <div className={"blob blob-3"} />
        <div className={"grain"} />
      </div>
      <div className={"layout"}>
        <SiteNav active={active} />
        {children}
      </div>
    </>
  );
}

// Content box; changing `pageKey` replays the enter animation
export function Panel({
  children,
  pageKey,
}: PropsWithChildren<{ pageKey?: string }>) {
  return (
    <main key={pageKey} className={"panel page-enter"}>
      {children}
    </main>
  );
}
