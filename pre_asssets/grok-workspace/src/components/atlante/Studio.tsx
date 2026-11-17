import { useMemo, useState } from "react";
import { PRESETS } from "@/data/presets";
import { ORIGIN_LABEL, weapons, type Weapon } from "@/data/weapons";
import type { BurstKind, Shelter } from "@/lib/effects/physics";
import { formatDeg, formatYield } from "@/lib/format";
import { MAP_STYLES, type Layers, type MapStyleId } from "@/components/atlante/MapView";

const Y_MIN = Math.log10(0.01);
const Y_MAX = Math.log10(100000);

function yieldToPos(kt: number) {
  return ((Math.log10(Math.min(Math.max(kt, 0.01), 100000)) - Y_MIN) / (Y_MAX - Y_MIN)) * 1000;
}
function posToYield(pos: number) {
  return 10 ** (Y_MIN + (pos / 1000) * (Y_MAX - Y_MIN));
}

export type StudioState = {
  weapon: Weapon;
  yieldKt: number;
  burst: BurstKind;
  hobM: number;
  burialM: number;
  waterDepthM: number;
  fission: number;
  shelter: Shelter;
  firestorm: boolean;
  rural: number;
  windMode: "meteo" | "manual";
  windMs: number;
  windFrom: number;
  styleId: MapStyleId;
  layers: Layers;
  compareOn: boolean;
  compareKt: number;
};

type Props = {
  state: StudioState;
  place: string;
  onPlaceQuery: (q: string) => void;
  suggestions: { label: string; lat: number; lon: number }[];
  onSuggestion: (lat: number, lon: number, label: string) => void;
  onPreset: (id: string) => void;
  patch: (partial: Partial<StudioState>) => void;
  onWeapon: (id: string) => void;
};

const BURSTS: { id: BurstKind; label: string }[] = [
  { id: "air-opt", label: "Aria, quota ottimale" },
  { id: "air", label: "Aria, quota scelta" },
  { id: "surface", label: "Superficie" },
  { id: "subsurface", label: "Sotterraneo" },
  { id: "underwater", label: "Subacqueo" },
  { id: "high", label: "Quota alta" },
];

