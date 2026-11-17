import { useState } from "react";
import { Map as MapIcon, SlidersHorizontal, SquareChartGantt } from "lucide-react";
import { MapView } from "@/components/sim/MapView";
import { Controls } from "@/components/sim/Controls";
import { Results } from "@/components/sim/Results";
import { Legend, MapToolbar, TimelineBar } from "@/components/sim/MapChrome";
import { useSim } from "@/hooks/useSimulation";
import { useStore } from "@/state/store";
import { formatPeople, formatYield } from "@/lib/format";
import { cx } from "@/components/ui";

type Pane = "map" | "controls" | "results";

export function Simulator() {
  const [pane, setPane] = useState<Pane>("map");
  const { harm, active, effects } = useSim();
  const mapMode = useStore((s) => s.mapMode);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1 lg:grid lg:grid-cols-[21.5rem_minmax(0,1fr)_25rem]">
        <aside className={cx("min-h-0 overflow-hidden border-line bg-bg lg:static lg:block lg:border-r", pane === "controls" ? "absolute inset-0 z-[500]" : "max-lg:hidden")}>
          <Controls />
        </aside>
        <div className="absolute inset-0 lg:relative">
          <MapView />
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[450] flex items-start justify-between gap-2">
            <MapToolbar />
            <div className="pointer-events-auto hidden rounded-xl border border-line bg-surface/90 px-3 py-1.5 text-right shadow-lg backdrop-blur sm:block">
              <p className="text-[11px] text-muted">{active.det.place || "Punto sulla mappa"}</p>
              <p className="num text-[13px]">
                {formatYield(active.yieldKt)}
                {effects.length > 1 ? ` · ${effects.length} scoppi` : ""}
              </p>
            </div>
          </div>
          {mapMode !== "move" && (
            <p className="pointer-events-none absolute inset-x-0 top-16 z-[450] mx-auto w-fit rounded-full bg-ember px-3 py-1 text-[12px] text-ink shadow-lg">
              {mapMode === "add" ? "Clicca per aggiungere una detonazione" : "Clicca per posizionare la sonda"}
            </p>
          )}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-[450] flex flex-col items-center gap-2 lg:items-start">
            <TimelineBar />
            <div className="flex w-full items-end justify-between gap-2">
              <div className="max-lg:hidden">
                <Legend />
              </div>
              {harm && (
                <button onClick={() => setPane("results")} className="pointer-events-auto rounded-xl border border-line bg-surface/92 px-3 py-2 text-left shadow-lg lg:hidden">
                  <span className="num block text-[18px] leading-none text-ember">{formatPeople(harm.deaths + harm.falloutDeaths)}</span>
                  <span className="text-[11px] text-muted">morti stimati, ordine di grandezza</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <aside className={cx("min-h-0 overflow-hidden border-line bg-bg lg:static lg:block lg:border-l", pane === "results" ? "absolute inset-0 z-[500]" : "max-lg:hidden")}>
          <Results />
        </aside>
      </div>
      <nav className="grid shrink-0 grid-cols-3 border-t border-line bg-bg lg:hidden">
        {(
          [
            ["map", "Mappa", MapIcon],
            ["controls", "Parametri", SlidersHorizontal],
            ["results", "Esiti", SquareChartGantt],
          ] as const
        ).map(([id, l, Icon]) => (
          <button key={id} onClick={() => setPane(id)} className={cx("flex min-h-12 flex-col items-center justify-center gap-0.5 text-[11px]", pane === id ? "text-ember" : "text-muted")}>
            <Icon className="size-4" />
            {l}
          </button>
        ))}
      </nav>
    </div>
  );
}
