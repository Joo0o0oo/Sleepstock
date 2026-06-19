DROP FUNCTION IF EXISTS public.is_mentioned_in(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.dream_post_likes CASCADE;
DROP TABLE IF EXISTS public.dream_post_mentions CASCADE;
DROP TABLE IF EXISTS public.dream_posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS public.post_visibility CASCADE;