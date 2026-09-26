import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type AppRecord = Database["public"]["Tables"]["apps"]["Row"];

function getPublicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Directory service unavailable");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export const listApps = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ category: z.string().optional(), featured: z.boolean().optional() }).parse(input ?? {}))
  .handler(async ({ data }) => {
    let query = getPublicClient().from("apps").select("*").eq("active", true).order("created_at", { ascending: false });
    if (data.category) query = query.eq("category", data.category);
    if (data.featured) query = query.eq("is_featured", true);
    const { data: apps, error } = await query;
    if (error) throw new Error(error.message);
    return apps;
  });

export const getAppBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { data: app, error } = await getPublicClient().from("apps").select("*").eq("slug", data.slug).eq("active", true).maybeSingle();
    if (error) throw new Error(error.message);
    return app;
  });

export const submitApp = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    name: z.string().trim().min(2).max(80),
    websiteUrl: z.string().url(),
    category: z.enum(["productivity", "finance", "developer_tools", "marketing_seo", "design_creative", "ai_tools", "other"]),
    tagline: z.string().trim().min(8).max(140),
    description: z.string().trim().min(20).max(1200),
  }).parse(input))
  .handler(async ({ data }) => {
    const slug = `${data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString().slice(-6)}`;
    const { error } = await getPublicClient().from("apps").insert({
      name: data.name,
      title: data.name,
      slug,
      category: data.category,
      tagline: data.tagline,
      description: data.description,
      website_url: data.websiteUrl,
      logo_text: data.name.slice(0, 2).toUpperCase(),
      score: 0,
      rating: 0,
      verified: false,
      is_verified: false,
      featured: false,
      is_featured: false,
      active: false,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
