import {
  buildArrivalTable,
  burnThresholds,
  cloudDims,
  craterDims,
  dynamicPressurePsi,
  empHorizonM,
  fireballRadiusM,
  fluenceCal,
  haversineM,
  interp,
  optimumHobM,
  overpressurePsi,
  peakWindMs,
  positivePhaseS,
  promptDoseGy,
  seismicMb,
  solveRadius,
  thermalTmaxS,
  transmittance,
  type ArrivalTable,
  type BurnThresholds,
} from "@/lib/physics/core";
import { falloutAt, makePlume, plumeContour, type Plume, type PointFallout } from "@/lib/physics/fallout";
import type { Detonation, Environment, ResolvedAtmo, Ring, Thresholds, WeatherSnap } from "@/lib/model/types";

export type FalloutContour = { level: number; mode: "rate" | "dose"; polygon: [number, number][] };

export type Effects = {
  det: Detonation;
  yieldKt: number;
  hobM: number;
  fireballM: number;
  touchesGround: boolean;
  contained: boolean;
  thermalFraction: number;
  tmaxS: number;
  burn: BurnThresholds;
  craterRadiusM: number;
  craterDepthM: number;
  scaledDepth: number;
  baseSurgeM: number;
  blastScale: number;
  pressureFactor: number;
  rings: Ring[];
  plume: Plume;
  fallout: FalloutContour[];
  falloutReachKm: number;
  /** Outer radius of immediate effects (1 psi, ignition, prompt 1 Gy). */
  outerM: number;
  cloud: ReturnType<typeof cloudDims>;
  empM: number;
  mb: number | null;
  arrival: ArrivalTable;
  depositFraction: number;
  notes: string[];
  atmo: ResolvedAtmo;
  // point functions (ground range in m)
  psiAt: (groundM: number) => number;
  fluenceAt: (groundM: number) => number;
  promptAt: (groundM: number) => number;
  /** Fast table lookups (log-spaced in range) for grid computations. */
  lut: { maxR: number; psi: (g: number) => number; q: (g: number) => number; gy: (g: number) => number };
  arrivalAt: (groundM: number) => number;
  shockRadiusAt: (tS: number) => number;
  falloutAtPoint: (lat: number, lon: number, t1: number, t2: number) => PointFallout;
};

export const PSI_INFO: Record<string, { label: string; detail: string; color: string }> = {
  "200": { label: "Distruzione totale", detail: "Anche strutture sotterranee superficiali e bunker leggeri cedono.", color: "#5c1a14" },
  "50": { label: "Rifugi rinforzati", detail: "Limite dei rifugi in cemento armato progettati per l'onda d'urto.", color: "#7a2418" },
  "20": { label: "Cemento armato pesante", detail: "Edifici in cemento armato pesante distrutti o gravemente danneggiati. Sopravvivenza solo fortuita.", color: "#9c3b2e" },
  "10": { label: "Crollo degli edifici", detail: "Crollano edifici commerciali e industriali; letalità molto alta anche al chiuso.", color: "#c45c3e" },
  "5": { label: "Distruzione urbana", detail: "La maggior parte delle abitazioni crolla. Soglia classica della distruzione urbana diffusa.", color: "#d08a45" },
  "3": { label: "Danni gravi", detail: "Case in muratura gravemente lesionate, tetti e pareti leggere asportati. Venti oltre 150 km/h.", color: "#d9a052" },
  "2": { label: "Danni moderati", detail: "Danni strutturali alle case, infissi divelti, molti feriti da detriti.", color: "#e0b56a" },
  "1": { label: "Vetri in frantumi", detail: "Rottura diffusa dei vetri: le schegge feriscono anche chi è in casa.", color: "#efe0c2" },
  "0.5": { label: "Danni leggeri", detail: "Vetri rotti in parte, danni lievi a tetti e intonaci.", color: "#cfc6b6" },
};

export function psiMeta(psi: number) {
  const key = String(psi);
  if (PSI_INFO[key]) return PSI_INFO[key];
  const t = Math.min(1, Math.max(0, Math.log(psi / 0.5) / Math.log(200 / 0.5)));
  const hue = 40 - 32 * t;
  return {
    label: `${psi} psi`,
    detail: "Soglia personalizzata.",
    color: `hsl(${hue} ${45 + 20 * t}% ${78 - 45 * t}%)`,
  };
}

