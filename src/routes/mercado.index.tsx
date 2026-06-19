import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bitcoin,
  Coins,
  Hexagon,
  Search,
  Sparkles,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { MERCADO_CATALOG, type MercadoAsset } from "@/lib/mercado-catalog";
import { fetchMercadoData, type LiveAsset } from "@/lib/mercado.functions";
import { getLucidModifier, toggleWatch, useMercadoStore } from "@/lib/mercado-store";

export const Route = createFileRoute("/mercado/")({
  head: () => ({
    meta: [
      { title: "Mercado — Sleep Stock" },
      {
        name: "description",
        content: "Bolsa onírica: cotización en vivo de los símbolos del inconsciente.",
      },
    ],
  }),
  component: MercadoPage,
});

const CATEGORIES = ["Todos", "Crypto", "Commodity", "Inconsciente", "Watchlist"] as const;
type Filter = (typeof CATEGORIES)[number];

function MercadoPage() {
  const [filter, setFilter] = useState<Filter>("Todos");
  const [q, setQ] = useState("");
  const store = useMercadoStore();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["mercado", "live"],
    queryFn: () => fetchMercadoData({ data: { modifier: getLucidModifier() } }),
    staleTime: 60_000,
    refetchInterval: 90_000,
  });

  const liveByTicker = useMemo(() => {
    const m = new Map<string, LiveAsset>();
    (data ?? []).forEach((a) => m.set(a.ticker, a));
    return m;
  }, [data]);

  const rows = useMemo(() => {
    return MERCADO_CATALOG.map((meta) => {
      const live = liveByTicker.get(meta.ticker);
      return {
        meta,
        price: live?.price ?? meta.fallbackPrice,
        change24h: live?.change24h ?? 0,
        sparkline: live?.sparkline ?? meta.fallbackSparkline,
      };
    });
  }, [liveByTicker]);

  const filtered = rows.filter((r) => {
    if (filter === "Watchlist" && !store.watchlist.includes(r.meta.ticker)) return false;
    if (filter !== "Todos" && filter !== "Watchlist" && r.meta.category !== filter) return false;
    if (q) {
      const s = q.toLowerCase();
      if (
        !r.meta.name.toLowerCase().includes(s) &&
        !r.meta.ticker.toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const avgChange =
    rows.length > 0 ? rows.reduce((s, r) => s + r.change24h, 0) / rows.length : 0;
  const indexValue = 1000 * (1 + avgChange / 100);

  return (
    <MobileShell>
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-background/80 px-5 py-4 backdrop-blur-xl">
        <Link to="/" className="grid h-9 w-9 place-items-center rounded-full bg-white shadow">
          <ArrowLeft className="h-4 w-4 text-primary" />
        </Link>
        <div>
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground">BOLSA ONÍRICA</p>
          <h1 className="text-lg font-bold text-primary">Mercado</h1>
        </div>
      </header>

      <div className="px-5 pt-2 pb-32 space-y-5">
        <IndexCard value={indexValue} change={avgChange} sparkline={rows[0]?.sparkline ?? []} />

        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 transition ${
                filter === c
                  ? "bg-primary text-primary-foreground ring-primary shadow-[var(--shadow-glow)]"
                  : "bg-card text-muted-foreground ring-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar activo o ticker…"
            className="w-full rounded-2xl bg-card pl-10 pr-4 py-3 text-sm ring-1 ring-border outline-none focus:ring-primary"
          />
        </div>

        {isError && (
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border text-sm">
            No pudimos cargar cotizaciones en vivo.{" "}
            <button onClick={() => refetch()} className="font-semibold text-primary">
              Reintentar
            </button>
          </div>
        )}

        <div className="space-y-2.5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
            : filtered.length === 0
              ? (
                <div className="rounded-2xl bg-card p-6 ring-1 ring-border text-center text-sm text-muted-foreground">
                  {filter === "Watchlist"
                    ? "Tu watchlist está vacío. Tocá la estrella en cualquier activo para seguirlo."
                    : "Sin resultados."}
                </div>
              )
              : filtered.map((row, i) => (
                  <MarketRow
                    key={row.meta.ticker}
                    row={row}
                    starred={store.watchlist.includes(row.meta.ticker)}
                    index={i}
                  />
                ))}
        </div>

        {isFetching && !isLoading && (
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
            Actualizando…
          </p>
        )}
      </div>
    </MobileShell>
  );
}

function IndexCard({
  value,
  change,
  sparkline,
}: {
  value: number;
  change: number;
  sparkline: number[];
}) {
  const up = change >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-white p-5 ring-1 ring-border shadow-[0_24px_60px_-30px_rgba(107,33,217,0.35)]"
    >
      <div className="flex items-start justify-between">
        <div
          className="grid h-10 w-10 place-items-center rounded-full text-white shadow-[0_8px_20px_-8px_rgba(249,115,22,0.6)]"
          style={{ background: "linear-gradient(135deg,#FB923C,#F97316)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground">
          IDX
        </span>
      </div>

      <p className="mt-4 text-[34px] font-extrabold leading-none tracking-tight text-foreground">
        {value.toLocaleString("en-US", { maximumFractionDigits: 2 })}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">Índice Onírico Global</p>

      <span
        className={`mt-3 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
          up
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {up ? "+" : ""}
        {change.toFixed(2)}%
      </span>

      <Sparkline
        data={sparkline}
        width={320}
        height={70}
        up={up}
        className="mt-4 w-full"
      />

      <p className="mt-2 text-[10px] tracking-[0.2em] text-muted-foreground/70">
        actualizado ahora
      </p>
    </motion.div>
  );
}

function MarketRow({
  row,
  starred,
  index,
}: {
  row: { meta: MercadoAsset; price: number; change24h: number; sparkline: number[] };
  starred: boolean;
  index: number;
}) {
  const up = row.change24h >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border shadow-[var(--shadow-soft)]"
    >
      <Link
        to="/mercado/$symbol"
        params={{ symbol: row.meta.ticker }}
        className="flex flex-1 items-center gap-3 min-w-0"
      >
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <AssetIcon name={row.meta.iconName} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <p className="text-sm font-bold text-primary">{row.meta.ticker}</p>
            <p className="truncate text-[11px] text-muted-foreground">{row.meta.name}</p>
          </div>
          <p className="text-sm font-semibold text-foreground">{formatPrice(row.price)}</p>
        </div>
        <Sparkline data={row.sparkline} width={56} height={24} up={up} />
        <div className="w-14 text-right">
          <p
            className={`text-xs font-bold ${up ? "text-emerald-600" : "text-rose-600"}`}
          >
            {up ? "+" : ""}
            {row.change24h.toFixed(2)}%
          </p>
        </div>
      </Link>
      <button
        onClick={() => toggleWatch(row.meta.ticker)}
        aria-label="Watchlist"
        className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"
      >
        <Star
          className={`h-4 w-4 ${starred ? "fill-primary text-primary" : "text-muted-foreground"}`}
        />
      </button>
    </motion.div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
      <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-6 w-14 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function AssetIcon({ name }: { name: MercadoAsset["iconName"] }) {
  switch (name) {
    case "bitcoin":
      return <Bitcoin className="h-5 w-5" />;
    case "ethereum":
      return <Hexagon className="h-5 w-5" />;
    case "solana":
      return <Zap className="h-5 w-5" />;
    case "gold":
      return <Coins className="h-5 w-5" />;
    case "sleep":
      return <Sun className="h-5 w-5" />;
  }
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n < 10 ? 3 : 2,
  }).format(n);
}

export function Sparkline({
  data,
  width,
  height,
  up,
  className,
}: {
  data: number[];
  width: number;
  height: number;
  up: boolean;
  className?: string;
}) {
  if (!data.length) return <svg width={width} height={height} className={className} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const path = `M ${points.join(" L ")}`;
  const area = `${path} L ${width},${height} L 0,${height} Z`;
  const stroke = up ? "rgb(5 150 105)" : "rgb(225 29 72)";
  const fill = up ? "rgb(16 185 129 / 0.15)" : "rgb(244 63 94 / 0.15)";
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="none"
    >
      <path d={area} fill={fill} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}