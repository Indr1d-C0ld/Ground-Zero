import { useMemo, useState } from "react";
import { ARSENALS, TESTS, TIMELINE } from "@/data/encyclopedia";
import { useStore } from "@/state/store";
import { formatInt, formatYield } from "@/lib/format";
import { Chip, Segmented, cx } from "@/components/ui";

const COUNTRIES = [
  { k: "US", label: "Stati Uniti", color: "#5b8bd6" },
  { k: "RU", label: "URSS / Russia", color: "#d65b5b" },
  { k: "UK", label: "Regno Unito", color: "#8b6fd6" },
  { k: "FR", label: "Francia", color: "#4fb3c9" },
  { k: "CN", label: "Cina", color: "#e0a640" },
  { k: "IN", label: "India", color: "#e07a3f" },
  { k: "PK", label: "Pakistan", color: "#4fa36b" },
  { k: "IL", label: "Israele", color: "#b0b0b0" },
  { k: "KP", label: "Corea del Nord", color: "#c96fa8" },
] as const;

const TAGS = {
  storia: { label: "Storia", color: "var(--muted)" },
  test: { label: "Test", color: "var(--ember)" },
  trattato: { label: "Trattati", color: "var(--rad)" },
  incidente: { label: "Crisi e incidenti", color: "var(--blast)" },
  arsenale: { label: "Arsenali", color: "var(--emp)" },
} as const;

type Tab = "cronologia" | "arsenali" | "test";

export function History() {
  const [tab, setTab] = useState<Tab>("cronologia");
  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <p className="kicker text-ember">Storia e dati</p>
        <h1 className="font-serif text-4xl sm:text-5xl">Ottant'anni di era nucleare</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-muted">
          Dalla scoperta della radioattività ai trattati di oggi: la cronologia degli eventi, l'andamento degli arsenali e le detonazioni che hanno fatto la storia dei test.
        </p>
        <div className="mt-6 max-w-md">
          <Segmented value={tab} onChange={setTab} options={[{ id: "cronologia", label: "Cronologia" }, { id: "arsenali", label: "Arsenali" }, { id: "test", label: "Detonazioni" }]} />
        </div>
        <div className="mt-8">
          {tab === "cronologia" && <Timeline />}
          {tab === "arsenali" && <Arsenals />}
          {tab === "test" && <Tests />}
        </div>
      </div>
    </div>
  );
}

