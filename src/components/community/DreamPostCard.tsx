import { Link } from "@tanstack/react-router";
import { Heart, Trash2, Lock } from "lucide-react";
import type { FeedPost } from "@/lib/comunidad-mock";

function renderBody(body: string) {
  const parts: React.ReactNode[] = [];
  const re = /@([a-z0-9_]{3,20})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(body)) !== null) {
    if (m.index > last) parts.push(body.slice(last, m.index));
    const username = m[1];
    parts.push(
      <Link
        key={`m-${i++}-${m.index}`}
        to="/comunidad/u/$username"
        params={{ username }}
        className="font-semibold text-primary hover:underline"
      >
        @{username}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < body.length) parts.push(body.slice(last));
  return parts;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export function DreamPostCard({
  post,
  onLike,
  onDelete,
}: {
  post: FeedPost;
  onLike?: () => void;
  onDelete?: () => void;
}) {
  return (
    <article
      className="rounded-[10px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
      style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
    >
      <div className="flex items-start gap-3">
        <Link
          to="/comunidad/u/$username"
          params={{ username: post.author.username }}
          className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-[rgba(107,33,217,0.25)]"
          style={{
            background: post.author.avatar_url
              ? undefined
              : "linear-gradient(135deg, #6B21D9, #8A38F5)",
          }}
        >
          {post.author.avatar_url ? (
            <img src={post.author.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white">
              {post.author.username.slice(0, 2).toUpperCase()}
            </span>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <Link
              to="/comunidad/u/$username"
              params={{ username: post.author.username }}
              className="truncate text-sm font-bold text-foreground hover:underline"
            >
              {post.author.display_name || `@${post.author.username}`}
            </Link>
            <Link
              to="/comunidad/u/$username"
              params={{ username: post.author.username }}
              className="truncate text-xs text-muted-foreground"
            >
              @{post.author.username}
            </Link>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{relativeTime(post.created_at)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {renderBody(post.body)}
          </p>
          {post.visibility === "tagged_only" && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[rgba(107,33,217,0.10)] px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Lock className="h-3 w-3" /> solo etiquetados
            </span>
          )}
          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={onLike}
              className={`inline-flex items-center gap-1 text-xs transition ${
                post.liked_by_me ? "text-rose-600" : "text-muted-foreground hover:text-rose-600"
              }`}
            >
              <Heart
                className="h-3.5 w-3.5"
                fill={post.liked_by_me ? "currentColor" : "none"}
              />
              {post.like_count}
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                aria-label="Borrar"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
