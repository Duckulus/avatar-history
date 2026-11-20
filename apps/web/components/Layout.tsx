import { PropsWithChildren } from "react";
import { SiteNav } from "./SiteNav";
import { Footer } from "./Footer";

// Rendered once in _app so the navbar persists across page navigations
export function Layout({ children }: PropsWithChildren) {
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
        <SiteNav />
        {children}
        <Footer />
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
