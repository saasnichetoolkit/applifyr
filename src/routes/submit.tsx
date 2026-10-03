import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { analyzeAppUrl, submitApp } from "@/lib/apps.functions";
import { categories } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/submit")({
  head: () => ({ meta: [
    { title: "Submit an app — APPLIFYR" },
    { name: "description", content: "Submit your web app. Paste a URL and let AI draft your listing for review." },
    { property: "og:title", content: "Submit an app — APPLIFYR" },
    { property: "og:description", content: "Submit your web app. Paste a URL and let AI draft your listing for review." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ]}),
  component: SubmitPage,
});

const empty = { websiteUrl: "", name: "", tagline: "", description: "", category: "productivity" };

function SubmitPage() {
  const submit = useServerFn(submitApp);
  const analyze = useServerFn(analyzeAppUrl);
  const [form, setForm] = useState(empty);
  const [score, setScore] = useState<number | undefined>();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onAnalyze() {
    setError("");
    try { new URL(form.websiteUrl); } catch { setError("Enter a full website URL first (https://…)"); return; }
    setAnalyzing(true);
    try {
      const res = await analyze({ data: { url: form.websiteUrl } });
      if (!res.ok) { setError(res.error); return; }
      const r = res.result;
      setForm((f) => ({ ...f, name: r.title || f.name, tagline: r.tagline || f.tagline, description: r.description || f.description, category: r.category }));
      setScore(r.score);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally { setAnalyzing(false); }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      await submit({ data: { ...form, score } });
      setDone(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Submission failed"); }
    finally { setBusy(false); }
  }

  if (done) return (
    <section className="grid min-h-[70vh] place-items-center px-5"><div className="max-w-md text-center"><CheckCircle2 className="mx-auto size-10 text-signal" /><h1 className="mt-6 font-display text-4xl font-semibold">Signal received.</h1><p className="mt-3 text-muted-foreground">Your app is pending review. Once approved, it publishes to the public directory automatically.</p></div></section>
  );

  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 md:grid-cols-[1fr_1.2fr] lg:px-8">
      <div>
        <p className="font-mono text-xs uppercase text-signal">Submission / Intake</p>
        <h1 className="mt-4 font-display text-5xl font-semibold">Put your app on the radar.</h1>
        <p className="mt-5 leading-7 text-muted-foreground">Paste your URL and let AI draft the listing, then edit anything before submitting. Every submission is reviewed before it appears in the directory.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6 border border-border bg-card p-7">
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website URL</Label>
          <div className="flex gap-2">
            <Input id="websiteUrl" type="url" placeholder="https://" required value={form.websiteUrl} onChange={set("websiteUrl")} />
            <Button type="button" variant="outline" onClick={onAnalyze} disabled={analyzing}><Sparkles />{analyzing ? "Analyzing…" : "Auto-fill"}</Button>
          </div>
        </div>
        {score !== undefined && <div className="font-mono text-xs text-muted-foreground">AI glow score: <span className="text-signal">{score.toFixed(1)}</span> / 10</div>}
        <div className="space-y-2"><Label htmlFor="name">App title</Label><Input id="name" required minLength={2} maxLength={80} value={form.name} onChange={set("name")} /></div>
        <div className="space-y-2"><Label htmlFor="category">Category</Label><select id="category" required value={form.category} onChange={set("category")} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{categories.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></div>
        <div className="space-y-2"><Label htmlFor="tagline">One-line tagline</Label><Textarea id="tagline" required minLength={8} maxLength={140} value={form.tagline} onChange={set("tagline")} /></div>
        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" required minLength={20} maxLength={1200} rows={6} value={form.description} onChange={set("description")} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit for review"}</Button>
      </form>
    </section>
  );
}
