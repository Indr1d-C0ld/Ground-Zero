import type { Effects } from "@/lib/model/effects";
import { formatDist } from "@/lib/format";
import { useStore } from "@/state/store";

/** Side view of the stabilised mushroom cloud, with altitude references. */
export function CloudDiagram({ e }: { e: Effects }) {
  const units = useStore((s) => s.units);
  const W = 360;
  const H = 300;
  const m = { l: 40, r: 12, t: 12, b: 26 };
  const topKm = e.cloud.topM / 1000;
  const maxKm = Math.max(20, Math.ceil((topKm * 1.15) / 5) * 5);
  const halfWidthKm = Math.max(e.cloud.radiusM / 1000 * 1.25, maxKm * 0.45);
  const sy = (km: number) => H - m.b - (km / maxKm) * (H - m.t - m.b);
  const cx = (m.l + W - m.r) / 2;
  const sx = (km: number) => cx + (km / halfWidthKm) * ((W - m.l - m.r) / 2);
  const top = sy(topKm);
  const base = sy(e.cloud.baseM / 1000);
  const rx = sx(e.cloud.radiusM / 1000) - cx;
  const stemW = Math.max(3, rx * 0.22);
  const refs = [
    { km: 8.849, label: "Everest" },
    { km: 11, label: "Aereo di linea" },
    { km: 12, label: "Tropopausa (medie latitudini)", dash: true },
    { km: 18, label: "Concorde" },
    { km: 21, label: "U-2" },
    { km: 39, label: "Lancio di Baumgartner" },
    { km: 50, label: "Stratopausa", dash: true },
  ].filter((r) => r.km < maxKm);
  const ticks = Array.from({ length: Math.floor(maxKm / (maxKm > 40 ? 10 : 5)) + 1 }, (_, i) => i * (maxKm > 40 ? 10 : 5));
  const fb = e.fireballM / 1000;
  const hob = e.hobM / 1000;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <radialGradient id="cap" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f6e2c2" />
            <stop offset="55%" stopColor="#c9a27a" />
            <stop offset="100%" stopColor="#7b6450" />
          </radialGradient>
          <linearGradient id="stem" x1="0" x2="1">
            <stop offset="0%" stopColor="#6d5b4a" />
            <stop offset="50%" stopColor="#b2967a" />
            <stop offset="100%" stopColor="#6d5b4a" />
          </linearGradient>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--surface)" />
            <stop offset="100%" stopColor="var(--surface-2)" />
          </linearGradient>
        </defs>
        <rect x={m.l} y={m.t} width={W - m.l - m.r} height={H - m.t - m.b} fill="url(#sky)" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.l - 3} x2={m.l} y1={sy(t)} y2={sy(t)} stroke="var(--faint)" />
            <text x={m.l - 6} y={sy(t) + 3} textAnchor="end" fontSize="9" fill="var(--faint)" className="num">
              {t} km
            </text>
          </g>
        ))}
        {refs.map((r) => (
          <g key={r.label}>
            <line x1={m.l} x2={W - m.r} y1={sy(r.km)} y2={sy(r.km)} stroke="var(--line-strong)" strokeDasharray={r.dash ? "5 4" : "1 3"} />
            <text x={W - m.r - 3} y={sy(r.km) - 3} textAnchor="end" fontSize="8.5" fill="var(--muted)">
              {r.label}
            </text>
          </g>
        ))}
        {/* stem */}
        <path
          d={`M ${cx - stemW * 1.8} ${sy(0)} C ${cx - stemW} ${sy(0) - 20}, ${cx - stemW} ${base + 30}, ${cx - stemW * 1.3} ${base + 4} L ${cx + stemW * 1.3} ${base + 4} C ${cx + stemW} ${base + 30}, ${cx + stemW} ${sy(0) - 20}, ${cx + stemW * 1.8} ${sy(0)} Z`}
          fill="url(#stem)"
          opacity="0.9"
        />
        {/* cap */}
        <path
          d={`M ${cx - rx} ${base + (top - base) * 0.05}
              C ${cx - rx * 1.05} ${top + (base - top) * 0.2}, ${cx - rx * 0.55} ${top - 2}, ${cx} ${top}
              C ${cx + rx * 0.55} ${top - 2}, ${cx + rx * 1.05} ${top + (base - top) * 0.2}, ${cx + rx} ${base + (top - base) * 0.05}
              C ${cx + rx * 0.7} ${base + 8}, ${cx + rx * 0.2} ${base - 2}, ${cx} ${base + 4}
              C ${cx - rx * 0.2} ${base - 2}, ${cx - rx * 0.7} ${base + 8}, ${cx - rx} ${base + (top - base) * 0.05} Z`}
          fill="url(#cap)"
        />
        {/* fireball at burst height, to scale */}
        {fb > 0 && <circle cx={cx} cy={sy(hob)} r={Math.max(1.5, sx(fb) - cx)} fill="#fff1c9" opacity="0.85" />}
        <line x1={m.l} x2={W - m.r} y1={sy(0)} y2={sy(0)} stroke="var(--fg)" strokeOpacity="0.5" />
        {/* dimension lines */}
        <line x1={cx - rx} x2={cx + rx} y1={top - 6} y2={top - 6} stroke="var(--ember)" strokeWidth="0.8" />
        <text x={cx} y={top - 9} textAnchor="middle" fontSize="9" fill="var(--ember)" className="num">
          ⌀ {formatDist(e.cloud.radiusM * 2, units)}
        </text>
        <text x={cx + rx + 4} y={top + 4} fontSize="9" fill="var(--fg)" className="num">
          {formatDist(e.cloud.topM, units)}
        </text>
        <text x={cx} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--muted)">
          scala orizzontale compressa ×{(halfWidthKm / maxKm * ((H - m.t - m.b) / ((W - m.l - m.r) / 2))).toFixed(1)}
        </text>
      </svg>
      <figcaption className="text-[11.5px] text-faint">
        Nube stabilizzata, dimensioni interpolate dalle curve di Glasstone (fig. 2.16) e dai filmati dei test. La palla di fuoco in basso è disegnata in scala, alla quota di scoppio.
      </figcaption>
    </figure>
  );
}
