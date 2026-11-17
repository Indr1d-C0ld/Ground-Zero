import { useMemo, useState } from "react";
import { BIBLIOGRAPHY, ORIGIN_LABEL, weapons, type Confidence, type Kind, type Origin, type Status, type Weapon } from "@/data/weapons";
import { dossierBlob, dossierFor } from "@/data/dossiers";
import { PHOTOS, photosById, type ArchivePhoto } from "@/data/photos";
import { formatYield } from "@/lib/format";
import { Silhouette } from "@/components/atlante/Silhouette";

const ORIGINS = Object.entries(ORIGIN_LABEL) as [Origin, string][];
const KINDS: Kind[] = ["gravità", "missile", "slbm", "crociera", "artiglieria", "siluro", "demolizione", "antimissile", "antiaerea", "dispositivo", "profondità"];
const STATUSES: Status[] = ["in servizio", "ritirato", "sperimentale", "smantellato", "mai schierato"];

const CONFIDENCE: Record<Confidence, string> = {
  misurata: "Misurata — un test o una ricostruzione strumentale.",
  dichiarata: "Dichiarata — cifra d'arsenale ripetuta dalle rassegne pubbliche, non un tuo calcolo.",
  stimata: "Stimata — le fonti aperte convergono sull'ordine di grandezza, non sul grammo.",
  controversa: "Controversa — il comunicato e le misure non dicono la stessa cosa. Sono riportati entrambi.",
};

type Props = {
  onUse: (id: string) => void;
};

