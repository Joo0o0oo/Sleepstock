import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Settings,
  RotateCw,
  Zap,
  ScanFace,
  Loader2,
  TrendingUp,
  TrendingDown,
  Coins,
  History,
  ChevronDown,
  Trash2,
  Check,
  Sparkles,
  X,
  Stars,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MobileShell } from "@/components/MobileShell";
import { scanSubconscious } from "@/lib/ai.functions";
import {
  addScan,
  clearScans,
  getScans,
  removeScan,
  type ScanEntry,
  type ScanResult,
} from "@/lib/scans-store";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "Scanner del subconsciente — Sleep Stock" }] }),
  ssr: false,
  component: Scanner,
});

type Step = "name" | "camera" | "result";

function Scanner() {
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showConstelacion, setShowConstelacion] = useState(false);
  const [scans, setScans] = useState<ScanEntry[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    setScans(getScans());
  }, []);

  function handleResult(r: ScanResult, thumb: string) {
    setResult(r);
    setThumbnail(thumb);
    setStep("result");
  }

  function handleSave() {
    if (!result || savedId) return;
    const entry: ScanEntry = {
      id: `scan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || "Anónimo",
      createdAt: Date.now(),
      result,
      thumbnail: thumbnail ?? undefined,
    };
    setScans(addScan(entry));
    setSavedId(entry.id);
  }

  function handleReset() {
    setResult(null);
    setThumbnail(null);
    setSavedId(null);
    setName("");
    setStep("name");
  }

  function handleDelete(id: string) {
    setScans(removeScan(id));
    if (savedId === id) setSavedId(null);
  }

  function handleClear() {
    clearScans();
    setScans([]);
    setSavedId(null);
  }

  return (
    <>
      {step === "name" && (
        <NameStep
          name={name}
          onNameChange={setName}
          onStart={() => setStep("camera")}
          scans={scans}
          onOpenConstelacion={() => setShowConstelacion(true)}
          onDelete={handleDelete}
          onClear={handleClear}
        />
      )}
      {step === "camera" && (
        <CameraStep
          name={name}
          onBack={() => setStep("name")}
          onResult={handleResult}
        />
      )}
      {step === "result" && result && (
        <ResultView
          result={result}
          name={name}
          saved={savedId != null}
          onSave={handleSave}
          onOpenConstelacion={() => setShowConstelacion(true)}
          onReset={handleReset}
        />
      )}
      <AnimatePresence>
        {showConstelacion && (
          <ConstelacionOverlay
            scans={scans}
            onClose={() => setShowConstelacion(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------ Name step ------------------------------ */

function NameStep({
  name,
  onNameChange,
  onStart,
  scans,
  onOpenConstelacion,
  onDelete,
  onClear,
}: {
  name: string;
  onNameChange: (v: string) => void;
  onStart: () => void;
  scans: ScanEntry[];
  onOpenConstelacion: () => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const canStart = name.trim().length > 0;

  return (
    <MobileShell>
      <div
        className="min-h-screen px-5 pb-32 pt-4 text-foreground"
        style={{
          background:
            "radial-gradient(120% 80% at 20% 0%, rgba(107,33,217,0.10), transparent 60%), radial-gradient(120% 80% at 80% 100%, rgba(138,56,245,0.08), transparent 60%), #F7F5FB",
        }}
      >
        <header className="flex items-center gap-3 py-2">
          <Link
            to="/"
            className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)] shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              SCANNER
            </p>
            <h1 className="text-lg font-bold text-foreground">Del subconsciente</h1>
          </div>
          <div
            className="grid h-10 w-10 place-items-center rounded-[10px]"
            style={{
              background: "linear-gradient(135deg, #6B21D9, #8A38F5)",
              boxShadow: "0 8px 20px -6px rgba(107,33,217,0.45)",
            }}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </header>

        <div className="mt-6 space-y-5">
          <div
            className="rounded-[10px] bg-white p-5 ring-1 ring-[rgba(107,33,217,0.16)]"
            style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
          >
            <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
              NOMBRE DE LA PERSONA
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canStart) onStart();
              }}
              placeholder="¿A quién vas a escanear?"
              maxLength={40}
              className="mt-3 w-full rounded-[10px] border border-[rgba(107,33,217,0.22)] bg-white px-4 py-3 text-base text-foreground outline-none ring-0 placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-[rgba(107,33,217,0.20)]"
            />
            <button
              disabled={!canStart}
              onClick={onStart}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#7A28E8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ScanFace className="h-4 w-4" />
              Comenzar escaneo
            </button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Necesitarás permitir acceso a la cámara.
            </p>
          </div>

          {/* Historial */}
          <div
            className="rounded-[10px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
            style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
          >
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-[10px] bg-[rgba(107,33,217,0.10)]">
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Historial</p>
                  <p className="text-[11px] text-muted-foreground">
                    {scans.length} {scans.length === 1 ? "escaneo" : "escaneos"} guardados
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4">
                    {scans.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground">
                        Aún no guardaste ningún escaneo.
                      </p>
                    ) : (
                      <>
                        <ul className="space-y-2">
                          {scans.map((s) => (
                            <li
                              key={s.id}
                              className="flex items-center gap-3 rounded-[10px] border border-[rgba(107,33,217,0.14)] bg-white p-3"
                            >
                              <div
                                className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-[rgba(107,33,217,0.25)]"
                                style={{
                                  background: s.thumbnail
                                    ? undefined
                                    : "linear-gradient(135deg, #6B21D9, #8A38F5)",
                                }}
                              >
                                {s.thumbnail ? (
                                  <img
                                    src={s.thumbnail}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <ScanFace className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">
                                  {s.name}
                                </p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {s.result.arquetipo} · {s.result.sleep_coin?.toFixed(2)} SLP
                                </p>
                                <p className="text-[10px] text-muted-foreground/80">
                                  {formatRelative(s.createdAt)}
                                </p>
                              </div>
                              <button
                                onClick={() => onDelete(s.id)}
                                aria-label="Eliminar"
                                className="grid h-8 w-8 place-items-center rounded-[10px] text-muted-foreground hover:bg-[rgba(107,33,217,0.08)] hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={onOpenConstelacion}
                            className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-[#7A28E8]"
                          >
                            <Stars className="h-3.5 w-3.5" />
                            Ver constelación
                          </button>
                          <button
                            onClick={onClear}
                            className="rounded-[10px] bg-white px-3 py-2 text-xs font-semibold text-foreground ring-1 ring-[rgba(107,33,217,0.22)] hover:bg-[rgba(107,33,217,0.06)]"
                          >
                            Limpiar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "hace unos segundos";
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `hace ${d} d`;
  return new Date(ts).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ----------------------------- Camera step ----------------------------- */

function CameraStep({
  name,
  onBack,
  onResult,
}: {
  name: string;
  onBack: () => void;
  onResult: (r: ScanResult, thumbnail: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const scan = useServerFn(scanSubconscious);

  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 720, height: 1280 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch {
        setError("No pudimos acceder a la cámara. Activá los permisos.");
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function capture() {
    if (!videoRef.current || analyzing) return;
    setAnalyzing(true);
    try {
      const v = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d")!;
      const size = Math.min(v.videoWidth, v.videoHeight);
      const sx = (v.videoWidth - size) / 2;
      const sy = (v.videoHeight - size) / 2;
      ctx.drawImage(v, sx, sy, size, size, 0, 0, 512, 512);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

      // small thumbnail for history
      const thumb = document.createElement("canvas");
      thumb.width = 96;
      thumb.height = 96;
      thumb.getContext("2d")!.drawImage(canvas, 0, 0, 96, 96);
      const thumbUrl = thumb.toDataURL("image/jpeg", 0.7);

      const res = await scan({ data: { imageBase64: dataUrl } });
      onResult(res as ScanResult, thumbUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <MobileShell hideNav>
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between bg-gradient-to-b from-background via-background/80 to-transparent px-5 py-4">
        <button
          onClick={onBack}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow backdrop-blur"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
        </button>
        <div className="text-center">
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground">ESCANEANDO A</p>
          <p className="text-xs font-semibold text-primary">{name || "ANÓNIMO"}</p>
        </div>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-white/80 shadow backdrop-blur">
          <Settings className="h-4 w-4 text-primary" />
        </button>
      </header>

      <div className="relative h-screen w-full overflow-hidden bg-black">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <FaceTracker analyzing={analyzing} />
        </div>

        <div className="absolute left-1/2 top-24 z-10 -translate-x-1/2 rounded-full bg-primary/80 px-3 py-1.5 text-[11px] font-medium text-white shadow backdrop-blur">
          <span className="mr-1">⚡</span>
          {analyzing ? "Tokenizando rasgos faciales…" : "Tracking facial activo · 68 landmarks"}
        </div>

        <div className="absolute left-4 right-4 top-36 z-10 flex justify-between text-[9px] font-mono tracking-wider text-white/70">
          <span>FACE_ID · 0x{Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")}</span>
          <span>SLP/USD · live</span>
        </div>

        {error && (
          <div className="absolute inset-x-5 top-32 z-30 rounded-2xl bg-destructive/90 p-4 text-sm text-destructive-foreground">
            {error}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-12 z-20 flex items-center justify-center gap-6">
          <button className="grid h-12 w-12 place-items-center rounded-full bg-primary/70 text-white backdrop-blur">
            <Zap className="h-5 w-5" />
          </button>
          <button
            onClick={capture}
            disabled={analyzing}
            className="grid h-20 w-20 place-items-center rounded-full text-white shadow-[var(--shadow-glow)] disabled:opacity-60"
            style={{ background: "var(--gradient-primary)" }}
            aria-label="Escanear"
          >
            {analyzing ? <Loader2 className="h-8 w-8 animate-spin" /> : <ScanFace className="h-8 w-8" />}
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-primary/70 text-white backdrop-blur">
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-background to-transparent py-3 text-center text-xs text-muted-foreground">
          {analyzing ? "Analizando tu subconsciente…" : "≋ VER RESULTADOS ≋"}
        </div>
      </div>
    </MobileShell>
  );
}

function FaceTracker({ analyzing }: { analyzing: boolean }) {
  const landmarks: [number, number][] = [
    [40, 130], [45, 170], [55, 210], [72, 245], [100, 275], [130, 290],
    [160, 275], [188, 245], [205, 210], [215, 170], [220, 130],
    [70, 110], [90, 100], [110, 102], [150, 102], [170, 100], [190, 110],
    [130, 130], [130, 155], [130, 180], [115, 195], [130, 200], [145, 195],
    [85, 135], [100, 128], [115, 135], [100, 142],
    [145, 135], [160, 128], [175, 135], [160, 142],
    [105, 230], [120, 225], [130, 228], [140, 225], [155, 230],
    [140, 240], [130, 245], [120, 240],
  ];
  const stroke = "oklch(0.85 0.12 285)";
  return (
    <div className="relative">
      <motion.svg
        width="260"
        height="320"
        viewBox="0 0 260 320"
        animate={{ opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        {[
          "M20 60 L20 20 L60 20",
          "M200 20 L240 20 L240 60",
          "M240 260 L240 300 L200 300",
          "M60 300 L20 300 L20 260",
        ].map((d, i) => (
          <path key={"c" + i} d={d} stroke={stroke} strokeWidth="3" fill="none" strokeLinecap="round" />
        ))}
        {landmarks.map((p, i) =>
          landmarks.slice(i + 1, i + 4).map((q, j) => (
            <line
              key={`l-${i}-${j}`}
              x1={p[0]}
              y1={p[1]}
              x2={q[0]}
              y2={q[1]}
              stroke={stroke}
              strokeOpacity="0.25"
              strokeWidth="0.6"
            />
          ))
        )}
        {landmarks.map(([x, y], i) => (
          <motion.circle
            key={"p" + i}
            cx={x}
            cy={y}
            r={1.6}
            fill={stroke}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: (i % 8) * 0.08 }}
          />
        ))}
        <motion.line
          x1="20"
          x2="240"
          stroke="oklch(0.92 0.18 290)"
          strokeWidth="1.5"
          animate={{ y1: [20, 300, 20], y2: [20, 300, 20], opacity: [0.9, 0.4, 0.9] }}
          transition={{ duration: analyzing ? 1.2 : 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  );
}

/* ----------------------------- Result view ----------------------------- */

function ResultView({
  result,
  name,
  saved,
  onSave,
  onOpenConstelacion,
  onReset,
}: {
  result: ScanResult;
  name: string;
  saved: boolean;
  onSave: () => void;
  onOpenConstelacion: () => void;
  onReset: () => void;
}) {
  return (
    <MobileShell>
      <header className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={onReset}
          className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)] shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-primary" />
        </button>
        <div>
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground">LECTURA DE</p>
          <h1 className="text-lg font-bold text-primary">{name || "ANÓNIMO"}</h1>
        </div>
      </header>
      <div className="space-y-4 px-5 pb-32 pt-2">
        <div
          className="relative overflow-hidden rounded-[10px] p-6 text-white shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-white/20 backdrop-blur">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] opacity-80">Valor del subconsciente</p>
                <p className="text-[10px] font-mono opacity-70">SLEEP COIN · SLP</p>
              </div>
            </div>
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                result.variacion >= 0 ? "bg-emerald-400/30" : "bg-rose-400/30"
              }`}
            >
              {result.variacion >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {result.variacion >= 0 ? "+" : ""}
              {result.variacion?.toFixed(2)}%
            </span>
          </div>

          <motion.p
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-4 font-mono text-5xl font-extrabold tabular-nums"
          >
            {result.sleep_coin?.toFixed(2)}{" "}
            <span className="text-xl opacity-70">SLP</span>
          </motion.p>
          <p className="mt-1 text-sm opacity-90">{result.estado}</p>

          <svg viewBox="0 0 200 40" className="mt-4 h-10 w-full opacity-90">
            <motion.polyline
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4 }}
              points={Array.from({ length: 24 }, (_, i) => {
                const x = (i / 23) * 200;
                const y = 20 + Math.sin(i * 0.7 + result.score) * 10 + (i / 23) * (result.variacion >= 0 ? -8 : 8);
                return `${x},${y}`;
              }).join(" ")}
            />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Metric label="Claridad" value={result.claridad} />
          <Metric label="Emoción" value={result.carga_emocional} />
          <Metric label="Simetría" value={result.simetria ?? 70} />
        </div>

        <div className="rounded-[10px] bg-card p-5 ring-1 ring-border shadow-[var(--shadow-soft)]">
          <p className="text-[10px] tracking-[0.25em] text-muted-foreground">RASGOS DETECTADOS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(result.rasgos ?? []).map((r, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {r}
              </motion.span>
            ))}
          </div>
        </div>

        <div className="rounded-[10px] bg-card p-5 ring-1 ring-border shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <p className="text-[10px] tracking-[0.25em] text-muted-foreground">ARQUETIPO DOMINANTE</p>
            <p className="text-[10px] font-mono text-muted-foreground">RES · {result.score}/100</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold text-primary">{result.arquetipo}</p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/80">{result.narrativa}</p>
        </div>

        <p className="px-2 text-center text-[10px] text-muted-foreground">
          Sleep Coin (SLP) es una unidad simbólica dentro de Sleep Stock. Contenido lúdico-reflexivo,
          no constituye diagnóstico médico ni valor financiero real.
        </p>

        <div className="space-y-2">
          <button
            onClick={onSave}
            disabled={saved}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[#7A28E8] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Guardado en el historial
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Guardar resultado
              </>
            )}
          </button>
          <button
            onClick={onOpenConstelacion}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-white px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-[rgba(107,33,217,0.22)] transition hover:bg-[rgba(107,33,217,0.06)]"
          >
            <Stars className="h-4 w-4 text-primary" />
            Ver constelación
          </button>
          <button
            onClick={onReset}
            className="w-full rounded-[10px] bg-white px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-[rgba(107,33,217,0.22)] transition hover:bg-[rgba(107,33,217,0.06)]"
          >
            Escanear de nuevo
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[10px] bg-card p-3 ring-1 ring-border shadow-[var(--shadow-soft)]">
      <p className="text-[9px] tracking-[0.2em] text-muted-foreground">{label.toUpperCase()}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-foreground">{value}%</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
        />
      </div>
    </div>
  );
}

