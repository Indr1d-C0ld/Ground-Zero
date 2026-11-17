import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { computeEffects, resolveAtmo, type Effects } from "@/lib/model/effects";
import type { Harm } from "@/lib/model/harm";
import type { ResolvedAtmo } from "@/lib/model/types";
import { useStore } from "@/state/store";
import { weatherKey } from "@/hooks/useWeather";

export type Simulation = {
  effects: Effects[];
  active: Effects;
  atmos: ResolvedAtmo[];
  harm: Harm | null;
  computing: boolean;
};

export const SimContext = createContext<Simulation | null>(null);

export function useSim(): Simulation {
  const s = useContext(SimContext);
  if (!s) throw new Error("SimContext missing");
  return s;
}

export function useSimulationEngine(): Simulation {
  const dets = useStore((s) => s.dets);
  const activeId = useStore((s) => s.activeId);
  const env = useStore((s) => s.env);
  const thr = useStore((s) => s.thr);
  const pop = useStore((s) => s.pop);
  const weather = useStore((s) => s.weather);

  const atmos = useMemo(
    () =>
      dets.map((d) => {
        const w = weather[weatherKey(d.lat, d.lon)];
        return resolveAtmo(env, w && w !== "error" ? w : null);
      }),
    [dets, env, weather],
  );
  const effects = useMemo(() => dets.map((d, i) => computeEffects(d, atmos[i], thr)), [dets, atmos, thr]);
  const active = effects.find((e) => e.det.id === activeId) ?? effects[0];

  const [harm, setHarm] = useState<Harm | null>(null);
  const [computing, setComputing] = useState(false);
  const worker = useRef<Worker | null>(null);
  const req = useRef(0);

  useEffect(() => {
    const w = new Worker(new URL("../workers/harm.worker.ts", import.meta.url), { type: "module" });
    worker.current = w;
    w.onmessage = (ev: MessageEvent<{ reqId: number; harm: Harm }>) => {
      if (ev.data.reqId !== req.current) return;
      setHarm(ev.data.harm);
      setComputing(false);
    };
    return () => w.terminate();
  }, []);

  useEffect(() => {
    const id = ++req.current;
    setComputing(true);
    const t = window.setTimeout(() => {
      worker.current?.postMessage({ reqId: id, dets, atmos, thr, pop });
    }, 120);
    return () => window.clearTimeout(t);
  }, [dets, atmos, thr, pop]);

  return { effects, active, atmos, harm, computing };
}
