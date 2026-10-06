import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ExternalLink, Star, BadgeCheck } from "lucide-react";
import { listApps } from "@/lib/apps.functions";
import { categories } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Review — APPLIFYR" },
      { name: "description", content: "Admin dashboard for reviewing and approving app submissions." }
    ]
  }),
  loader: async () => {
    const apps = await listApps({ data: {} }); // Get all apps, including inactive
    return apps;
  },
  component: AdminPage
});

function AdminPage() {
  const apps = Route.useLoaderData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const approve = useServerFn(approveApp);
  const reject = useServerFn(rejectApp);
  const feature = useServerFn(featureApp);
  const verify = useServerFn(verifyApp);

  const filteredApps = apps.filter(app => {
    if (filter === 'pending') return !app.active;
    if (filter === 'approved') return app.active;
    return true;
  });

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">Admin Review Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Review, approve, feature, and verify app submissions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>
            Pending ({apps.filter(a => !a.active).length})
          </Button>
          <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>
            Approved ({apps.filter(a => a.active).length})
          </Button>
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
            All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredApps.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No apps found in this filter.
          </div>
        ) : (
          filteredApps.map(app => (
            <Card key={app.id} className="border-border">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {app.name}
                    {app.is_verified && <BadgeCheck className="size-4 text-signal" />}
                    {app.is_featured && <Star className="size-4 text-yellow-500" />}
                    {!app.active && <Badge variant="outline" className="ml-2">Pending</Badge>}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{app.tagline}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-2xl font-bold text-signal">{app.score?.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Applifyr Score</div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-[1fr_200px]">
                  <div>
                    <p className="text-sm">{app.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge variant="secondary">{categories.find(c => c.slug === app.category)?.label || app.category}</Badge>
                      <Badge variant="outline">Source: {app.source || 'manual'}</Badge>
                      <Badge variant="outline">Score: {app.score?.toFixed(1)}</Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <a href={app.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 border border-input bg-background hover:bg-accent">
                      Visit Site <ExternalLink className="ml-2 size-4" />
                    </a>
                    {!app.active ? (
                      <>
                        <Button onClick={() => approve({ data: { id: app.id } })}>
                          <CheckCircle2 className="mr-2 size-4" /> Approve
                        </Button>
                        <Button variant="destructive" onClick={() => reject({ data: { id: app.id } })}>
                          <XCircle className="mr-2 size-4" /> Reject
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant={app.is_featured ? 'default' : 'outline'} onClick={() => feature({ data: { id: app.id } })}>
                          {app.is_featured ? 'Unfeature' : 'Feature'}
                        </Button>
                        <Button variant={app.is_verified ? 'default' : 'outline'} onClick={() => verify({ data: { id: app.id } })}>
                          {app.is_verified ? 'Unverify' : 'Verify'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

// Server functions for admin actions
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function getAdminClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Admin service unavailable");
  return createClient(url, key);
}

export const approveApp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data }) => {
    const client = getAdminClient();
    const { error } = await client.from("apps").update({ active: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const rejectApp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data }) => {
    const client = getAdminClient();
    const { error } = await client.from("apps").update({ active: false, score: 0 }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const featureApp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data }) => {
    const client = getAdminClient();
    const { data: app } = await client.from("apps").select("is_featured").eq("id", data.id).single();
    const newFeatured = !app?.is_featured;
    const { error } = await client.from("apps").update({ is_featured: newFeatured, featured: newFeatured }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, featured: newFeatured };
  });

export const verifyApp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }).parse)
  .handler(async ({ data }) => {
    const client = getAdminClient();
    const { data: app } = await client.from("apps").select("is_verified").eq("id", data.id).single();
    const newVerified = !app?.is_verified;
    const { error } = await client.from("apps").update({ is_verified: newVerified, verified: newVerified }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, verified: newVerified };
  });
