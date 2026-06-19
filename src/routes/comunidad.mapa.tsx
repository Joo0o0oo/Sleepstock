import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, MapIcon, Moon } from "lucide-react";
import { MapaCABA } from "@/components/mapa/MapaCABA";
import { PlaceSheet } from "@/components/mapa/PlaceSheet";
import { CollapsibleStatsPanel } from "@/components/mapa/CollapsibleStatsPanel";
import { useMapaData, type PlaceWithStats } from "@/hooks/use-mapa";

export const Route = createFileRoute("/comunidad/mapa")({
  head: () => ({
    meta: [
      { title: "Mapa de Sueños — Sleep Stock" },
      { name: "description", content: "Cómo se distribuyen los sueños en Buenos Aires." },
    ],
  }),
  component: MapaPage,
});

function MapaPage() {
  const { loading, error, places, categories } = useMapaData();
  const [selected, setSelected] = useState<PlaceWithStats | null>(null);

  const totals = useMemo(() => {
    const total = places.reduce((acc, p) => acc + (p.stats?.total_dreams ?? 0), 0);
    const last7 = places.reduce((acc, p) => acc + (p.stats?.dreams_last_7d ?? 0), 0);
    const activePlaces = places.filter((p) => (p.stats?.total_dreams ?? 0) > 0).length;
    return { total, last7, activePlaces };
  }, [places]);

  return (
    <div
      className="fixed inset-0 flex flex-col text-foreground"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), radial-gradient(120% 80% at 80% 100%, rgba(192,38,211,0.08), transparent 60%), #F7F5FB",
      }}
    >
      <header className="z-20 flex items-center gap-3 border-b border-[rgba(107,33,217,0.14)] bg-white/80 px-4 py-3 backdrop-blur-xl">
        <Link
          to="/comunidad"
          className="grid h-9 w-9 place-items-center rounded-full bg-violet-100 text-violet-800 ring-1 ring-violet-300/40 hover:bg-violet-200"
          aria-label="Volver"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
            Sueños compartidos
          </p>
          <h1 className="flex items-center gap-1.5 text-base font-bold text-foreground">
            <MapIcon className="h-4 w-4 text-fuchsia-500" />
            Mapa de Buenos Aires
          </h1>
        </div>
        <div className="hidden flex-col items-end text-right xs:flex sm:flex">
          <span className="text-[10px] uppercase tracking-wider text-violet-700/70">Total</span>
          <span className="text-sm font-extrabold text-violet-900">
            {totals.total.toLocaleString("es-AR")}
          </span>
        </div>
      </header>

      <div className="z-10 flex items-center gap-2 border-b border-[rgba(107,33,217,0.10)] bg-white/60 px-4 py-2 backdrop-blur-xl">
        <SummaryPill label="Sueños" value={totals.total} />
        <SummaryPill label="Últ. 7d" value={totals.last7} />
        <SummaryPill label="Lugares" value={totals.activePlaces} />
      </div>

      <div className="relative flex-1 overflow-hidden">
        <MapaCABA places={places} onSelectPlace={setSelected} />
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-semibold text-violet-700">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-violet-200">
              <Moon className="h-3 w-3 animate-pulse" /> Cargando mapa…
            </span>
          </div>
        )}
        {error && (
          <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 ring-1 ring-rose-300/60">
            {error}
          </div>
        )}
        <CollapsibleStatsPanel places={places} onSelect={setSelected} />
      </div>

      <PlaceSheet
        place={selected}
        categories={categories}
        onOpenChange={(open) => { if (!open) setSelected(null); }}
      />
    </div>
  );
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl bg-white px-3 py-1.5 text-center ring-1 ring-[rgba(107,33,217,0.12)] shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-violet-700/70">{label}</p>
      <p className="text-sm font-extrabold leading-tight text-violet-900">
        {value.toLocaleString("es-AR")}
      </p>
    </div>
  );
}
