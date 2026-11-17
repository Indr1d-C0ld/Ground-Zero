import { useMemo, useState } from "react";
import { GALLERY, TOPIC_LABEL } from "@/data/gallery";
import { Lightbox, useLightbox } from "@/components/Lightbox";
import { Chip } from "@/components/ui";

export function Gallery() {
  const [topic, setTopic] = useState<string>("");
  const lb = useLightbox();
  const topics = useMemo(() => {
    const count = new Map<string, number>();
    for (const g of GALLERY) for (const t of g.topics) count.set(t, (count.get(t) ?? 0) + 1);
    return [...count.entries()].sort((a, b) => (TOPIC_LABEL[a[0]] ?? a[0]).localeCompare(TOPIC_LABEL[b[0]] ?? b[0], "it"));
  }, []);
  const items = useMemo(() => GALLERY.filter((g) => !topic || g.topics.includes(topic)).sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999)), [topic]);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl px-5 py-8">
        <p className="kicker text-ember">Archivio iconografico</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Immagini storiche e tecniche</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-muted">
          {GALLERY.length} immagini di pubblico dominio o con licenza libera: archivi del governo statunitense (NARA, DOE, Dipartimento della Difesa), Wikimedia Commons. Credito e licenza sotto ogni immagine.
        </p>
        <div className="mt-5 flex flex-wrap gap-1.5">
          <Chip active={!topic} onClick={() => setTopic("")}>
            Tutte
          </Chip>
          {topics.map(([t, n]) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>
              {TOPIC_LABEL[t] ?? t} <span className="text-faint">{n}</span>
            </Chip>
          ))}
        </div>
        <div className="mt-6 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <figure key={g.id} className="mb-4 break-inside-avoid">
              <button onClick={() => lb.open(items, i)} className="block w-full overflow-hidden rounded-lg bg-surface-2">
                <img src={g.src} alt={g.title} loading="lazy" className="w-full transition-transform duration-500 hover:scale-[1.03]" />
              </button>
              <figcaption className="mt-1.5 text-[12.5px] leading-snug">
                <span className="font-medium">{g.title}</span>
                {g.year ? <span className="num text-faint"> · {g.year}</span> : null}
                <span className="block text-[11.5px] text-muted">{g.caption}</span>
                <span className="block text-[10.5px] text-faint">
                  {g.credit} · {g.license}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <Lightbox state={lb.state} onClose={lb.close} onIndex={(i) => lb.set((s) => (s ? { ...s, i } : s))} />
    </div>
  );
}
