import type { BurstKind } from "@/lib/effects/physics";

export type Preset = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  place: string;
  weaponId: string;
  yieldKt: number;
  burst: BurstKind;
  hobM: number;
  burialM?: number;
  note: string;
};

export const PRESETS: Preset[] = [
  {
    id: "hiroshima",
    label: "Hiroshima, 1945",
    lat: 34.395,
    lon: 132.455,
    place: "Hiroshima",
    weaponId: "little-boy",
    yieldKt: 15,
    burst: "air",
    hobM: 580,
    note: "Ricostruzione della quota e della potenza storiche. La popolazione sulla mappa è quella di oggi, non le circa 350 mila persone del 1945. I morti storici stimati sono fra 70 e 140 mila.",
  },
  {
    id: "nagasaki",
    label: "Nagasaki, 1945",
    lat: 32.773,
    lon: 129.863,
    place: "Nagasaki",
    weaponId: "fat-man",
    yieldKt: 21,
    burst: "air",
    hobM: 503,
    note: "9 agosto 1945, quota circa 500 m. Le colline della città, assenti da questo modello, schermarono quartieri interi. Anche qui la popolazione è odierna.",
  },
  {
    id: "trinity",
    label: "Trinity, 1945",
    lat: 33.677,
    lon: -106.475,
    place: "Jornada del Muerto",
    weaponId: "trinity",
    yieldKt: 25,
    burst: "air",
    hobM: 30,
    note: "Torre di 30 m nel deserto del New Mexico. Rendimento rivisto intorno a 25 kt; la stima del 1945 era 21.",
  },
  {
    id: "bravo",
    label: "Castle Bravo, 1954",
    lat: 11.697,
    lon: 165.272,
    place: "Atollo di Bikini",
    weaponId: "castle-bravo",
    yieldKt: 15000,
    burst: "surface",
    hobM: 0,
    note: "Scoppio a contatto sulla barriera. È il caso per guardare il cratere e il pennacchio, non la distruzione di una città. Il vento reale di quel giorno non è il meteo di adesso: si può fissare il vento a mano.",
  },
  {
    id: "tsar",
    label: "Tsar Bomba, 1961",
    lat: 73.807,
    lon: 54.977,
    place: "Novaja Zemlja",
    weaponId: "tsar",
    yieldKt: 50000,
    burst: "air",
    hobM: 4000,
    note: "50 Mt a circa 4 km di quota, sopra un poligono artico. La versione da 100 Mt non fu quella fatta esplodere.",
  },
  {
    id: "sedan",
    label: "Sedan, 1962",
    lat: 37.177,
    lon: -116.046,
    place: "Nevada Test Site",
    weaponId: "sedan",
    yieldKt: 104,
    burst: "subsurface",
    hobM: 0,
    burialM: 194,
    note: "104 kt a 194 m di profondità. Cratere reale: circa 390 m di diametro e 100 m di profondità.",
  },
];
