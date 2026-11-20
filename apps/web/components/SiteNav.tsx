import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type NavKey = "home" | "avatars" | "usernames" | "timeline" | "wrapped" | "admin";

const useIsomorphicLayoutEffect =
  typeof window != "undefined" ? useLayoutEffect : useEffect;

const activeKey = (router: NextRouter, signedIn: boolean): NavKey | undefined => {
  if (router.pathname.startsWith("/admin")) return "admin";
  if (router.pathname == "/wrapped") return "wrapped";
  if (router.pathname != "/") return undefined;
  const tab = router.query.tab;
  return signedIn && (tab == "avatars" || tab == "usernames" || tab == "timeline")
    ? tab
    : "home";
};

export function SiteNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const active = activeKey(router, !!session);
  const isAdmin = session?.role == "admin" || session?.role == "superadmin";

  const items: { key: NavKey; label: string; href: string }[] = [
    { key: "home", label: "Home", href: "/" },
  ];
  if (session) {
    items.push(
      { key: "avatars", label: "Avatars", href: "/?tab=avatars" },
      { key: "usernames", label: "Usernames", href: "/?tab=usernames" },
      { key: "timeline", label: "Timeline", href: "/?tab=timeline" }
    );
  }
  // also for signed out visitors, the page itself asks them to sign in
  items.push({ key: "wrapped", label: "Wrapped", href: "/wrapped" });
  if (isAdmin) items.push({ key: "admin", label: "Admin", href: "/admin" });

  const container = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const placed = indicator.width > 0;
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!placed || animate) return;
    const frame = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, [placed, animate]);

  // slide the pill under the active link
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const el = container.current?.querySelector<HTMLElement>(".nav-link.active");
      setIndicator(
        el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 }
      );
      // on phones the links scroll sideways, keep the active one visible
      const box = container.current;
      if (el && box && box.scrollWidth > box.clientWidth) {
        box.scrollTo({
          left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2,
          behavior: animate ? "smooth" : "auto",
        });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, items.length]);

  return (
    <nav className={"navbar"}>
      <Link href={"/"} className={"brand"}>
        <span className={"brand-mark"} aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className={"brand-name"}>
          avatar<em>history</em>
        </span>
      </Link>

      <div className={"nav-items"} ref={container}>
        <span
          className={"nav-indicator" + (animate ? "" : " instant")}
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
            opacity: indicator.width ? 1 : 0,
          }}
        />
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            shallow
            className={"nav-link" + (item.key == active ? " active" : "")}
          >
            {item.key == "admin" && <span className={"pill-dot"} />}
            {item.key == "wrapped" && <span aria-hidden>✨ </span>}
            {item.label}
          </Link>
        ))}
      </div>

      <div className={"nav-right"}>
        {session?.user ? (
          <>
            <span className={"user-chip"}>
              {session.user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={""}
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              <span className={"user-name"}>{session.user.name}</span>
            </span>
            <button className={"btn btn-small"} onClick={() => signOut()}>
              Sign out
            </button>
          </>
        ) : (
          <button
            className={"btn btn-primary btn-small"}
            onClick={() => signIn("discord")}
          >
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
