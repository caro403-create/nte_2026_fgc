-- ============================================================
-- NTE Community Forum — Full Schema, Storage, Users & Seed Data
-- ============================================================

-- ============================================================
-- 0. PILOT USERS (auth.users)
-- ============================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, aud, role,
  created_at, updated_at, confirmation_token
) VALUES
  ('a1000001-0001-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000',
   'mateo.cruz@comunidad.org', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Don Mateo Cruz","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000002', '00000000-0000-0000-0000-000000000000',
   'carla.gomez@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Carla Gómez","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000003', '00000000-0000-0000-0000-000000000000',
   'carlos.ramirez@palmira.gov.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Carlos Ramírez","role":"brigadista"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000004', '00000000-0000-0000-0000-000000000000',
   'contacto@proaves-valle.org', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Fundación ProAves Valle","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000005', '00000000-0000-0000-0000-000000000000',
   'ana.velasco@cvc.gov.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Ana María Velasco","role":"brigadista"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000006', '00000000-0000-0000-0000-000000000000',
   'jorge.alvarado@univalle.edu.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Jorge Alvarado","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000007', '00000000-0000-0000-0000-000000000000',
   'lucia.caicedo@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Doña Lucía Caicedo","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000008', '00000000-0000-0000-0000-000000000000',
   'brigada@palmira.gov.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Brigada Forestal Palmira","role":"brigadista"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000009', '00000000-0000-0000-0000-000000000000',
   'pedro.sanchez@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Pedro Sánchez","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000010', '00000000-0000-0000-0000-000000000000',
   'laura.mejia@univalle.edu.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Laura Mejía","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000011', '00000000-0000-0000-0000-000000000000',
   'fernando.torres@hotmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Fernando Torres","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000012', '00000000-0000-0000-0000-000000000000',
   'miguel.ospina@bomberos.gov.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Miguel Ángel Ospina","role":"brigadista"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000013', '00000000-0000-0000-0000-000000000000',
   'diana.ruiz@iepalmiradelvalle.edu.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Profesora Diana Ruiz","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000014', '00000000-0000-0000-0000-000000000000',
   'roberto.valencia@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Roberto Valencia","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000015', '00000000-0000-0000-0000-000000000000',
   'sandra.munoz@hotmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Sandra Patricia Muñoz","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000016', '00000000-0000-0000-0000-000000000000',
   'rosa.quinones@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Rosa Elena Quiñones","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000017', '00000000-0000-0000-0000-000000000000',
   'maria.lopez@gmail.com', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"María Fernanda López","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), ''),

  ('a1000001-0001-4000-a000-000000000018', '00000000-0000-0000-0000-000000000000',
   'hernan.castillo@univalle.edu.co', crypt('PilotNTE2026!', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}'::jsonb,
   '{"full_name":"Prof. Hernán Castillo","role":"comunidad"}'::jsonb,
   'authenticated', 'authenticated', now(), now(), '')
ON CONFLICT (id) DO NOTHING;

-- Create identities (required by Supabase Auth)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT u.id, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email', u.id::text, now(), now(), now()
FROM auth.users u
WHERE u.id::text LIKE 'a1000001-0001-4000-a000-%'
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 1. SUPABASE STORAGE BUCKET (community-images)
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('community-images', 'community-images', true, 5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone reads, authenticated uploads (safe for re-run)
DO $$ BEGIN
  CREATE POLICY "Public read community images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated upload community images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'community-images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete own community images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'community-images' AND (select auth.uid())::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 2. COMMUNITY TABLES (with bilingual support)
-- ============================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,           -- English translation (null = original only)
  content TEXT NOT NULL,
  content_en TEXT,         -- English translation
  category TEXT NOT NULL DEFAULT 'Saberes Ancestrales',
  image_url TEXT,
  article_url TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_en TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_likes (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_email)
);

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON community_posts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own posts" ON community_posts FOR UPDATE TO authenticated USING ((select auth.uid()) = author_id) WITH CHECK ((select auth.uid()) = author_id);
CREATE POLICY "Users can delete own posts" ON community_posts FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

CREATE POLICY "Anyone can read comments" ON community_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON community_comments FOR DELETE TO authenticated USING ((select auth.uid()) = author_id);

CREATE POLICY "Anyone can read likes" ON community_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON community_likes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can remove own likes" ON community_likes FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);

GRANT SELECT ON community_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON community_posts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE community_posts_id_seq TO authenticated;

GRANT SELECT ON community_comments TO anon, authenticated;
GRANT INSERT, DELETE ON community_comments TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE community_comments_id_seq TO authenticated;

GRANT SELECT ON community_likes TO anon, authenticated;
GRANT INSERT, DELETE ON community_likes TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE community_likes_id_seq TO authenticated;


-- ============================================================
-- 3. SEED POSTS (bilingual: Spanish + English)
-- ============================================================

INSERT INTO community_posts (id, title, title_en, content, content_en, category, image_url, article_url, author_name, author_email, author_id, created_at) VALUES

(1,
 'Técnicas ancestrales de riego por ollas de arcilla en el bosque seco',
 'Ancestral clay pot irrigation techniques for the dry forest',
 'En nuestra vereda de Palmira, los abuelos usaban ollas de barro poroso enterradas junto a los árboles jóvenes. El agua se filtra lentamente desde la olla al suelo, manteniendo la humedad sin desperdiciar ni una gota. Esta técnica, conocida como "riego por olla" o "irrigación por subirrigación cerámica", es ideal para el bosque seco tropical donde el agua escasea en los meses de verano (junio-septiembre).

Hemos probado esta técnica en parcelas piloto de reforestación con caracolí y ceiba, y los resultados son extraordinarios: un 85% más de supervivencia que las plántulas sin este sistema. La arcilla local del río Amaime es perfecta para fabricar estas ollas.',
 'In our village in Palmira, the elders used porous clay pots buried next to young trees. Water slowly filters from the pot into the soil, maintaining moisture without wasting a single drop. This technique, known as "pot irrigation" or "ceramic sub-irrigation", is ideal for the tropical dry forest where water is scarce during summer months (June-September).

We tested this technique in pilot reforestation plots with caracolí and ceiba trees, and the results are extraordinary: 85% higher survival rate than seedlings without this system. The local clay from the Amaime River is perfect for making these pots.',
 'Saberes Ancestrales',
 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
 'https://www.fao.org/dryland-forestry/es/',
 'Don Mateo Cruz', 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-01 08:30:00+00'),

(2,
 'Avistamiento de venados de cola blanca en los Farallones',
 'White-tailed deer family spotted in the Farallones',
 'Esta mañana, cerca de la quebrada La Honda en la zona alta de Palmira, pudimos observar una familia completa de venados de cola blanca (Odocoileus virginianus). Eran 4 individuos: un macho adulto con cornamentas desarrolladas, dos hembras y un cervato joven. Se estaban alimentando de hojas de guásimo y bebiendo agua de la quebrada.

Es una señal positiva de que la fauna silvestre del Valle del Cauca se está recuperando en zonas donde hay menor intervención humana. Recordemos no acercarnos ni hacer ruido excesivo para no perturbarlos.',
 'This morning, near the La Honda creek in the highlands of Palmira, we were able to observe a complete family of white-tailed deer (Odocoileus virginianus). There were 4 individuals: an adult male with developed antlers, two females and a young fawn. They were feeding on guásimo leaves and drinking water from the creek.

This is a positive sign that wildlife in Valle del Cauca is recovering in areas with less human intervention. Remember not to approach or make excessive noise to avoid disturbing them.',
 'Fauna y Ecosistema',
 'https://images.unsplash.com/photo-1484406566174-437a19b2d55a?w=800',
 NULL,
 'Carla Gómez', 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-02 14:20:00+00'),

(3,
 'Memoria histórica: El gran incendio de Cerro Gordo, 2019',
 'Historical memory: The great fire of Cerro Gordo, 2019',
 'Quiero compartir con la comunidad lo que vivimos durante el incendio del cerro Gordo en 2019. El fuego empezó como una quema agrícola que se salió de control cerca de la vereda Combia. En cuestión de 3 horas, las llamas consumieron más de 120 hectáreas de bosque seco tropical.

Lo más doloroso fue ver cómo los animales huían desesperados: iguanas, serpientes, pájaros carpinteros, tucanes... muchos no lograron escapar.

Lo que aprendimos: las quemas NO controladas nunca son una buena opción. Existen alternativas como la incorporación de materia orgánica y el compostaje que no ponen en riesgo el ecosistema. Si ven humo sospechoso, repórtenlo inmediatamente por la plataforma NTE o llamando al 119.',
 'I want to share with the community what we experienced during the Cerro Gordo fire in 2019. The fire started as an agricultural burn that got out of control near the village of Combia. In just 3 hours, the flames consumed more than 120 hectares of tropical dry forest.

The most painful thing was watching the animals flee desperately: iguanas, snakes, woodpeckers, toucans... many didn''t make it.

What we learned: uncontrolled burns are NEVER a good option. There are alternatives like organic matter incorporation and composting that don''t put the ecosystem at risk. If you see suspicious smoke, report it immediately through the NTE platform or by calling 119.',
 'Historias y Cultura',
 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800',
 'https://www.eltiempo.com/colombia/cali/',
 'Carlos Ramírez', 'carlos.ramirez@palmira.gov.co', 'a1000001-0001-4000-a000-000000000003', '2026-06-28 10:15:00+00'),

(4,
 'Taller comunitario: Identificación de aves del bosque seco',
 'Community workshop: Dry forest bird identification',
 'Invitamos a toda la comunidad al taller de identificación de aves del bosque seco tropical que realizaremos este sábado 12 de julio a las 6:00 AM en el Parque Natural Los Sábalos, Palmira.

Aprenderemos a reconocer por canto y plumaje a las especies más representativas:
🐦 Barranquero coronado (Momotus subrufescens)
🦅 Gavilán caminero (Rupornis magnirostris)
🦜 Periquito de anteojos (Forpus conspicillatus)
🐤 Atrapamoscas piratiña (Legatus leucophaius)

Traer binoculares si tienen, ropa cómoda y mucha agua. El taller es gratuito y patrocinado por la Fundación ProAves y la CVC. ¡No falten!',
 'We invite the entire community to the tropical dry forest bird identification workshop on Saturday, July 12 at 6:00 AM at Los Sábalos Natural Park, Palmira.

We will learn to recognize by song and plumage the most representative species:
🐦 Rufous-capped motmot (Momotus subrufescens)
🦅 Roadside hawk (Rupornis magnirostris)
🦜 Spectacled parrotlet (Forpus conspicillatus)
🐤 Piratic flycatcher (Legatus leucophaius)

Bring binoculars if you have them, comfortable clothes and plenty of water. The workshop is free and sponsored by the ProAves Foundation and CVC. Don''t miss it!',
 'Noticias de la Comunidad',
 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800',
 'https://www.proaves.org/',
 'Fundación ProAves Valle', 'contacto@proaves-valle.org', 'a1000001-0001-4000-a000-000000000004', '2026-07-03 16:00:00+00'),

(5,
 'El guásimo: árbol sagrado del bosque seco vallecaucano',
 'The guásimo: sacred tree of the Valle del Cauca dry forest',
 'El guásimo (Guazuma ulmifolia) es una de las especies más importantes del bosque seco tropical del Valle del Cauca. Nuestros abuelos lo llamaban "el árbol de la vida" porque prácticamente todo en él es útil:

🌳 Su corteza se usa en infusiones para tratar la diarrea y problemas estomacales
🍃 Las hojas sirven como forraje nutritivo para el ganado
🫘 Los frutos son alimento para la fauna silvestre: guacharacas, ardillas, murciélagos
🪵 La madera es resistente y liviana, ideal para cercos y postes

Además, el guásimo es un árbol pionero en la restauración ecológica: crece rápido, tolera suelos pobres y fija nitrógeno. Si quieren sembrar árboles nativos en sus fincas, esta es una excelente opción. Tenemos semillas disponibles en el vivero comunitario de Rozo.',
 'The guásimo (Guazuma ulmifolia) is one of the most important species in the tropical dry forest of Valle del Cauca. Our grandparents called it "the tree of life" because virtually everything about it is useful:

🌳 Its bark is used in infusions to treat diarrhea and stomach problems
🍃 The leaves serve as nutritious fodder for livestock
🫘 The fruits are food for wildlife: guans, squirrels, bats
🪵 The wood is resistant and lightweight, ideal for fences and posts

Moreover, the guásimo is a pioneer tree in ecological restoration: it grows fast, tolerates poor soils and fixes nitrogen. If you want to plant native trees on your farms, this is an excellent choice. We have seeds available at the community nursery in Rozo.',
 'Saberes Ancestrales',
 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800',
 'https://www.cvc.gov.co/biodiversidad',
 'Ana María Velasco', 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-04 09:45:00+00'),

(6,
 'Monitoreo de la quebrada Aguaclara: resultados preocupantes',
 'Aguaclara creek monitoring: concerning results',
 'Realizamos el muestreo mensual de calidad de agua en la quebrada Aguaclara, afluente del río Palmira. Los resultados de junio son preocupantes:

📊 pH: 5.8 (ácido, debería estar entre 6.5-8.5)
📊 Oxígeno disuelto: 3.2 mg/L (bajo, mínimo aceptable: 5 mg/L)
📊 Coliformes: 2,400 NMP/100mL (muy alto)
📊 Temperatura: 28.5°C (elevada para un arroyo de montaña)

Estos datos indican contaminación por vertimientos agrícolas y ganaderos aguas arriba. Solicitamos a la CVC intervenir con urgencia. Los datos fueron enviados también al IDEAM.

¿Algún vecino ha notado cambios en el color o el olor del agua? Compartan sus observaciones.',
 'We conducted the monthly water quality sampling at Aguaclara creek, a tributary of the Palmira River. The June results are concerning:

📊 pH: 5.8 (acidic, should be between 6.5-8.5)
📊 Dissolved oxygen: 3.2 mg/L (low, minimum acceptable: 5 mg/L)
📊 Coliforms: 2,400 MPN/100mL (very high)
📊 Temperature: 28.5°C (elevated for a mountain stream)

These data indicate contamination from agricultural and livestock discharges upstream. We are requesting the CVC to intervene urgently. The data has also been sent to IDEAM.

Has any neighbor noticed changes in the color or smell of the water? Share your observations.',
 'Fauna y Ecosistema',
 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
 'https://www.ideam.gov.co/',
 'Jorge Alvarado', 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-03 11:30:00+00'),

(7,
 'Receta tradicional: Manjar blanco vallecaucano y la caña panelera',
 'Traditional recipe: Valle del Cauca milk caramel and sugarcane',
 'Comparto la receta del manjar blanco vallecaucano que me enseñó mi abuela doña Carmen en Buga. Este dulce es parte fundamental de nuestra identidad cultural y está ligado al cultivo sostenible de caña panelera:

🥛 Ingredientes: 8 litros de leche fresca, 2 kg de azúcar, 1 astilla de canela, ralladura de limón
⏰ Preparación: Cocinar a fuego lento durante 4-5 horas, revolviendo constantemente con cuchara de palo
🍮 El punto exacto: cuando se ve el fondo de la paila al pasar la cuchara

La caña panelera del Valle es fundamental para nuestra economía rural. A diferencia de la caña de azúcar industrial, los trapiches paneleros son sostenibles y mantienen la biodiversidad del suelo. Apoyemos a nuestros productores locales comprando panela artesanal.',
 'I''m sharing the recipe for manjar blanco (milk caramel) from Valle del Cauca that my grandmother doña Carmen taught me in Buga. This sweet is a fundamental part of our cultural identity and is linked to sustainable sugarcane cultivation:

🥛 Ingredients: 8 liters of fresh milk, 2 kg of sugar, 1 cinnamon stick, lemon zest
⏰ Preparation: Cook over low heat for 4-5 hours, stirring constantly with a wooden spoon
🍮 The exact point: when you can see the bottom of the pan when passing the spoon

Valle del Cauca''s panela sugarcane is fundamental to our rural economy. Unlike industrial sugar cane, panela mills are sustainable and maintain soil biodiversity. Let''s support our local producers by buying artisanal panela.',
 'Historias y Cultura',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
 NULL,
 'Doña Lucía Caicedo', 'lucia.caicedo@gmail.com', 'a1000001-0001-4000-a000-000000000007', '2026-06-30 15:00:00+00'),

(8,
 'Jornada de reforestación: 500 árboles nativos plantados en Rozo',
 'Reforestation day: 500 native trees planted in Rozo',
 'Con inmensa alegría reportamos que la jornada de reforestación del pasado fin de semana fue un éxito total. ¡Plantamos 500 árboles nativos del bosque seco tropical en la vereda Rozo, Palmira!

Especies plantadas:
🌳 Caracolí (Anacardium excelsum) — 120 individuos
🌳 Ceiba (Ceiba pentandra) — 80 individuos
🌳 Guásimo (Guazuma ulmifolia) — 100 individuos
🌳 Samán (Samanea saman) — 80 individuos
🌳 Igüá (Pseudosamanea guachapele) — 120 individuos

Participaron 85 voluntarios de la comunidad, estudiantes de la Universidad del Valle y brigadistas forestales de Palmira. El vivero comunitario proporcionó las plántulas que fueron germinadas durante los últimos 8 meses.

Próxima jornada: 26 de julio. Necesitamos más voluntarios. Inscripciones abiertas.',
 'We are thrilled to report that last weekend''s reforestation day was a total success. We planted 500 native trees of the tropical dry forest in the village of Rozo, Palmira!

Species planted:
🌳 Caracolí (Anacardium excelsum) — 120 individuals
🌳 Ceiba (Ceiba pentandra) — 80 individuals
🌳 Guásimo (Guazuma ulmifolia) — 100 individuals
🌳 Samán (Samanea saman) — 80 individuals
🌳 Igüá (Pseudosamanea guachapele) — 120 individuals

85 community volunteers, students from Universidad del Valle and forest brigades from Palmira participated. The community nursery provided the seedlings that were germinated over the past 8 months.

Next event: July 26. We need more volunteers. Registration is open.',
 'Noticias de la Comunidad',
 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
 NULL,
 'Brigada Forestal Palmira', 'brigada@palmira.gov.co', 'a1000001-0001-4000-a000-000000000008', '2026-07-04 12:00:00+00');

SELECT setval('community_posts_id_seq', (SELECT MAX(id) FROM community_posts));


-- ============================================================
-- 4. SEED COMMENTS (bilingual)
-- ============================================================

INSERT INTO community_comments (post_id, content, content_en, author_name, author_email, author_id, created_at) VALUES
(1, 'Excelente técnica, don Mateo. Mi abuelo también la usaba en la finca cerca de Amaime. Funciona increíblemente bien con los cítricos.',
    'Excellent technique, don Mateo. My grandfather also used it on the farm near Amaime. It works incredibly well with citrus trees.',
 'Pedro Sánchez', 'pedro.sanchez@gmail.com', 'a1000001-0001-4000-a000-000000000009', '2026-07-01 10:00:00+00'),

(1, 'Voy a probar esto en mi parcela de reforestación en Rozo. ¿Dónde consigo las ollas de arcilla porosa?',
    'I''m going to try this in my reforestation plot in Rozo. Where can I get the porous clay pots?',
 'Laura Mejía', 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-01 14:30:00+00'),

(1, 'En el mercado de Palmira, doña Rosalba vende ollas de barro ideales para esto. Le pueden decir que van de parte de la comunidad NTE.',
    'At the Palmira market, doña Rosalba sells clay pots ideal for this. You can tell her you come from the NTE community.',
 'Don Mateo Cruz', 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-01 16:45:00+00'),

(2, '¡Hermoso! Hace meses que no veía venados por esta zona. Ojalá podamos crear un corredor biológico protegido.',
    'Beautiful! I haven''t seen deer in this area for months. Hopefully we can create a protected biological corridor.',
 'Ana María Velasco', 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-02 16:10:00+00'),

(2, 'Yo vi una pareja de venados cerca de la laguna de Sonso el mes pasado. Parece que se están expandiendo.',
    'I saw a pair of deer near Sonso lagoon last month. It seems they are expanding their range.',
 'Fernando Torres', 'fernando.torres@hotmail.com', 'a1000001-0001-4000-a000-000000000011', '2026-07-02 18:30:00+00'),

(3, 'Recuerdo ese incendio perfectamente. Estuve ayudando como voluntario con los bomberos. Fue devastador ver arder el bosque.',
    'I remember that fire perfectly. I was helping as a volunteer with the firefighters. It was devastating to watch the forest burn.',
 'Miguel Ángel Ospina', 'miguel.ospina@bomberos.gov.co', 'a1000001-0001-4000-a000-000000000012', '2026-06-29 08:20:00+00'),

(3, 'Gracias por compartir esta memoria, Carlos. Es importante que las nuevas generaciones conozcan estas historias para que no se repitan.',
    'Thank you for sharing this memory, Carlos. It''s important that new generations know these stories so they don''t repeat.',
 'Profesora Diana Ruiz', 'diana.ruiz@iepalmiradelvalle.edu.co', 'a1000001-0001-4000-a000-000000000013', '2026-06-29 11:00:00+00'),

(4, '¡Excelente iniciativa! Yo iré con mi grupo de observadores de aves de Cali. ¿Hay cupo para 12 personas?',
    'Excellent initiative! I''ll go with my birdwatching group from Cali. Is there room for 12 people?',
 'Roberto Valencia', 'roberto.valencia@gmail.com', 'a1000001-0001-4000-a000-000000000014', '2026-07-03 17:30:00+00'),

(5, 'Mi abuelita siempre decía que el guásimo cura la gripa si tomas la infusión con miel de abejas. ¡Gran árbol!',
    'My grandmother always said that guásimo cures the flu if you drink the infusion with honey. Great tree!',
 'Sandra Patricia Muñoz', 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-04 11:00:00+00'),

(5, 'En nuestra finca en Pradera tenemos un guásimo centenario. Es el hogar de al menos 15 especies de aves que hemos identificado.',
    'On our farm in Pradera we have a century-old guásimo. It''s home to at least 15 bird species we''ve identified.',
 'Jorge Alvarado', 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-04 13:15:00+00'),

(6, 'Muy preocupante. He notado que el agua tiene un color verdoso desde hace unas semanas. También hay menos peces.',
    'Very concerning. I''ve noticed the water has had a greenish color for a few weeks. There are also fewer fish.',
 'Rosa Elena Quiñones', 'rosa.quinones@gmail.com', 'a1000001-0001-4000-a000-000000000016', '2026-07-03 14:00:00+00'),

(6, 'Desde la CVC estamos gestionando una visita técnica para la próxima semana. Gracias por el reporte, Jorge.',
    'From the CVC we are arranging a technical visit for next week. Thank you for the report, Jorge.',
 'Ana María Velasco', 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-03 16:45:00+00'),

(7, '¡Doña Lucía, ese manjar blanco es el mejor del Valle! ¿Cuándo hace otra tanda para vender?',
    'Doña Lucía, that milk caramel is the best in the Valley! When will you make another batch to sell?',
 'Carlos Ramírez', 'carlos.ramirez@palmira.gov.co', 'a1000001-0001-4000-a000-000000000003', '2026-07-01 09:00:00+00'),

(8, 'Estuve en la jornada y fue una experiencia transformadora. Mis hijos de 8 y 11 años plantaron sus primeros árboles. ¡Estaremos en la próxima!',
    'I was at the event and it was a transformative experience. My 8 and 11-year-old children planted their first trees. We''ll be at the next one!',
 'María Fernanda López', 'maria.lopez@gmail.com', 'a1000001-0001-4000-a000-000000000017', '2026-07-04 14:30:00+00'),

(8, 'Desde la Universidad del Valle confirmamos la participación de 30 estudiantes del programa de Biología para la próxima jornada.',
    'From Universidad del Valle we confirm the participation of 30 Biology program students for the next event.',
 'Prof. Hernán Castillo', 'hernan.castillo@univalle.edu.co', 'a1000001-0001-4000-a000-000000000018', '2026-07-04 16:00:00+00');


-- ============================================================
-- 5. SEED LIKES
-- ============================================================

INSERT INTO community_likes (post_id, user_email, user_id, created_at) VALUES
(1, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-01 09:00:00+00'),
(1, 'pedro.sanchez@gmail.com', 'a1000001-0001-4000-a000-000000000009', '2026-07-01 10:30:00+00'),
(1, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-01 11:00:00+00'),
(1, 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-01 15:00:00+00'),
(1, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-02 08:00:00+00'),
(1, 'brigada@palmira.gov.co', 'a1000001-0001-4000-a000-000000000008', '2026-07-02 09:00:00+00'),
(1, 'fernando.torres@hotmail.com', 'a1000001-0001-4000-a000-000000000011', '2026-07-02 10:00:00+00'),
(2, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-02 15:00:00+00'),
(2, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-02 15:30:00+00'),
(2, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-02 16:00:00+00'),
(2, 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-02 17:00:00+00'),
(2, 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-03 08:00:00+00'),
(2, 'brigada@palmira.gov.co', 'a1000001-0001-4000-a000-000000000008', '2026-07-03 09:00:00+00'),
(2, 'roberto.valencia@gmail.com', 'a1000001-0001-4000-a000-000000000014', '2026-07-03 10:00:00+00'),
(2, 'carlos.ramirez@palmira.gov.co', 'a1000001-0001-4000-a000-000000000003', '2026-07-03 11:00:00+00'),
(2, 'rosa.quinones@gmail.com', 'a1000001-0001-4000-a000-000000000016', '2026-07-03 12:00:00+00'),
(3, 'miguel.ospina@bomberos.gov.co', 'a1000001-0001-4000-a000-000000000012', '2026-06-29 09:00:00+00'),
(3, 'diana.ruiz@iepalmiradelvalle.edu.co', 'a1000001-0001-4000-a000-000000000013', '2026-06-29 12:00:00+00'),
(3, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-06-30 08:00:00+00'),
(3, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-06-30 10:00:00+00'),
(3, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-06-30 14:00:00+00'),
(4, 'roberto.valencia@gmail.com', 'a1000001-0001-4000-a000-000000000014', '2026-07-03 17:45:00+00'),
(4, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-03 18:00:00+00'),
(4, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-03 19:00:00+00'),
(4, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-03 20:00:00+00'),
(4, 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-03 21:00:00+00'),
(4, 'pedro.sanchez@gmail.com', 'a1000001-0001-4000-a000-000000000009', '2026-07-04 06:00:00+00'),
(4, 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-04 07:00:00+00'),
(4, 'fernando.torres@hotmail.com', 'a1000001-0001-4000-a000-000000000011', '2026-07-04 08:00:00+00'),
(4, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-04 09:00:00+00'),
(4, 'brigada@palmira.gov.co', 'a1000001-0001-4000-a000-000000000008', '2026-07-04 10:00:00+00'),
(5, 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-04 11:30:00+00'),
(5, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-04 13:30:00+00'),
(5, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-04 14:00:00+00'),
(5, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-04 15:00:00+00'),
(5, 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-04 16:00:00+00'),
(5, 'brigada@palmira.gov.co', 'a1000001-0001-4000-a000-000000000008', '2026-07-04 17:00:00+00'),
(6, 'rosa.quinones@gmail.com', 'a1000001-0001-4000-a000-000000000016', '2026-07-03 14:30:00+00'),
(6, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-03 17:00:00+00'),
(6, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-03 18:00:00+00'),
(6, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-03 19:00:00+00'),
(7, 'carlos.ramirez@palmira.gov.co', 'a1000001-0001-4000-a000-000000000003', '2026-07-01 09:30:00+00'),
(7, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-01 10:00:00+00'),
(7, 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-01 11:00:00+00'),
(7, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-01 12:00:00+00'),
(7, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-01 13:00:00+00'),
(7, 'pedro.sanchez@gmail.com', 'a1000001-0001-4000-a000-000000000009', '2026-07-02 08:00:00+00'),
(7, 'laura.mejia@univalle.edu.co', 'a1000001-0001-4000-a000-000000000010', '2026-07-02 09:00:00+00'),
(7, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-02 10:00:00+00'),
(8, 'maria.lopez@gmail.com', 'a1000001-0001-4000-a000-000000000017', '2026-07-04 14:45:00+00'),
(8, 'hernan.castillo@univalle.edu.co', 'a1000001-0001-4000-a000-000000000018', '2026-07-04 16:15:00+00'),
(8, 'ana.velasco@cvc.gov.co', 'a1000001-0001-4000-a000-000000000005', '2026-07-04 17:00:00+00'),
(8, 'mateo.cruz@comunidad.org', 'a1000001-0001-4000-a000-000000000001', '2026-07-04 17:30:00+00'),
(8, 'carla.gomez@gmail.com', 'a1000001-0001-4000-a000-000000000002', '2026-07-04 18:00:00+00'),
(8, 'jorge.alvarado@univalle.edu.co', 'a1000001-0001-4000-a000-000000000006', '2026-07-04 18:30:00+00'),
(8, 'sandra.munoz@hotmail.com', 'a1000001-0001-4000-a000-000000000015', '2026-07-04 19:00:00+00'),
(8, 'pedro.sanchez@gmail.com', 'a1000001-0001-4000-a000-000000000009', '2026-07-04 19:30:00+00'),
(8, 'roberto.valencia@gmail.com', 'a1000001-0001-4000-a000-000000000014', '2026-07-04 20:00:00+00'),
(8, 'fernando.torres@hotmail.com', 'a1000001-0001-4000-a000-000000000011', '2026-07-04 20:30:00+00'),
(8, 'rosa.quinones@gmail.com', 'a1000001-0001-4000-a000-000000000016', '2026-07-04 21:00:00+00'),
(8, 'carlos.ramirez@palmira.gov.co', 'a1000001-0001-4000-a000-000000000003', '2026-07-04 21:30:00+00'),
(8, 'lucia.caicedo@gmail.com', 'a1000001-0001-4000-a000-000000000007', '2026-07-04 22:00:00+00');
