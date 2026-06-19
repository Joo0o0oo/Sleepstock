import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Moon, Activity, Sparkles, ChevronRight } from "lucide-react";
import { dreamPresence } from "@/lib/dream-presence-mock";

function DreamIllustration() {
  return (
    <svg viewBox="0 0 140 100" className="h-14 w-20 shrink-0" aria-hidden>
      <ellipse cx="90" cy="55" rx="45" ry="30" fill="url(#cloudGrad)" opacity="0.55" />
      <ellipse cx="50" cy="70" rx="35" ry="22" fill="url(#cloudGrad2)" opacity="0.45" />
      <path
        d="M105 25 A18 18 0 1 1 95 55 A14 14 0 1 0 105 25Z"
        fill="url(#moonGrad)"
      />
      <circle cx="30" cy="22" r="1.5" fill="#A78BFA" opacity="0.9" />
      <circle cx="125" cy="18" r="1.2" fill="#F0ABFC" opacity="0.8" />
      <circle cx="115" cy="72" r="1" fill="#A78BFA" opacity="0.7" />
      <circle cx="22" cy="50" r="1" fill="#F0ABFC" opacity="0.6" />
      <circle cx="55" cy="14" r="0.8" fill="#A78BFA" opacity="0.8" />
      <defs>
        <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cloudGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F0ABFC" />
          <stop offset="100%" stopColor="#F0ABFC" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DreamingOfYouWidget() {
  const reduce = useReducedMotion();

  return (
    <Link
      to="/sonando-conmigo"
      className="relative block overflow-hidden rounded-[20px] bg-card p-4 ring-1 ring-[rgba(107,33,217,0.12)] shadow-[var(--shadow-soft)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] font-bold tracking-[0.22em] text-primary">
            ACTIVIDAD ONÍRICA
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold text-primary ring-1 ring-border">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              animate={reduce ? undefined : { opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            EN ESTE MOMENTO
          </span>
          <Activity className="h-3.5 w-3.5 text-[#A78BFA]" />
        </div>
      </div>

      {/* Hero row */}
      <div className="mt-3 flex items-start gap-2.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-[rgba(107,33,217,0.20)]">
            <div
              className="flex h-full w-full items-center justify-center text-sm font-bold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              {dreamPresence.topDreamer[0]}
            </div>
          </div>
          <div className="absolute -bottom-0.5 -left-0.5 grid h-4 w-4 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
          </div>
          <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="text-[15px] font-semibold leading-[1.2] tracking-[-0.01em] text-foreground">
            {dreamPresence.topDreamer} está soñando{" "}
            <span className="text-primary">con vos</span>{" "}
            <Sparkles className="inline-block h-3.5 w-3.5 text-primary-glow" />
          </h3>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Detectamos tu presencia en su sueño{" "}
            <span className="font-semibold text-primary">ahora mismo.</span>
          </p>
        </div>

        <DreamIllustration />
      </div>

      {/* Intensity bar */}
      <div className="mt-3 flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2 ring-1 ring-border/60">
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-card shadow-sm ring-1 ring-border">
          <Activity className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-foreground leading-tight">Intensidad de tu presencia</p>
        </div>
        <span className="shrink-0 text-lg font-bold tracking-[-0.02em] text-primary">
          {dreamPresence.emotionalMatch}%
        </span>
        <div className="flex items-end gap-[2px]">
          {Array.from({ length: 10 }).map((_, i) => {
            const filled = i < Math.round(dreamPresence.emotionalMatch / 10);
            return (
              <span
                key={i}
                className="inline-block w-[2.5px] rounded-full"
                style={{
                  height: `${5 + (i % 3) * 3}px`,
                  background: filled
                    ? "var(--primary)"
                    : "rgba(107, 33, 217, 0.18)",
                }}
              />
            );
          })}
        </div>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
