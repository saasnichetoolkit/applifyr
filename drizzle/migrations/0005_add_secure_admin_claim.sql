CREATE OR REPLACE FUNCTION public.claim_admin_access()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  requester_email := lower(COALESCE(auth.jwt() ->> 'email', ''));
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_email_allowlist
    WHERE lower(email) = requester_email
  ) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (auth.uid(), 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin_access() TO authenticated;