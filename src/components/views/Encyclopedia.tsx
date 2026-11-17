import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { CHAPTERS, GLOSSARY, type Block, type Chapter } from "@/data/encyclopedia";
import { byTopic, type GalleryItem } from "@/data/gallery";
import { useStore } from "@/state/store";
import { Figure, Lightbox, useLightbox } from "@/components/Lightbox";
import { cx } from "@/components/ui";

const ALIASES: Record<string, string> = {
  storia: "test",
  "impulso-termico": "termico",
  "conseguenze-sanitarie": "sanita",
};

function resolve(id: string | null): string {
  if (!id) return CHAPTERS[0].id;
  const k = ALIASES[id] ?? id;
  return (CHAPTERS.find((c) => c.id === k) ?? CHAPTERS.find((c) => c.id.includes(k)) ?? CHAPTERS.find((c) => c.topics.includes(k)) ?? CHAPTERS[0]).id;
}

export function Encyclopedia() {
  const requested = useStore((s) => s.encyclopediaChapter);
  const set = useStore((s) => s.set);
  const [current, setCurrent] = useState<string>(() => resolve(requested));
  const [q, setQ] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (requested) setCurrent(resolve(requested));
  }, [requested]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [current]);

  const parts = useMemo(() => {
    const map = new Map<string, Chapter[]>();
    for (const c of CHAPTERS) map.set(c.part, [...(map.get(c.part) ?? []), c]);
    return [...map.entries()];
  }, []);

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (s.length < 3) return null;
    const ch = CHAPTERS.filter((c) => `${c.title} ${c.summary} ${JSON.stringify(c.blocks)}`.toLowerCase().includes(s)).slice(0, 12);
    const gl = GLOSSARY.filter((g) => `${g.term} ${g.def}`.toLowerCase().includes(s)).slice(0, 12);
    return { ch, gl };
  }, [q]);

  const idx = CHAPTERS.findIndex((c) => c.id === current);
  const chapter = current === "glossario" ? null : CHAPTERS[idx];

  return (
    <div className="flex min-h-0 flex-1">
      <aside className={cx("w-72 shrink-0 flex-col border-r border-line bg-bg max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 max-lg:mt-[53px]", tocOpen ? "flex" : "hidden lg:flex")}>
        <div className="border-b border-line p-3">
          <label className="flex items-center gap-2 rounded-md border border-line bg-surface-2 px-2 focus-within:border-ember">
            <Search className="size-3.5 text-faint" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca nei capitoli e nel glossario" className="min-h-8 w-full bg-transparent text-[12.5px] outline-none placeholder:text-faint" />
          </label>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-3">
          {hits ? (
            <div className="space-y-4">
              <div>
                <p className="kicker mb-1">Capitoli</p>
                {hits.ch.length === 0 && <p className="text-[12px] text-faint">Nessun capitolo.</p>}
                {hits.ch.map((c) => (
                  <TocItem key={c.id} on={c.id === current} onClick={() => { setCurrent(c.id); setTocOpen(false); }}>
                    {c.title}
                  </TocItem>
                ))}
              </div>
              <div>
                <p className="kicker mb-1">Glossario</p>
                {hits.gl.map((g) => (
                  <div key={g.term} className="mb-2 text-[12px]">
                    <p className="font-medium">{g.term}</p>
                    <p className="text-muted">{g.def}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {parts.map(([part, chs]) => (
                <div key={part}>
                  <p className="kicker mb-1">{part}</p>
                  {chs.map((c) => (
                    <TocItem key={c.id} on={c.id === current} onClick={() => { setCurrent(c.id); setTocOpen(false); }}>
                      {c.title}
                    </TocItem>
                  ))}
                </div>
              ))}
              <div>
                <p className="kicker mb-1">Riferimento</p>
                <TocItem on={current === "glossario"} onClick={() => { setCurrent("glossario"); setTocOpen(false); }}>
                  Glossario ({GLOSSARY.length} voci)
                </TocItem>
              </div>
            </div>
          )}
        </nav>
      </aside>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <button onClick={() => setTocOpen(!tocOpen)} className="sticky top-0 z-30 flex w-full items-center gap-2 border-b border-line bg-bg/95 px-4 py-2 text-[12.5px] backdrop-blur lg:hidden">
          <BookOpen className="size-4 text-ember" /> Indice
        </button>
        {chapter ? (
          <ChapterView key={chapter.id} c={chapter} onSim={() => set({ view: "sim" })} />
        ) : (
          <Glossary />
        )}
        {chapter && (
          <div className="mx-auto flex max-w-3xl justify-between gap-3 px-6 pb-16">
            {idx > 0 ? (
              <button onClick={() => setCurrent(CHAPTERS[idx - 1].id)} className="flex items-center gap-1 text-left text-[13px] text-muted hover:text-ember">
                <ChevronLeft className="size-4" /> {CHAPTERS[idx - 1].title}
              </button>
            ) : (
              <span />
            )}
            {idx < CHAPTERS.length - 1 && (
              <button onClick={() => setCurrent(CHAPTERS[idx + 1].id)} className="flex items-center gap-1 text-right text-[13px] text-muted hover:text-ember">
                {CHAPTERS[idx + 1].title} <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TocItem({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cx("block w-full rounded-md px-2 py-1 text-left text-[13px] leading-snug", on ? "bg-ember-soft text-ember" : "text-muted hover:bg-surface-2 hover:text-fg")}>
      {children}
    </button>
  );
}

function ChapterView({ c, onSim }: { c: Chapter; onSim: () => void }) {
  const lb = useLightbox();
  const figures = useMemo(() => {
    const used = new Set<string>();
    const res: Record<number, GalleryItem[]> = {};
    c.blocks.forEach((b, i) => {
      if (b.t !== "figures") return;
      const items = byTopic(b.topic, used, 3);
      items.forEach((g) => used.add(g.id));
      res[i] = items;
    });
    return res;
  }, [c]);
  const hero = useMemo(() => {
    for (const t of c.topics) {
      const [g] = byTopic(t, new Set(Object.values(figures).flat().map((x) => x.id)), 1, 1000);
      if (g) return g;
    }
    return null;
  }, [c, figures]);

  return (
    <article className="fade-in">
      {hero && (
        <div className="relative h-56 overflow-hidden sm:h-72">
          <img src={hero.src} alt={hero.title} className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
          <p className="absolute right-3 bottom-2 max-w-sm text-right text-[10.5px] text-muted">
            {hero.title} · {hero.credit}
          </p>
        </div>
      )}
      <div className={cx("mx-auto max-w-3xl px-6 pb-10", hero ? "-mt-20 relative" : "pt-10")}>
        <p className="kicker text-ember">{c.part}</p>
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-2 font-serif text-xl text-muted italic">{c.kicker}</p>
        <p className="mt-5 border-l-2 border-ember pl-4 text-[15.5px] leading-relaxed">{c.summary}</p>
        <div className="mt-6 space-y-4 text-[15.5px] leading-[1.75]">
          {c.blocks.map((b, i) => (
            <BlockView key={i} b={b} figures={figures[i]} onOpen={(items, k) => lb.open(items, k)} />
          ))}
        </div>
        {c.sources.length > 0 && (
          <div className="mt-10 border-t border-line pt-4">
            <p className="kicker mb-2">Fonti</p>
            <ol className="list-decimal space-y-1 pl-5 text-[12.5px] text-muted">
              {c.sources.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}
        <button onClick={onSim} className="mt-8 rounded-md border border-line-strong px-3 py-2 text-[13px] hover:border-ember hover:text-ember">
          Torna al simulatore e prova →
        </button>
      </div>
      <Lightbox state={lb.state} onClose={lb.close} onIndex={(i) => lb.set((s) => (s ? { ...s, i } : s))} />
    </article>
  );
}

function BlockView({ b, figures, onOpen }: { b: Block; figures?: GalleryItem[]; onOpen: (items: GalleryItem[], i: number) => void }) {
  switch (b.t) {
    case "p":
      return <p>{b.text}</p>;
    case "h":
      return <h2 className="pt-6 font-serif text-[26px] leading-tight">{b.text}</h2>;
    case "formula":
      return (
        <figure className="my-5 rounded-lg border border-line bg-surface p-4 text-center">
          <p className="num text-[17px] text-ember">{b.tex}</p>
          <figcaption className="mt-1 text-[12.5px] text-muted">{b.caption}</figcaption>
        </figure>
      );
    case "table":
      return (
        <figure className="my-5 overflow-x-auto">
          <table className="w-full border-collapse text-[13px] leading-snug">
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} className="border-b-2 border-line-strong px-2 py-1.5 text-left font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-b border-line">
                  {r.map((cell, j) => (
                    <td key={j} className={cx("px-2 py-1.5 align-top", j === 0 ? "text-fg" : "text-muted")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <figcaption className="mt-1.5 text-[12px] text-faint">{b.caption}</figcaption>
        </figure>
      );
    case "list":
      return (
        <ul className="list-disc space-y-1.5 pl-5 marker:text-ember">
          {b.items.map((it) => (
            <li key={it}>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="my-6 border-l-2 border-ember pl-5 font-serif text-[21px] leading-snug italic">
          «{b.text.replace(/^«|»$/g, "")}»<footer className="mt-1 font-sans text-[12.5px] not-italic text-muted">— {b.who}</footer>
        </blockquote>
      );
    case "fact":
      return (
        <div className="my-4 flex items-baseline gap-4 rounded-lg bg-surface-2 px-4 py-3">
          <span className="num shrink-0 text-[22px] text-ember">{b.value}</span>
          <span className="text-[13.5px] text-muted">{b.label}</span>
        </div>
      );
    case "figures":
      return figures && figures.length ? <Figure items={figures} onOpen={(i) => onOpen(figures, i)} /> : null;
  }
}

function Glossary() {
  const groups = useMemo(() => {
    const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "it"));
    const m = new Map<string, typeof GLOSSARY>();
    for (const g of sorted) {
      const k = g.term[0].toUpperCase();
      m.set(k, [...(m.get(k) ?? []), g]);
    }
    return [...m.entries()];
  }, []);
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <p className="kicker text-ember">Riferimento</p>
      <h1 className="font-serif text-5xl">Glossario</h1>
      <div className="mt-8 space-y-8">
        {groups.map(([k, items]) => (
          <section key={k}>
            <h2 className="mb-2 font-serif text-3xl text-ember">{k}</h2>
            <dl className="space-y-3">
              {items.map((g) => (
                <div key={g.term}>
                  <dt className="font-medium">{g.term}</dt>
                  <dd className="text-[14px] leading-relaxed text-muted">{g.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
