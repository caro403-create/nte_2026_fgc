import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flame, Sprout, CalendarDays, Users, Home, Filter, X, Search,
  MapPin, Leaf, BookOpen, ExternalLink, ArrowRight, ArrowUpRight,
  Ban, Eye, Satellite, Loader2, Quote
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import {
  ANCESTRAL_CATEGORIES, FIRE_ROLES, ANCESTRAL_ENTRIES
} from '../data/ancestralKnowledge';

// Los iconos no viven en el módulo de datos: ese archivo también genera el
// seed SQL y debe quedarse en datos puros, sin componentes de React.
const CATEGORY_ICONS = {
  'Manejo del Fuego': Flame,
  'Calendario y Señales': CalendarDays,
  'Plantas y Territorio': Sprout,
  'Fogón y Memoria': Home,
  'Gobernanza del Territorio': Users
};

const FIRE_ROLE_ICONS = {
  uso: Flame,
  prohibicion: Ban,
  prevencion: Leaf,
  lectura: Eye
};

const T = {
  // ---- El nombre del sistema ----
  nameKicker: { es: 'EL NOMBRE DEL SISTEMA', en: 'THE NAME OF THE SYSTEM' },
  nameTitle:  { es: 'Kawsay', en: 'Kawsay' },
  nameTagline: {
    es: 'No es una sigla: es una palabra quechua que quiere decir vida.',
    en: 'Not an acronym: a Quechua word that means life.'
  },
  nameQ1: { es: 'Qué significa Kawsay', en: 'What Kawsay means' },
  nameA1: {
    es: 'Kawsay es una palabra que significa «vida», «existencia» o «forma de vivir». En la cosmovisión andina no se refiere únicamente a la vida de las personas, sino a la vida de todos los seres que conforman un ecosistema: plantas, animales, agua, suelo y comunidades. También está asociada al equilibrio y la armonía entre la naturaleza y el ser humano.',
    en: 'Kawsay is a word meaning “life”, “existence” or “way of living”. In the Andean worldview it does not refer only to human life, but to the life of every being that makes up an ecosystem: plants, animals, water, soil and communities. It also carries the sense of balance and harmony between nature and people.'
  },
  nameQ2: { es: 'De dónde proviene el nombre', en: 'Where the name comes from' },
  nameA2: {
    es: 'El término proviene del quechua, una de las lenguas indígenas más importantes de la región andina, hablada por millones de personas en Perú, Bolivia, Ecuador y el sur de Colombia. Es un concepto central de la filosofía andina, sobre todo en la expresión Sumak Kawsay —«Buen Vivir»—, que promueve una relación equilibrada entre las comunidades y la naturaleza.',
    en: 'The term comes from Quechua, one of the most significant Indigenous languages of the Andes, spoken by millions of people in Peru, Bolivia, Ecuador and southern Colombia. It is a central concept of Andean philosophy, above all in the expression Sumak Kawsay — “Good Living” — which calls for a balanced relationship between communities and nature.'
  },
  nameQ3: { es: 'Por qué se alinea con el proyecto', en: 'Why it fits this project' },
  nameA3: {
    es: 'Kawsay se alinea con el proyecto porque su propósito principal es proteger y preservar la vida de los ecosistemas forestales. La solución no solo detecta incendios: integra la detección temprana, el monitoreo, la prevención y la remediación, buscando conservar la biodiversidad y restaurar las zonas afectadas. Además incorpora conocimientos inspirados en los saberes ancestrales, reconociendo que las comunidades indígenas han desarrollado, durante generaciones, formas de comprender y cuidar el territorio.',
    en: 'Kawsay fits this project because its central purpose is to protect and preserve the life of forest ecosystems. The solution does not only detect fires: it integrates early detection, monitoring, prevention and remediation, working to conserve biodiversity and restore affected areas. It also draws on ancestral knowledge, recognising that Indigenous communities have developed, over generations, their own ways of understanding and caring for the land.'
  },
  nameQ4: { es: 'A qué comunidad pertenece', en: 'Whose word it is' },
  nameA4: {
    es: 'El término pertenece a la cultura y la tradición de los pueblos quechuas, una de las civilizaciones indígenas más influyentes de los Andes, cuya visión del mundo se basa en el respeto por la naturaleza y la convivencia armónica con ella.',
    en: 'The term belongs to the culture and tradition of the Quechua peoples, one of the most influential Indigenous civilisations of the Andes, whose worldview rests on respect for nature and on living in harmony with it.'
  },
  nameLogoAlt: { es: 'Logo de Kawsay', en: 'Kawsay logo' },
  namePhotoAlt: {
    es: 'Ilustración de una familia indígena: dos niños, una mujer joven y un hombre mayor, con tocados tejidos y pintura facial, entre vegetación',
    en: 'Illustration of an Indigenous family: two children, a young woman and an elder, wearing woven headbands and face paint, among foliage'
  },
  // El pie describe lo que la ilustración muestra —una familia indígena, sin
  // adscribirla a un pueblo concreto—, mientras el origen quechua del nombre
  // queda explicado en el texto de al lado, que es donde corresponde.
  namePhotoCaption: {
    es: 'Los saberes que recoge esta sección pertenecen a las comunidades indígenas y campesinas que habitan el territorio. El nombre del sistema viene del quechua, la lengua andina de la que toma su idea de vida.',
    en: 'The knowledge gathered in this section belongs to the Indigenous and campesino communities who live on this land. The name of the system comes from Quechua, the Andean language from which it takes its idea of life.'
  },
  slotPending: {
    es: 'ESPACIO RESERVADO PARA LA IMAGEN',
    en: 'SPACE RESERVED FOR THE IMAGE'
  },

  kicker:      { es: 'SABERES ANCESTRALES DEL FUEGO', en: 'ANCESTRAL FIRE KNOWLEDGE' },
  title1:      { es: 'Lo que el territorio', en: 'What the land already' },
  titleEm:     { es: 'ya sabía', en: 'knew' },
  title2:      { es: 'del fuego', en: 'about fire' },
  lead: {
    es: 'Antes del satélite y del sensor, las comunidades de Colombia llevaban siglos decidiendo cuándo encender, dónde nunca hacerlo y cómo leer el año. Estas doce entradas reúnen ese manejo tradicional del fuego y lo ponen al lado de lo que la plataforma mide hoy.',
    en: 'Long before the satellite and the sensor, Colombia\'s communities spent centuries deciding when to light, where never to, and how to read the year. These twelve entries gather that traditional fire management and set it beside what the platform measures today.'
  },
  statKnowledge: { es: 'Saberes', en: 'Entries' },
  statEcosystems: { es: 'Ecosistemas', en: 'Ecosystems' },
  statThemes:    { es: 'Temas', en: 'Themes' },
  all:         { es: 'Todos', en: 'All' },
  filterTheme: { es: 'Tema', en: 'Theme' },
  filterRole:  { es: 'El fuego aquí', en: 'Fire here' },
  searchPh:    { es: 'Buscar saber, pueblo, especie…', en: 'Search knowledge, people, species…' },
  resultsOne:  { es: 'saber', en: 'entry' },
  resultsMany: { es: 'saberes', en: 'entries' },
  featured:    { es: 'Para empezar', en: 'Start here' },
  allEntries:  { es: 'Todos los saberes', en: 'All entries' },
  read:        { es: 'Leer el saber', en: 'Read the entry' },
  empty:       { es: 'Ningún saber coincide con este filtro.', en: 'No entry matches this filter.' },
  clear:       { es: 'Quitar filtros', en: 'Clear filters' },
  loading:     { es: 'Cargando saberes…', en: 'Loading entries…' },
  people:      { es: 'Quién lo sostiene', en: 'Who holds it' },
  region:      { es: 'Dónde', en: 'Where' },
  ecosystem:   { es: 'Ecosistema', en: 'Ecosystem' },
  season:      { es: 'Cuándo', en: 'When' },
  practices:   { es: 'Cómo se hace', en: 'How it is done' },
  todayTitle:  { es: 'Cómo se lee hoy', en: 'How it reads today' },
  source:      { es: 'Para ampliar', en: 'Read further' },
  photo:       { es: 'Fotografía', en: 'Photograph' },
  close:       { es: 'Cerrar', en: 'Close' },
  fallback: {
    es: 'Mostrando el contenido incluido en la aplicación: la tabla de saberes todavía no responde en la base de datos.',
    en: 'Showing the content bundled with the app: the knowledge table is not responding in the database yet.'
  },
  ctaTitle:    { es: '¿Su comunidad tiene un saber que no está aquí?', en: 'Does your community hold knowledge that is missing here?' },
  ctaBody: {
    es: 'Esta sección es un punto de partida, no un inventario cerrado. Las técnicas, señales y acuerdos que se practican en cada vereda son los que faltan, y la plaza comunitaria es el lugar para dejarlos escritos.',
    en: 'This section is a starting point, not a closed inventory. The techniques, signs and agreements practised in each village are what is missing, and the community plaza is the place to write them down.'
  },
  ctaBtn:      { es: 'Compartir en la comunidad', en: 'Share with the community' },
  ctaObs:      { es: 'Ver las capas de hoy', en: 'See today\'s layers' }
};

