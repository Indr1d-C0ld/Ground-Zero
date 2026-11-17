import { useMemo, useState } from "react";
import { Copy, Crosshair, Plus, Search, Trash2, X } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { byTopic } from "@/data/gallery";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import { ORIGIN_LABEL, weaponById, weapons } from "@/data/weapons";
import { searchPlaces } from "@/data/places";
import { optimumHobM } from "@/lib/physics/core";
import { formatDeg, formatDist, formatYield } from "@/lib/format";
import type { BurstKind, Detonation } from "@/lib/model/types";
import { activeDet, useStore } from "@/state/store";
import { weatherKey } from "@/hooks/useWeather";
import { MAP_STYLES } from "@/components/sim/MapView";
import { Button, Callout, Chip, Section, Segmented, Slider, Toggle, NumberField, cx } from "@/components/ui";

const BURSTS: { id: BurstKind; label: string; hint: string }[] = [
  { id: "air-opt", label: "Aria ottimale", hint: "Quota che massimizza il raggio dei 5 psi: lo scenario di massima distruzione urbana." },
  { id: "air", label: "Aria, quota libera", hint: "Scegli la quota: sotto la palla di fuoco nasce fallout locale." },
  { id: "surface", label: "Al suolo", hint: "Contatto col terreno: cratere, onda più breve ma intensa, molto fallout." },
  { id: "subsurface", label: "Sotterraneo", hint: "Sepolto: cratere da scavo o, in profondità, scoppio contenuto." },
  { id: "underwater", label: "Subacqueo", hint: "In acqua: colonna, base surge, onde. Pochi effetti termici." },
  { id: "high", label: "Alta quota", hint: "Sopra 30 km: niente onda al suolo, domina l'impulso elettromagnetico." },
];

type Tab = "scenario" | "ambiente" | "popolazione" | "soglie";

export function Controls() {
  const [tab, setTab] = useState<Tab>("scenario");
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-line px-3 pt-3 pb-2">
        <Segmented
          size="sm"
          value={tab}
          onChange={setTab}
          options={[
            { id: "scenario", label: "Scenario" },
            { id: "ambiente", label: "Ambiente" },
            { id: "popolazione", label: "Persone" },
            { id: "soglie", label: "Soglie" },
          ]}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "scenario" && <ScenarioTab />}
        {tab === "ambiente" && <EnvironmentTab />}
        {tab === "popolazione" && <PopulationTab />}
        {tab === "soglie" && <ThresholdTab />}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */

