import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, Map as MapIcon, SlidersHorizontal, SquareChartGantt } from "lucide-react";
import { cities } from "@/data/cities";
import { PRESETS } from "@/data/presets";
import { weaponById } from "@/data/weapons";
import { Archive } from "@/components/atlante/Archive";
import { MapView, type Layers, type MapStyleId } from "@/components/atlante/MapView";
import { Method } from "@/components/atlante/Method";
import { Outcomes } from "@/components/atlante/Outcomes";
import { Studio, type StudioState } from "@/components/atlante/Studio";
import { nearestPlace, searchPlaces } from "@/data/places";
import { estimateHarm } from "@/lib/effects/harm";
import { computeEffects, type WeatherSnap } from "@/lib/effects/physics";
import { formatPeople } from "@/lib/format";

type View = "map" | "studio" | "outcomes" | "archive" | "method";

const little = weaponById("little-boy")!;

const INITIAL: StudioState = {
  weapon: little,
  yieldKt: 15,
  burst: "air",
  hobM: 580,
  burialM: 194,
  waterDepthM: 30,
  fission: 1,
  shelter: "ordinary",
  firestorm: false,
  rural: 15,
  windMode: "meteo",
  windMs: 6,
  windFrom: 270,
  styleId: "buio",
  layers: { fireball: true, blast: true, thermal: true, radiation: true, fallout: true, crater: true },
  compareOn: false,
  compareKt: 100,
};

const SHELTER_LABEL = {
  none: "popolazione all'aperto",
  ordinary: "edifici ordinari",
  substantial: "rifugi sostanziali",
} as const;

