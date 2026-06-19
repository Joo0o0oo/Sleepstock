import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const InputSchema = z.object({
  dreams: z
    .array(
      z.object({
        title: z.string(),
        analysis: z.string(),
        date: z.string(),
      }),
    )
    .min(1)
    .max(50),
  catalog: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        category: z.string(),
      }),
    )
    .min(1)
    .max(20),
});

export type SubconsciousAnalysis = {
  lectura: string;
  necesidades: { label: string; percentage: number; descripcion: string }[];
  simbolos: { nombre: string; icono: string }[];
  recomendaciones: { id: string; afinidad: number; motivo: string }[];
};

export const analyzeSubconscious = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }): Promise<SubconsciousAnalysis> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY no configurada");

    const dreamsText = data.dreams
      .map((d, i) => `${i + 1}. [${d.date}] ${d.title}\n${d.analysis.slice(0, 400)}`)
      .join("\n\n");
    const catalogText = data.catalog
      .map((c) => `- ${c.id} | ${c.category} | ${c.title}`)
      .join("\n");

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Sos un analista junguiano del subconsciente para la app Sleep Stock. Recibís un set de sueños y un catálogo curado. Devolvés SIEMPRE JSON válido con esta forma exacta: {\"lectura\":string (2-3 párrafos breves en español, tono poético-reflexivo, sin diagnóstico médico), \"necesidades\":[{\"label\":string corto (ej 'Libertad','Conexión','Reconocimiento'), \"percentage\":entero 0-100, \"descripcion\":frase corta}] (4-5 items, ordenados desc), \"simbolos\":[{\"nombre\":string, \"icono\":una palabra emoji-friendly como 'water','fire','moon','bird','mirror','forest','star','door','eye','key'}] (4-6 items), \"recomendaciones\":[{\"id\":id EXACTO del catálogo, \"afinidad\":entero 60-99, \"motivo\":frase de 1-2 líneas conectando con el patrón onírico}] (elegí 4-6 ids relevantes, ordenados por afinidad desc)}. NUNCA inventes ids fuera del catálogo.",
          },
          {
            role: "user",
            content: `SUEÑOS DEL USUARIO:\n${dreamsText}\n\nCATÁLOGO DISPONIBLE (usá solo estos ids):\n${catalogText}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Demasiadas consultas. Esperá un momento.");
      if (res.status === 402)
        throw new Error("Sin créditos de IA. Recargá en Settings → Workspace → Usage.");
      throw new Error(`Error IA ${res.status}: ${t.slice(0, 200)}`);
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      const validIds = new Set(data.catalog.map((c) => c.id));
      parsed.recomendaciones = (parsed.recomendaciones ?? []).filter((r: any) =>
        validIds.has(r.id),
      );
      return parsed as SubconsciousAnalysis;
    } catch {
      throw new Error("Respuesta IA inválida");
    }
  });