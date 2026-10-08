import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { categories } from "./categories";

export type AppRecord = Database["public"]["Tables"]["apps"]["Row"];

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

function getPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Directory service unavailable");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listApps = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ category: z.string().optional(), featured: z.boolean().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    let query = getPublicClient().from("apps").select("*").in("status", ["approved", "featured"]).order("created_at", { ascending: false });
    if (data.category) query = query.eq("category", data.category);
    if (data.featured) query = query.eq("status", "featured");
    const { data: apps, error } = await query;
    if (error) throw new Error(error.message);
    return apps;
  });

export const getAppBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { data: app, error } = await getPublicClient().from("apps").select("*").eq("slug", data.slug).in("status", ["approved", "featured"]).maybeSingle();
    if (error) throw new Error(error.message);
    return app;
  });

export const analyzeAppUrl = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ url: z.string().url() }).parse(input))
  .handler(async ({ data }) => {
    const { ingestApp, IngestError } = await import("./ingest.server");
    try {
      return { ok: true as const, result: await ingestApp(data.url) };
    } catch (e) {
      return { ok: false as const, error: e instanceof IngestError || e instanceof Error ? e.message : "Analysis failed" };
    }
  });

export const submitApp = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    name: z.string().trim().min(2).max(80),
    websiteUrl: z.string().url(),
    category: z.enum(categorySlugs),
    tagline: z.string().trim().min(8).max(140),
    description: z.string().trim().min(20).max(1200),
    score: z.number().min(0).max(10).optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const score = data.score ?? 0;
    const { error } = await getPublicClient().from("apps").insert({
      name: data.name,
      title: data.name,
      slug,
      category: data.category,
      tagline: data.tagline,
      description: data.description,
      website_url: data.websiteUrl,
      logo_text: data.name.slice(0, 2).toUpperCase(),
      score,
      rating: score,
      status: "pending",
      active: false,
      verified: false,
      is_verified: false,
      featured: false,
      is_featured: false,
    });
    if (error) throw new Error(error.message);
    return { slug };
  });
