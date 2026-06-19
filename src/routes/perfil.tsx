import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { OnboardingGate } from "@/components/community/OnboardingGate";
import { useMe } from "@/hooks/use-comunidad";
import { updateMe, resetSimulation } from "@/lib/comunidad-mock";
import { toast } from "sonner";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Mi perfil — Sleep Stock" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = useMe();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me) {
      setUsername(me.username);
      setDisplayName(me.display_name);
      setBio(me.bio);
    }
  }, [me]);

  function handleSave() {
    if (saving || !me) return;
    setSaving(true);
    try {
      updateMe({ username, display_name: displayName, bio });
      toast.success("Perfil actualizado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (!confirm("Esto borra tu usuario y todos los posts de la simulación. ¿Seguro?")) return;
    resetSimulation();
    toast.success("Simulación reiniciada");
  }

  return (
    <MobileShell>
      <div
        className="min-h-screen text-foreground"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), #F7F5FB",
        }}
      >
        <header className="sticky top-0 z-20 flex items-center gap-3 backdrop-blur-xl bg-white/85 px-5 py-3 border-b border-[rgba(107,33,217,0.14)]">
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)]"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <h1 className="flex-1 text-sm font-bold text-foreground">Mi perfil</h1>
          {me && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-white px-3 py-1.5 text-xs font-semibold text-foreground ring-1 ring-[rgba(107,33,217,0.22)] hover:bg-[rgba(107,33,217,0.06)]"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reiniciar
            </button>
          )}
        </header>

        {!me ? (
          <OnboardingGate />
        ) : (
          <div className="px-5 pt-4 pb-32 space-y-4">
            <div
              className="flex items-center gap-3 rounded-[10px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
              style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
            >
              <div
                className="grid h-14 w-14 place-items-center overflow-hidden rounded-full text-white"
                style={{
                  background: me.avatar_url
                    ? undefined
                    : "linear-gradient(135deg, #6B21D9, #8A38F5)",
                }}
              >
                {me.avatar_url ? (
                  <img src={me.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">
                    {me.username.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-foreground">@{me.username}</p>
                <Link
                  to="/comunidad/u/$username"
                  params={{ username: me.username }}
                  className="text-xs text-primary hover:underline"
                >
                  Ver mi perfil público
                </Link>
              </div>
            </div>

            <div
              className="space-y-3 rounded-[10px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
              style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
            >
              <Field
                label="Usuario"
                value={username}
                onChange={(v) =>
                  setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))
                }
                hint="3-20 caracteres · a-z, 0-9, _"
              />
              <Field
                label="Nombre"
                value={displayName}
                onChange={setDisplayName}
                maxLength={60}
              />
              <Field
                label="Bio"
                value={bio}
                onChange={setBio}
                multiline
                maxLength={280}
                hint={`${280 - bio.length} caracteres`}
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-[#7A28E8] disabled:opacity-60"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar cambios
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileShell>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
  maxLength,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
        {label.toUpperCase()}
      </span>
      {multiline ? (
        <textarea
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1.5 w-full resize-none rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
        />
      ) : (
        <input
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 w-full rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
        />
      )}
      {hint && <span className="mt-1 block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}
