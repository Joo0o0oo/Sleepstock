export type AssetCategory = "Crypto" | "Commodity" | "Inconsciente";

export type MercadoAsset = {
  id: string; // coingecko id or "sleep-coin"
  ticker: string;
  name: string;
  category: AssetCategory;
  iconName:
    | "bitcoin"
    | "ethereum"
    | "solana"
    | "gold"
    | "sleep";
  interpretacion: string;
  fallbackPrice: number;
  fallbackSparkline: number[];
};

function makeSparkline(seed: number, base: number, vol = 0.04): number[] {
  const arr: number[] = [];
  let v = base;
  let s = seed;
  for (let i = 0; i < 24; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280 - 0.5;
    v = v * (1 + r * vol);
    arr.push(Number(v.toFixed(4)));
  }
  return arr;
}

export const MERCADO_CATALOG: MercadoAsset[] = [
  {
    id: "bitcoin",
    ticker: "BTC",
    name: "Bitcoin",
    category: "Crypto",
    iconName: "bitcoin",
    interpretacion:
      "Bitcoin representa el arquetipo del oro digital: voluntad indomable, escasez y la pulsión por trascender los límites del sistema. En el sueño, simboliza la búsqueda de soberanía interior.",
    fallbackPrice: 68000,
    fallbackSparkline: makeSparkline(11, 68000),
  },
  {
    id: "ethereum",
    ticker: "ETH",
    name: "Ethereum",
    category: "Crypto",
    iconName: "ethereum",
    interpretacion:
      "Ethereum encarna la mente constructora: la red de ideas que se ejecutan solas. Soñar con ETH evoca la necesidad de programar nuevas estructuras internas y dejar atrás contratos viejos.",
    fallbackPrice: 3500,
    fallbackSparkline: makeSparkline(23, 3500),
  },
  {
    id: "solana",
    ticker: "SOL",
    name: "Solana",
    category: "Crypto",
    iconName: "solana",
    interpretacion:
      "Solana es el sol acelerado, la velocidad de la consciencia cuando deja de dudar. Aparece en sueños donde se requiere acción inmediata y luminosa.",
    fallbackPrice: 160,
    fallbackSparkline: makeSparkline(41, 160, 0.06),
  },
  {
    id: "pax-gold",
    ticker: "PAXG",
    name: "PAX Gold",
    category: "Commodity",
    iconName: "gold",
    interpretacion:
      "El oro es el Sí-Mismo junguiano: el centro estable de la psique. PAXG evoca el deseo de anclar valor en algo que ningún sueño pueda disolver.",
    fallbackPrice: 2400,
    fallbackSparkline: makeSparkline(67, 2400, 0.02),
  },
  {
    id: "sleep-coin",
    ticker: "SLP",
    name: "Sleep Coin",
    category: "Inconsciente",
    iconName: "sleep",
    interpretacion:
      "Sleep Coin es la moneda nativa del inconsciente: cotiza más alto cuando soñás lúcido y se estabiliza con el promedio de los activos del mundo despierto. Un puente entre dos economías.",
    fallbackPrice: 12.4,
    fallbackSparkline: makeSparkline(99, 12.4, 0.05),
  },
];

export function getAssetByTicker(ticker: string): MercadoAsset | undefined {
  return MERCADO_CATALOG.find((a) => a.ticker.toLowerCase() === ticker.toLowerCase());
}

/**
 * Sleep Coin algorithmic pricing.
 * Base = normalized weighted average of real assets, scaled to ~$10-$20.
 * Modifier from client (e.g. +20% if lucid dream active in localStorage).
 */
export function computeSleepCoinPrice(
  realAssets: { ticker: string; price: number; change24h: number }[],
  modifier = 1,
): { price: number; change24h: number; sparkline: number[] } {
  if (realAssets.length === 0) {
    return { price: 12.4 * modifier, change24h: 0, sparkline: makeSparkline(99, 12.4 * modifier) };
  }
  // Normalize each real price by its catalog fallback so all sit near 1.0
  const norm = realAssets.map((a) => {
    const meta = MERCADO_CATALOG.find((c) => c.ticker === a.ticker);
    return meta ? a.price / meta.fallbackPrice : 1;
  });
  const avgNorm = norm.reduce((s, n) => s + n, 0) / norm.length;
  const price = Number((12.4 * avgNorm * modifier).toFixed(3));
  const change24h = Number(
    (realAssets.reduce((s, a) => s + a.change24h, 0) / realAssets.length).toFixed(2),
  );
  const sparkline = makeSparkline(Math.floor(price * 100) || 99, price, 0.05);
  return { price, change24h, sparkline };
}