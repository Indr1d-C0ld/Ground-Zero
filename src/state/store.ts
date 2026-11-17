import { create } from "zustand";
import { PRESETS } from "@/data/presets";
import { weaponById } from "@/data/weapons";
import type { Detonation, Environment, LayerKey, Population, Thresholds, Units, WeatherSnap } from "@/lib/model/types";

export type MapMode = "move" | "add" | "probe";
export type View = "sim" | "enciclopedia" | "archivio" | "storia" | "galleria";
export type MapStyleId = "buio" | "chiaro" | "atlas" | "strade" | "terreno" | "satellite" | "rilievo";

export type Scenario = {
  dets: Detonation[];
  activeId: string;
  env: Environment;
  pop: Population;
  thr: Thresholds;
};

export type SavedScenario = { name: string; savedAt: string; scenario: Scenario };

type State = Scenario & {
  view: View;
  layers: Record<LayerKey, boolean>;
  styleId: MapStyleId;
  units: Units;
  theme: "dark" | "light";
  mapMode: MapMode;
  probe: { lat: number; lon: number } | null;
  timeS: number | null;
  playing: boolean;
  fitToken: number;
  presetId: string | null;
  weather: Record<string, WeatherSnap | "error">;
  saved: SavedScenario[];
  encyclopediaChapter: string | null;
  archiveWeapon: string | null;

  set: (p: Partial<State>) => void;
  patchDet: (id: string, p: Partial<Detonation>) => void;
  patchEnv: (p: Partial<Environment>) => void;
  patchPop: (p: Partial<Population>) => void;
  patchThr: (p: Partial<Thresholds>) => void;
  addDet: (lat: number, lon: number, place?: string) => void;
  removeDet: (id: string) => void;
  duplicateDet: (id: string) => void;
  chooseWeapon: (weaponId: string) => void;
  applyPreset: (id: string) => void;
  toggleLayer: (k: LayerKey) => void;
  fit: () => void;
  openChapter: (id: string) => void;
  saveScenario: (name: string) => void;
  loadScenario: (s: Scenario) => void;
  deleteSaved: (name: string) => void;
};

let counter = 1;
export const newId = () => `d${Date.now().toString(36)}${(counter++).toString(36)}`;

export const DEFAULT_ENV: Environment = {
  windMode: "meteo",
  windMs: 6,
  windFrom: 270,
  atmoMode: "meteo",
  visibilityKm: 24,
  rh: 60,
  cloud: 0.3,
  rain: false,
  pressureHpa: 1013,
};

export const DEFAULT_POP: Population = {
  mix: { outdoor: 0.1, ordinary: 0.85, substantial: 0.05 },
  model: "clark",
  scale: 1,
  rural: 20,
  firestorm: false,
  care: "collassata",
};

export const DEFAULT_THR: Thresholds = {
  psi: [20, 10, 5, 2, 1],
  thermal: { burn3: true, burn2: false, burn1: true, ignite: true },
  promptGy: [8, 4.5, 1],
  falloutMode: "dose",
  falloutRate: [3000, 1000, 300, 100, 30, 10],
  falloutDose: [1000, 400, 100, 25, 5],
  windowH: [0, 168],
};

const DEFAULT_LAYERS: Record<LayerKey, boolean> = {
  fireball: true,
  blast: true,
  thermal: true,
  radiation: true,
  fallout: true,
  crater: true,
  emp: true,
  heat: false,
  labels: true,
};

function presetScenario(id: string, base?: Scenario): Scenario {
  const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0];
  const dets: Detonation[] = p.shots.map((s) => {
    const w = weaponById(s.weaponId);
    return {
      id: newId(),
      lat: s.lat,
      lon: s.lon,
      place: s.place,
      weaponId: s.weaponId,
      yieldKt: s.yieldKt,
      fission: s.fission ?? w?.fission ?? 1,
      burst: s.burst,
      hobM: s.hobM ?? 500,
      burialM: s.burialM ?? 50,
      waterDepthM: s.waterDepthM ?? 30,
      delayS: 0,
    };
  });
  const env = { ...(base?.env ?? DEFAULT_ENV) };
  if (p.wind) Object.assign(env, { windMode: "manual", windMs: p.wind.ms, windFrom: p.wind.from });
  else env.windMode = "meteo";
  const pop = { ...(base?.pop ?? DEFAULT_POP), scale: p.popScale ?? 1, mix: p.mix ?? DEFAULT_POP.mix, firestorm: p.firestorm ?? false, rural: p.kind === "test" ? 0 : DEFAULT_POP.rural };
  return { dets, activeId: dets[0].id, env, pop, thr: base?.thr ?? DEFAULT_THR };
}

function loadSaved(): SavedScenario[] {
  try {
    const raw = localStorage.getItem("atlante:saved");
    return raw ? (JSON.parse(raw) as SavedScenario[]) : [];
  } catch {
    return [];
  }
}

