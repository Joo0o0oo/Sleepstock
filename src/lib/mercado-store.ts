import { useSyncExternalStore } from "react";
import { toast } from "sonner";

const WATCH_KEY = "sleep-stock.mercado.watchlist";
const HOLD_KEY = "sleep-stock.mercado.holdings";

export type Holding = { shares: number; avgPrice: number };
export type MercadoState = {
  watchlist: string[];
  holdings: Record<string, Holding>;
};

const listeners = new Set<() => void>();
let cache: MercadoState | null = null;

function read(): MercadoState {
  if (typeof window === "undefined") return { watchlist: [], holdings: {} };
  try {
    const w = JSON.parse(localStorage.getItem(WATCH_KEY) ?? "[]");
    const h = JSON.parse(localStorage.getItem(HOLD_KEY) ?? "{}");
    return { watchlist: Array.isArray(w) ? w : [], holdings: h && typeof h === "object" ? h : {} };
  } catch {
    return { watchlist: [], holdings: {} };
  }
}

function emit() {
  cache = read();
  listeners.forEach((l) => l());
}

function persist(state: MercadoState) {
  localStorage.setItem(WATCH_KEY, JSON.stringify(state.watchlist));
  localStorage.setItem(HOLD_KEY, JSON.stringify(state.holdings));
  emit();
}

function getSnapshot(): MercadoState {
  if (!cache) cache = read();
  return cache;
}
function getServerSnapshot(): MercadoState {
  return { watchlist: [], holdings: {} };
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useMercadoStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleWatch(ticker: string) {
  const state = read();
  const exists = state.watchlist.includes(ticker);
  const next = exists
    ? state.watchlist.filter((t) => t !== ticker)
    : [...state.watchlist, ticker];
  persist({ ...state, watchlist: next });
  toast(exists ? `${ticker} salió de tu watchlist` : `${ticker} agregado a tu watchlist`);
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

export function buyAsset(ticker: string, amount: number, price: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    toast.error("Cantidad inválida");
    return;
  }
  const state = read();
  const prev = state.holdings[ticker] ?? { shares: 0, avgPrice: 0 };
  const totalCost = prev.shares * prev.avgPrice + amount * price;
  const newShares = prev.shares + amount;
  const newAvg = newShares > 0 ? totalCost / newShares : 0;
  state.holdings[ticker] = { shares: newShares, avgPrice: newAvg };
  persist(state);
  toast.success(`Compraste ${amount} ${ticker} a ${fmt(price)}`);
}

export function sellAsset(ticker: string, amount: number, price: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    toast.error("Cantidad inválida");
    return;
  }
  const state = read();
  const prev = state.holdings[ticker];
  if (!prev || prev.shares < amount) {
    toast.error(`No tenés ${amount} ${ticker} disponibles`);
    return;
  }
  const newShares = prev.shares - amount;
  if (newShares <= 0.0000001) {
    delete state.holdings[ticker];
  } else {
    state.holdings[ticker] = { shares: newShares, avgPrice: prev.avgPrice };
  }
  persist(state);
  toast.success(`Vendiste ${amount} ${ticker} a ${fmt(price)}`);
}

export function getLucidModifier(): number {
  if (typeof window === "undefined") return 1;
  try {
    return localStorage.getItem("sleep-stock-lucid") === "true" ? 1.2 : 1;
  } catch {
    return 1;
  }
}