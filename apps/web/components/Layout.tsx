import { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren) {
  return <div className={"layout"}>{children}</div>;
}
