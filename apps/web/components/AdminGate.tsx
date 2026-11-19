import { PropsWithChildren } from "react";
import { signIn, useSession } from "next-auth/react";
import { Panel } from "./Layout";

// Client-side gate only for UX; the admin API routes check the role themselves
export function AdminGate({ children }: PropsWithChildren) {
  const { data: session, status } = useSession();
  if (status == "loading") {
    return (
      <Panel>
        <div className={"spinner"} />
      </Panel>
    );
  }
  if (session?.role != "admin" && session?.role != "superadmin") {
    return (
      <Panel>
        <div className={"empty"}>
          <span className={"empty-icon"}>🔒</span>
          <h2>Admins only</h2>
          <p>You need admin rights to view this page.</p>
          {!session && (
            <button className={"btn btn-primary"} onClick={() => signIn("discord")}>
              Sign in
            </button>
          )}
        </div>
      </Panel>
    );
  }
  return <>{children}</>;
}
