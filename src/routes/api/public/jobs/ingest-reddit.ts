import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

export const Route = createFileRoute("/api/public/jobs/ingest-reddit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { runRedditIngestion } = await import("@/lib/reddit-ingest.server");
        const out = await runRedditIngestion({ manual: false });
        return Response.json(out);
      },
    },
  },
});