const t = (key, lang) => T[key][lang === 'en' ? 'en' : 'es'];

/**
 * Hueco de imagen que se llena solo.
 *
 * Mientras el archivo no exista en `public/kawsay/`, muestra un recuadro
 * punteado con la leyenda; en cuanto se sube con el nombre esperado, aparece
 * la imagen sin tocar el código. Mismo patrón que los QR de la portada.
 */
function ImageSlot({ src, alt, pendingLabel, className = '', imgClassName = '' }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`${className} border-2 border-dashed border-[#D8C3A5] bg-[#FBF7F2] flex items-center justify-center p-6`}
      >
        <span className="text-[10px] leading-relaxed text-center text-[#A08B70] font-mono uppercase tracking-wider">
          {pendingLabel}
        </span>
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={`${className} ${imgClassName}`} onError={() => setFailed(true)} />
  );
}

// Cada entrada existe en dos idiomas completos en la base (columnas `_en`).
// Si faltara la traducción, se cae al original en vez de mostrar un hueco.
const pick = (entry, field, lang) =>
  (lang === 'en' ? entry[`${field}_en`] : null) || entry[field] || '';

export default function AncestralKnowledge({ lang = 'es', onEnterTab }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromFallback, setFromFallback] = useState(false);
  const [category, setCategory] = useState('all');
  const [role, setRole] = useState('all');
  const [query, setQuery] = useState('');
  const [openSlug, setOpenSlug] = useState(null);

  const isEn = lang === 'en';

  // ---- CARGA ----
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ancestral_knowledge')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setEntries(data);
        setFromFallback(false);
      } else {
        // Tabla creada pero sin filas: mejor el contenido local que una
        // sección vacía.
        setEntries(ANCESTRAL_ENTRIES);
        setFromFallback(true);
      }
    } catch (err) {
      console.warn('ancestral_knowledge no disponible, usando contenido local:', err?.message || err);
      setEntries(ANCESTRAL_ENTRIES);
      setFromFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga única al montar. La regla se silencia aquí a propósito: el estado de
  // carga sí tiene que moverse al entrar, igual que en el foro de comunidad.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // ---- FILTRADO ----
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter(e => {
      if (category !== 'all' && e.category !== category) return false;
      if (role !== 'all' && e.fire_role !== role) return false;
      if (!q) return true;
      const haystack = [
        e.title, e.title_en, e.summary, e.summary_en, e.people, e.people_en,
        e.region, e.ecosystem, e.content, e.content_en, (e.tags || []).join(' ')
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [entries, category, role, query]);

  const hasFilters = category !== 'all' || role !== 'all' || query.trim() !== '';
  const featured = filtered.filter(e => e.featured);
  const rest = filtered.filter(e => !e.featured);

  // Los ecosistemas sí se repiten entre entradas; las regiones no, y contarlas
  // solo devolvía el número de saberes otra vez.
  const ecosystemCount = useMemo(
    () => new Set(entries.map(e => e.ecosystem).filter(Boolean)).size, [entries]
  );

  const openEntry = filtered.find(e => e.slug === openSlug)
    || entries.find(e => e.slug === openSlug)
    || null;

  // Cerrar con Escape y bloquear el scroll de fondo mientras el lector está
  // abierto: si no, la rueda del ratón mueve la lista detrás del panel.
  useEffect(() => {
    if (!openEntry) return;
    const onKey = (ev) => { if (ev.key === 'Escape') setOpenSlug(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openEntry]);

  const clearFilters = () => { setCategory('all'); setRole('all'); setQuery(''); };

  return (
    <div className="bg-[#FBF7F2] min-h-screen text-left">

      {/* ================= PORTADA ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A0E08] via-[#3B1A0B] to-[#7A2E12]" />
        {/* Brasas: puntos cálidos muy tenues, para que el bloque no sea un
            rectángulo plano de color. */}
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, #FFB067 0, transparent 42%), ' +
              'radial-gradient(circle at 78% 68%, #F97316 0, transparent 38%), ' +
              'radial-gradient(circle at 52% 12%, #FDBA74 0, transparent 30%)'
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M32 8c4 8 10 11 10 19a10 10 0 0 1-20 0c0-8 6-11 10-19z' fill='none' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E\")",
            backgroundSize: '64px 64px'
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
              <Flame className="h-4 w-4 text-[#FDBA74]" />
            </div>
            <span className="text-[10px] tracking-[0.25em] text-[#FDBA74] font-bold font-mono uppercase">
              {t('kicker', lang)}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <h1 className="text-4xl md:text-6xl font-serif-editorial text-white leading-[1.05] mb-6">
                {t('title1', lang)}{' '}
                <em className="text-[#FDBA74] font-light">{t('titleEm', lang)}</em>{' '}
                {t('title2', lang)}
              </h1>
              <p className="text-sm md:text-[15px] text-white/70 leading-relaxed font-light max-w-2xl">
                {t('lead', lang)}
              </p>
            </div>

            <div className="lg:col-span-4 flex gap-6 lg:justify-end">
              {[
                { n: entries.length, l: t('statKnowledge', lang), accent: true },
                { n: ecosystemCount, l: t('statEcosystems', lang) },
                { n: Object.keys(ANCESTRAL_CATEGORIES).length, l: t('statThemes', lang) }
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`text-3xl font-bold font-mono ${s.accent ? 'text-[#FDBA74]' : 'text-white'}`}>
                    {s.n}
                  </div>
                  <div className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= EL NOMBRE: KAWSAY ================= */}
      {/* Va justo después de la portada y antes de los filtros: el visitante
          debería saber de dónde viene el nombre antes de recorrer los saberes
          que lo sustentan. */}
      <section className="bg-[#FBF7F2] border-b border-[#EADFD1]">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* Logo */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-[#EADFD1] shadow-sm p-8 flex items-center justify-center">
                <ImageSlot
                  src="/kawsay/logo.png"
                  alt={t('nameLogoAlt', lang)}
                  pendingLabel={t('slotPending', lang)}
                  className="w-full max-w-[260px] aspect-square rounded-2xl"
                  imgClassName="object-contain"
                />
              </div>
            </div>

            {/* Texto */}
            <div className="lg:col-span-8">
              <span className="text-[10px] tracking-[0.25em] text-[#B45309] font-bold font-mono uppercase">
                {t('nameKicker', lang)}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif-editorial text-[#1B4332] mt-4 leading-tight">
                {t('nameTitle', lang)}
              </h2>
              <p className="text-base md:text-lg text-[#7A5C3E] font-serif-editorial italic mt-2 mb-8">
                {t('nameTagline', lang)}
              </p>

              <div className="flex flex-col gap-7">
                {[['nameQ1', 'nameA1'], ['nameQ2', 'nameA2'], ['nameQ3', 'nameA3'], ['nameQ4', 'nameA4']]
                  .map(([q, a]) => (
                    <div key={q} className="border-l-2 border-[#E5D3BC] pl-5">
                      <h3 className="text-sm font-bold text-[#1B4332] uppercase tracking-wide mb-2">
                        {t(q, lang)}
                      </h3>
                      <p className="text-sm md:text-[15px] text-slate-700 leading-relaxed font-light">
                        {t(a, lang)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Foto de la comunidad */}
          {/* La ilustración se muestra completa, no recortada: es una escena
              con figuras y un `object-cover` apaisado les cortaría la cabeza. */}
          <figure className="mt-14">
            <div className="rounded-3xl overflow-hidden bg-[#F6EDE2] border border-[#EADFD1] flex items-center justify-center min-h-[220px]">
              <ImageSlot
                src="/kawsay/comunidad.jpg"
                alt={t('namePhotoAlt', lang)}
                pendingLabel={t('slotPending', lang)}
                className="w-full"
                imgClassName="object-contain max-h-[540px] mx-auto"
              />
            </div>
            <figcaption className="text-xs text-[#8A7358] mt-3 leading-relaxed max-w-3xl">
              {t('namePhotoCaption', lang)}
            </figcaption>
          </figure>

        </div>
      </section>

      {/* ================= FILTROS ================= */}
      {/* La página desplaza la ventana, no un contenedor interno, así que la
          barra debe pararse justo debajo del encabezado fijo. La altura real
          la publica Header en --nte-header-h. */}
      <div
        className="sticky z-30 bg-white/92 backdrop-blur-xl border-b border-[#F0E6DC] shadow-sm"
        style={{ top: 'var(--nte-header-h, 72px)' }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-3">

          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
            {/* Tema */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-[#B08968] shrink-0" />
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                  category === 'all'
                    ? 'bg-[#7A2E12] text-white shadow-sm'
                    : 'bg-[#F5EDE5] text-[#8B5E3C] hover:bg-[#EDE0D3]'
                }`}
              >
                {t('all', lang)}
              </button>
              {Object.entries(ANCESTRAL_CATEGORIES).map(([key, cfg]) => {
                const Icon = CATEGORY_ICONS[key] || Flame;
                const active = category === key;
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(active ? 'all' : key)}
                    title={isEn ? cfg.desc_en : cfg.desc}
                    className="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    style={active
                      ? { backgroundColor: cfg.color, color: '#fff' }
                      : { backgroundColor: cfg.bg, color: cfg.color }}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="hidden sm:inline">{isEn ? cfg.label_en : key}</span>
                  </button>
                );
              })}
            </div>

            {/* Búsqueda */}
            <div className="relative shrink-0 w-full lg:w-64">
              <Search className="h-3.5 w-3.5 text-slate-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPh', lang)}
                className="w-full pl-9 pr-3 py-2 bg-[#FBF7F2] border border-[#F0E6DC] rounded-full text-[11px] focus:outline-none focus:ring-2 focus:ring-[#C2410C]/20 placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Papel del fuego: filtro transversal a los temas */}
          <div className="flex items-center gap-2 flex-wrap border-t border-[#F5EDE5] pt-2.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] font-mono mr-1">
              {t('filterRole', lang)}
            </span>
            <button
              onClick={() => setRole('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                role === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {t('all', lang)}
            </button>
            {Object.entries(FIRE_ROLES).map(([key, cfg]) => {
              const Icon = FIRE_ROLE_ICONS[key];
              const active = role === key;
              const n = entries.filter(e => e.fire_role === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setRole(active ? 'all' : key)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    active ? 'text-white' : 'bg-white hover:bg-slate-50'
                  }`}
                  style={active
                    ? { backgroundColor: cfg.color, borderColor: cfg.color }
                    : { color: cfg.color, borderColor: `${cfg.color}33` }}
                >
                  <Icon className="h-3 w-3" />
                  {isEn ? cfg.en : cfg.es}
                  <span className={active ? 'text-white/60' : 'text-slate-300'}>{n}</span>
                </button>
              );
            })}

            <span className="ml-auto flex items-center gap-3">
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-[#C2410C] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="h-2.5 w-2.5" /> {t('clear', lang)}
                </button>
              )}
              <span className="text-[10px] text-slate-400 font-mono">
                {filtered.length} {filtered.length === 1 ? t('resultsOne', lang) : t('resultsMany', lang)}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {fromFallback && !loading && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/70 px-4 py-3 text-[11px] text-amber-800">
            <Satellite className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <span className="font-light leading-relaxed">{t('fallback', lang)}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#C2410C]/50" />
            <span className="text-xs text-slate-400 font-mono">{t('loading', lang)}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#F5EDE5] flex items-center justify-center">
              <Flame className="h-8 w-8 text-[#C2410C]/30" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">{t('empty', lang)}</h3>
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold text-[#C2410C] hover:underline cursor-pointer"
            >
              {t('clear', lang)}
            </button>
          </div>
        ) : (
          <>
            {/* ---- Destacados ---- */}
            {featured.length > 0 && (
              <section className="mb-12">
                <SectionLabel>{t('featured', lang)}</SectionLabel>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featured.map(e => (
                    <KnowledgeCard key={e.slug} entry={e} lang={lang} large onOpen={setOpenSlug} />
                  ))}
                </div>
              </section>
            )}

            {/* ---- Resto ---- */}
            {rest.length > 0 && (
              <section>
                {featured.length > 0 && <SectionLabel>{t('allEntries', lang)}</SectionLabel>}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {rest.map(e => (
                    <KnowledgeCard key={e.slug} entry={e} lang={lang} onOpen={setOpenSlug} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* ================= LLAMADO ================= */}
        {!loading && (
          <section className="mt-14 rounded-3xl bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] px-8 py-10 md:px-12 text-white overflow-hidden relative">
            <Quote className="absolute -top-2 right-6 h-24 w-24 text-white/5" />
            <div className="relative max-w-2xl">
              <h3 className="text-2xl md:text-3xl font-serif-editorial leading-snug mb-3">
                {t('ctaTitle', lang)}
              </h3>
              <p className="text-sm text-white/70 font-light leading-relaxed mb-6">
                {t('ctaBody', lang)}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onEnterTab?.('comunidad')}
                  className="bg-white text-[#1B4332] hover:bg-[#B7E4C7] px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  {t('ctaBtn', lang)} <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onEnterTab?.('observatorio')}
                  className="border border-white/25 hover:bg-white/10 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
                >
                  {t('ctaObs', lang)} <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* ================= LECTOR ================= */}
      {openEntry && (
        <EntryReader entry={openEntry} lang={lang} onClose={() => setOpenSlug(null)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-[0.2em] font-mono">
        {children}
      </span>
      <span className="flex-1 h-px bg-[#EDE0D3]" />
    </div>
  );
}

function CategoryPill({ category, lang }) {
  const cfg = ANCESTRAL_CATEGORIES[category];
  if (!cfg) return null;
  const Icon = CATEGORY_ICONS[category] || Flame;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <Icon className="h-2.5 w-2.5" />
      {lang === 'en' ? cfg.label_en : category}
    </span>
  );
}

function RolePill({ role, lang, onDark = false }) {
  const cfg = FIRE_ROLES[role];
  if (!cfg) return null;
  const Icon = FIRE_ROLE_ICONS[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold backdrop-blur ${
        onDark ? 'bg-black/40 text-white' : 'bg-white/90'
      }`}
      style={onDark ? undefined : { color: cfg.color }}
    >
      <Icon className="h-2.5 w-2.5" />
      {lang === 'en' ? cfg.en : cfg.es}
    </span>
  );
}

function KnowledgeCard({ entry, lang, large = false, onOpen }) {
  const cfg = ANCESTRAL_CATEGORIES[entry.category] || {};
  return (
    <article
      onClick={() => onOpen(entry.slug)}
      className="group bg-white rounded-3xl border border-[#F0E6DC] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* La imagen puede fallar (red, CDN). El degradado de la categoría queda
          debajo para que la tarjeta nunca muestre un hueco blanco. */}
      <div
        className={`relative w-full overflow-hidden ${large ? 'h-52' : 'h-44'}`}
        style={{ background: `linear-gradient(135deg, ${cfg.color || '#7A2E12'}, ${cfg.color || '#7A2E12'}88)` }}
      >
        {entry.image_url && (
          <img
            src={entry.image_url}
            alt={pick(entry, 'title', lang)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
            onError={(ev) => { ev.currentTarget.style.visibility = 'hidden'; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
        <div className="absolute top-3 left-3">
          <RolePill role={entry.fire_role} lang={lang} onDark />
        </div>
        {entry.region && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[9px] font-bold text-white/90 uppercase tracking-wider">
            <MapPin className="h-2.5 w-2.5" />
            {entry.region}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="mb-3">
          <CategoryPill category={entry.category} lang={lang} />
        </div>

        <h3 className={`font-serif-editorial text-[#1A0E08] leading-snug mb-2.5 ${large ? 'text-xl' : 'text-lg'}`}>
          {pick(entry, 'title', lang)}
        </h3>

        <p className="text-[13px] text-slate-600 leading-relaxed font-light flex-1">
          {pick(entry, 'summary', lang)}
        </p>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#F5EDE5]">
          <span className="text-[10px] text-slate-400 font-medium truncate pr-3">
            {pick(entry, 'people', lang)}
          </span>
          <span
            className="text-[10px] font-bold flex items-center gap-1 shrink-0 group-hover:gap-2 transition-all"
            style={{ color: cfg.color || '#7A2E12' }}
          >
            {t('read', lang)} <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </article>
  );
}

function EntryReader({ entry, lang, onClose }) {
  const cfg = ANCESTRAL_CATEGORIES[entry.category] || {};
  const practices = Array.isArray(entry.practices) ? entry.practices : [];
  const paragraphs = pick(entry, 'content', lang).split('\n').filter(p => p.trim());

  const meta = [
    { icon: Users, label: t('people', lang), value: pick(entry, 'people', lang) },
    { icon: MapPin, label: t('region', lang), value: entry.region },
    { icon: Leaf, label: t('ecosystem', lang), value: pick(entry, 'ecosystem', lang) },
    { icon: CalendarDays, label: t('season', lang), value: pick(entry, 'season', lang) }
  ].filter(m => m.value);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={pick(entry, 'title', lang)}
    >
      <div className="min-h-full flex items-start justify-center p-0 sm:p-6 md:py-10">
        <div
          onClick={(ev) => ev.stopPropagation()}
          className="bg-[#FBF7F2] w-full max-w-3xl sm:rounded-3xl overflow-hidden shadow-2xl nte-slide-in"
        >
          {/* Cabecera con la imagen */}
          <div
            className="relative h-56 md:h-72"
            style={{ background: `linear-gradient(135deg, ${cfg.color || '#7A2E12'}, #1A0E08)` }}
          >
            {entry.image_url && (
              <img
                src={entry.image_url}
                alt={pick(entry, 'title', lang)}
                className="w-full h-full object-cover"
                onError={(ev) => { ev.currentTarget.style.visibility = 'hidden'; }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

            <button
              onClick={onClose}
              aria-label={t('close', lang)}
              className="absolute top-4 right-4 bg-black/45 hover:bg-black/70 text-white p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <CategoryPill category={entry.category} lang={lang} />
                <RolePill role={entry.fire_role} lang={lang} onDark />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif-editorial text-white leading-tight">
                {pick(entry, 'title', lang)}
              </h2>
            </div>
          </div>

          <div className="p-6 md:p-9">
            <p className="text-base md:text-lg text-[#3B1A0B] font-serif-editorial italic leading-relaxed mb-7">
              {pick(entry, 'summary', lang)}
            </p>

            {/* Ficha */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#EDE0D3] rounded-2xl overflow-hidden mb-8">
              {meta.map((m, i) => (
                <div key={i} className="bg-white p-4">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono mb-1.5">
                    <m.icon className="h-3 w-3" />
                    {m.label}
                  </div>
                  <div className="text-[11px] text-[#2D3436] font-medium leading-snug">
                    {m.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Cuerpo */}
            <div className="flex flex-col gap-4 mb-9">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] text-slate-700 leading-[1.75] font-light">
                  {p}
                </p>
              ))}
            </div>

            {/* Prácticas */}
            {practices.length > 0 && (
              <div className="rounded-2xl border border-[#F0E6DC] bg-white p-6 mb-6">
                <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] font-mono mb-4"
                    style={{ color: cfg.color || '#7A2E12' }}>
                  <Flame className="h-3.5 w-3.5" />
                  {t('practices', lang)}
                </h4>
                <ul className="flex flex-col gap-3">
                  {practices.map((p, i) => (
                    <li key={i} className="flex gap-3 text-[13px] text-slate-700 leading-relaxed font-light">
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                        style={{ backgroundColor: cfg.bg || '#F5EDE5', color: cfg.color || '#7A2E12' }}
                      >
                        {i + 1}
                      </span>
                      <span>{lang === 'en' ? (p.en || p.es) : p.es}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Puente con los datos de la plataforma */}
            {pick(entry, 'today', lang) && (
              <div className="rounded-2xl bg-[#1B4332] text-white p-6 mb-6">
                <h4 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] font-mono text-[#B7E4C7] mb-3">
                  <Satellite className="h-3.5 w-3.5" />
                  {t('todayTitle', lang)}
                </h4>
                <p className="text-[13px] text-white/80 leading-relaxed font-light">
                  {pick(entry, 'today', lang)}
                </p>
              </div>
            )}

            {/* Etiquetas */}
            {entry.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-6">
                {entry.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-full bg-[#F5EDE5] text-[#8B5E3C] text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Fuente y crédito de la foto */}
            <div className="border-t border-[#EDE0D3] pt-5 flex flex-col gap-3">
              {entry.source_url && (
                <a
                  href={entry.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-bold text-[#2D6A4F] hover:text-[#1B4332] transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t('source', lang)}: {entry.source_name}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {entry.image_credit && (
                <span className="text-[10px] text-slate-400 font-light">
                  {t('photo', lang)}: {entry.image_credit}
                  {entry.image_license ? ` · ${entry.image_license}` : ''}
                  {entry.image_source_url && (
                    <>
                      {' · '}
                      <a
                        href={entry.image_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-slate-600"
                      >
                        {lang === 'en' ? 'source' : 'fuente'}
                      </a>
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
