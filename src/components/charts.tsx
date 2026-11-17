import { useMemo, useRef, useState, type ReactNode } from "react";

export type Series = { id: string; label: string; color: string; points: [number, number][]; dash?: string };
export type Marker = { x?: number; y?: number; label: string; color?: string };

type Props = {
  series: Series[];
  xLog?: boolean;
  yLog?: boolean;
  xLabel: string;
  yLabel: string;
  xFmt: (v: number) => string;
  yFmt: (v: number) => string;
  markers?: Marker[];
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  footer?: ReactNode;
};

function ticksLog(min: number, max: number) {
  const out: number[] = [];
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * 10 ** e;
      if (v >= min * 0.999 && v <= max * 1.001) out.push(v);
    }
  }
  if (out.length > 9) return out.filter((v) => Math.abs(Math.log10(v) % 1) < 1e-9 || Math.abs((Math.log10(v) % 1) - 0) < 1e-9);
  return out;
}

function ticksLin(min: number, max: number) {
  const span = max - min;
  const step0 = 10 ** Math.floor(Math.log10(span / 5));
  const step = [1, 2, 5, 10].map((m) => m * step0).find((s) => span / s <= 6) ?? step0 * 10;
  const out: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) out.push(v);
  return out;
}

/** Small, dependency-free SVG chart with log/linear axes, threshold markers and a hover readout. */
export function Chart({ series, xLog, yLog, xLabel, yLabel, xFmt, yFmt, markers = [], height = 220, xDomain, yDomain, footer }: Props) {
  const W = 360;
  const H = height;
  const m = { l: 46, r: 10, t: 10, b: 30 };
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement | null>(null);

  const dom = useMemo(() => {
    const xs = series.flatMap((s) => s.points.map((p) => p[0])).filter((v) => (xLog ? v > 0 : Number.isFinite(v)));
    const ys = series.flatMap((s) => s.points.map((p) => p[1])).filter((v) => (yLog ? v > 0 : Number.isFinite(v)));
    const x: [number, number] = xDomain ?? [Math.min(...xs), Math.max(...xs)];
    const y: [number, number] = yDomain ?? [Math.min(...ys), Math.max(...ys)];
    return { x, y };
  }, [series, xLog, yLog, xDomain, yDomain]);

  if (!series.length || !Number.isFinite(dom.x[0]) || !Number.isFinite(dom.y[0]) || dom.x[0] === dom.x[1]) {
    return <p className="py-6 text-center text-[12px] text-faint">Nessun dato da tracciare in questa configurazione.</p>;
  }

  const sx = (v: number) => {
    const [a, b] = dom.x;
    const t = xLog ? (Math.log10(v) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) : (v - a) / (b - a);
    return m.l + t * (W - m.l - m.r);
  };
  const sy = (v: number) => {
    const [a, b] = dom.y;
    const vv = yLog ? Math.max(v, a) : v;
    const t = yLog ? (Math.log10(vv) - Math.log10(a)) / (Math.log10(b) - Math.log10(a)) : (vv - a) / (b - a);
    return H - m.b - Math.min(1.05, Math.max(-0.02, t)) * (H - m.t - m.b);
  };
  const invX = (px: number) => {
    const t = (px - m.l) / (W - m.l - m.r);
    const [a, b] = dom.x;
    return xLog ? 10 ** (Math.log10(a) + t * (Math.log10(b) - Math.log10(a))) : a + t * (b - a);
  };
  const xt = xLog ? ticksLog(dom.x[0], dom.x[1]) : ticksLin(dom.x[0], dom.x[1]);
  const yt = yLog ? ticksLog(dom.y[0], dom.y[1]) : ticksLin(dom.y[0], dom.y[1]);

  const hoverX = hover != null ? invX(hover) : null;
  const readout =
    hoverX != null
      ? series.map((s) => {
          let best = s.points[0];
          for (const p of s.points) if (Math.abs(p[0] - hoverX) < Math.abs(best[0] - hoverX)) best = p;
          return { s, p: best };
        })
      : [];

  return (
    <figure>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          setHover(px >= m.l && px <= W - m.r ? px : null);
        }}
        onPointerLeave={() => setHover(null)}
      >
        <clipPath id="plot">
          <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} />
        </clipPath>
        {yt.map((v) => (
          <g key={`y${v}`}>
            <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth="0.6" />
            <text x={m.l - 5} y={sy(v) + 3} textAnchor="end" fontSize="8.5" fill="var(--faint)" className="num">
              {yFmt(v)}
            </text>
          </g>
        ))}
        {xt.map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={m.t} y2={H - m.b} stroke="var(--line)" strokeWidth="0.6" />
            <text x={sx(v)} y={H - m.b + 11} textAnchor="middle" fontSize="8.5" fill="var(--faint)" className="num">
              {xFmt(v)}
            </text>
          </g>
        ))}
        <text x={(m.l + W - m.r) / 2} y={H - 3} textAnchor="middle" fontSize="9" fill="var(--muted)">
          {xLabel}
        </text>
        <text x={10} y={(m.t + H - m.b) / 2} textAnchor="middle" fontSize="9" fill="var(--muted)" transform={`rotate(-90 10 ${(m.t + H - m.b) / 2})`}>
          {yLabel}
        </text>
        <g clipPath="url(#plot)">
          {markers.map((mk, i) =>
            mk.y != null ? (
              <g key={i}>
                <line x1={m.l} x2={W - m.r} y1={sy(mk.y)} y2={sy(mk.y)} stroke={mk.color ?? "var(--faint)"} strokeDasharray="3 3" strokeWidth="0.8" />
                <text x={W - m.r - 3} y={sy(mk.y) - 3} textAnchor="end" fontSize="8.5" fill={mk.color ?? "var(--muted)"}>
                  {mk.label}
                </text>
              </g>
            ) : mk.x != null ? (
              <g key={i}>
                <line x1={sx(mk.x)} x2={sx(mk.x)} y1={m.t} y2={H - m.b} stroke={mk.color ?? "var(--faint)"} strokeDasharray="3 3" strokeWidth="0.8" />
                <text x={sx(mk.x) + 3} y={m.t + 9 + (i % 4) * 10} fontSize="8.5" fill={mk.color ?? "var(--muted)"}>
                  {mk.label}
                </text>
              </g>
            ) : null,
          )}
          {series.map((s) => (
            <path
              key={s.id}
              d={s.points
                .filter((p) => (!xLog || p[0] > 0) && (!yLog || p[1] > 0))
                .map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`)
                .join("")}
              fill="none"
              stroke={s.color}
              strokeWidth="1.8"
              strokeDasharray={s.dash}
            />
          ))}
          {hover != null && <line x1={hover} x2={hover} y1={m.t} y2={H - m.b} stroke="var(--fg)" strokeOpacity="0.4" />}
          {readout.map(({ s, p }) => (p[1] > 0 || !yLog ? <circle key={s.id} cx={sx(p[0])} cy={sy(p[1])} r="2.8" fill={s.color} /> : null))}
        </g>
      </svg>
      <figcaption className="flex min-h-5 flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        {hoverX != null ? (
          <>
            <span className="num text-muted">{xFmt(hoverX)}</span>
            {readout.map(({ s, p }) => (
              <span key={s.id} className="num" style={{ color: s.color }}>
                {s.label}: {yFmt(p[1])}
              </span>
            ))}
          </>
        ) : (
          series.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1 text-muted">
              <span className="inline-block h-0.5 w-3" style={{ background: s.color }} />
              {s.label}
            </span>
          ))
        )}
      </figcaption>
      {footer}
    </figure>
  );
}

export function BarRows({ rows, fmt, color = "var(--ember)" }: { rows: { label: string; value: number; sub?: string }[]; fmt: (v: number) => string; color?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[6.5rem_minmax(0,1fr)_4.5rem] items-center gap-2 text-[11.5px]">
          <span className="truncate text-muted">{r.label}</span>
          <span className="h-2 overflow-hidden rounded-full bg-surface-3">
            <span className="block h-full rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color }} />
          </span>
          <span className="num text-right">{fmt(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}
