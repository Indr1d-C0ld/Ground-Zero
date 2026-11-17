import type { Units } from "@/lib/model/types";

const nf = (d = 0) => new Intl.NumberFormat("it-IT", { maximumFractionDigits: d, minimumFractionDigits: 0 });

export function trimNum(s: string) {
  return s.includes(",") || s.includes(".") ? s.replace(/([.,]\d*?)0+$/, "$1").replace(/[.,]$/, "") : s;
}

export function formatYield(kt: number): string {
  if (!Number.isFinite(kt)) return "—";
  if (kt < 1) return `${trimNum(nf(kt < 0.01 ? 1 : 0).format(kt * 1000))} t`;
  if (kt < 10) return `${trimNum(nf(2).format(kt))} kt`;
  if (kt < 1000) return `${nf(0).format(kt)} kt`;
  return `${trimNum(nf(kt >= 10_000 ? 1 : 2).format(kt / 1000))} Mt`;
}

export function formatDist(m: number, u?: Units): string {
  if (!Number.isFinite(m) || m <= 0) return "—";
  if (u?.distance === "mi") {
    const ft = m * 3.28084;
    if (ft < 1000) return `${Math.round(ft)} ft`;
    const mi = m / 1609.344;
    return `${trimNum(nf(mi < 10 ? 2 : mi < 100 ? 1 : 0).format(mi))} mi`;
  }
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return `${trimNum(nf(km < 10 ? 2 : km < 100 ? 1 : 0).format(km))} km`;
}

export function formatArea(m2: number, u?: Units): string {
  if (u?.distance === "mi") return `${trimNum(nf(1).format(m2 / 2.59e6))} mi²`;
  const km2 = m2 / 1e6;
  return km2 < 1 ? `${trimNum(nf(2).format(km2))} km²` : `${nf(km2 < 100 ? 1 : 0).format(km2)} km²`;
}

export function formatPressure(psi: number, u?: Units): string {
  if (!Number.isFinite(psi)) return "∞";
  if (u?.pressure === "kPa") {
    const k = psi * 6.894757;
    return `${trimNum(nf(k < 10 ? 1 : 0).format(k))} kPa`;
  }
  return `${trimNum(nf(psi < 1 ? 2 : psi < 10 ? 1 : 0).format(psi))} psi`;
}

export function formatDose(gy: number, u?: Units): string {
  if (!Number.isFinite(gy) || gy <= 0) return "0";
  if (u?.dose === "rad") {
    const r = gy * 100;
    return `${trimNum(nf(r < 10 ? 1 : 0).format(sig(r, 3)))} rad`;
  }
  return `${trimNum(nf(gy < 0.1 ? 3 : gy < 10 ? 2 : 0).format(sig(gy, 3)))} Gy`;
}

/** Fallout quantities are stored in rad / rad·h⁻¹ (Glasstone's units). */
export function formatRad(rad: number, u?: Units, rate = false): string {
  const suffix = rate ? "/h" : "";
  if (u?.dose === "Gy") return `${trimNum(nf(rad < 10 ? 2 : rad < 1000 ? 1 : 0).format(sig(rad / 100, 3)))} Gy${suffix}`;
  return `${trimNum(nf(rad < 10 ? 1 : 0).format(sig(rad, 3)))} rad${suffix}`;
}

export function formatPeople(n: number): string {
  if (!Number.isFinite(n) || n < 1) return "0";
  return nf(0).format(sig(n, 2));
}

export function formatInt(n: number): string {
  return nf(0).format(Math.round(n));
}

export function sig(n: number, figs: number) {
  if (n <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - (figs - 1));
  return Math.round(n / p) * p;
}
export const sigFigs = sig;

export function formatDeg(deg: number) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  const i = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return `${dirs[i]} ${Math.round(deg)}°`;
}

export function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "—";
  if (s < 1e-3) return `${trimNum(nf(1).format(s * 1e6))} µs`;
  if (s < 1) return `${trimNum(nf(s < 0.01 ? 2 : 0).format(s * 1000))} ms`;
  if (s < 60) return `${trimNum(nf(1).format(s))} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`;
  if (s < 86400 * 2) return `${trimNum(nf(1).format(s / 3600))} h`;
  return `${trimNum(nf(1).format(s / 86400))} giorni`;
}

export function formatHours(h: number): string {
  return formatTime(h * 3600);
}

export function formatSpeed(ms: number): string {
  return `${nf(0).format(ms * 3.6)} km/h`;
}

export function formatFluence(q: number): string {
  if (q <= 0) return "0";
  return `${trimNum(nf(q < 1 ? 2 : q < 100 ? 1 : 0).format(q))} cal/cm²`;
}
