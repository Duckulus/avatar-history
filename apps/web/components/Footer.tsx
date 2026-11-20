import Link from "next/link";

export function Footer() {
  return (
    <footer className={"site-footer"}>
      <span>
        avatar<em>history</em> · not affiliated with Discord
      </span>
      <nav aria-label={"Legal"}>
        <Link href={"/privacy"}>Privacy</Link>
        <Link href={"/terms"}>Terms</Link>
        <a href={"https://github.com/Duckulus/avatar-history"} target={"_blank"} rel={"noreferrer"}>
          GitHub
        </a>
      </nav>
    </footer>
  );
}
