/**
 * Educational effects model.
 *
 * Blast: H.L. Brode, Airblast From Nuclear Bursts — Analytic Approximations
 * (Pacific-Sierra Research, 1986), as implemented in the MIT-licensed
 * glasstone library. Stated accuracy about ±10% at sea-level ambient pressure.
 * Optimum height for the 5 psi contour collapses, in this fit, to
 * H ≈ 276 m × Y^(1/3) with Y in kilotons.
 *
 * Thermal: Glasstone & Dolan 1977, eq. 7.96 (geometric spreading of a
 * ~35% thermal fraction). Pulse-duration scaling of burn thresholds is a
 * smooth fit to the same manual's yield dependence, checked so that a 15 kt
 * airburst lands in the historical order of magnitude of Hiroshima flash burns.
 *
 * Prompt dose and local fallout are schematic civil-defence scalings,
 * not dispersion forecasts. Crater size is the Glasstone contact-burst
 * power law, checked against the Castle Bravo crater.
 */

export type BurstKind = "air-opt" | "air" | "surface" | "subsurface" | "underwater" | "high";

export type Shelter = "none" | "ordinary" | "substantial";

export type WeatherSnap = {
  tempC: number | null;
  rh: number | null;
  cloud: number | null;
  precipMm: number | null;
  pressureHpa: number | null;
  windMs: number | null;
  windFromDeg: number | null;
  visibilityM: number | null;
  elevationM: number | null;
};

export type ScenarioInput = {
  lat: number;
  lon: number;
  yieldKt: number;
  burst: BurstKind;
  hobM: number;
  burialM: number;
  waterDepthM: number;
  fission: number;
  weather: WeatherSnap | null;
  windOverride: { ms: number; fromDeg: number } | null;
};

export type Ring = {
  id: string;
  group: "fireball" | "blast" | "thermal" | "radiation" | "crater" | "surge";
  label: string;
  detail: string;
  radiusM: number;
  stroke: string;
  fill: string;
};

export type FalloutContour = {
  doseRad: number;
  label: string;
  polygon: [number, number][];
};

export type Effects = {
  yieldKt: number;
  hobUsedM: number;
  pressureFactor: number;
  fireballM: number;
  touchesGround: boolean;
  localFallout: boolean;
  contained: boolean;
  craterRadiusM: number;
  craterDepthM: number;
  baseSurgeM: number;
  rings: Ring[];
  fallout: FalloutContour[];
  falloutMaxKm: number;
  prompt500M: number;
  windMs: number;
  windFromDeg: number;
  downwindDeg: number;
  raining: boolean;
  visibilityKm: number;
  cloud: number;
  notes: string[];
  arrival5psiS: number | null;
  doseAt: (lat: number, lon: number) => number;
};

const PSI_LEVELS = [20, 10, 5, 2, 1] as const;

const PSI_META: Record<number, { label: string; detail: string; stroke: string; fill: string }> = {
  20: {
    label: "20 psi",
    detail: "Cemento armato pesante distrutto. Sopravvivenza accidentale.",
    stroke: "#9c3b2e",
    fill: "rgba(156, 59, 46, 0.28)",
  },
  10: {
    label: "10 psi",
    detail: "Edifici industriali e commerciali crollano. Letalità molto alta.",
    stroke: "#c45c3e",
    fill: "rgba(196, 92, 62, 0.2)",
  },
  5: {
    label: "5 psi",
    detail: "La maggior parte delle abitazioni crolla. Soglia classica di distruzione urbana.",
    stroke: "#d08a45",
    fill: "rgba(208, 138, 69, 0.16)",
  },
  2: {
    label: "2 psi",
    detail: "Danni gravi alle case, infissi divelti, ferite da detriti.",
    stroke: "#e0b56a",
    fill: "rgba(224, 181, 106, 0.1)",
  },
  1: {
    label: "1 psi",
    detail: "Rottura diffusa dei vetri. Ferite da schegge anche a persone in casa.",
    stroke: "#efe0c2",
    fill: "rgba(239, 224, 194, 0.08)",
  },
};

function toKilofeet(m: number) {
  return m / 304.8;
}

