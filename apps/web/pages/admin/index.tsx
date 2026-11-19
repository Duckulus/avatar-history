import type { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import { Panel } from "../../components/Layout";
import { AdminGate } from "../../components/AdminGate";
import { MiniAvatar } from "../../components/MiniAvatar";
import { formatDate, plural } from "../../utils/format";

interface UserOverview {
  id: string;
  username: string | null;
  currentAvatar: string | null;
  avatarCount: number;
  deletedAvatarCount: number;
  usernameCount: number;
  lastSeenChange: number | null;
}

interface AdminEntry {
  discordId: string;
  username: string | null;
  avatar: string | null;
  createdAt?: string;
  grantedBy?: string;
}

type SortKey = "recent" | "avatars" | "usernames" | "hidden";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "avatars", label: "Avatars" },
  { key: "usernames", label: "Names" },
  { key: "hidden", label: "Hidden" },
];

interface UserPage {
  users: UserOverview[];
  total: number;
  pageSize: number;
}

interface Stats {
  users: number;
  avatars: number;
  hidden: number;
  usernames: number;
}

const AdminPage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const isSuperAdmin = session?.role == "superadmin";
  const tab = router.query.tab == "admins" && isSuperAdmin ? "admins" : "users";

  return (
      <AdminGate>
        <Panel pageKey={tab}>
          <div className={"section-head"}>
            <h2>
              Admin <span className={"gradient-text"}>panel</span>
            </h2>
            {isSuperAdmin && <span className={"tag violet"}>super admin</span>}
          </div>
          {isSuperAdmin && (
            <div className={"tabs"}>
              <Link href={"/admin"} shallow className={"tab" + (tab == "users" ? " active" : "")}>
                Users
              </Link>
              <Link
                href={"/admin?tab=admins"}
                shallow
                className={"tab" + (tab == "admins" ? " active" : "")}
              >
                Admins
              </Link>
            </div>
          )}
          {tab == "users" ? <Users /> : <Admins />}
        </Panel>
      </AdminGate>
  );
};
export default AdminPage;

