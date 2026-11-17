import { cities } from "@/data/cities";
import { computeEffects } from "@/lib/model/effects";
import { estimateHarm } from "@/lib/model/harm";
import type { Detonation, Population, ResolvedAtmo, Thresholds } from "@/lib/model/types";

export type HarmRequest = { reqId: number; dets: Detonation[]; atmos: ResolvedAtmo[]; thr: Thresholds; pop: Population };

self.onmessage = (ev: MessageEvent<HarmRequest>) => {
  const { reqId, dets, atmos, thr, pop } = ev.data;
  const effects = dets.map((d, i) => computeEffects(d, atmos[i], thr));
  const harm = estimateHarm(effects, cities, pop, thr.windowH);
  const transfer: Transferable[] = harm.grid ? [harm.grid.deathDensity.buffer] : [];
  (self as unknown as Worker).postMessage({ reqId, harm }, transfer);
};
