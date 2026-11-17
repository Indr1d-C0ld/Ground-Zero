import { useMemo, useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";
import { PRESETS } from "@/data/presets";
import { ORIGIN_LABEL, weaponById } from "@/data/weapons";
import { useSim } from "@/hooks/useSimulation";
import { useStore } from "@/state/store";
import { immediateRates, falloutRates } from "@/lib/model/harm";
import { probePoint, ringRadius, type Effects } from "@/lib/model/effects";
import {
  dynamicPressurePsi,
  fireballRadiusM,
  optimumHobM,
  overpressurePsi,
  peakWindMs,
  promptDoseGy,
  radiusForPsi,
  solveRadius,
  thermalTmaxS,
  burnThresholds,
  fluenceCal,
} from "@/lib/physics/core";
import { plumeAxisProfile, windowDose } from "@/lib/physics/fallout";
import {
  formatArea,
  formatDeg,
  formatDist,
  formatDose,
  formatFluence,
  formatHours,
  formatInt,
  formatPeople,
  formatPressure,
  formatRad,
  formatSpeed,
  formatTime,
  formatYield,
} from "@/lib/format";
import { BarRows, Chart } from "@/components/charts";
import { Callout, ChapterLink, Section, Segmented, Stat, cx, Button } from "@/components/ui";
import { CloudDiagram } from "@/components/sim/CloudDiagram";

type Tab = "sintesi" | "sonda" | "profili" | "nube" | "tempo" | "citta" | "note";

export function Results() {
  const [tab, setTab] = useState<Tab>("sintesi");
  const probe = useStore((s) => s.probe);
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 overflow-x-auto border-b border-line px-2 pt-2">
        <div className="flex gap-0.5">
          {(
            [
              ["sintesi", "Sintesi"],
              ["sonda", probe ? "Sonda •" : "Sonda"],
              ["profili", "Profili"],
              ["nube", "Nube"],
              ["tempo", "Tempi"],
              ["citta", "Città"],
              ["note", "Limiti"],
            ] as const
          ).map(([id, l]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cx("shrink-0 border-b-2 px-2.5 pb-2 text-[12.5px]", tab === id ? "border-ember text-fg" : "border-transparent text-muted hover:text-fg")}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "sintesi" && <Summary />}
        {tab === "sonda" && <Probe />}
        {tab === "profili" && <Profiles />}
        {tab === "nube" && <CloudTab />}
        {tab === "tempo" && <Phases />}
        {tab === "citta" && <Cities />}
        {tab === "note" && <Notes />}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Header({ e }: { e: Effects }) {
  const w = weaponById(e.det.weaponId);
  const units = useStore((s) => s.units);
  const burst: Record<string, string> = {
    "air-opt": "in aria, quota ottimale",
    air: "in aria",
    surface: "al suolo",
    subsurface: `sotterraneo a ${Math.round(e.det.burialM)} m`,
    underwater: `subacqueo a ${Math.round(e.det.waterDepthM)} m`,
    high: "ad alta quota",
  };
  return (
    <div className="px-4 pt-4 pb-3">
      <p className="kicker">{e.det.place || "Punto sulla mappa"}</p>
      <h2 className="font-serif text-[26px] leading-tight">{formatYield(e.yieldKt)}</h2>
      <p className="text-[12.5px] text-muted">
        {w ? `${w.name} (${ORIGIN_LABEL[w.origin]})` : "Ordigno ipotetico"} · scoppio {burst[e.det.burst]}
        {e.hobM > 0 ? ` · quota ${formatDist(e.hobM, units)}` : ""}
      </p>
    </div>
  );
}

function Summary() {
  const { active: e, harm, computing, effects } = useSim();
  const units = useStore((s) => s.units);
  const presetId = useStore((s) => s.presetId);
  const preset = PRESETS.find((p) => p.id === presetId);
  const totalKt = effects.reduce((a, x) => a + x.yieldKt, 0);
  const visibleRings = e.rings.filter((r) => r.radiusM > 0);
  const energyJ = totalKt * 4.184e12;
  const thermalShare = e.thermalFraction;
  const blastShare = e.det.burst === "high" && e.hobM > 30_000 ? 0.05 : 0.5;
  const nuclearShare = 0.15;
  const otherShare = Math.max(0, 1 - thermalShare - blastShare - nuclearShare);
  return (
    <div>
      <Header e={e} />
      {preset?.reference && (
        <div className="px-4 pb-3">
          <Callout tone="warn">
            <span className="font-medium">Confronto storico.</span> {preset.reference}
          </Callout>
        </div>
      )}
      <Section title="Persone" kicker={effects.length > 1 ? `Tutte le ${effects.length} detonazioni` : "Stima per ordine di grandezza"} chapter="sanita" right={computing ? <Loader2 className="size-3.5 animate-spin text-faint" /> : null}>
        {harm ? (
          <>
            <div>
              <p className="num text-[34px] leading-none text-ember">{formatPeople(harm.deaths + harm.falloutDeaths)}</p>
              <p className="mt-1 text-[12px] text-muted">
                morti stimati (immediati e da fallout acuto). Fascia plausibile {formatPeople(harm.band[0])} – {formatPeople(harm.band[1])}: è un ordine di grandezza, non un conteggio.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Stat k="Morti nel primo minuto" v={formatPeople(harm.deaths)} sub="onda, calore, radiazione pronta" />
              <Stat k="Feriti" v={formatPeople(harm.injuries)} sub="traumi, ustioni, sindrome acuta" />
              <Stat k="Morti da fallout" v={formatPeople(harm.falloutDeaths)} tone="fall" sub="nella finestra di dose scelta" />
              <Stat k="Malati da fallout" v={formatPeople(harm.falloutSick)} tone="fall" sub="dose sopra ~1 Gy" />
              <Stat k="Senza casa" v={formatPeople(harm.displaced)} sub="sopravvissuti oltre 2 psi" />
              <Stat k="Da evacuare" v={formatPeople(harm.evacuate)} sub="dose oltre 100 rad all'aperto" />
              <Stat k="Esposti" v={formatPeople(harm.exposed)} sub="dentro l'impronta immediata" />
              <Stat k="Calcolo" v={`${Math.round(harm.ms)} ms`} sub="griglia di popolazione" />
            </dl>
            {harm.bands.some((b) => b.people > 0) && (
              <div>
                <p className="mb-2 text-[11.5px] text-faint">Persone per fascia di sovrapressione (barra) e morti (numero)</p>
                <BarRows rows={harm.bands.filter((b) => b.people > 0).map((b) => ({ label: b.label, value: b.people }))} fmt={(v) => formatPeople(v)} color="var(--blast)" />
                <ul className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-faint">
                  {harm.bands
                    .filter((b) => b.people > 0)
                    .map((b) => (
                      <li key={b.label} className="num">
                        {b.label}: <span className="text-fg">{b.people > 0 ? Math.round((b.deaths / b.people) * 100) : 0}%</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {harm.doseBands.some((b) => b.people > 0) && (
              <div>
                <p className="mb-2 text-[11.5px] text-faint">Sopravvissuti per dose da fallout all'aperto</p>
                <BarRows rows={harm.doseBands.map((b) => ({ label: b.label, value: b.people }))} fmt={(v) => formatPeople(v)} color="var(--fall)" />
              </div>
            )}
            <p className="text-[11.5px] leading-relaxed text-faint">
              Dopo un attacco su una città gli ospedali sono distrutti o sommersi: pochi grandi ustionati trovano un letto specializzato. Il conteggio non simula il collasso dei servizi, l'acqua, l'energia e le malattie dei mesi successivi.
            </p>
          </>
        ) : (
          <p className="text-[12px] text-faint">Calcolo in corso…</p>
        )}
      </Section>

      <Section title="Zone di effetto" kicker="Raggi dal punto zero" chapter="onda-urto">
        <ul className="divide-y divide-line">
          {visibleRings.map((r) => (
            <li key={r.id} className="grid grid-cols-[4.8rem_minmax(0,1fr)] gap-3 py-2">
              <span>
                <span className="num block text-[13px]">{formatDist(r.radiusM, units)}</span>
                <span className="num block text-[10.5px] text-faint">{formatArea(Math.PI * r.radiusM ** 2, units)}</span>
              </span>
              <span className="text-[12px]">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
                  <span className="font-medium">{r.label}</span>
                  {r.group === "blast" && <span className="num text-[10.5px] text-faint">· {r.short} · arriva in {formatTime(e.arrivalAt(r.radiusM))}</span>}
                </span>
                <span className="text-muted">{r.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Energia" kicker="Dove va l'energia rilasciata" chapter="energia" defaultOpen={false}>
        <p className="text-[12.5px]">
          <span className="num text-fg">{energyJ.toExponential(2).replace("e+", " × 10^")} J</span>
          <span className="text-muted"> · pari a {formatInt(totalKt / 15)} volte Hiroshima · {formatInt(totalKt * 1000)} tonnellate di TNT</span>
        </p>
        <div className="flex h-3 overflow-hidden rounded-full">
          <span style={{ width: `${blastShare * 100}%`, background: "var(--blast)" }} title="Onda d'urto" />
          <span style={{ width: `${thermalShare * 100}%`, background: "var(--heat)" }} title="Radiazione termica" />
          <span style={{ width: `${nuclearShare * 100}%`, background: "var(--rad)" }} title="Radiazione nucleare" />
          <span style={{ width: `${otherShare * 100}%`, background: "var(--surface-3)" }} title="Altro" />
        </div>
        <ul className="grid grid-cols-2 gap-1 text-[11.5px] text-muted">
          <li>
            <span className="text-blast">■</span> onda d'urto ~{Math.round(blastShare * 100)}%
          </li>
          <li>
            <span className="text-heat">■</span> lampo termico ~{Math.round(thermalShare * 100)}%
          </li>
          <li>
            <span className="text-rad">■</span> radiazione iniziale e residua ~{Math.round(nuclearShare * 100)}%
          </li>
          <li>
            <span className="text-faint">■</span> terreno, acqua, altro ~{Math.round(otherShare * 100)}%
          </li>
        </ul>
        <p className="text-[11.5px] text-faint">Ripartizione tipica di Glasstone per uno scoppio in aria a bassa quota, corretta per la geometria scelta.</p>
      </Section>

      <Section title="Fenomeni" kicker="Palla di fuoco, cratere, nube" chapter="palla-di-fuoco" defaultOpen>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Stat k="Palla di fuoco (raggio max)" v={formatDist(e.fireballM, units)} sub={e.touchesGround ? "tocca il suolo" : "non tocca il suolo"} />
          <Stat k="Picco del lampo termico" v={formatTime(e.tmaxS)} sub={`impulso utile ~${formatTime(e.tmaxS * 10)}`} />
          <Stat k="Cratere" v={e.craterRadiusM > 0 ? `⌀ ${formatDist(e.craterRadiusM * 2, units)}` : "—"} sub={e.craterRadiusM > 0 ? `profondità ~${formatDist(e.craterDepthM, units)}` : e.contained ? "scoppio contenuto" : "nessuno"} />
          <Stat k="Nube stabilizzata" v={e.det.burst === "high" && e.hobM > 30_000 ? "—" : formatDist(e.cloud.topM, units)} sub={`dopo ~${Math.round(e.cloud.riseS / 60)} min, ⌀ ${formatDist(e.cloud.radiusM * 2, units)}`} />
          <Stat k="Magnitudo sismica" v={e.mb != null ? `mb ${e.mb.toFixed(1)}` : "—"} sub={e.mb != null ? "onde di volume" : "solo per scoppi a contatto o sepolti"} />
          <Stat k="Fallout locale" v={e.plume.active ? `fino a ~${formatDist(e.falloutReachKm * 1000, units)}` : "assente"} tone={e.plume.active ? "fall" : undefined} sub={e.plume.active ? `verso ${formatDeg(e.atmo.downwindDeg)}, vento ${e.atmo.windMs.toFixed(1)} m/s` : "palla di fuoco staccata dal suolo"} />
          {e.empM > 0 && <Stat k="Orizzonte EMP" v={formatDist(e.empM, units)} sub="vista diretta dal punto di scoppio" />}
          {harm && <Stat k="Area urbana innescabile" v={`${harm.urbanBurnKm2.toFixed(1)} km²`} sub={harm.sootTg > 0 ? `fuliggine ~${harm.sootTg.toFixed(3)} Tg` : "fuliggine trascurabile"} />}
        </dl>
        {harm && harm.sootTg > 0 && (
          <p className="text-[11.5px] leading-relaxed text-faint">
            Per confronto, gli scenari di guerra nucleare regionale (100 armi da 15 kt su città) iniettano 5 Tg di fuliggine in stratosfera, con un raffreddamento globale di oltre 1 °C per anni (Robock, Toon 2007; Xia et al. 2022).
          </p>
        )}
      </Section>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Probe() {
  const probe = useStore((s) => s.probe);
  const set = useStore((s) => s.set);
  const mapMode = useStore((s) => s.mapMode);
  const units = useStore((s) => s.units);
  const pop = useStore((s) => s.pop);
  const thr = useStore((s) => s.thr);
  const { effects } = useSim();
  if (!probe) {
    return (
      <div className="space-y-3 p-4">
        <h3 className="font-serif text-xl">Sonda puntuale</h3>
        <p className="text-[12.5px] text-muted">
          Scegli un punto qualunque sulla mappa per leggere che cosa vi accade: sovrapressione e vento, istante d'arrivo dell'onda, energia termica, dose pronta, arrivo e dose del fallout, probabilità di sopravvivenza per chi è all'aperto, in casa o in un rifugio.
        </p>
        <Button variant={mapMode === "probe" ? "solid" : "outline"} onClick={() => set({ mapMode: mapMode === "probe" ? "move" : "probe" })}>
          <Crosshair className="size-3.5" /> {mapMode === "probe" ? "Clicca sulla mappa…" : "Attiva la sonda"}
        </Button>
      </div>
    );
  }
  const rows = effects.map((e) => ({ e, p: probePoint(e, probe.lat, probe.lon, thr.windowH[0], thr.windowH[1]) }));
  const near = rows.reduce((a, b) => (b.p.groundM < a.p.groundM ? b : a));
  const classes = [
    ["outdoor", "All'aperto"],
    ["ordinary", "In casa"],
    ["substantial", "In rifugio"],
  ] as const;
  const totalFallDose = rows.reduce((a, r) => a + r.p.fallout.dose, 0);
  return (
    <div>
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div>
          <p className="kicker">Sonda</p>
          <h3 className="font-serif text-xl">A {formatDist(near.p.groundM, units)} dal punto zero</h3>
          <p className="num text-[11px] text-faint">
            {probe.lat.toFixed(4)}°, {probe.lon.toFixed(4)}° · trascina il rombo per spostarla
          </p>
        </div>
        <Button onClick={() => set({ probe: null, mapMode: "move" })}>Chiudi</Button>
      </div>
      <Section title="Sopravvivenza per condizione" kicker="Tutti gli effetti, tutte le detonazioni" chapter="sanita">
        <div className="grid grid-cols-3 gap-2">
          {classes.map(([k, l]) => {
            const only = { ...pop, mix: { outdoor: 0, ordinary: 0, substantial: 0, [k]: 1 } };
            const imm = immediateRates(effects, probe.lat, probe.lon, true, only);
            const fr = falloutRates(totalFallDose, only);
            const death = 1 - (1 - imm.death) * (1 - fr.death);
            return (
              <div key={k} className="rounded-lg border border-line bg-surface-2/50 p-2 text-center">
                <p className="text-[11px] text-muted">{l}</p>
                <p className={cx("num text-[20px]", death > 0.5 ? "text-blast" : death > 0.1 ? "text-ember" : "text-fg")}>{Math.round((1 - death) * 100)}%</p>
                <p className="text-[10.5px] text-faint">sopravvive</p>
              </div>
            );
          })}
        </div>
      </Section>
      {rows.map(({ e, p }, i) => (
        <Section key={e.det.id} title={effects.length > 1 ? `Detonazione ${i + 1} · ${e.det.place || formatYield(e.yieldKt)}` : "Che cosa arriva, e quando"} kicker={`${formatDist(p.groundM, units)} al suolo · ${formatDist(p.slantM, units)} in linea d'aria`}>
          {p.insideFireball ? (
            <Callout tone="warn">Il punto è dentro la palla di fuoco: tutto è vaporizzato.</Callout>
          ) : (
            <ol className="relative space-y-3 border-l border-line pl-4">
              <TL t={e.det.delayS} title="Lampo">
                Luce più intensa del Sole visibile fino a centinaia di km; accecamento temporaneo guardando verso lo scoppio.
              </TL>
              <TL t={e.det.delayS + p.thermalArrivalS} title={`Calore: ${formatFluence(p.fluence)}`}>
                {p.fluence >= e.burn.burn3
                  ? "Ustioni di terzo grado sulla pelle esposta; vestiti e materiali leggeri si incendiano."
                  : p.fluence >= e.burn.burn2
                    ? "Ustioni di secondo grado sulla pelle esposta."
                    : p.fluence >= e.burn.burn1
                      ? "Ustioni di primo grado, come una scottatura solare grave."
                      : "Calore percepibile, senza ustioni."}
              </TL>
              {p.promptGy > 0.01 && (
                <TL t={e.det.delayS} title={`Radiazione pronta: ${formatDose(p.promptGy, units)}`}>
                  Gamma e neutroni entro il primo minuto, all'aperto.{" "}
                  {p.promptGy >= 8 ? "Dose letale." : p.promptGy >= 3 ? "Dose letale per metà degli esposti senza cure." : p.promptGy >= 1 ? "Sindrome acuta da radiazione." : "Nessun sintomo acuto."}
                </TL>
              )}
              {p.psi > 0.2 && (
                <TL t={e.det.delayS + p.arrivalS} title={`Onda d'urto: ${formatPressure(p.psi, units)}`}>
                  Vento di picco {formatSpeed(p.windMs)}, pressione dinamica {formatPressure(p.dynPsi, units)}, fase positiva ~{formatTime(p.positiveS)}.{" "}
                  {p.psi >= 20 ? "Cemento armato distrutto." : p.psi >= 10 ? "Crolla quasi ogni edificio." : p.psi >= 5 ? "Le case crollano." : p.psi >= 2 ? "Danni strutturali gravi." : p.psi >= 1 ? "Vetri in frantumi." : "Danni lievi."}
                  {p.arrivalS > 1 ? ` C'è il tempo di ${Math.floor(p.arrivalS)} s fra lampo e onda: allontanarsi dalle finestre salva la vista e la vita.` : ""}
                </TL>
              )}
              {e.plume.active && p.fallout.dose > 0.5 && (
                <TL t={e.det.delayS + p.fallout.arrivalH * 3600} title={`Fallout: ${formatRad(p.fallout.rateH1, units, true)} a H+1`}>
                  Dose all'aperto fra {thr.windowH[0]} e {thr.windowH[1]} h: <span className="text-fall">{formatRad(p.fallout.dose, units)}</span>. In casa ÷3, in cantina o rifugio ÷10–40.
                </TL>
              )}
            </ol>
          )}
          {e.plume.active && p.fallout.rateH1 > 0.1 && <FalloutWindows rateH1={p.fallout.rateH1} ta={p.fallout.arrivalH} />}
        </Section>
      ))}
    </div>
  );
}

function TL({ t, title, children }: { t: number; title: string; children: React.ReactNode }) {
  return (
    <li className="relative">
      <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-ember" />
      <p className="text-[12.5px]">
        <span className="num mr-2 text-[11px] text-faint">t = {formatTime(Math.max(t, 1e-6))}</span>
        <span className="font-medium">{title}</span>
      </p>
      <p className="text-[12px] text-muted">{children}</p>
    </li>
  );
}

function FalloutWindows({ rateH1, ta }: { rateH1: number; ta: number }) {
  const units = useStore((s) => s.units);
  const windows: [string, number, number][] = [
    ["Prime 24 ore", 0, 24],
    ["Prima settimana", 0, 168],
    ["Primo mese", 0, 720],
    ["Primo anno", 0, 8760],
    ["Restando al chiuso 2 giorni, poi fuori fino a 2 settimane", 48, 336],
  ];
  return (
    <div className="mt-2">
      <p className="mb-1 text-[11.5px] text-faint">Dose all'aperto, arrivo dopo {formatHours(ta)}</p>
      <table className="num w-full text-[11.5px]">
        <thead className="text-left text-faint">
          <tr>
            <th className="py-1 font-normal">Finestra</th>
            <th className="font-normal">Aperto</th>
            <th className="font-normal">Casa ÷3</th>
            <th className="font-normal">Rifugio ÷40</th>
          </tr>
        </thead>
        <tbody>
          {windows.map(([l, a, b]) => {
            const d = windowDose(rateH1, ta, a, b);
            return (
              <tr key={l} className="border-t border-line">
                <td className="py-1 pr-2 font-sans text-muted">{l}</td>
                <td>{formatRad(d, units)}</td>
                <td>{formatRad(d / 3, units)}</td>
                <td>{formatRad(d / 40, units)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Profiles() {
  const { active: e } = useSim();
  const units = useStore((s) => s.units);
  const thr = useStore((s) => s.thr);
  const [kind, setKind] = useState<"blast" | "thermal" | "radiation" | "fallout" | "scaling" | "hob">("blast");
  const maxR = Math.max(e.outerM * 1.4, 2000);
  const xs = useMemo(() => Array.from({ length: 140 }, (_, i) => 30 * Math.pow(maxR / 30, i / 139)), [maxR]);
  const dFmt = (m: number) => formatDist(m, units).replace(/,\d+ /, " ");
  return (
    <div className="space-y-3 p-4">
      <Header e={e} />
      <Segmented
        size="sm"
        cols={3}
        value={kind}
        onChange={setKind}
        options={[
          { id: "blast", label: "Onda d'urto" },
          { id: "thermal", label: "Calore" },
          { id: "radiation", label: "Radiazione" },
          { id: "fallout", label: "Fallout" },
          { id: "scaling", label: "Scala con Y" },
          { id: "hob", label: "Quota" },
        ]}
      />
      {kind === "blast" && (
        <>
          <Chart
            xLog
            yLog
            xLabel="distanza dal punto zero"
            yLabel="sovrapressione"
            xFmt={dFmt}
            yFmt={(v) => formatPressure(v, units)}
            yDomain={[0.1, 1000]}
            series={[
              { id: "p", label: "Sovrapressione", color: "var(--blast)", points: xs.map((x) => [x, Math.min(e.psiAt(x), 5000)]) },
              { id: "q", label: "Pressione dinamica", color: "var(--heat)", dash: "4 3", points: xs.map((x) => [x, dynamicPressurePsi(Math.min(e.psiAt(x), 5000))]) },
            ]}
            markers={[20, 5, 1].map((p) => ({ y: p, label: formatPressure(p, units) }))}
            footer={<ChapterLink id="onda-urto" label="Perché la curva piega: onda di Mach e quota ottimale" />}
          />
          <Chart
            xLog
            xLabel="distanza"
            yLabel="secondi / km/h"
            xFmt={dFmt}
            yFmt={(v) => (v >= 100 ? formatInt(v) : v.toFixed(1))}
            series={[
              { id: "t", label: "Arrivo dell'onda (s)", color: "var(--fg)", points: xs.map((x) => [x, e.arrivalAt(x)]) },
              { id: "w", label: "Vento di picco (km/h ÷ 10)", color: "var(--emp)", points: xs.map((x) => [x, (peakWindMs(Math.min(e.psiAt(x), 5000)) * 3.6) / 10]) },
            ]}
          />
        </>
      )}
      {kind === "thermal" && (
        <Chart
          xLog
          yLog
          xLabel="distanza"
          yLabel="energia termica"
          xFmt={dFmt}
          yFmt={(v) => `${v >= 1 ? formatInt(v) : v.toFixed(1)}`}
          yDomain={[0.3, 10_000]}
          series={[{ id: "q", label: "Fluenza (cal/cm²)", color: "var(--heat)", points: xs.map((x) => [x, e.fluenceAt(x)]) }]}
          markers={[
            { y: e.burn.burn3, label: "3° grado", color: "var(--blast)" },
            { y: e.burn.ignite, label: "innesco", color: "var(--heat)" },
            { y: e.burn.burn1, label: "1° grado" },
          ]}
          footer={<p className="mt-1 text-[11.5px] text-faint">Visibilità {Math.round(e.atmo.visKm)} km, umidità {Math.round(e.atmo.rh)}%, nubi {Math.round(e.atmo.cloud * 100)}%. Frazione termica {Math.round(e.thermalFraction * 100)}%.</p>}
        />
      )}
      {kind === "radiation" && (
        <Chart
          xLog
          yLog
          xLabel="distanza"
          yLabel={`dose pronta (${units.dose})`}
          xFmt={dFmt}
          yFmt={(v) => formatDose(v, units).replace(/ (Gy|rad)$/, "")}
          yDomain={[0.01, 1000]}
          series={[{ id: "g", label: "Gamma + neutroni, all'aperto", color: "var(--rad)", points: xs.filter((x) => x < 20_000).map((x) => [x, e.promptAt(x)]) }]}
          markers={[
            { y: 8, label: "letale", color: "var(--blast)" },
            { y: 4.5, label: "LD50 con cure" },
            { y: 1, label: "sindrome acuta" },
          ]}
          footer={<p className="mt-1 text-[11.5px] text-faint">L'aria assorbe: la dose cala quasi esponenzialmente. Per le grandi potenze la zona letale da radiazione resta dentro quella dell'onda d'urto.</p>}
        />
      )}
      {kind === "fallout" &&
        (e.plume.active ? (
          <FalloutProfile e={e} t1={thr.windowH[0]} t2={thr.windowH[1]} />
        ) : (
          <Callout>Nessun fallout locale in questa geometria: la palla di fuoco non tocca il suolo. Prova uno scoppio al suolo o a quota più bassa.</Callout>
        ))}
      {kind === "scaling" && <ScalingChart e={e} />}
      {kind === "hob" && <HobChart e={e} />}
    </div>
  );
}

function FalloutProfile({ e, t1, t2 }: { e: Effects; t1: number; t2: number }) {
  const units = useStore((s) => s.units);
  const prof = plumeAxisProfile(e.plume, t1, t2, Math.max(e.falloutReachKm * 1.2, 20));
  return (
    <>
      <Chart
        xLog
        yLog
        xLabel="distanza sottovento sull'asse"
        yLabel="rad · rad/h"
        xFmt={(v) => formatDist(v * 1000, units)}
        yFmt={(v) => (v >= 1 ? formatInt(v) : v.toFixed(1))}
        yDomain={[1, Math.max(10, ...prof.map((p) => Math.max(p.dose, p.rateH1))) * 1.2]}
        series={[
          { id: "r", label: "Rateo a H+1 (rad/h)", color: "var(--fall)", points: prof.map((p) => [p.xKm, p.rateH1]) },
          { id: "d", label: `Dose ${t1}–${t2} h (rad)`, color: "var(--heat)", dash: "4 3", points: prof.map((p) => [p.xKm, p.dose]) },
        ]}
        markers={[
          { y: 450, label: "LD50 all'aperto", color: "var(--blast)" },
          { y: 100, label: "evacuazione" },
        ]}
      />
      <Chart
        xLog
        xLabel="distanza sottovento"
        yLabel="ore"
        xFmt={(v) => formatDist(v * 1000, units)}
        yFmt={(v) => v.toFixed(v < 10 ? 1 : 0)}
        series={[{ id: "a", label: "Arrivo del fallout (ore)", color: "var(--fg)", points: prof.map((p) => [p.xKm, p.arrivalH]) }]}
        footer={<ChapterLink id="fallout" label="La regola del 7 e 10, i fattori di protezione" />}
      />
    </>
  );
}

function ScalingChart({ e }: { e: Effects }) {
  const units = useStore((s) => s.units);
  const ys = Array.from({ length: 60 }, (_, i) => 10 ** (-1 + (i / 59) * 5.5));
  const thermal = (y: number) => {
    const b = burnThresholds(y);
    const h = optimumHobM(y);
    return Math.sqrt(Math.max(0, solveRadius((g) => fluenceCal(y, Math.hypot(g, h), 0.35, 0.8), b.burn3, 1, 300_000) ** 2));
  };
  return (
    <Chart
      xLog
      yLog
      xLabel="potenza (kt)"
      yLabel="raggio"
      xFmt={(v) => formatYield(v)}
      yFmt={(v) => formatDist(v, units)}
      series={[
        { id: "b", label: "5 psi, quota ottimale", color: "var(--blast)", points: ys.map((y) => [y, radiusForPsi(y, 5, optimumHobM(y))]) },
        { id: "t", label: "Ustioni 3° grado", color: "var(--heat)", points: ys.map((y) => [y, thermal(y)]) },
        { id: "r", label: "5 Gy pronti", color: "var(--rad)", points: ys.map((y) => [y, solveRadius((g) => promptDoseGy(y, 0.5, Math.hypot(g, optimumHobM(y))), 5, 1, 30_000)]) },
        { id: "f", label: "Palla di fuoco", color: "#fff1d6", dash: "3 3", points: ys.map((y) => [y, fireballRadiusM(y, false)]) },
      ]}
      markers={[{ x: e.yieldKt, label: "scenario" }]}
      footer={
        <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
          L'onda d'urto scala con la radice cubica della potenza (Y^⅓): mille volte più energia, raggio solo dieci volte più grande. Il calore cresce più in fretta (circa Y^0,4), la radiazione pronta molto più lentamente: per questo nelle armi grandi la radiazione iniziale conta poco e il fuoco conta molto.
        </p>
      }
    />
  );
}

function HobChart({ e }: { e: Effects }) {
  const units = useStore((s) => s.units);
  const y = e.yieldKt;
  const hs = Array.from({ length: 70 }, (_, i) => (i / 69) * 900 * Math.cbrt(y));
  return (
    <Chart
      xLabel="quota di scoppio"
      yLabel="raggio al suolo"
      xFmt={(v) => formatDist(v, units)}
      yFmt={(v) => formatDist(v, units)}
      series={[20, 10, 5, 2, 1].map((p, i) => ({
        id: String(p),
        label: formatPressure(p, units),
        color: ["#9c3b2e", "#c45c3e", "#d08a45", "#e0b56a", "#efe0c2"][i],
        points: hs.map((h) => [h, radiusForPsi(y, p, h)] as [number, number]),
      }))}
      markers={[{ x: e.hobM, label: "quota scelta" }]}
      footer={
        <p className="mt-1 text-[11.5px] leading-relaxed text-faint">
          Ogni soglia ha la sua quota ottimale: le pressioni alte si estendono di più con scoppi bassi, quelle basse con scoppi alti, grazie al rinforzo dell'onda riflessa dal suolo (stelo di Mach). Pianificatori e manuali scelgono la quota in funzione del bersaglio da distruggere.
        </p>
      }
    />
  );
}

/* ---------------------------------------------------------------- */

function CloudTab() {
  const { active: e } = useSim();
  const units = useStore((s) => s.units);
  const high = e.det.burst === "high" && e.hobM > 30_000;
  return (
    <div className="space-y-3 p-4">
      <Header e={e} />
      {high ? (
        <Callout>A quote spaziali non si forma un fungo: la palla di fuoco si espande nel vuoto e i detriti seguono il campo magnetico terrestre, producendo aurore artificiali (Starfish Prime, 1962).</Callout>
      ) : (
        <>
          <CloudDiagram e={e} />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Stat k="Sommità" v={formatDist(e.cloud.topM, units)} />
            <Stat k="Base della calotta" v={formatDist(e.cloud.baseM, units)} />
            <Stat k="Diametro della calotta" v={formatDist(e.cloud.radiusM * 2, units)} />
            <Stat k="Tempo di stabilizzazione" v={`~${Math.round(e.cloud.riseS / 60)} min`} />
          </dl>
          <p className="text-[12px] leading-relaxed text-muted">
            La palla di fuoco, più leggera dell'aria, sale come una bolla e aspira una colonna di polvere e detriti: è il «gambo». Quando la nube raggiunge la tropopausa (9–17 km secondo la latitudine) rallenta e si allarga; sopra il megatone sfonda nella stratosfera, dove i detriti fini restano per mesi e diventano fallout globale.
          </p>
          <ChapterLink id="nube" label="La nube a fungo nell'enciclopedia" />
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Phases() {
  const { active: e } = useSim();
  const units = useStore((s) => s.units);
  const set = useStore((s) => s.set);
  const r5 = ringRadius(e, "psi-5") || radiusForPsi(e.yieldKt, 5, e.hobM);
  const r1 = radiusForPsi(e.yieldKt, 1, e.hobM) * e.pressureFactor;
  const tmax = thermalTmaxS(e.yieldKt);
  const events: { t: number; title: string; text: string }[] = [
    { t: 1e-6, title: "Rilascio dell'energia", text: "In meno di un microsecondo l'energia scalda i materiali a decine di milioni di gradi. Raggi X molli vengono assorbiti dall'aria circostante." },
    { t: 1e-4, title: "Nasce la palla di fuoco", text: "Una sfera di aria incandescente si espande a velocità supersonica. Il primo lampo dura pochi millisecondi." },
    { t: tmax * 0.1, title: "Primo minimo di luminosità", text: "L'onda d'urto si stacca dalla palla di fuoco e ne copre la luce: il caratteristico doppio lampo registrato dai satelliti Vela." },
    { t: tmax, title: "Massimo del calore", text: `Il secondo impulso termico, che trasporta circa il ${Math.round(e.thermalFraction * 100)}% dell'energia, raggiunge il picco. Ustioni e incendi nascono qui.` },
    { t: Math.max(1, e.arrivalAt(r5)), title: `L'onda raggiunge i 5 psi (${formatDist(r5, units)})`, text: "Le case crollano. Segue il vento contrario quando l'aria rifluisce verso il centro." },
    { t: tmax * 10, title: "Fine dell'impulso termico", text: "Quasi tutta l'energia termica è stata irradiata." },
    { t: e.arrivalAt(r1), title: `L'onda raggiunge 1 psi (${formatDist(r1, units)})`, text: "Vetri in frantumi. Chi si è avvicinato alla finestra dopo il lampo viene ferito." },
    { t: 60, title: "Fine della radiazione iniziale", text: "Per convenzione la radiazione emessa nel primo minuto è «iniziale»; dopo, la nube è troppo alta e lontana." },
    { t: e.cloud.riseS, title: "La nube si stabilizza", text: `Sommità a circa ${formatDist(e.cloud.topM, units)}. Inizia il trasporto del vento.` },
  ];
  if (e.plume.active) {
    events.push({ t: 3600, title: "Riferimento H+1", text: "Il rateo di dose a un'ora è il riferimento dei manuali: da qui decade come t^−1,2." });
    events.push({ t: 7 * 3600, title: "Regola del 7 e 10", text: "Dopo 7 ore il rateo è sceso a un decimo; dopo 49 ore (2 giorni) a un centesimo; dopo 2 settimane a un millesimo." });
  }
  events.sort((a, b) => a.t - b.t);
  return (
    <div className="space-y-3 p-4">
      <Header e={e} />
      <p className="text-[12.5px] text-muted">Sequenza degli eventi per lo scoppio selezionato. Clicca un istante per vederlo sulla mappa con la barra temporale.</p>
      <ol className="relative space-y-3 border-l border-line pl-4">
        {events.map((ev) => (
          <li key={ev.title} className="relative">
            <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-ember" />
            <button className="text-left" onClick={() => set({ timeS: Math.max(ev.t, 0.001), playing: false })}>
              <span className="num mr-2 text-[11px] text-ember">{formatTime(ev.t)}</span>
              <span className="text-[12.5px] font-medium">{ev.title}</span>
              <span className="block text-[12px] text-muted">{ev.text}</span>
            </button>
          </li>
        ))}
      </ol>
      {e.plume.active && <SevenTen />}
    </div>
  );
}

function SevenTen() {
  const rows = [1, 7, 49, 343, 2401];
  return (
    <table className="num w-full text-[12px]">
      <caption className="pb-1 text-left font-sans text-[11.5px] text-faint">Decadimento del rateo di dose (1000 rad/h a H+1)</caption>
      <tbody>
        {rows.map((h) => (
          <tr key={h} className="border-t border-line">
            <td className="py-1 font-sans text-muted">{formatHours(h)}</td>
            <td className="text-right">{formatInt(1000 * Math.pow(h, -1.2))} rad/h</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ---------------------------------------------------------------- */

function Cities() {
  const { harm } = useSim();
  const units = useStore((s) => s.units);
  const set = useStore((s) => s.set);
  if (!harm) return <p className="p-4 text-[12px] text-faint">Calcolo in corso…</p>;
  return (
    <div className="p-4">
      <p className="kicker">GeoNames, popolazione odierna</p>
      <h3 className="font-serif text-xl">Centri abitati coinvolti</h3>
      <p className="mb-3 text-[12px] text-muted">Clicca una riga per mettere la sonda sul centro della città.</p>
      {harm.cities.length === 0 && <p className="text-[12px] text-faint">Nessun centro sopra i 15 000 abitanti nell'impronta.</p>}
      <table className="w-full text-[12px]">
        <thead className="text-left text-[11px] text-faint">
          <tr>
            <th className="pb-1 font-normal">Città</th>
            <th className="font-normal">Dist.</th>
            <th className="text-right font-normal">Morti</th>
            <th className="text-right font-normal">Feriti</th>
            <th className="text-right font-normal">Fallout</th>
          </tr>
        </thead>
        <tbody>
          {harm.cities.map((c) => (
            <tr key={`${c.name}${c.lat}`} className="cursor-pointer border-t border-line hover:bg-surface-2" onClick={() => set({ probe: { lat: c.lat, lon: c.lon } })}>
              <td className="py-1.5 pr-2">
                {c.name} <span className="text-faint">{c.country}</span>
                <span className="num block text-[10.5px] text-faint">{formatPeople(c.pop)} ab. · max {formatPressure(c.maxPsi, units)}</span>
              </td>
              <td className="num">{formatDist(c.distKm * 1000, units)}</td>
              <td className="num text-right text-ember">{formatPeople(c.deaths + c.falloutDeaths)}</td>
              <td className="num text-right">{formatPeople(c.injuries)}</td>
              <td className="num text-right text-fall">{c.falloutRad >= 1 ? formatRad(c.falloutRad, units) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Notes() {
  const { effects } = useSim();
  const notes = Array.from(new Set(effects.flatMap((e) => e.notes)));
  return (
    <div className="space-y-4 p-4">
      <div>
        <p className="kicker">Leggere i numeri</p>
        <h3 className="font-serif text-xl">Che cosa il modello sa, e che cosa no</h3>
      </div>
      <ul className="list-disc space-y-2 pl-4 text-[12.5px] text-muted">
        {notes.map((n) => (
          <li key={n}>{n}</li>
        ))}
        <li>Onda d'urto: approssimazione di Brode (1986), ±10% sulle curve di Glasstone a livello del mare. Terreno piatto: colline e palazzi schermano o canalizzano.</li>
        <li>Calore: geometria sferica con trasmissione atmosferica semplificata. Nessuna ombra di edifici o rilievi, nessuna riflessione da nubi o neve.</li>
        <li>Fallout: pennacchio gaussiano con un solo vento, calibrato sulle curve idealizzate di Glasstone per 1 Mt di fissione. Nessun profilo verticale del vento, nessuna orografia, nessuna dimensione delle particelle.</li>
        <li>Popolazione: città GeoNames con la popolazione di oggi, distribuite come dischi o profili esponenziali; nessuna differenza fra giorno e notte, nessun pendolarismo.</li>
        <li>Mortalità: curve log-normali ispirate alle bande OTA 1979 e alla dosimetria di Hiroshima e Nagasaki. Rischi di più detonazioni combinati come indipendenti.</li>
        <li>Fuori dal modello: collasso sanitario, incendi di massa nei giorni successivi, inquinamento chimico, effetti sul clima e sulla produzione di cibo, conseguenze psicologiche e sociali.</li>
      </ul>
      <Callout>
        Questo è uno strumento per capire gli ordini di grandezza e il perché delle differenze fra scenari. Non è una previsione, né uno strumento di pianificazione. <ChapterLink id="modello" label="Come è costruito il modello" />
      </Callout>
    </div>
  );
}
