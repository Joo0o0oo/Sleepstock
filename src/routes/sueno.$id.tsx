import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { getDream, type Dream } from "@/lib/dreams-store";

export const Route = createFileRoute("/sueno/$id")({
  head: () => ({ meta: [{ title: "Sueño — Sleep Stock" }] }),
  component: DreamDetail,
});

function DreamDetail() {
  const { id } = Route.useParams();
  const [dream, setDream] = useState<Dream | undefined>();
  useEffect(() => setDream(getDream(id)), [id]);

  if (!dream)
    return (
      <MobileShell>
        <div className="p-6 text-center text-muted-foreground">Cargando…</div>
      </MobileShell>
    );

  return (
    <MobileShell>
      <div className="relative">
        <img src={dream.image} alt={dream.title} className="h-72 w-full object-cover" />
        <Link to="/" className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow backdrop-blur">
          <ArrowLeft className="h-4 w-4 text-primary" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-5 pt-12">
          <p className="text-xs text-muted-foreground">{dream.date}</p>
          <h1 className="text-2xl font-extrabold text-primary">{dream.title}</h1>
        </div>
      </div>
      <div className="px-5 py-6">
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border shadow-[var(--shadow-soft)] prose prose-sm prose-headings:text-primary prose-strong:text-primary max-w-none">
          <ReactMarkdown>{dream.analysis}</ReactMarkdown>
        </div>
      </div>
    </MobileShell>
  );
}