// Search, sort and paging happen on the server; only one page is loaded at a time
function Users() {
  const [result, setResult] = useState<UserPage | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
    key: "recent",
    desc: true,
  });

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get("/api/admin/users", {
        params: {
          page,
          q: debouncedQuery,
          sort: sort.key,
          dir: sort.desc ? "desc" : "asc",
          stats: stats ? undefined : 1,
        },
      })
      .then((resp) => {
        if (cancelled) return;
        setResult(resp.data);
        if (resp.data.stats) setStats(resp.data.stats);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // stats are only requested once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedQuery, sort]);

  const changeSort = (key: SortKey) => {
    setSort((s) => (s.key == key ? { key, desc: !s.desc } : { key, desc: true }));
    setPage(0);
  };

  if (!result) return <div className={"spinner"} />;

  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <>
      {stats && (
        <div className={"stats"}>
          <Stat i={0} value={stats.users} label={"tracked users"} />
          <Stat i={1} value={stats.avatars} label={"visible avatars"} />
          <Stat i={2} value={stats.hidden} label={"hidden avatars"} />
          <Stat i={3} value={stats.usernames} label={"usernames"} />
        </div>
      )}
      <div className={"toolbar"}>
        <input
          className={"input"}
          placeholder={"Search by username or Discord ID…"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />
        <div className={"tabs sort-tabs"} role={"group"} aria-label={"Sort users"}>
          <span className={"sort-label"}>Sort</span>
          {SORTS.map((s) => (
            <button
              key={s.key}
              className={"tab" + (sort.key == s.key ? " active" : "")}
              onClick={() => changeSort(s.key)}
              aria-pressed={sort.key == s.key}
            >
              {s.label}
              {sort.key == s.key && <span className={"sort-dir"}>{sort.desc ? "↓" : "↑"}</span>}
            </button>
          ))}
        </div>
      </div>
      {result.users.length == 0 ? (
        <div className={"empty"}>
          <span className={"empty-icon"}>🔍</span>
          No users match &quot;{debouncedQuery}&quot;.
        </div>
      ) : (
        <div
          className={"user-rows" + (loading ? " is-loading" : "")}
          key={`${page}-${debouncedQuery}-${sort.key}-${sort.desc}`}
        >
          {result.users.map((user, i) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              className={"user-row"}
              style={{ "--i": i } as React.CSSProperties}
            >
              <MiniAvatar userId={user.id} avatarId={user.currentAvatar} />
              <span className={"who"}>
                <strong>{user.username ?? "Unknown"}</strong>
                <span className={"mono"}>{user.id}</span>
              </span>
              <span className={"counts"}>
                <span className={"tag violet"}>{plural(user.avatarCount, "avatar")}</span>
                {user.deletedAvatarCount > 0 && (
                  <span className={"tag danger"}>{user.deletedAvatarCount} hidden</span>
                )}
                <span className={"tag"}>{plural(user.usernameCount, "name")}</span>
              </span>
            </Link>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className={"pager"}>
          <button
            className={"btn btn-small"}
            disabled={page == 0 || loading}
            onClick={() => setPage(page - 1)}
          >
            ← Prev
          </button>
          <span>
            {page + 1} / {pages} · {result.total.toLocaleString()} users
          </span>
          <button
            className={"btn btn-small"}
            disabled={page >= pages - 1 || loading}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

function Admins() {
  const [data, setData] = useState<{ superAdmin: AdminEntry; admins: AdminEntry[] } | null>(null);
  const [discordId, setDiscordId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    axios.get("/api/admin/admins").then((resp) => setData(resp.data));
  }, []);

  const run = async (request: Promise<{ data: any }>) => {
    setBusy(true);
    setError(null);
    try {
      setData((await request).data);
      return true;
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (await run(axios.post("/api/admin/admins", { discordId: discordId.trim() }))) {
      setDiscordId("");
    }
  };

  const remove = (admin: AdminEntry) => {
    if (!confirm(`Revoke admin rights from ${admin.username ?? admin.discordId}?`)) return;
    run(axios.delete("/api/admin/admins", { params: { discordId: admin.discordId } }));
  };

  if (!data) return <div className={"spinner"} />;

  return (
    <>
      <p className={"lead"}>
        Admins can browse all users and hide avatars. Only you can grant or revoke admin rights.
      </p>
      <form className={"admin-form"} onSubmit={add}>
        <input
          className={"input"}
          placeholder={"Discord user ID, e.g. 347130390181445633"}
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          inputMode={"numeric"}
        />
        <button className={"btn btn-primary"} disabled={busy || !discordId.trim()}>
          Grant admin
        </button>
      </form>
      {error && <p className={"error-text"}>{error}</p>}
      <div className={"user-rows"}>
        <AdminRow admin={data.superAdmin} index={0}>
          <span className={"tag violet"}>super admin</span>
        </AdminRow>
        {data.admins.map((admin, i) => (
          <AdminRow key={admin.discordId} admin={admin} index={i + 1}>
            <span className={"mono"}>since {formatDate(admin.createdAt!)}</span>
            <button className={"btn btn-danger btn-small"} disabled={busy} onClick={() => remove(admin)}>
              Revoke
            </button>
          </AdminRow>
        ))}
      </div>
      {data.admins.length == 0 && (
        <div className={"empty"}>No other admins yet.</div>
      )}
    </>
  );
}

function AdminRow({
  admin,
  index,
  children,
}: React.PropsWithChildren<{ admin: AdminEntry; index: number }>) {
  return (
    <div className={"user-row"} style={{ "--i": index } as React.CSSProperties}>
      <MiniAvatar userId={admin.discordId} avatarId={admin.avatar} />
      <span className={"who"}>
        <strong>{admin.username ?? "Not tracked yet"}</strong>
        <span className={"mono"}>{admin.discordId}</span>
      </span>
      <span className={"counts"}>{children}</span>
    </div>
  );
}

function Stat({ i, value, label }: { i: number; value: number; label: string }) {
  return (
    <div className={"stat"} style={{ "--i": i } as React.CSSProperties}>
      <strong>{value.toLocaleString()}</strong>
      <span>{label}</span>
    </div>
  );
}
