import { MONTHS, WrappedAvatar, WrappedStats } from "./wrapped";
import { formatDuration } from "./format";

// Portrait share image (4:5, fits Instagram, Discord and X), drawn on a canvas
const WIDTH = 1080;
const HEIGHT = 1350;
const MAX_TILES = 15;

const BG = "#0b0a1a";
const TEXT = "#f3f1ff";
const MUTED = "#a7a3c9";
const ACCENT = "#8c84e0";
const ACCENT_2 = "#c993bd";
const ACCENT_3 = "#7cc8bb";
const DISPLAY = '"Space Grotesk", system-ui, sans-serif';
const BODY = '"Inter", system-ui, sans-serif';

// Avatars are loaded through our own origin, see pages/api/avatars/file/[id].ts
const loadAvatar = (avatar: WrappedAvatar) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = `/api/avatars/file/${encodeURIComponent(avatar.id)}`;
  });

const blob = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
  gradient.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
  gradient.addColorStop(1, color + "00");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
};

const circleImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null,
  x: number,
  y: number,
  r: number,
  fallback: string
) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r + 5, 0, Math.PI * 2);
  ctx.fillStyle = BG;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (image) ctx.drawImage(image, x - r, y - r, r * 2, r * 2);
  else {
    ctx.fillStyle = fallback;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
};

const gradient = (ctx: CanvasRenderingContext2D, x: number, width: number) => {
  const g = ctx.createLinearGradient(x, 0, x + width, 0);
  g.addColorStop(0, ACCENT);
  g.addColorStop(1, ACCENT_2);
  return g;
};

export const renderWrappedCard = async (
  stats: WrappedStats,
  name: string,
  beatenPercent: number | null,
  host: string
): Promise<Blob> => {
  // web fonts are loaded lazily, only once something on the page uses that weight
  await Promise.all(
    ["700 100px", "600 100px"].map((w) => document.fonts.load(`${w} "Space Grotesk"`).catch(() => null))
      .concat(["500 100px", "600 100px"].map((w) => document.fonts.load(`${w} "Inter"`).catch(() => null)))
  );

  // newest last; show the most recent ones when there are too many
  const shown = stats.avatars.length > 0 ? stats.avatars.slice(-MAX_TILES) : stats.last ? [stats.last] : [];
  const images = await Promise.all(shown.map(loadAvatar));

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  blob(ctx, 120, 80, 620, ACCENT, 0.5);
  blob(ctx, 1000, 1250, 680, ACCENT_2, 0.4);
  blob(ctx, 960, 200, 420, ACCENT_3, 0.28);

  const pad = 80;

  // brand
  [ACCENT, ACCENT_2, ACCENT_3].forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(pad + 16 + i * 9, 96 + i * 9, 16, 0, Math.PI * 2);
    ctx.fillStyle = BG;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pad + 16 + i * 9, 96 + i * 9, 12.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });
  ctx.textBaseline = "middle";
  ctx.font = `700 34px ${DISPLAY}`;
  ctx.fillStyle = TEXT;
  ctx.fillText("avatar", pad + 70, 106);
  const avatarWidth = ctx.measureText("avatar").width;
  ctx.fillStyle = gradient(ctx, pad + 70 + avatarWidth, 120);
  ctx.fillText("history", pad + 70 + avatarWidth, 106);

  ctx.textAlign = "right";
  ctx.font = `600 30px ${BODY}`;
  ctx.fillStyle = MUTED;
  ctx.fillText("WRAPPED", WIDTH - pad, 106);
  ctx.textAlign = "left";

  // headline
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 34px ${BODY}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(`${name}'s ${stats.year} in pfps`, pad, 240);

  ctx.font = `700 210px ${DISPLAY}`;
  const count = String(stats.avatars.length);
  const countWidth = ctx.measureText(count).width;
  ctx.fillStyle = gradient(ctx, pad, countWidth);
  ctx.fillText(count, pad - 6, 430);
  ctx.font = `600 46px ${DISPLAY}`;
  ctx.fillStyle = TEXT;
  ctx.fillText(stats.avatars.length == 1 ? "new pfp" : "new pfps", pad + countWidth + 24, 360);
  ctx.font = `500 34px ${BODY}`;
  ctx.fillStyle = MUTED;
  ctx.fillText(`${stats.persona.emoji} ${stats.persona.title}`, pad + countWidth + 24, 418);

  // collage, centered in the area between headline and stats
  const areaTop = 490;
  const areaHeight = 520;
  const cols = 5;
  const gap = 22;
  const rows = Math.max(1, Math.ceil(shown.length / cols));
  const size = Math.min(
    (WIDTH - pad * 2 - gap * (cols - 1)) / cols,
    (areaHeight - gap * (rows - 1)) / rows
  );
  const top = areaTop + (areaHeight - rows * size - (rows - 1) * gap) / 2;
  shown.forEach((_, i) => {
    const row = Math.floor(i / cols);
    const inRow = Math.min(cols, shown.length - row * cols);
    const left = (WIDTH - inRow * size - (inRow - 1) * gap) / 2;
    const x = left + (i % cols) * (size + gap) + size / 2;
    const y = top + row * (size + gap) + size / 2;
    circleImage(ctx, images[i], x, y, size / 2, [ACCENT, ACCENT_2, ACCENT_3][i % 3]);
  });

  // stats
  const facts: [string, string][] = [];
  if (stats.pfpOfTheYear) facts.push([formatDuration(stats.pfpOfTheYear.ms), "longest worn pfp"]);
  facts.push([String(stats.usernames.length), stats.usernames.length == 1 ? "new username" : "new usernames"]);
  if (beatenPercent != null) facts.push([`Top ${Math.max(1, 100 - beatenPercent)}%`, "of all members"]);
  else if (stats.busiestMonth != null) facts.push([MONTHS[stats.busiestMonth], "busiest month"]);

  const statTop = 1090;
  const statWidth = (WIDTH - pad * 2) / facts.length;
  facts.forEach(([value, label], i) => {
    const x = pad + i * statWidth;
    ctx.font = `700 50px ${DISPLAY}`;
    ctx.fillStyle = TEXT;
    ctx.fillText(value, x, statTop, statWidth - 20);
    ctx.font = `500 28px ${BODY}`;
    ctx.fillStyle = MUTED;
    ctx.fillText(label, x, statTop + 44, statWidth - 20);
  });

  // footer
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, 1200);
  ctx.lineTo(WIDTH - pad, 1200);
  ctx.stroke();
  ctx.font = `600 32px ${BODY}`;
  ctx.fillStyle = TEXT;
  ctx.fillText("Get yours at", pad, 1270);
  const lead = ctx.measureText("Get yours at ").width;
  ctx.fillStyle = ACCENT_3;
  ctx.fillText(host, pad + lead, 1270);

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((png) => (png ? resolve(png) : reject(new Error("Export failed"))), "image/png")
  );
};
