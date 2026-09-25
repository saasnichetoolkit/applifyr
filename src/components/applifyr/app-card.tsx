import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import type { AppRecord } from "@/lib/apps.functions";
import { categoryLabels } from "@/lib/categories";

export function AppCard({ app, featured = false }: { app: AppRecord; featured?: boolean }) {
  return (
    <Link
      to="/app/$slug"
      params={{ slug: app.slug }}
      className={`group relative flex min-h-56 flex-col border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/70 ${featured ? "border-brand/40 shadow-glow" : "border-border"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="grid size-11 place-items-center rounded-md border border-border bg-secondary font-mono text-sm font-bold text-signal">
          {app.logo_text}
        </div>
        <div className="rounded-md border border-signal/30 bg-signal/10 px-2.5 py-1.5 font-mono text-lg font-semibold text-signal">
          {Number(app.score).toFixed(1)}
        </div>
      </div>
      <div className="mt-7 flex items-center gap-2">
        <h3 className="font-display text-xl font-semibold text-foreground">{app.name}</h3>
        {app.verified && <BadgeCheck className="size-4 text-signal" aria-label="Verified" />}
      </div>
      <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{app.tagline}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="rounded border border-border bg-secondary px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground">
          {categoryLabels[app.category] ?? app.category}
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition-colors group-hover:text-signal" />
      </div>
    </Link>
  );
}
