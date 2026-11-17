import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BIBLIOGRAPHY, ORIGIN_LABEL, weapons, type Confidence, type Kind, type Origin, type Status, type Weapon } from "@/data/weapons";
import { dossierBlob, dossierFor } from "@/data/dossiers";
import { photosById } from "@/data/photos";
import type { GalleryItem } from "@/data/gallery";
import { radiusForPsi, optimumHobM } from "@/lib/physics/core";
import { formatDist, formatYield } from "@/lib/format";
import { useStore } from "@/state/store";
import { Silhouette } from "@/components/views/Silhouette";
import { Figure, Lightbox, useLightbox } from "@/components/Lightbox";
import { cx, Segmented } from "@/components/ui";

const ORIGINS = Object.entries(ORIGIN_LABEL) as [Origin, string][];
const KINDS: Kind[] = ["gravità", "missile", "slbm", "crociera", "artiglieria", "siluro", "demolizione", "antimissile", "antiaerea", "dispositivo", "profondità"];
const STATUSES: Status[] = ["in servizio", "ritirato", "sperimentale", "smantellato", "mai schierato"];
const CONFIDENCE: Record<Confidence, string> = {
  misurata: "Misurata: un test o una ricostruzione strumentale.",
  dichiarata: "Dichiarata: cifra d'arsenale ripetuta dalle rassegne pubbliche.",
  stimata: "Stimata: le fonti aperte convergono sull'ordine di grandezza.",
  controversa: "Controversa: il dato dichiarato e quello misurato non coincidono; sono riportati entrambi.",
};

