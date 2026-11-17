import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";

export function useLightbox() {
  const [state, setState] = useState<{ items: GalleryItem[]; i: number } | null>(null);
  return { state, open: (items: GalleryItem[], i: number) => setState({ items, i }), close: () => setState(null), set: setState };
}

export function Lightbox({ state, onClose, onIndex }: { state: { items: GalleryItem[]; i: number } | null; onClose: () => void; onIndex: (i: number) => void }) {
  useEffect(() => {
    if (!state) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex((state.i + 1) % state.items.length);
      if (e.key === "ArrowLeft") onIndex((state.i - 1 + state.items.length) % state.items.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [state, onClose, onIndex]);
  if (!state) return null;
  const g = state.items[state.i];
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col bg-black/92 p-4 text-[#ece6db]" onClick={onClose}>
      <div className="flex justify-end">
        <button className="grid size-10 place-items-center rounded-full hover:bg-white/10" onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        {state.items.length > 1 && (
          <button className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/10" onClick={() => onIndex((state.i - 1 + state.items.length) % state.items.length)}>
            <ChevronLeft />
          </button>
        )}
        <img src={g.src} alt={g.title} className="max-h-full min-h-0 max-w-full rounded object-contain" />
        {state.items.length > 1 && (
          <button className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-white/10" onClick={() => onIndex((state.i + 1) % state.items.length)}>
            <ChevronRight />
          </button>
        )}
      </div>
      <div className="mx-auto mt-3 max-w-3xl text-center" onClick={(e) => e.stopPropagation()}>
        <p className="font-serif text-xl">
          {g.title}
          {g.year ? <span className="text-white/50"> · {g.year}</span> : null}
        </p>
        <p className="mt-1 text-[13px] text-white/75">{g.caption}</p>
        <p className="mt-1 text-[11.5px] text-white/45">
          {g.credit} · {g.license}
          {g.source && (
            <a href={g.source} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 underline">
              fonte <ExternalLink className="size-3" />
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

export function Figure({ items, onOpen }: { items: GalleryItem[]; onOpen: (i: number) => void }) {
  if (!items.length) return null;
  return (
    <div className={items.length === 1 ? "my-6" : "my-6 grid gap-3 sm:grid-cols-2"}>
      {items.map((g, i) => (
        <figure key={g.id} className={items.length === 3 && i === 0 ? "sm:col-span-2" : ""}>
          <button onClick={() => onOpen(i)} className="block w-full overflow-hidden rounded-lg bg-black/20">
            <img
              src={g.src}
              alt={g.title}
              loading="lazy"
              className={g.w && g.w < 700 ? "mx-auto max-h-[26rem] object-contain" : "max-h-[26rem] w-full object-cover transition-transform duration-500 hover:scale-[1.02]"}
            />
          </button>
          <figcaption className="mt-1.5 text-[12px] leading-snug opacity-80">
            <span className="font-medium">{g.title}.</span> {g.caption}
            <span className="block text-[10.5px] opacity-60">
              {g.credit} · {g.license}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
