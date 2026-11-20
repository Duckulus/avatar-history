import axios from "axios";
import { useEffect, useState } from "react";
import { LineChart, Point, SERIES, StackedBars } from "./Charts";
import { formatDateTime, formatRelative } from "../utils/format";

interface Run {
  id: number;
  startedAt: string;
  durationMs: number;
  members: number;
  newAvatars: number;
  newUsernames: number;
  failedDownloads: number;
  error: string | null;
}

interface Health {
  now: number;
  lastRun: Run | null;
  lastSuccessAt: string | null;
  recent: Run[];
  hourly: {
    start: number;
    runs: number;
    failed: number;
    newAvatars: number;
    newUsernames: number;
    avgDurationMs: number | null;
    maxDurationMs: number | null;
  }[];
  daily: { start: number; avatars: number; usernames: number }[];
  day: {
    runs: number;
    failed: number;
    failedDownloads: number;
    newAvatars: number;
    newUsernames: number;
    medianDurationMs: number | null;
    p95DurationMs: number | null;
  };
  counts: { accounts: number; activeSessions: number; profileShares: number; wrappedShares: number };
  system: {
    dbBytes: number | null;
    disk: { total: number; free: number } | null;
    webUptimeSeconds: number;
    webMemoryBytes: number;
    node: string;
  };
}

// runs are scheduled every 30s; a few missed ones are fine
const STALE_AFTER_MS = 3 * 60_000;
const REFRESH_MS = 30_000;

export const formatMs = (ms: number) =>
  ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;

const formatBytes = (bytes: number) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(bytes < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
};

const hourLabel = (ms: number) => new Date(ms).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
const dayLabel = (ms: number) => new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short" });

type Status = { level: "good" | "warning" | "critical" | "unknown"; icon: string; label: string; detail: string };

const status = (health: Health): Status => {
  const last = health.lastRun;
  if (!last) {
    return { level: "unknown", icon: "…", label: "No data yet", detail: "Runs are recorded since this version was deployed" };
  }
  const age = health.now - new Date(last.startedAt).getTime();
  if (age > STALE_AFTER_MS) {
    return { level: "critical", icon: "✖", label: "Stalled", detail: `last run ${formatRelative(last.startedAt, health.now)}` };
  }
  if (last.error) {
    return {
      level: "critical",
      icon: "✖",
      label: "Failing",
      detail: health.lastSuccessAt
        ? `last success ${formatRelative(health.lastSuccessAt, health.now)}`
        : "no successful run recorded",
    };
  }
  if (health.day.failed > 0 || health.day.failedDownloads > 0) {
    return { level: "warning", icon: "⚠", label: "Running", detail: "with errors in the last 24h" };
  }
  return { level: "good", icon: "✔", label: "Running", detail: `last run ${formatRelative(last.startedAt, health.now)}` };
};

