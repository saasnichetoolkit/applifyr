import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { categories } from "./categories";

const categorySlugs = categories.map((category) => category.slug) as [string, ...string[]];
const statuses = ["pending", "approved", "featured", "rejected"] as const;

async function requireAdmin(context: {
  supabase: Parameters<Parameters<typeof requireSupabaseAuth.server>[0]>[0] extends never ? never : any;
  userId: string;
}) {
  await context.supabase.rpc("claim_admin_access");
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !isAdmin) throw new Error("Forbidden: Admin access required");
}

export const checkAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    return { isAdmin: true as const };
  });

export const listAppsForAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("apps")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const updateAppDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    id: z.string().uuid(),
    title: z.string().trim().min(2).max(80),
    slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
    tagline: z.string().trim().min(8).max(140),
    description: z.string().trim().min(20).max(1200),
    websiteUrl: z.string().url(),
    category: z.enum(categorySlugs),
    rating: z.number().min(0).max(10),
    isVerified: z.boolean(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("apps").update({
      title: data.title,
      name: data.title,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      website_url: data.websiteUrl,
      category: data.category,
      rating: data.rating,
      score: data.rating,
      is_verified: data.isVerified,
      verified: data.isVerified,
      logo_text: data.title.slice(0, 2).toUpperCase(),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateAppStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({
    id: z.string().uuid(),
    status: z.enum(statuses),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const verified = data.status === "approved" || data.status === "featured";
    const { error } = await context.supabase.from("apps").update({
      status: data.status,
      is_verified: verified,
      verified,
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });