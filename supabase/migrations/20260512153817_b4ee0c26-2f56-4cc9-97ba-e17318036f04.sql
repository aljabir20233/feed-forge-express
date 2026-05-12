create or replace function public.increment_article_view(_slug text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.articles set view_count = view_count + 1
  where slug = _slug and status = 'published';
end;
$$;
grant execute on function public.increment_article_view(text) to anon, authenticated;