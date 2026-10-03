import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ingestApp, IngestError } from "@/lib/ingest.server";

export const Route = createFileRoute("/api/public/ingest-app")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = z.object({ url: z.string().url() }).safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "A valid url is required" }, { status: 400 });
        try {
          return Response.json(await ingestApp(parsed.data.url));
        } catch (e) {
          const status = e instanceof IngestError ? e.status : 500;
          return Response.json({ error: e instanceof Error ? e.message : "Failed" }, { status });
        }
      },
    },
  },
});
