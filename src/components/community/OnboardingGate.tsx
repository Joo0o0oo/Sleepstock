import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { setMe } from "@/lib/comunidad-mock";

export function OnboardingGate({ onDone }: { onDone?: () => void }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      setMe(username, displayName);
      onDone?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el usuario");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div
        className="w-full max-w-sm rounded-[14px] bg-white p-6 ring-1 ring-[rgba(107,33,217,0.18)]"
        style={{ boxShadow: "0 10px 30px -14px rgba(107,33,217,0.40)" }}
      >
        <div
          className="mx-auto grid h-12 w-12 place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #6B21D9, #8A38F5)" }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-center text-lg font-bold text-foreground">
          Activá tu cuenta de Comunidad
        </h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Elegí cómo querés aparecer. Es simulado y vive solo en tu dispositivo.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label className="block">
            <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              USUARIO
            </span>
            <div className="mt-1.5 flex items-center rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-[rgba(107,33,217,0.20)]">
              <span className="text-sm text-muted-foreground">@</span>
              <input
                autoFocus
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20),
                  )
                }
                placeholder="serena"
                className="flex-1 bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-foreground/40"
              />
            </div>
            <span className="mt-1 block text-[10px] text-muted-foreground">
              3-20 caracteres · a-z, 0-9, _
            </span>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              NOMBRE
            </span>
            <input
              value={displayName}
              maxLength={60}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Serena Luz"
              className="mt-1.5 w-full rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
            />
          </label>
          {error && (
            <p className="rounded-[10px] bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy || username.length < 3}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#7A28E8] disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar a la Comunidad
          </button>
        </form>
      </div>
    </div>
  );
}
