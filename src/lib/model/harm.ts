/**
 * Casualty model on a population grid.
 *
 * Population: GeoNames cities (≥15 000 inhabitants) rasterised as density discs, or as
 * Clark exponential profiles ρ(r) = ρ₀·e^(−r/b), plus a uniform rural background.
 * Each cell gets, for every detonation, overpressure, thermal fluence and prompt dose.
 * Mortality and injury follow log-normal probit curves per shelter class, loosely fitted to
 * OTA (1979) bands for blast (>12 psi ≈ 98% dead; 5–12 psi ≈ 50% dead, 40% injured;
 * 2–5 psi ≈ 5% dead, 45% injured; 1–2 psi ≈ 25% injured), Glasstone ch. 12 for burns and
 * UNSCEAR / Hiroshima LSS for radiation (LD50 ≈ 4.5 Gy with care, ≈ 3 Gy without).
 * Different detonations are treated as independent hazards: survival probabilities multiply.
 */
import type { City } from "@/data/cities";
import { haversineM, probit } from "@/lib/physics/core";
import { falloutAt, sigmaKm } from "@/lib/physics/fallout";
import type { Effects } from "@/lib/model/effects";
import type { Population, ShelterClass } from "@/lib/model/types";

const CLASSES: ShelterClass[] = ["outdoor", "ordinary", "substantial"];

const BLAST = {
  outdoor: { d50: 5.5, ds: 0.42, i50: 2.0, is: 0.9 },
  ordinary: { d50: 6.5, ds: 0.37, i50: 3.0, is: 0.9 },
  substantial: { d50: 18, ds: 0.35, i50: 7, is: 0.8 },
} as const;
const THERMAL_EXPOSED = { outdoor: 0.85, ordinary: 0.1, substantial: 0 } as const;
const PROMPT_PF = { outdoor: 1, ordinary: 2.2, substantial: 10 } as const;
const FALLOUT_PF = { outdoor: 1, ordinary: 3, substantial: 40 } as const;
const FIRE_ADD = { outdoor: 0.15, ordinary: 0.3, substantial: 0.08 } as const;

export type Hazards = { psi: number; q: number; gy: number; urban: boolean };

export type CellRates = { death: number; injury: number };

/** Equirectangular distance, accurate to <0.5% within a few hundred km. */
export function fastDist(lat0: number, lon0: number, lat: number, lon: number) {
  const dy = (lat - lat0) * 111_320;
  const dx = (lon - lon0) * 111_320 * Math.cos((((lat + lat0) / 2) * Math.PI) / 180);
  return Math.sqrt(dx * dx + dy * dy);
}

function normMix(pop: Population) {
  const s = pop.mix.outdoor + pop.mix.ordinary + pop.mix.substantial || 1;
  return { outdoor: pop.mix.outdoor / s, ordinary: pop.mix.ordinary / s, substantial: pop.mix.substantial / s };
}

/** Immediate (≤ 1 minute) hazards from every detonation combined. */
export function immediateRates(effects: Effects[], lat: number, lon: number, urban: boolean, pop: Population): CellRates & { psi: number; q: number; gy: number } {
  const mix = normMix(pop);
  const ld50 = pop.care === "normale" ? 4.5 : 3.0;
  let death = 0;
  let injury = 0;
  let maxPsi = 0;
  let maxQ = 0;
  let sumGy = 0;
  const hz: { g: number; psi: number; q: number; gy: number; e: Effects }[] = [];
  for (const e of effects) {
    const g = fastDist(e.det.lat, e.det.lon, lat, lon);
    if (g > e.lut.maxR) continue;
    const psi = e.lut.psi(g);
    const q = e.lut.q(g);
    const gy = e.lut.gy(g);
    hz.push({ g, psi, q, gy, e });
    maxPsi = Math.max(maxPsi, psi);
    maxQ = Math.max(maxQ, q);
    sumGy += gy;
  }
  if (hz.length === 0) return { death: 0, injury: 0, psi: 0, q: 0, gy: 0 };
  for (const c of CLASSES) {
    const w = mix[c];
    if (w <= 0) continue;
    let survive = 1;
    let unhurt = 1;
    for (const h of hz) {
      if (h.g < h.e.fireballM && h.e.rings[0].radiusM > 0) {
        survive = 0;
        unhurt = 0;
        break;
      }
      const b = BLAST[c];
      const bd = probit(h.psi, b.d50, b.ds);
      const bi = Math.max(probit(h.psi, b.i50, b.is), bd);
      const exposed = THERMAL_EXPOSED[c];
      const td = exposed * 0.9 * probit(h.q, h.e.burn.burn3 * 1.6, 0.3);
      const ti = Math.max(exposed * probit(h.q, h.e.burn.burn2, 0.3), td);
      let fd = 0;
      if (pop.firestorm && urban && h.q >= h.e.burn.ignite && h.psi < 30) fd = FIRE_ADD[c];
      survive *= (1 - bd) * (1 - td) * (1 - fd);
      unhurt *= (1 - bi) * (1 - ti);
    }
    const dose = sumGy / PROMPT_PF[c];
    const rd = probit(dose, ld50, 0.25);
    const ri = Math.max(probit(dose, 1, 0.35), rd);
    survive *= 1 - rd;
    unhurt *= 1 - ri;
    const d = 1 - survive;
    const hurt = Math.max(0, 1 - unhurt - d);
    death += w * d;
    injury += w * hurt;
  }
  return { death, injury, psi: maxPsi, q: maxQ, gy: sumGy };
}

