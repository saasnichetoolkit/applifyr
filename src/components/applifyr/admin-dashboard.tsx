import { useMemo, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, ExternalLink, Eye, Pencil, RadioTower, Star, X } from "lucide-react";
import type { AppRecord } from "@/lib/apps.functions";
import { updateAppDetails, updateAppStatus } from "@/lib/admin.functions";
import { categories, categoryLabels } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { IngestionPanel } from "./ingestion-panel";

type Status = "pending" | "approved" | "featured" | "rejected";
const statusOrder: Status[] = ["pending", "approved", "featured", "rejected"];

export function AdminDashboard({ initialApps }: { initialApps: AppRecord[] }) {
  const saveDetails = useServerFn(updateAppDetails);
  const saveStatus = useServerFn(updateAppStatus);
  const [apps, setApps] = useState(initialApps);
  const [status, setStatus] = useState<Status>("pending");
  const [editing, setEditing] = useState<AppRecord | null>(null);
  const [viewing, setViewing] = useState<AppRecord | null>(null);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const counts = useMemo(() => Object.fromEntries(statusOrder.map((item) => [item, apps.filter((app) => app.status === item).length])), [apps]);
  const visible = apps.filter((app) => app.status === status);

  async function changeStatus(app: AppRecord, nextStatus: Status) {
    setBusyId(app.id); setMessage("");
    try {
      await saveStatus({ data: { id: app.id, status: nextStatus } });
      setApps((items) => items.map((item) => item.id === app.id ? { ...item, status: nextStatus, active: nextStatus === "approved" || nextStatus === "featured", is_featured: nextStatus === "featured", featured: nextStatus === "featured", is_verified: nextStatus === "approved" || nextStatus === "featured", verified: nextStatus === "approved" || nextStatus === "featured" } : item));
      setMessage(`${app.title} is now ${nextStatus}.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Status update failed"); }
    finally { setBusyId(""); }
  }

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const rating = Number(form.get("rating"));
    setBusyId(editing.id); setMessage("");
    try {
      await saveDetails({ data: {
        id: editing.id,
        title: String(form.get("title")), slug: String(form.get("slug")),
        tagline: String(form.get("tagline")), description: String(form.get("description")),
        websiteUrl: String(form.get("websiteUrl")), category: String(form.get("category")),
        rating, isVerified: form.get("isVerified") === "on",
      } });
      setApps((items) => items.map((item) => item.id === editing.id ? { ...item, title: String(form.get("title")), name: String(form.get("title")), slug: String(form.get("slug")), tagline: String(form.get("tagline")), description: String(form.get("description")), website_url: String(form.get("websiteUrl")), category: String(form.get("category")), rating, score: rating, is_verified: form.get("isVerified") === "on", verified: form.get("isVerified") === "on" } : item));
      setEditing(null); setMessage("Listing details saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusyId(""); }
  }

  return <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
    <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="font-mono text-xs uppercase text-signal">Control room / Review queue</p><h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Submission review</h1><p className="mt-3 text-muted-foreground">Edit listings and control what appears in the public directory.</p></div>
      <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground"><RadioTower className="size-4 text-signal" /> Admin channel secure</div>
    </div>
    <IngestionPanel onAdded={() => setMessage("New pending apps were added. Reload the page to review them.")} />
    {message && <div className="mt-6 border border-signal/30 bg-signal/10 px-4 py-3 text-sm text-foreground">{message}</div>}
    <Tabs value={status} onValueChange={(value) => setStatus(value as Status)} className="mt-8">
      <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-md border border-border bg-card p-1">
        {statusOrder.map((item) => <TabsTrigger key={item} value={item} className="gap-2 capitalize">{item}<span className="font-mono text-[10px] text-signal">{counts[item]}</span></TabsTrigger>)}
      </TabsList>
    </Tabs>
    <div className="mt-6 space-y-3">
      {visible.length === 0 && <div className="border border-border bg-card px-6 py-14 text-center text-muted-foreground">No {status} submissions.</div>}
      {visible.map((app) => <article key={app.id} className="grid gap-5 border border-border bg-card p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-xl font-semibold">{app.title}</h2><Badge variant="outline" className="font-mono uppercase text-signal">{categoryLabels[app.category] ?? app.category}</Badge><span className="font-mono text-sm text-signal">{Number(app.rating).toFixed(1)}</span></div><p className="mt-2 text-sm text-muted-foreground">{app.tagline}</p><a href={app.website_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-signal">{app.website_url}<ExternalLink className="size-3 shrink-0" /></a><div className="mt-3 font-mono text-[10px] uppercase text-muted-foreground">Submitted {new Date(app.created_at).toLocaleDateString()}</div></div>
        <div className="flex flex-wrap gap-2 lg:justify-end"><Button variant="outline" size="sm" onClick={() => setViewing(app)}><Eye /> Details</Button><Button variant="outline" size="sm" onClick={() => setEditing(app)}><Pencil /> Edit</Button><Button size="sm" variant="outline" disabled={busyId === app.id} onClick={() => changeStatus(app, "approved")}><Check /> Approve</Button><Button size="sm" disabled={busyId === app.id} onClick={() => changeStatus(app, "featured")}><Star /> Feature</Button><AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={busyId === app.id}><X /> Reject</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reject {app.title}?</AlertDialogTitle><AlertDialogDescription>The listing will remain in review history but disappear from all public pages.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => changeStatus(app, "rejected")} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Reject submission</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>
      </article>)}
    </div>
    <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Edit listing</DialogTitle><DialogDescription>Changes save immediately to the directory record.</DialogDescription></DialogHeader>{editing && <form onSubmit={submitEdit} className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="admin-title">Title</Label><Input id="admin-title" name="title" defaultValue={editing.title} required minLength={2} maxLength={80} /></div><div className="space-y-2"><Label htmlFor="admin-slug">Slug</Label><Input id="admin-slug" name="slug" defaultValue={editing.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="admin-tagline">Tagline</Label><Input id="admin-tagline" name="tagline" defaultValue={editing.tagline} required minLength={8} maxLength={140} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="admin-description">Description</Label><Textarea id="admin-description" name="description" defaultValue={editing.description} required minLength={20} maxLength={1200} rows={6} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="admin-url">Website URL</Label><Input id="admin-url" name="websiteUrl" type="url" defaultValue={editing.website_url} required /></div><div className="space-y-2"><Label htmlFor="admin-category">Category</Label><select id="admin-category" name="category" defaultValue={editing.category} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{categories.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}</select></div><div className="space-y-2"><Label htmlFor="admin-rating">Rating</Label><Input id="admin-rating" name="rating" type="number" min="0" max="10" step="0.1" defaultValue={editing.rating} required /></div><label className="flex items-center gap-3 text-sm sm:col-span-2"><input name="isVerified" type="checkbox" defaultChecked={editing.is_verified} className="size-4 accent-primary" /> Verified listing</label><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={busyId === editing.id}>{busyId === editing.id ? "Saving…" : "Save changes"}</Button></div></form>}</DialogContent></Dialog>
  </section>;
}