export function Archive() {
  const requested = useStore((s) => s.archiveWeapon);
  const [q, setQ] = useState("");
  const [origin, setOrigin] = useState<Origin | "">("");
  const [kind, setKind] = useState<Kind | "">("");
  const [status, setStatus] = useState<Status | "">("");
  const [sort, setSort] = useState<"year" | "yield" | "name">("year");
  const [open, setOpen] = useState<string>(requested ?? "little-boy");
  const [reading, setReading] = useState(Boolean(requested));
  const [page, setPage] = useState<"schede" | "fonti">("schede");
  useEffect(() => {
    if (requested) {
      setOpen(requested);
      setReading(true);
    }
  }, [requested]);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    const rows = weapons.filter((w) => {
      if (origin && w.origin !== origin) return false;
      if (kind && w.kind !== kind) return false;
      if (status && w.status !== status) return false;
      if (!query) return true;
      return `${w.name} ${w.aka ?? ""} ${w.summary} ${w.history} ${ORIGIN_LABEL[w.origin]} ${w.kind} ${w.delivery} ${dossierBlob(w.id)}`.toLowerCase().includes(query);
    });
    rows.sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name, "it") : sort === "yield" ? b.yNom - a.yNom : a.year - b.year || a.name.localeCompare(b.name, "it")));
    return rows;
  }, [q, origin, kind, status, sort]);
  const weapon = weapons.find((w) => w.id === open) ?? list[0];

  return (
    <div className="flex min-h-0 flex-1 lg:grid lg:grid-cols-[22rem_minmax(0,1fr)]">
      <div className={cx("flex min-h-0 w-full flex-col gap-3 overflow-y-auto border-line p-4 lg:border-r", reading && "max-lg:hidden")}>
        <div>
          <p className="kicker">Biblioteca</p>
          <h2 className="font-serif text-3xl">Archivio degli ordigni</h2>
          <p className="text-[12.5px] text-muted">{weapons.length} schede da fonti aperte. Dove il dato manca, la fascia è una stima e lo dichiara.</p>
        </div>
        <Segmented value={page} onChange={setPage} options={[{ id: "schede", label: "Schede" }, { id: "fonti", label: "Fonti" }]} />
        {page === "schede" ? (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nome, paese, storia" className="min-h-9 rounded-md border border-line bg-surface-2 px-3 text-[13px] outline-none focus:border-ember" />
            <div className="grid grid-cols-2 gap-2">
              <Sel label="Paese" value={origin} onChange={(v) => setOrigin(v as Origin | "")} options={[["", "Tutti"], ...ORIGINS]} />
              <Sel label="Tipo" value={kind} onChange={(v) => setKind(v as Kind | "")} options={[["", "Tutti"], ...KINDS.map((k) => [k, k] as [string, string])]} />
              <Sel label="Stato" value={status} onChange={(v) => setStatus(v as Status | "")} options={[["", "Tutti"], ...STATUSES.map((s) => [s, s] as [string, string])]} />
              <Sel label="Ordine" value={sort} onChange={(v) => setSort(v as typeof sort)} options={[["year", "Anno"], ["yield", "Potenza"], ["name", "Nome"]]} />
            </div>
            <p className="text-[11.5px] text-faint">{list.length} schede in vista</p>
            <ul className="divide-y divide-line border-y border-line">
              {list.map((w) => (
                <li key={w.id}>
                  <button onClick={() => { setOpen(w.id); setReading(true); }} className={cx("flex w-full items-baseline justify-between gap-3 py-2 text-left text-[13px]", weapon?.id === w.id && "text-ember")}>
                    <span>
                      {w.name}
                      <span className="block text-[11.5px] text-muted">
                        {ORIGIN_LABEL[w.origin]} · {w.year} · {w.status}
                      </span>
                    </span>
                    <span className="num shrink-0">{formatYield(w.yNom)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <ul className="space-y-4">
            {BIBLIOGRAPHY.map((b) => (
              <li key={b.title}>
                <p className="text-[13px]">{b.title}</p>
                <p className="text-[12px] text-muted">{b.note}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={cx("min-h-0 w-full overflow-y-auto bg-paper p-5 text-ink lg:p-10", !reading && "max-lg:hidden")}>
        <button onClick={() => setReading(false)} className="mb-3 flex items-center gap-1 text-[13px] underline lg:hidden">
          <ArrowLeft className="size-4" /> Elenco
        </button>
        {weapon ? <Sheet weapon={weapon} /> : <p>Nessuna scheda con questi filtri.</p>}
      </div>
    </div>
  );
}

function Sheet({ weapon }: { weapon: Weapon }) {
  const chooseWeapon = useStore((s) => s.chooseWeapon);
  const lb = useLightbox();
  const dossier = dossierFor(weapon.id);
  const photos: GalleryItem[] = photosById(dossier?.photos).map((p) => ({
    id: p.id,
    src: p.src,
    title: p.kind === "dispositivo" ? "Dispositivo" : p.kind === "vettore" ? "Vettore" : "Documento",
    caption: p.caption,
    year: null,
    topics: [],
    kind: "foto",
    credit: p.credit,
    license: "",
  }));
  const r5 = radiusForPsi(weapon.yNom, 5, optimumHobM(weapon.yNom));
  const hiro = radiusForPsi(15, 5, optimumHobM(15));
  return (
    <article className="mx-auto max-w-2xl">
      <p className="kicker !text-ink/60">
        {ORIGIN_LABEL[weapon.origin]} · {weapon.kind} · {weapon.status}
      </p>
      <h2 className="mt-1 font-serif text-5xl leading-tight">{weapon.name}</h2>
      {weapon.aka && <p className="text-lg text-ink/70">{weapon.aka}</p>}
      <Figure items={photos} onOpen={(i) => lb.open(photos, i)} />
      <div className="mt-4 text-[#8a5a2c]">
        <Silhouette form={weapon.form} lengthM={weapon.lengthM} diameterM={weapon.diameterM} />
        <p className="text-[11.5px]">Sagoma esterna di categoria, non un disegno costruttivo.</p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 text-[13.5px]">
        <Item k="Potenza" v={`${formatYield(weapon.yMin)} – ${formatYield(weapon.yMax)}`} sub={`nominale di studio ${formatYield(weapon.yNom)}`} />
        <Item k="Anni" v={`${weapon.year}${weapon.retired ? ` – ${weapon.retired}` : " –"}`} />
        <Item k="Vettore" v={weapon.delivery} />
        <Item k="Frazione di fissione usata" v={`${Math.round(weapon.fission * 100)}%`} />
        {weapon.massKg != null && <Item k="Massa pubblicata" v={`${weapon.massKg.toLocaleString("it-IT")} kg`} />}
        {weapon.lengthM != null && <Item k="Ingombro esterno" v={`${weapon.lengthM} m${weapon.diameterM ? ` × ${weapon.diameterM} m` : ""}`} />}
      </dl>
      <div className="mt-5 rounded-lg bg-ink/5 p-4">
        <p className="text-[12px] text-ink/60">Raggio dei 5 psi alla quota ottimale</p>
        <p className="num text-2xl">{formatDist(r5)}</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full bg-[#b8601f]" style={{ width: `${Math.min(100, (r5 / Math.max(r5, hiro * 10)) * 100)}%` }} />
        </div>
        <p className="mt-1 text-[12px] text-ink/60">
          {r5 > hiro ? `${(r5 / hiro).toFixed(1)} volte il raggio di Hiroshima; area ${((r5 / hiro) ** 2).toFixed(0)} volte più grande.` : "Meno del raggio di Hiroshima."} Potenza {(weapon.yNom / 15).toFixed(weapon.yNom < 15 ? 2 : 0)}× Hiroshima.
        </p>
      </div>
      {dossier && dossier.facts.length > 0 && (
        <dl className="mt-5 grid gap-2 border-t border-ink/15 pt-4 text-[13.5px]">
          {dossier.facts.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-3">
              <dt className="text-ink/60">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-4 text-[13px] text-ink/70">{CONFIDENCE[weapon.confidence]}</p>
      <p className="mt-4 font-serif text-xl leading-snug">{weapon.summary}</p>
      <p className="mt-3 leading-relaxed">{weapon.history}</p>
      {dossier?.more.map((p) => (
        <p key={p.slice(0, 30)} className="mt-3 leading-relaxed">
          {p}
        </p>
      ))}
      <button onClick={() => chooseWeapon(weapon.id)} className="mt-6 min-h-10 rounded-md bg-ink px-4 text-paper">
        Studiarla sulla mappa
      </button>
      <Lightbox state={lb.state} onClose={lb.close} onIndex={(i) => lb.set((s) => (s ? { ...s, i } : s))} />
    </article>
  );
}

function Item({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>
        {v}
        {sub && <span className="block text-ink/60">{sub}</span>}
      </dd>
    </div>
  );
}

function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <label className="block text-[12px]">
      <span className="text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 min-h-8 w-full rounded-md border border-line bg-surface-2 px-2 text-[12.5px]">
        {options.map(([id, t]) => (
          <option key={label + id} value={id}>
            {t}
          </option>
        ))}
      </select>
    </label>
  );
}
