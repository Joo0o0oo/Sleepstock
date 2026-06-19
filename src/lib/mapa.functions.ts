import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { classifyDream } from "@/lib/mapa-ai-mock";

const CreateDreamInput = z.object({
  body: z.string().min(5).max(2000),
  authorName: z.string().min(1).max(40),
  placeId: z.string().uuid().nullable().optional(),
  neighborhoodId: z.string().uuid().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export const createDreamAtLocation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateDreamInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const classification = classifyDream(data.body);

    // Resolve category id.
    const { data: cat } = await supabaseAdmin
      .from("dream_categories")
      .select("id")
      .eq("slug", classification.categorySlug)
      .maybeSingle();

    // If place provided, fall back coords from place.
    let lat = data.lat ?? null;
    let lng = data.lng ?? null;
    let neighborhoodId = data.neighborhoodId ?? null;
    if (data.placeId) {
      const { data: place } = await supabaseAdmin
        .from("places")
        .select("lat, lng, neighborhood_id")
        .eq("id", data.placeId)
        .maybeSingle();
      if (place) {
        lat = lat ?? place.lat;
        lng = lng ?? place.lng;
        neighborhoodId = neighborhoodId ?? place.neighborhood_id;
      }
    } else if (neighborhoodId) {
      const { data: nb } = await supabaseAdmin
        .from("neighborhoods")
        .select("lat, lng")
        .eq("id", neighborhoodId)
        .maybeSingle();
      if (nb) {
        lat = lat ?? nb.lat;
        lng = lng ?? nb.lng;
      }
    }

    const { data: dream, error } = await supabaseAdmin
      .from("dreams")
      .insert({
        body: data.body,
        author_name: data.authorName,
        place_id: data.placeId ?? null,
        neighborhood_id: neighborhoodId,
        lat,
        lng,
        category_id: cat?.id ?? null,
        emotion: classification.emotion,
        keywords: classification.keywords,
        source: "user",
      })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: dream.id, classification };
  });