/* --------------------------- Constelación ----------------------------- */

const ARQUETIPO_COLORS = [
  "#6B21D9",
  "#8A38F5",
  "#A855F7",
  "#7C3AED",
  "#5B21B6",
  "#C084FC",
  "#4A1AA8",
  "#9333EA",
];

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function colorForArquetipo(a: string, all: string[]): string {
  const unique = Array.from(new Set(all));
  const idx = unique.indexOf(a);
  return ARQUETIPO_COLORS[(idx >= 0 ? idx : 0) % ARQUETIPO_COLORS.length];
}

function ConstelacionOverlay({
  scans,
  onClose,
}: {
  scans: ScanEntry[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const width = 360;
  const height = 480;
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) / 2 - 40;

  const arquetipos = useMemo(
    () => Array.from(new Set(scans.map((s) => s.result.arquetipo))),
    [scans],
  );

  const nodes = useMemo(() => {
    return scans.map((s) => {
      const angle = (hashStr(s.name + s.id) % 360) * (Math.PI / 180);
      const score = Math.max(0, Math.min(100, s.result.score ?? 50));
      const r = maxR * (1 - score / 140); // higher score → closer to center
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      const size = 6 + Math.min(18, (s.result.sleep_coin ?? 0) / 8);
      const color = colorForArquetipo(s.result.arquetipo, arquetipos);
      return { entry: s, x, y, size, color };
    });
  }, [scans, arquetipos, cx, cy, maxR]);

  const links = useMemo(() => {
    const out: { a: number; b: number; common: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const ra = new Set(nodes[i].entry.result.rasgos ?? []);
        const rb = nodes[j].entry.result.rasgos ?? [];
        const common = rb.filter((r) => ra.has(r)).length;
        if (common > 0) out.push({ a: i, b: j, common });
      }
    }
    return out;
  }, [nodes]);

  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        x: (hashStr("x" + i) % 1000) / 1000 * width,
        y: (hashStr("y" + i) % 1000) / 1000 * height,
        r: 0.4 + ((hashStr("r" + i) % 100) / 100) * 0.8,
        o: 0.15 + ((hashStr("o" + i) % 100) / 100) * 0.3,
      })),
    [],
  );

  const sel = nodes.find((n) => n.entry.id === selected);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background:
          "radial-gradient(80% 60% at 50% 30%, rgba(107,33,217,0.18), transparent 70%), #F7F5FB",
        backdropFilter: "blur(8px)",
      }}
    >
      <header className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
            CONSTELACIÓN
          </p>
          <h2 className="text-lg font-bold text-foreground">De los subconscientes</h2>
        </div>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-[10px] bg-white ring-1 ring-[rgba(107,33,217,0.22)] shadow-sm"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4 text-foreground" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {nodes.length < 2 ? (
          <div
            className="mx-auto mt-10 max-w-sm rounded-[10px] bg-white p-6 text-center ring-1 ring-[rgba(107,33,217,0.16)]"
            style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
          >
            <Stars className="mx-auto h-8 w-8 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">
              Necesitas al menos 2 escaneos
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Guardá más resultados para formar una constelación.
            </p>
          </div>
        ) : (
          <>
            <div
              className="relative mx-auto overflow-hidden rounded-[10px] ring-1 ring-[rgba(107,33,217,0.16)]"
              style={{
                width: "100%",
                maxWidth: width,
                background:
                  "radial-gradient(60% 50% at 50% 50%, rgba(107,33,217,0.10), transparent 70%), #FBFAFE",
                boxShadow: "0 8px 30px -12px rgba(107,33,217,0.30)",
              }}
            >
              <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full">
                {/* background stars */}
                {stars.map((s, i) => (
                  <circle
                    key={"s" + i}
                    cx={s.x}
                    cy={s.y}
                    r={s.r}
                    fill="#6B21D9"
                    opacity={s.o}
                  />
                ))}

                {/* links */}
                {links.map((l, i) => {
                  const a = nodes[l.a];
                  const b = nodes[l.b];
                  return (
                    <motion.line
                      key={"ln" + i}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="#6B21D9"
                      strokeOpacity={Math.min(0.55, 0.12 + l.common * 0.12)}
                      strokeWidth={0.6 + Math.min(2, l.common * 0.4)}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, delay: 0.2 + i * 0.04 }}
                    />
                  );
                })}

                {/* center marker */}
                <circle cx={cx} cy={cy} r={3} fill="#4A1AA8" opacity={0.5} />
                <circle cx={cx} cy={cy} r={8} fill="none" stroke="#6B21D9" strokeOpacity={0.3} />

                {/* nodes */}
                {nodes.map((n, i) => {
                  const isSel = selected === n.entry.id;
                  return (
                    <motion.g
                      key={n.entry.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.08, type: "spring", stiffness: 120 }}
                      style={{ cursor: "pointer", transformOrigin: `${n.x}px ${n.y}px` }}
                      onClick={() => setSelected(isSel ? null : n.entry.id)}
                    >
                      <motion.circle
                        cx={n.x}
                        cy={n.y}
                        r={n.size + 4}
                        fill={n.color}
                        opacity={0.18}
                        animate={{ opacity: [0.12, 0.28, 0.12] }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          delay: (i % 5) * 0.3,
                        }}
                      />
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={n.size}
                        fill={n.color}
                        stroke={isSel ? "#4A1AA8" : "#FFFFFF"}
                        strokeWidth={isSel ? 2.5 : 1.5}
                      />
                      <text
                        x={n.x}
                        y={n.y + n.size + 12}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill="#4A1AA8"
                      >
                        {n.entry.name.slice(0, 14)}
                      </text>
                    </motion.g>
                  );
                })}
              </svg>
            </div>

            {/* selected tooltip */}
            <AnimatePresence>
              {sel && (
                <motion.div
                  key={sel.entry.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mx-auto mt-4 max-w-sm rounded-[10px] bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
                  style={{ boxShadow: "0 8px 24px -12px rgba(107,33,217,0.30)" }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: sel.color }}
                    />
                    <p className="flex-1 text-sm font-bold text-foreground">{sel.entry.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">
                      {sel.entry.result.sleep_coin?.toFixed(2)} SLP
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {sel.entry.result.arquetipo} · score {sel.entry.result.score}/100 ·{" "}
                    {formatRelative(sel.entry.createdAt)}
                  </p>
                  {sel.entry.result.rasgos?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sel.entry.result.rasgos.slice(0, 6).map((r, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-[rgba(107,33,217,0.10)] px-2 py-0.5 text-[10px] font-medium text-primary"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* legend */}
            <div className="mx-auto mt-4 max-w-sm">
              <p className="text-[10px] font-bold tracking-[0.25em] text-muted-foreground">
                ARQUETIPOS
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {arquetipos.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-foreground ring-1 ring-[rgba(107,33,217,0.18)]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: colorForArquetipo(a, arquetipos) }}
                    />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
