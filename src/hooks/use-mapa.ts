import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Neighborhood = {
  id: string; slug: string; name: string; lat: number; lng: number; description: string | null;
};

export type Place = {
  id: string; slug: string; name: string; neighborhood_id: string | null;
  lat: number; lng: number; is_verified: boolean; category: string | null;
  description: string | null; cover_url: string | null;
};

export type DreamCategory = {
  id: string; slug: string; name: string; emoji: string; color: string;
};

export type Dream = {
  id: string; body: string; author_name: string | null;
  place_id: string | null; neighborhood_id: string | null;
  lat: number | null; lng: number | null;
  category_id: string | null; emotion: string | null;
  keywords: string[]; created_at: string;
};

export type PlaceStat = {
  place_id: string;
  total_dreams: number;
  dreams_last_7d: number;
  dreams_prev_7d: number;
  top_category_id: string | null;
  top_keywords: string[];
  featured_dream_id: string | null;
  most_recent_dream_id: string | null;
  most_liked_dream_id: string | null;
};

export type PlaceWithStats = Place & {
  stats: PlaceStat | null;
  neighborhood: Pick<Neighborhood, "name" | "slug"> | null;
};

export function useMapaData() {
  const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState<PlaceWithStats[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [categories, setCategories] = useState<DreamCategory[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pl, st, nb, cats] = await Promise.all([
        supabase.from("places").select("*, neighborhood:neighborhoods(name,slug)"),
        supabase.from("place_stats").select("*"),
        supabase.from("neighborhoods").select("*").order("name"),
        supabase.from("dream_categories").select("*"),
      ]);
      if (pl.error) throw pl.error;
      if (st.error) throw st.error;
      if (nb.error) throw nb.error;
      if (cats.error) throw cats.error;
      const statsMap = new Map((st.data ?? []).map((s) => [s.place_id, s as PlaceStat]));
      const placesEnriched: PlaceWithStats[] = (pl.data ?? []).map((p: any) => ({
        ...p,
        stats: statsMap.get(p.id) ?? null,
        neighborhood: p.neighborhood ?? null,
      }));
      setPlaces(placesEnriched);
      setNeighborhoods(nb.data ?? []);
      setCategories(cats.data ?? []);
    } catch (e: any) {
      console.error("[useMapaData]", e);
      setError(e.message ?? "Error cargando datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { loading, error, places, neighborhoods, categories, reload };
}

export async function fetchDreamsForPlace(placeId: string, limit = 20): Promise<Dream[]> {
  const { data, error } = await supabase
    .from("dreams")
    .select("*")
    .eq("place_id", placeId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.error(error); return []; }
  return (data ?? []) as Dream[];
}

export async function fetchDreamById(id: string): Promise<Dream | null> {
  const { data, error } = await supabase.from("dreams").select("*").eq("id", id).maybeSingle();
  if (error) { console.error(error); return null; }
  return (data ?? null) as Dream | null;
}

export async function fetchTopDreamForNeighborhood(slug: string): Promise<Dream | null> {
  const { data: nb } = await supabase.from("neighborhoods").select("id").eq("slug", slug).maybeSingle();
  if (!nb) return null;
  const { data } = await supabase
    .from("dreams")
    .select("*")
    .eq("neighborhood_id", nb.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as Dream | null;
}