export function resolveAtmo(env: Environment, weather: WeatherSnap | null): ResolvedAtmo {
  const meteo = env.atmoMode === "meteo";
  const pressure = meteo ? (weather?.pressureHpa && weather.pressureHpa > 500 ? weather.pressureHpa : 1013.25) : env.pressureHpa;
  const visKm = meteo ? Math.min(80, Math.max(1, (weather?.visibilityM ?? 24_000) / 1000)) : env.visibilityKm;
  const cloud = meteo ? (weather?.cloud ?? 0.3) : env.cloud;
  const rh = meteo ? (weather?.rh ?? 60) : env.rh;
  const rain = meteo ? (weather?.precipMm ?? 0) > 0.2 : env.rain;
  const windMs = env.windMode === "manual" ? env.windMs : (weather?.windMs ?? 6);
  const windFromDeg = env.windMode === "manual" ? env.windFrom : (weather?.windFromDeg ?? 270);
  return {
    pressureHpa: pressure,
    pressureFactor: Math.pow(1013.25 / pressure, 1 / 3),
    visKm,
    cloud,
    rh,
    rain,
    windMs,
    windFromDeg,
    downwindDeg: (windFromDeg + 180) % 360,
  };
}

export function computeEffects(det: Detonation, atmo: ResolvedAtmo, thr: Thresholds): Effects {
  const yieldKt = Math.min(Math.max(det.yieldKt, 0.001), 100_000);
  const fission = Math.min(Math.max(det.fission, 0), 1);
  const notes: string[] = [];

  let hob = det.hobM;
  if (det.burst === "air-opt") hob = optimumHobM(yieldKt, 5);
  if (det.burst === "surface" || det.burst === "subsurface" || det.burst === "underwater") hob = 0;
  if (det.burst === "high") hob = Math.max(det.hobM, 5000);

  const surfaceLike = det.burst === "surface" || det.burst === "subsurface";
  const fbAir = fireballRadiusM(yieldKt, false);
  const fireballM = surfaceLike || hob < fbAir ? fireballRadiusM(yieldKt, true) : fbAir;
  const touchesGround = hob < fireballM && det.burst !== "underwater" && det.burst !== "high";

  let blastScale = 1;
  let craterRadiusM = 0;
  let craterDepthM = 0;
  let contained = false;
  let baseSurgeM = 0;
  let scaledDepth = 0;
  if (det.burst === "surface" || touchesGround) {
    const c = craterDims(yieldKt, 0);
    // a low air burst digs less: shrink with height relative to the fireball
    const k = det.burst === "surface" ? 1 : Math.max(0, 1 - hob / fireballM) ** 1.5;
    craterRadiusM = c.radius * k;
    craterDepthM = c.depth * k;
  }
  if (det.burst === "subsurface") {
    const c = craterDims(yieldKt, Math.max(det.burialM, 1));
    craterRadiusM = c.radius;
    craterDepthM = c.depth;
    contained = c.contained;
    blastScale = c.blastScale;
    scaledDepth = c.scaledDepth;
  }
  if (det.burst === "underwater") {
    const depth = Math.max(det.waterDepthM, 5);
    blastScale = 0.72 * Math.exp(-depth / (45 * Math.pow(yieldKt, 0.3)));
    baseSurgeM = 380 * Math.pow(yieldKt, 0.33) * Math.exp(-depth / (90 * Math.pow(yieldKt, 0.3)));
  }

  const pf = atmo.pressureFactor;
  const psiAt = (g: number) => overpressurePsi(yieldKt, g / (pf * blastScale || 1e-9), hob) ;

  const thermalFraction =
    det.burst === "surface" ? 0.18 : det.burst === "subsurface" ? 0.18 : det.burst === "underwater" ? 0.02 : det.burst === "high" && hob > 30_000 ? 0.25 : 0.35;
  const thermH = det.burst === "subsurface" || det.burst === "underwater" ? 0 : hob;
  // Earth cover absorbs heat and prompt radiation of a buried burst very quickly.
  const buriedK = det.burst === "subsurface" ? Math.exp(-Math.max(det.burialM, 0) / (2 * Math.cbrt(yieldKt))) : 1;
  const fluenceAt = (g: number) => {
    if (contained || buriedK < 1e-3) return 0;
    const slant = Math.hypot(g, thermH);
    const tau = transmittance(slant / 1000, atmo.visKm, atmo.cloud, atmo.rh);
    return fluenceCal(yieldKt, slant, thermalFraction, tau) * buriedK;
  };
  const promptAt = (g: number) => {
    if (contained || det.burst === "underwater") return 0;
    return promptDoseGy(yieldKt, fission, Math.hypot(g, hob)) * buriedK;
  };

  const burn = burnThresholds(yieldKt);
  const rings: Ring[] = [];

  rings.push({
    id: "fireball",
    group: "fireball",
    label: "Palla di fuoco",
    short: "Palla di fuoco",
    detail:
      "Raggio massimo della sfera luminosa. Dentro la palla di fuoco le temperature superano milioni di gradi nei primi istanti: tutto è vaporizzato.",
    radiusM: det.burst === "high" && hob > fireballM * 3 ? 0 : contained ? 0 : det.burst === "subsurface" && buriedK < 0.5 ? 0 : fireballM,
    color: "#fff1d6",
  });

  const psiList = [...thr.psi].sort((a, b) => b - a);
  for (const psi of psiList) {
    const meta = psiMeta(psi);
    const r = solveRadius(psiAt, psi, 1, 60_000 * Math.cbrt(yieldKt));
    rings.push({
      id: `psi-${psi}`,
      group: "blast",
      label: `${meta.label}`,
      short: `${psi} psi`,
      detail: meta.detail,
      radiusM: r,
      color: meta.color,
    });
  }

  const thermalSpecs = [
    { key: "burn3" as const, label: "Ustioni di 3° grado", q: burn.burn3, color: "#e2703a", detail: "Distruzione a tutto spessore della pelle esposta. Oltre il 25% del corpo, senza cure specialistiche, spesso letale." },
    { key: "ignite" as const, label: "Innesco di incendi", q: burn.ignite, color: "#f2b45a", detail: "Carta, tende, foglie secche e tessuti leggeri prendono fuoco: inizio di incendi diffusi." },
    { key: "burn2" as const, label: "Ustioni di 2° grado", q: burn.burn2, color: "#f3c98a", detail: "Vesciche e lesioni profonde della pelle esposta. Il vestiario chiaro riflette parte dell'impulso." },
    { key: "burn1" as const, label: "Ustioni di 1° grado", q: burn.burn1, color: "#f7e2b8", detail: "Eritema simile a una scottatura solare grave. Molto sensibile a foschia e nubi." },
  ];
  for (const s of thermalSpecs) {
    if (!thr.thermal[s.key]) continue;
    const r = solveRadius(fluenceAt, s.q, 1, 250_000 * Math.pow(yieldKt, 0.41));
    rings.push({
      id: s.key,
      group: "thermal",
      label: s.label,
      short: s.label,
      detail: `${s.detail} Soglia: ${s.q.toFixed(1)} cal/cm².`,
      radiusM: r,
      color: s.color,
    });
  }

  for (const gy of [...thr.promptGy].sort((a, b) => b - a)) {
    const r = solveRadius(promptAt, gy, 1, 20_000);
    rings.push({
      id: `gy-${gy}`,
      group: "radiation",
      label: `Radiazione pronta ${gy} Gy`,
      short: `${gy} Gy`,
      detail:
        gy >= 8
          ? "Dose quasi certamente letale anche con le migliori cure: sindrome gastrointestinale o neurovascolare."
          : gy >= 4
            ? "Intorno alla dose letale mediana (LD50): metà degli esposti muore nelle settimane successive senza cure."
            : gy >= 1
              ? "Sindrome acuta da radiazione: nausea, calo dei globuli bianchi. Raramente letale con cure."
              : "Nessun sintomo acuto; aumento del rischio di tumore a lungo termine.",
      radiusM: r,
      color: gy >= 8 ? "#7fd1b9" : gy >= 4 ? "#9cdcc8" : "#c4ebde",
    });
  }

  if (craterRadiusM > 0) {
    rings.push({
      id: "crater",
      group: "crater",
      label: "Cratere apparente",
      short: "Cratere",
      detail: `Bordo del cratere visibile, profondità circa ${Math.round(craterDepthM)} m. Il materiale espulso ricade come anello di detriti radioattivi.`,
      radiusM: craterRadiusM,
      color: "#8a8175",
    });
  }
  if (baseSurgeM > 0) {
    rings.push({
      id: "surge",
      group: "surge",
      label: "Base surge",
      short: "Base surge",
      detail: "Anello di nebbia radioattiva che si allarga sull'acqua dopo uno scoppio subacqueo (Crossroads Baker, 1946).",
      radiusM: baseSurgeM,
      color: "#8ea0a8",
    });
  }

  let empM = 0;
  if (det.burst === "high" && hob >= 30_000) {
    empM = empHorizonM(hob);
    rings.push({
      id: "emp",
      group: "emp",
      label: "Orizzonte EMP (E1)",
      short: "EMP",
      detail:
        "Regione in vista diretta del punto di scoppio. L'impulso E1 dipende dal campo magnetico terrestre e non è uniforme: il cerchio indica dove può arrivare, non l'entità del danno.",
      radiusM: empM,
      color: "#9db4ff",
    });
  }

  // Local fallout ------------------------------------------------------
  let depositFraction = 0;
  if (!contained && det.burst !== "high" && det.burst !== "underwater") {
    if (det.burst === "surface") depositFraction = 0.8;
    else if (det.burst === "subsurface") depositFraction = 0.9;
    else if (touchesGround) depositFraction = 0.8 * Math.max(0.05, 1 - hob / fireballM) ** 1.2;
  }
  const plume = makePlume({
    active: depositFraction > 0 && fission > 0,
    lat: det.lat,
    lon: det.lon,
    downwindDeg: atmo.downwindDeg,
    yfLocal: yieldKt * fission * depositFraction / 0.8,
    totalKt: yieldKt,
    windMs: atmo.windMs,
    rain: atmo.rain,
  });
  const [t1, t2] = thr.windowH;
  const fallout: FalloutContour[] = [];
  let falloutReachKm = 0;
  if (plume.active) {
    const levels = thr.falloutMode === "rate" ? thr.falloutRate : thr.falloutDose;
    for (const level of [...levels].sort((a, b) => b - a)) {
      const polygon = plumeContour(plume, level, thr.falloutMode, t1, t2);
      if (polygon.length > 3) {
        fallout.push({ level, mode: thr.falloutMode, polygon });
        for (let i = 0; i < polygon.length; i += 6) {
          falloutReachKm = Math.max(falloutReachKm, haversineM(det.lat, det.lon, polygon[i][0], polygon[i][1]) / 1000);
        }
      }
    }
  }

  const ringR = (id: string) => rings.find((r) => r.id === id)?.radiusM ?? 0;
  const r1psi = solveRadius(psiAt, 1, 1, 60_000 * Math.cbrt(yieldKt));
  const rIgn = solveRadius(fluenceAt, burn.burn2, 1, 250_000 * Math.pow(yieldKt, 0.41));
  const rPrompt = solveRadius(promptAt, 0.5, 1, 20_000);
  const outerM = Math.max(r1psi, rIgn, rPrompt, baseSurgeM, craterRadiusM, fireballM, 300);

  const arrival = buildArrivalTable(yieldKt, hob, Math.max(outerM * 1.6, ringR("psi-1") * 2));

  // Notes ---------------------------------------------------------------
  if (det.burst === "air-opt")
    notes.push(
      `Quota scelta per massimizzare il raggio dei 5 psi (${Math.round(hob)} m). A quella quota i 20 psi restano piccoli: una quota più bassa li allarga e accorcia i danni leggeri.`,
    );
  if (Math.abs(pf - 1) > 0.02)
    notes.push(`Pressione ambiente ${Math.round(atmo.pressureHpa)} hPa: raggi d'urto scalati di ${pf.toFixed(2)} (scaling di Sachs, primo ordine).`);
  if (touchesGround && det.burst !== "surface")
    notes.push("La palla di fuoco tocca il suolo: il terreno viene aspirato nella nube e si forma fallout locale.");
  if (!plume.active && det.burst === "air")
    notes.push("Scoppio in aria sopra la palla di fuoco: niente fallout locale significativo. Resta il fallout globale ritardato, non disegnato.");
  if (contained) notes.push("Profondità di sepoltura sufficiente al contenimento: niente cratere d'esplosione, poco rilascio in atmosfera.");
  if (det.burst === "underwater") notes.push("Scoppio subacqueo: onda d'urto in acqua, colonna e base surge. Le contaminazioni dell'acqua non sono disegnate.");
  if (det.burst === "high")
    notes.push(
      hob > 30_000
        ? "Quota altissima: niente onda d'urto rilevante al suolo, palla di fuoco in aria rarefatta. Domina l'impulso elettromagnetico e, per giorni, la ionizzazione dell'alta atmosfera."
        : "Quota alta: l'onda d'urto al suolo si attenua molto; il lampo termico resta visibile a centinaia di chilometri.",
    );
  if (atmo.rain && plume.active) notes.push("Pioggia: il fallout precipita prima e più concentrato vicino al punto zero (rainout).");

  const lut = buildLut(outerM * 1.1, psiAt, fluenceAt, promptAt);

  return {
    lut,
    det,
    yieldKt,
    hobM: hob,
    fireballM,
    touchesGround,
    contained,
    thermalFraction,
    tmaxS: thermalTmaxS(yieldKt),
    burn,
    craterRadiusM,
    craterDepthM,
    scaledDepth,
    baseSurgeM,
    blastScale,
    pressureFactor: pf,
    rings,
    plume,
    fallout,
    falloutReachKm,
    outerM,
    cloud: cloudDims(yieldKt),
    empM,
    mb: det.burst === "subsurface" ? seismicMb(yieldKt, contained ? 1 : 0.6) : det.burst === "underwater" ? seismicMb(yieldKt, 0.8) : det.burst === "surface" ? seismicMb(yieldKt, 0.08) : null,
    arrival,
    depositFraction,
    notes,
    atmo,
    psiAt,
    fluenceAt,
    promptAt,
    arrivalAt: (g) => interp(arrival.r, arrival.t, g),
    shockRadiusAt: (t) => interp(arrival.t, arrival.r, t),
    falloutAtPoint: (lat, lon, a, b) => falloutAt(plume, lat, lon, a, b),
  };
}

