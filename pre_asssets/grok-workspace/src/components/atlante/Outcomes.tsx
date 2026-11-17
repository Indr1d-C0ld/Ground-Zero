import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Weapon } from "@/data/weapons";
import { ORIGIN_LABEL } from "@/data/weapons";
import type { Effects, WeatherSnap } from "@/lib/effects/physics";
import { ringRadius } from "@/lib/effects/physics";
import type { Harm } from "@/lib/effects/harm";
import { formatDeg, formatKm, formatPeople, formatYield, sigFigs } from "@/lib/format";

type Props = {
  weapon: Weapon;
  effects: Effects;
  harm: Harm;
  weather: WeatherSnap | null;
  weatherError: string | null;
  place: string;
  presetNote: string | null;
  shelterLabel: string;
};

export function Outcomes(props: Props) {
  const { effects, harm, weapon } = props;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const zoneData = effects.rings
    .filter((r) => r.radiusM > 0 && ["fireball", "blast", "thermal", "radiation"].includes(r.group))
    .map((r) => ({ name: r.label, km: Math.round((r.radiusM / 1000) * 100) / 100 }));

  const sootTg = harm.sootTonnes / 1e6;
  const climate =
    sootTg < 0.01
      ? "Un singolo scoppio, anche grave, non è un inverno nucleare. Quell'effetto, nei lavori di Robock e Toon, richiede molti incendi urbani insieme."
      : `Ordine di grandezza della fuliggine: circa ${sootTg.toFixed(2)} Tg. La scala pubblica associa circa 5 Tg, da un centinaio di incendi urbani, a un raffreddamento globale dell'ordine di un grado. Qui la cifra è troppo incerta per trasformarla in una temperatura.`;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <div>
        <p className="text-xs tracking-widest text-muted uppercase">{props.place}</p>
        <h2 className="font-serif text-2xl leading-tight">Conseguenze</h2>
        <p className="mt-1 text-sm text-muted">
          {weapon.name} · {formatYield(effects.yieldKt)} · quota {Math.round(effects.hobUsedM)} m · {props.shelterLabel}
        </p>
      </div>

      {props.presetNote && <p className="rounded-md border border-line bg-surface-2 p-3 text-sm text-fg">{props.presetNote}</p>}

      <section>
        <h3 className="font-serif text-xl">Persone</h3>
        <p className="mt-1 text-3xl text-ember">{formatPeople(harm.deaths)}</p>
        <p className="text-sm text-muted">
          morti immediati, ordine di grandezza. Fascia indicativa {formatPeople(harm.band[0])} – {formatPeople(harm.band[1])}, non un conteggio.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Stat k="Feriti gravi" v={formatPeople(harm.injuries)} />
          <Stat k="Senza casa, entro 1 psi" v={formatPeople(harm.displaced)} />
          <Stat k="Malati da fallout" v={formatPeople(harm.falloutSick)} />
          <Stat k="Morti da fallout acuto" v={formatPeople(harm.falloutDeaths)} />
        </dl>
        <p className="mt-3 text-sm text-muted">
          I morti da fallout sono stimati fuori dalla zona dei 5 psi, per non contare due volte chi è già nel crollo. Ospedali, acqua e comunicazioni saltano molto prima che il numero di feriti trovi un letto: è il punto dell'OTA del 1979, e questo modello non lo simula ospedale per ospedale.
        </p>
      </section>

      {mounted && zoneData.length > 0 && (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneData} layout="vertical" margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#a39b8e", fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${value} km`, "raggio"]}
                contentStyle={{ background: "#1c1a16", border: "1px solid #3a342c", color: "#ebe6dc" }}
              />
              <Bar dataKey="km" fill="#d08a45" radius={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <section>
        <h3 className="font-serif text-xl">Zone</h3>
        <ul className="mt-2 divide-y divide-line border-y border-line">
          {effects.rings
            .filter((r) => r.radiusM > 0)
            .map((r) => (
              <li key={r.id} className="grid grid-cols-[7rem_1fr] gap-3 py-2 text-sm">
                <span className="text-fg">{formatKm(r.radiusM)}</span>
                <span>
                  <span className="text-fg">{r.label}. </span>
                  <span className="text-muted">{r.detail}</span>
                </span>
              </li>
            ))}
        </ul>
        {effects.arrival5psiS != null && ringRadius(effects, "psi-5") > 0 && (
          <p className="mt-2 text-sm text-muted">
            Fra il lampo e l'onda, a 5 psi, passano circa {effects.arrival5psiS.toFixed(1)} secondi. Il calore viaggia con la luce.
          </p>
        )}
      </section>

      <section>
        <h3 className="font-serif text-xl">Città nella griglia</h3>
        <p className="text-sm text-muted">Popolazione odierna GeoNames, dischi urbani stimati. Non è il censimento dell'anno storico.</p>
        <ul className="mt-2 divide-y divide-line">
          {harm.cities.length === 0 && <li className="py-2 text-sm text-muted">Nessun centro sopra 15 mila abitanti dentro l'impronta.</li>}
          {harm.cities.map((c) => (
            <li key={`${c.name}-${c.country}`} className="py-2 text-sm">
              <span className="text-fg">
                {c.name} ({c.country})
              </span>
              <span className="text-muted">
                {" "}
                · {c.distKm.toFixed(1)} km · {formatPeople(c.pop)} abitanti
                {c.deaths > 1 ? ` · morti immediati ~${formatPeople(c.deaths)}` : ""}
                {c.falloutRad >= 10 ? ` · fallout ~${Math.round(c.falloutRad)} rad` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-serif text-xl">Ambiente</h3>
        <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
          <Stat k="Cratere" v={effects.craterRadiusM > 0 ? `${formatKm(effects.craterRadiusM)} · prof. ${formatKm(effects.craterDepthM)}` : "trascurabile"} />
          <Stat k="Area urbana innescabile" v={`${harm.urbanBurnKm2.toFixed(1)} km²`} />
          <Stat k="Fuliggine, ordine di grandezza" v={harm.sootTonnes > 1 ? `${formatPeople(sigFigs(harm.sootTonnes, 2))} t` : "trascurabile"} />
          <Stat k="Tempesta di fuoco" v={harm.firestormLikely ? "ipotesi attiva" : "non assunta"} />
        </dl>
        <p className="mt-3 text-sm text-muted">{climate}</p>
        <p className="mt-2 text-sm text-muted">
          {effects.localFallout
            ? `Il pennacchio è schematico. La frangia dei 10 rad — una dose bassa, non letale da sola — arriva a circa ${Math.round(effects.falloutMaxKm)} km verso ${formatDeg(effects.downwindDeg)}. Vento ${effects.windMs.toFixed(1)} m/s da ${formatDeg(effects.windFromDeg)}. ${effects.raining ? "Pioggia in corso: deposito più corto e più intenso." : "Senza pioggia significativa nel punto."} Dentro i 100 rad l'agricoltura può essere preclusa per settimane o mesi; il cesio resta un problema più lungo, non calcolato isotopo per isotopo.`
            : "Niente pennacchio locale in questa geometria. Uno scoppio in aria risparmia il fallout precoce e allarga l'onda: è il motivo per cui Hiroshima non è il modello di uno scoppio al suolo."}
        </p>
        {effects.baseSurgeM > 0 && (
          <p className="mt-2 text-sm text-muted">Base surge indicativa: {formatKm(effects.baseSurgeM)}. L'acqua resta contaminata ben oltre l'anello disegnato.</p>
        )}
      </section>

      <section>
        <h3 className="font-serif text-xl">Meteo usato</h3>
        {props.weatherError && <p className="text-sm text-muted">{props.weatherError}</p>}
        {props.weather ? (
          <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <Stat k="Temperatura" v={props.weather.tempC != null ? `${props.weather.tempC.toFixed(0)} °C` : "—"} />
            <Stat k="Umidità" v={props.weather.rh != null ? `${Math.round(props.weather.rh)}%` : "—"} />
            <Stat k="Nubi" v={props.weather.cloud != null ? `${Math.round(props.weather.cloud * 100)}%` : "—"} />
            <Stat k="Pressione" v={props.weather.pressureHpa != null ? `${Math.round(props.weather.pressureHpa)} hPa` : "—"} />
            <Stat k="Visibilità" v={`${effects.visibilityKm.toFixed(0)} km`} />
            <Stat k="Quota del suolo" v={props.weather.elevationM != null ? `${Math.round(props.weather.elevationM)} m` : "—"} />
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted">Meteo non ancora letto: visibilità 24 km, vento 6 m/s da ovest, 1013 hPa.</p>
        )}
        <p className="mt-2 text-sm text-muted">
          Foschia e nubi accorciano il calore. La pressione corregge di poco i raggi d'urto. Il terreno, gli edifici singoli e il fumo non sono nel modello.
        </p>
      </section>

      <section>
        <h3 className="font-serif text-xl">Scheda</h3>
        <p className="text-sm text-fg">
          {weapon.name}
          {weapon.aka ? ` — ${weapon.aka}` : ""} · {ORIGIN_LABEL[weapon.origin]} · {weapon.year}
          {weapon.retired ? `–${weapon.retired}` : ""} · {weapon.status}
        </p>
        <p className="mt-2 text-sm text-muted">{weapon.summary}</p>
      </section>

      <section>
        <h3 className="font-serif text-xl">Limiti, in breve</h3>
        <ul className="mt-2 list-disc space-y-2 pl-4 text-sm text-muted">
          {effects.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          <li>Le probabilità di morte sono ispirate all'OTA e a Glasstone, poi semplificate. Non sono una perizia.</li>
        </ul>
      </section>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-muted">{k}</dt>
      <dd className="text-fg">{v}</dd>
    </div>
  );
}
