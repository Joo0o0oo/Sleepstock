import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { supabase } from "@/integrations/supabase/client";
import { CategoryChip } from "@/components/mapa/CategoryChip";
import type { Dream, DreamCategory, Place, Neighborhood, PlaceStat } from "@/hooks/use-mapa";

export const Route = createFileRoute("/comunidad/lugar/$slug")({
  component: LugarPage,
});

function LugarPage() {
  const { slug } = Route.useParams();
  const [place, setPlace] = useState<Place | null>(null);
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [stats, setStats] = useState<PlaceStat | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [categories, setCategories] = useState<DreamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: p } = await supabase.from("places").select("*").eq("slug", slug).maybeSingle();
      if (cancelled) return;
      if (!p) { setMissing(true); setLoading(false); return; }
      setPlace(p as Place);
      const [{ data: nb }, { data: st }, { data: ds }, { data: cats }] = await Promise.all([
        p.neighborhood_id
          ? supabase.from("neighborhoods").select("*").eq("id", p.neighborhood_id).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("place_stats").select("*").eq("place_id", p.id).maybeSingle(),
        supabase.from("dreams").select("*").eq("place_id", p.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("dream_categories").select("*"),
      ]);
      if (cancelled) return;
      setNeighborhood(nb as Neighborhood | null);
      setStats(st as PlaceStat | null);
      setDreams((ds ?? []) as Dream[]);
      setCategories((cats ?? []) as DreamCategory[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (missing) throw notFound();

  const topCat = categories.find((c) => c.id === stats?.top_category_id) ?? null;

  return (
    <MobileShell>
      <div className="min-h-screen text-white" style={{ background: "linear-gradient(180deg,#15082b 0%,#0d0716 100%)" }}>
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 backdrop-blur-xl" style={{ background: "rgba(13,7,22,0.7)" }}>
          <Link to="/comunidad/mapa" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-[0.25em] text-violet-300/80">Perfil del lugar</p>
            <h1 className="flex items-center gap-1.5 truncate text-base font-bold">
              {place?.name ?? "…"}
              {place?.is_verified && <BadgeCheck className="h-4 w-4 text-fuchsia-300" />}
            </h1>
          </div>
        </header>

        {loading || !place ? (
          <div className="grid h-[60vh] place-items-center text-sm text-violet-200/70">Cargando…</div>
        ) : (
          <>
            <section className="px-5 pt-4">
              <div className="rounded-3xl bg-gradient-to-br from-violet-700/30 to-fuchsia-500/15 p-5 ring-1 ring-violet-300/20">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-violet-300/80">
                  <MapPin className="h-3 w-3" />
                  {neighborhood?.name ?? "Buenos Aires"}
                </div>
                <h2 className="mt-2 text-2xl font-bold text-white">{place.name}</h2>
                {place.description && <p className="mt-2 text-sm text-violet-100/85">{place.description}</p>}

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <Mini label="Sueños" value={(stats?.total_dreams ?? 0).toLocaleString("es-AR")} />
                  <Mini label="7 días" value={String(stats?.dreams_last_7d ?? 0)} />
                  <Mini label="Emoción" value={topCat ? topCat.emoji : "—"} />
                </div>
              </div>
            </section>

            {(stats?.top_keywords?.length ?? 0) > 0 && (
              <section className="px-5 pt-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/80">Palabras frecuentes</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {stats!.top_keywords.map((k) => (
                    <span key={k} className="rounded-full bg-violet-500/15 px-2.5 py-1 text-[11px] font-medium text-violet-100 ring-1 ring-violet-400/20">{k}</span>
                  ))}
                </div>
              </section>
            )}

            <section className="px-5 pt-6 pb-32">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em] text-violet-300/80">Sueños en este lugar</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-fuchsia-300/90">
                  <Sparkles className="h-3 w-3" /> {dreams.length}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {dreams.map((d) => {
                  const cat = categories.find((c) => c.id === d.category_id);
                  return (
                    <article key={d.id} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                      <p className="text-[13px] leading-relaxed text-violet-50/95">"{d.body}"</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-violet-300/80">
                        {cat && <CategoryChip category={cat} />}
                        {d.author_name && <span>@{d.author_name}</span>}
                        <span>· {new Date(d.created_at).toLocaleDateString("es-AR")}</span>
                      </div>
                    </article>
                  );
                })}
                {dreams.length === 0 && (
                  <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-violet-200/70 ring-1 ring-white/10">
                    Todavía nadie soñó acá.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/8 px-2 py-2 text-center ring-1 ring-white/10">
      <p className="text-[9px] uppercase tracking-[0.15em] text-violet-300/70">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
    </div>
  );
}