function persistSaved(list: SavedScenario[]) {
  try {
    localStorage.setItem("atlante:saved", JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

function loadPrefs(): Partial<State> {
  try {
    const raw = localStorage.getItem("atlante:prefs");
    return raw ? (JSON.parse(raw) as Partial<State>) : {};
  } catch {
    return {};
  }
}

export function encodeScenario(s: Scenario): string {
  const json = JSON.stringify(s);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeScenario(hash: string): Scenario | null {
  try {
    const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const s = JSON.parse(new TextDecoder().decode(bytes)) as Scenario;
    if (!Array.isArray(s.dets) || s.dets.length === 0) return null;
    return {
      dets: s.dets.map((d) => ({ ...d, delayS: d.delayS ?? 0 })),
      activeId: s.activeId ?? s.dets[0].id,
      env: { ...DEFAULT_ENV, ...s.env },
      pop: { ...DEFAULT_POP, ...s.pop, mix: { ...DEFAULT_POP.mix, ...s.pop?.mix } },
      thr: { ...DEFAULT_THR, ...s.thr, thermal: { ...DEFAULT_THR.thermal, ...s.thr?.thermal } },
    };
  } catch {
    return null;
  }
}

function initialScenario(): { scenario: Scenario; presetId: string | null } {
  if (typeof location !== "undefined" && location.hash.startsWith("#s=")) {
    const s = decodeScenario(location.hash.slice(3));
    if (s) return { scenario: s, presetId: null };
  }
  return { scenario: presetScenario("hiroshima"), presetId: "hiroshima" };
}

const init = initialScenario();
const prefs = loadPrefs();

export const useStore = create<State>((set, get) => ({
  ...init.scenario,
  view: "sim",
  layers: { ...DEFAULT_LAYERS, ...(prefs.layers ?? {}) },
  styleId: (prefs.styleId as MapStyleId) ?? "buio",
  units: prefs.units ?? { distance: "km", pressure: "psi", dose: "Gy" },
  theme: prefs.theme ?? "dark",
  mapMode: "move",
  probe: null,
  timeS: null,
  playing: false,
  fitToken: 1,
  presetId: init.presetId,
  weather: {},
  saved: loadSaved(),
  encyclopediaChapter: null,
  archiveWeapon: null,

  set: (p) => set(p),
  patchDet: (id, p) => set((s) => ({ dets: s.dets.map((d) => (d.id === id ? { ...d, ...p } : d)), presetId: null })),
  patchEnv: (p) => set((s) => ({ env: { ...s.env, ...p }, presetId: null })),
  patchPop: (p) => set((s) => ({ pop: { ...s.pop, ...p }, presetId: null })),
  patchThr: (p) => set((s) => ({ thr: { ...s.thr, ...p } })),
  addDet: (lat, lon, place) =>
    set((s) => {
      const src = s.dets.find((d) => d.id === s.activeId) ?? s.dets[0];
      const d: Detonation = { ...src, id: newId(), lat, lon, place: place ?? "", delayS: 0 };
      return { dets: [...s.dets, d], activeId: d.id, presetId: null };
    }),
  removeDet: (id) =>
    set((s) => {
      if (s.dets.length <= 1) return {};
      const dets = s.dets.filter((d) => d.id !== id);
      return { dets, activeId: s.activeId === id ? dets[0].id : s.activeId, presetId: null };
    }),
  duplicateDet: (id) =>
    set((s) => {
      const src = s.dets.find((d) => d.id === id);
      if (!src) return {};
      const d = { ...src, id: newId(), lat: src.lat + 0.05, lon: src.lon + 0.05 };
      return { dets: [...s.dets, d], activeId: d.id };
    }),
  chooseWeapon: (weaponId) => {
    const w = weaponById(weaponId);
    if (!w) return;
    const s = get();
    s.patchDet(s.activeId, { weaponId, yieldKt: w.yNom, fission: w.fission });
    set({ view: "sim", fitToken: s.fitToken + 1 });
  },
  applyPreset: (id) => {
    const s = get();
    const sc = presetScenario(id, s);
    set({ ...sc, presetId: id, view: "sim", fitToken: s.fitToken + 1, probe: null, timeS: null, playing: false });
  },
  toggleLayer: (k) => set((s) => ({ layers: { ...s.layers, [k]: !s.layers[k] } })),
  fit: () => set((s) => ({ fitToken: s.fitToken + 1 })),
  openChapter: (id) => set({ view: "enciclopedia", encyclopediaChapter: id }),
  saveScenario: (name) => {
    const s = get();
    const entry: SavedScenario = {
      name,
      savedAt: new Date().toISOString(),
      scenario: { dets: s.dets, activeId: s.activeId, env: s.env, pop: s.pop, thr: s.thr },
    };
    const saved = [entry, ...s.saved.filter((x) => x.name !== name)].slice(0, 30);
    persistSaved(saved);
    set({ saved });
  },
  loadScenario: (sc) => set((s) => ({ ...sc, presetId: null, fitToken: s.fitToken + 1, view: "sim" })),
  deleteSaved: (name) => {
    const saved = get().saved.filter((x) => x.name !== name);
    persistSaved(saved);
    set({ saved });
  },
}));

// persist display preferences
useStore.subscribe((s, prev) => {
  if (s.layers !== prev.layers || s.styleId !== prev.styleId || s.units !== prev.units || s.theme !== prev.theme) {
    try {
      localStorage.setItem("atlante:prefs", JSON.stringify({ layers: s.layers, styleId: s.styleId, units: s.units, theme: s.theme }));
    } catch {
      /* ignore */
    }
  }
});

export const activeDet = (s: Pick<State, "dets" | "activeId">) => s.dets.find((d) => d.id === s.activeId) ?? s.dets[0];
