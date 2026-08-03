/**
 * Genera supabase/migrations/20260803_ancestral_knowledge.sql a partir de
 * src/data/ancestralKnowledge.js.
 *
 * El contenido de los saberes se escribe una sola vez, en el módulo JS, y de
 * ahí salen tanto el respaldo que usa la pestaña como el seed de la base. Si
 * se editan los textos, hay que volver a correr:
 *
 *   node scripts/generate_ancestral_sql.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ANCESTRAL_ENTRIES } from '../src/data/ancestralKnowledge.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const q = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const jsonb = (v) => (v ? `${q(JSON.stringify(v))}::jsonb` : 'NULL');
const textArray = (arr) =>
  arr && arr.length ? `ARRAY[${arr.map(q).join(', ')}]::TEXT[]` : 'NULL';

// El `id` se deja a la secuencia a propósito. Insertarlo fijo hacía que una
// segunda ejecución chocara contra la llave primaria en vez de resolverse por
// el ON CONFLICT (slug), que es lo que vuelve idempotente a la migración.
const COLUMNS = [
  'slug', 'sort_order', 'featured', 'category', 'fire_role',
  'title', 'title_en', 'summary', 'summary_en', 'content', 'content_en',
  'practices', 'today', 'today_en', 'people', 'people_en', 'region',
  'ecosystem', 'ecosystem_en', 'season', 'season_en', 'tags',
  'image_url', 'image_credit', 'image_license', 'image_source_url',
  'source_name', 'source_url'
];

const row = (e) => `(${[
  q(e.slug), e.sort_order, e.featured, q(e.category), q(e.fire_role),
  q(e.title), q(e.title_en), q(e.summary), q(e.summary_en), q(e.content), q(e.content_en),
  jsonb(e.practices), q(e.today), q(e.today_en), q(e.people), q(e.people_en), q(e.region),
  q(e.ecosystem), q(e.ecosystem_en), q(e.season), q(e.season_en), textArray(e.tags),
  q(e.image_url), q(e.image_credit), q(e.image_license), q(e.image_source_url),
  q(e.source_name), q(e.source_url)
].join(',\n  ')})`;

const sql = `-- ============================================================
-- NTE · Saberes ancestrales sobre el fuego
-- Tabla, RLS y contenido inicial (bilingüe español / inglés).
--
-- ARCHIVO GENERADO. No editar a mano: el contenido vive en
-- src/data/ancestralKnowledge.js y este archivo se regenera con
--   node scripts/generate_ancestral_sql.mjs
--
-- Se puede correr varias veces sin romper nada.
-- ============================================================

CREATE TABLE IF NOT EXISTS ancestral_knowledge (
  id             BIGSERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  featured       BOOLEAN NOT NULL DEFAULT false,

  -- Categoría temática. La clave viaja en español; la UI traduce.
  category       TEXT NOT NULL DEFAULT 'Manejo del Fuego',
  -- Papel del fuego: uso | prohibicion | prevencion | lectura
  fire_role      TEXT NOT NULL DEFAULT 'lectura',

  title          TEXT NOT NULL,
  title_en       TEXT,
  summary        TEXT NOT NULL,
  summary_en     TEXT,
  content        TEXT NOT NULL,
  content_en     TEXT,

  -- [{ "es": "...", "en": "..." }] — las claves prácticas de cada saber.
  practices      JSONB,

  -- Cómo se conecta el saber con lo que mide la plataforma hoy.
  today          TEXT,
  today_en       TEXT,

  people         TEXT,
  people_en      TEXT,
  region         TEXT,
  ecosystem      TEXT,
  ecosystem_en   TEXT,
  season         TEXT,
  season_en      TEXT,
  tags           TEXT[],

  -- Imagen con su crédito: casi todas son CC o dominio público y la
  -- atribución es obligatoria, así que viaja junto al archivo.
  image_url         TEXT,
  image_credit      TEXT,
  image_license     TEXT,
  image_source_url  TEXT,

  source_name    TEXT,
  source_url     TEXT,

  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ancestral_knowledge_category_idx  ON ancestral_knowledge (category);
CREATE INDEX IF NOT EXISTS ancestral_knowledge_fire_role_idx ON ancestral_knowledge (fire_role);
CREATE INDEX IF NOT EXISTS ancestral_knowledge_order_idx     ON ancestral_knowledge (sort_order);

ALTER TABLE ancestral_knowledge ENABLE ROW LEVEL SECURITY;

-- Contenido curado: lectura pública, escritura sólo desde el panel de
-- Supabase o con la service key. No hay política de INSERT a propósito.
DO $$ BEGIN
  CREATE POLICY "Anyone can read ancestral knowledge"
    ON ancestral_knowledge FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON ancestral_knowledge TO anon, authenticated;


-- ============================================================
-- Contenido inicial
-- ============================================================

INSERT INTO ancestral_knowledge (
  ${COLUMNS.join(', ')}
) VALUES

${ANCESTRAL_ENTRIES.map(row).join(',\n\n')}

ON CONFLICT (slug) DO UPDATE SET
  ${COLUMNS.filter(c => c !== 'slug')
      .map(c => `${c} = EXCLUDED.${c}`).join(',\n  ')},
  updated_at = now();
`;

const out = join(root, 'supabase/migrations/20260803_ancestral_knowledge.sql');
writeFileSync(out, sql);
console.log(`${ANCESTRAL_ENTRIES.length} saberes → ${out}`);
