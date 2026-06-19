import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Heart, Clock, Network } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { dreamPresence } from "@/lib/dream-presence-mock";

export const Route = createFileRoute("/sonando-conmigo")({
  head: () => ({
    meta: [
      { title: "Están soñando con vos — Sleep Stock" },
      { name: "description", content: "Tu actividad onírica: quiénes te soñaron, frecuencia, intensidad emocional y mapa de conexiones." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MobileShell>
      <div
        className="relative overflow-hidden px-5 pb-6 pt-6 text-white"
        style={{
          background:
            "radial-gradient(120% 100% at 0% 0%, #4C1D95 0%, #1E1B4B 50%, #0B0820 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)", filter: "blur(20px)" }} />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.45), transparent 70%)", filter: "blur(20px)" }} />

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-violet-100">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <p className="mt-4 text-[11px] font-bold tracking-[0.22em] text-violet-100">ACTIVIDAD ONÍRICA</p>
          <h1 className="mt-1 text-[28px] font-light leading-tight text-white">
            🌙 Están soñando <span className="font-semibold text-pink-200">con vos</span>
          </h1>
          <p className="mt-2 text-[14px] leading-snug text-violet-50">
            Apareciste en {dreamPresence.totalLast24h} sueños recientes · coincidencia emocional {dreamPresence.emotionalMatch}%
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <HeroStat label="Sueños" value={String(dreamPresence.totalLast24h)} />
            <HeroStat label="Coincidencia" value={`${dreamPresence.emotionalMatch}%`} />
            <HeroStat label="Semana" value={`+${dreamPresence.weeklyDelta}%`} />
          </div>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6">
        {/* Resumen IA */}
        <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />} label="Resumen IA" />
        <div
          className="rounded-2xl bg-white p-4 ring-1 ring-[rgba(107,33,217,0.16)]"
          style={{ boxShadow: "0 4px 20px -10px rgba(107,33,217,0.25)" }}
        >
          <p className="text-sm leading-relaxed text-foreground/85">{dreamPresence.aiSummary}</p>
        </div>

        {/* Personas */}
        <SectionTitle icon={<Heart className="h-3.5 w-3.5" />} label="Personas que soñaron con vos" />
        <div className="space-y-2">
          {dreamPresence.dreamers.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-[rgba(107,33,217,0.12)]">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${d.color}, #1E1B4B)` }}
              >
                {d.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">{d.lastSeen}</p>
                </div>
                <p className="text-[12px] font-medium text-muted-foreground">{d.frequency} apariciones · intensidad {d.intensity}%</p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${d.intensity}%`, background: `linear-gradient(90deg, ${d.color}, #EC4899)` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Línea temporal */}
        <SectionTitle icon={<Clock className="h-3.5 w-3.5" />} label="Línea temporal" />
        <div className="relative space-y-3 pl-5">
          <div className="absolute bottom-1 left-1.5 top-1 w-px bg-gradient-to-b from-violet-400/60 via-pink-300/40 to-transparent" />
          {dreamPresence.timeline.map((t) => (
            <div key={t.id} className="relative">
              <div className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-pink-400 ring-2 ring-violet-200/60" />
              <div className="rounded-xl bg-white p-3 ring-1 ring-[rgba(107,33,217,0.12)]">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold text-primary">{t.dreamer}</p>
                  <p className="text-[10px] text-muted-foreground">{t.when}</p>
                </div>
                <p className="mt-0.5 text-sm text-foreground/85">{t.snippet}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{t.emotion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mapa de conexiones */}
        <SectionTitle icon={<Network className="h-3.5 w-3.5" />} label="Mapa de conexiones" />
        <ConnectionMap />

        {/* Coincidencias */}
        <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />} label="Coincidencias detectadas" />
        <div className="flex flex-wrap gap-2">
          {dreamPresence.matches.map((m, i) => (
            <span
              key={i}
              className="rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-foreground/85 ring-1 ring-[rgba(107,33,217,0.16)]"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-2.5 py-2 ring-1 ring-white/25 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-100">{label}</p>
      <p className="mt-0.5 text-[17px] font-bold leading-tight text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span>— {label.toUpperCase()}</span>
    </div>
  );
}

function ConnectionMap() {
  const center = { x: 160, y: 110 };
  const nodes = dreamPresence.dreamers.map((d, i) => {
    const angle = (i / dreamPresence.dreamers.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 70 + (100 - d.intensity) * 0.4;
    return {
      ...d,
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-3 text-white"
      style={{
        background: "radial-gradient(120% 100% at 50% 0%, #4C1D95 0%, #1E1B4B 60%, #0B0820 100%)",
        boxShadow: "0 10px 40px -20px rgba(139,92,246,0.55)",
      }}
    >
      <svg viewBox="0 0 320 220" className="w-full">
        <defs>
          <radialGradient id="centerGrad">
            <stop offset="0%" stopColor="#F0ABFC" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </radialGradient>
        </defs>
        {nodes.map((n) => (
          <line
            key={`l-${n.id}`}
            x1={center.x}
            y1={center.y}
            x2={n.x}
            y2={n.y}
            stroke={n.color}
            strokeOpacity={0.5}
            strokeWidth={Math.max(1, n.intensity / 30)}
          />
        ))}
        {nodes.map((n) => (
          <g key={n.id}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r={14}
              fill={n.color}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity, delay: Math.random() }}
            />
            <text x={n.x} y={n.y + 4} textAnchor="middle" className="fill-white text-[10px] font-bold">
              {n.initials}
            </text>
            <text x={n.x} y={n.y + 28} textAnchor="middle" className="fill-violet-200 text-[9px]">
              {n.name.split(" ")[0]}
            </text>
          </g>
        ))}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r={26}
          fill="url(#centerGrad)"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${center.x}px ${center.y}px` }}
        />
        <text x={center.x} y={center.y + 4} textAnchor="middle" className="fill-white text-[11px] font-bold">
          VOS
        </text>
      </svg>
    </div>
  );
}
