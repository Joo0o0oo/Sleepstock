import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Play,
  Pause,
  Star,
  Share2,
  Moon,
  Maximize2,
  RotateCcw,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import {
  getArchivoById,
  toggleFavorito,
  formatDuration,
  type CapturedDream,
} from "@/lib/archivo-onirico-mock";

export const Route = createFileRoute("/sueno/archivo/$id")({
  head: () => ({ meta: [{ title: "Reproducir sueño — HYPN" }] }),
  component: DreamPlayback,
});

function DreamPlayback() {
  const { id } = Route.useParams();
  const [d, setD] = useState<CapturedDream | undefined>();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => setD(getArchivoById(id)), [id]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
    } else {
      v.pause();
    }
  };

  const skip = (s: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0) - 0.1, v.currentTime + s));
  };

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
  };

  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) void v.requestFullscreen();
  };

  if (!d) {
    return (
      <MobileShell>
        <div className="p-6 text-center text-muted-foreground">
          Cargando captura…
        </div>
      </MobileShell>
    );
  }

  const totalSec = videoDuration || d.durationSec;
  const pct = totalSec > 0 ? (progress / totalSec) * 100 : 0;

  return (
    <MobileShell>
      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 bg-white/85 px-5 py-4 backdrop-blur-xl">
        <Link
          to="/sueno/archivo"
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-border"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
        </Link>
        <span className="hypn-chip">REPRODUCIENDO</span>
        <button
          onClick={() => {
            toggleFavorito(d.id);
            setD({ ...d, favorito: !d.favorito });
          }}
          aria-label="Favorito"
          className="grid h-9 w-9 place-items-center rounded-full bg-white shadow ring-1 ring-border"
        >
          <Star
            className={`h-4 w-4 ${d.favorito ? "fill-primary text-primary" : "text-muted-foreground"}`}
          />
        </button>
      </header>

      <div className="px-5 pt-2 pb-32 space-y-5">
        {/* Reproductor de video real */}
        <div className="rounded-3xl bg-white p-4 ring-1 ring-border shadow-[0_28px_60px_-30px_rgba(107,33,217,0.45)]">
          <div
            className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl"
            style={{ background: d.gradient }}
          >
            <video
              ref={videoRef}
              src={d.videoUrl}
              playsInline
              loop
              preload="auto"
              poster={d.videoUrl ? `${d.videoUrl}#t=0.5` : undefined}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) =>
                setVideoDuration(e.currentTarget.duration || 0)
              }
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-primary backdrop-blur">
              ● {d.phase.toUpperCase()}
            </span>
            <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-mono text-white backdrop-blur">
              #{d.id} · {d.date} {d.time}
            </span>
            {!playing && (
              <button
                onClick={togglePlay}
                aria-label="Reproducir"
                className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-full bg-white/95 text-primary shadow-[var(--shadow-glow)] transition active:scale-95"
              >
                <Play className="h-7 w-7 fill-primary translate-x-[2px]" />
              </button>
            )}
            {playing && (
              <button
                onClick={togglePlay}
                aria-label="Pausar"
                className="absolute inset-0"
              />
            )}
          </div>

          {/* Título */}
          <div className="mt-4 px-1">
            <p className="hypn-eyebrow text-primary">— TÍTULO DEL SUEÑO</p>
            <div className="mt-1 flex items-start justify-between gap-3">
              <h1 className="hypn-display text-[26px] leading-tight text-foreground">
                {d.title.replace(/\s#\d+$/, "")}
              </h1>
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-primary">
                <span className="rounded-md bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
                  {d.phase.toUpperCase()}
                </span>
                {d.fidelity}%
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{d.narrative}</p>
          </div>

          {/* Scrubber */}
          <div className="mt-4 px-1">
            <div
              role="slider"
              tabIndex={0}
              aria-label="Posición del video"
              aria-valuemin={0}
              aria-valuemax={Math.round(totalSec)}
              aria-valuenow={Math.round(progress)}
              onClick={seekTo}
              className="relative h-3 w-full cursor-pointer"
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-violet-100">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary ring-2 ring-white"
                style={{ left: `calc(${pct}% - 6px)` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>{formatDuration(Math.floor(progress))}</span>
              <span>{formatDuration(Math.floor(totalSec))}</span>
            </div>
          </div>

          {/* Controles */}
          <div className="mt-3 flex items-center justify-between px-1">
            <button
              onClick={() => skip(-10)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
              aria-label="Retroceder 10 segundos"
            >
              <RotateCcw className="h-4 w-4" /> 10s
            </button>
            <button
              onClick={togglePlay}
              className="grid h-12 w-12 place-items-center rounded-full text-white shadow-[var(--shadow-glow)] transition active:scale-95"
              style={{ background: "var(--gradient-primary)" }}
              aria-label={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-white" />
              ) : (
                <Play className="h-5 w-5 fill-white translate-x-[1px]" />
              )}
            </button>
            <button
              onClick={() => skip(10)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
              aria-label="Avanzar 10 segundos"
            >
              10s <RotateCw className="h-4 w-4" />
            </button>
            <button
              onClick={goFullscreen}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-muted-foreground ring-1 ring-border"
              aria-label="Pantalla completa"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Regenerar (placeholder) */}
        <button
          onClick={() =>
            alert(
              "Próximamente: regeneración onírica. La HYPN Band reinterpretará este sueño usando tus símbolos y narrativa.",
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-violet-50 px-4 py-3 text-sm font-semibold text-primary ring-1 ring-violet-200 transition active:scale-[0.99]"
        >
          <Sparkles className="h-4 w-4" /> Regenerar este sueño
        </button>

        {/* Símbolos */}
        <section className="space-y-2">
          <p className="hypn-eyebrow">— SÍMBOLOS DETECTADOS</p>
          <div className="flex flex-wrap gap-2">
            {d.symbols.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary ring-1 ring-border"
              >
                #{s}
              </span>
            ))}
          </div>
        </section>

        {/* Memoria neural */}
        <section className="space-y-2">
          <p className="hypn-eyebrow">— MEMORIA NEURAL</p>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-border shadow-[var(--shadow-soft)]">
            <p className="text-sm leading-relaxed text-foreground/80">
              {d.narrative}
            </p>
          </div>
        </section>

        {/* Acciones */}
        <div className="grid grid-cols-2 gap-3">
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0E0A1A] px-4 py-3 text-sm font-semibold text-white">
            <Moon className="h-4 w-4" /> Reproducir esta noche
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-primary ring-1 ring-border">
            <Share2 className="h-4 w-4" /> Compartir
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
