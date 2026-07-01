
-- 1) Drop duplicate public.has_role (private.has_role is what code uses)
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 2) Revoke EXECUTE from anon/authenticated/public on SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_article_view(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
-- Re-grant private.has_role to authenticated so RLS policies can call it
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

-- 3) Storage: drop broad public SELECT policy (public URL access still works via CDN for public buckets)
DROP POLICY IF EXISTS "Public read article images" ON storage.objects;

-- 4) profiles: restrict public read to authors of published articles only
DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
CREATE POLICY "Profiles of published authors readable"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.articles a
    WHERE a.author_id = profiles.id AND a.status = 'published'
  )
  OR id = auth.uid()
);

-- 5) Remove first-admin self-escalation policy
DROP POLICY IF EXISTS "First user can become admin" ON public.user_roles;