export function Studio(props: Props) {
  const { state, patch } = props;
  const [query, setQuery] = useState("");
  const [placeQ, setPlaceQ] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return weapons.slice(0, 8);
    return weapons
      .filter((w) => {
        const blob = `${w.name} ${w.aka ?? ""} ${ORIGIN_LABEL[w.origin]} ${w.kind}`.toLowerCase();
        return blob.includes(q);
      })
      .slice(0, 12);
  }, [query]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div>
        <p className="text-xs tracking-widest text-muted uppercase">Punto e scenario</p>
        <h2 className="font-serif text-2xl leading-tight text-fg">Impostare lo studio</h2>
      </div>

      <label className="block">
        <span className="text-sm text-muted">Cercare una città del catalogo locale</span>
        <input
          value={placeQ}
          placeholder={props.place}
          onChange={(e) => {
            setPlaceQ(e.target.value);
            props.onPlaceQuery(e.target.value);
          }}
          className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-fg outline-none focus:border-ember"
        />
      </label>
      {props.suggestions.length > 0 && (
        <ul className="overflow-hidden rounded-md border border-line">
          {props.suggestions.map((s) => (
            <li key={`${s.lat}-${s.lon}-${s.label}`}>
              <button
                className="min-h-11 w-full px-3 text-left text-sm hover:bg-surface-2"
                onClick={() => {
                  props.onSuggestion(s.lat, s.lon, s.label);
                  setPlaceQ("");
                }}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => props.onPreset(p.id)}
            className="min-h-11 rounded-full border border-line px-3 text-sm text-fg hover:border-ember"
          >
            {p.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="text-sm text-muted">Archivio — nome, paese, tipo</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="B61, Tsar, Francia, artiglieria…"
          className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-fg outline-none focus:border-ember"
        />
      </label>
      <ul className="max-h-48 overflow-y-auto rounded-md border border-line">
        {filtered.map((w) => {
          const on = w.id === state.weapon.id;
          return (
            <li key={w.id}>
              <button
                onClick={() => props.onWeapon(w.id)}
                className={`flex min-h-11 w-full items-baseline justify-between gap-3 px-3 text-left text-sm ${on ? "bg-surface-2 text-ember" : "hover:bg-surface-2"}`}
              >
                <span>
                  {w.name}
                  <span className="ml-2 text-muted">{ORIGIN_LABEL[w.origin]}</span>
                </span>
                <span className="shrink-0 text-muted">{formatYield(w.yNom)}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="text-sm text-muted">
        In studio: <span className="text-fg">{state.weapon.name}</span>. Resa d'archivio {formatYield(state.weapon.yMin)}
        –{formatYield(state.weapon.yMax)}, nominale {formatYield(state.weapon.yNom)}. Affidabilità: {state.weapon.confidence}.
      </p>

      <Slider
        label="Potenza"
        valueLabel={formatYield(state.yieldKt)}
        min={0}
        max={1000}
        step={1}
        value={yieldToPos(state.yieldKt)}
        onChange={(v) => patch({ yieldKt: Math.round(posToYield(v) * 1000) / 1000 })}
      />

      <fieldset>
        <legend className="text-sm text-muted">Natura dello scoppio</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {BURSTS.map((b) => (
            <button
              key={b.id}
              onClick={() => patch({ burst: b.id })}
              className={`min-h-11 rounded-md border px-2 text-sm ${state.burst === b.id ? "border-ember text-ember" : "border-line text-fg"}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </fieldset>

      {state.burst === "air" && (
        <Slider
          label="Quota di scoppio"
          valueLabel={`${Math.round(state.hobM)} m`}
          min={30}
          max={15000}
          step={10}
          value={state.hobM}
          onChange={(v) => patch({ hobM: v })}
        />
      )}
      {state.burst === "high" && (
        <Slider
          label="Quota"
          valueLabel={`${(state.hobM / 1000).toFixed(1)} km`}
          min={5000}
          max={80000}
          step={500}
          value={state.hobM}
          onChange={(v) => patch({ hobM: v })}
        />
      )}
      {state.burst === "subsurface" && (
        <Slider
          label="Profondità di sepoltura"
          valueLabel={`${Math.round(state.burialM)} m`}
          min={5}
          max={800}
          step={1}
          value={state.burialM}
          onChange={(v) => patch({ burialM: v })}
        />
      )}
      {state.burst === "underwater" && (
        <Slider
          label="Profondità"
          valueLabel={`${Math.round(state.waterDepthM)} m`}
          min={5}
          max={600}
          step={1}
          value={state.waterDepthM}
          onChange={(v) => patch({ waterDepthM: v })}
        />
      )}

      <Slider
        label="Frazione di fissione"
        valueLabel={`${Math.round(state.fission * 100)}%`}
        min={0}
        max={100}
        step={1}
        value={state.fission * 100}
        onChange={(v) => patch({ fission: v / 100 })}
      />
      <p className="text-xs text-muted">Serve al fallout e alla radiazione pronta. Le termonucleari non sono «tutta fusione».</p>

      <fieldset>
        <legend className="text-sm text-muted">Riparo della popolazione</legend>
        <div className="mt-2 grid gap-2">
          {(
            [
              ["none", "All'aperto, senza preavviso"],
              ["ordinary", "Dentro edifici ordinari"],
              ["substantial", "Rifugi sostanziali"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => patch({ shelter: id })}
              className={`min-h-11 rounded-md border px-3 text-left text-sm ${state.shelter === id ? "border-ember text-ember" : "border-line"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        onClick={() => patch({ firestorm: !state.firestorm })}
        className={`min-h-11 rounded-md border px-3 text-left text-sm ${state.firestorm ? "border-ember text-ember" : "border-line"}`}
      >
        Tempesta di fuoco urbana: {state.firestorm ? "inclusa come ipotesi" : "spenta"}
      </button>

      <Slider
        label="Densità di fondo, fuori dalle città"
        valueLabel={`${Math.round(state.rural)} /km²`}
        min={0}
        max={400}
        step={5}
        value={state.rural}
        onChange={(v) => patch({ rural: v })}
      />

      <fieldset>
        <legend className="text-sm text-muted">Vento per il fallout</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            onClick={() => patch({ windMode: "meteo" })}
            className={`min-h-11 rounded-md border text-sm ${state.windMode === "meteo" ? "border-ember text-ember" : "border-line"}`}
          >
            Meteo attuale
          </button>
          <button
            onClick={() => patch({ windMode: "manual" })}
            className={`min-h-11 rounded-md border text-sm ${state.windMode === "manual" ? "border-ember text-ember" : "border-line"}`}
          >
            Manuale
          </button>
        </div>
      </fieldset>
      {state.windMode === "manual" && (
        <>
          <Slider
            label="Velocità"
            valueLabel={`${state.windMs.toFixed(1)} m/s`}
            min={0.5}
            max={30}
            step={0.5}
            value={state.windMs}
            onChange={(v) => patch({ windMs: v })}
          />
          <Slider
            label="Proviene da"
            valueLabel={formatDeg(state.windFrom)}
            min={0}
            max={359}
            step={1}
            value={state.windFrom}
            onChange={(v) => patch({ windFrom: v })}
          />
        </>
      )}

      <label className="block">
        <span className="text-sm text-muted">Natura della mappa</span>
        <select
          value={state.styleId}
          onChange={(e) => patch({ styleId: e.target.value as MapStyleId })}
          className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface-2 px-3 text-fg"
        >
          {MAP_STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            ["fireball", "Palla di fuoco"],
            ["blast", "Onda d'urto"],
            ["thermal", "Calore"],
            ["radiation", "Radiazione pronta"],
            ["fallout", "Fallout"],
            ["crater", "Cratere"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => patch({ layers: { ...state.layers, [key]: !state.layers[key] } })}
            className={`min-h-11 rounded-md border text-sm ${state.layers[key] ? "border-ember text-ember" : "border-line text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => patch({ compareOn: !state.compareOn })}
        className={`min-h-11 rounded-md border px-3 text-left text-sm ${state.compareOn ? "border-ember text-ember" : "border-line"}`}
      >
        Confrontare un'altra potenza: {state.compareOn ? "sì, anelli tratteggiati" : "no"}
      </button>
      {state.compareOn && (
        <Slider
          label="Seconda potenza"
          valueLabel={formatYield(state.compareKt)}
          min={0}
          max={1000}
          step={1}
          value={yieldToPos(state.compareKt)}
          onChange={(v) => patch({ compareKt: Math.round(posToYield(v) * 100) / 100 })}
        />
      )}
    </div>
  );
}

function Slider({
  label,
  valueLabel,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{label}</span>
        <span className="text-fg">{valueLabel}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
