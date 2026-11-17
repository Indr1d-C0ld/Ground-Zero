/**
 * Local fallout — idealised Gaussian plume.
 *
 * Unit-time (H+1) reference dose rate on the plume axis is a power law calibrated on the
 * Glasstone (1977, §9.93) idealised contours for 1 Mt of fission yield in a 15 mph wind:
 *   3000 rad/h reaching ≈ 35 km downwind and 100 rad/h reaching ≈ 370 km.
 *   R₁(x) = 4.98·10⁵ · (Y_f / 1000 kt) · x^-1.44   [x in km]
 * Cross-wind spread is Gaussian with σ(x) = σ₀ + k·x. Decay follows Way–Wigner, R(t) = R₁ · t^-1.2,
 * so the dose accumulated between t_a and t_b hours is D = 5 · R₁ · (t_a^-0.2 − t_b^-0.2).
 * This is a teaching device, not a dispersion forecast: no wind shear, terrain or particle sizes.
 */
import { destination } from "@/lib/physics/core";

export type Plume = {
  active: boolean;
  lat: number;
  lon: number;
  downwindDeg: number;
  /** Fission yield actually deposited locally, kt. */
  yfLocal: number;
  totalKt: number;
  windMs: number;
  rain: boolean;
  sigma0Km: number;
  spreadK: number;
  x0Km: number;
};

const REF_WIND = 6.7; // m/s, 15 mph

export function makePlume(p: Omit<Plume, "sigma0Km" | "spreadK" | "x0Km">): Plume {
  const scale = Math.cbrt(Math.max(p.totalKt, 0.01) / 1000);
  const stability = p.windMs < 2 ? 1.6 : p.windMs > 12 ? 0.7 : 1;
  return {
    ...p,
    windMs: Math.max(p.windMs, 0.5),
    sigma0Km: Math.max(0.25, 1.5 * Math.pow(Math.max(p.totalKt, 0.01) / 1000, 0.3)),
    spreadK: 0.065 * stability,
    x0Km: Math.max(0.3, 6 * scale),
  };
}

export function axisRateH1(pl: Plume, xKm: number): number {
  const s = pl.windMs / REF_WIND;
  const A = 4.98e5 * (pl.yfLocal / 1000);
  const xe = Math.max(xKm / s, pl.x0Km);
  let r = (A / s) * Math.pow(xe, -1.44);
  if (pl.rain) r *= 2.2 * Math.exp(-xKm / 40) + 0.55;
  return r;
}

export function sigmaKm(pl: Plume, xKm: number) {
  return pl.sigma0Km + pl.spreadK * Math.max(xKm, 0);
}

/** Arrival time of fallout at downwind distance x, hours (cloud stabilisation ≈ 15 min). */
export function arrivalH(pl: Plume, xKm: number): number {
  return 0.25 + Math.max(xKm, 0) / (pl.windMs * 3.6);
}

/** Dose accumulated between t1 and t2 hours for a site with H+1 rate r1 and arrival ta. */
export function windowDose(r1: number, ta: number, t1: number, t2: number): number {
  const a = Math.max(t1, ta, 0.05);
  if (t2 <= a) return 0;
  return 5 * r1 * (Math.pow(a, -0.2) - Math.pow(t2, -0.2));
}

/** Axis value used for contouring: H+1 rate or windowed dose. */
function axisValue(pl: Plume, xKm: number, mode: "rate" | "dose", t1: number, t2: number): number {
  const up = xKm < 0;
  const xa = up ? 0 : xKm;
  const r1 = axisRateH1(pl, xa) * (up ? Math.exp(-((xKm / Math.max(pl.sigma0Km, 0.2)) ** 2)) : 1);
  if (mode === "rate") return r1;
  return windowDose(r1, arrivalH(pl, xa), t1, t2);
}

/** Plume-frame coordinates (km) of a point. x downwind, y crosswind. */
export function plumeXY(pl: Plume, lat: number, lon: number): [number, number] {
  const northKm = (lat - pl.lat) * 111.32;
  const eastKm = (lon - pl.lon) * 111.32 * Math.cos((pl.lat * Math.PI) / 180);
  const θ = (pl.downwindDeg * Math.PI) / 180;
  const x = eastKm * Math.sin(θ) + northKm * Math.cos(θ);
  const y = eastKm * Math.cos(θ) - northKm * Math.sin(θ);
  return [x, y];
}

export type PointFallout = { rateH1: number; arrivalH: number; dose: number; xKm: number; yKm: number };

export function falloutAt(pl: Plume, lat: number, lon: number, t1: number, t2: number): PointFallout {
  if (!pl.active || pl.yfLocal <= 0) return { rateH1: 0, arrivalH: Infinity, dose: 0, xKm: 0, yKm: 0 };
  const [x, y] = plumeXY(pl, lat, lon);
  const up = x < 0;
  const r1Axis = axisRateH1(pl, up ? 0 : x) * (up ? Math.exp(-((x / Math.max(pl.sigma0Km, 0.2)) ** 2)) : 1);
  const sig = sigmaKm(pl, x);
  const rateH1 = r1Axis * Math.exp(-((y / sig) ** 2));
  const ta = arrivalH(pl, x);
  return { rateH1, arrivalH: ta, dose: windowDose(rateH1, ta, t1, t2), xKm: x, yKm: y };
}

/** Closed contour polygon (lat, lon) for a given level, or [] if the plume never reaches it. */
export function plumeContour(pl: Plume, level: number, mode: "rate" | "dose", t1: number, t2: number): [number, number][] {
  if (!pl.active || pl.yfLocal <= 0) return [];
  if (axisValue(pl, 0, mode, t1, t2) < level) return [];
  // find downwind reach
  let hi = 10;
  while (axisValue(pl, hi, mode, t1, t2) > level && hi < 20_000) hi *= 2;
  let lo = 0;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (axisValue(pl, mid, mode, t1, t2) > level) lo = mid;
    else hi = mid;
  }
  const xMax = lo;
  // upwind reach
  let xMin = 0;
  for (let x = 0; x > -pl.sigma0Km * 4; x -= pl.sigma0Km / 20) {
    if (axisValue(pl, x, mode, t1, t2) > level) xMin = x;
    else break;
  }
  const right: [number, number][] = [];
  const left: [number, number][] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    // denser sampling near both tips
    const x = xMin + (xMax - xMin) * (0.5 - 0.5 * Math.cos(Math.PI * u));
    const c = axisValue(pl, x, mode, t1, t2);
    const half = c > level ? sigmaKm(pl, x) * Math.sqrt(Math.log(c / level)) : 0;
    const along = destination(pl.lat, pl.lon, x >= 0 ? pl.downwindDeg : pl.downwindDeg + 180, Math.abs(x) * 1000);
    right.push(destination(along[0], along[1], pl.downwindDeg + 90, half * 1000));
    left.push(destination(along[0], along[1], pl.downwindDeg - 90, half * 1000));
  }
  return [...right, ...left.reverse()];
}

/** Axis profile for charts. */
export function plumeAxisProfile(pl: Plume, t1: number, t2: number, maxKm: number, n = 120) {
  const out: { xKm: number; rateH1: number; dose: number; arrivalH: number }[] = [];
  for (let i = 1; i <= n; i++) {
    const x = maxKm * Math.pow(i / n, 1.6);
    const r1 = axisRateH1(pl, x);
    const ta = arrivalH(pl, x);
    out.push({ xKm: x, rateH1: r1, dose: windowDose(r1, ta, t1, t2), arrivalH: ta });
  }
  return out;
}
