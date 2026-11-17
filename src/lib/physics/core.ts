/**
 * Ground Zero — core effects physics.
 *
 * Every function here is an educational approximation of curves published in the
 * open literature. Units: metres, seconds, kilotons (kt), psi for overpressure,
 * cal/cm² for thermal fluence, Gy for dose (1 Gy ≈ 100 rad), rad/h for fallout dose rate.
 *
 * Sources
 *  - H. L. Brode, "Airblast From Nuclear Bursts — Analytic Approximations", PSR 1986.
 *  - S. Glasstone & P. J. Dolan, "The Effects of Nuclear Weapons", 3rd ed., 1977
 *    (ch. 2 fireball & cloud, ch. 3 blast, ch. 7 thermal, ch. 8 initial radiation, ch. 9 fallout).
 *  - Rankine–Hugoniot relations for an ideal gas, γ = 1.4.
 */

export const P0_PSI = 14.696; // sea-level ambient pressure
export const C0 = 340; // speed of sound, m/s
export const EARTH_R = 6_371_000;

const ftPerM = 1 / 0.3048;

/* ------------------------------------------------------------------ */
/* Blast                                                                */
/* ------------------------------------------------------------------ */

/** Peak static overpressure (psi) at ground range `groundM` for a burst at `hobM`. Brode 1986. */
export function overpressurePsi(yieldKt: number, groundM: number, hobM: number): number {
  const yld = Math.max(yieldKt, 1e-6);
  const gr = Math.max((groundM * ftPerM) / 1000, 1e-3); // kft
  const bh = (Math.max(hobM, 0) * ftPerM) / 1000;
  const z = Math.min(Math.max(bh / gr, 0), 12);
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
  const f = 0.6096 + (2.879 * z ** 9.25) / (1 + 2.359 * z ** 14.5) - (17.5 * z ** 2) / (1 + 71.66 * z ** 3);
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

/** Generic bisection for a monotonically decreasing function of distance. */
export function solveRadius(fn: (r: number) => number, target: number, lo = 1, hiGuess = 1e5, iter = 50): number {
  if (!(fn(lo) > target)) return 0;
  let hi = hiGuess;
  let guard = 0;
  while (fn(hi) > target && guard++ < 12) hi *= 4;
  for (let i = 0; i < iter; i++) {
    const mid = (lo + hi) / 2;
    const v = fn(mid);
    if (!Number.isFinite(v) || v > target) lo = mid;
    else hi = mid;
  }
  return hi;
}

export function radiusForPsi(yieldKt: number, psi: number, hobM: number): number {
  return solveRadius((r) => overpressurePsi(yieldKt, r, hobM), psi, 1, 60_000 * Math.cbrt(Math.max(yieldKt, 0.01)));
}

/** Height that maximises the 5 psi ground range in the Brode fit: ≈ 276 m · Y^(1/3). */
export function optimumHobM(yieldKt: number, psi = 5): number {
  // The optimum shifts with the target pressure: lower pressures favour higher bursts.
  const k = psi >= 20 ? 160 : psi >= 10 ? 210 : psi >= 5 ? 276 : psi >= 2 ? 390 : 520;
  return k * Math.cbrt(Math.max(yieldKt, 1e-6));
}

/** Peak dynamic pressure (psi) behind the shock: q = 5p² / 2(p + 7P0). */
export function dynamicPressurePsi(p: number): number {
  return (5 * p * p) / (2 * (p + 7 * P0_PSI));
}

/** Peak particle (wind) velocity behind the shock front, m/s. */
export function peakWindMs(p: number): number {
  const ratio = p / P0_PSI;
  return ((5 * ratio) / 7) * (C0 / Math.sqrt(1 + (6 * ratio) / 7));
}

/** Shock front speed, m/s. */
export function shockSpeedMs(p: number): number {
  return C0 * Math.sqrt(1 + (6 * p) / (7 * P0_PSI));
}

/** Positive-phase duration (s), Glasstone fig. 3.76 fit, surface-burst scaling with Y^(1/3). */
export function positivePhaseS(yieldKt: number, groundM: number): number {
  const s = groundM / Math.cbrt(Math.max(yieldKt, 1e-6)); // scaled metres per kt^1/3
  // ≈0.12 s at 100 m/kt^⅓, ≈0.3 s at 400, ≈0.42 s by 1500 m/kt^⅓ (1 kt).
  const t1 = 0.45 * (1 - Math.exp(-s / 450)) + 0.02;
  return t1 * Math.cbrt(Math.max(yieldKt, 1e-6));
}

export type ArrivalTable = { r: Float64Array; t: Float64Array };

/** Shock arrival time vs ground range, integrating 1/U along the slant path. */
export function buildArrivalTable(yieldKt: number, hobM: number, maxR: number): ArrivalTable {
  const n = 160;
  const rMax = Math.max(maxR, 200);
  const slantMax = Math.hypot(rMax, hobM);
  const s = new Float64Array(n + 1);
  const ts = new Float64Array(n + 1);
  const yFree = yieldKt / 2; // free-air burst ≈ surface burst of half the yield
  for (let i = 1; i <= n; i++) {
    s[i] = slantMax * Math.pow(i / n, 2);
    const mid = (s[i] + s[i - 1]) / 2;
    const p = overpressurePsi(yFree, Math.max(mid, 1), 0);
    const u = Math.min(Math.max(shockSpeedMs(Number.isFinite(p) ? p : 1e5), C0), 40 * C0);
    ts[i] = ts[i - 1] + (s[i] - s[i - 1]) / u;
  }
  const r = new Float64Array(n + 1);
  const t = new Float64Array(n + 1);
  for (let i = 0; i <= n; i++) {
    const g = Math.sqrt(Math.max(0, s[i] * s[i] - hobM * hobM));
    r[i] = g;
    t[i] = ts[i];
  }
  return { r, t };
}

export function interp(xs: ArrayLike<number>, ys: ArrayLike<number>, x: number): number {
  const n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }
  const f = (x - xs[lo]) / (xs[hi] - xs[lo] || 1);
  return ys[lo] + f * (ys[hi] - ys[lo]);
}

