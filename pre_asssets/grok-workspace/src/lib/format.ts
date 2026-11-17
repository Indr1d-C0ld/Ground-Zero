export function formatYield(kt: number): string {
  if (!Number.isFinite(kt)) return "—";
  if (kt < 0.1) return `${Math.round(kt * 1000)} t`;
  if (kt < 10) {
    const n = kt < 1 ? kt.toFixed(2) : kt.toFixed(kt < 3 ? 2 : 1);
    return `${trimNum(n)} kt`;
  }
  if (kt < 1000) return `${trimNum(kt.toFixed(0))} kt`;
  const mt = kt / 1000;
  const digits = mt >= 10 ? 1 : 2;
  return `${trimNum(mt.toFixed(digits))} Mt`;
}

function trimNum(s: string) {
  return s.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
}

export function formatKm(m: number): string {
  if (!Number.isFinite(m) || m <= 0) return "—";
  if (m < 1000) return `${Math.round(m)} m`;
  if (m < 10_000) return `${(m / 1000).toFixed(2)} km`;
  if (m < 100_000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m / 1000)} km`;
}

export function formatPeople(n: number): string {
  if (!Number.isFinite(n) || n < 1) return "0";
  const sig = sigFigs(n, 2);
  return new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 }).format(sig);
}

export function sigFigs(n: number, figs: number) {
  if (n <= 0) return 0;
  const p = Math.pow(10, Math.floor(Math.log10(n)) - (figs - 1));
  return Math.round(n / p) * p;
}

export function formatDeg(deg: number) {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
  const i = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return `${dirs[i]} ${Math.round(deg)}°`;
}
