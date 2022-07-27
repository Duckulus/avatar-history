import { MouseEventHandler, PropsWithChildren } from "react";

export function NavBar({ children }: PropsWithChildren) {
  return <div className={"navbar"}>{children}</div>;
}

export function NavBarButton({
  text,
  onClick,
  bold,
  className = "",
}: {
  text: string;
  onClick: MouseEventHandler<HTMLAnchorElement>;
  bold: boolean;
  className?: string;
}) {
  return (
    <a className={(bold ? "bold " : "") + className} onClick={onClick}>
      {text}
    </a>
  );
}
