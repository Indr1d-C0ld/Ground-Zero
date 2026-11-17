import raw from "@/data/cities.json";

/**
 * [name, country code, lat, lon, population, catalogue population].
 * GeoNames cities15000, CC-BY. Index 4 is the population actually placed on the map,
 * index 5 the population as catalogued (used for disc size and for search ranking).
 */
export type City = [string, string, number, number, number, number];

/**
 * GeoNames lists many metropolises at several levels at once: "New York City", its boroughs
 * ("Brooklyn") and neighbourhoods ("Bushwick"). Processing places from the smallest up, each
 * place keeps only the people not already accounted for by the smaller places inside its disc
 * (with a floor of 15%), so the total population of a metro area is not counted two or three times.
 */
function nest(list: [string, string, number, number, number][]): City[] {
  const out: City[] = list.map((c) => [c[0], c[1], c[2], c[3], c[4], c[4]]);
  const order = out.map((_, i) => i).sort((a, b) => out[a][5] - out[b][5]);
  // latitude buckets of 0.5°
  const buckets = new Map<number, number[]>();
  for (const i of order) {
    const key = Math.floor(out[i][2] * 2);
    const arr = buckets.get(key);
    if (arr) arr.push(i);
    else buckets.set(key, [i]);
  }
  for (const i of order) {
    const b = out[i];
    if (b[5] < 150_000) continue;
    const density = b[5] > 5_000_000 ? 8000 : b[5] > 1_000_000 ? 5500 : b[5] > 200_000 ? 3500 : 2200;
    const rKm = Math.sqrt(b[5] / density / Math.PI);
    const cos = Math.cos((b[2] * Math.PI) / 180);
    let inside = 0;
    const k0 = Math.floor((b[2] - rKm / 111) * 2);
    const k1 = Math.floor((b[2] + rKm / 111) * 2);
    for (let k = k0; k <= k1; k++) {
      for (const j of buckets.get(k) ?? []) {
        const c = out[j];
        if (j === i || c[5] >= b[5]) continue;
        const dx = (c[3] - b[3]) * 111 * cos;
        const dy = (c[2] - b[2]) * 111;
        if (dx * dx + dy * dy < rKm * rKm) inside += c[4];
      }
    }
    b[4] = Math.max(b[5] * 0.15, b[5] - inside);
  }
  return out;
}

export const cities: City[] = nest(raw as [string, string, number, number, number][]);