/* ------------------------------------------------------------------ */
/* Fireball and thermal                                                 */
/* ------------------------------------------------------------------ */

/** Maximum fireball radius (m). Glasstone §2.12 order of magnitude; larger for a surface hemisphere. */
export function fireballRadiusM(yieldKt: number, surface: boolean): number {
  return (surface ? 70 : 55) * Math.pow(Math.max(yieldKt, 1e-6), 0.4);
}

/** Time to the second thermal maximum, s. Glasstone eq. 7.85: t_max ≈ 0.0417 · Y^0.44. */
export function thermalTmaxS(yieldKt: number): number {
  return 0.0417 * Math.pow(Math.max(yieldKt, 1e-6), 0.44);
}

/** Fireball radius as it grows (very schematic), m. */
export function fireballAt(yieldKt: number, surface: boolean, tS: number): number {
  const rMax = fireballRadiusM(yieldKt, surface);
  const tm = thermalTmaxS(yieldKt);
  if (tS <= 0) return 0;
  if (tS < tm) return rMax * Math.pow(tS / tm, 0.4);
  return rMax;
}

export type BurnThresholds = { burn1: number; burn2: number; burn3: number; ignite: number };

/** Thermal thresholds (cal/cm²) rise slowly with yield because longer pulses let skin shed heat. */
export function burnThresholds(yieldKt: number): BurnThresholds {
  const s = Math.pow(Math.max(yieldKt, 0.01), 0.065);
  return { burn1: 2.0 * s, burn2: 4.0 * s, burn3: 6.6 * s, ignite: 4.6 * s };
}

/** Atmospheric transmittance along a slant path (km). Visibility, humidity, cloud cover. */
export function transmittance(slantKm: number, visKm: number, cloud: number, rh: number): number {
  const beta = 0.9 / Math.max(visKm, 2);
  let tau = Math.exp(-beta * Math.max(slantKm, 0));
  tau *= Math.exp(-0.0011 * rh * Math.max(slantKm, 0));
  tau *= 1 - 0.5 * Math.min(Math.max(cloud, 0), 1);
  return Math.min(1, Math.max(0.03, tau));
}

/** Thermal fluence (cal/cm²): Q = f · Y · τ / (4π R²) → 7.96e6 · f · τ · Y / R². */
export function fluenceCal(yieldKt: number, slantM: number, thermalFraction: number, tau: number): number {
  const r = Math.max(slantM, 1);
  return (7.9577e6 * thermalFraction * tau * yieldKt) / (r * r);
}

