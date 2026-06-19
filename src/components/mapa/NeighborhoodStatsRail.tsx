import { useMemo } from "react";
import { ExternalLink } from "lucide-react";
import type { PlaceWithStats } from "@/hooks/use-mapa";

type NeighborhoodAgg = {
  slug: string;
  name: string;
  total: number;
  last7: number;
  prev7: number;
  places: number;
};

function redditSearchUrl(query: string) {
  return `https://www.reddit.com/r/buenosaires/search/?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance`;
}

export function NeighborhoodStatsRail({ places }: { places: PlaceWithStats[] }) {
  const aggregated = useMemo<NeighborhoodAgg[]>(() => {
    const map = new Map<string, NeighborhoodAgg>();
    for (const p of places) {
      const slug = p.neighborhood?.slug;
      const name = p.neighborhood?.name;
      if (!slug || !name) continue;
      const total = p.stats?.total_dreams ?? 0;
      const last7 = p.stats?.dreams_last_7d ?? 0;
      const prev7 = p.stats?.dreams_prev_7d ?? 0;
      const prev = map.get(slug) ?? { slug, name, total: 0, last7: 0, prev7: 0, places: 0 };
      prev.total += total;
      prev.last7 += last7;
      prev.prev7 += prev7;
      prev.places += 1;
      map.set(slug, prev);
    }
    return [...map.values()]
      .filter((n) => n.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [places]);

  if (aggregated.length === 0) return null;

  return (
    <div className="pointer-events-auto">
      <div className="flex items-end justify-between px-5 pb-2 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-violet-700/70">
          Barrios que más sueñan
        </p>
        <span className="text-[10px] text-violet-500/70">Tocá para ver en Reddit</span>
      </div>
      <div className="flex gap-3 overflow-x-auto px-5 pb-3" style={{ scrollbarWidth: "none" }}>
        {aggregated.map((n, i) => {
          const delta = n.prev7 === 0 ? (n.last7 > 0 ? 100 : 0) : Math.round(((n.last7 - n.prev7) / n.prev7) * 100);
          return (
            <a
              key={n.slug}
              href={redditSearchUrl(`${n.name} sueño`)}
              target="_blank"
              rel="noopener noreferrer"
              className="group shrink-0 w-[170px] rounded-2xl bg-gradient-to-br from-violet-50 to-fuchsia-50 p-3 text-left ring-1 ring-[rgba(107,33,217,0.12)] shadow-sm transition hover:ring-[rgba(107,33,217,0.35)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-fuchsia-600">#{i + 1}</span>
                <ExternalLink className="h-3 w-3 text-violet-500/60 transition group-hover:text-violet-700" />
              </div>
              <p className="mt-1 line-clamp-1 text-sm font-bold text-foreground">{n.name}</p>
              <p className="text-[10px] text-violet-700/70">{n.places} lugar{n.places === 1 ? "" : "es"}</p>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-lg font-extrabold leading-none text-violet-900">{n.total}</p>
                  <p className="text-[9px] uppercase tracking-wider text-violet-500/70">sueños</p>
                </div>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    delta > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : delta < 0
                      ? "bg-rose-100 text-rose-700"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {delta > 0 ? "+" : ""}{delta}% 7d
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
