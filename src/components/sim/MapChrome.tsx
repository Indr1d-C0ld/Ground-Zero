import { useEffect, useRef, useState } from "react";
import { Crosshair, Hand, Layers, Maximize2, Minus, Pause, Play, Plus, Timer, X } from "lucide-react";
import { useStore } from "@/state/store";
import { useSim } from "@/hooks/useSimulation";
import { formatPressure, formatRad, formatTime, formatYield } from "@/lib/format";
import { FALLOUT_COLORS, falloutColor } from "@/components/sim/MapView";
import { cx } from "@/components/ui";

export function MapToolbar() {
  const mapMode = useStore((s) => s.mapMode);
  const set = useStore((s) => s.set);
  const fit = useStore((s) => s.fit);
  const timeS = useStore((s) => s.timeS);
  const modes = [
    { id: "move" as const, icon: Hand, label: "Sposta lo scoppio" },
    { id: "add" as const, icon: Plus, label: "Aggiungi detonazione" },
    { id: "probe" as const, icon: Crosshair, label: "Sonda puntuale" },
  ];
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-line bg-surface/90 p-1 shadow-lg backdrop-blur">
      {modes.map((m) => (
        <button
          key={m.id}
          title={m.label}
          onClick={() => set({ mapMode: m.id })}
          className={cx("flex min-h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px]", mapMode === m.id ? "bg-ember text-ink" : "text-muted hover:bg-surface-2 hover:text-fg")}
        >
          <m.icon className="size-3.5" />
          <span className="hidden xl:inline">{m.label}</span>
        </button>
      ))}
      <span className="mx-0.5 h-5 w-px bg-line" />
      <button title="Inquadra gli effetti" onClick={fit} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
        <Maximize2 className="size-3.5" />
      </button>
      <button
        title="Cronologia animata"
        onClick={() => set({ timeS: timeS == null ? 0.001 : null, playing: timeS == null })}
        className={cx("grid size-8 place-items-center rounded-lg", timeS != null ? "bg-surface-3 text-ember" : "text-muted hover:bg-surface-2 hover:text-fg")}
      >
        <Timer className="size-3.5" />
      </button>
    </div>
  );
}

export function ZoomButtons({ onZoom }: { onZoom?: (d: number) => void }) {
  if (!onZoom) return null;
  return (
    <div className="pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-line bg-surface/90">
      <button onClick={() => onZoom(1)} className="grid size-8 place-items-center hover:bg-surface-2">
        <Plus className="size-3.5" />
      </button>
      <button onClick={() => onZoom(-1)} className="grid size-8 place-items-center border-t border-line hover:bg-surface-2">
        <Minus className="size-3.5" />
      </button>
    </div>
  );
}

const T_MIN = 1e-4;
const T_MAX = 86400 * 2;