/** Peak static overpressure in psi. Ground range and height in meters, yield in kt. */
export function overpressurePsi(yieldKt: number, groundM: number, hobM: number): number {
  const yld = Math.max(yieldKt, 1e-6);
  const gr = Math.max(toKilofeet(groundM), 1e-3);
  const bh = toKilofeet(Math.max(hobM, 0));
  const zRaw = bh / gr;
  const z = Math.min(Math.max(zRaw, 0), 12);
  const cr = Math.cbrt(yld);
  const y = bh / cr;
  const x = gr / cr;
  const r = Math.max(Math.hypot(x, y), 1e-3);
  return brode(z, r, y);
}

function brode(z: number, r: number, y: number): number {
  const a = 1.22 - (3.908 * z ** 2) / (1 + 810.2 * z ** 5);
  const b =
    2.321 +
    (6.195 * z ** 18) / (1 + 1.113 * z ** 18) -
    (0.03831 * z ** 17) / (1 + 0.02415 * z ** 17) +
    0.6692 / (1 + 4164 * z ** 8);
  const c = 4.153 - (1.149 * z ** 18) / (1 + 1.641 * z ** 18) - 1.1 / (1 + 2.771 * z ** 2.5);
  const d = -4.166 + (25.76 * z ** 1.75) / (1 + 1.382 * z ** 18) + (8.257 * z) / (1 + 3.219 * z);
  const e = 1 - (0.004642 * z ** 18) / (1 + 0.003886 * z ** 18);
  const f =
    0.6096 + (2.879 * z ** 9.25) / (1 + 2.359 * z ** 14.5) - (17.5 * z ** 2) / (1 + 71.66 * z ** 3);
  const g = 1.83 + (5.361 * z ** 2) / (1 + 0.3139 * z ** 6);
  const h =
    (8.808 * z ** 1.5) / (1 + 154.5 * z ** 3.5) -
    (0.2905 + 64.67 * z ** 5) / (1 + 441.5 * z ** 5) -
    (1.389 * z) / (1 + 49.03 * z ** 5) +
    (1.094 * r ** 2) / ((781.2 - 123.4 * r + 37.98 * r ** 1.5 + r ** 2) * (1 + 2 * y));
  const j = (0.000629 * y ** 4) / (3.493e-9 + y ** 4) - (2.67 * y ** 2) / (1 + 1e7 * y ** 4.3);
  const k = 5.18 + (0.2803 * y ** 3.5) / (3.788e-6 + y ** 4);
  const val = 10.47 / r ** a + b / r ** c + (d * e) / (1 + f * r ** g) + h + j / r ** k;
  return Number.isFinite(val) ? Math.max(val, 0) : Number.POSITIVE_INFINITY;
}

export function radiusForPsi(yieldKt: number, psi: number, hobM: number): number {
  if (overpressurePsi(yieldKt, 1, hobM) < psi) return 0;
  let lo = 1;
  let hi = 80_000 * Math.cbrt(Math.max(yieldKt, 0.01));
  if (overpressurePsi(yieldKt, hi, hobM) > psi) hi *= 8;
  for (let i = 0; i < 46; i++) {
    const mid = (lo + hi) / 2;
    const p = overpressurePsi(yieldKt, mid, hobM);
    if (!Number.isFinite(p) || p > psi) lo = mid;
    else hi = mid;
  }
  return hi;
}

export function optimumHobM(yieldKt: number): number {
  return 276 * Math.cbrt(Math.max(yieldKt, 1e-6));
}

export function fireballRadiusM(yieldKt: number, surface: boolean): number {
  const k = surface ? 95 : 75;
  return k * Math.pow(Math.max(yieldKt, 1e-6), 0.4);
}

function pulseSeconds(yieldKt: number) {
  return 0.22 * Math.pow(Math.max(yieldKt, 1e-6), 0.44);
}

function burnThreshold(baseAt1s: number, yieldKt: number) {
  return baseAt1s * Math.pow(pulseSeconds(yieldKt), 0.38);
}

function transmittance(slantKm: number, visKm: number, cloud: number, rh: number) {
  const beta = 0.9 / Math.max(visKm, 2);
  let tau = Math.exp(-beta * Math.max(slantKm, 0));
  tau *= Math.exp(-0.0011 * rh * Math.max(slantKm, 0));
  tau *= 1 - 0.5 * Math.min(Math.max(cloud, 0), 1);
  return Math.min(1, Math.max(0.03, tau));
}

