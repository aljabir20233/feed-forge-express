DROP POLICY IF EXISTS "Editors upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors update article images" ON storage.objects;
DROP POLICY IF EXISTS "Editors delete article images" ON storage.objects;

CREATE POLICY "Editors upload article images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'article-images' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Editors update article images" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'article-images' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role)));

CREATE POLICY "Editors delete article images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'article-images' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role)));