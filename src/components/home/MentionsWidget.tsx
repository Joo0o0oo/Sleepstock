import { Link } from "@tanstack/react-router";
import { AtSign, Sparkles, ArrowRight } from "lucide-react";
import { useMe, useMentions } from "@/hooks/use-comunidad";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export function MentionsWidget() {
  const me = useMe();
  const mentions = useMentions();

  if (!me) {
    return (
      <Link
        to="/comunidad"
        className="block rounded-[14px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)] transition hover:ring-[rgba(107,33,217,0.32)]"
        style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #6B21D9, #8A38F5)" }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground">
              ¿Alguien soñó con vos?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Activá tu cuenta en Comunidad para enterarte.
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </div>
      </Link>
    );
  }

  if (mentions.length === 0) return null;

  const top = mentions.slice(0, 3);

  return (
    <div
      className="rounded-[14px] bg-white ring-1 ring-[rgba(107,33,217,0.16)]"
      style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
    >
      <div className="flex items-center gap-2 border-b border-[rgba(107,33,217,0.10)] px-4 py-3">
        <div
          className="grid h-7 w-7 place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, #6B21D9, #8A38F5)" }}
        >
          <AtSign className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
            SOÑARON CON VOS
          </p>
          <p className="text-sm font-bold text-foreground">
            {mentions.length} sueño{mentions.length === 1 ? "" : "s"} te etiqueta{mentions.length === 1 ? "" : "n"}
          </p>
        </div>
      </div>
      <ul className="divide-y divide-[rgba(107,33,217,0.08)]">
        {top.map((p) => (
          <li key={p.id}>
            <Link
              to="/comunidad/u/$username"
              params={{ username: p.author.username }}
              className="flex gap-3 px-4 py-3 transition hover:bg-[rgba(107,33,217,0.04)]"
            >
              <div
                className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-[10px] font-bold text-white"
                style={{
                  background: p.author.avatar_url
                    ? undefined
                    : "linear-gradient(135deg, #6B21D9, #8A38F5)",
                }}
              >
                {p.author.avatar_url ? (
                  <img src={p.author.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  p.author.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground/90">
                  <span className="font-semibold text-foreground">
                    @{p.author.username}
                  </span>{" "}
                  <span className="text-muted-foreground">soñó con vos</span>{" "}
                  <span className="text-muted-foreground">· {relativeTime(p.created_at)}</span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-foreground/70">
                  {p.body}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/comunidad"
        className="flex items-center justify-center gap-1 border-t border-[rgba(107,33,217,0.10)] px-4 py-2.5 text-xs font-semibold text-primary hover:bg-[rgba(107,33,217,0.04)]"
      >
        Ver todas <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
