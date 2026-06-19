DROP POLICY IF EXISTS likes_select_all ON public.dream_post_likes;
CREATE POLICY likes_select_authenticated ON public.dream_post_likes
  FOR SELECT TO authenticated USING (true);