export function Archive({ onUse }: Props) {
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState<Origin | "">("");
  const [kind, setKind] = useState<Kind | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [sort, setSort] = useState<"year" | "yield" | "name">("year");
  const [open, setOpen] = useState<string>("little-boy");
  const [reading, setReading] = useState(false);
  const [page, setPage] = useState<"schede" | "fondi">("schede");

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const rows = weapons.filter((w) => {
      if (origin && w.origin !== origin) return false;
      if (kind && w.kind !== kind) return false;
      if (status && w.status !== status) return false;
      if (!query) return true;
      const blob = `${w.name} ${w.aka ?? ""} ${w.summary} ${w.history} ${ORIGIN_LABEL[w.origin]} ${w.kind} ${w.delivery} ${dossierBlob(w.id)}`.toLowerCase();
      return blob.includes(query);
    });
    rows.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "it");
      if (sort === "yield") return b.yNom - a.yNom;
      return a.year - b.year || a.name.localeCompare(b.name, "it");
    });
    return rows;
  }, [q, origin, kind, status, sort]);

  const weapon = weapons.find((w) => w.id === open) ?? list[0];

  return (
    <div className="h-full min-h-0 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className={`flex h-full min-h-0 flex-col gap-3 overflow-y-auto border-line p-4 lg:border-r ${reading ? "max-lg:hidden" : ""}`}>
        <div>
          <p className="text-xs tracking-widest text-muted uppercase">Biblioteca</p>
          <h2 className="font-serif text-2xl">Dispositivi conosciuti</h2>
          <p className="text-sm text-muted">
            {weapons.length} schede, {Object.keys(PHOTOS).length} fotografie nell'app. Dove il dato manca, la fascia è una stima e lo dice.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setPage("schede")} className={`min-h-11 rounded-md border text-sm ${page === "schede" ? "border-ember text-ember" : "border-line"}`}>
            Schede
          </button>
          <button onClick={() => setPage("fondi")} className={`min-h-11 rounded-md border text-sm ${page === "fondi" ? "border-ember text-ember" : "border-line"}`}>
            Fonti
          </button>
        </div>
        {page === "schede" && (
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cercare nome, paese, storia"
              className="min-h-11 rounded-md border border-line bg-surface-2 px-3 text-fg outline-none focus:border-ember"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select label="Paese" value={origin} onChange={(v) => setOrigin(v as Origin | "")} options={[["", "Tutti"], ...ORIGINS]} />
              <Select label="Tipo" value={kind} onChange={(v) => setKind(v as Kind | "")} options={[["", "Tutti"], ...KINDS.map((k) => [k, k] as [string, string])]} />
              <Select label="Stato" value={status} onChange={(v) => setStatus(v as Status | "")} options={[["", "Tutti"], ...STATUSES.map((s) => [s, s] as [string, string])]} />
              <Select
                label="Ordine"
                value={sort}
                onChange={(v) => setSort(v as "year" | "yield" | "name")}
                options={[
                  ["year", "Anno"],
                  ["yield", "Potenza"],
                  ["name", "Nome"],
                ]}
              />
            </div>
            <p className="text-xs text-muted">{list.length} schede in vista</p>
            <ul className="divide-y divide-line border-y border-line">
              {list.map((w) => (
                <li key={w.id}>
                  <button onClick={() => { setOpen(w.id); setReading(true); }} className={`flex min-h-11 w-full items-baseline justify-between gap-3 py-2 text-left text-sm ${weapon?.id === w.id ? "text-ember" : ""}`}>
                    <span>
                      {w.name}
                      <span className="block text-muted">
                        {ORIGIN_LABEL[w.origin]} · {w.year} · {w.status}
                      </span>
                    </span>
                    <span className="shrink-0">{formatYield(w.yNom)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        {page === "fondi" && (
          <ul className="space-y-4">
            {BIBLIOGRAPHY.map((b) => (
              <li key={b.title}>
                <p className="text-fg">{b.title}</p>
                <p className="text-sm text-muted">{b.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`h-full min-h-0 overflow-y-auto bg-paper p-4 text-ink lg:p-8 ${reading ? "" : "max-lg:hidden"}`}>
        <button onClick={() => setReading(false)} className="mb-3 min-h-11 text-sm underline lg:hidden">
          Torna all'elenco
        </button>
        {page === "fondi" ? (
          <article className="mx-auto max-w-2xl">
            <p className="text-xs tracking-widest uppercase">Come leggere l'archivio</p>
            <h2 className="mt-2 font-serif text-3xl leading-tight">Una biblioteca, non un manuale</h2>
            <div className="mt-4 space-y-4 text-base">
              <p>
                Le fotografie, quando ne esiste una di pubblico dominio o con licenza libera, sono file di questa pagina: involucro esterno, vettore, oppure il documento di un test. Il credito sta sotto lo scatto. Le sagome restano schemi di categoria, accanto alle foto. Né le une né le altre sono sezioni interne.
              </p>
              <p>
                «Mai schierato» significa un programma noto, cancellato prima del servizio. «Sperimentale» è un test o un dispositivo che non diventò un'arma di arsenale. «Controversa» tiene insieme, di proposito, il numero dichiarato e quello misurato da lontano.
              </p>
              <p>
                Paesi che non pubblicano le rese — Israele, e in larga parte India, Pakistan, Cina e Corea del Nord per i vettori attuali — hanno fasce larghe. Stringerle sarebbe fiction.
              </p>
            </div>
          </article>
        ) : weapon ? (
          <WeaponSheet weapon={weapon} onUse={onUse} />
        ) : (
          <p>Nessuna scheda con questi filtri.</p>
        )}
      </div>
    </div>
  );
}

function WeaponSheet({ weapon, onUse }: { weapon: Weapon; onUse: (id: string) => void }) {
  const dossier = dossierFor(weapon.id);
  const photos = photosById(dossier?.photos);
  return (
    <article className="mx-auto max-w-2xl">
      <p className="text-xs tracking-widest uppercase">
        {ORIGIN_LABEL[weapon.origin]} · {weapon.kind} · {weapon.status}
      </p>
      <h2 className="mt-1 font-serif text-4xl leading-tight">{weapon.name}</h2>
      {weapon.aka && <p className="text-lg">{weapon.aka}</p>}
      {photos.length > 0 && (
        <div className="mt-5 space-y-4">
          {photos.map((photo) => (
            <Photo key={photo.id} photo={photo} />
          ))}
        </div>
      )}
      <div className="mt-4 text-ember-dim">
        <Silhouette form={weapon.form} lengthM={weapon.lengthM} diameterM={weapon.diameterM} />
        <p className="text-xs">Sagoma esterna di categoria, non un disegno costruttivo.</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="opacity-70">Potenza</dt>
          <dd>
            {formatYield(weapon.yMin)} – {formatYield(weapon.yMax)}
            <span className="block">nominale di studio {formatYield(weapon.yNom)}</span>
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Anni</dt>
          <dd>
            {weapon.year}
            {weapon.retired ? ` – ${weapon.retired}` : " –"}
          </dd>
        </div>
        <div>
          <dt className="opacity-70">Vettore</dt>
          <dd>{weapon.delivery}</dd>
        </div>
        <div>
          <dt className="opacity-70">Frazione di fissione usata</dt>
          <dd>{Math.round(weapon.fission * 100)}%</dd>
        </div>
        {weapon.massKg != null && (
          <div>
            <dt className="opacity-70">Massa pubblicata</dt>
            <dd>{weapon.massKg.toLocaleString("it-IT")} kg</dd>
          </div>
        )}
        {weapon.lengthM != null && (
          <div>
            <dt className="opacity-70">Ingombro esterno</dt>
            <dd>
              {weapon.lengthM} m{weapon.diameterM ? ` × ${weapon.diameterM} m` : ""}
            </dd>
          </div>
        )}
      </dl>
      {dossier && dossier.facts.length > 0 && (
        <dl className="mt-4 grid gap-3 border-t border-ink/15 pt-4 text-sm">
          {dossier.facts.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3">
              <dt className="opacity-70">{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-sm">{CONFIDENCE[weapon.confidence]}</p>
      <p className="mt-4 text-lg leading-snug">{weapon.summary}</p>
      <p className="mt-3 leading-relaxed">{weapon.history}</p>
      {dossier?.more.map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="mt-3 leading-relaxed">
          {paragraph}
        </p>
      ))}
      <button onClick={() => onUse(weapon.id)} className="mt-6 min-h-11 rounded-md bg-ink px-4 text-paper">
        Studiarla sulla mappa
      </button>
    </article>
  );
}

function Photo({ photo }: { photo: ArchivePhoto }) {
  const kind = photo.kind === "dispositivo" ? "Dispositivo" : photo.kind === "vettore" ? "Vettore" : "Documento";
  return (
    <figure>
      <img src={photo.src} alt={photo.caption} className="max-h-80 w-full rounded-md bg-ink/5 object-contain" />
      <figcaption className="mt-1.5 text-sm leading-snug">
        <span className="mr-2 text-xs tracking-widest uppercase opacity-60">{kind}</span>
        {photo.caption}
        <span className="mt-0.5 block text-xs opacity-60">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-line bg-surface-2 px-2 text-fg">
        {options.map(([id, text]) => (
          <option key={label + id} value={id}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