function ScenarioTab() {
  const presetId = useStore((s) => s.presetId);
  const applyPreset = useStore((s) => s.applyPreset);
  const kinds = [
    { id: "storico", label: "Impieghi in guerra" },
    { id: "test", label: "Test storici" },
    { id: "studio", label: "Studi ufficiali" },
  ] as const;
  const preset = PRESETS.find((p) => p.id === presetId);
  const pics = preset?.topic ? byTopic(preset.topic, new Set(), 4) : [];
  const lb = useLightbox();
  return (
    <>
      <Section title="Casi di studio" kicker="Partire da un evento documentato" chapter="test">
        {kinds.map((k) => (
          <div key={k.id}>
            <p className="mb-1.5 text-[11px] text-faint">{k.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.filter((p) => p.kind === k.id).map((p) => (
                <Chip key={p.id} active={presetId === p.id} onClick={() => applyPreset(p.id)} title={p.year}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>
        ))}
        {pics.length > 0 && (
          <div className="grid grid-cols-4 gap-1">
            {pics.map((g, i) => (
              <button key={g.id} title={g.title} onClick={() => lb.open(pics, i)} className={i === 0 ? "col-span-4 overflow-hidden rounded-md" : "overflow-hidden rounded-md"}>
                <img src={g.src} alt={g.title} loading="lazy" className={i === 0 ? "h-36 w-full object-cover" : "h-14 w-full object-cover"} />
              </button>
            ))}
          </div>
        )}
        <Lightbox state={lb.state} onClose={lb.close} onIndex={(i) => lb.set((s) => (s ? { ...s, i } : s))} />
        {preset && (
          <Callout>
            <span className="font-medium text-fg">
              {preset.label}, {preset.year}.
            </span>{" "}
            {preset.note}
            {preset.reference && <span className="mt-1.5 block text-ember">{preset.reference}</span>}
          </Callout>
        )}
      </Section>
      <DetonationList />
      <DetonationEditor />
      <ScenarioIO />
    </>
  );
}

function DetonationList() {
  const dets = useStore((s) => s.dets);
  const activeId = useStore((s) => s.activeId);
  const set = useStore((s) => s.set);
  const remove = useStore((s) => s.removeDet);
  const dup = useStore((s) => s.duplicateDet);
  const mapMode = useStore((s) => s.mapMode);
  return (
    <Section
      title={`Detonazioni (${dets.length})`}
      kicker="Uno o più punti di scoppio"
      right={
        <Button variant={mapMode === "add" ? "solid" : "outline"} onClick={() => set({ mapMode: mapMode === "add" ? "move" : "add" })} title="Clicca sulla mappa per aggiungere un punto">
          <Plus className="size-3.5" /> Aggiungi
        </Button>
      }
    >
      {mapMode === "add" && <Callout tone="warn">Clicca sulla mappa nel punto del nuovo scoppio. Erediterà l'ordigno di quello selezionato.</Callout>}
      <ul className="space-y-1">
        {dets.map((d, i) => {
          const w = weaponById(d.weaponId);
          const on = d.id === activeId;
          return (
            <li key={d.id}>
              <div
                className={cx(
                  "flex items-center gap-2 rounded-lg border px-2 py-1.5",
                  on ? "border-ember/60 bg-ember-soft" : "border-line hover:border-line-strong",
                )}
              >
                <button onClick={() => set({ activeId: d.id })} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                  <span className={cx("num grid size-5 shrink-0 place-items-center rounded-full text-[10px]", on ? "bg-ember text-ink" : "bg-surface-3 text-muted")}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px]">{d.place || "Punto senza nome"}</span>
                    <span className="num block truncate text-[11px] text-faint">
                      {w?.name ?? "Ipotetico"} · {formatYield(d.yieldKt)} · {BURSTS.find((b) => b.id === d.burst)?.label}
                      {d.delayS > 0 ? ` · +${d.delayS} s` : ""}
                    </span>
                  </span>
                </button>
                <button title="Duplica" onClick={() => dup(d.id)} className="p-1 text-faint hover:text-fg">
                  <Copy className="size-3.5" />
                </button>
                {dets.length > 1 && (
                  <button title="Rimuovi" onClick={() => remove(d.id)} className="p-1 text-faint hover:text-blast">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {dets.length > 1 && (
        <p className="text-[11.5px] leading-snug text-faint">
          Con più detonazioni i rischi si combinano punto per punto (le probabilità di sopravvivenza si moltiplicano) e le dosi di fallout si sommano.
        </p>
      )}
    </Section>
  );
}

function DetonationEditor() {
  const det = useStore(activeDet);
  const patch = useStore((s) => s.patchDet);
  const chooseWeapon = useStore((s) => s.chooseWeapon);
  const set = useStore((s) => s.set);
  const units = useStore((s) => s.units);
  const weapon = weaponById(det.weaponId);
  const up = (p: Partial<Detonation>) => patch(det.id, p);
  const [q, setQ] = useState("");
  const [placeQ, setPlaceQ] = useState("");
  const hits = useMemo(() => searchPlaces(placeQ, 6), [placeQ]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return weapons
      .filter((w) => `${w.name} ${w.aka ?? ""} ${ORIGIN_LABEL[w.origin]} ${w.kind} ${w.delivery}`.toLowerCase().includes(s))
      .slice(0, 10);
  }, [q]);

  return (
    <Section title="Punto e ordigno" kicker={`Detonazione selezionata`} chapter="energia">
      <div className="relative">
        <label className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 focus-within:border-ember">
          <Crosshair className="size-3.5 text-faint" />
          <input
            value={placeQ}
            onChange={(e) => setPlaceQ(e.target.value)}
            placeholder={det.place || "Cerca una città (34 000 nel catalogo)"}
            className="min-h-8 w-full bg-transparent text-[12.5px] outline-none placeholder:text-faint"
          />
          {placeQ && (
            <button onClick={() => setPlaceQ("")}>
              <X className="size-3.5 text-faint" />
            </button>
          )}
        </label>
        {hits.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-md border border-line-strong bg-surface shadow-xl">
            {hits.map((h) => (
              <li key={`${h.label}${h.lat}`}>
                <button
                  className="w-full px-3 py-1.5 text-left text-[12.5px] hover:bg-surface-2"
                  onClick={() => {
                    up({ lat: h.lat, lon: h.lon, place: h.label });
                    setPlaceQ("");
                    set({ fitToken: useStore.getState().fitToken + 1 });
                  }}
                >
                  {h.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <p className="num text-[11px] text-faint">
        {det.lat.toFixed(4)}°, {det.lon.toFixed(4)}° · trascina il segnaposto o clicca sulla mappa per spostarlo
      </p>

      <div className="relative">
        <label className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 focus-within:border-ember">
          <Search className="size-3.5 text-faint" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ordigno dall'archivio: B61, Tsar, W88, Francia…"
            className="min-h-8 w-full bg-transparent text-[12.5px] outline-none placeholder:text-faint"
          />
        </label>
        {list.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-30 mt-1 max-h-72 overflow-y-auto rounded-md border border-line-strong bg-surface shadow-xl">
            {list.map((w) => (
              <li key={w.id}>
                <button
                  className="flex w-full items-baseline justify-between gap-3 px-3 py-1.5 text-left text-[12.5px] hover:bg-surface-2"
                  onClick={() => {
                    chooseWeapon(w.id);
                    setQ("");
                  }}
                >
                  <span>
                    {w.name} <span className="text-faint">· {ORIGIN_LABEL[w.origin]} · {w.year}</span>
                  </span>
                  <span className="num shrink-0 text-muted">{formatYield(w.yNom)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {weapon && (
        <div className="rounded-lg border border-line bg-surface-2/50 p-2.5 text-[12px]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-medium">{weapon.name}</span>
            <button className="text-[11px] text-ember hover:underline" onClick={() => set({ view: "archivio", archiveWeapon: weapon.id })}>
              scheda d'archivio →
            </button>
          </div>
          <p className="text-faint">
            {ORIGIN_LABEL[weapon.origin]} · {weapon.kind} · {weapon.year} · resa {formatYield(weapon.yMin)}–{formatYield(weapon.yMax)} ({weapon.confidence})
          </p>
        </div>
      )}

      <Slider label="Potenza" log min={0.001} max={100_000} value={det.yieldKt} onChange={(v) => up({ yieldKt: roundYield(v) })} display={formatYield(det.yieldKt)} />
      <div className="flex flex-wrap gap-1">
        {[0.02, 1, 15, 100, 300, 1000, 5000, 50000].map((y) => (
          <Chip key={y} active={Math.abs(det.yieldKt - y) < y * 0.01} onClick={() => up({ yieldKt: y })}>
            {formatYield(y)}
          </Chip>
        ))}
      </div>
      <Slider
        label="Frazione di fissione"
        min={0}
        max={100}
        value={det.fission * 100}
        onChange={(v) => up({ fission: Math.round(v) / 100 })}
        display={`${Math.round(det.fission * 100)}%`}
        hint="Pesa su fallout e radiazione pronta. Le armi termonucleari moderne sono in genere circa metà fissione."
      />

      <p className="kicker pt-1">Natura dello scoppio</p>
      <div className="grid grid-cols-2 gap-1">
        {BURSTS.map((b) => (
          <button
            key={b.id}
            title={b.hint}
            onClick={() => up({ burst: b.id, hobM: b.id === "high" && det.hobM < 5000 ? 30_000 : b.id === "air" && det.hobM > 20_000 ? 600 : det.hobM })}
            className={cx(
              "min-h-8 rounded-md border px-2 text-left text-[12px]",
              det.burst === b.id ? "border-ember bg-ember-soft text-ember" : "border-line text-muted hover:text-fg",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>
      <p className="text-[11.5px] leading-snug text-faint">{BURSTS.find((b) => b.id === det.burst)?.hint}</p>
      {det.burst === "air" && (
        <>
          <Slider label="Quota di scoppio" log min={10} max={20_000} value={det.hobM} onChange={(v) => up({ hobM: Math.round(v) })} display={formatDist(det.hobM, units)} />
          <div className="flex flex-wrap gap-1">
            {[
              ["Ottima 20 psi", 20],
              ["Ottima 10 psi", 10],
              ["Ottima 5 psi", 5],
              ["Ottima 2 psi", 2],
              ["Ottima 1 psi", 1],
            ].map(([l, p]) => (
              <Chip key={l} onClick={() => up({ hobM: Math.round(optimumHobM(det.yieldKt, p as number)) })}>
                {l}
              </Chip>
            ))}
          </div>
        </>
      )}
      {det.burst === "high" && (
        <Slider label="Quota" log min={5000} max={600_000} value={det.hobM} onChange={(v) => up({ hobM: Math.round(v / 100) * 100 })} display={formatDist(det.hobM, units)} hint="Starfish Prime: 400 km. Sopra i 30 km l'EMP E1 diventa l'effetto principale." />
      )}
      {det.burst === "subsurface" && (
        <Slider
          label="Profondità di sepoltura"
          log
          min={1}
          max={1500}
          value={det.burialM}
          onChange={(v) => up({ burialM: Math.round(v) })}
          display={`${Math.round(det.burialM)} m`}
          hint={`Profondità scalata ${Math.round(det.burialM / Math.cbrt(det.yieldKt))} m/kt^⅓. Il contenimento richiede in genere oltre ~120 m/kt^⅓ (Sedan: 41).`}
        />
      )}
      {det.burst === "underwater" && (
        <Slider label="Profondità dell'acqua" log min={5} max={2000} value={det.waterDepthM} onChange={(v) => up({ waterDepthM: Math.round(v) })} display={`${Math.round(det.waterDepthM)} m`} />
      )}
      <div className="flex items-center justify-between gap-3 text-[12.5px]">
        <span className="text-muted">Ritardo rispetto al primo scoppio</span>
        <NumberField className="w-28" value={det.delayS} min={0} step={1} suffix="s" onChange={(v) => up({ delayS: Math.max(0, v) })} />
      </div>
    </Section>
  );
}

function roundYield(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)) - 1);
  return Math.round(v / p) * p;
}

function ScenarioIO() {
  const saved = useStore((s) => s.saved);
  const save = useStore((s) => s.saveScenario);
  const load = useStore((s) => s.loadScenario);
  const del = useStore((s) => s.deleteSaved);
  const [name, setName] = useState("");
  return (
    <Section title="Scenari salvati" kicker="Nel browser, solo su questo dispositivo" defaultOpen={false}>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome dello scenario"
          className="min-h-8 w-full rounded-md border border-line bg-surface-2 px-2 text-[12.5px] outline-none focus:border-ember"
        />
        <Button variant="outline" disabled={!name.trim()} onClick={() => { save(name.trim()); setName(""); }}>
          Salva
        </Button>
      </div>
      {saved.length === 0 && <p className="text-[12px] text-faint">Nessuno scenario salvato.</p>}
      <ul className="divide-y divide-line">
        {saved.map((s) => (
          <li key={s.name} className="flex items-center gap-2 py-1.5">
            <button className="min-w-0 flex-1 text-left" onClick={() => load(s.scenario)}>
              <span className="block truncate text-[12.5px]">{s.name}</span>
              <span className="block text-[11px] text-faint">
                {s.scenario.dets.length} detonazioni · {new Date(s.savedAt).toLocaleString("it-IT")}
              </span>
            </button>
            <button className="p-1 text-faint hover:text-blast" onClick={() => del(s.name)}>
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* -------------------------------------------------------------- */

function EnvironmentTab() {
  const env = useStore((s) => s.env);
  const patch = useStore((s) => s.patchEnv);
  const det = useStore(activeDet);
  const weather = useStore((s) => s.weather[weatherKey(det.lat, det.lon)]);
  const w = weather && weather !== "error" ? weather : null;
  return (
    <>
      <Section title="Meteo nel punto" kicker="Open-Meteo, condizioni attuali" chapter="termico">
        {weather === "error" && <Callout tone="warn">Meteo non raggiungibile: si usano valori di riferimento.</Callout>}
        {!weather && <p className="text-[12px] text-faint">Lettura in corso…</p>}
        {w && (
          <dl className="num grid grid-cols-3 gap-2 text-[12px]">
            <Mini k="Temperatura" v={w.tempC != null ? `${w.tempC.toFixed(0)} °C` : "—"} />
            <Mini k="Umidità" v={w.rh != null ? `${Math.round(w.rh)}%` : "—"} />
            <Mini k="Nubi" v={w.cloud != null ? `${Math.round(w.cloud * 100)}%` : "—"} />
            <Mini k="Visibilità" v={w.visibilityM != null ? `${Math.round(w.visibilityM / 1000)} km` : "—"} />
            <Mini k="Pressione" v={w.pressureHpa != null ? `${Math.round(w.pressureHpa)} hPa` : "—"} />
            <Mini k="Quota suolo" v={w.elevationM != null ? `${Math.round(w.elevationM)} m` : "—"} />
            <Mini k="Vento" v={w.windMs != null ? `${w.windMs.toFixed(1)} m/s` : "—"} />
            <Mini k="Da" v={w.windFromDeg != null ? formatDeg(w.windFromDeg) : "—"} />
            <Mini k="Pioggia" v={w.precipMm != null ? `${w.precipMm} mm` : "—"} />
          </dl>
        )}
      </Section>
      <Section title="Vento per il fallout" kicker="Direzione e velocità del trasporto" chapter="fallout">
        <Segmented value={env.windMode} onChange={(v) => patch({ windMode: v })} options={[{ id: "meteo", label: "Meteo attuale" }, { id: "manual", label: "Manuale" }]} />
        {env.windMode === "manual" && (
          <>
            <Slider label="Velocità" min={0.5} max={40} step={0.5} value={env.windMs} onChange={(v) => patch({ windMs: v })} display={`${env.windMs.toFixed(1)} m/s · ${Math.round(env.windMs * 3.6)} km/h`} />
            <WindRose from={env.windFrom} onChange={(v) => patch({ windFrom: v })} />
          </>
        )}
        <p className="text-[11.5px] leading-snug text-faint">
          Il vento usato è uno solo per tutta la colonna. Nella realtà il vento cambia con la quota e la nube a fungo, alta 10–40 km, viene stirata in direzioni diverse.
        </p>
      </Section>
      <Section title="Atmosfera" kicker="Trasmissione del calore e onda d'urto" chapter="termico">
        <Segmented value={env.atmoMode} onChange={(v) => patch({ atmoMode: v })} options={[{ id: "meteo", label: "Dal meteo" }, { id: "manual", label: "Manuale" }]} />
        {env.atmoMode === "manual" && (
          <>
            <Slider label="Visibilità" log min={1} max={80} value={env.visibilityKm} onChange={(v) => patch({ visibilityKm: Math.round(v) })} display={`${Math.round(env.visibilityKm)} km`} hint="Foschia e smog assorbono il lampo termico: 10 km di visibilità accorciano molto i raggi delle ustioni." />
            <Slider label="Umidità relativa" min={0} max={100} value={env.rh} onChange={(v) => patch({ rh: Math.round(v) })} display={`${Math.round(env.rh)}%`} />
            <Slider label="Copertura nuvolosa" min={0} max={100} value={env.cloud * 100} onChange={(v) => patch({ cloud: v / 100 })} display={`${Math.round(env.cloud * 100)}%`} hint="Con nubi sopra lo scoppio una parte del calore viene riflessa verso il suolo; qui si considera solo l'attenuazione." />
            <Slider label="Pressione al suolo" min={600} max={1050} value={env.pressureHpa} onChange={(v) => patch({ pressureHpa: Math.round(v) })} display={`${Math.round(env.pressureHpa)} hPa`} hint="Città d'alta quota (La Paz, 650 hPa): l'onda si propaga un po' più lontano a pari sovrapressione relativa." />
            <Toggle on={env.rain} onChange={(v) => patch({ rain: v })} label="Pioggia in corso" hint="Rainout: il fallout cade prima e più concentrato." />
          </>
        )}
      </Section>
    </>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-md bg-surface-2/60 px-2 py-1">
      <dt className="font-sans text-[10.5px] text-faint">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function WindRose({ from, onChange }: { from: number; onChange: (v: number) => void }) {
  const size = 120;
  const c = size / 2;
  const a = ((from - 90) * Math.PI) / 180;
  const to = ((from + 180 - 90) * Math.PI) / 180;
  return (
    <div className="flex items-center gap-4">
      <svg
        width={size}
        height={size}
        className="shrink-0 cursor-crosshair touch-none"
        onPointerDown={(e) => {
          const handle = (ev: PointerEvent | React.PointerEvent) => {
            const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
            const x = ev.clientX - rect.left - c;
            const y = ev.clientY - rect.top - c;
            const deg = (Math.atan2(y, x) * 180) / Math.PI + 90;
            onChange(Math.round((deg + 360) % 360));
          };
          handle(e);
          const move = (ev: PointerEvent) => handle(ev);
          const upFn = () => {
            window.removeEventListener("pointermove", move);
            window.removeEventListener("pointerup", upFn);
          };
          window.addEventListener("pointermove", move);
          window.addEventListener("pointerup", upFn);
        }}
      >
        <circle cx={c} cy={c} r={c - 4} fill="var(--surface-2)" stroke="var(--line-strong)" />
        {Array.from({ length: 16 }, (_, i) => {
          const t = ((i * 22.5 - 90) * Math.PI) / 180;
          const r1 = i % 4 === 0 ? c - 14 : c - 9;
          return <line key={i} x1={c + Math.cos(t) * r1} y1={c + Math.sin(t) * r1} x2={c + Math.cos(t) * (c - 5)} y2={c + Math.sin(t) * (c - 5)} stroke="var(--faint)" />;
        })}
        {["N", "E", "S", "O"].map((l, i) => {
          const t = ((i * 90 - 90) * Math.PI) / 180;
          return (
            <text key={l} x={c + Math.cos(t) * (c - 22)} y={c + Math.sin(t) * (c - 22) + 4} textAnchor="middle" fontSize="10" fill="var(--muted)">
              {l}
            </text>
          );
        })}
        <line x1={c + Math.cos(a) * (c - 10)} y1={c + Math.sin(a) * (c - 10)} x2={c + Math.cos(to) * 20} y2={c + Math.sin(to) * 20} stroke="var(--ember)" strokeWidth="2.5" markerEnd="url(#arr)" />
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--ember)" />
          </marker>
        </defs>
      </svg>
      <div className="text-[12px]">
        <p className="text-muted">Proviene da</p>
        <p className="num text-[15px]">{formatDeg(from)}</p>
        <p className="mt-1 text-faint">Il pennacchio va verso {formatDeg((from + 180) % 360)}. Trascina sulla rosa.</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */

function PopulationTab() {
  const pop = useStore((s) => s.pop);
  const patch = useStore((s) => s.patchPop);
  const total = pop.mix.outdoor + pop.mix.ordinary + pop.mix.substantial || 1;
  const setMix = (k: keyof typeof pop.mix, v: number) => {
    // keep the sum at 1 by redistributing the remainder proportionally among the other classes
    const others = (Object.keys(pop.mix) as (keyof typeof pop.mix)[]).filter((x) => x !== k);
    const rest = 1 - v;
    const sumOthers = others.reduce((a, x) => a + pop.mix[x], 0) || 1;
    const mix = { ...pop.mix, [k]: v };
    for (const o of others) mix[o] = (pop.mix[o] / sumOthers) * rest;
    patch({ mix });
  };
  const presets = [
    { label: "Notte, in casa", mix: { outdoor: 0.02, ordinary: 0.96, substantial: 0.02 } },
    { label: "Giorno, senza allarme", mix: { outdoor: 0.25, ordinary: 0.72, substantial: 0.03 } },
    { label: "Allarme di 10 minuti", mix: { outdoor: 0.05, ordinary: 0.75, substantial: 0.2 } },
    { label: "Protezione civile piena", mix: { outdoor: 0.01, ordinary: 0.3, substantial: 0.69 } },
  ];
  return (
    <>
      <Section title="Dove sono le persone" kicker="Ripartizione fra condizioni di riparo" chapter="sanita">
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <Chip key={p.label} onClick={() => patch({ mix: p.mix })}>
              {p.label}
            </Chip>
          ))}
        </div>
        <MixBar mix={pop.mix} />
        <Slider label="All'aperto" min={0} max={100} value={(pop.mix.outdoor / total) * 100} onChange={(v) => setMix("outdoor", v / 100)} display={`${Math.round((pop.mix.outdoor / total) * 100)}%`} hint="Esposti al lampo termico e alla radiazione: le ustioni dominano nelle zone medie." />
        <Slider label="In edifici ordinari" min={0} max={100} value={(pop.mix.ordinary / total) * 100} onChange={(v) => setMix("ordinary", v / 100)} display={`${Math.round((pop.mix.ordinary / total) * 100)}%`} hint="Protetti dal calore ma esposti a crolli e vetri. Fattore di protezione dal fallout ≈ 3." />
        <Slider label="In rifugi sostanziali" min={0} max={100} value={(pop.mix.substantial / total) * 100} onChange={(v) => setMix("substantial", v / 100)} display={`${Math.round((pop.mix.substantial / total) * 100)}%`} hint="Cantine e rifugi in cemento armato: fattore di protezione dal fallout ≈ 40." />
      </Section>
      <Section title="Densità" kicker="Come la popolazione è distribuita" chapter="modello">
        <Segmented
          value={pop.model}
          onChange={(v) => patch({ model: v })}
          options={[
            { id: "clark", label: "Profilo urbano" },
            { id: "disc", label: "Dischi uniformi" },
          ]}
        />
        <p className="text-[11.5px] leading-snug text-faint">
          {pop.model === "clark"
            ? "Ogni città ha un centro denso che si dirada verso la periferia (modello di Clark, ρ = ρ₀·e^(−r/b)): più realistico per gli scoppi sul centro."
            : "Ogni città è un disco a densità costante, come nella versione originale: più semplice da leggere."}
        </p>
        <Slider label="Scala della popolazione" log min={0.05} max={3} value={pop.scale} onChange={(v) => patch({ scale: Math.round(v * 100) / 100 })} display={`× ${pop.scale.toFixed(2)}`} hint="Per avvicinarsi a un anno storico: Hiroshima 1945 aveva circa un terzo degli abitanti di oggi." />
        <Slider label="Densità rurale di fondo" min={0} max={500} step={5} value={pop.rural} onChange={(v) => patch({ rural: v })} display={`${Math.round(pop.rural)} ab/km²`} hint="Applicata ovunque fuori dalle città, anche sul mare: azzerala per scoppi su oceani o deserti." />
      </Section>
      <Section title="Ipotesi sanitarie" kicker="Che cosa succede dopo" chapter="sanita">
        <Segmented
          value={pop.care}
          onChange={(v) => patch({ care: v })}
          options={[
            { id: "collassata", label: "Sanità sopraffatta" },
            { id: "normale", label: "Cure disponibili" },
          ]}
        />
        <p className="text-[11.5px] leading-snug text-faint">
          Dose letale mediana (LD50) {pop.care === "normale" ? "≈ 4,5 Gy con terapia di supporto" : "≈ 3 Gy senza cure: dopo un attacco su una città gli ospedali sono distrutti o sommersi"}.
        </p>
        <Toggle on={pop.firestorm} onChange={(v) => patch({ firestorm: v })} label="Tempesta di fuoco urbana" hint="Incendi che si fondono in un'unica colonna (Hiroshima, Amburgo 1943): morti per asfissia e calore anche nei rifugi." />
      </Section>
    </>
  );
}

function MixBar({ mix }: { mix: { outdoor: number; ordinary: number; substantial: number } }) {
  const t = mix.outdoor + mix.ordinary + mix.substantial || 1;
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-3">
      <span style={{ width: `${(mix.outdoor / t) * 100}%`, background: "var(--heat)" }} />
      <span style={{ width: `${(mix.ordinary / t) * 100}%`, background: "var(--muted)" }} />
      <span style={{ width: `${(mix.substantial / t) * 100}%`, background: "var(--rad)" }} />
    </div>
  );
}

/* -------------------------------------------------------------- */

function ThresholdTab() {
  const thr = useStore((s) => s.thr);
  const patch = useStore((s) => s.patchThr);
  const layers = useStore((s) => s.layers);
  const toggle = useStore((s) => s.toggleLayer);
  const styleId = useStore((s) => s.styleId);
  const set = useStore((s) => s.set);
  const units = useStore((s) => s.units);
  const [psiNew, setPsiNew] = useState(3);
  const allPsi = [200, 50, 20, 10, 5, 3, 2, 1, 0.5];
  const windows: [string, [number, number]][] = [
    ["Prima ora", [0, 1]],
    ["Primo giorno", [0, 24]],
    ["Prima settimana", [0, 168]],
    ["Primo mese", [0, 720]],
    ["Dal giorno 2 al 14", [24, 336]],
  ];
  return (
    <>
      <Section title="Livelli sulla mappa" kicker="Che cosa disegnare">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ["fireball", "Palla di fuoco", "#fff1d6"],
              ["blast", "Onda d'urto", "var(--blast)"],
              ["thermal", "Calore", "var(--heat)"],
              ["radiation", "Radiazione pronta", "var(--rad)"],
              ["fallout", "Fallout", "var(--fall)"],
              ["crater", "Cratere / surge", "#8a8175"],
              ["emp", "Orizzonte EMP", "var(--emp)"],
              ["heat", "Mappa delle vittime", "#c0283a"],
              ["labels", "Etichette sugli anelli", "var(--muted)"],
            ] as const
          ).map(([k, l, c]) => (
            <button
              key={k}
              onClick={() => toggle(k)}
              className={cx("flex min-h-8 items-center gap-2 rounded-md border px-2 text-left text-[12px]", layers[k] ? "border-line-strong text-fg" : "border-line text-faint")}
            >
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: layers[k] ? c : "transparent", border: `1.5px solid ${c}` }} />
              {l}
            </button>
          ))}
        </div>
        <label className="block text-[12.5px]">
          <span className="text-muted">Base cartografica</span>
          <select value={styleId} onChange={(e) => set({ styleId: e.target.value as typeof styleId })} className="mt-1 min-h-8 w-full rounded-md border border-line bg-surface-2 px-2">
            {MAP_STYLES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </Section>
      <Section title="Sovrapressioni" kicker="Anelli dell'onda d'urto" chapter="onda-urto">
        <div className="flex flex-wrap gap-1">
          {Array.from(new Set([...allPsi, ...thr.psi]))
            .sort((a, b) => b - a)
            .map((p) => (
              <Chip key={p} active={thr.psi.includes(p)} onClick={() => patch({ psi: thr.psi.includes(p) ? thr.psi.filter((x) => x !== p) : [...thr.psi, p] })}>
                {units.pressure === "kPa" ? `${Math.round(p * 6.895)} kPa` : `${p} psi`}
              </Chip>
            ))}
        </div>
        <div className="flex items-center gap-2 text-[12.5px]">
          <span className="text-muted">Soglia personalizzata</span>
          <NumberField className="w-24" value={psiNew} min={0.1} max={1000} step={0.1} suffix="psi" onChange={setPsiNew} />
          <Button variant="outline" onClick={() => !thr.psi.includes(psiNew) && psiNew > 0 && patch({ psi: [...thr.psi, psiNew] })}>
            Aggiungi
          </Button>
        </div>
      </Section>
      <Section title="Calore" kicker="Soglie termiche" chapter="termico">
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              ["burn3", "Ustioni 3° grado"],
              ["ignite", "Innesco incendi"],
              ["burn2", "Ustioni 2° grado"],
              ["burn1", "Ustioni 1° grado"],
            ] as const
          ).map(([k, l]) => (
            <Chip key={k} active={thr.thermal[k]} onClick={() => patch({ thermal: { ...thr.thermal, [k]: !thr.thermal[k] } })}>
              {l}
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="Radiazione pronta" kicker="Dosi nei primi secondi" chapter="radiazione-iniziale">
        <div className="flex flex-wrap gap-1">
          {[20, 8, 4.5, 2, 1, 0.5, 0.1].map((g) => (
            <Chip key={g} active={thr.promptGy.includes(g)} onClick={() => patch({ promptGy: thr.promptGy.includes(g) ? thr.promptGy.filter((x) => x !== g) : [...thr.promptGy, g] })}>
              {units.dose === "rad" ? `${g * 100} rad` : `${g} Gy`}
            </Chip>
          ))}
        </div>
      </Section>
      <Section title="Fallout" kicker="Che cosa misurano le curve" chapter="fallout">
        <Segmented
          value={thr.falloutMode}
          onChange={(v) => patch({ falloutMode: v })}
          options={[
            { id: "dose", label: "Dose accumulata" },
            { id: "rate", label: "Rateo a H+1" },
          ]}
        />
        {thr.falloutMode === "dose" ? (
          <>
            <p className="text-[11.5px] leading-snug text-faint">Dose totale all'aperto nella finestra scelta, partendo dall'arrivo della nube. Decadimento t^−1,2 (Way–Wigner).</p>
            <div className="flex flex-wrap gap-1">
              {windows.map(([l, w]) => (
                <Chip key={l} active={thr.windowH[0] === w[0] && thr.windowH[1] === w[1]} onClick={() => patch({ windowH: w })}>
                  {l}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {[3000, 1000, 400, 100, 25, 5, 1].map((d) => (
                <Chip key={d} active={thr.falloutDose.includes(d)} onClick={() => patch({ falloutDose: thr.falloutDose.includes(d) ? thr.falloutDose.filter((x) => x !== d) : [...thr.falloutDose, d] })}>
                  {d} rad
                </Chip>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="text-[11.5px] leading-snug text-faint">Rateo di riferimento a un'ora dallo scoppio (H+1), il modo classico di disegnare le curve nei manuali di protezione civile.</p>
            <div className="flex flex-wrap gap-1">
              {[3000, 1000, 300, 100, 30, 10, 1].map((d) => (
                <Chip key={d} active={thr.falloutRate.includes(d)} onClick={() => patch({ falloutRate: thr.falloutRate.includes(d) ? thr.falloutRate.filter((x) => x !== d) : [...thr.falloutRate, d] })}>
                  {d} rad/h
                </Chip>
              ))}
            </div>
          </>
        )}
        <p className="text-[11.5px] text-faint">La finestra di dose vale anche per il conteggio delle vittime da fallout.</p>
      </Section>
      <Section title="Unità di misura" kicker="Visualizzazione">
        <Segmented value={units.distance} onChange={(v) => set({ units: { ...units, distance: v } })} options={[{ id: "km", label: "Metri, km" }, { id: "mi", label: "Piedi, miglia" }]} />
        <Segmented value={units.pressure} onChange={(v) => set({ units: { ...units, pressure: v } })} options={[{ id: "psi", label: "psi" }, { id: "kPa", label: "kPa" }]} />
        <Segmented value={units.dose} onChange={(v) => set({ units: { ...units, dose: v } })} options={[{ id: "Gy", label: "Gray (Gy)" }, { id: "rad", label: "rad" }]} />
      </Section>
    </>
  );
}
