
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ============ NEIGHBORHOODS ============
CREATE TABLE public.neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.neighborhoods TO anon, authenticated;
GRANT ALL ON public.neighborhoods TO service_role;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "neighborhoods public read" ON public.neighborhoods FOR SELECT TO anon, authenticated USING (true);

-- ============ DREAM CATEGORIES ============
CREATE TABLE public.dream_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT
);
GRANT SELECT ON public.dream_categories TO anon, authenticated;
GRANT ALL ON public.dream_categories TO service_role;
ALTER TABLE public.dream_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.dream_categories FOR SELECT TO anon, authenticated USING (true);

-- ============ PLACES ============
CREATE TABLE public.places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  neighborhood_id UUID REFERENCES public.neighborhoods(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  category TEXT,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX places_neighborhood_idx ON public.places(neighborhood_id);
GRANT SELECT ON public.places TO anon, authenticated;
GRANT ALL ON public.places TO service_role;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "places public read" ON public.places FOR SELECT TO anon, authenticated USING (true);

-- ============ DREAMS ============
CREATE TYPE public.dream_source AS ENUM ('user', 'reddit', 'external', 'seed');

CREATE TABLE public.dreams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  body TEXT NOT NULL,
  place_id UUID REFERENCES public.places(id) ON DELETE SET NULL,
  neighborhood_id UUID REFERENCES public.neighborhoods(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  category_id UUID REFERENCES public.dream_categories(id) ON DELETE SET NULL,
  emotion TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  source public.dream_source NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX dreams_place_idx ON public.dreams(place_id);
CREATE INDEX dreams_neighborhood_idx ON public.dreams(neighborhood_id);
CREATE INDEX dreams_created_idx ON public.dreams(created_at DESC);
GRANT SELECT ON public.dreams TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.dreams TO authenticated;
GRANT ALL ON public.dreams TO service_role;
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dreams public read" ON public.dreams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "dreams insert own" ON public.dreams FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dreams update own" ON public.dreams FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "dreams delete own" ON public.dreams FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ DREAM REACTIONS ============
CREATE TABLE public.dream_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (dream_id, user_id, type)
);
CREATE INDEX dream_reactions_dream_idx ON public.dream_reactions(dream_id);
GRANT SELECT ON public.dream_reactions TO anon, authenticated;
GRANT INSERT, DELETE ON public.dream_reactions TO authenticated;
GRANT ALL ON public.dream_reactions TO service_role;
ALTER TABLE public.dream_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions public read" ON public.dream_reactions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reactions insert own" ON public.dream_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions delete own" ON public.dream_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ PLACE STATS ============
CREATE TABLE public.place_stats (
  place_id UUID PRIMARY KEY REFERENCES public.places(id) ON DELETE CASCADE,
  total_dreams INTEGER NOT NULL DEFAULT 0,
  dreams_last_7d INTEGER NOT NULL DEFAULT 0,
  dreams_prev_7d INTEGER NOT NULL DEFAULT 0,
  top_category_id UUID REFERENCES public.dream_categories(id) ON DELETE SET NULL,
  top_keywords TEXT[] NOT NULL DEFAULT '{}',
  featured_dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
  most_recent_dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
  most_liked_dream_id UUID REFERENCES public.dreams(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.place_stats TO anon, authenticated;
GRANT ALL ON public.place_stats TO service_role;
ALTER TABLE public.place_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stats public read" ON public.place_stats FOR SELECT TO anon, authenticated USING (true);

-- ============ EXTERNAL SOURCES (future) ============
CREATE TABLE public.external_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  last_synced_at TIMESTAMPTZ
);
GRANT SELECT ON public.external_sources TO anon, authenticated;
GRANT ALL ON public.external_sources TO service_role;
ALTER TABLE public.external_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ext sources public read" ON public.external_sources FOR SELECT TO anon, authenticated USING (true);

-- ============ STATS REFRESH FUNCTION ============
CREATE OR REPLACE FUNCTION public.refresh_place_stats(_place_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total INT;
  v_last7 INT;
  v_prev7 INT;
  v_top_cat UUID;
  v_top_kw TEXT[];
  v_featured UUID;
  v_recent UUID;
  v_liked UUID;
BEGIN
  SELECT COUNT(*) INTO v_total FROM dreams WHERE place_id = _place_id;
  SELECT COUNT(*) INTO v_last7 FROM dreams WHERE place_id = _place_id AND created_at > now() - INTERVAL '7 days';
  SELECT COUNT(*) INTO v_prev7 FROM dreams WHERE place_id = _place_id AND created_at > now() - INTERVAL '14 days' AND created_at <= now() - INTERVAL '7 days';

  SELECT category_id INTO v_top_cat FROM dreams WHERE place_id = _place_id AND category_id IS NOT NULL
    GROUP BY category_id ORDER BY COUNT(*) DESC LIMIT 1;

  SELECT ARRAY(SELECT kw FROM (
    SELECT unnest(keywords) AS kw FROM dreams WHERE place_id = _place_id
  ) t WHERE kw IS NOT NULL GROUP BY kw ORDER BY COUNT(*) DESC LIMIT 5) INTO v_top_kw;

  SELECT id INTO v_recent FROM dreams WHERE place_id = _place_id ORDER BY created_at DESC LIMIT 1;

  SELECT d.id INTO v_liked FROM dreams d
    LEFT JOIN dream_reactions r ON r.dream_id = d.id
    WHERE d.place_id = _place_id
    GROUP BY d.id ORDER BY COUNT(r.id) DESC, d.created_at DESC LIMIT 1;

  v_featured := COALESCE(v_liked, v_recent);

  INSERT INTO place_stats (place_id, total_dreams, dreams_last_7d, dreams_prev_7d, top_category_id, top_keywords, featured_dream_id, most_recent_dream_id, most_liked_dream_id, updated_at)
  VALUES (_place_id, v_total, v_last7, v_prev7, v_top_cat, v_top_kw, v_featured, v_recent, v_liked, now())
  ON CONFLICT (place_id) DO UPDATE SET
    total_dreams = EXCLUDED.total_dreams,
    dreams_last_7d = EXCLUDED.dreams_last_7d,
    dreams_prev_7d = EXCLUDED.dreams_prev_7d,
    top_category_id = EXCLUDED.top_category_id,
    top_keywords = EXCLUDED.top_keywords,
    featured_dream_id = EXCLUDED.featured_dream_id,
    most_recent_dream_id = EXCLUDED.most_recent_dream_id,
    most_liked_dream_id = EXCLUDED.most_liked_dream_id,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.dreams_refresh_stats_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.place_id IS NOT NULL THEN PERFORM refresh_place_stats(OLD.place_id); END IF;
    RETURN OLD;
  ELSE
    IF NEW.place_id IS NOT NULL THEN PERFORM refresh_place_stats(NEW.place_id); END IF;
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER dreams_stats_refresh
AFTER INSERT OR UPDATE OR DELETE ON public.dreams
FOR EACH ROW EXECUTE FUNCTION public.dreams_refresh_stats_trigger();

-- ============ SEED: CATEGORIES ============
INSERT INTO public.dream_categories (slug, name, emoji, color) VALUES
  ('creatividad', 'Creatividad', '🎨', '#A855F7'),
  ('nostalgia', 'Nostalgia', '🌙', '#6366F1'),
  ('aventura', 'Aventura', '⚡', '#F59E0B'),
  ('amor', 'Amor', '💗', '#EC4899'),
  ('naturaleza', 'Naturaleza', '🌿', '#10B981'),
  ('ansiedad', 'Ansiedad', '🌀', '#64748B'),
  ('fantasia', 'Fantasía', '✨', '#8B5CF6'),
  ('misterio', 'Misterio', '🔮', '#0EA5E9');

-- ============ SEED: NEIGHBORHOODS ============
INSERT INTO public.neighborhoods (slug, name, lat, lng, description) VALUES
  ('palermo', 'Palermo', -34.5889, -58.4302, 'Bohemio, verde y nocturno.'),
  ('recoleta', 'Recoleta', -34.5875, -58.3974, 'Elegante, histórico, monumental.'),
  ('puerto-madero', 'Puerto Madero', -34.6118, -58.3631, 'Diques, vidrio y agua.'),
  ('san-telmo', 'San Telmo', -34.6210, -58.3731, 'Adoquines, tango y memoria.'),
  ('la-boca', 'La Boca', -34.6345, -58.3631, 'Color, fútbol y río.'),
  ('belgrano', 'Belgrano', -34.5631, -58.4544, 'Plazas, barrancas y silencio.'),
  ('caballito', 'Caballito', -34.6189, -58.4413, 'Centro geográfico, casas bajas.'),
  ('villa-crespo', 'Villa Crespo', -34.5993, -58.4427, 'Diseño, talleres y bares.'),
  ('chacarita', 'Chacarita', -34.5878, -58.4566, 'Cementerio, vías y rebeldía.'),
  ('almagro', 'Almagro', -34.6097, -58.4204, 'Tango, librerías, esquinas.'),
  ('balvanera', 'Balvanera', -34.6097, -58.4034, 'Once, congreso, multitud.'),
  ('flores', 'Flores', -34.6280, -58.4630, 'Parroquias y plaza.'),
  ('nunez', 'Núñez', -34.5447, -58.4631, 'Río, monumental, calma.'),
  ('colegiales', 'Colegiales', -34.5736, -58.4499, 'Mercado y boulevard.'),
  ('boedo', 'Boedo', -34.6286, -58.4128, 'Café, poesía, San Lorenzo.'),
  ('barracas', 'Barracas', -34.6428, -58.3823, 'Murales, riachuelo y fábricas.'),
  ('retiro', 'Retiro', -34.5919, -58.3747, 'Estación, plaza, terminal.'),
  ('monserrat', 'Monserrat', -34.6131, -58.3772, 'Cabildo, Plaza de Mayo.'),
  ('villa-urquiza', 'Villa Urquiza', -34.5731, -58.4870, 'Edificios nuevos, barrio antiguo.'),
  ('saavedra', 'Saavedra', -34.5544, -58.4862, 'Parque, museo, frontera.');

-- ============ SEED: PLACES ============
INSERT INTO public.places (slug, name, neighborhood_id, lat, lng, is_verified, category, description, cover_url) VALUES
  ('plaza-serrano', 'Plaza Serrano', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5882, -58.4377, false, 'plaza', 'Plaza bohemia de Palermo Soho.', NULL),
  ('bosques-palermo', 'Bosques de Palermo', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5731, -58.4119, false, 'parque', 'Pulmón verde con lagos y rosedal.', NULL),
  ('planetario', 'Planetario Galileo Galilei', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5694, -58.4117, true, 'cultura', 'Domo de estrellas en Palermo.', NULL),
  ('jardin-japones', 'Jardín Japonés', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5811, -58.4108, true, 'jardin', 'Estanque, koi y puentes rojos.', NULL),
  ('rosedal', 'El Rosedal', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5753, -58.4181, false, 'parque', 'Rosas, pérgola y puente blanco.', NULL),
  ('cementerio-recoleta', 'Cementerio de Recoleta', (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5876, -58.3935, true, 'historico', 'Necrópolis monumental.', NULL),
  ('floralis-generica', 'Floralis Genérica', (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5832, -58.3925, true, 'monumento', 'Flor metálica que abre con el sol.', NULL),
  ('mnba', 'Museo Nacional de Bellas Artes', (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5836, -58.3933, true, 'museo', 'Museo nacional de arte.', NULL),
  ('puente-mujer', 'Puente de la Mujer', (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6097, -58.3633, true, 'monumento', 'Puente blanco de Calatrava.', NULL),
  ('reserva-ecologica', 'Reserva Ecológica', (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6147, -58.3528, true, 'parque', 'Humedal junto al río.', NULL),
  ('plaza-dorrego', 'Plaza Dorrego', (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6207, -58.3717, false, 'plaza', 'Feria de antigüedades y tango.', NULL),
  ('mercado-san-telmo', 'Mercado de San Telmo', (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6195, -58.3722, true, 'mercado', 'Mercado de 1897.', NULL),
  ('caminito', 'Caminito', (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6383, -58.3622, true, 'historico', 'Calle museo de chapa y color.', NULL),
  ('bombonera', 'La Bombonera', (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6354, -58.3645, true, 'estadio', 'Estadio de Boca Juniors.', NULL),
  ('barrancas-belgrano', 'Barrancas de Belgrano', (SELECT id FROM neighborhoods WHERE slug='belgrano'), -34.5631, -58.4569, false, 'parque', 'Lomadas, glorieta y feria.', NULL),
  ('parque-centenario', 'Parque Centenario', (SELECT id FROM neighborhoods WHERE slug='caballito'), -34.6065, -58.4359, false, 'parque', 'Lago circular y feria de libros.', NULL),
  ('cafe-tortoni', 'Café Tortoni', (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6086, -58.3786, true, 'cafe', 'Café notable desde 1858.', NULL),
  ('teatro-colon', 'Teatro Colón', (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6010, -58.3831, true, 'teatro', 'Una de las grandes óperas del mundo.', NULL),
  ('cabildo', 'Cabildo de Buenos Aires', (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6088, -58.3742, true, 'historico', 'Casa colonial frente a Plaza de Mayo.', NULL),
  ('plaza-mayo', 'Plaza de Mayo', (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6083, -58.3722, true, 'plaza', 'Centro político e histórico.', NULL),
  ('galerias-pacifico', 'Galerías Pacífico', (SELECT id FROM neighborhoods WHERE slug='retiro'), -34.5995, -58.3744, true, 'shopping', 'Galería con frescos en la cúpula.', NULL),
  ('obelisco', 'Obelisco', (SELECT id FROM neighborhoods WHERE slug='balvanera'), -34.6037, -58.3816, true, 'monumento', 'Ícono de Buenos Aires.', NULL),
  ('congreso', 'Congreso de la Nación', (SELECT id FROM neighborhoods WHERE slug='balvanera'), -34.6098, -58.3923, true, 'historico', 'Edificio del Congreso.', NULL),
  ('abasto', 'Mercado de Abasto', (SELECT id FROM neighborhoods WHERE slug='almagro'), -34.6037, -58.4109, true, 'shopping', 'Antiguo mercado, hoy shopping.', NULL),
  ('chacarita-cementerio', 'Cementerio de Chacarita', (SELECT id FROM neighborhoods WHERE slug='chacarita'), -34.5919, -58.4561, false, 'historico', 'Necrópolis enorme.', NULL),
  ('monumental', 'Estadio Monumental', (SELECT id FROM neighborhoods WHERE slug='nunez'), -34.5453, -58.4498, true, 'estadio', 'Estadio de River Plate.', NULL),
  ('konex', 'Ciudad Cultural Konex', (SELECT id FROM neighborhoods WHERE slug='almagro'), -34.6056, -58.4117, true, 'cultura', 'Centro cultural en una vieja fábrica.', NULL),
  ('usina-arte', 'Usina del Arte', (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6395, -58.3565, true, 'cultura', 'Antigua usina, hoy auditorio.', NULL),
  ('parque-lezama', 'Parque Lezama', (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6280, -58.3700, false, 'parque', 'Parque de las barrancas porteñas.', NULL),
  ('plaza-italia', 'Plaza Italia', (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5803, -58.4214, false, 'plaza', 'Nudo de Palermo, ferias y subte.', NULL);

-- ============ SEED: DREAMS ============
-- Inserta sueños con categoría y keywords precalculadas. author_name simula usuarios.
DO $$
DECLARE
  cat_creatividad UUID := (SELECT id FROM dream_categories WHERE slug='creatividad');
  cat_nostalgia UUID := (SELECT id FROM dream_categories WHERE slug='nostalgia');
  cat_aventura UUID := (SELECT id FROM dream_categories WHERE slug='aventura');
  cat_amor UUID := (SELECT id FROM dream_categories WHERE slug='amor');
  cat_naturaleza UUID := (SELECT id FROM dream_categories WHERE slug='naturaleza');
  cat_ansiedad UUID := (SELECT id FROM dream_categories WHERE slug='ansiedad');
  cat_fantasia UUID := (SELECT id FROM dream_categories WHERE slug='fantasia');
  cat_misterio UUID := (SELECT id FROM dream_categories WHERE slug='misterio');
BEGIN
  INSERT INTO public.dreams (body, place_id, neighborhood_id, lat, lng, category_id, emotion, keywords, author_name, source, created_at) VALUES
  -- Palermo cluster (~25)
  ('Soñé que Plaza Serrano flotaba sobre las nubes y todas las personas podían caminar entre estrellas.', (SELECT id FROM places WHERE slug='plaza-serrano'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5882, -58.4377, cat_fantasia, 'asombro', ARRAY['vuelo','estrellas','nubes','plaza'], 'lunaazul', 'seed', now() - INTERVAL '2 hours'),
  ('Caminaba por los bosques y los árboles susurraban mi nombre en distintos idiomas.', (SELECT id FROM places WHERE slug='bosques-palermo'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5731, -58.4119, cat_naturaleza, 'calma', ARRAY['árboles','susurros','idiomas','verde'], 'martinsuena', 'seed', now() - INTERVAL '5 hours'),
  ('El planetario se abría y dentro había otro planeta entero con su propio cielo.', (SELECT id FROM places WHERE slug='planetario'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5694, -58.4117, cat_fantasia, 'asombro', ARRAY['cielo','planeta','estrellas','infinito'], 'nicostars', 'seed', now() - INTERVAL '8 hours'),
  ('Los peces koi del jardín japonés me hablaban en haikus que iba olvidando al despertar.', (SELECT id FROM places WHERE slug='jardin-japones'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5811, -58.4108, cat_creatividad, 'serenidad', ARRAY['agua','poesía','peces','silencio'], 'pauladream', 'seed', now() - INTERVAL '12 hours'),
  ('En el Rosedal las rosas eran del color de personas que ya no veo.', (SELECT id FROM places WHERE slug='rosedal'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5753, -58.4181, cat_nostalgia, 'melancolía', ARRAY['rosas','colores','memoria','ausencia'], 'joaquinrem', 'seed', now() - INTERVAL '1 day'),
  ('Pintaba un mural en Palermo y el mural se iba pintando solo cuando yo paraba.', (SELECT id FROM places WHERE slug='plaza-serrano'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5885, -58.4380, cat_creatividad, 'éxtasis', ARRAY['arte','mural','colores','manos'], 'valeolas', 'seed', now() - INTERVAL '1 day 4 hours'),
  ('Una banda tocaba en el medio de Plaza Italia y nadie podía dejar de bailar.', (SELECT id FROM places WHERE slug='plaza-italia'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5803, -58.4214, cat_aventura, 'euforia', ARRAY['música','baile','multitud','noche'], 'lunaazul', 'seed', now() - INTERVAL '2 days'),
  ('El bosque me escondía a propósito cada vez que intentaba salir.', (SELECT id FROM places WHERE slug='bosques-palermo'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5733, -58.4120, cat_ansiedad, 'inquietud', ARRAY['perdido','árboles','laberinto','niebla'], 'martinsuena', 'seed', now() - INTERVAL '3 days'),
  ('El planetario era una nave y yo era el único pasajero.', (SELECT id FROM places WHERE slug='planetario'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5694, -58.4117, cat_misterio, 'extrañeza', ARRAY['nave','soledad','viaje','espacio'], 'pauladream', 'seed', now() - INTERVAL '4 days'),
  ('En el jardín japonés alguien parecido a mí me esperaba con té.', (SELECT id FROM places WHERE slug='jardin-japones'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5811, -58.4108, cat_amor, 'ternura', ARRAY['té','encuentro','espejo','calma'], 'nicostars', 'seed', now() - INTERVAL '5 days'),
  ('Plaza Serrano de noche, todos los bares servían sueños en copas.', (SELECT id FROM places WHERE slug='plaza-serrano'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5882, -58.4377, cat_fantasia, 'asombro', ARRAY['bares','copas','noche','luces'], 'joaquinrem', 'seed', now() - INTERVAL '6 days'),
  ('Corría por los bosques persiguiendo a alguien que era yo de chico.', (SELECT id FROM places WHERE slug='bosques-palermo'), (SELECT id FROM neighborhoods WHERE slug='palermo'), -34.5731, -58.4119, cat_nostalgia, 'melancolía', ARRAY['infancia','correr','árboles','memoria'], 'valeolas', 'seed', now() - INTERVAL '7 days'),
  -- Recoleta cluster (~12)
  ('El cementerio se llenaba de luciérnagas y cada mausoleo abría sus puertas.', (SELECT id FROM places WHERE slug='cementerio-recoleta'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5876, -58.3935, cat_misterio, 'extrañeza', ARRAY['luciérnagas','noche','mármol','silencio'], 'lunaazul', 'seed', now() - INTERVAL '3 hours'),
  ('La Floralis se cerraba sobre mí como un abrazo metálico.', (SELECT id FROM places WHERE slug='floralis-generica'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5832, -58.3925, cat_amor, 'ternura', ARRAY['flor','metal','abrazo','sol'], 'martinsuena', 'seed', now() - INTERVAL '10 hours'),
  ('Los cuadros del MNBA salían a caminar después del cierre.', (SELECT id FROM places WHERE slug='mnba'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5836, -58.3933, cat_creatividad, 'asombro', ARRAY['arte','cuadros','noche','museo'], 'pauladream', 'seed', now() - INTERVAL '1 day 6 hours'),
  ('Caminaba entre tumbas y todas tenían mi apellido.', (SELECT id FROM places WHERE slug='cementerio-recoleta'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5876, -58.3935, cat_ansiedad, 'inquietud', ARRAY['nombre','muerte','familia','mármol'], 'joaquinrem', 'seed', now() - INTERVAL '2 days'),
  ('La Floralis tenía pétalos hechos de cartas que nunca envié.', (SELECT id FROM places WHERE slug='floralis-generica'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5832, -58.3925, cat_nostalgia, 'melancolía', ARRAY['cartas','flor','silencio','viento'], 'nicostars', 'seed', now() - INTERVAL '3 days'),
  ('Bailaba sola en la sala vacía del Bellas Artes.', (SELECT id FROM places WHERE slug='mnba'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5836, -58.3933, cat_creatividad, 'calma', ARRAY['baile','arte','soledad','luz'], 'valeolas', 'seed', now() - INTERVAL '4 days'),
  ('El cementerio era una ciudad y las calles tenían nombre de música.', (SELECT id FROM places WHERE slug='cementerio-recoleta'), (SELECT id FROM neighborhoods WHERE slug='recoleta'), -34.5876, -58.3935, cat_fantasia, 'asombro', ARRAY['ciudad','música','calles','noche'], 'lunaazul', 'seed', now() - INTERVAL '5 days'),
  -- Puerto Madero (~8)
  ('Cruzaba el Puente de la Mujer y abajo no había agua sino cielo.', (SELECT id FROM places WHERE slug='puente-mujer'), (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6097, -58.3633, cat_fantasia, 'vértigo', ARRAY['puente','cielo','vuelo','agua'], 'martinsuena', 'seed', now() - INTERVAL '1 hour'),
  ('La reserva ecológica se inundaba de mariposas violetas.', (SELECT id FROM places WHERE slug='reserva-ecologica'), (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6147, -58.3528, cat_naturaleza, 'asombro', ARRAY['mariposas','violeta','río','aire'], 'pauladream', 'seed', now() - INTERVAL '7 hours'),
  ('El puente se levantaba y me dejaba parado del otro lado del tiempo.', (SELECT id FROM places WHERE slug='puente-mujer'), (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6097, -58.3633, cat_misterio, 'extrañeza', ARRAY['puente','tiempo','otro lado','silencio'], 'joaquinrem', 'seed', now() - INTERVAL '2 days 5 hours'),
  ('Corría por la reserva persiguiendo al sol que no terminaba de caer.', (SELECT id FROM places WHERE slug='reserva-ecologica'), (SELECT id FROM neighborhoods WHERE slug='puerto-madero'), -34.6147, -58.3528, cat_aventura, 'euforia', ARRAY['sol','correr','río','horizonte'], 'nicostars', 'seed', now() - INTERVAL '4 days'),
  -- San Telmo (~10)
  ('Plaza Dorrego era un tablero gigante y los antigüedades se movían como piezas.', (SELECT id FROM places WHERE slug='plaza-dorrego'), (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6207, -58.3717, cat_fantasia, 'asombro', ARRAY['feria','ajedrez','antigüedades','baile'], 'valeolas', 'seed', now() - INTERVAL '6 hours'),
  ('En el mercado de San Telmo encontraba objetos que eran míos pero de otra vida.', (SELECT id FROM places WHERE slug='mercado-san-telmo'), (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6195, -58.3722, cat_nostalgia, 'extrañeza', ARRAY['objetos','memoria','vidas','tiempo'], 'lunaazul', 'seed', now() - INTERVAL '1 day'),
  ('Bailaba un tango con alguien que no tenía cara y la música era el latido.', (SELECT id FROM places WHERE slug='plaza-dorrego'), (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6207, -58.3717, cat_amor, 'ternura', ARRAY['tango','baile','corazón','noche'], 'pauladream', 'seed', now() - INTERVAL '2 days'),
  ('El parque Lezama tenía un árbol que daba libros como frutos.', (SELECT id FROM places WHERE slug='parque-lezama'), (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6280, -58.3700, cat_creatividad, 'asombro', ARRAY['libros','árbol','frutos','lectura'], 'martinsuena', 'seed', now() - INTERVAL '3 days'),
  ('Los adoquines de San Telmo me devolvían pasos que no eran míos.', NULL, (SELECT id FROM neighborhoods WHERE slug='san-telmo'), -34.6210, -58.3731, cat_misterio, 'extrañeza', ARRAY['adoquines','pasos','ecos','historia'], 'joaquinrem', 'seed', now() - INTERVAL '5 days'),
  -- La Boca (~8)
  ('Caminito se desplegaba como un libro pop-up con personajes que cantaban.', (SELECT id FROM places WHERE slug='caminito'), (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6383, -58.3622, cat_creatividad, 'euforia', ARRAY['color','música','pop-up','danza'], 'valeolas', 'seed', now() - INTERVAL '4 hours'),
  ('La Bombonera latía como un corazón y todos cantábamos al mismo ritmo.', (SELECT id FROM places WHERE slug='bombonera'), (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6354, -58.3645, cat_aventura, 'euforia', ARRAY['fútbol','canto','multitud','corazón'], 'nicostars', 'seed', now() - INTERVAL '9 hours'),
  ('La Usina del Arte se iluminaba desde adentro y proyectaba mis sueños afuera.', (SELECT id FROM places WHERE slug='usina-arte'), (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6395, -58.3565, cat_creatividad, 'asombro', ARRAY['arte','luz','proyección','noche'], 'lunaazul', 'seed', now() - INTERVAL '2 days'),
  ('Caminito flotaba sobre el riachuelo como una balsa de colores.', (SELECT id FROM places WHERE slug='caminito'), (SELECT id FROM neighborhoods WHERE slug='la-boca'), -34.6383, -58.3622, cat_fantasia, 'asombro', ARRAY['flotar','colores','río','viento'], 'pauladream', 'seed', now() - INTERVAL '3 days'),
  -- Belgrano / Núñez / etc
  ('Bajaba las barrancas de Belgrano y cada paso era una década atrás.', (SELECT id FROM places WHERE slug='barrancas-belgrano'), (SELECT id FROM neighborhoods WHERE slug='belgrano'), -34.5631, -58.4569, cat_nostalgia, 'melancolía', ARRAY['barrancas','tiempo','pasos','infancia'], 'martinsuena', 'seed', now() - INTERVAL '5 hours'),
  ('El Monumental estaba vacío y el césped me crecía bajo los pies.', (SELECT id FROM places WHERE slug='monumental'), (SELECT id FROM neighborhoods WHERE slug='nunez'), -34.5453, -58.4498, cat_misterio, 'calma', ARRAY['estadio','césped','vacío','silencio'], 'joaquinrem', 'seed', now() - INTERVAL '1 day 3 hours'),
  -- Caballito / Almagro / Balvanera
  ('El lago de Centenario tenía peces que escupían pequeñas tormentas.', (SELECT id FROM places WHERE slug='parque-centenario'), (SELECT id FROM neighborhoods WHERE slug='caballito'), -34.6065, -58.4359, cat_fantasia, 'asombro', ARRAY['lago','peces','tormenta','agua'], 'nicostars', 'seed', now() - INTERVAL '6 hours'),
  ('En el Abasto cada local vendía una versión distinta de mi infancia.', (SELECT id FROM places WHERE slug='abasto'), (SELECT id FROM neighborhoods WHERE slug='almagro'), -34.6037, -58.4109, cat_nostalgia, 'melancolía', ARRAY['shopping','infancia','tiendas','memoria'], 'valeolas', 'seed', now() - INTERVAL '1 day'),
  ('El Konex era una caja de música gigante y yo era una nota.', (SELECT id FROM places WHERE slug='konex'), (SELECT id FROM neighborhoods WHERE slug='almagro'), -34.6056, -58.4117, cat_creatividad, 'éxtasis', ARRAY['música','caja','nota','baile'], 'lunaazul', 'seed', now() - INTERVAL '2 days'),
  ('El Obelisco se volvía blando y se acostaba sobre la 9 de Julio.', (SELECT id FROM places WHERE slug='obelisco'), (SELECT id FROM neighborhoods WHERE slug='balvanera'), -34.6037, -58.3816, cat_fantasia, 'risa', ARRAY['obelisco','blando','calle','sueño'], 'pauladream', 'seed', now() - INTERVAL '4 hours'),
  ('El Congreso votaba sueños en lugar de leyes y todos aplaudían.', (SELECT id FROM places WHERE slug='congreso'), (SELECT id FROM neighborhoods WHERE slug='balvanera'), -34.6098, -58.3923, cat_creatividad, 'euforia', ARRAY['política','voto','aplausos','noche'], 'martinsuena', 'seed', now() - INTERVAL '12 hours'),
  -- Monserrat / Retiro
  ('En el Tortoni me servía café alguien que se parecía a Borges.', (SELECT id FROM places WHERE slug='cafe-tortoni'), (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6086, -58.3786, cat_nostalgia, 'ternura', ARRAY['café','borges','literatura','espejo'], 'joaquinrem', 'seed', now() - INTERVAL '8 hours'),
  ('El Colón tenía una función donde los instrumentos tocaban solos.', (SELECT id FROM places WHERE slug='teatro-colon'), (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6010, -58.3831, cat_fantasia, 'asombro', ARRAY['ópera','instrumentos','escenario','luces'], 'valeolas', 'seed', now() - INTERVAL '1 day 2 hours'),
  ('En el Cabildo abrían un portal y se veía la Buenos Aires de hace 200 años.', (SELECT id FROM places WHERE slug='cabildo'), (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6088, -58.3742, cat_misterio, 'asombro', ARRAY['portal','historia','colonial','tiempo'], 'lunaazul', 'seed', now() - INTERVAL '2 days 6 hours'),
  ('Plaza de Mayo se llenaba de palomas que me entregaban mensajes en sobres.', (SELECT id FROM places WHERE slug='plaza-mayo'), (SELECT id FROM neighborhoods WHERE slug='monserrat'), -34.6083, -58.3722, cat_creatividad, 'asombro', ARRAY['palomas','mensajes','plaza','cartas'], 'pauladream', 'seed', now() - INTERVAL '3 days'),
  ('Galerías Pacífico tenía un piso oculto donde se vendían recuerdos perdidos.', (SELECT id FROM places WHERE slug='galerias-pacifico'), (SELECT id FROM neighborhoods WHERE slug='retiro'), -34.5995, -58.3744, cat_misterio, 'extrañeza', ARRAY['galería','recuerdos','tiendas','escalera'], 'martinsuena', 'seed', now() - INTERVAL '5 hours'),
  ('Los frescos de la cúpula de Pacífico se ponían a hablar entre ellos.', (SELECT id FROM places WHERE slug='galerias-pacifico'), (SELECT id FROM neighborhoods WHERE slug='retiro'), -34.5995, -58.3744, cat_creatividad, 'asombro', ARRAY['arte','cúpula','frescos','voces'], 'nicostars', 'seed', now() - INTERVAL '1 day'),
  ('Chacarita estaba lleno de gatos que me guiaban por una salida secreta.', (SELECT id FROM places WHERE slug='chacarita-cementerio'), (SELECT id FROM neighborhoods WHERE slug='chacarita'), -34.5919, -58.4561, cat_aventura, 'asombro', ARRAY['gatos','laberinto','salida','noche'], 'joaquinrem', 'seed', now() - INTERVAL '2 days'),
  -- A few neighborhood-only (no place)
  ('Caminaba por Boedo y todas las esquinas tenían un poema escrito en la vereda.', NULL, (SELECT id FROM neighborhoods WHERE slug='boedo'), -34.6286, -58.4128, cat_creatividad, 'ternura', ARRAY['poesía','calles','escritura','tango'], 'valeolas', 'seed', now() - INTERVAL '7 hours'),
  ('Villa Crespo era un taller infinito y yo aprendía oficios distintos cada cuadra.', NULL, (SELECT id FROM neighborhoods WHERE slug='villa-crespo'), -34.5993, -58.4427, cat_creatividad, 'curiosidad', ARRAY['taller','aprender','manos','oficio'], 'lunaazul', 'seed', now() - INTERVAL '15 hours'),
  ('Barracas tenía murales que se movían al ritmo del riachuelo.', NULL, (SELECT id FROM neighborhoods WHERE slug='barracas'), -34.6428, -58.3823, cat_creatividad, 'asombro', ARRAY['murales','riachuelo','color','ritmo'], 'pauladream', 'seed', now() - INTERVAL '2 days'),
  ('En Colegiales el mercado vendía sonidos en frascos.', NULL, (SELECT id FROM neighborhoods WHERE slug='colegiales'), -34.5736, -58.4499, cat_fantasia, 'risa', ARRAY['mercado','sonidos','frascos','feria'], 'martinsuena', 'seed', now() - INTERVAL '3 days'),
  ('Saavedra era una isla y se podía cruzar caminando sobre los recuerdos.', NULL, (SELECT id FROM neighborhoods WHERE slug='saavedra'), -34.5544, -58.4862, cat_nostalgia, 'melancolía', ARRAY['isla','recuerdos','camino','niebla'], 'joaquinrem', 'seed', now() - INTERVAL '4 days'),
  ('Villa Urquiza tenía un subte que llevaba a barrios que ya no existen.', NULL, (SELECT id FROM neighborhoods WHERE slug='villa-urquiza'), -34.5731, -58.4870, cat_misterio, 'asombro', ARRAY['subte','barrios','tiempo','viaje'], 'nicostars', 'seed', now() - INTERVAL '5 days'),
  ('Flores se llenaba de pétalos y cada uno tenía el nombre de un sueño olvidado.', NULL, (SELECT id FROM neighborhoods WHERE slug='flores'), -34.6280, -58.4630, cat_nostalgia, 'melancolía', ARRAY['pétalos','nombres','olvido','viento'], 'valeolas', 'seed', now() - INTERVAL '6 days');
END $$;

-- ============ INITIAL STATS REFRESH ============
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.places LOOP
    PERFORM public.refresh_place_stats(r.id);
  END LOOP;
END $$;

-- ============ EXTERNAL SOURCES SEED ============
INSERT INTO public.external_sources (name) VALUES ('reddit_r_dreams'), ('public_dreams_dataset');
