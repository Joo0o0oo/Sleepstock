import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Plus, AtSign, Bell, RefreshCw, UserCircle2, MapIcon } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { DreamPostCard } from "@/components/community/DreamPostCard";
import { OnboardingGate } from "@/components/community/OnboardingGate";
import { useFeed, useMentions, useMe } from "@/hooks/use-comunidad";
import { toggleLike, deletePost, resetSimulation } from "@/lib/comunidad-mock";

export const Route = createFileRoute("/comunidad/")({
  head: () => ({
    meta: [
      { title: "Comunidad — Sleep Stock" },
      { name: "description", content: "Compartí tus sueños con la comunidad de Sleep Stock." },
    ],
  }),
  component: ComunidadPage,
});

type Tab = "feed" | "mentions";

function ComunidadPage() {
  const me = useMe();
  const [tab, setTab] = useState<Tab>("feed");
  const feed = useFeed();
  const mentions = useMentions();
  const posts = tab === "feed" ? feed : mentions;

  function handleLike(postId: string) {
    toggleLike(postId);
  }
  function handleDelete(postId: string) {
    if (!confirm("¿Borrar este sueño?")) return;
    deletePost(postId);
  }
  function handleReset() {
    if (!confirm("Reiniciar la simulación borra tus posts y vuelve al estado inicial. ¿Seguro?")) return;
    resetSimulation();
  }

  return (
    <MobileShell>
      <div
        className="min-h-screen text-foreground"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), radial-gradient(120% 80% at 80% 100%, rgba(138,56,245,0.08), transparent 60%), #F7F5FB",
        }}
      >
        {!me ? (
          <OnboardingGate />
        ) : (
          <>
            <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/80 border-b border-[rgba(107,33,217,0.14)] px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
                    SUEÑOS COMPARTIDOS
                  </p>
                  <h1 className="text-lg font-bold text-foreground">Comunidad</h1>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/perfil"
                    className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)]"
                    aria-label="Mi perfil"
                  >
                    <UserCircle2 className="h-4 w-4 text-primary" />
                  </Link>
                  <button
                    onClick={handleReset}
                    className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)]"
                    aria-label="Reiniciar simulación"
                    title="Reiniciar simulación"
                  >
                    <RefreshCw className="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <TabButton active={tab === "feed"} onClick={() => setTab("feed")} icon={<Bell className="h-3.5 w-3.5" />}>
                  Para vos
                </TabButton>
                <TabButton
                  active={tab === "mentions"}
                  onClick={() => setTab("mentions")}
                  icon={<AtSign className="h-3.5 w-3.5" />}
                >
                  Menciones {mentions.length > 0 && <span className="ml-1 rounded-full bg-white/30 px-1.5 text-[10px]">{mentions.length}</span>}
                </TabButton>
                <Link
                  to="/comunidad/mapa"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-foreground/70 ring-1 ring-[rgba(107,33,217,0.20)] hover:bg-[rgba(107,33,217,0.06)]"
                >
                  <MapIcon className="h-3.5 w-3.5" />
                  Mapa
                </Link>
              </div>
            </header>

            <div className="px-5 pt-4 pb-32 space-y-3">
              {posts.length === 0 && <EmptyState tab={tab} />}
              {posts.map((p) => (
                <DreamPostCard
                  key={p.id}
                  post={p}
                  onLike={() => handleLike(p.id)}
                  onDelete={p.is_mine ? () => handleDelete(p.id) : undefined}
                />
              ))}
            </div>

            <Link
              to="/comunidad/componer"
              className="fixed bottom-28 right-4 z-30 grid h-14 w-14 place-items-center rounded-full text-white"
              style={{
                background: "linear-gradient(135deg, #6B21D9, #8A38F5)",
                boxShadow: "0 12px 28px -8px rgba(107,33,217,0.55)",
              }}
              aria-label="Publicar sueño"
            >
              <Plus className="h-6 w-6" />
            </Link>
          </>
        )}
      </div>
    </MobileShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground shadow-[0_8px_20px_-6px_rgba(107,33,217,0.45)]"
          : "bg-white text-foreground/70 ring-1 ring-[rgba(107,33,217,0.20)] hover:bg-[rgba(107,33,217,0.06)]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div
      className="rounded-[10px] bg-white p-6 text-center ring-1 ring-[rgba(107,33,217,0.16)]"
      style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
    >
      <Heart className="mx-auto h-6 w-6 text-primary" />
      <p className="mt-2 text-sm font-semibold text-foreground">
        {tab === "feed" ? "Aún no hay sueños públicos" : "Nadie te etiquetó todavía"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {tab === "feed"
          ? "Sé el/la primer/a en compartir uno."
          : "Cuando alguien te mencione en un sueño, aparecerá acá."}
      </p>
      {tab === "feed" && (
        <Link
          to="/comunidad/componer"
          className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-[#7A28E8]"
        >
          <Plus className="h-3.5 w-3.5" />
          Publicar un sueño
        </Link>
      )}
    </div>
  );
}
