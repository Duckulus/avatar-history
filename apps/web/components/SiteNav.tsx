import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type NavKey = "home" | "avatars" | "usernames" | "admin";

const useIsomorphicLayoutEffect =
  typeof window != "undefined" ? useLayoutEffect : useEffect;

export function SiteNav({ active }: { active?: NavKey }) {
  const { data: session } = useSession();
  const isAdmin = session?.role == "admin" || session?.role == "superadmin";

  const items: { key: NavKey; label: string; href: string }[] = [
    { key: "home", label: "Home", href: "/" },
  ];
  if (session) {
    items.push(
      { key: "avatars", label: "Avatars", href: "/?tab=avatars" },
      { key: "usernames", label: "Usernames", href: "/?tab=usernames" }
    );
  }
  if (isAdmin) items.push({ key: "admin", label: "Admin", href: "/admin" });

  const container = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  // slide the pill under the active link
  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      const el = container.current?.querySelector<HTMLElement>(".nav-link.active");
      setIndicator(
        el ? { left: el.offsetLeft, width: el.offsetWidth } : { left: 0, width: 0 }
      );
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
          className={"nav-indicator"}
          style={{ ...indicator, opacity: indicator.width ? 1 : 0 }}
        />
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            shallow
            className={"nav-link" + (item.key == active ? " active" : "")}
          >
            {item.key == "admin" && <span className={"pill-dot"} />}
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
