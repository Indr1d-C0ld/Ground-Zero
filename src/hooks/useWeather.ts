import { useEffect } from "react";
import { useStore } from "@/state/store";
import type { WeatherSnap } from "@/lib/model/types";

export const weatherKey = (lat: number, lon: number) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

const inflight = new Set<string>();

function num(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

/** Fetches current weather (Open-Meteo) for every detonation point, once per rounded location. */
export function useWeather() {
  const dets = useStore((s) => s.dets);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const d of dets) {
        const key = weatherKey(d.lat, d.lon);
        if (inflight.has(key) || useStore.getState().weather[key]) continue;
        inflight.add(key);
        const f = new URL("https://api.open-meteo.com/v1/forecast");
        f.searchParams.set("latitude", d.lat.toFixed(3));
        f.searchParams.set("longitude", d.lon.toFixed(3));
        f.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,visibility");
        f.searchParams.set("wind_speed_unit", "ms");
        const e = new URL("https://api.open-meteo.com/v1/elevation");
        e.searchParams.set("latitude", d.lat.toFixed(3));
        e.searchParams.set("longitude", d.lon.toFixed(3));
        Promise.all([fetch(f).then((r) => r.json()), fetch(e).then((r) => r.json()).catch(() => null)])
          .then(([m, el]) => {
            const c = m?.current ?? {};
            const snap: WeatherSnap = {
              tempC: num(c.temperature_2m),
              rh: num(c.relative_humidity_2m),
              cloud: num(c.cloud_cover) != null ? Number(c.cloud_cover) / 100 : null,
              precipMm: num(c.precipitation),
              pressureHpa: num(c.surface_pressure),
              windMs: num(c.wind_speed_10m),
              windFromDeg: num(c.wind_direction_10m),
              visibilityM: num(c.visibility),
              elevationM: num(el?.elevation?.[0]),
            };
            useStore.setState((s) => ({ weather: { ...s.weather, [key]: snap } }));
          })
          .catch(() => useStore.setState((s) => ({ weather: { ...s.weather, [key]: "error" } })))
          .finally(() => inflight.delete(key));
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [dets]);
}
