import PresenceTracker from "./components/PresenceTracker";
import ConsumoMirror from "./components/ConsumoMirror";
import { ShieldToggle } from "./components/ShieldMode";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-20 sm:px-8 sm:py-28">
      <header className="flex items-start justify-between">
        <div className="space-y-4">
          <p className="eyebrow">Jc App · Auditor de presencia</p>
          <h1 className="max-w-prose font-serif text-4xl leading-tight text-slate-800 dark:text-slate-100 sm:text-5xl">
            No estás aquí para hacer más.
            <br />
            Estás aquí para estar.
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-slate-500">
            Un espejo honesto contra la dispersión y la fatiga de decisión.
            Protege tu presencia: Elisa, Nugget y desconectar en Lomas Verdes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <hr className="hairline my-20" />

      <PresenceTracker />

      <hr className="hairline my-20" />

      <ConsumoMirror />

      <hr className="hairline my-20" />

      <ShieldToggle />

      <footer className="mt-28">
        <p className="text-xs leading-relaxed text-slate-400">
          Suelta el control. Lo que importa no cabe en una métrica.
        </p>
      </footer>
    </main>
  );
}
