ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS source text, ADD COLUMN IF NOT EXISTS source_id text;
CREATE UNIQUE INDEX IF NOT EXISTS apps_source_unique ON public.apps (source, source_id);

CREATE TABLE public.ingestion_runs (
  job text PRIMARY KEY,
  status text NOT NULL DEFAULT 'idle',
  locked_until timestamptz,
  last_run_at timestamptz,
  last_result text,
  added_count integer NOT NULL DEFAULT 0,
  paused_reason text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.ingestion_runs TO authenticated;
GRANT ALL ON public.ingestion_runs TO service_role;
ALTER TABLE public.ingestion_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view ingestion runs" ON public.ingestion_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.ingestion_runs (job) VALUES ('reddit-saas') ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.acquire_ingestion_lock(_job text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ok boolean;
BEGIN
  UPDATE public.ingestion_runs SET locked_until = now() + interval '5 minutes', status = 'running', updated_at = now()
  WHERE job = _job AND (locked_until IS NULL OR locked_until < now())
  RETURNING true INTO ok;
  RETURN COALESCE(ok, false);
END $$;
REVOKE EXECUTE ON FUNCTION public.acquire_ingestion_lock(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquire_ingestion_lock(text) TO service_role;