/** Fallout mortality for a protracted dose (rad, outdoors free-field), per shelter mix. */
export function falloutRates(doseRad: number, pop: Population): CellRates {
  const mix = normMix(pop);
  const ld50 = (pop.care === "normale" ? 4.5 : 3.0) * 1.25; // protracted exposure is less effective
  let death = 0;
  let injury = 0;
  for (const c of CLASSES) {
    const gy = doseRad / 100 / FALLOUT_PF[c];
    const d = probit(gy, ld50, 0.3);
    const i = Math.max(0, probit(gy, 1, 0.35) - d);
    death += mix[c] * d;
    injury += mix[c] * i;
  }
  return { death, injury };
}

export type AffectedCity = {
  name: string;
  country: string;
  pop: number;
  distKm: number;
  deaths: number;
  injuries: number;
  falloutDeaths: number;
  maxPsi: number;
  falloutRad: number;
  lat: number;
  lon: number;
};

export type HarmGrid = {
  south: number;
  west: number;
  north: number;
  east: number;
  nx: number;
  ny: number;
  /** deaths per km² */
  deathDensity: Float32Array;
};

export type Harm = {
  deaths: number;
  injuries: number;
  exposed: number;
  displaced: number;
  falloutDeaths: number;
  falloutSick: number;
  evacuate: number;
  band: [number, number];
  urbanBurnKm2: number;
  sootTg: number;
  firestormLikely: boolean;
  bands: { label: string; people: number; deaths: number }[];
  doseBands: { label: string; people: number }[];
  cities: AffectedCity[];
  grid: HarmGrid | null;
  ms: number;
};

function cityDensity(pop: number) {
  return pop > 5_000_000 ? 8000 : pop > 1_000_000 ? 5500 : pop > 200_000 ? 3500 : 2200;
}

type CityShape = { idx: number; lat: number; lon: number; pop: number; radiusM: number; dens: (r: number) => number };

function cityShape(c: City, idx: number, model: Population["model"], scale: number): CityShape {
  const P = c[4] * scale;
  const cat = c[5];
  const base = cityDensity(cat);
  if (model === "disc") {
    const radiusM = Math.sqrt(cat / base / Math.PI) * 1000;
    const rho = P / (Math.PI * (radiusM / 1000) ** 2);
    return { idx, lat: c[2], lon: c[3], pop: P, radiusM, dens: (r) => (r <= radiusM ? rho : 0) };
  }
  // Clark: ρ0 three times the mean disc density, truncated at 4b, renormalised.
  const rho0 = base * 3;
  const bKm = Math.sqrt(cat / (2 * Math.PI * rho0));
  const cut = 4 * bKm;
  const norm = 1 - Math.exp(-4) * (1 + 4);
  const k = P / (2 * Math.PI * rho0 * bKm * bKm * norm);
  return { idx, lat: c[2], lon: c[3], pop: P, radiusM: cut * 1000, dens: (r) => (r <= cut * 1000 ? k * rho0 * Math.exp(-r / 1000 / bKm) : 0) };
}

function bboxOf(effects: Effects[], extraKm: (e: Effects) => number) {
  let s = 90,
    n = -90,
    w = 180,
    ea = -180;
  for (const e of effects) {
    const rKm = extraKm(e);
    const dLat = rKm / 111.32;
    const dLon = rKm / (111.32 * Math.max(0.2, Math.cos((e.det.lat * Math.PI) / 180)));
    s = Math.min(s, e.det.lat - dLat);
    n = Math.max(n, e.det.lat + dLat);
    w = Math.min(w, e.det.lon - dLon);
    ea = Math.max(ea, e.det.lon + dLon);
  }
  return { s, n, w, e: ea };
}

