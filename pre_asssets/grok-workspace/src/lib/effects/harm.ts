import type { City } from "@/data/cities";
import type { Effects, Shelter } from "@/lib/effects/physics";
import { ringRadius } from "@/lib/effects/physics";

export type Harm = {
  deaths: number;
  injuries: number;
  displaced: number;
  falloutSick: number;
  falloutDeaths: number;
  exposed: number;
  urbanBurnKm2: number;
  sootTonnes: number;
  firestormLikely: boolean;
  cities: AffectedCity[];
  band: [number, number];
};

export type AffectedCity = {
  name: string;
  country: string;
  pop: number;
  distKm: number;
  deaths: number;
  injuries: number;
  falloutRad: number;
};

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6_371_000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

function circleIntersection(r1: number, r2: number, d: number) {
  if (r1 <= 0 || r2 <= 0) return 0;
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  const a = Math.acos(Math.min(1, Math.max(-1, (d * d + r1 * r1 - r2 * r2) / (2 * d * r1))));
  const b = Math.acos(Math.min(1, Math.max(-1, (d * d + r2 * r2 - r1 * r1) / (2 * d * r2))));
  return r1 * r1 * a + r2 * r2 * b - 0.5 * Math.sqrt(Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)));
}

function cityRadiusM(pop: number) {
  const density = pop > 5_000_000 ? 8000 : pop > 1_000_000 ? 5500 : pop > 200_000 ? 3500 : 2200;
  return Math.sqrt(pop / density / Math.PI) * 1000;
}

type Rates = { death: number; injury: number };

function ratesAt(d: number, effects: Effects, shelter: Shelter, firestorm: boolean): Rates {
  const fb = effects.fireballM;
  const r20 = ringRadius(effects, "psi-20");
  const r10 = ringRadius(effects, "psi-10");
  const r5 = ringRadius(effects, "psi-5");
  const r2 = ringRadius(effects, "psi-2");
  const r1 = ringRadius(effects, "psi-1");
  const burn3 = ringRadius(effects, "burn3");
  const burn2 = ringRadius(effects, "burn2");
  const ignite = ringRadius(effects, "ignite");
  const rad = effects.prompt500M;

  if (d < fb) return { death: 1, injury: 0 };

  let blastD = 0;
  let blastI = 0;
  if (d < r20) {
    blastD = shelter === "substantial" ? 0.9 : 0.98;
    blastI = 1 - blastD;
  } else if (d < r10) {
    blastD = shelter === "substantial" ? 0.45 : shelter === "ordinary" ? 0.7 : 0.85;
    blastI = shelter === "substantial" ? 0.4 : 0.25;
  } else if (d < r5) {
    blastD = shelter === "substantial" ? 0.12 : shelter === "ordinary" ? 0.4 : 0.55;
    blastI = shelter === "substantial" ? 0.35 : 0.45;
  } else if (d < r2) {
    blastD = shelter === "substantial" ? 0.02 : shelter === "ordinary" ? 0.08 : 0.12;
    blastI = shelter === "substantial" ? 0.12 : shelter === "ordinary" ? 0.35 : 0.5;
  } else if (d < r1) {
    blastD = shelter === "none" ? 0.015 : 0.004;
    blastI = shelter === "substantial" ? 0.05 : shelter === "ordinary" ? 0.18 : 0.32;
  }

  let thermD = 0;
  let thermI = 0;
  const thermScale = shelter === "none" ? 1 : shelter === "ordinary" ? 0.18 : 0.03;
  if (d < burn3) {
    thermD = 0.6 * thermScale;
    thermI = 0.35 * thermScale;
  } else if (d < burn2) {
    thermD = 0.08 * thermScale;
    thermI = 0.55 * thermScale;
  }
  if (firestorm && d < ignite && d > fb) {
    const add = shelter === "substantial" ? 0.06 : shelter === "ordinary" ? 0.3 : 0.15;
    thermD = Math.min(0.95, thermD + add);
  }

  let radD = 0;
  let radI = 0;
  const radPf = shelter === "substantial" ? 8 : shelter === "ordinary" ? 2.5 : 1;
  if (rad > 0 && d < rad / Math.sqrt(radPf)) {
    radD = shelter === "substantial" ? 0.15 : 0.5;
    radI = 0.35;
  }

  const survive = (1 - blastD) * (1 - thermD) * (1 - radD);
  const death = 1 - survive;
  const injury = Math.min(1 - death, blastI + thermI + radI);
  return { death, injury };
}

function falloutHealth(doseRad: number, shelter: Shelter) {
  const pf = shelter === "substantial" ? 20 : shelter === "ordinary" ? 5 : 1;
  const d = doseRad / pf;
  if (d >= 800) return { death: 0.85, sick: 0.14 };
  if (d >= 400) return { death: 0.45, sick: 0.5 };
  if (d >= 200) return { death: 0.1, sick: 0.6 };
  if (d >= 100) return { death: 0.02, sick: 0.45 };
  if (d >= 25) return { death: 0, sick: 0.15 };
  return { death: 0, sick: 0 };
}

