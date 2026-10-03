ALTER TABLE public.apps ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','featured'));
UPDATE public.apps SET status = CASE WHEN is_featured THEN 'featured' WHEN active THEN 'approved' ELSE 'pending' END;
ALTER TABLE public.apps DROP CONSTRAINT apps_category_check;
ALTER TABLE public.apps ADD CONSTRAINT apps_category_check CHECK (category IN ('productivity','finance','developer_tools','marketing_seo','design_creative','ai_tools','web3','utilities','advocacy','other'));
CREATE OR REPLACE FUNCTION public.sync_app_status() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.active := NEW.status IN ('approved','featured');
  NEW.is_featured := NEW.status = 'featured';
  NEW.featured := NEW.is_featured;
  RETURN NEW;
END $$;
CREATE TRIGGER apps_sync_status BEFORE INSERT OR UPDATE ON public.apps FOR EACH ROW EXECUTE FUNCTION public.sync_app_status();
CREATE INDEX apps_status_idx ON public.apps (status, created_at DESC);
DROP POLICY IF EXISTS "Anyone can submit an app for review" ON public.apps;
CREATE POLICY "Anyone can submit an app for review" ON public.apps FOR INSERT TO anon, authenticated
WITH CHECK (status = 'pending' AND active = false AND is_featured = false AND featured = false AND verified = false AND is_verified = false);