-- Create public storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public read article images"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Authenticated editors/admins can upload
CREATE POLICY "Editors upload article images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'article-images' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Editors update article images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'article-images' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);

CREATE POLICY "Editors delete article images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'article-images' 
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'editor'))
);