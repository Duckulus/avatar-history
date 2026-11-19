import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Panel } from "../../../components/Layout";
import { AdminGate } from "../../../components/AdminGate";
import { AvatarGrid } from "../../../components/AvatarGrid";
import { UsernameTimeline } from "../../../components/UsernameTimeline";
import { formatDate, plural } from "../../../utils/format";
import { MiniAvatar } from "../../../components/MiniAvatar";

interface AdminAvatar {
  id: string;
  userId: string;
  createdAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

interface UserDetails {
  id: string;
  Avatar: AdminAvatar[];
  Username: { id: number; value: string; createdAt: string }[];
}

const AdminUserPage: NextPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const id = router.query.id as string | undefined;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!id) return;
    axios
      .get(`/api/admin/users/${id}`)
      .then((resp) => setUser(resp.data))
      .catch((e) => setError(e?.response?.data?.error ?? "Could not load user"));
  }, [id]);

  useEffect(load, [load]);

  const toggle = async (avatar: AdminAvatar) => {
    setPending(avatar.id);
    try {
      const resp = await axios.patch(`/api/admin/avatars/${avatar.id}`, {
        deleted: !avatar.deletedAt,
      });
      setUser((u) =>
        u && { ...u, Avatar: u.Avatar.map((a) => (a.id == avatar.id ? resp.data : a)) }
      );
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Could not update avatar");
    } finally {
      setPending(null);
    }
  };

  const hidden = user?.Avatar.filter((a) => a.deletedAt).length ?? 0;
  const currentAvatar = user?.Avatar.find((a) => !a.deletedAt)?.id ?? null;

  return (
      <AdminGate>
        <Panel pageKey={id}>
          <Link href={"/admin"} className={"back-link"}>
            ← All users
          </Link>
          {error ? (
            <div className={"empty"}>
              <span className={"empty-icon"}>👻</span>
              {error}
            </div>
          ) : !user ? (
            <div className={"spinner"} />
          ) : (
            <>
              <div className={"profile-head"}>
                <MiniAvatar userId={user.id} avatarId={currentAvatar} />
                <div>
                  <h2>{user.Username[0]?.value ?? "Unknown user"}</h2>
                  <span className={"mono"}>{user.id}</span>
                  <div>
                    <span className={"tag violet"} style={{ marginLeft: 0 }}>
                      {plural(user.Avatar.length - hidden, "visible avatar")}
                    </span>
                    {hidden > 0 && <span className={"tag danger"}>{hidden} hidden</span>}
                    <span className={"tag"}>{plural(user.Username.length, "username")}</span>
                  </div>
                </div>
              </div>

              <h3 className={"subhead"}>Avatars</h3>
              <p className={"footnote"} style={{ marginTop: -8 }}>
                Hidden avatars are no longer shown on the website or by the bot. They stay on disk and can be
                restored at any time.
              </p>
              <AvatarGrid
                avatars={user.Avatar}
                actions={(avatar) => (
                  <>
                    {avatar.deletedAt && (
                      <div className={"mono"} style={{ marginBottom: 6 }}>
                        hidden {formatDate(avatar.deletedAt)}
                        {avatar.deletedBy && (
                          <> by {avatar.deletedBy == session?.discordId ? "you" : avatar.deletedBy}</>
                        )}
                      </div>
                    )}
                    <button
                      className={"btn btn-small" + (avatar.deletedAt ? "" : " btn-danger")}
                      disabled={pending == avatar.id}
                      onClick={() => toggle(avatar)}
                    >
                      {avatar.deletedAt ? "Restore" : "Hide"}
                    </button>
                  </>
                )}
              />

              <h3 className={"subhead"}>Usernames</h3>
              <UsernameTimeline usernames={user.Username} />
            </>
          )}
        </Panel>
      </AdminGate>
  );
};
export default AdminUserPage;
