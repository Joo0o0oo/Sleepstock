import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Moon, Paperclip, ArrowUp, UserCircle2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts";
import { MobileShell } from "@/components/MobileShell";
import { MentionsWidget } from "@/components/home/MentionsWidget";
import { DreamingOfYouWidget } from "@/components/home/DreamingOfYouWidget";
import faceMesh from "@/assets/face-mesh.png";
import { useState } from "react";



export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sleep Stock — Decodificá tu subconsciente" },
      { name: "description", content: "Interpretá tus sueños con IA y escaneá tu subconsciente con la cámara." },
      { property: "og:title", content: "Sleep Stock" },
      { property: "og:description", content: "Interpretá tus sueños con IA y escaneá tu subconsciente." },
    ],
  }),
  component: Home,
});

const sparkData = [
  { v: 30 }, { v: 35 }, { v: 32 }, { v: 45 }, { v: 50 }, { v: 60 }, { v: 75 }, { v: 92 },
];

function Home() {
  return (
    <MobileShell>
      <Header />
      <div className="px-5 pt-4 space-y-6">
        <DreamingOfYouWidget />

        <Section label="Monitoreo activo">
          <MonitoringGrid />
          <BrainCard />
        </Section>

        <MentionsWidget />

        <Section label="Decodificador de sueños">
          <DreamChatCard />
        </Section>
      </div>
    </MobileShell>
  );
}


function Header() {
  return (
    <header className="relative px-5 pt-6 pb-2">
      <div className="flex items-center justify-between">
        <span className="hypn-chip">INICIO</span>
        <div className="flex items-center gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-[var(--shadow-soft)] ring-1 ring-border"
            aria-label="Notificaciones"
          >
            <Bell className="h-4 w-4 text-primary" />
          </button>
          <Link
            to="/perfil"
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-white shadow-[var(--shadow-soft)] ring-1 ring-border"
            aria-label="Mi perfil"
          >
            <UserCircle2 className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </div>

      <div className="mt-7">
        <p className="hypn-eyebrow">— 10 DIC, 2026</p>
        <h1 className="mt-2 text-3xl font-light leading-tight text-foreground">Buenas tardes,</h1>
        <h2 className="hypn-display mt-1 text-[56px] text-primary">SERENA</h2>
      </div>
    </header>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <p className="text-[10px] font-medium tracking-[0.25em] text-muted-foreground">— {label.toUpperCase()}</p>
      {children}
    </section>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl bg-card p-4 ring-1 ring-border shadow-[var(--shadow-soft)] ${className}`}>
      {children}
    </div>
  );
}

function MonitoringGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="row-span-2 flex flex-col items-center">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary/70">ESTADO ÓPTIMO</p>
        <img src={faceMesh} alt="" aria-hidden width={512} height={512} loading="lazy" className="my-2 h-32 w-32 object-contain" />
        <div className="mt-auto w-full">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-foreground">77%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[77%] rounded-full" style={{ background: "var(--gradient-primary)" }} />
          </div>
        </div>
      </Card>
      <Card>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary/70">ESTRÉS NOCTURNO</p>
        <div className="mt-1 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">18%</p>
            <p className="text-[10px] text-muted-foreground">Bajo</p>
          </div>
          <Moon className="h-8 w-8 text-accent" fill="currentColor" />
        </div>
      </Card>
      <Card>
        <p className="text-[10px] font-semibold tracking-[0.2em] text-primary/70">ACTIVIDAD REM</p>
        <p className="mt-1 text-2xl font-bold text-foreground">92%</p>
        <p className="text-[10px] text-muted-foreground">Óptimo</p>
        <div className="-mx-1 -mb-1 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.68 0.13 280)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(0.68 0.13 280)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="oklch(0.68 0.13 280)" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function BrainCard() {
  const wave = Array.from({ length: 30 }, (_, i) => ({ v: Math.sin(i / 1.5) * 20 + Math.random() * 15 }));
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-primary/70">ACTIVIDAD CEREBRAL</p>
          <p className="text-lg font-bold text-foreground">BAJA SATURACIÓN</p>
        </div>
        <div className="h-10 w-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={wave}>
              <Line type="monotone" dataKey="v" stroke="oklch(0.68 0.13 280)" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function DreamChatCard() {
  const [msg, setMsg] = useState("");
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: "var(--gradient-primary)" }}>
            BOT
          </div>
          <span className="font-semibold text-primary">Sleep BOT</span>
        </div>
        <span className="text-muted-foreground">···</span>
      </div>
      <Link
        to="/sueno/chat"
        search={{ q: msg }}
        className="mt-4 flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-3"
      >
        <Paperclip className="h-4 w-4 text-muted-foreground" />
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Escribí tu sueño…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.key === "Enter" && (e.currentTarget.closest("a") as HTMLAnchorElement)?.click()}
        />
        <span className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: "var(--gradient-primary)" }}>
          <ArrowUp className="h-4 w-4" />
        </span>
      </Link>
    </Card>
  );
}