export function estimateHarm(
  lat: number,
  lon: number,
  effects: Effects,
  cities: City[],
  shelter: Shelter,
  firestorm: boolean,
  ruralPerKm2: number,
): Harm {
  const r1 = ringRadius(effects, "psi-1");
  const ignite = ringRadius(effects, "ignite");
  const outer = Math.max(r1, ignite, effects.prompt500M, effects.baseSurgeM, effects.craterRadiusM, 500);
  const reachM = Math.max(outer, effects.falloutMaxKm * 1000);
  const latPad = reachM / 111_320 + 0.4;
  const lonPad = latPad / Math.max(0.25, Math.cos((lat * Math.PI) / 180));

  const bounds = [0, effects.fireballM, ringRadius(effects, "psi-20"), ringRadius(effects, "psi-10"), ringRadius(effects, "psi-5"), ringRadius(effects, "psi-2"), r1, ringRadius(effects, "burn3"), ringRadius(effects, "burn2"), ignite, effects.prompt500M]
    .filter((n) => n > 0)
    .sort((a, b) => a - b);
  const edges = [0];
  for (const b of bounds) {
    if (b - edges[edges.length - 1] > 20) edges.push(b);
  }
  if (outer > edges[edges.length - 1]) edges.push(outer);

  let deaths = 0;
  let injuries = 0;
  let displaced = 0;
  let exposed = 0;
  let urbanBurnM2 = 0;
  const affected: AffectedCity[] = [];

  const candidates: { city: City; dist: number; radius: number }[] = [];
  for (const city of cities) {
    if (Math.abs(city[2] - lat) > latPad || Math.abs(city[3] - lon) > lonPad) continue;
    const dist = haversineM(lat, lon, city[2], city[3]);
    const radius = cityRadiusM(city[4]);
    if (dist > reachM + radius) continue;
    candidates.push({ city, dist, radius });
  }

  for (const { city, dist, radius } of candidates) {
    const area = Math.PI * radius * radius;
    let cDeath = 0;
    let cInj = 0;
    let cExp = 0;
    let burnM2 = 0;
    for (let i = 0; i < edges.length - 1; i++) {
      const a = edges[i];
      const b = edges[i + 1];
      const seg = Math.max(0, circleIntersection(b, radius, dist) - circleIntersection(a, radius, dist));
      if (seg <= 0) continue;
      const mid = (a + b) / 2;
      const rate = ratesAt(mid, effects, shelter, firestorm);
      const frac = seg / area;
      cDeath += city[4] * frac * rate.death;
      cInj += city[4] * frac * rate.injury;
      cExp += city[4] * frac;
      if (mid < ignite) burnM2 += seg;
    }
    const outerFrac = Math.min(1, circleIntersection(outer, radius, dist) / area);
    const dispFrac = Math.min(1, circleIntersection(r1, radius, dist) / area);
    deaths += cDeath;
    injuries += cInj;
    exposed += cExp;
    displaced += Math.max(0, city[4] * dispFrac - cDeath);
    urbanBurnM2 += burnM2;
    if (cDeath + cInj > 20 || outerFrac > 0.02) {
      affected.push({
        name: city[0],
        country: city[1],
        pop: city[4],
        distKm: dist / 1000,
        deaths: cDeath,
        injuries: cInj,
        falloutRad: 0,
      });
    }
  }

  for (let i = 0; i < edges.length - 1; i++) {
    const a = edges[i];
    const b = edges[i + 1];
    const annulus = Math.PI * (b * b - a * a);
    let covered = 0;
    for (const { dist, radius } of candidates) {
      covered += Math.max(0, circleIntersection(b, radius, dist) - circleIntersection(a, radius, dist));
    }
    const ruralM2 = Math.max(0, annulus - covered);
    const pop = (ruralPerKm2 * ruralM2) / 1e6;
    if (pop <= 0) continue;
    const rate = ratesAt((a + b) / 2, effects, shelter, firestorm);
    deaths += pop * rate.death;
    injuries += pop * rate.injury;
    exposed += pop;
    if ((a + b) / 2 < r1) displaced += pop * (1 - rate.death);
    if ((a + b) / 2 < ignite) urbanBurnM2 += ruralM2 * 0; // rural fuel is not an urban firestorm
  }

  let falloutDeaths = 0;
  let falloutSick = 0;
  if (effects.localFallout) {
    for (const { city, dist, radius } of candidates) {
      if (dist < ringRadius(effects, "psi-5")) continue;
      const dose = effects.doseAt(city[2], city[3]);
      if (dose < 10) continue;
      const fracBeyond = 1 - Math.min(1, circleIntersection(ringRadius(effects, "psi-5"), radius, dist) / (Math.PI * radius * radius));
      const people = city[4] * Math.max(0.15, fracBeyond);
      const h = falloutHealth(dose, shelter);
      falloutDeaths += people * h.death;
      falloutSick += people * h.sick;
      const existing = affected.find((c) => c.name === city[0] && c.country === city[1]);
      if (existing) existing.falloutRad = dose;
      else if (dose >= 25) {
        affected.push({
          name: city[0],
          country: city[1],
          pop: city[4],
          distKm: dist / 1000,
          deaths: 0,
          injuries: 0,
          falloutRad: dose,
        });
      }
    }
  }

  const urbanBurnKm2 = urbanBurnM2 / 1e6;
  const dense = urbanBurnKm2 > 4 && effects.yieldKt >= 10 && !effects.touchesGround;
  const firestormLikely = firestorm && dense;
  const sootTonnes = urbanBurnKm2 > 0.2 ? 50_000 * (urbanBurnKm2 / 13) * (firestormLikely ? 1 : 0.12) : 0;

  affected.sort((a, b) => b.deaths + b.injuries + b.falloutRad * 10 - (a.deaths + a.injuries + a.falloutRad * 10));

  return {
    deaths,
    injuries,
    displaced,
    falloutSick,
    falloutDeaths,
    exposed,
    urbanBurnKm2,
    sootTonnes,
    firestormLikely,
    cities: affected.slice(0, 12),
    band: [deaths * 0.4, deaths * 2.5],
  };
}