/* ------------------------------------------------------------------ */
/* Initial (prompt) radiation                                           */
/* ------------------------------------------------------------------ */

/** Free-field prompt gamma + neutron dose (Gy) at slant range s. */
export function promptDoseGy(yieldKt: number, fission: number, slantM: number): number {
  const yEff = Math.max(0.001, yieldKt * (0.25 + 0.75 * fission));
  const r5 = 720 * Math.pow(yEff, 0.2); // slant range of ~5 Gy: ≈0.72 km at 1 kt, ≈2.9 km at 1 Mt (Glasstone fig. 8.33)
  const s = Math.max(slantM, 20);
  return 5 * (r5 / s) ** 2 * Math.exp(-(s - r5) / 480);
}

/* ------------------------------------------------------------------ */
/* Crater, cloud, seismic, EMP                                          */
/* ------------------------------------------------------------------ */

export function craterDims(yieldKt: number, burialM: number) {
  const baseR = 40 * Math.pow(yieldKt, 0.33);
  const baseD = 4.5 * Math.pow(yieldKt, 0.3);
  if (burialM <= 0) return { radius: baseR, depth: baseD, contained: false, blastScale: 1, scaledDepth: 0 };
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
  // Scaled depth of burial in m/kt^(1/3), the quantity used by test-site containment rules (≈ 122 m·Y^⅓).
  return { radius, depth, contained, blastScale, scaledDepth: burialM / Math.cbrt(yieldKt) };
}

/** Stabilised mushroom cloud: top, base and radius vs yield (log-interpolated from Glasstone fig. 2.16 and test films). */
const CLOUD_TABLE: [number, number, number, number][] = [
  // yield kt, top km, base km, radius km — Glasstone & Dolan fig. 2.16 / 9.96, §2.17 (10 kt ≈ 19 000 ft)
  [0.01, 0.6, 0.35, 0.15],
  [0.1, 1.4, 0.8, 0.35],
  [1, 3, 1.8, 0.7],
  [10, 6.3, 3.8, 1.6],
  [20, 8, 4.8, 2.2],
  [100, 13, 7.5, 4],
  [1000, 21, 12, 10],
  [10_000, 33, 17, 28],
  [50_000, 62, 30, 47],
  [100_000, 72, 34, 58],
];

export function cloudDims(yieldKt: number) {
  const ly = Math.log10(Math.min(Math.max(yieldKt, 0.01), 100_000));
  const xs = CLOUD_TABLE.map((r) => Math.log10(r[0]));
  return {
    topM: interp(xs, CLOUD_TABLE.map((r) => r[1]), ly) * 1000,
    baseM: interp(xs, CLOUD_TABLE.map((r) => r[2]), ly) * 1000,
    radiusM: interp(xs, CLOUD_TABLE.map((r) => r[3]), ly) * 1000,
    riseS: 360 + 120 * Math.log10(Math.max(yieldKt, 1)), // ~6–10 min to stabilise
  };
}

export function cloudTopAt(topM: number, riseS: number, tS: number): number {
  if (tS <= 0) return 0;
  return topM * (1 - Math.exp((-3 * tS) / riseS));
}

/** Body-wave magnitude of a tamped explosion in hard rock: mb ≈ 4.45 + 0.75 log10 Y. */
export function seismicMb(yieldKt: number, coupling = 1): number {
  return 4.45 + 0.75 * Math.log10(Math.max(yieldKt * coupling, 1e-3));
}

/** Line-of-sight horizon for a high-altitude burst: R ≈ √(2·Rₑ·h). */
export function empHorizonM(hobM: number): number {
  return Math.sqrt(2 * EARTH_R * hobM + hobM * hobM);
}

/* ------------------------------------------------------------------ */
/* Geodesy                                                              */
/* ------------------------------------------------------------------ */

export function destination(lat: number, lon: number, bearingDeg: number, distanceM: number): [number, number] {
  const δ = distanceM / EARTH_R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return [(φ2 * 180) / Math.PI, ((((λ2 * 180) / Math.PI + 540) % 360) - 180)];
}

export function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26 via erf). */
export function phi(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z / Math.SQRT2));
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t *
      Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

/** Log-normal probit: probability that a dose/pressure `x` exceeds a population's tolerance (median m, log-sd s). */
export function probit(x: number, median: number, s: number): number {
  if (!(x > 0) || !(median > 0)) return 0;
  return phi(Math.log(x / median) / s);
}
