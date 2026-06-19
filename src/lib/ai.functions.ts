import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const interpretDream = createServerFn({ method: "POST" })
  .inputValidator(z.object({ relato: z.string().min(3).max(4000) }))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY no configurada");

    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "Sos Sleep BOT, un intérprete de sueños cálido y poético. Analizá el relato del sueño del usuario en español. Devolvé markdown con secciones: **Título del sueño** (en mayúsculas, 3-4 palabras evocadoras), **Símbolos clave** (lista), **Interpretación** (2 párrafos, perspectiva junguiana accesible, sin jerga), **Mensaje del subconsciente** (1 frase) y **Sugerencia** (1 frase). Cerrá con un disclaimer breve de que es contenido reflexivo, no diagnóstico.",
          },
          { role: "user", content: data.relato },
        ],
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Demasiadas consultas. Esperá un momento.");
      if (res.status === 402) throw new Error("Sin créditos de IA. Recargá en Settings → Workspace → Usage.");
      throw new Error(`Error IA ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const text: string = json?.choices?.[0]?.message?.content ?? "";
    const titleMatch = text.match(/\*\*Título del sueño\*\*:?\s*([^\n*]+)/i);
    const title = (titleMatch?.[1] || "SUEÑO SIN TÍTULO").trim().toUpperCase().slice(0, 40);
    return { analysis: text, title };
  });

export const scanSubconscious = createServerFn({ method: "POST" })
  .inputValidator(z.object({ imageBase64: z.string().min(100).max(8_000_000) }))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY no configurada");

    const body = JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            "Sos un scanner del subconsciente de la app Sleep Stock. Analizá los rasgos faciales de la persona (mirada, tensión, simetría, microexpresiones, energía) y devolvé una lectura lúdico-reflexiva en español, NO un diagnóstico médico. El valor del subconsciente se mide en SLEEP COIN (SLP), nuestra criptomoneda interna: a mayor claridad y resonancia, mayor valor. Respondé SIEMPRE con JSON válido con esta forma exacta: {\"score\":0-100, \"sleep_coin\":number (entre 12.00 y 999.99, con 2 decimales), \"variacion\":number (entre -25 y 25, con 2 decimales, simula cambio % del valor), \"claridad\":0-100, \"carga_emocional\":0-100, \"simetria\":0-100, \"arquetipo\":\"string corto\", \"estado\":\"frase corta\", \"rasgos\":[\"3 a 5 rasgos faciales detectados, frases muy cortas\"], \"narrativa\":\"párrafo poético de 3-4 frases conectando los rasgos con el valor en Sleep Coin\"}",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Escaneá mi subconsciente." },
            { type: "image_url", image_url: { url: data.imageBase64 } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    // Retry transient upstream errors (502/503/504) with backoff.
    let res: Response | null = null;
    let lastText = "";
    const models = ["google/gemini-2.5-flash", "google/gemini-3-flash-preview"];
    outer: for (const model of models) {
      const reqBody = body.replace(
        '"model":"google/gemini-2.5-flash"',
        `"model":"${model}"`,
      );
      for (let attempt = 0; attempt < 3; attempt++) {
        res = await fetch(GATEWAY, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: reqBody,
        });
        if (res.ok) break outer;
        lastText = await res.text();
        if (![502, 503, 504].includes(res.status)) break outer;
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
      }
    }

    if (!res || !res.ok) {
      const status = res?.status ?? 0;
      if (status === 429) throw new Error("Demasiadas consultas. Esperá un momento.");
      if (status === 402) throw new Error("Sin créditos de IA.");
      if ([502, 503, 504].includes(status))
        throw new Error("El servicio de IA está saturado. Probá de nuevo en unos segundos.");
      throw new Error(`Error IA ${status}: ${lastText.slice(0, 200)}`);
    }
    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content);
    } catch {
      return {
        score: 50,
        sleep_coin: 128.5,
        variacion: 2.4,
        claridad: 50,
        carga_emocional: 50,
        simetria: 50,
        arquetipo: "El Soñador",
        estado: "Reflexivo",
        rasgos: ["Mirada serena", "Tensión leve", "Energía estable"],
        narrativa: content,
      };
    }
  });