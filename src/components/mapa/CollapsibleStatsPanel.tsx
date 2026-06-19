import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, BarChart3 } from "lucide-react";
import { NeighborhoodStatsRail } from "./NeighborhoodStatsRail";
import { TopPlacesRail } from "./TopPlacesRail";
import type { PlaceWithStats } from "@/hooks/use-mapa";

type Props = {
  places: PlaceWithStats[];
  onSelect: (place: PlaceWithStats) => void;
};

export function CollapsibleStatsPanel({ places, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  const totalDreams = places.reduce((a, p) => a + (p.stats?.total_dreams ?? 0), 0);
  const activePlaces = places.filter((p) => (p.stats?.total_dreams ?? 0) > 0).length;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-t-3xl bg-white/95 shadow-[0_-8px_30px_-12px_rgba(107,33,217,0.25)] ring-1 ring-[rgba(107,33,217,0.14)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-2.5"
          aria-expanded={open}
          aria-label={open ? "Ocultar estadísticas" : "Mostrar estadísticas"}
        >
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-100 text-violet-700">
              <BarChart3 className="h-3.5 w-3.5" />
            </span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700/70">
                Estadísticas
              </p>
              <p className="text-[11px] font-semibold text-violet-900">
                {totalDreams.toLocaleString("es-AR")} sueños · {activePlaces} lugares
              </p>
            </div>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="grid h-7 w-7 place-items-center rounded-full bg-violet-50 text-violet-700"
          >
            <ChevronUp className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="max-h-[55vh] overflow-y-auto pb-3">
                <NeighborhoodStatsRail places={places} />
                <TopPlacesRail places={places} onSelect={onSelect} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
