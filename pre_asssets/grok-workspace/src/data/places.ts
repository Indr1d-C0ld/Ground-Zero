import { cities, type City } from "@/data/cities";

const regionNames = new Intl.DisplayNames(["it"], { type: "region" });

export type PlaceHit = { label: string; lat: number; lon: number };

function country(code: string) {
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function label(city: City) {
  return `${city[0]}, ${country(city[1])}`;
}

/** Local GeoNames search. No network. */
export function searchPlaces(query: string, limit = 8): PlaceHit[] {
  const q = fold(query.trim());
  if (q.length < 2) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (const city of cities) {
    const name = fold(city[0]);
    if (name.startsWith(q)) starts.push(city);
    else if (name.includes(q)) contains.push(city);
  }
  const rank = (a: City, b: City) => b[4] - a[4];
  starts.sort(rank);
  contains.sort(rank);
  return [...starts, ...contains].slice(0, limit).map((city) => ({
    label: label(city),
    lat: city[2],
    lon: city[3],
  }));
}

/** Nearest catalogued city, or null if the click is far from any of them. */
export function nearestPlace(lat: number, lon: number, maxKm = 80): string | null {
  let best: City | null = null;
  let bestD = Infinity;
  const cos = Math.cos((lat * Math.PI) / 180);
  for (const city of cities) {
    const dy = city[2] - lat;
    const dx = (city[3] - lon) * cos;
    const d = dy * dy + dx * dx;
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  if (!best) return null;
  const km = Math.sqrt(bestD) * 111;
  if (km > maxKm) return null;
  return label(best);
}
