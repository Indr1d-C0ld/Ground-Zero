export type BurstKind = "air-opt" | "air" | "surface" | "subsurface" | "underwater" | "high";

export type Detonation = {
  id: string;
  lat: number;
  lon: number;
  place: string;
  weaponId: string;
  yieldKt: number;
  fission: number;
  burst: BurstKind;
  hobM: number;
  burialM: number;
  waterDepthM: number;
  /** Seconds after the first detonation. */
  delayS: number;
};

export type WeatherSnap = {
  tempC: number | null;
  rh: number | null;
  cloud: number | null;
  precipMm: number | null;
  pressureHpa: number | null;
  windMs: number | null;
  windFromDeg: number | null;
  visibilityM: number | null;
  elevationM: number | null;
};

export type Environment = {
  windMode: "meteo" | "manual";
  windMs: number;
  windFrom: number;
  atmoMode: "meteo" | "manual";
  visibilityKm: number;
  rh: number;
  cloud: number;
  rain: boolean;
  pressureHpa: number;
};

export type ShelterClass = "outdoor" | "ordinary" | "substantial";

export type Population = {
  /** Fractions of people outdoors, in ordinary buildings, in substantial shelters (normalised). */
  mix: Record<ShelterClass, number>;
  model: "disc" | "clark";
  scale: number;
  rural: number;
  firestorm: boolean;
  care: "normale" | "collassata";
};

export type Thresholds = {
  psi: number[];
  thermal: { burn3: boolean; burn2: boolean; burn1: boolean; ignite: boolean };
  promptGy: number[];
  falloutMode: "rate" | "dose";
  falloutRate: number[];
  falloutDose: number[];
  windowH: [number, number];
};

export type LayerKey =
  | "fireball"
  | "blast"
  | "thermal"
  | "radiation"
  | "fallout"
  | "crater"
  | "emp"
  | "heat"
  | "labels";

export type Units = { distance: "km" | "mi"; pressure: "psi" | "kPa"; dose: "Gy" | "rad" };

export type Ring = {
  id: string;
  group: "fireball" | "blast" | "thermal" | "radiation" | "crater" | "surge" | "emp";
  label: string;
  short: string;
  detail: string;
  radiusM: number;
  color: string;
};

export type ResolvedAtmo = {
  pressureHpa: number;
  pressureFactor: number;
  visKm: number;
  cloud: number;
  rh: number;
  rain: boolean;
  windMs: number;
  windFromDeg: number;
  downwindDeg: number;
};