function fluenceCal(yieldKt: number, slantM: number, thermalFraction: number, tau: number) {
  const r = Math.max(slantM, 1);
  return (7.9577e6 * thermalFraction * tau * yieldKt) / (r * r);
}

function thermalRadiusM(
  yieldKt: number,
  hobM: number,
  qTarget: number,
  thermalFraction: number,
  visKm: number,
  cloud: number,
  rh: number,
): number {
  const qAt = (groundM: number) => {
    const slant = Math.hypot(groundM, Math.max(hobM, 0));
    const tau = transmittance(slant / 1000, visKm, cloud, rh);
    return fluenceCal(yieldKt, slant, thermalFraction, tau);
  };
  if (qAt(1) < qTarget) return 0;
  let lo = 1;
  let hi = 200_000 * Math.pow(yieldKt, 0.41);
  for (let i = 0; i < 46; i++) {
    const mid = (lo + hi) / 2;
    if (qAt(mid) > qTarget) lo = mid;
    else hi = mid;
  }
  return hi;
}

function promptRadiusM(yieldKt: number, fission: number, doseRem: number): number {
  const yEff = Math.max(0.001, yieldKt * (0.25 + 0.75 * fission));
  const r500 = 690 * Math.pow(yEff, 0.19);
  const doseAt = (r: number) => 500 * (r500 / r) ** 2 * Math.exp(-(r - r500) / 480);
  if (doseAt(30) < doseRem) return 0;
  let lo = 30;
  let hi = Math.max(r500 * 4, 200);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (doseAt(mid) > doseRem) lo = mid;
    else hi = mid;
  }
  return hi;
}

function craterDims(yieldKt: number, burialM: number) {
  const baseR = 40 * Math.pow(yieldKt, 0.33);
  const baseD = 4.5 * Math.pow(yieldKt, 0.3);
  if (burialM <= 0) return { radius: baseR, depth: baseD, contained: false, blastScale: 1 };
  const scaleLen = 30 * Math.pow(yieldKt, 0.3);
  const scaled = burialM / scaleLen;
  let radius = baseR * (1 + 0.4 * Math.min(scaled, 1.4));
  let depth = baseD * (1 + 0.9 * Math.min(scaled, 2));
  let contained = false;
  let blastScale = Math.exp(-burialM / (28 * Math.pow(yieldKt, 0.3)));
  if (scaled > 1.6) {
    radius *= Math.exp(-(scaled - 1.6) * 0.55);
    depth *= Math.exp(-(scaled - 1.6) * 0.25);
  }
  if (scaled > 4.2) {
    contained = true;
    blastScale *= 0.15;
  }
  return { radius, depth, contained, blastScale };
}