export function AdminHealth() {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = () =>
      axios
        .get("/api/admin/health")
        .then((resp) => {
          setHealth(resp.data);
          setFailed(false);
        })
        .catch(() => setFailed(true));
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  if (!health) {
    return failed ? (
      <div className={"empty"} role={"alert"}>
        <span className={"empty-icon"}>⚠️</span>
        Health data could not be loaded.
      </div>
    ) : (
      <div className={"spinner"} />
    );
  }

  const s = status(health);
  const { day, counts, system } = health;

  const hourly: Point[] = health.hourly.map((h) => ({
    key: h.start,
    tick: hourLabel(h.start),
    title: `${dayLabel(h.start)}, ${hourLabel(h.start)}`,
    values: [h.newAvatars, h.newUsernames],
    notes: [`${h.runs} runs${h.failed ? `, ${h.failed} failed` : ""}`],
    alert: h.failed > 0,
  }));
  const durations: Point[] = health.hourly.map((h) => ({
    key: h.start,
    tick: hourLabel(h.start),
    title: `${dayLabel(h.start)}, ${hourLabel(h.start)}`,
    values: [h.avgDurationMs],
    notes: h.runs
      ? [`slowest ${formatMs(h.maxDurationMs!)}`, `${h.runs} runs${h.failed ? `, ${h.failed} failed` : ""}`]
      : ["no runs"],
    alert: h.failed > 0,
  }));
  const daily: Point[] = health.daily.map((d) => ({
    key: d.start,
    tick: dayLabel(d.start),
    title: new Date(d.start).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }),
    values: [d.avatars, d.usernames],
  }));
  const diskUsed = system.disk ? 1 - system.disk.free / system.disk.total : null;

  return (
    <div className={"health"}>
      <div className={"stats"}>
        <div className={`stat status-tile ${s.level}`} style={{ "--i": 0 } as React.CSSProperties}>
          <strong>
            <span aria-hidden>{s.icon}</span> {s.label}
          </strong>
          <span>update loop · {s.detail}</span>
        </div>
        <Tile i={1} value={day.runs.toLocaleString()} label={`runs in 24h${day.failed ? ` · ${day.failed} failed` : ""}`} warn={day.failed > 0} />
        <Tile
          i={2}
          value={day.medianDurationMs == null ? "–" : formatMs(day.medianDurationMs)}
          label={`median run${day.p95DurationMs == null ? "" : ` · p95 ${formatMs(day.p95DurationMs)}`}`}
        />
        <Tile i={3} value={health.lastRun ? health.lastRun.members.toLocaleString() : "–"} label={"members in last run"} />
      </div>

      <section className={"health-section"}>
        <div className={"section-head"}>
          <h3>Changes per hour</h3>
          <span className={"count"}>
            last 48h · {day.newAvatars.toLocaleString()} avatars, {day.newUsernames.toLocaleString()} usernames in 24h
          </span>
        </div>
        <StackedBars points={hourly} series={[SERIES.avatars, SERIES.usernames]} />
      </section>

      <section className={"health-section"}>
        <div className={"section-head"}>
          <h3>Run duration</h3>
          <span className={"count"}>average per hour, last 48h</span>
        </div>
        <LineChart points={durations} series={SERIES.duration} format={formatMs} />
      </section>

      <section className={"health-section"}>
        <div className={"section-head"}>
          <h3>Changes per day</h3>
          <span className={"count"}>last 30 days, from the archive</span>
        </div>
        <StackedBars points={daily} series={[SERIES.avatars, SERIES.usernames]} />
      </section>

      <section className={"health-section"}>
        <div className={"section-head"}>
          <h3>Recent runs with changes or errors</h3>
        </div>
        {health.recent.length == 0 ? (
          <div className={"empty"}>Nothing recorded yet.</div>
        ) : (
          <div className={"chart-table"}>
            <table>
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Members</th>
                  <th>Avatars</th>
                  <th>Usernames</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {health.recent.map((run) => (
                  <tr key={run.id}>
                    <td title={formatDateTime(run.startedAt)}>{formatRelative(run.startedAt, health.now)}</td>
                    <td>{formatMs(run.durationMs)}</td>
                    <td>{run.members.toLocaleString()}</td>
                    <td>+{run.newAvatars}</td>
                    <td>+{run.newUsernames}</td>
                    <td className={run.error || run.failedDownloads ? "danger-text" : undefined}>
                      {run.error
                        ? `✖ ${run.error}`
                        : run.failedDownloads
                          ? `⚠ ${run.failedDownloads} downloads failed`
                          : "✔ ok"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={"health-section"}>
        <div className={"section-head"}>
          <h3>Site & system</h3>
        </div>
        <div className={"stats"}>
          <Tile i={0} value={counts.accounts.toLocaleString()} label={"signed up accounts"} />
          <Tile i={1} value={counts.activeSessions.toLocaleString()} label={"active sessions"} />
          <Tile i={2} value={counts.profileShares.toLocaleString()} label={"shared profiles"} />
          <Tile i={3} value={counts.wrappedShares.toLocaleString()} label={"shared Wrapped"} />
          <Tile i={4} value={system.dbBytes == null ? "–" : formatBytes(system.dbBytes)} label={"database size"} />
          <Tile
            i={5}
            value={system.disk ? formatBytes(system.disk.free) : "–"}
            label={diskUsed == null ? "disk free" : `disk free · ${Math.round(diskUsed * 100)}% used`}
            warn={diskUsed != null && diskUsed > 0.9}
          />
          <Tile i={6} value={formatUptime(system.webUptimeSeconds)} label={"web uptime"} />
          <Tile i={7} value={formatBytes(system.webMemoryBytes)} label={`web memory · node ${system.node}`} />
        </div>
      </section>
    </div>
  );
}

function Tile({ i, value, label, warn }: { i: number; value: string; label: string; warn?: boolean }) {
  return (
    <div className={"stat" + (warn ? " status-tile warning" : "")} style={{ "--i": i } as React.CSSProperties}>
      <strong>
        {warn && <span aria-hidden>⚠ </span>}
        {value}
      </strong>
      <span>{label}</span>
    </div>
  );
}