export function estimateHarm(effects: Effects[], cities: City[], pop: Population, windowH: [number, number]): Harm {
  const t0 = performance.now();
  const empty: Harm = {
    deaths: 0, injuries: 0, exposed: 0, displaced: 0, falloutDeaths: 0, falloutSick: 0, evacuate: 0,
    band: [0, 0], urbanBurnKm2: 0, sootTg: 0, firestormLikely: false, bands: [], doseBands: [], cities: [], grid: null, ms: 0,
  };
  if (effects.length === 0) return empty;

  // ---------- immediate effects grid ----------
  const bb = bboxOf(effects, (e) => e.outerM / 1000 * 1.05);
  const midLat = (bb.s + bb.n) / 2;
  const cosLat = Math.max(0.2, Math.cos((midLat * Math.PI) / 180));
  const widthKm = (bb.e - bb.w) * 111.32 * cosLat;
  const heightKm = (bb.n - bb.s) * 111.32;
  const N = 200;
  const cellKm = Math.max(widthKm, heightKm) / N;
  const nx = Math.max(8, Math.ceil(widthKm / cellKm));
  const ny = Math.max(8, Math.ceil(heightKm / cellKm));
  const dLat = (bb.n - bb.s) / ny;
  const dLon = (bb.e - bb.w) / nx;
  const cellArea = (dLat * 111.32) * (dLon * 111.32 * cosLat); // km²

  const popGrid = new Float32Array(nx * ny);
  const urban = new Uint8Array(nx * ny);
  const owners: Map<number, { city: number; people: number }[]> = new Map();

  // candidate cities (incl. fallout reach for the city list)
  const reach = Math.max(...effects.map((e) => Math.max(e.outerM / 1000, e.falloutReachKm))) + 30;
  const shapes: CityShape[] = [];
  for (let i = 0; i < cities.length; i++) {
    const c = cities[i];
    let near = false;
    for (const e of effects) {
      if (Math.abs(c[2] - e.det.lat) > reach / 111 + 0.5) continue;
      if (haversineM(e.det.lat, e.det.lon, c[2], c[3]) < reach * 1000) {
        near = true;
        break;
      }
    }
    if (near) shapes.push(cityShape(c, i, pop.model, pop.scale));
  }

  const inGrid = (lat: number, lon: number) => lat >= bb.s && lat < bb.n && lon >= bb.w && lon < bb.e;
  for (const sh of shapes) {
    const rLat = sh.radiusM / 111_320;
    const rLon = rLat / Math.max(0.2, Math.cos((sh.lat * Math.PI) / 180));
    if (sh.lat + rLat < bb.s || sh.lat - rLat > bb.n || sh.lon + rLon < bb.w || sh.lon - rLon > bb.e) continue;
    if (sh.radiusM / 1000 < cellKm * 0.7) {
      if (!inGrid(sh.lat, sh.lon)) continue;
      const ix = Math.floor((sh.lon - bb.w) / dLon);
      const iy = Math.floor((sh.lat - bb.s) / dLat);
      const k = iy * nx + ix;
      popGrid[k] += sh.pop;
      urban[k] = 1;
      pushOwner(owners, k, sh.idx, sh.pop);
      continue;
    }
    const x0 = Math.max(0, Math.floor((sh.lon - rLon - bb.w) / dLon));
    const x1 = Math.min(nx - 1, Math.floor((sh.lon + rLon - bb.w) / dLon));
    const y0 = Math.max(0, Math.floor((sh.lat - rLat - bb.s) / dLat));
    const y1 = Math.min(ny - 1, Math.floor((sh.lat + rLat - bb.s) / dLat));
    for (let iy = y0; iy <= y1; iy++) {
      const la = bb.s + (iy + 0.5) * dLat;
      for (let ix = x0; ix <= x1; ix++) {
        const lo = bb.w + (ix + 0.5) * dLon;
        const dy = (la - sh.lat) * 111_320;
        const dx = (lo - sh.lon) * 111_320 * Math.cos((sh.lat * Math.PI) / 180);
        const r = Math.hypot(dx, dy);
        const d = sh.dens(r);
        if (d <= 0) continue;
        const people = d * cellArea;
        const k = iy * nx + ix;
        popGrid[k] += people;
        if (d > 1500) urban[k] = 1;
        pushOwner(owners, k, sh.idx, people);
      }
    }
  }

  const ruralCell = pop.rural * pop.scale * cellArea;
  const deathDensity = new Float32Array(nx * ny);
  const cityAgg = new Map<number, { deaths: number; injuries: number; maxPsi: number; fallDeaths: number; rad: number }>();
  const psiEdges = [20, 10, 5, 2, 1];
  const bandPeople = new Float64Array(psiEdges.length + 1);
  const bandDeaths = new Float64Array(psiEdges.length + 1);
  let deaths = 0;
  let injuries = 0;
  let exposed = 0;
  let displaced = 0;
  let burnM2 = 0;

  for (let iy = 0; iy < ny; iy++) {
    const la = bb.s + (iy + 0.5) * dLat;
    for (let ix = 0; ix < nx; ix++) {
      const k = iy * nx + ix;
      const people = popGrid[k] + (urban[k] ? 0 : ruralCell);
      const lo = bb.w + (ix + 0.5) * dLon;
      const r = immediateRates(effects, la, lo, urban[k] === 1, pop);
      if (urban[k] && r.q > 0 && effects.some((e) => r.q >= e.burn.ignite)) burnM2 += cellArea * 1e6;
      if (people <= 0 || (r.death <= 0 && r.injury <= 0 && r.psi < 1)) continue;
      const d = people * r.death;
      const inj = people * r.injury;
      deaths += d;
      injuries += inj;
      exposed += people;
      if (r.psi >= 2) displaced += people - d;
      deathDensity[k] = d / cellArea;
      let b = psiEdges.findIndex((edge) => r.psi >= edge);
      if (b < 0) b = psiEdges.length;
      bandPeople[b] += people;
      bandDeaths[b] += d;
      const own = owners.get(k);
      if (own) {
        const tot = popGrid[k] || 1;
        for (const o of own) {
          const a = cityAgg.get(o.city) ?? { deaths: 0, injuries: 0, maxPsi: 0, fallDeaths: 0, rad: 0 };
          a.deaths += (o.people / tot) * d;
          a.injuries += (o.people / tot) * inj;
          a.maxPsi = Math.max(a.maxPsi, r.psi);
          cityAgg.set(o.city, a);
        }
      }
    }
  }

  // ---------- fallout grid ----------
  let falloutDeaths = 0;
  let falloutSick = 0;
  let evacuate = 0;
  const doseEdges = [1000, 400, 100, 25];
  const doseBandPeople = new Float64Array(doseEdges.length);
  const active = effects.filter((e) => e.plume.active);
  if (active.length > 0) {
    const [t1, t2] = windowH;
    const totalDose = (la: number, lo: number) => {
      let d = 0;
      for (const e of active) d += falloutAt(e.plume, la, lo, t1, t2).dose;
      return d;
    };
    // Cities: evaluated individually (centre plus a ring of six points), so a narrow plume is never missed.
    const cityPoints = new Set<number>();
    for (const sh of shapes) {
      const rr = Math.min(sh.radiusM * 0.6, 8000);
      let dose = totalDose(sh.lat, sh.lon) * 0.4;
      for (let j = 0; j < 6; j++) {
        const ang = (j * Math.PI) / 3;
        const la = sh.lat + (Math.sin(ang) * rr) / 111_320;
        const lo = sh.lon + (Math.cos(ang) * rr) / (111_320 * Math.cos((sh.lat * Math.PI) / 180));
        dose += totalDose(la, lo) * 0.1;
      }
      if (dose < 1) continue;
      cityPoints.add(sh.idx);
      const imm = immediateRates(effects, sh.lat, sh.lon, true, pop);
      const survivors = sh.pop * (1 - imm.death);
      const fr = falloutRates(dose, pop);
      const a = cityAgg.get(sh.idx) ?? { deaths: 0, injuries: 0, maxPsi: 0, fallDeaths: 0, rad: 0 };
      a.rad = dose;
      a.fallDeaths = survivors * fr.death;
      cityAgg.set(sh.idx, a);
      if (dose < 10) continue;
      falloutDeaths += survivors * fr.death;
      falloutSick += survivors * fr.injury;
      if (dose >= 100) evacuate += survivors;
      for (let b = 0; b < doseEdges.length; b++) {
        if (dose >= doseEdges[b]) {
          doseBandPeople[b] += survivors;
          break;
        }
      }
    }
    // Rural background: integrate in each plume's own frame (x downwind, y crosswind).
    const rural = pop.rural * pop.scale;
    if (rural > 0) {
      for (const e of active) {
        const pl = e.plume;
        const reachKm = Math.max(e.falloutReachKm, 5);
        const nX = 140;
        const nY = 25;
        let xPrev = -pl.sigma0Km * 2;
        for (let i = 1; i <= nX; i++) {
          const x = -pl.sigma0Km * 2 + (reachKm * 1.1 + pl.sigma0Km * 2) * Math.pow(i / nX, 1.8);
          const dx = x - xPrev;
          const xm = (x + xPrev) / 2;
          xPrev = x;
          const half = 3 * sigmaKm(pl, xm);
          const dy = (2 * half) / nY;
          for (let j = 0; j < nY; j++) {
            const ym = -half + (j + 0.5) * dy;
            const θ = (pl.downwindDeg * Math.PI) / 180;
            const east = xm * Math.sin(θ) + ym * Math.cos(θ);
            const north = xm * Math.cos(θ) - ym * Math.sin(θ);
            const la = pl.lat + north / 111.32;
            const lo = pl.lon + east / (111.32 * Math.cos((pl.lat * Math.PI) / 180));
            const own = falloutAt(pl, la, lo, t1, t2).dose;
            if (own < 5) continue;
            const dose = active.length > 1 ? totalDose(la, lo) : own;
            if (dose < 10) continue;
            const weight = own / dose; // avoids double counting where plumes overlap
            const people = rural * dx * dy * weight;
            const imm = immediateRates(effects, la, lo, false, pop);
            const survivors = people * (1 - imm.death);
            const fr = falloutRates(dose, pop);
            falloutDeaths += survivors * fr.death;
            falloutSick += survivors * fr.injury;
            if (dose >= 100) evacuate += survivors;
            for (let b = 0; b < doseEdges.length; b++) {
              if (dose >= doseEdges[b]) {
                doseBandPeople[b] += survivors;
                break;
              }
            }
          }
        }
      }
    }
  }

  const affected: AffectedCity[] = [];
  for (const [idx, a] of cityAgg) {
    const c = cities[idx];
    if (a.deaths + a.injuries < 5 && a.rad < 10 && a.maxPsi < 1) continue;
    const dist = Math.min(...effects.map((e) => haversineM(e.det.lat, e.det.lon, c[2], c[3])));
    affected.push({
      name: c[0], country: c[1], pop: c[5] * pop.scale, distKm: dist / 1000, deaths: a.deaths, injuries: a.injuries,
      falloutDeaths: a.fallDeaths, maxPsi: a.maxPsi, falloutRad: a.rad, lat: c[2], lon: c[3],
    });
  }
  affected.sort((x, y) => y.deaths + y.falloutDeaths + y.injuries * 0.3 - (x.deaths + x.falloutDeaths + x.injuries * 0.3));

  const urbanBurnKm2 = burnM2 / 1e6;
  const firestormLikely = pop.firestorm && urbanBurnKm2 > 4 && effects.some((e) => e.yieldKt >= 10);
  // ≈ 0.011 Tg of soot per 13 km² Hiroshima-like firestorm area (Toon et al. 2007 order of magnitude)
  const sootTg = urbanBurnKm2 > 0.2 ? 0.011 * (urbanBurnKm2 / 13) * (firestormLikely ? 1 : 0.25) : 0;

  const labels = ["oltre 20 psi", "10–20 psi", "5–10 psi", "2–5 psi", "1–2 psi", "sotto 1 psi"];
  const doseLabels = ["oltre 1000 rad", "400–1000 rad", "100–400 rad", "25–100 rad"];
  return {
    deaths,
    injuries,
    exposed,
    displaced,
    falloutDeaths,
    falloutSick,
    evacuate,
    band: [(deaths + falloutDeaths) * 0.4, (deaths + falloutDeaths) * 2.5],
    urbanBurnKm2,
    sootTg,
    firestormLikely,
    bands: labels.map((label, i) => ({ label, people: bandPeople[i], deaths: bandDeaths[i] })),
    doseBands: doseLabels.map((label, i) => ({ label, people: doseBandPeople[i] })),
    cities: affected.slice(0, 40),
    grid: { south: bb.s, west: bb.w, north: bb.n, east: bb.e, nx, ny, deathDensity },
    ms: performance.now() - t0,
  };
}

function pushOwner(m: Map<number, { city: number; people: number }[]>, k: number, city: number, people: number) {
  const list = m.get(k);
  if (list) list.push({ city, people });
  else m.set(k, [{ city, people }]);
}
