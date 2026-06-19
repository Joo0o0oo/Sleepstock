import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Entrar — Sleep Stock" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { redirect, mode: initialMode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/comunidad" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: redirect ?? "/comunidad" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, redirect]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (username && !/^[a-z0-9_]{3,20}$/.test(username)) {
          throw new Error("Usuario: 3-20 caracteres, solo a-z, 0-9, _");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { username: username || undefined },
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya podés explorar Comunidad.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Algo salió mal");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No pudimos abrir Google");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-8"
      style={{
        background:
          "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), radial-gradient(120% 80% at 80% 100%, rgba(138,56,245,0.08), transparent 60%), #F7F5FB",
      }}
    >
      <div className="w-full max-w-[420px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <div
            className="grid h-12 w-12 place-items-center rounded-[10px]"
            style={{
              background: "linear-gradient(135deg, #6B21D9, #8A38F5)",
              boxShadow: "0 8px 20px -6px rgba(107,33,217,0.45)",
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              SLEEP STOCK
            </p>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === "signin" ? "Bienvenido/a" : "Crear cuenta"}
            </h1>
          </div>
        </div>

        <div
          className="mt-6 rounded-[10px] bg-white p-5 ring-1 ring-[rgba(107,33,217,0.16)]"
          style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
        >
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-[rgba(107,33,217,0.06)] disabled:opacity-60"
          >
            <GoogleIcon /> Continuar con Google
          </button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[rgba(107,33,217,0.16)]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">
              O CON EMAIL
            </span>
            <div className="h-px flex-1 bg-[rgba(107,33,217,0.16)]" />
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <Field
                label="Usuario"
                placeholder="ej. juan123"
                value={username}
                onChange={(v) => setUsername(v.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20))}
              />
            )}
            <Field
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#7A28E8] disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "¿No tenés cuenta? Creá una"
              : "¿Ya tenés cuenta? Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
        {label.toUpperCase()}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.5-5.2l-6.2-5.3c-2 1.5-4.5 2.5-7.3 2.5-5.3 0-9.7-3.4-11.3-8L6 33.3C9.4 39.7 16.1 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.3C40.7 35.4 44 30.1 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
