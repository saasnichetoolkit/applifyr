import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { RefreshCw } from "lucide-react";
import { getIngestionStatus, runIngestionNow } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";

type Status = Awaited<ReturnType<typeof getIngestionStatus>>;

export function IngestionPanel({ onAdded }: { onAdded?: () => void }) {
  const fetchStatus = useServerFn(getIngestionStatus);
  const runNow = useServerFn(runIngestionNow);
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchStatus().then(setStatus).catch(() => setError("Could not load job status")); }, [fetchStatus]);

  async function run() {
    setBusy(true); setError("");
    try {
      const out = await runNow();
      setStatus(await fetchStatus());
      if (out.added > 0) onAdded?.();
    } catch (e) { setError(e instanceof Error ? e.message : "Run failed"); }
    finally { setBusy(false); }
  }

  return <div className="mt-8 grid gap-4 border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-center">
    <div>
      <p className="font-mono text-xs uppercase text-signal">Ingestion / Reddit r/SaaS · daily 00:00 UTC</p>
      <p className="mt-2 text-sm">{status?.last_result ?? "Not run yet."}</p>
      <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">
        {status?.last_run_at ? `Last run ${new Date(status.last_run_at).toLocaleString()} · added ${status.added_count}` : "Waiting for first run"}
      </p>
      {status?.paused_reason && <p className="mt-2 text-sm text-destructive">Paused: {status.paused_reason}. Run now to retry.</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
    <Button variant="outline" size="sm" onClick={run} disabled={busy}><RefreshCw className={busy ? "animate-spin" : ""} /> {busy ? "Running…" : "Run now"}</Button>
  </div>;
}
