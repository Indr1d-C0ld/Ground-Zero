import { PHOTOS } from "@/data/photos";

export type GalleryItem = {
  id: string;
  src: string;
  title: string;
  caption: string;
  year: number | null;
  topics: string[];
  kind: "foto" | "diagramma" | "documento";
  credit: string;
  license: string;
  source?: string;
  /** Pixel size, when known. */
  w?: number;
  h?: number;
};

// gallery.json is produced by the image research pass; tolerate its absence.
const mods = import.meta.glob<{ default: GalleryItem[] }>("./gallery.json", { eager: true });
const extra: GalleryItem[] = Object.values(mods).flatMap((m) => m.default ?? []);

const PHOTO_TOPICS: Record<string, string[]> = {
  "little-boy": ["hiroshima", "manhattan"],
  "fat-man": ["nagasaki", "manhattan"],
  enola: ["hiroshima", "vettori"],
  bockscar: ["nagasaki", "vettori"],
  hiroshima: ["hiroshima", "nube"],
  nagasaki: ["nagasaki", "nube"],
  tower: ["trinity", "manhattan"],
  ivy: ["termonucleari", "nube"],
  shrimp: ["termonucleari", "fallout"],
  sedan: ["sotterranei", "crateri"],
  davy: ["vettori"],
};

const legacy: GalleryItem[] = Object.values(PHOTOS).map((p) => ({
  id: `legacy-${p.id}`,
  src: p.src,
  title: p.caption.split(".")[0],
  caption: p.caption,
  year: null,
  topics: PHOTO_TOPICS[p.id] ?? (p.kind === "vettore" ? ["vettori"] : p.kind === "prova" ? ["nube"] : ["vettori"]),
  kind: p.kind === "prova" ? "documento" : "foto",
  credit: p.credit,
  license: /pubblico/i.test(p.credit) ? "Pubblico dominio" : "Licenza libera (vedi credito)",
}));

export const GALLERY: GalleryItem[] = [...extra, ...legacy];

export const TOPIC_LABEL: Record<string, string> = {
  manhattan: "Progetto Manhattan",
  trinity: "Trinity",
  hiroshima: "Hiroshima",
  nagasaki: "Nagasaki",
  "palla-di-fuoco": "Palla di fuoco",
  nube: "Nube a fungo",
  "onda-urto": "Onda d'urto",
  termico: "Effetti termici",
  radiazione: "Radiazione",
  fallout: "Fallout",
  termonucleari: "Armi termonucleari",
  tsar: "Tsar Bomba",
  sotterranei: "Test sotterranei",
  subacquei: "Scoppi subacquei",
  "alta-quota": "Alta quota ed EMP",
  crateri: "Crateri",
  vettori: "Vettori",
  "difesa-civile": "Difesa civile",
  trattati: "Trattati",
  medicina: "Medicina",
  diagrammi: "Diagrammi",
};

/** Images at least this wide are good enough for full-width banners. */
export const isSharp = (g: GalleryItem, min = 1000) => (g.w ?? 1200) >= min;

export function byTopic(topic: string, exclude: Set<string> = new Set(), n = 3, minW = 0): GalleryItem[] {
  const out: GalleryItem[] = [];
  const pool = [...GALLERY].sort((a, b) => Number(isSharp(b, 700)) - Number(isSharp(a, 700)));
  for (const g of pool) {
    if (minW && !isSharp(g, minW)) continue;
    if (out.length >= n) break;
    if (g.topics.includes(topic) && !exclude.has(g.id)) out.push(g);
  }
  return out;
}
