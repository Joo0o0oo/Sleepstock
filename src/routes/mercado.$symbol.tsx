import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Star, TrendingDown, TrendingUp } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { getAssetByTicker } from "@/lib/mercado-catalog";
import { fetchMercadoData } from "@/lib/mercado.functions";
import {
  buyAsset,
  getLucidModifier,
  sellAsset,
  toggleWatch,
  useMercadoStore,
} from "@/lib/mercado-store";
import { AssetIcon, Sparkline, formatPrice } from "./mercado.index";

export const Route = createFileRoute("/mercado/$symbol")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.symbol.toUpperCase()} — Mercado Onírico` },
      {
        name: "description",
        content: `Cotización y lectura junguiana de ${params.symbol.toUpperCase()}.`,
      },
    ],
  }),
  loader: ({ params }) => {
    const asset = getAssetByTicker(params.symbol);
    if (!asset) throw notFound();
    return { asset };
  },
  notFoundComponent: () => (
    <MobileShell>
      <div className="px-5 pt-20 text-center">
        <p className="text-sm text-muted-foreground">Activo no encontrado.</p>
        <Link to="/mercado" className="mt-3 inline-block text-sm font-semibold text-primary">
          Volver al mercado
        </Link>
      </div>
    </MobileShell>
  ),
  component: AssetDetail,
});

function AssetDetail() {
  const { asset } = Route.useLoaderData();
  const router = useRouter();
  const store = useMercadoStore();
  const starred = store.watchlist.includes(asset.ticker);
  const holding = store.holdings[asset.ticker];

  const { data } = useQuery({
    queryKey: ["mercado", "live"],
    queryFn: () => fetchMercadoData({ data: { modifier: getLucidModifier() } }),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  const live = data?.find((a) => a.ticker === asset.ticker);
  const price = live?.price ?? asset.fallbackPrice;
  const change = live?.change24h ?? 0;
  const sparkline = live?.sparkline ?? asset.fallbackSparkline;
  const up = change >= 0;
  const high = Math.max(...sparkline);
  const low = Math.min(...sparkline);

  const [mode, setMode] = useState<"buy" | "sell" | null>(null);
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const n = parseFloat(amount);
    if (mode === "buy") buyAsset(asset.ticker, n, price);
    if (mode === "sell") sellAsset(asset.ticker, n, price);
    setAmount("");
    setMode(null);
  };

  const pl =
    holding && holding.avgPrice > 0
      ? ((price - holding.avgPrice) / holding.avgPrice) * 100
      : 0;

  return (
    <MobileShell>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-background/80 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.history.back()}
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </button>
          <div>
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground">
              {asset.category.toUpperCase()}
            </p>
            <h1 className="text-lg font-bold text-primary">{asset.name}</h1>
          </div>
        </div>
        <button
          onClick={() => toggleWatch(asset.ticker)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow"
          aria-label="Watchlist"
        >
          <Star className={`h-4 w-4 ${starred ? "fill-primary text-primary" : "text-primary"}`} />
        </button>
      </header>

      <div className="px-5 pt-2 pb-32 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-card p-5 ring-1 ring-border shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center gap-3">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <AssetIcon name={asset.iconName} />
            </div>
            <div>
              <p className="text-[10px] tracking-[0.25em] text-muted-foreground">
                {asset.ticker} · USD
              </p>
              <p className="text-3xl font-bold text-primary">{formatPrice(price)}</p>
            </div>
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold ${
              up ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {up ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {up ? "+" : ""}
            {change.toFixed(2)}% · 24h
          </div>
          <Sparkline data={sparkline} width={340} height={120} up={up} className="mt-4 w-full" />
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5">
          <Stat label="Máx 24h" value={formatPrice(high)} />
          <Stat label="Mín 24h" value={formatPrice(low)} />
          <Stat
            label="Volumen"
            value={`$${(price * 1_250_000).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
          <Stat
            label="Cap. mercado"
            value={`$${(price * 18_000_000).toLocaleString("en-US", { maximumFractionDigits: 0 })}`}
          />
        </div>

        {holding && (
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border shadow-[var(--shadow-soft)]">
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground">TU POSICIÓN</p>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <p className="text-lg font-bold text-primary">
                  {holding.shares.toFixed(4)} {asset.ticker}
                </p>
                <p className="text-xs text-muted-foreground">
                  Precio promedio: {formatPrice(holding.avgPrice)}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${pl >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {pl >= 0 ? "+" : ""}
                {pl.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-card p-5 ring-1 ring-border shadow-[var(--shadow-soft)]">
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground">
            LECTURA DEL SUBCONSCIENTE
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {asset.interpretacion}
          </p>
        </div>

        {mode ? (
          <div className="space-y-3 rounded-2xl bg-card p-4 ring-1 ring-border shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold text-primary">
              {mode === "buy" ? "Comprar" : "Vender"} {asset.ticker}
            </p>
            <input
              type="number"
              inputMode="decimal"
              step="0.0001"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Cantidad"
              autoFocus
              className="w-full rounded-xl bg-background px-4 py-3 text-sm ring-1 ring-border outline-none focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">
              Total:{" "}
              {formatPrice((parseFloat(amount) || 0) * price)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMode(null);
                  setAmount("");
                }}
                className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-50"
                style={{ background: "var(--gradient-primary)" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <button
              onClick={() => setMode("buy")}
              className="flex-1 rounded-2xl py-3.5 text-sm font-bold text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              Comprar
            </button>
            <button
              onClick={() => setMode("sell")}
              disabled={!holding}
              className="flex-1 rounded-2xl bg-card py-3.5 text-sm font-bold text-primary ring-1 ring-border disabled:opacity-50"
            >
              Vender
            </button>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
      <p className="text-[10px] tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-primary">{value}</p>
    </div>
  );
}