import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, Check, Images, Library, Link2, Map as MapIcon, Moon, ScrollText, Sun } from "lucide-react";
import { SimContext, useSimulationEngine } from "@/hooks/useSimulation";
import { useWeather } from "@/hooks/useWeather";
import { encodeScenario, useStore, type View } from "@/state/store";
import { Simulator } from "@/components/sim/Simulator";
import { Encyclopedia } from "@/components/views/Encyclopedia";
import { Archive } from "@/components/views/Archive";
import { History } from "@/components/views/History";
import { Gallery } from "@/components/views/Gallery";
import { cx } from "@/components/ui";

const VIEWS: { id: View; label: string; icon: typeof MapIcon }[] = [
  { id: "sim", label: "Simulatore", icon: MapIcon },
  { id: "enciclopedia", label: "Enciclopedia", icon: BookOpen },
  { id: "archivio", label: "Archivio armi", icon: Library },
  { id: "storia", label: "Storia e dati", icon: ScrollText },
  { id: "galleria", label: "Immagini", icon: Images },
];

export function App() {
  const sim = useSimulationEngine();
  useWeather();
  const view = useStore((s) => s.view);
  const set = useStore((s) => s.set);
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <SimContext.Provider value={sim}>
      <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
        <header className="no-print flex shrink-0 items-center gap-2 border-b sm:gap-4 border-line px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo />
            <div className="min-w-0 max-sm:hidden">
              <p className="font-serif text-[21px] leading-none tracking-tight">Ground Zero</p>
              <p className="hidden truncate text-[11px] text-muted md:block">Osservatorio sugli effetti delle armi nucleari · stime educative, non previsioni</p>
            </div>
          </div>
          <nav className="ml-auto flex min-w-0 gap-0.5 overflow-x-auto">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => set({ view: v.id })}
                className={cx("flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px]", view === v.id ? "bg-surface-2 text-fg ring-1 ring-line-strong" : "text-muted hover:text-fg")}
              >
                <v.icon className={cx("size-4", view === v.id && "text-ember")} />
                <span className="max-md:hidden">{v.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-1">
            <ShareButton />
            <IconBtn title={theme === "dark" ? "Tema chiaro" : "Tema scuro"} onClick={() => set({ theme: theme === "dark" ? "light" : "dark" })}>
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </IconBtn>
          </div>
        </header>
        <main className="flex min-h-0 flex-1 flex-col">
          <div className={cx("min-h-0 flex-1 flex-col", view === "sim" ? "flex" : "hidden")}>
            <Simulator />
          </div>
          {view === "enciclopedia" && <Encyclopedia />}
          {view === "archivio" && <Archive />}
          {view === "storia" && <History />}
          {view === "galleria" && <Gallery />}
        </main>
      </div>
    </SimContext.Provider>
  );
}

function IconBtn({ children, title, onClick }: { children: ReactNode; title: string; onClick: () => void }) {
  return (
    <button title={title} onClick={onClick} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
      {children}
    </button>
  );
}

function ShareButton() {
  const [ok, setOk] = useState(false);
  return (
    <IconBtn
      title="Copia il link dello scenario"
      onClick={() => {
        const s = useStore.getState();
        const hash = `#s=${encodeScenario({ dets: s.dets, activeId: s.activeId, env: s.env, pop: s.pop, thr: s.thr })}`;
        history.replaceState(null, "", hash);
        void navigator.clipboard?.writeText(location.href).catch(() => undefined);
        setOk(true);
        window.setTimeout(() => setOk(false), 1600);
      }}
    >
      {ok ? <Check className="size-4 text-ember" /> : <Link2 className="size-4" />}
    </IconBtn>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="size-7 shrink-0" aria-hidden>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="var(--line-strong)" />
      <circle cx="16" cy="16" r="10" fill="none" stroke="var(--ember)" strokeOpacity="0.5" />
      <circle cx="16" cy="16" r="5.5" fill="none" stroke="var(--ember)" />
      <circle cx="16" cy="16" r="2" fill="var(--ember)" />
    </svg>
  );
}
