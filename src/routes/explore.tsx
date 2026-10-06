import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { listApps } from "@/lib/apps.functions";
import { AppCard } from "@/components/applifyr/app-card";
import { categories, categoryLabels } from "@/lib/categories";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/explore")({
  loader: () => listApps({ data: {} }),
  head: () => ({ meta: [
    { title: "Explore apps — APPLIFYR" },
    { name: "description", content: "Browse the APPLIFYR index of useful, verified software." },
    { property: "og:title", content: "Explore apps — APPLIFYR" },
    { property: "og:description", content: "Browse the APPLIFYR index of useful, verified software." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ExplorePage,
});

function ExplorePage() {
  const apps = Route.useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return apps.filter((app) => {
      if (category !== "all" && app.category !== category) return false;
      if (!needle) return true;
      return [app.title, app.tagline, app.description].some((field) => field.toLowerCase().includes(needle));
    });
  }, [apps, query, category]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <p className="font-mono text-xs uppercase text-signal">Directory / All signals</p>
      <h1 className="mt-4 font-display text-5xl font-semibold">Explore the index.</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Useful software, reviewed and organized for fast discovery.</p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, tagline, or description…" className="sm:max-w-sm" aria-label="Search apps" />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm" aria-label="Filter by category">
          <option value="all">All categories</option>
          {categories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
        </select>
        <p className="font-mono text-xs text-muted-foreground sm:ml-auto sm:self-center">{visible.length} of {apps.length} apps</p>
      </div>
      {visible.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 border border-border bg-card px-6 py-16 text-center">
          <SearchX className="size-8 text-signal" />
          <p className="text-muted-foreground">No apps match{query ? ` “${query}”` : ""}{category !== "all" ? ` in ${categoryLabels[category] ?? category}` : ""}. Try a different search or category.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visible.map((app) => <AppCard key={app.id} app={app} />)}</div>
      )}
    </section>
  );
}
