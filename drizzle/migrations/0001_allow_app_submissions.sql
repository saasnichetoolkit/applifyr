ALTER TABLE public.apps ALTER COLUMN active SET DEFAULT false;
GRANT INSERT ON public.apps TO anon;
CREATE POLICY "Anyone can submit an app for review"
ON public.apps FOR INSERT TO anon
WITH CHECK (active = false AND featured = false AND verified = false AND score = 0);