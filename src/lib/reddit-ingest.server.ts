import { categories } from "./categories";

const JOB = "reddit-saas";
const SOURCE = "reddit";
const allowed = categories.map((c) => c.slug) as string[];

type Analysis = { name: string; tagline: string; description: string; category: string; score: number; website_url: string };

class AiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["is_app", "name", "tagline", "description", "category", "score", "website_url"],
  properties: {
    is_app: { type: "boolean" },
    name: { type: "string" },
    tagline: { type: "string" },
    description: { type: "string" },
    category: { type: "string", enum: allowed },
    score: { type: "number" },
    website_url: { type: "string" },
  },
};

async function analyze(post: { title: string; text: string; url: string }): Promise<(Analysis & { is_app: boolean }) | null> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError("AI is not configured", 500);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}`, "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: `You catalog software apps for the APPLIFYR directory. Decide whether this Reddit post presents a specific web app/SaaS product with a website (is_app). If yes, extract: name, tagline (one sentence under 140 chars), description (2-4 sentences, 100-800 chars), category, score (1-10, honest quality rating), website_url (the product's own https URL, not reddit). If not, set is_app false and fill other fields with empty values.\nTitle: ${post.title}\nBody: ${post.text}\nLink: ${post.url}`,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: "app", strict: true, schema } },
    }),
  });
  if (!res.ok || !res.body) {
    await res.text().catch(() => "");
    throw new AiError(res.status === 402 ? "AI credits are exhausted" : res.status === 403 ? "AI access is blocked for this workspace" : `AI request failed (${res.status})`, res.status);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "", out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const d = line.slice(5).trim();
      if (!d || d === "[DONE]") continue;
      try {
        const evt = JSON.parse(d);
        if (evt.type === "response.output_text.delta") out += evt.delta;
        if (evt.type === "response.failed" || evt.type === "error") throw new AiError("AI analysis failed", 502);
      } catch (e) { if (e instanceof AiError) throw e; }
    }
  }
  try { return JSON.parse(out); } catch { return null; }
}

export async function runRedditIngestion({ manual }: { manual: boolean }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: state } = await supabaseAdmin.from("ingestion_runs").select("*").eq("job", JOB).maybeSingle();
  if (state?.paused_reason && !manual) return { ok: false, result: `Paused: ${state.paused_reason}`, added: 0 };

  const { data: locked } = await supabaseAdmin.rpc("acquire_ingestion_lock", { _job: JOB });
  if (!locked) return { ok: false, result: "Another run is already in progress", added: 0 };

  let added = 0;
  let result = "";
  let paused: string | null = null;
  try {
    const r = await fetch("https://www.reddit.com/r/SaaS/new/.rss?limit=5", {
      headers: { "User-Agent": "APPLIFYR-Ingest/1.0 (+https://applifyr.com)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) throw new Error(`Reddit responded ${r.status}`);
    const xml = await r.text();
    const decode = (s: string) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
    const posts = xml.split("<entry>").slice(1, 6).map((e) => {
      const html = decode(e.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1] ?? "");
      const links = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/reddit\.com|redd\.it/.test(u));
      return {
        id: e.match(/<id>t3_([^<]+)<\/id>/)?.[1] ?? "",
        title: decode(e.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? ""),
        selftext: decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim(),
        url: links[0] ?? "",
      };
    }).filter((p) => p.id);
    const ids = posts.map((p) => p.id);
    const { data: seen } = await supabaseAdmin.from("apps").select("source_id").eq("source", SOURCE).in("source_id", ids.length ? ids : ["-"]);
    const seenSet = new Set((seen ?? []).map((s) => s.source_id));
    const fresh = posts.filter((p) => !seenSet.has(p.id)).slice(0, 2);
    let skipped = 0;
    for (const post of fresh) {
      const a = await analyze({ title: post.title, text: (post.selftext ?? "").slice(0, 1500), url: post.url });
      if (!a || !a.is_app || !/^https?:\/\//.test(a.website_url) || /reddit\.com|redd\.it/.test(a.website_url) || a.name.trim().length < 2) { skipped++; continue; }
      const name = a.name.trim().slice(0, 80);
      const score = Math.min(10, Math.max(1, Math.round(Number(a.score) * 10) / 10 || 5));
      const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "app"}-${post.id}`;
      const { error } = await supabaseAdmin.from("apps").insert({
        name, title: name, slug,
        category: allowed.includes(a.category) ? a.category : "other",
        tagline: a.tagline.slice(0, 140) || name,
        description: a.description.slice(0, 1200) || a.tagline,
        website_url: a.website_url,
        logo_text: name.slice(0, 2).toUpperCase(),
        score, rating: score,
        status: "pending", active: false, verified: false, is_verified: false, featured: false, is_featured: false,
        source: SOURCE, source_id: post.id,
      });
      if (error) { if (error.code !== "23505") throw new Error(error.message); }
      else added++;
    }
    result = `Checked ${posts.length} posts, ${fresh.length} new, added ${added}, skipped ${skipped}`;
  } catch (e) {
    if (e instanceof AiError && (e.status === 402 || e.status === 403)) paused = e.message;
    result = `Failed: ${e instanceof Error ? e.message : "unknown error"}`;
  } finally {
    await supabaseAdmin.from("ingestion_runs").update({
      status: paused ? "paused" : "idle", locked_until: null, last_run_at: new Date().toISOString(),
      last_result: result, added_count: added, paused_reason: paused, updated_at: new Date().toISOString(),
    }).eq("job", JOB);
  }
  return { ok: !result.startsWith("Failed"), result, added };
}
