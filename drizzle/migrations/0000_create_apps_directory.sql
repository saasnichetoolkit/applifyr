CREATE TABLE public.apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('productivity', 'finance', 'developer_tools', 'marketing_seo', 'design_creative', 'ai_tools')),
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  website_url TEXT NOT NULL,
  logo_text TEXT NOT NULL,
  score NUMERIC(3,1) NOT NULL CHECK (score >= 0 AND score <= 10),
  verified BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.apps TO anon;
GRANT SELECT ON public.apps TO authenticated;
GRANT ALL ON public.apps TO service_role;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active apps"
ON public.apps FOR SELECT TO anon, authenticated
USING (active = true);
CREATE INDEX apps_active_created_idx ON public.apps (active, created_at DESC);
CREATE INDEX apps_category_active_idx ON public.apps (category, active);
CREATE INDEX apps_featured_active_idx ON public.apps (featured, active);