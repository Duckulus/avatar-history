import { ReactNode, useEffect, useRef, useState } from "react";

// Small dependency free SVG charts for the admin health tab.
// Series colors were checked for color vision deficiencies against the dark
// panel surface; text always uses the text tokens, never a series color.

export interface Series {
  name: string;
  color: string;
}

export const SERIES = {
  avatars: { name: "Avatars", color: "#8c84e0" },
  usernames: { name: "Usernames", color: "#2fa592" },
  duration: { name: "Avg. duration", color: "#8c84e0" },
} satisfies Record<string, Series>;

const HEIGHT = 180;
const PAD = { top: 10, right: 8, bottom: 22, left: 40 };

const useWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
};

// 0 and two or three round steps above
const niceTicks = (max: number) => {
  if (max <= 0) return [0, 1];
  const rough = max / 3;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough)!;
  const ticks: number[] = [];
  for (let v = 0; v < max + step; v += step) ticks.push(v);
  return ticks;
};

// rectangle with rounded top corners, square at the baseline
const barPath = (x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

export interface Point {
  key: string | number;
  // axis label, only every few points are labeled
  tick: string;
  // first line of the tooltip
  title: string;
  values: (number | null)[];
  // extra tooltip lines
  notes?: string[];
  // drawn as a status marker (with ⚠ in the tooltip)
  alert?: boolean;
}

function Frame({
  series,
  points,
  format,
  children,
}: {
  series: Series[];
  points: Point[];
  format: (v: number) => string;
  children: (width: number) => ReactNode;
}) {
  const [ref, width] = useWidth();
  const [table, setTable] = useState(false);
  return (
    <div className={"chart"}>
      <div className={"chart-top"}>
        {series.length > 1 ? (
          <div className={"chart-legend"}>
            {series.map((s) => (
              <span key={s.name}>
                <i style={{ background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <button className={"link-button"} onClick={() => setTable(!table)}>
          {table ? "Show chart" : "Show table"}
        </button>
      </div>
      {table ? (
        <div className={"chart-table"}>
          <table>
            <thead>
              <tr>
                <th />
                {series.map((s) => (
                  <th key={s.name}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.key}>
                  <td>
                    {p.alert && "⚠ "}
                    {p.title}
                  </td>
                  {p.values.map((v, i) => (
                    <td key={i}>{v == null ? "–" : format(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div ref={ref} className={"chart-plot"}>
          {width > 0 && children(width)}
        </div>
      )}
    </div>
  );
}

function Tooltip({ x, width, point, series, format }: {
  x: number;
  width: number;
  point: Point;
  series: Series[];
  format: (v: number) => string;
}) {
  // keep it inside the plot
  const left = Math.min(Math.max(x, 80), width - 80);
  return (
    <div className={"chart-tooltip"} style={{ left }}>
      <strong>
        {point.alert && "⚠ "}
        {point.title}
      </strong>
      {series.map((s, i) => (
        <span key={s.name}>
          <i style={{ background: s.color }} />
          {s.name}: {point.values[i] == null ? "–" : format(point.values[i]!)}
        </span>
      ))}
      {point.notes?.map((note) => (
        <span key={note} className={"chart-note"}>
          {note}
        </span>
      ))}
    </div>
  );
}

function Axis({ width, ticks, y, points, x, format }: {
  width: number;
  ticks: number[];
  y: (v: number) => number;
  points: Point[];
  x: (i: number) => number;
  format: (v: number) => string;
}) {
  // roughly one label per 70px
  const every = Math.max(1, Math.ceil(points.length / Math.max(1, Math.floor((width - PAD.left) / 70))));
  return (
    <>
      {ticks.map((t) => (
        <g key={t}>
          <line className={"chart-grid"} x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} />
          <text className={"chart-axis"} x={PAD.left - 6} y={y(t)} dy={"0.32em"} textAnchor={"end"}>
            {format(t)}
          </text>
        </g>
      ))}
      {points.map((p, i) =>
        (points.length - 1 - i) % every == 0 ? (
          <text
            key={p.key}
            className={"chart-axis"}
            x={Math.min(x(i), width - PAD.right)}
            y={HEIGHT - 6}
            // labels at the edges must not stick out of the plot
            textAnchor={x(i) > width - PAD.right - 28 ? "end" : "middle"}
          >
            {p.tick}
          </text>
        ) : null
      )}
    </>
  );
}

// Stacked columns, e.g. new avatars + new usernames per hour
export function StackedBars({
  points,
  series,
  format = (v) => v.toLocaleString(),
}: {
  points: Point[];
  series: Series[];
  format?: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Frame series={series} points={points} format={format}>
      {(width) => {
        const totals = points.map((p) => p.values.reduce<number>((sum, v) => sum + (v ?? 0), 0));
        const ticks = niceTicks(Math.max(...totals));
        const top = ticks[ticks.length - 1];
        const plotW = width - PAD.left - PAD.right;
        const slot = plotW / points.length;
        const gap = slot > 6 ? 2 : 1;
        const barW = Math.max(1, slot - gap);
        const y = (v: number) => PAD.top + (1 - v / top) * (HEIGHT - PAD.top - PAD.bottom);
        const x = (i: number) => PAD.left + i * slot + slot / 2;
        return (
          <>
            <svg width={width} height={HEIGHT} onMouseLeave={() => setHover(null)}>
              <Axis width={width} ticks={ticks} y={y} points={points} x={x} format={(v) => v.toLocaleString()} />
              {points.map((p, i) => {
                let base = 0;
                const visible = p.values.map((v) => (v ?? 0) > 0);
                const last = visible.lastIndexOf(true);
                return (
                  <g key={p.key} opacity={hover == null || hover == i ? 1 : 0.55}>
                    {p.values.map((v, s) => {
                      if (!v) return null;
                      const y0 = y(base);
                      base += v;
                      const y1 = y(base);
                      // 2px surface gap between stacked segments
                      const h = Math.max(1, y0 - y1 - (base > v ? 2 : 0));
                      const bx = PAD.left + i * slot + gap / 2;
                      return s == last ? (
                        <path key={s} d={barPath(bx, y1, barW, h, 4)} fill={series[s].color} />
                      ) : (
                        <rect key={s} x={bx} y={y1} width={barW} height={h} fill={series[s].color} />
                      );
                    })}
                    {/* hit target: the whole column */}
                    <rect
                      x={PAD.left + i * slot}
                      y={PAD.top}
                      width={slot}
                      height={HEIGHT - PAD.top - PAD.bottom}
                      fill={"transparent"}
                      onMouseEnter={() => setHover(i)}
                      onTouchStart={() => setHover(i)}
                    />
                  </g>
                );
              })}
            </svg>
            {hover != null && (
              <Tooltip x={x(hover)} width={width} point={points[hover]} series={series} format={format} />
            )}
          </>
        );
      }}
    </Frame>
  );
}

// One series as a line with a crosshair, e.g. the run duration per hour
export function LineChart({
  points,
  series,
  format,
}: {
  points: Point[];
  series: Series;
  format: (v: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <Frame series={[series]} points={points} format={format}>
      {(width) => {
        const values = points.map((p) => p.values[0]);
        const ticks = niceTicks(Math.max(0, ...values.map((v) => v ?? 0)));
        const top = ticks[ticks.length - 1];
        const plotW = width - PAD.left - PAD.right;
        const step = points.length > 1 ? plotW / (points.length - 1) : plotW;
        const y = (v: number) => PAD.top + (1 - v / top) * (HEIGHT - PAD.top - PAD.bottom);
        const x = (i: number) => PAD.left + i * step;
        // gaps where there were no runs
        let d = "";
        values.forEach((v, i) => {
          if (v == null) return;
          d += `${i > 0 && values[i - 1] != null ? "L" : "M"}${x(i)},${y(v)}`;
        });
        const pick = (clientX: number, rect: DOMRect) =>
          setHover(Math.min(points.length - 1, Math.max(0, Math.round((clientX - rect.left - PAD.left) / step))));
        return (
          <>
            <svg
              width={width}
              height={HEIGHT}
              onMouseMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
              onTouchStart={(e) => pick(e.touches[0].clientX, e.currentTarget.getBoundingClientRect())}
              onMouseLeave={() => setHover(null)}
            >
              <Axis width={width} ticks={ticks} y={y} points={points} x={x} format={format} />
              <path d={d} fill={"none"} stroke={series.color} strokeWidth={2} strokeLinejoin={"round"} />
              {points.map((p, i) =>
                p.alert && values[i] != null ? (
                  <circle key={p.key} className={"chart-alert"} cx={x(i)} cy={y(values[i]!)} r={4} />
                ) : null
              )}
              {hover != null && (
                <>
                  <line className={"chart-crosshair"} x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
                  {values[hover] != null && (
                    <circle cx={x(hover)} cy={y(values[hover]!)} r={4} fill={series.color} className={"chart-ring"} />
                  )}
                </>
              )}
            </svg>
            {hover != null && (
              <Tooltip x={x(hover)} width={width} point={points[hover]} series={[series]} format={format} />
            )}
          </>
        );
      }}
    </Frame>
  );
}
