import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MERCADO_CATALOG, computeSleepCoinPrice } from "./mercado-catalog";

export type LiveAsset = {
  ticker: string;
  price: number;
  change24h: number;
  sparkline: number[];
};

function reduceSparkline(prices: number[], target = 24): number[] {
  if (!prices.length) return [];
  if (prices.length <= target) return prices.map((p) => Number(p.toFixed(4)));
  const step = prices.length / target;
  const out: number[] = [];
  for (let i = 0; i < target; i++) {
    out.push(Number(prices[Math.floor(i * step)].toFixed(4)));
  }
  return out;
}

const InputSchema = z.object({ modifier: z.number().min(0.1).max(3).optional() });

export const fetchMercadoData = createServerFn({ method: "POST" })
  .inputValidator(InputSchema)
  .handler(async ({ data }): Promise<LiveAsset[]> => {
    const real = MERCADO_CATALOG.filter((a) => a.id !== "sleep-coin");
    const ids = real.map((a) => a.id).join(",");

    let live: LiveAsset[] = [];
    try {
      const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h`;
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json: Array<{
          id: string;
          current_price: number;
          price_change_percentage_24h: number | null;
          sparkline_in_7d?: { price: number[] };
        }> = await res.json();
        live = real.map((meta) => {
          const row = json.find((r) => r.id === meta.id);
          if (!row) {
            return {
              ticker: meta.ticker,
              price: meta.fallbackPrice,
              change24h: 0,
              sparkline: meta.fallbackSparkline,
            };
          }
          const spark = row.sparkline_in_7d?.price?.length
            ? reduceSparkline(row.sparkline_in_7d.price, 24)
            : meta.fallbackSparkline;
          return {
            ticker: meta.ticker,
            price: row.current_price ?? meta.fallbackPrice,
            change24h: row.price_change_percentage_24h ?? 0,
            sparkline: spark,
          };
        });
      } else {
        throw new Error(`coingecko ${res.status}`);
      }
    } catch (e) {
      console.error("mercado fetch fallback:", e);
      live = real.map((meta) => ({
        ticker: meta.ticker,
        price: meta.fallbackPrice,
        change24h: 0,
        sparkline: meta.fallbackSparkline,
      }));
    }

    const slp = computeSleepCoinPrice(live, data.modifier ?? 1);
    return [
      ...live,
      {
        ticker: "SLP",
        price: slp.price,
        change24h: slp.change24h,
        sparkline: slp.sparkline,
      },
    ];
  });