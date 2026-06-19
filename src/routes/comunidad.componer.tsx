import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Loader2, Globe, Lock, AtSign } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { OnboardingGate } from "@/components/community/OnboardingGate";
import { createPost, searchUsers, type MockProfile } from "@/lib/comunidad-mock";
import { useMe } from "@/hooks/use-comunidad";
import { toast } from "sonner";

export const Route = createFileRoute("/comunidad/componer")({
  head: () => ({ meta: [{ title: "Publicar sueño — Comunidad" }] }),
  component: ComposerPage,
});

const MAX = 600;

function ComposerPage() {
  const navigate = useNavigate();
  const me = useMe();
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"public" | "tagged_only">("public");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MockProfile[]>([]);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const remaining = MAX - body.length;

  useEffect(() => {
    taRef.current?.focus();
  }, []);

  useEffect(() => {
    if (mentionStart === null) {
      setSuggestions([]);
      return;
    }
    const cursor = taRef.current?.selectionStart ?? body.length;
    const fragment = body.slice(mentionStart + 1, cursor);
    if (!/^[a-z0-9_]{0,20}$/.test(fragment)) {
      setSuggestions([]);
      return;
    }
    setSuggestions(searchUsers(fragment || " "));
  }, [body, mentionStart]);

  function onTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setBody(value);
    const cursor = e.target.selectionStart;
    const upto = value.slice(0, cursor);
    const atIdx = upto.lastIndexOf("@");
    if (atIdx === -1) return setMentionStart(null);
    const between = value.slice(atIdx + 1, cursor);
    const prevChar = atIdx === 0 ? " " : value[atIdx - 1];
    if (/^[a-z0-9_]{0,20}$/.test(between) && /\s|^/.test(prevChar)) {
      setMentionStart(atIdx);
    } else {
      setMentionStart(null);
    }
  }

  function pickMention(username: string) {
    if (mentionStart === null || !taRef.current) return;
    const cursor = taRef.current.selectionStart;
    const next = body.slice(0, mentionStart) + "@" + username + " " + body.slice(cursor);
    setBody(next);
    setMentionStart(null);
    setSuggestions([]);
    requestAnimationFrame(() => {
      const pos = mentionStart + username.length + 2;
      taRef.current?.setSelectionRange(pos, pos);
      taRef.current?.focus();
    });
  }

  function handleSubmit() {
    if (body.trim().length === 0 || loading) return;
    setLoading(true);
    try {
      const post = createPost(body.trim(), visibility);
      const m = post.body.match(/@([a-z0-9_]{3,20})/gi)?.length ?? 0;
      toast.success(
        m > 0
          ? `Publicado · ${m} mención${m === 1 ? "" : "es"}`
          : "Sueño publicado",
      );
      navigate({ to: "/comunidad" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo publicar");
    } finally {
      setLoading(false);
    }
  }

  if (!me) {
    return (
      <MobileShell>
        <div
          className="min-h-screen"
          style={{
            background:
              "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), #F7F5FB",
          }}
        >
          <OnboardingGate onDone={() => taRef.current?.focus()} />
        </div>
      </MobileShell>
    );
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
            to="/comunidad"
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)]"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <h1 className="flex-1 text-sm font-bold text-foreground">Publicar sueño</h1>
          <button
            onClick={handleSubmit}
            disabled={loading || body.trim().length === 0 || body.length > MAX}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-[#7A28E8] disabled:opacity-50"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Publicar
          </button>
        </header>

        <div className="relative px-5 pt-4">
          <textarea
            ref={taRef}
            value={body}
            onChange={onTextChange}
            placeholder="Anoche soñé que… usá @usuario para etiquetar"
            rows={8}
            className="w-full resize-none rounded-[10px] border border-[rgba(107,33,217,0.18)] bg-white p-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
          />
          {suggestions.length > 0 && (
            <div
              className="absolute left-5 right-5 z-30 mt-1 max-h-64 overflow-y-auto rounded-[10px] bg-white p-1 ring-1 ring-[rgba(107,33,217,0.22)]"
              style={{ boxShadow: "0 12px 28px -10px rgba(107,33,217,0.40)" }}
            >
              {suggestions.map((s) => (
                <button
                  key={s.username}
                  onClick={() => pickMention(s.username)}
                  className="flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left hover:bg-[rgba(107,33,217,0.06)]"
                >
                  <div
                    className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-bold text-white"
                    style={{
                      background: s.avatar_url
                        ? undefined
                        : "linear-gradient(135deg, #6B21D9, #8A38F5)",
                    }}
                  >
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      s.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm">
                    <span className="font-semibold text-foreground">@{s.username}</span>
                    {s.display_name && (
                      <span className="ml-2 text-xs text-muted-foreground">{s.display_name}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <AtSign className="h-3 w-3" /> Mencioná con @
            </div>
            <span className={remaining < 0 ? "font-bold text-destructive" : "text-muted-foreground"}>
              {remaining}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              VISIBILIDAD
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <VisOption
                active={visibility === "public"}
                onClick={() => setVisibility("public")}
                icon={<Globe className="h-4 w-4" />}
                label="Público"
                hint="Cualquiera puede verlo"
              />
              <VisOption
                active={visibility === "tagged_only"}
                onClick={() => setVisibility("tagged_only")}
                icon={<Lock className="h-4 w-4" />}
                label="Solo etiquetados"
                hint="Solo quienes mencionás"
              />
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function VisOption({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-[10px] p-3 text-left transition ${
        active
          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(107,33,217,0.45)]"
          : "bg-white text-foreground ring-1 ring-[rgba(107,33,217,0.18)] hover:bg-[rgba(107,33,217,0.06)]"
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {icon} {label}
      </div>
      <p className={`text-[11px] ${active ? "opacity-90" : "text-muted-foreground"}`}>{hint}</p>
    </button>
  );
}