export function destination(lat: number, lon: number, bearingDeg: number, distanceM: number): [number, number] {
  const R = 6_371_000;
  const δ = distanceM / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [(φ2 * 180) / Math.PI, (((λ2 * 180) / Math.PI + 540) % 360) - 180];
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6_371_000;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

type Plume = {
  active: boolean;
  lat: number;
  lon: number;
  downwindDeg: number;
  yf: number;
  windMs: number;
  rain: boolean;
  sigmaK: number;
};

function plumeDoseRad(plume: Plume, lat: number, lon: number): number {
  if (!plume.active || plume.yf <= 0) return 0;
  const northKm = (lat - plume.lat) * 111.32;
  const eastKm = (lon - plume.lon) * 111.32 * Math.cos((plume.lat * Math.PI) / 180);
  const θ = (plume.downwindDeg * Math.PI) / 180;
  const x = eastKm * Math.sin(θ) + northKm * Math.cos(θ);
  const y = eastKm * Math.cos(θ) - northKm * Math.sin(θ);
  if (x <= 0.15) return 0;
  const v = Math.max(plume.windMs, 0.6);
  const xScale = (v / 6) * (plume.rain ? 0.7 : 1);
  const xEff = x / xScale;
  const center = (55 * plume.yf * (plume.rain ? 1.65 : 1)) / xScale / Math.pow(Math.max(xEff, 0.2), 1.4);
  const sigma = (0.1 + 0.02 * plume.sigmaK) * x + 0.28 * Math.pow(plume.yf, 0.16);
  return center * Math.exp(-((y / sigma) ** 2));
}

function plumePolygon(plume: Plume, dose: number): [number, number][] {
  if (!plume.active) return [];
  const pts: [number, number][] = [];
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  let maxX = 0;
  for (let i = 1; i <= 72; i++) {
    const x = Math.pow(i / 72, 1.35) * 2500;
    const v = Math.max(plume.windMs, 0.6);
    const xScale = (v / 6) * (plume.rain ? 0.7 : 1);
    const xEff = x / xScale;
    const center = (55 * plume.yf * (plume.rain ? 1.65 : 1)) / xScale / Math.pow(Math.max(xEff, 0.2), 1.4);
    if (center < dose) break;
    maxX = x;
    const sigma = (0.1 + 0.02 * plume.sigmaK) * x + 0.28 * Math.pow(plume.yf, 0.16);
    const half = sigma * Math.sqrt(Math.log(center / dose));
    const distM = x * 1000;
    const cross = half * 1000;
    const bearing = plume.downwindDeg;
    const centerPt = destination(plume.lat, plume.lon, bearing, distM);
    right.push(destination(centerPt[0], centerPt[1], bearing + 90, cross));
    left.push(destination(centerPt[0], centerPt[1], bearing - 90, cross));
  }
  if (maxX < 0.4 || right.length < 3) return [];
  pts.push(...right, ...left.reverse());
  return pts;
}

function blastArrivalSeconds(yieldKt: number, hobM: number, rangeM: number): number | null {
  if (rangeM < 50) return 0;
  const n = 36;
  let t = 0;
  for (let i = 1; i <= n; i++) {
    const s = (rangeM * i) / n;
    const psi = overpressurePsi(yieldKt, s, hobM);
    const dp = psi * 6894.76;
    const ms = Math.sqrt(1 + 0.857 * (dp / 101325));
    const speed = Math.min(Math.max(ms, 1), 40) * 340;
    t += rangeM / n / speed;
  }
  return t;
}

export function computeEffects(input: ScenarioInput): Effects {
  const yieldKt = Math.min(Math.max(input.yieldKt, 0.01), 100_000);
  const fission = Math.min(Math.max(input.fission, 0), 1);
  const weather = input.weather;
  const pressure = weather?.pressureHpa && weather.pressureHpa > 600 ? weather.pressureHpa : 1013.25;
  const pressureFactor = Math.pow(1013.25 / pressure, 1 / 3);
  const visKm = Math.min(80, Math.max(1, (weather?.visibilityM ?? 24_000) / 1000));
  const cloud = weather?.cloud != null ? weather.cloud : 0.3;
  const rh = weather?.rh ?? 60;
  const raining = (weather?.precipMm ?? 0) > 0.2;
  const windMs = input.windOverride?.ms ?? weather?.windMs ?? 6;
  const windFromDeg = input.windOverride?.fromDeg ?? weather?.windFromDeg ?? 270;
  const downwindDeg = (windFromDeg + 180) % 360;

  let hob = input.hobM;
  if (input.burst === "air-opt") hob = optimumHobM(yieldKt);
  if (input.burst === "surface") hob = 0;
  if (input.burst === "subsurface" || input.burst === "underwater") hob = 0;
  if (input.burst === "high") hob = Math.max(input.hobM, 5000);

  const surfaceLike = input.burst === "surface" || input.burst === "subsurface";
  const fireRaw = fireballRadiusM(yieldKt, surfaceLike || hob < fireballRadiusM(yieldKt, false));
  const touchesGround = hob < fireRaw && input.burst !== "underwater" && input.burst !== "high";

  let blastScale = 1;
  let craterRadiusM = 0;
  let craterDepthM = 0;
  let contained = false;
  let baseSurgeM = 0;

  if (input.burst === "surface" || touchesGround) {
    const c = craterDims(yieldKt, 0);
    craterRadiusM = c.radius;
    craterDepthM = c.depth;
  }
  if (input.burst === "subsurface") {
    const c = craterDims(yieldKt, Math.max(input.burialM, 1));
    craterRadiusM = c.radius;
    craterDepthM = c.depth;
    contained = c.contained;
    blastScale = c.blastScale;
  }
  if (input.burst === "underwater") {
    const depth = Math.max(input.waterDepthM, 5);
    blastScale = 0.72 * Math.exp(-depth / (45 * Math.pow(yieldKt, 0.3)));
    baseSurgeM = 380 * Math.pow(yieldKt, 0.33) * Math.exp(-depth / (90 * Math.pow(yieldKt, 0.3)));
  }

  const notes: string[] = [];
  notes.push(
    "Onda d'urto: approssimazione di Brode (1986), circa ±10% rispetto alle curve di Glasstone a livello del mare.",
  );
  if (input.burst === "air-opt") {
    notes.push(
      "Quota scelta per allargare il cerchio dei 5 psi. A quella altezza i 20 psi restano piccoli: una quota più bassa li estende e accorcia i danni leggeri.",
    );
  }
  if (Math.abs(pressureFactor - 1) > 0.02) {
    notes.push(
      `Correzione di primo ordine per la pressione ambiente (${Math.round(pressure)} hPa): i raggi d'urto sono scalati di ${pressureFactor.toFixed(2)}.`,
    );
  }

  const thermalFraction =
    input.burst === "surface" ? 0.18 : input.burst === "subsurface" || input.burst === "underwater" ? 0.05 : 0.35;

  const rings: Ring[] = [];
  const fb = input.burst === "high" ? fireballRadiusM(yieldKt, false) : fireRaw;
  rings.push({
    id: "fireball",
    group: "fireball",
    label: "Palla di fuoco",
    detail: "Volume in cui tutto è vaporizzato. Il raggio è il massimo storico della sfera luminosa, non un muro netto.",
    radiusM: fb,
    stroke: "#f4efe6",
    fill: "rgba(244, 239, 230, 0.55)",
  });

  for (const psi of PSI_LEVELS) {
    const raw = radiusForPsi(yieldKt, psi, hob) * pressureFactor * blastScale;
    const meta = PSI_META[psi];
    rings.push({
      id: `psi-${psi}`,
      group: "blast",
      label: meta.label,
      detail: meta.detail,
      radiusM: raw,
      stroke: meta.stroke,
      fill: meta.fill,
    });
  }

  const q3 = burnThreshold(9.2, yieldKt);
  const q2 = burnThreshold(5.6, yieldKt);
  const q1 = burnThreshold(2.4, yieldKt);
  const qIgn = burnThreshold(6.4, yieldKt);
  const thermH = input.burst === "subsurface" || input.burst === "underwater" ? 0 : hob;
  const thermSpecs = [
    { id: "burn3", label: "Ustioni di terzo grado", q: q3, detail: "Pelle nuda, senza riparo. Soglia che cresce con la durata dell'impulso." },
    { id: "ignite", label: "Innesco di materiali leggeri", q: qIgn, detail: "Carta, foglie secche, tessuti sottili: possibile avvio di incendi." },
    { id: "burn2", label: "Ustioni di secondo grado", q: q2, detail: "Vesciche sulla pelle esposta. Il vestiario chiaro e pesante alza la soglia." },
    { id: "burn1", label: "Ustioni di primo grado", q: q1, detail: "Eritema. Ai bordi l'effetto è molto sensibile a foschia e nubi." },
  ];
  for (const spec of thermSpecs) {
    const radiusM = thermalRadiusM(yieldKt, thermH, spec.q, thermalFraction, visKm, cloud, rh);
    rings.push({
      id: spec.id,
      group: "thermal",
      label: spec.label,
      detail: `${spec.detail} Soglia usata: ${spec.q.toFixed(1)} cal/cm².`,
      radiusM,
      stroke: spec.id === "ignite" ? "#e7c49a" : "#d08a45",
      fill: "rgba(208, 138, 69, 0.05)",
    });
  }

  const prompt500M = input.burst === "subsurface" && contained ? 0 : promptRadiusM(yieldKt, fission, 500);
  rings.push({
    id: "prompt",
    group: "radiation",
    label: "5 Gy pronti (circa 500 rem)",
    detail:
      "Dose approssimata da gamma e neutroni nei primi secondi, all'aperto. Per potenze sopra qualche decina di kt di solito cade dentro l'onda letale.",
    radiusM: prompt500M,
    stroke: "#c9b6a0",
    fill: "rgba(201, 182, 160, 0.12)",
  });

  if (craterRadiusM > 0) {
    rings.push({
      id: "crater",
      group: "crater",
      label: "Cratere apparente",
      detail: "Raggio del cratere visibile, non della zona di danni. Scala di Glasstone per scoppio a contatto, corretta se l'arma è interrata.",
      radiusM: craterRadiusM,
      stroke: "#8a8175",
      fill: "rgba(80, 70, 58, 0.45)",
    });
  }
  if (baseSurgeM > 0) {
    rings.push({
      id: "surge",
      group: "surge",
      label: "Base surge (ordine di grandezza)",
      detail: "Anello di spruzzo radioattivo dopo uno scoppio subacqueo. Molto incerto: dipende da profondità e fondo.",
      radiusM: baseSurgeM,
      stroke: "#8ea0a8",
      fill: "rgba(142, 160, 168, 0.15)",
    });
  }

  const yf = yieldKt * fission;
  const localFallout =
    !contained &&
    input.burst !== "high" &&
    (input.burst === "surface" ||
      input.burst === "subsurface" ||
      input.burst === "underwater" ||
      touchesGround);

  const plume: Plume = {
    active: localFallout && input.burst !== "underwater" && yf > 0,
    lat: input.lat,
    lon: input.lon,
    downwindDeg,
    yf,
    windMs: Math.max(windMs, 0.6),
    rain: raining,
    sigmaK: windMs < 2 ? 1.8 : windMs > 12 ? 0.65 : 1,
  };

  const fallout: FalloutContour[] = [];
  let falloutMaxKm = 0;
  if (plume.active) {
    for (const dose of [3000, 1000, 300, 100, 10]) {
      const polygon = plumePolygon(plume, dose);
      if (polygon.length > 3) {
        fallout.push({ doseRad: dose, label: `${dose.toLocaleString("it-IT")} rad`, polygon });
        for (const [lat, lon] of polygon) {
          falloutMaxKm = Math.max(falloutMaxKm, haversineM(input.lat, input.lon, lat, lon) / 1000);
        }
      }
    }
    notes.push(
      "Fallout locale: schema a sigaro sottovento, non un modello di dispersione. La pioggia accorcia e concentra il deposito; il vento lo allunga.",
    );
  } else if (input.burst === "underwater") {
    notes.push("Scoppio subacqueo: niente pennacchio terrestre classico. Conta la base surge e la contaminazione dell'acqua, qui solo indicative.");
  } else if (contained) {
    notes.push("Sepoltura profonda: scoppio probabilmente contenuto. Poco fallout locale, onda d'urto in aria fortemente ridotta, cratere di subsidenza.");
  } else if (!touchesGround) {
    notes.push(
      "Scoppio in aria sopra la palla di fuoco: fallout locale modesto. Resta un fallout globale ritardato, non disegnato su questa mappa.",
    );
  }

  if (input.burst === "high") {
    notes.push(
      "Quota alta: l'onda al suolo si attenua. Sopra circa 30 km diventa rilevante l'impulso elettromagnetico, che questo modello non disegna come un cerchio netto: può coprire regioni vastissime e dipende dal campo magnetico e dall'elettronica esposta.",
    );
  }

  const r5 = rings.find((r) => r.id === "psi-5")?.radiusM ?? 0;
  const arrival5psiS = r5 > 100 ? blastArrivalSeconds(yieldKt, hob, r5) : null;

  return {
    yieldKt,
    hobUsedM: hob,
    pressureFactor,
    fireballM: fb,
    touchesGround,
    localFallout: plume.active,
    contained,
    craterRadiusM,
    craterDepthM,
    baseSurgeM,
    rings,
    fallout,
    falloutMaxKm,
    prompt500M,
    windMs,
    windFromDeg,
    downwindDeg,
    raining,
    visibilityKm: visKm,
    cloud,
    notes,
    arrival5psiS,
    doseAt: (lat, lon) => plumeDoseRad(plume, lat, lon),
  };
}

export function ringRadius(effects: Effects, id: string) {
  return effects.rings.find((r) => r.id === id)?.radiusM ?? 0;
}
