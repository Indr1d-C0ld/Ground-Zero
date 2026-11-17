import raw from "@/data/cities.json";

/** [name, country code, lat, lon, population]. GeoNames cities15000, CC-BY. */
export type City = [string, string, number, number, number];

export const cities = raw as City[];
