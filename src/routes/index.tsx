import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, RadioTower } from "lucide-react";
import { listApps } from "@/lib/apps.functions";
import { AppCard } from "@/components/applifyr/app-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: () => listApps({ data: {} }),
  head: () => ({ meta: [
    { title: "APPLIFYR — Discover apps worth using" },
    { name: "description", content: "Find useful software faster and help great apps reach the right users." },
    { property: "og:title", content: "APPLIFYR — Discover apps worth using" },
    { property: "og:description", content: "Find useful software faster and help great apps reach the right users." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: HomePage,
});

function HomePage() {
  const apps = Route.useLoaderData();
  const featured = apps.filter((app) => app.featured).slice(0, 4);
  const [page, setPage] = useState(0);
  const pageSize = 6;
  const pages = Math.ceil(apps.length / pageSize);
  const recent = apps.slice(page * pageSize, (page + 1) * pageSize);
  return (
    <>
      <section className="industrial-grid relative overflow-hidden border-b border-border">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal to-transparent opacity-70" />
        <div className="mx-auto flex min-h-[650px] max-w-7xl flex-col justify-center px-5 py-24 lg:px-8">
          <div className="mb-8 flex items-center gap-3 font-mono text-[11px] uppercase text-signal"><RadioTower className="size-4" /><span>Discover</span><span className="text-muted-foreground">•</span><span>Amplify</span><span className="text-muted-foreground">•</span><span>Distribute</span></div>
          <h1 className="max-w-5xl text-balance font-display text-6xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-7xl lg:text-8xl">Discover apps<br /><span className="text-signal">worth using.</span></h1>
          <p className="mt-7 max-w-2xl text-balance text-lg leading-8 text-muted-foreground">APPLIFYR helps people find useful software faster—and helps great apps reach the right users.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild><Link to="/explore">Explore the directory <ArrowRight /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/submit">Submit your app</Link></Button>
          </div>
        </div>
      </section>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">
          {[['2,184+', 'Apps indexed'], ['92%', 'Verified'], ['48', 'Categories']].map(([value,label]) => <div key={label} className="py-7 sm:px-8 first:pl-0"><div className="font-mono text-2xl font-semibold text-signal">{value}</div><div className="mt-1 text-xs uppercase text-muted-foreground">{label}</div></div>)}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-9 flex items-end justify-between gap-4"><div><p className="font-mono text-[11px] uppercase text-signal">Editor signal / 01</p><h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Featured this week</h2></div><Link to="/explore" className="hidden text-sm text-muted-foreground hover:text-signal sm:block">View all apps →</Link></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{featured.map((app) => <AppCard key={app.id} app={app} featured />)}</div>
      </section>
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mb-9 flex items-end justify-between"><div><p className="font-mono text-[11px] uppercase text-signal">Latest index / 02</p><h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Recent submissions</h2></div><div className="font-mono text-xs text-muted-foreground">{String(page + 1).padStart(2,'0')} / {String(pages).padStart(2,'0')}</div></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{recent.map((app) => <AppCard key={app.id} app={app} />)}</div>
          <div className="mt-8 flex justify-end gap-2"><Button variant="outline" size="icon" disabled={page === 0} onClick={() => setPage((p) => p - 1)} aria-label="Previous page"><ChevronLeft /></Button><Button variant="outline" size="icon" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} aria-label="Next page"><ChevronRight /></Button></div>
        </div>
      </section>
    </>
  );
}
