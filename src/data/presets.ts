import type { BurstKind } from "@/lib/model/types";

export type PresetShot = {
  lat: number;
  lon: number;
  place: string;
  weaponId: string;
  yieldKt: number;
  fission?: number;
  burst: BurstKind;
  hobM?: number;
  burialM?: number;
  waterDepthM?: number;
};

export type Preset = {
  id: string;
  label: string;
  year: string;
  kind: "storico" | "test" | "studio";
  shots: PresetShot[];
  wind?: { ms: number; from: number };
  /** Historical population scale factor relative to today (approximate). */
  popScale?: number;
  firestorm?: boolean;
  mix?: { outdoor: number; ordinary: number; substantial: number };
  note: string;
  reference?: string;
  /** Gallery topic used to illustrate the case. */
  topic?: string;
};

export const PRESETS: Preset[] = [
  {
    id: "hiroshima",
    topic: "hiroshima",
    label: "Hiroshima",
    year: "6 agosto 1945",
    kind: "storico",
    shots: [{ lat: 34.3955, lon: 132.4536, place: "Hiroshima", weaponId: "little-boy", yieldKt: 15, burst: "air", hobM: 580 }],
    popScale: 1,
    firestorm: true,
    mix: { outdoor: 0.35, ordinary: 0.63, substantial: 0.02 },
    note:
      "Quota e potenza storiche, tempesta di fuoco attiva, molti all'aperto alle 8:15 di un mattino d'estate senza allarme in corso. Nel 1945 in città c'erano circa 300–350 mila persone, concentrate nel delta: la Hiroshima di oggi conta più abitanti ma sparsi su un comune molto più vasto, per cui nel centro la densità del modello resta simile a quella storica.",
    reference: "Morti storiche entro dicembre 1945: 90 000 – 140 000 (RERF, Città di Hiroshima).",
  },
  {
    id: "nagasaki",
    topic: "nagasaki",
    label: "Nagasaki",
    year: "9 agosto 1945",
    kind: "storico",
    shots: [{ lat: 32.7737, lon: 129.8634, place: "Nagasaki (Urakami)", weaponId: "fat-man", yieldKt: 21, burst: "air", hobM: 503 }],
    popScale: 1,
    firestorm: false,
    mix: { outdoor: 0.3, ordinary: 0.66, substantial: 0.04 },
    note:
      "Punto zero sulla valle di Urakami, a circa 3 km dal bersaglio previsto. Le colline schermarono il centro storico. Il modello pone la densità massima nel centro odierno, circa 3 km a sud del punto zero, e ignora l'industria bellica concentrata nella valle: qui sottostima. Utile per discutere quanto conti la geografia della popolazione.",
    reference: "Morti storiche entro dicembre 1945: 60 000 – 80 000.",
  },
  {
    id: "trinity",
    topic: "trinity",
    label: "Trinity",
    year: "16 luglio 1945",
    kind: "test",
    shots: [{ lat: 33.6773, lon: -106.4754, place: "Jornada del Muerto", weaponId: "trinity", yieldKt: 25, burst: "air", hobM: 30 }],
    wind: { ms: 4, from: 225 },
    note: "Torre di 30 m: la palla di fuoco tocca terra e si forma fallout locale, che si diresse verso nord-est (Chupadera Mesa).",
  },
  {
    id: "crossroads-baker",
    topic: "subacquei",
    label: "Crossroads Baker",
    year: "25 luglio 1946",
    kind: "test",
    shots: [{ lat: 11.585, lon: 165.505, place: "Laguna di Bikini", weaponId: "fat-man", yieldKt: 23, burst: "underwater", waterDepthM: 27 }],
    note: "Primo scoppio subacqueo: 27 m sotto la superficie della laguna. La colonna d'acqua e la base surge contaminarono gran parte della flotta bersaglio.",
  },
  {
    id: "ivy-mike",
    topic: "termonucleari",
    label: "Ivy Mike",
    year: "1 novembre 1952",
    kind: "test",
    shots: [{ lat: 11.667, lon: 162.188, place: "Elugelab, Enewetak", weaponId: "ivy-mike", yieldKt: 10400, fission: 0.77, burst: "surface" }],
    wind: { ms: 8, from: 90 },
    note: "Primo dispositivo termonucleare: 10,4 Mt. L'isola di Elugelab scomparve, lasciando un cratere di circa 1,9 km di diametro e 50 m di profondità.",
  },
  {
    id: "bravo",
    topic: "fallout",
    label: "Castle Bravo",
    year: "1 marzo 1954",
    kind: "test",
    shots: [{ lat: 11.697, lon: 165.272, place: "Atollo di Bikini", weaponId: "castle-bravo", yieldKt: 15000, fission: 0.67, burst: "surface" }],
    wind: { ms: 10, from: 260 },
    note:
      "15 Mt contro i 5–6 attesi. Il vento portò il fallout verso est su Rongelap, Utirik e sul peschereccio Daigo Fukuryū Maru. È il caso classico per studiare il pennacchio.",
  },
  {
    id: "tsar",
    topic: "tsar",
    label: "Tsar Bomba",
    year: "30 ottobre 1961",
    kind: "test",
    shots: [{ lat: 73.807, lon: 54.977, place: "Novaja Zemlja", weaponId: "tsar", yieldKt: 50000, fission: 0.03, burst: "air", hobM: 4000 }],
    note: "50 Mt a circa 4 km di quota. La versione ridotta (frazione di fissione bassissima) produsse pochissimo fallout rispetto alla potenza.",
  },
  {
    id: "starfish",
    topic: "alta-quota",
    label: "Starfish Prime",
    year: "9 luglio 1962",
    kind: "test",
    shots: [{ lat: 16.733, lon: -169.533, place: "Johnston Island", weaponId: "w49", yieldKt: 1400, burst: "high", hobM: 400_000 }],
    note: "1,4 Mt a 400 km di quota. Lampioni spenti e allarmi impazziti alle Hawaii, a 1 450 km; aurore artificiali; satelliti danneggiati dalle fasce di radiazione create dallo scoppio.",
  },
  {
    id: "sedan",
    topic: "sotterranei",
    label: "Sedan",
    year: "6 luglio 1962",
    kind: "test",
    shots: [{ lat: 37.177, lon: -116.046, place: "Nevada Test Site", weaponId: "sedan", yieldKt: 104, fission: 0.3, burst: "subsurface", burialM: 194 }],
    wind: { ms: 7, from: 225 },
    note: "Programma Plowshare: scavo nucleare a 194 m. Cratere di 390 m di diametro e 100 m di profondità; la nube portò contaminazione fino allo Iowa.",
  },
  {
    id: "ota-detroit",
    topic: "difesa-civile",
    label: "OTA: Detroit",
    year: "Studio del 1979",
    kind: "studio",
    shots: [{ lat: 42.3314, lon: -83.0458, place: "Detroit", weaponId: "b53", yieldKt: 1000, fission: 0.5, burst: "air", hobM: 1830 }],
    note:
      "Caso del rapporto «The Effects of Nuclear War» dell'Office of Technology Assessment: 1 Mt a 1 830 m sul Civic Center di Detroit, di notte, senza preavviso.",
    reference: "OTA 1979: circa 470 000 morti e 630 000 feriti (popolazione di allora, circa 4,3 milioni nell'area).",
  },
  {
    id: "ota-leningrad",
    topic: "trattati",
    label: "OTA: Leningrado",
    year: "Studio del 1979",
    kind: "studio",
    shots: [{ lat: 59.9386, lon: 30.3141, place: "San Pietroburgo", weaponId: "w56", yieldKt: 1000, fission: 0.5, burst: "air", hobM: 1830 }],
    note: "Secondo caso OTA: 1 Mt in aria su Leningrado. La città, più densa di Detroit, aveva però molti edifici in muratura pesante.",
    reference: "OTA 1979: circa 890 000 morti e 1 260 000 feriti.",
  },
];
