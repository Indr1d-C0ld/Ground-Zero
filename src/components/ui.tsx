import { useId, useState, type ReactNode } from "react";
import { ChevronDown, Info } from "lucide-react";
import { useStore } from "@/state/store";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function Section({
  title,
  kicker,
  children,
  defaultOpen = true,
  chapter,
  right,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  chapter?: string;
  right?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-line">
      <div className="flex items-center gap-2 px-4 pt-3 pb-2">
        <button onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
          <ChevronDown className={cx("size-3.5 shrink-0 text-faint transition-transform", !open && "-rotate-90")} />
          <span className="min-w-0">
            {kicker && <span className="kicker block">{kicker}</span>}
            <span className="block truncate text-[13.5px] font-medium">{title}</span>
          </span>
        </button>
        {right}
        {chapter && <ChapterLink id={chapter} />}
      </div>
      {open && <div className="fade-in space-y-3 px-4 pb-4">{children}</div>}
    </section>
  );
}

export function ChapterLink({ id, label }: { id: string; label?: string }) {
  const open = useStore((s) => s.openChapter);
  return (
    <button
      onClick={() => open(id)}
      title="Apri il capitolo dell'enciclopedia"
      className="inline-flex items-center gap-1 rounded px-1 text-[11px] text-faint hover:text-ember"
    >
      <Info className="size-3.5" />
      {label}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  display,
  hint,
  log,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  display: ReactNode;
  hint?: ReactNode;
  log?: boolean;
}) {
  const id = useId();
  const toPos = (v: number) => (log ? ((Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * 1000 : v);
  const fromPos = (p: number) => (log ? 10 ** (Math.log10(min) + (p / 1000) * (Math.log10(max) - Math.log10(min))) : p);
  const pos = toPos(Math.min(Math.max(value, min), max));
  const pct = log ? pos / 10 : ((pos - min) / (max - min)) * 100;
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className="num text-fg">{display}</span>
      </label>
      <input
        id={id}
        type="range"
        className="rng"
        style={{ ["--p" as string]: `${pct}%` }}
        min={log ? 0 : min}
        max={log ? 1000 : max}
        step={log ? 1 : step}
        value={pos}
        onChange={(e) => onChange(fromPos(Number(e.target.value)))}
      />
      {hint && <p className="mt-0.5 text-[11.5px] leading-snug text-faint">{hint}</p>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  cols,
  size = "md",
}: {
  value: T;
  options: { id: T; label: ReactNode; title?: string }[];
  onChange: (v: T) => void;
  cols?: number;
  size?: "sm" | "md";
}) {
  return (
    <div
      className="grid gap-1 rounded-lg border border-line bg-surface-2/60 p-1"
      style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          className={cx(
            "rounded-md px-2 leading-tight transition-colors",
            size === "sm" ? "min-h-7 text-[11.5px]" : "min-h-8 text-[12.5px]",
            value === o.id ? "bg-surface-3 text-fg shadow-sm ring-1 ring-line-strong" : "text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onChange, label, hint }: { on: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-start gap-3 text-left">
      <span className={cx("mt-0.5 inline-flex h-4.5 w-8 shrink-0 items-center rounded-full p-0.5 transition-colors", on ? "bg-ember" : "bg-line-strong")}>
        <span className={cx("size-3.5 rounded-full bg-fg transition-transform", on && "translate-x-3.5")} />
      </span>
      <span className="min-w-0">
        <span className="block text-[12.5px]">{label}</span>
        {hint && <span className="block text-[11.5px] leading-snug text-faint">{hint}</span>}
      </span>
    </button>
  );
}

export function Stat({ k, v, sub, tone }: { k: ReactNode; v: ReactNode; sub?: ReactNode; tone?: "ember" | "rad" | "fall" }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11.5px] text-muted">{k}</dt>
      <dd className={cx("num text-[15px] leading-tight", tone === "ember" ? "text-ember" : tone === "rad" ? "text-rad" : tone === "fall" ? "text-fall" : "text-fg")}>{v}</dd>
      {sub && <dd className="text-[11px] leading-snug text-faint">{sub}</dd>}
    </div>
  );
}

export function Chip({ active, onClick, children, title }: { active?: boolean; onClick?: () => void; children: ReactNode; title?: string }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] transition-colors",
        active ? "border-ember bg-ember-soft text-ember" : "border-line text-muted hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "ghost",
  title,
  className,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid" | "outline";
  title?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[12.5px] transition-colors disabled:opacity-40",
        variant === "solid" && "bg-ember font-medium text-ink hover:brightness-110",
        variant === "outline" && "border border-line-strong hover:border-ember hover:text-ember",
        variant === "ghost" && "text-muted hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function NumberField({ value, onChange, suffix, min, max, step = 1, className }: { value: number; onChange: (v: number) => void; suffix?: string; min?: number; max?: number; step?: number; className?: string }) {
  return (
    <span className={cx("inline-flex items-center rounded-md border border-line bg-surface-2 focus-within:border-ember", className)}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(v);
        }}
        className="num w-full min-w-0 bg-transparent px-2 py-1 text-[12.5px] outline-none"
      />
      {suffix && <span className="pr-2 text-[11px] text-faint">{suffix}</span>}
    </span>
  );
}

export function Callout({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "warn" }) {
  return (
    <div className={cx("rounded-lg border p-3 text-[12.5px] leading-relaxed", tone === "warn" ? "border-ember/40 bg-ember-soft" : "border-line bg-surface-2/60 text-muted")}>
      {children}
    </div>
  );
}
