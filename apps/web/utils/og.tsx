/* eslint-disable @next/next/no-img-element */
import { readFile } from "fs/promises";
import path from "path";

// Shared pieces of the link preview images (og:image) rendered with next/og.

export const BG = "#0b0a1a";
export const TEXT = "#f3f1ff";
export const MUTED = "#a7a3c9";
export const ACCENT = "#8c84e0";
export const ACCENT_2 = "#c993bd";
export const ACCENT_3 = "#7cc8bb";

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
export const loadFonts = () =>
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

export const avatarDataUri = async (userId: string, avatarId: string) => {
  try {
    const data = await readFile(path.join(AVATAR_DIR, userId, `${path.basename(avatarId)}.png`));
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
};

// Logo + wordmark in the top left of every preview
export const Brand = () => (
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
);
