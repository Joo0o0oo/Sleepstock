import { TrendingUp, TrendingDown, Minus, BadgeCheck } from "lucide-react";
import type { PlaceWithStats } from "@/hooks/use-mapa";

type Props = {
  places: PlaceWithStats[];
  onSelect: (place: PlaceWithStats) => void;
};

export function TopPlacesRail({ places, onSelect }: Props) {
  const top = [...places]
    .filter((p) => (p.stats?.total_dreams ?? 0) > 0)
    .sort((a, b) => (b.stats?.total_dreams ?? 0) - (a.stats?.total_dreams ?? 0))
    .slice(0, 10);

  return (
    <div className="pointer-events-auto">
      <div className="px-5 pb-2 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-700/70">
          Lugares más soñados
        </p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-4" style={{ scrollbarWidth: "none" }}>
        {top.map((p, i) => {
          const last = p.stats?.dreams_last_7d ?? 0;
          const prev = p.stats?.dreams_prev_7d ?? 0;
          const delta = prev === 0 ? (last > 0 ? 100 : 0) : Math.round(((last - prev) / prev) * 100);
          const trendIcon = delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />;
          const trendColor = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-violet-500/70";
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p)}
              className="shrink-0 w-[180px] rounded-2xl bg-white p-3 text-left ring-1 ring-[rgba(107,33,217,0.12)] shadow-sm hover:ring-[rgba(107,33,217,0.28)] transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-fuchsia-600">#{i + 1}</span>
                {p.is_verified && <BadgeCheck className="h-3.5 w-3.5 text-fuchsia-500" />}
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-bold text-foreground">{p.name}</p>
              <p className="text-[10px] text-violet-700/70">{p.neighborhood?.name ?? "CABA"}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-violet-900">
                  {(p.stats?.total_dreams ?? 0).toLocaleString("es-AR")} sueños
                </span>
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${trendColor}`}>
                  {trendIcon}
                  {delta > 0 ? "+" : ""}{delta}%
                </span>
              </div>
            </button>
          );
        })}
        {top.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-xs text-violet-700/70 ring-1 ring-[rgba(107,33,217,0.12)]">
            Sin sueños todavía.
          </div>
        )}
      </div>
    </div>
  );
}