function Timeline() {
  const [tags, setTags] = useState<Set<string>>(new Set(Object.keys(TAGS)));
  const items = TIMELINE.filter((t) => tags.has(t.tag));
  let lastDecade = 0;
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {Object.entries(TAGS).map(([k, v]) => (
          <Chip
            key={k}
            active={tags.has(k)}
            onClick={() => {
              const n = new Set(tags);
              if (n.has(k)) n.delete(k);
              else n.add(k);
              setTags(n);
            }}
          >
            <span className="size-2 rounded-full" style={{ background: v.color }} />
            {v.label}
          </Chip>
        ))}
      </div>
      <ol className="relative border-l border-line-strong pl-6">
        {items.map((t) => {
          const decade = Math.floor(t.year / 10) * 10;
          const showDecade = decade !== lastDecade;
          lastDecade = decade;
          return (
            <li key={`${t.year}${t.title}`} className="relative pb-5">
              {showDecade && <p className="num -ml-6 mb-3 pl-6 font-serif text-2xl text-faint">{decade}</p>}
              <span className="absolute top-[0.45rem] -left-[29px] size-2.5 rounded-full ring-4 ring-bg" style={{ background: TAGS[t.tag].color, top: showDecade ? "3.2rem" : undefined }} />
              <p className="num text-[12px] text-faint">{t.date ?? t.year}</p>
              <p className="font-medium">{t.title}</p>
              <p className="max-w-2xl text-[13.5px] leading-relaxed text-muted">{t.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Arsenals() {
  const [hover, setHover] = useState<number | null>(null);
  const W = 900;
  const H = 380;
  const m = { l: 56, r: 16, t: 16, b: 30 };
  const years = ARSENALS.map((a) => a.year);
  const totals = ARSENALS.map((a) => COUNTRIES.reduce((s, c) => s + a[c.k], 0));
  const maxT = Math.max(...totals);
  const x0 = Math.min(...years);
  const x1 = Math.max(...years);
  const sx = (y: number) => m.l + ((y - x0) / (x1 - x0)) * (W - m.l - m.r);
  const sy = (v: number) => H - m.b - (v / (maxT * 1.05)) * (H - m.t - m.b);
  const stacks = useMemo(() => {
    const acc = ARSENALS.map(() => 0);
    return COUNTRIES.map((c) => {
      const lower = [...acc];
      ARSENALS.forEach((a, i) => (acc[i] += a[c.k]));
      const upper = [...acc];
      return { c, lower, upper };
    });
  }, []);
  const hi = hover != null ? ARSENALS[hover] : ARSENALS[ARSENALS.length - 1];
  const hiTotal = COUNTRIES.reduce((s, c) => s + hi[c.k], 0);
  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onPointerLeave={() => setHover(null)}>
          {[0, 10_000, 20_000, 30_000, 40_000, 50_000, 60_000, 70_000].filter((v) => v <= maxT * 1.05).map((v) => (
            <g key={v}>
              <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" />
              <text x={m.l - 6} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--faint)" className="num">
                {formatInt(v)}
              </text>
            </g>
          ))}
          {years.filter((y) => y % 10 === 0 || y === 1945).map((y) => (
            <text key={y} x={sx(y)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--faint)" className="num">
              {y}
            </text>
          ))}
          {stacks.map(({ c, lower, upper }) => (
            <path
              key={c.k}
              d={`M${years.map((y, i) => `${sx(y)},${sy(upper[i])}`).join("L")}L${[...years].reverse().map((y, j) => `${sx(y)},${sy(lower[years.length - 1 - j])}`).join("L")}Z`}
              fill={c.color}
              fillOpacity="0.8"
              stroke={c.color}
            />
          ))}
          {ARSENALS.map((a, i) => (
            <rect key={a.year} x={sx(a.year) - 12} y={m.t} width={24} height={H - m.t - m.b} fill="transparent" onPointerEnter={() => setHover(i)} />
          ))}
          {hover != null && <line x1={sx(hi.year)} x2={sx(hi.year)} y1={m.t} y2={H - m.b} stroke="var(--fg)" strokeOpacity="0.6" />}
        </svg>
        <div>
          <p className="num font-serif text-4xl">{hi.year}</p>
          <p className="num text-2xl text-ember">{formatInt(hiTotal)}</p>
          <p className="mb-3 text-[12px] text-muted">testate stimate nel mondo</p>
          <ul className="space-y-1 text-[13px]">
            {COUNTRIES.filter((c) => hi[c.k] > 0).map((c) => (
              <li key={c.k} className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm" style={{ background: c.color }} />
                <span className="flex-1 text-muted">{c.label}</span>
                <span className="num">{formatInt(hi[c.k])}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 max-w-3xl text-[12.5px] leading-relaxed text-faint">
        Scorte militari di testate stimate dalla Federation of American Scientists (serie storica 2026, che rivede Norris e Kristensen 2013), escluse le testate ritirate in attesa di smantellamento: per questo il picco del 1986 è di circa 64 500 e non di 70 000. Le cifre di Israele, Corea del Nord e dei primi anni di India e Pakistan restano incerte.
      </p>
    </div>
  );
}

function Tests() {
  const [sort, setSort] = useState<"date" | "yield">("date");
  const [country, setCountry] = useState<string>("");
  const chooseYield = useStore((s) => s.patchDet);
  const activeId = useStore((s) => s.activeId);
  const set = useStore((s) => s.set);
  const countries = Array.from(new Set(TESTS.map((t) => t.country)));
  const rows = TESTS.filter((t) => !country || t.country === country).sort((a, b) => (sort === "date" ? a.date.localeCompare(b.date) : b.yieldKt - a.yieldKt));
  const W = 900;
  const H = 300;
  const m = { l: 50, r: 16, t: 14, b: 26 };
  const yr = (d: string) => Number(d.slice(0, 4)) + Number(d.slice(5, 7) || 6) / 12;
  const sx = (y: number) => m.l + ((y - 1944) / (2020 - 1944)) * (W - m.l - m.r);
  const sy = (kt: number) => H - m.b - ((Math.log10(Math.max(kt, 0.001)) + 1) / 6) * (H - m.t - m.b);
  const colorOf = (c: string) => COUNTRIES.find((x) => c.startsWith(x.label.split(" ")[0]) || x.label.includes(c))?.color ?? "var(--muted)";
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {[0.1, 1, 10, 100, 1000, 10_000, 100_000].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={sy(v)} y2={sy(v)} stroke="var(--line)" />
            <text x={m.l - 6} y={sy(v) + 4} textAnchor="end" fontSize="11" fill="var(--faint)" className="num">
              {formatYield(v)}
            </text>
          </g>
        ))}
        {[1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((y) => (
          <text key={y} x={sx(y)} y={H - 8} textAnchor="middle" fontSize="11" fill="var(--faint)" className="num">
            {y}
          </text>
        ))}
        {TESTS.map((t) => (
          <circle
            key={t.name + t.date}
            cx={sx(yr(t.date))}
            cy={sy(t.yieldKt)}
            r={hover === t.name ? 7 : 4.5}
            fill={colorOf(t.country)}
            fillOpacity={country && t.country !== country ? 0.15 : 0.85}
            stroke="var(--bg)"
            onPointerEnter={() => setHover(t.name)}
            onPointerLeave={() => setHover(null)}
          >
            <title>
              {t.name} ({t.country}, {t.date}): {formatYield(t.yieldKt)}
            </title>
          </circle>
        ))}
      </svg>
      <p className="mb-4 text-[12px] text-faint">Potenza (scala logaritmica) delle detonazioni notevoli. Passa sopra un punto per il nome.</p>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Chip active={!country} onClick={() => setCountry("")}>
          Tutti
        </Chip>
        {countries.map((c) => (
          <Chip key={c} active={country === c} onClick={() => setCountry(c)}>
            {c}
          </Chip>
        ))}
        <span className="ml-auto w-48">
          <Segmented size="sm" value={sort} onChange={setSort} options={[{ id: "date", label: "Per data" }, { id: "yield", label: "Per potenza" }]} />
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="text-left text-[11.5px] text-faint">
            <tr className="border-b border-line-strong">
              <th className="py-1.5 font-normal">Nome</th>
              <th className="font-normal">Data</th>
              <th className="font-normal">Paese</th>
              <th className="font-normal">Tipo</th>
              <th className="text-right font-normal">Potenza</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.name + t.date} className={cx("border-b border-line align-top", hover === t.name && "bg-surface-2")}>
                <td className="py-2 pr-3">
                  <span className="font-medium">{t.name}</span>
                  <span className="block max-w-md text-[12px] text-muted">{t.note}</span>
                  <span className="block text-[11.5px] text-faint">{t.site}</span>
                </td>
                <td className="num pr-3 whitespace-nowrap text-muted">{t.date}</td>
                <td className="pr-3 whitespace-nowrap">
                  <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: colorOf(t.country) }} />
                  {t.country}
                </td>
                <td className="pr-3 text-muted">{t.type}</td>
                <td className="num text-right whitespace-nowrap">{formatYield(t.yieldKt)}</td>
                <td className="pl-3">
                  <button
                    className="text-[11.5px] whitespace-nowrap text-ember hover:underline"
                    onClick={() => {
                      chooseYield(activeId, { yieldKt: t.yieldKt });
                      set({ view: "sim", fitToken: useStore.getState().fitToken + 1 });
                    }}
                  >
                    usa questa potenza →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