export function App() {
  const [view, setView] = useState<View>("map");
  const [studio, setStudio] = useState<StudioState>(INITIAL);
  const [lat, setLat] = useState(34.395);
  const [lon, setLon] = useState(132.455);
  const [place, setPlace] = useState("Hiroshima");
  const [presetNote, setPresetNote] = useState<string | null>(PRESETS[0].note);
  const [fitToken, setFitToken] = useState(1);
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lon: number }[]>([]);
  const [placeQuery, setPlaceQuery] = useState("");
  const [weather, setWeather] = useState<WeatherSnap | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const patch = (partial: Partial<StudioState>) => {
    setPresetNote(null);
    setStudio((s) => ({ ...s, ...partial }));
  };

  const chooseWeapon = (id: string) => {
    const weapon = weaponById(id);
    if (!weapon) return;
    setStudio((s) => ({ ...s, weapon, yieldKt: weapon.yNom, fission: weapon.fission }));
    setFitToken((n) => n + 1);
    setView("map");
    setPresetNote(null);
  };

  const applyPreset = (id: string) => {
    const preset = PRESETS.find((p) => p.id === id);
    const weapon = preset && weaponById(preset.weaponId);
    if (!preset || !weapon) return;
    setLat(preset.lat);
    setLon(preset.lon);
    setPlace(preset.place);
    setPresetNote(preset.note);
    setStudio((s) => ({
      ...s,
      weapon,
      yieldKt: preset.yieldKt,
      burst: preset.burst,
      hobM: preset.hobM,
      burialM: preset.burialM ?? s.burialM,
      fission: weapon.fission,
    }));
    setFitToken((n) => n + 1);
    setView("map");
  };

  useEffect(() => {
    setSuggestions(searchPlaces(placeQuery));
  }, [placeQuery]);

  useEffect(() => {
    const near = nearestPlace(lat, lon);
    if (near) setPlace(near);
    const timer = window.setTimeout(() => {
      const forecast = new URL("https://api.open-meteo.com/v1/forecast");
      forecast.searchParams.set("latitude", String(lat));
      forecast.searchParams.set("longitude", String(lon));
      forecast.searchParams.set(
        "current",
        "temperature_2m,relative_humidity_2m,precipitation,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,visibility",
      );
      forecast.searchParams.set("wind_speed_unit", "ms");
      const elevation = new URL("https://api.open-meteo.com/v1/elevation");
      elevation.searchParams.set("latitude", String(lat));
      elevation.searchParams.set("longitude", String(lon));
      void Promise.all([fetch(forecast.toString()).then((r) => r.json()), fetch(elevation.toString()).then((r) => r.json())])
        .then(([meteo, elev]) => {
          const c = meteo.current ?? {};
          setWeather({
            tempC: num(c.temperature_2m),
            rh: num(c.relative_humidity_2m),
            cloud: num(c.cloud_cover) != null ? Number(c.cloud_cover) / 100 : null,
            precipMm: num(c.precipitation),
            pressureHpa: num(c.surface_pressure),
            windMs: num(c.wind_speed_10m),
            windFromDeg: num(c.wind_direction_10m),
            visibilityM: num(c.visibility),
            elevationM: num(elev?.elevation?.[0]),
          });
          setWeatherError(null);
        })
        .catch(() => setWeatherError("Meteo non raggiungibile: restano i valori di riferimento."));
    }, 350);
    return () => window.clearTimeout(timer);
  }, [lat, lon]);

  const effects = useMemo(
    () =>
      computeEffects({
        lat,
        lon,
        yieldKt: studio.yieldKt,
        burst: studio.burst,
        hobM: studio.hobM,
        burialM: studio.burialM,
        waterDepthM: studio.waterDepthM,
        fission: studio.fission,
        weather,
        windOverride: studio.windMode === "manual" ? { ms: studio.windMs, fromDeg: studio.windFrom } : null,
      }),
    [lat, lon, studio, weather],
  );

  const compare = useMemo(() => {
    if (!studio.compareOn) return null;
    return computeEffects({
      lat,
      lon,
      yieldKt: studio.compareKt,
      burst: studio.burst,
      hobM: studio.hobM,
      burialM: studio.burialM,
      waterDepthM: studio.waterDepthM,
      fission: studio.fission,
      weather,
      windOverride: studio.windMode === "manual" ? { ms: studio.windMs, fromDeg: studio.windFrom } : null,
    });
  }, [studio, lat, lon, weather]);

  const harm = useMemo(
    () => estimateHarm(lat, lon, effects, cities, studio.shelter, studio.firestorm, studio.rural),
    [lat, lon, effects, studio.shelter, studio.firestorm, studio.rural],
  );

  const mapMode = view === "map" || view === "studio" || view === "outcomes";
  const layoutKey = `${view}-${studio.styleId}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2">
        <div className="min-w-0">
          <p className="font-serif text-xl leading-none">Atlante</p>
          <p className="truncate text-xs text-muted">Effetti di una detonazione. Stime educative, non una previsione.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setView("map")}
            className={`hidden min-h-11 rounded-md border px-3 text-sm lg:inline ${mapMode ? "border-ember text-ember" : "border-line"}`}
          >
            Mappa
          </button>
          <button onClick={() => setView("archive")} className={`min-h-11 rounded-md border px-3 text-sm ${view === "archive" ? "border-ember text-ember" : "border-line"}`}>
            Archivio
          </button>
          <button onClick={() => setView("method")} className={`min-h-11 rounded-md border px-3 text-sm ${view === "method" ? "border-ember text-ember" : "border-line"}`}>
            Metodo
          </button>
        </div>
      </header>

      {view === "archive" ? (
        <div className="min-h-0 flex-1">
          <Archive onUse={chooseWeapon} />
        </div>
      ) : view === "method" ? (
        <div className="min-h-0 flex-1">
          <Method />
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)_24rem]">
          <div className="absolute inset-0 lg:relative lg:col-start-2 lg:row-start-1">
            <MapView
              lat={lat}
              lon={lon}
              styleId={studio.styleId as MapStyleId}
              effects={effects}
              compare={compare}
              layers={studio.layers as Layers}
              fitToken={fitToken}
              layoutKey={layoutKey}
              onPick={(nextLat, nextLon) => {
                setLat(nextLat);
                setLon(nextLon);
                setPresetNote(null);
              }}
            />
            <div className="pointer-events-none absolute top-3 right-3 left-3 z-10 flex items-start justify-between gap-2">
              <button onClick={() => setFitToken((n) => n + 1)} className="pointer-events-auto min-h-11 rounded-md border border-line bg-surface px-3 text-sm">
                Inquadra
              </button>
              <p className="pointer-events-none max-w-44 rounded-md bg-surface px-3 py-2 text-right text-xs text-muted">
                {place}
                <span className="mt-0.5 block text-fg">{studio.weapon.name}</span>
              </p>
            </div>
            {view === "map" && (
              <button
                type="button"
                onClick={() => setView("outcomes")}
                className="pointer-events-auto absolute bottom-3 left-3 z-10 rounded-md border border-line bg-surface px-3 py-2 text-left lg:hidden"
              >
                <span className="block font-serif text-lg leading-none">{formatPeople(harm.deaths)}</span>
                <span className="text-[11px] leading-tight text-muted">morti stimati, ordine di grandezza</span>
              </button>
            )}
          </div>
          <aside className={`overflow-hidden border-line bg-bg lg:static lg:col-start-1 lg:row-start-1 lg:block lg:border-r ${view === "studio" ? "absolute inset-0 z-20" : "max-lg:hidden"}`}>
            <Studio
              state={studio}
              place={place}
              suggestions={suggestions}
              onPlaceQuery={setPlaceQuery}
              onSuggestion={(nextLat, nextLon, label) => {
                setLat(nextLat);
                setLon(nextLon);
                setPlace(label);
                setSuggestions([]);
                setPresetNote(null);
                setFitToken((n) => n + 1);
                setView("map");
              }}
              onPreset={applyPreset}
              onWeapon={chooseWeapon}
              patch={patch}
            />
          </aside>
          <aside className={`overflow-hidden border-line bg-bg lg:static lg:col-start-3 lg:row-start-1 lg:block lg:border-l ${view === "outcomes" ? "absolute inset-0 z-20" : "max-lg:hidden"}`}>
            <Outcomes
              weapon={studio.weapon}
              effects={effects}
              harm={harm}
              weather={weather}
              weatherError={weatherError}
              place={place}
              presetNote={presetNote}
              shelterLabel={SHELTER_LABEL[studio.shelter]}
            />
          </aside>
        </div>
      )}

      <nav className="grid shrink-0 grid-cols-4 border-t border-line bg-bg lg:hidden">
        <NavButton active={view === "map"} onClick={() => setView("map")} icon={<MapIcon className="size-4" />} label="Mappa" />
        <NavButton active={view === "studio"} onClick={() => setView("studio")} icon={<SlidersHorizontal className="size-4" />} label="Studio" />
        <NavButton active={view === "outcomes"} onClick={() => setView("outcomes")} icon={<SquareChartGantt className="size-4" />} label="Esiti" />
        <NavButton active={view === "archive"} onClick={() => setView("archive")} icon={<BookOpen className="size-4" />} label="Archivio" />
      </nav>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${active ? "text-ember" : "text-muted"}`}>
      {icon}
      {label}
    </button>
  );
}

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? n : null;
}