export function TimelineBar() {
  const timeS = useStore((s) => s.timeS);
  const playing = useStore((s) => s.playing);
  const set = useStore((s) => s.set);
  const units = useStore((s) => s.units);
  const { effects, active } = useSim();
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const t = useStore.getState().timeS ?? T_MIN;
      // logarithmic playback: one decade of time every ~2.2 seconds
      const next = t * Math.pow(10, dt / 2.2);
      if (next >= T_MAX) {
        set({ timeS: T_MAX, playing: false });
        return;
      }
      set({ timeS: next });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, set]);

  if (timeS == null) return null;
  const pos = ((Math.log10(timeS) - Math.log10(T_MIN)) / (Math.log10(T_MAX) - Math.log10(T_MIN))) * 1000;
  const tl = timeS - active.det.delayS;
  const rs = tl > 0 ? active.shockRadiusAt(tl) : 0;
  const psi = rs > 0 ? active.psiAt(rs) : 0;
  let phase = "In attesa della detonazione";
  if (tl > 0) {
    if (tl < active.tmaxS * 0.1) phase = "Palla di fuoco in espansione; raggi X assorbiti dall'aria";
    else if (tl < active.tmaxS * 10) phase = "Impulso termico: il calore viaggia alla velocità della luce";
    else if (psi > 0.5 && rs > 0) phase = `Onda d'urto in corsa · fronte a ${formatPressure(psi, units)}`;
    else if (tl < active.cloud.riseS) phase = "La nube sale verso la tropopausa";
    else if (active.plume.active) phase = "Ricaduta: il fallout si deposita sottovento";
    else phase = "Nube stabilizzata; nessuna ricaduta locale significativa";
  }
  const marks = [
    { t: active.tmaxS, l: "picco termico" },
    { t: 1, l: "1 s" },
    { t: 60, l: "1 min" },
    { t: 3600, l: "1 h" },
    { t: 86400, l: "1 g" },
  ];
  return (
    <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-line bg-surface/95 p-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-3">
        <button onClick={() => set({ playing: !playing, timeS: timeS >= T_MAX * 0.99 ? T_MIN : timeS })} className="grid size-9 shrink-0 place-items-center rounded-full bg-ember text-ink">
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="num text-[18px] leading-none">t = {formatTime(timeS)}</span>
            <span className="truncate text-[11.5px] text-muted">{phase}</span>
          </div>
          <div className="relative mt-1.5">
            <input
              type="range"
              className="rng"
              min={0}
              max={1000}
              value={pos}
              style={{ ["--p" as string]: `${pos / 10}%` }}
              onChange={(e) => set({ timeS: 10 ** (Math.log10(T_MIN) + (Number(e.target.value) / 1000) * (Math.log10(T_MAX) - Math.log10(T_MIN))), playing: false })}
            />
            <div className="pointer-events-none relative h-3 text-[9px] text-faint">
              {marks.map((mk) => {
                const p = ((Math.log10(mk.t) - Math.log10(T_MIN)) / (Math.log10(T_MAX) - Math.log10(T_MIN))) * 100;
                return (
                  <span key={mk.l} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${p}%` }}>
                    {mk.l}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
        <button onClick={() => set({ timeS: null, playing: false })} className="grid size-7 shrink-0 place-items-center rounded-md text-faint hover:text-fg" title="Chiudi">
          <X className="size-4" />
        </button>
      </div>
      {effects.length > 1 && <p className="mt-1 text-[11px] text-faint">Scala logaritmica del tempo. Le detonazioni con ritardo compaiono al loro istante.</p>}
    </div>
  );
}

export function Legend() {
  const [open, setOpen] = useState(true);
  const { active } = useSim();
  const units = useStore((s) => s.units);
  const thr = useStore((s) => s.thr);
  const layers = useStore((s) => s.layers);
  const rings = active.rings.filter((r) => r.radiusM > 0);
  return (
    <div className="pointer-events-auto max-w-60 rounded-xl border border-line bg-surface/92 text-[11.5px] shadow-lg backdrop-blur">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
        <Layers className="size-3.5 text-muted" />
        <span className="flex-1 font-medium">Legenda</span>
        <span className="num text-faint">{formatYield(active.yieldKt)}</span>
      </button>
      {open && (
        <div className="space-y-1 px-3 pb-3">
          {rings.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-full border"
                style={{ borderColor: r.color, background: r.group === "thermal" || r.group === "radiation" ? "transparent" : `${r.color}55`, borderStyle: r.group === "thermal" ? "dashed" : r.group === "radiation" ? "dotted" : "solid" }}
              />
              <span className="truncate text-muted">{r.group === "blast" ? `${r.short} · ${r.label}` : r.label}</span>
            </div>
          ))}
          {layers.fallout && active.fallout.length > 0 && (
            <div className="pt-1">
              <p className="mb-1 text-faint">{thr.falloutMode === "rate" ? "Fallout, rateo a H+1" : `Fallout, dose ${thr.windowH[0]}–${thr.windowH[1]} h`}</p>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                {active.fallout.map((c, i) => (
                  <span key={c.level} className="inline-flex items-center gap-1">
                    <span className="size-2.5 rounded-sm" style={{ background: falloutColor(active.fallout.length - 1 - i, active.fallout.length) }} />
                    <span className="num">{formatRad(c.level, units, c.mode === "rate")}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {layers.heat && (
            <div className="pt-1">
              <p className="mb-1 text-faint">Morti per km²</p>
              <div className="h-2 rounded-full" style={{ background: "linear-gradient(to right, rgb(40,10,60), rgb(150,20,50), rgb(230,100,40), rgb(255,236,170))" }} />
              <div className="num flex justify-between text-faint">
                <span>1</span>
                <span>100</span>
                <span>20 000</span>
              </div>
            </div>
          )}
          <span className="hidden">{FALLOUT_COLORS.length}</span>
        </div>
      )}
    </div>
  );
}
