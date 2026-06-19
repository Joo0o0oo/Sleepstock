
revoke execute on function public.is_mentioned_in(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.can_view_post(uuid, uuid, public.post_visibility) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

drop function public.can_view_post(uuid, uuid, public.post_visibility);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