function buildLut(maxR: number, psiAt: (g: number) => number, qAt: (g: number) => number, gyAt: (g: number) => number) {
  const n = 512;
  const r0 = 5;
  const lr0 = Math.log(r0);
  const step = (Math.log(Math.max(maxR, 50)) - lr0) / (n - 1);
  const P = new Float64Array(n);
  const Q = new Float64Array(n);
  const G = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const r = Math.exp(lr0 + i * step);
    const p = psiAt(r);
    P[i] = Number.isFinite(p) ? p : 1e5;
    Q[i] = qAt(r);
    G[i] = gyAt(r);
  }
  const look = (arr: Float64Array) => (g: number) => {
    if (g >= maxR) return 0;
    const f = (Math.log(Math.max(g, r0)) - lr0) / step;
    const i = Math.min(n - 2, Math.max(0, Math.floor(f)));
    const t = Math.min(1, Math.max(0, f - i));
    return arr[i] + (arr[i + 1] - arr[i]) * t;
  };
  return { maxR, psi: look(P), q: look(Q), gy: look(G) };
}

export function ringRadius(e: Effects, id: string) {
  return e.rings.find((r) => r.id === id)?.radiusM ?? 0;
}

/** Everything known about one ground point, for one detonation. */
export function probePoint(e: Effects, lat: number, lon: number, t1: number, t2: number) {
  const g = haversineM(e.det.lat, e.det.lon, lat, lon);
  const p = e.psiAt(g);
  const finite = Number.isFinite(p) ? p : 1e5;
  return {
    groundM: g,
    slantM: Math.hypot(g, e.hobM),
    psi: finite,
    dynPsi: dynamicPressurePsi(finite),
    windMs: peakWindMs(finite),
    arrivalS: e.arrivalAt(g),
    positiveS: positivePhaseS(e.yieldKt, g),
    fluence: e.fluenceAt(g),
    thermalArrivalS: e.tmaxS,
    promptGy: e.promptAt(g),
    insideFireball: g < e.fireballM && e.rings[0].radiusM > 0,
    fallout: e.falloutAtPoint(lat, lon, t1, t2),
  };
}
