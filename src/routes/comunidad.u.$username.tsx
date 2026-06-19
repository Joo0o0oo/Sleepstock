import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { DreamPostCard } from "@/components/community/DreamPostCard";
import { useProfile, useUserPosts } from "@/hooks/use-comunidad";
import { toggleLike, deletePost } from "@/lib/comunidad-mock";

export const Route = createFileRoute("/comunidad/u/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} — Comunidad` }] }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const profile = useProfile(username);
  const posts = useUserPosts(username);

  function handleLike(id: string) {
    toggleLike(id);
  }
  function handleDelete(id: string) {
    if (!confirm("¿Borrar este sueño?")) return;
    deletePost(id);
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
          <h1 className="text-sm font-bold text-foreground">@{username}</h1>
        </header>

        <div className="px-5 pt-4 pb-32 space-y-4">
          {profile ? (
            <div
              className="rounded-[10px] bg-white p-5 ring-1 ring-[rgba(107,33,217,0.16)]"
              style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-[rgba(107,33,217,0.25)]"
                  style={{
                    background: profile.avatar_url
                      ? undefined
                      : "linear-gradient(135deg, #6B21D9, #8A38F5)",
                  }}
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {profile.username.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-foreground">
                    {profile.display_name || `@${profile.username}`}
                  </p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
              </div>
              {profile.bio && <p className="mt-3 text-sm text-foreground/80">{profile.bio}</p>}
            </div>
          ) : (
            <p className="rounded-[10px] bg-white p-4 text-center text-sm text-muted-foreground ring-1 ring-[rgba(107,33,217,0.16)]">
              Este usuario no existe.
            </p>
          )}
          {posts.map((p) => (
            <DreamPostCard
              key={p.id}
              post={p}
              onLike={() => handleLike(p.id)}
              onDelete={p.is_mine ? () => handleDelete(p.id) : undefined}
            />
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
