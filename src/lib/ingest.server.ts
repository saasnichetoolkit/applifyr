import { categories } from "./categories";

export type IngestResult = {
  title: string;
  tagline: string;
  description: string;
  category: string;
  score: number;
};

const allowed = categories.map((c) => c.slug) as string[];

async function fetchPageText(url: string) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "APPLIFYR-Ingest/1.0" }, redirect: "follow" });
    const html = (await res.text()).slice(0, 200_000);
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? "";
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 6000);
    return `TITLE: ${title}\nMETA: ${metaDesc}\nTEXT: ${text}`;
  } catch {
    return "(page could not be fetched; infer from the URL only)";
  }
}

export class IngestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function ingestApp(url: string): Promise<IngestResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new IngestError("AI is not configured", 500);
  const page = await fetchPageText(url);
  const prompt = `You catalog web apps for the APPLIFYR directory. Analyze this website and return ONLY a JSON object with keys:
title (app name), tagline (one sentence, under 140 chars), description (2-4 sentences, 200-800 chars), category (one of: ${allowed.join(", ")}), score (number 1-10, one decimal, honest quality/"glow" rating based on clarity, polish and usefulness).
URL: ${url}
${page}`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      input: prompt,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_object" } },
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    let msg = "AI analysis failed";
    try { msg = JSON.parse(body)?.error?.message ?? JSON.parse(body)?.message ?? msg; } catch { /* keep */ }
    if (res.status === 402) msg = "AI credits are exhausted. Please fill the form manually.";
    if (res.status === 429) msg = "AI is busy right now. Please try again in a minute.";
    throw new IngestError(msg, res.status);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const evt = JSON.parse(data);
        if (evt.type === "response.output_text.delta") out += evt.delta;
        if (evt.type === "response.failed" || evt.type === "error") throw new IngestError("AI analysis failed", 502);
      } catch (e) {
        if (e instanceof IngestError) throw e;
      }
    }
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(out.slice(out.indexOf("{"), out.lastIndexOf("}") + 1));
  } catch {
    throw new IngestError("AI returned an unreadable answer", 502);
  }
  const category = String(parsed.category ?? "other").toLowerCase();
  const score = Math.min(10, Math.max(1, Math.round(Number(parsed.score) * 10) / 10 || 5));
  return {
    title: String(parsed.title ?? "").slice(0, 80),
    tagline: String(parsed.tagline ?? "").slice(0, 140),
    description: String(parsed.description ?? "").slice(0, 1200),
    category: allowed.includes(category) ? category : "other",
    score,
  };
}
