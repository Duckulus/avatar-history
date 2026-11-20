/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import path from "path";
import { formatDuration } from "./format";
import { MONTHS, WrappedStats } from "./wrapped";

// Link preview image of a shared Wrapped, the thing people see in Discord embeds.
// Rendered with satori (flexbox subset of CSS, no grid).

const BG = "#0b0a1a";
const TEXT = "#f3f1ff";
const MUTED = "#a7a3c9";
const ACCENT = "#8c84e0";
const ACCENT_2 = "#c993bd";
const ACCENT_3 = "#7cc8bb";
const MAX_TILES = 9;

// Same directory apps/cdn serves, relative to the workspace cwd
const AVATAR_DIR = path.resolve(process.cwd(), "../../static/avatars");

// satori needs ttf/otf/woff, not woff2. The packages are hoisted to the repo
// root by yarn workspaces, but fall back to the workspace's own node_modules.
const fontFile = async (pkg: string, file: string) => {
  for (const base of ["../../node_modules", "node_modules"]) {
    try {
      return await readFile(path.resolve(process.cwd(), base, pkg, "files", file));
    } catch {}
  }
  throw new Error(`Font ${pkg}/${file} not found`);
};

let fonts: Promise<{ name: string; data: Buffer; weight: 500 | 700; style: "normal" }[]> | null = null;
const loadFonts = () =>
  (fonts ??= Promise.all([
    fontFile("@fontsource/inter", "inter-latin-500-normal.woff").then((data) => ({
      name: "Inter", data, weight: 500 as const, style: "normal" as const,
    })),
    fontFile("@fontsource/space-grotesk", "space-grotesk-latin-700-normal.woff").then((data) => ({
      name: "Space Grotesk", data, weight: 700 as const, style: "normal" as const,
    })),
  ]).catch((e) => {
    fonts = null;
    throw e;
  }));

const avatarDataUri = async (userId: string, avatarId: string) => {
  try {
    const data = await readFile(path.join(AVATAR_DIR, userId, `${path.basename(avatarId)}.png`));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
};

export const renderWrappedOg = async (
  stats: WrappedStats,
  name: string,
  beatenPercent: number | null,
  host: string
) => {
  const shown = (stats.avatars.length > 0 ? stats.avatars : stats.last ? [stats.last] : []).slice(-MAX_TILES);
  const [loadedFonts, images] = await Promise.all([
    loadFonts(),
    Promise.all(shown.map((avatar) => avatarDataUri(avatar.userId, avatar.id))),
  ]);

  const facts: [string, string][] = [];
  if (stats.pfpOfTheYear) facts.push([formatDuration(stats.pfpOfTheYear.ms), "longest worn pfp"]);
  if (beatenPercent != null) facts.push([`Top ${Math.max(1, 100 - beatenPercent)}%`, "of all members"]);
  else if (stats.busiestMonth != null) facts.push([MONTHS[stats.busiestMonth], "busiest month"]);
  facts.push([String(stats.usernames.length), stats.usernames.length == 1 ? "new username" : "new usernames"]);

  // up to 3 rows of 3; fewer avatars get bigger tiles
  const cols = shown.length <= 1 ? 1 : shown.length <= 4 ? 2 : 3;
  const size = cols == 1 ? 300 : cols == 2 ? 170 : 132;
  const rows: (string | null)[][] = [];
  for (let i = 0; i < shown.length; i += cols) rows.push(images.slice(i, i + cols));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: "56px 64px",
          backgroundColor: BG,
          backgroundImage: `radial-gradient(circle at 8% 10%, ${ACCENT}66, transparent 45%), radial-gradient(circle at 95% 95%, ${ACCENT_2}55, transparent 50%), radial-gradient(circle at 85% 10%, ${ACCENT_3}33, transparent 35%)`,
          color: TEXT,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", position: "relative", width: 44, height: 44 }}>
              {[ACCENT, ACCENT_2, ACCENT_3].map((color, i) => (
                <div
                  key={color}
                  style={{
                    position: "absolute",
                    left: i * 8,
                    top: i * 8,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: color,
                    border: `3px solid ${BG}`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 32 }}>
              <span>avatar</span>
              {/* satori puts a space between adjacent inline elements */}
              <span style={{ color: ACCENT_2, marginLeft: -5 }}>history</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, color: MUTED }}>{`${name}'s ${stats.year} in pfps`}</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
              <div
                style={{
                  fontFamily: "Space Grotesk",
                  fontSize: 190,
                  lineHeight: 1,
                  backgroundImage: `linear-gradient(120deg, ${ACCENT}, ${ACCENT_2})`,
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {String(stats.avatars.length)}
              </div>
              <div style={{ display: "flex", flexDirection: "column", paddingBottom: 26 }}>
                <div style={{ fontFamily: "Space Grotesk", fontSize: 44 }}>
                  {stats.avatars.length == 1 ? "new pfp" : "new pfps"}
                </div>
                <div style={{ fontSize: 30, color: MUTED }}>{stats.persona.title}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 40 }}>
            {facts.map(([value, label]) => (
              <div key={label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "Space Grotesk", fontSize: 38 }}>{value}</div>
                <div style={{ fontSize: 24, color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 26, color: MUTED, display: "flex" }}>
            Get yours at&nbsp;<span style={{ color: ACCENT_3 }}>{host}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 16,
            width: 440,
            alignItems: "center",
          }}
        >
          {rows.map((row, r) => (
            <div key={r} style={{ display: "flex", gap: 16 }}>
              {row.map((src, c) =>
                src ? (
                  <img
                    key={c}
                    src={src}
                    width={size}
                    height={size}
                    style={{ borderRadius: size / 2, border: `4px solid ${BG}`, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    key={c}
                    style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      backgroundColor: [ACCENT, ACCENT_2, ACCENT_3][(r * cols + c) % 3],
                    }}
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: loadedFonts }
  );
};
