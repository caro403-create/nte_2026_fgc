/**
 * Capa pedagógica del Observatorio — componentes.
 *
 * Piezas:
 *   <LearningProvider>  estado compartido: modo aprendizaje, glosario, recorrido
 *   <LearnModeToggle>   interruptor aprendizaje / experto
 *   <CardInfo>          el ⓘ de cada tarjeta: qué muestra / cómo leerlo / ojo con esto
 *   <PlainLine>         la línea llana bajo cada gráfico
 *   <Term> / <RichText> términos con subrayado punteado que abren el glosario
 *   <GlossaryPanel>     el glosario completo
 *   <Tour>              recorrido de cinco pasos en la primera visita
 *
 * El contenido vive en utils/glossary.js. Aquí solo está el comportamiento.
 */
import {
  useContext, useState, useEffect, useRef, useCallback,
  useLayoutEffect, useMemo, Fragment
} from 'react';
import { createPortal } from 'react-dom';
import { Info, X, BookOpen, Search, GraduationCap, ChevronRight, ChevronLeft } from 'lucide-react';
import {
  GLOSSARY, GLOSSARY_BY_ID, GLOSSARY_CATEGORIES, CARD_GUIDES, TOUR_STEPS,
  resolveGuideField, LEARN_MODE_KEY, TOUR_SEEN_KEY
} from '../utils/glossary';
import { LearningContext, useLearning } from '../utils/learningContext';
import { makeT, makeV } from '../utils/dashboardI18n';
import { GLOSSARY_EN, CARD_GUIDES_EN, TOUR_STEPS_EN, GLOSSARY_CATEGORIES_EN } from '../utils/glossaryEn';

/**
 * Contenido pedagógico en el idioma activo. Se resuelve por id contra el
 * cuerpo español, así que un término sin traducir sale en español en lugar de
 * desaparecer — la misma degradación segura que usa el resto del tablero.
 */
const localizedTerm = (entry, lang) =>
  lang === 'en' && GLOSSARY_EN[entry.id] ? { ...entry, ...GLOSSARY_EN[entry.id] } : entry;

const localizedGuide = (id, lang) =>
  (lang === 'en' && CARD_GUIDES_EN[id]) || CARD_GUIDES[id];

const localizedCategory = (cat, lang) =>
  lang === 'en' && GLOSSARY_CATEGORIES_EN[cat.id] ? GLOSSARY_CATEGORIES_EN[cat.id] : cat.label;

const localizedTour = (lang) =>
  lang === 'en'
    ? TOUR_STEPS.map((s, i) => ({ ...s, ...(TOUR_STEPS_EN[i] || {}) }))
    : TOUR_STEPS;

const readBool = (key, fallback) => {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : v === '1';
  } catch { return fallback; }
};
const writeBool = (key, value) => {
  try { window.localStorage.setItem(key, value ? '1' : '0'); } catch { /* modo privado */ }
};

export function LearningProvider({ children, lang = 'es' }) {
  const [learnMode, setLearnModeState] = useState(() => readBool(LEARN_MODE_KEY, true));
  const [glossary, setGlossary] = useState(null); // null | { focusId }
  const [tourRunning, setTourRunning] = useState(false);

  const setLearnMode = useCallback((v) => {
    setLearnModeState(v);
    writeBool(LEARN_MODE_KEY, v);
  }, []);

  const openGlossary = useCallback((focusId = null) => setGlossary({ focusId }), []);
  const closeGlossary = useCallback(() => setGlossary(null), []);
  const startTour = useCallback(() => setTourRunning(true), []);
  const endTour = useCallback(() => {
    setTourRunning(false);
    writeBool(TOUR_SEEN_KEY, true);
    // El recorrido va haciendo scrollIntoView paso a paso y termina a media
    // página. Devolver al inicio deja al usuario frente a los filtros completos
    // en vez de frente a una barra recogida que él no encogió.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Primera visita: espera a que el tablero haya pintado el primer objetivo
  // (los datos tardan en cargar) y solo si el usuario está en modo aprendizaje.
  useEffect(() => {
    if (!learnMode || readBool(TOUR_SEEN_KEY, false)) return;
    let tries = 0;
    const id = setInterval(() => {
      if (document.querySelector(TOUR_STEPS[0].target)) {
        clearInterval(id);
        setTourRunning(true);
      } else if (++tries > 40) {
        clearInterval(id);
      }
    }, 500);
    return () => clearInterval(id);
  }, [learnMode]);

  // El traductor viaja por el contexto para que cualquier pieza suelta de la
  // capa pedagógica (el ⓘ, el glosario, el recorrido) pueda localizarse sin
  // que haya que ir pasándole `lang` a mano por cinco niveles de props.
  const t = useMemo(() => makeT(lang), [lang]);
  const v = useMemo(() => makeV(lang), [lang]);

  const value = useMemo(() => ({
    learnMode, setLearnMode, glossary, openGlossary, closeGlossary,
    tourRunning, startTour, endTour, lang, t, v
  }), [learnMode, setLearnMode, glossary, openGlossary, closeGlossary, tourRunning, startTour, endTour, lang, t, v]);

  return (
    <LearningContext.Provider value={value}>
      {children}
      <GlossaryPanel />
      <Tour />
    </LearningContext.Provider>
  );
}

/* ================= Tarjeta flotante reutilizable ================= */

function Floating({ anchorRef, open, onClose, width = 340, children, dismissOnOutside = true }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      const gap = 8, margin = 10;
      const below = vh - r.bottom - gap - margin;
      const above = r.top - gap - margin;
      const flipUp = below < 220 && above > below;
      const w = Math.min(width, vw - margin * 2);
      let left = r.left + r.width / 2 - w / 2;
      if (left + w > vw - margin) left = vw - margin - w;
      if (left < margin) left = margin;
      setPos({
        left, width: w,
        maxHeight: Math.max(180, Math.round(Math.min(460, flipUp ? above : below))),
        top: flipUp ? undefined : r.bottom + gap,
        bottom: flipUp ? vh - r.top + gap : undefined
      });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, anchorRef, width]);

  useEffect(() => {
    if (!open || !dismissOnOutside) return;
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef, dismissOnOutside]);

  if (!open || !pos) return null;
  return createPortal(
    <div
      ref={panelRef}
      style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight, zIndex: 10020 }}
      className="bg-white border border-slate-200 rounded-lg shadow-lg overflow-y-auto"
    >
      {children}
    </div>,
    document.body
  );
}

/* ================= Términos ================= */

/** Un término del glosario: subrayado punteado, definición al pasar, glosario al hacer clic. */
export function Term({ id, children }) {
  const { learnMode, openGlossary, lang } = useLearning();
  const anchorRef = useRef(null);
  const [hover, setHover] = useState(false);
  const raw = GLOSSARY_BY_ID[id];
  const entry = raw ? localizedTerm(raw, lang) : null;

  // En modo experto el término es texto normal: sin adorno y sin ruido.
  if (!entry || !learnMode) return <>{children ?? entry?.term ?? id}</>;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); setHover(false); openGlossary(id); }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        className="inline text-left underline decoration-dotted decoration-slate-400 underline-offset-[3px] hover:decoration-emerald-700 hover:text-emerald-900 cursor-help"
      >
        {children ?? entry.term}
      </button>
      <Floating anchorRef={anchorRef} open={hover} onClose={() => setHover(false)} width={280} dismissOnOutside={false}>
        <div className="p-3">
          <div className="text-[11px] font-bold text-slate-900 mb-1">{entry.term}</div>
          <p className="text-[11px] text-slate-600 leading-relaxed">{entry.short}</p>
          <div className="text-[10px] text-emerald-800 font-semibold mt-2 flex items-center gap-1">
            Clic para abrir el glosario <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </Floating>
    </>
  );
}

/** Renderiza texto con marcas [[id|etiqueta]] como términos del glosario. */
export function RichText({ text }) {
  const parts = useMemo(() => {
    const out = [];
    const re = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/gi;
    let last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ type: 'text', value: text.slice(last, m.index) });
      out.push({ type: 'term', id: m[1], label: m[2] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: 'text', value: text.slice(last) });
    return out;
  }, [text]);

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'text'
          ? <Fragment key={i}>{p.value}</Fragment>
          : <Term key={i} id={p.id}>{p.label || undefined}</Term>
      )}
    </>
  );
}

/* ================= ⓘ de tarjeta ================= */

const SECTIONS = [
  { key: 'what', label: 'Qué muestra', tone: 'text-slate-900' },
  { key: 'how', label: 'Cómo leerlo', tone: 'text-slate-900' },
  { key: 'watch', label: 'Ojo con esto', tone: 'text-amber-900' }
];

/**
 * El ⓘ de la esquina. Sigue visible en modo experto —es opt-in, no estorba—
 * pero el resto de la capa (líneas llanas, subrayados, recorrido) desaparece.
 */
export function CardInfo({ id, ctx }) {
  const { t, lang } = useLearning();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const guide = localizedGuide(id, lang);
  if (!guide) return null;

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label={`${t('Cómo leer esta tarjeta')}: ${guide.title}`}
        className={`shrink-0 rounded-full transition-colors cursor-pointer ${
          open ? 'text-emerald-800' : 'text-slate-300 hover:text-emerald-800'
        }`}
      >
        <Info className="w-4 h-4" />
      </button>

      <Floating anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} width={360}>
        <div className="sticky top-0 bg-white border-b border-slate-200 px-3.5 py-2.5 flex items-start justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">{t('Cómo leer esta tarjeta')}</div>
            <div className="text-[13px] font-bold text-slate-900 leading-tight">{guide.title}</div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-800 cursor-pointer shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 flex flex-col gap-3">
          {SECTIONS.map(section => {
            const body = resolveGuideField(guide[section.key], ctx);
            if (!body) return null;
            const isWatch = section.key === 'watch';
            return (
              <div key={section.key} className={isWatch ? 'bg-amber-50 border border-amber-200 rounded-md p-2.5' : ''}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isWatch ? 'text-amber-800' : 'text-slate-400'}`}>
                  {t(section.label)}
                </div>
                <p className={`text-[11.5px] leading-relaxed ${isWatch ? 'text-amber-950' : 'text-slate-600'}`}>
                  <RichText text={body} />
                </p>
              </div>
            );
          })}
        </div>
      </Floating>
    </>
  );
}

/** La línea llana bajo el gráfico. Solo en modo aprendizaje. */
export function PlainLine({ id, className = '' }) {
  const { learnMode, t, lang } = useLearning();
  const guide = localizedGuide(id, lang);
  if (!learnMode || !guide?.plain) return null;
  return (
    <p className={`text-[11px] text-slate-500 leading-snug border-t border-slate-100 pt-2 mt-2 ${className}`}>
      <span className="font-semibold text-slate-600">{t('En corto:')} </span>
      {guide.plain}
    </p>
  );
}

/* ================= Interruptor ================= */

export function LearnModeToggle() {
  const { learnMode, setLearnMode, openGlossary, startTour, t } = useLearning();
  return (
    <div className="flex items-center gap-1.5" data-tour="learn">
      <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => setLearnMode(true)}
          className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
            learnMode ? 'bg-emerald-800 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Muestra explicaciones, términos enlazados y notas de lectura"
        >
          <GraduationCap className="w-3 h-3" /> {t('Aprendizaje')}
        </button>
        <button
          type="button"
          onClick={() => setLearnMode(false)}
          className={`px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
            !learnMode ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Oculta toda la capa explicativa; el ⓘ de cada tarjeta se queda"
        >
          {t('Experto')}
        </button>
      </div>
      <button
        type="button"
        onClick={() => openGlossary()}
        className="flex items-center gap-1 border border-slate-300 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 hover:border-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors"
        title="Glosario del vocabulario IDEAM / IAvH"
      >
        <BookOpen className="w-3 h-3" /> {t('Glosario')}
      </button>
      {learnMode && (
        <button
          type="button"
          onClick={startTour}
          className="text-[10px] font-semibold text-slate-400 hover:text-emerald-800 cursor-pointer underline decoration-dotted underline-offset-2"
          title="Repetir el recorrido guiado"
        >
          {t('Ver recorrido')}
        </button>
      )}
    </div>
  );
}

/* ================= Glosario ================= */

const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

// El panel solo se monta cuando está abierto, así el buscador se limpia por
// desmontaje en vez de por un setState dentro de un efecto.
function GlossaryPanel() {
  const ctx = useContext(LearningContext);
  if (!ctx?.glossary) return null;
  return <GlossaryPanelBody ctx={ctx} focusId={ctx.glossary.focusId} />;
}

function GlossaryPanelBody({ ctx, focusId }) {
  const t = ctx.t;
  const [query, setQuery] = useState('');
  const bodyRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') ctx.closeGlossary(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ctx]);

  // Al abrir desde un término, desplaza hasta su definición.
  useEffect(() => {
    if (!focusId) return;
    const t = setTimeout(() => {
      bodyRef.current?.querySelector(`[data-term="${focusId}"]`)
        ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }, 60);
    return () => clearTimeout(t);
  }, [focusId]);

  // La lista se construye sobre el contenido ya localizado, así que buscar
  // «hotspot» en inglés encuentra lo mismo que «foco» en español.
  const entries = useMemo(
    () => GLOSSARY.map(e => localizedTerm(e, ctx.lang)),
    [ctx.lang]
  );

  const groups = useMemo(() => {
    const q = norm(query.trim());
    const match = (e) => !q || norm(e.term).includes(q) || norm(e.short).includes(q) || norm(e.long).includes(q);
    return GLOSSARY_CATEGORIES
      .map(cat => ({
        ...cat,
        label: localizedCategory(cat, ctx.lang),
        items: entries.filter(e => e.category === cat.id && match(e))
      }))
      .filter(g => g.items.length > 0);
  }, [query, entries, ctx.lang]);

  const hits = groups.reduce((n, g) => n + g.items.length, 0);

  const jumpTo = (catId) => {
    bodyRef.current?.querySelector(`[data-cat="${catId}"]`)
      ?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  return createPortal(
    <div className="fixed inset-0 z-[10040] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={ctx.closeGlossary} />

      <aside className="nte-slide-in relative bg-white w-full max-w-[620px] h-full flex flex-col border-l border-slate-200 shadow-2xl">
        {/* Filete de acento: el mismo recurso que abre cada sección del tablero. */}
        <div className="h-[3px] w-full shrink-0" style={{ background: 'linear-gradient(90deg,#2D6A4F,#52B788 45%,#a7f3d0)' }} />

        <header className="px-6 pt-4 pb-3 border-b border-slate-200 shrink-0 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-800 mb-1">
                {t('Vocabulario del archivo')}
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 leading-tight tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" /> {t('Glosario')}
              </h2>
              <p className="text-[12px] text-slate-500 mt-1 max-w-[52ch] leading-relaxed">
                {GLOSSARY.length}{' '}
                {t('términos del archivo del IDEAM y de la clasificación de biomas del IAvH. Las palabras')}{' '}
                <span className="underline decoration-dotted decoration-slate-400 underline-offset-2">
                  {t('subrayadas')}
                </span>{' '}
                {t('dentro de una definición llevan a la suya.')}
              </p>
            </div>
            <button
              type="button"
              onClick={ctx.closeGlossary}
              aria-label={t('Cerrar glosario')}
              className="text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg p-1.5 cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mt-3.5">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('Buscar un término, o una palabra dentro de una definición…')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-20 py-2.5 text-[13px] outline-none
                         focus:border-emerald-700 focus:bg-white focus:ring-2 focus:ring-emerald-700/15 transition-all"
            />
            {query && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{hits}</span>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded p-1 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Índice por categoría: 43 términos son demasiados para encontrar
              algo bajando a ciegas. */}
          {!query && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {GLOSSARY_CATEGORIES.map(cat => {
                const n = GLOSSARY.filter(e => e.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => jumpTo(cat.id)}
                    className="group flex items-center gap-1.5 text-[10.5px] font-bold border border-slate-200 rounded-full pl-2.5 pr-1.5 py-1
                               text-slate-600 hover:border-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    {localizedCategory(cat, ctx.lang)}
                    <span className="bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-900 rounded-full px-1.5 tabular-nums transition-colors">
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </header>

        <div ref={bodyRef} className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-7 bg-[#FBFBF9]">
          {groups.length === 0 && (
            <div className="text-center py-16 flex flex-col items-center gap-2">
              <Search className="w-6 h-6 text-slate-300" />
              <p className="text-[13px] font-semibold text-slate-600">Ningún término coincide con «{query}»</p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer mt-1"
              >
                Ver los {GLOSSARY.length} términos
              </button>
            </div>
          )}

          {groups.map(group => (
            <section key={group.id} data-cat={group.id} className="scroll-mt-3">
              <h3 className="flex items-baseline gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">{group.label}</span>
                <span className="text-[10px] font-bold text-slate-400 tabular-nums">{group.items.length}</span>
                <span className="flex-1 h-px bg-slate-200" />
              </h3>

              <div className="flex flex-col gap-2.5">
                {group.items.map(entry => {
                  const focused = focusId === entry.id;
                  return (
                    <article
                      key={entry.id}
                      data-term={entry.id}
                      className={`group scroll-mt-3 bg-white rounded-lg border p-4 transition-all duration-200 ${
                        focused
                          ? 'border-emerald-600 ring-2 ring-emerald-700/15 shadow-sm'
                          : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                      }`}
                    >
                      <h4 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight">{entry.term}</h4>

                      {/* La definición corta es la respuesta rápida: va destacada,
                          no perdida en cursiva encima del texto largo. */}
                      <p
                        className={`text-[12px] leading-relaxed mt-2 pl-3 border-l-2 ${
                          focused ? 'border-emerald-600 text-emerald-950' : 'border-emerald-600/40 text-slate-700 group-hover:border-emerald-600'
                        } transition-colors`}
                      >
                        {entry.short}
                      </p>

                      <div className="text-[12.5px] text-slate-600 leading-[1.7] mt-3 flex flex-col gap-2.5">
                        {entry.long.split('\n\n').map((para, i) => (
                          <p key={i}><RichText text={para} /></p>
                        ))}
                      </div>

                      {entry.see?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mt-3.5 pt-3 border-t border-slate-100">
                          <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-[0.12em]">{t('Ver también')}</span>
                          {entry.see.filter(s => GLOSSARY_BY_ID[s]).map(s => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => ctx.openGlossary(s)}
                              className="flex items-center gap-1 text-[11px] font-medium border border-slate-200 bg-white rounded-full pl-2.5 pr-2 py-1
                                         text-slate-600 hover:border-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 cursor-pointer transition-colors"
                            >
                              {localizedTerm(GLOSSARY_BY_ID[s], ctx.lang).term}
                              <ChevronRight className="w-3 h-3 opacity-50" />
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>,
    document.body
  );
}

/* ================= Recorrido guiado ================= */

function Tour() {
  const ctx = useContext(LearningContext);
  if (!ctx?.tourRunning) return null;
  return <TourRunner ctx={ctx} />;
}

// Se monta solo mientras el recorrido corre, así el paso arranca en 0 por
// montaje en vez de por un setState dentro de un efecto.
function TourRunner({ ctx }) {
  const t = ctx.t;
  const STEPS = useMemo(() => localizedTour(ctx.lang), [ctx.lang]);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useLayoutEffect(() => {
    const current = STEPS[step];
    if (!current) return;

    let raf = 0;
    const measure = () => {
      const el = document.querySelector(current.target);
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const el = document.querySelector(current.target);
    if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // Deja terminar el desplazamiento antes de medir.
    const t = setTimeout(() => { measure(); raf = requestAnimationFrame(measure); }, 420);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step, STEPS]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') ctx.endTour();
      else if (e.key === 'ArrowRight') setStep(s => Math.min(STEPS.length - 1, s + 1));
      else if (e.key === 'ArrowLeft') setStep(s => Math.max(0, s - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [ctx, STEPS.length]);

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  // Coloca la tarjeta bajo el objetivo, o encima si abajo no cabe.
  const cardW = 380;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  let cardStyle;
  if (rect) {
    const below = vh - (rect.top + rect.height);
    const placeBelow = below > 230;
    let left = rect.left + rect.width / 2 - cardW / 2;
    left = Math.max(12, Math.min(left, vw - cardW - 12));
    cardStyle = placeBelow
      ? { left, top: rect.top + rect.height + 14 }
      : { left, bottom: vh - rect.top + 14 };
  } else {
    cardStyle = { left: Math.max(12, vw / 2 - cardW / 2), top: vh / 2 - 100 };
  }

  return createPortal(
    <div className="fixed inset-0 z-[10050]">
      {rect ? (
        <div
          style={{
            position: 'fixed',
            top: rect.top - 6, left: rect.left - 6,
            width: rect.width + 12, height: rect.height + 12,
            borderRadius: 10,
            boxShadow: '0 0 0 9999px rgba(15,23,42,.62)',
            outline: '2px solid #2D6A4F',
            pointerEvents: 'none',
            transition: 'all .25s ease'
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/60" />
      )}

      <div
        style={{ position: 'fixed', width: cardW, ...cardStyle, zIndex: 10051 }}
        className="bg-white rounded-lg border border-slate-200 shadow-2xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            {t('Paso')} {step + 1} / {STEPS.length}
          </span>
          <button type="button" onClick={ctx.endTour} className="text-slate-400 hover:text-slate-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-sm font-bold text-slate-900 mb-1.5">{current.title}</h3>
        <p className="text-[12px] text-slate-600 leading-relaxed">{current.body}</p>

        <div className="flex items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? 'w-5 bg-emerald-800' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={ctx.endTour} className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer">
              {t('Saltar')}
            </button>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-0.5 border border-slate-300 rounded-md px-2 py-1 text-[11px] font-bold text-slate-600 hover:border-slate-400 cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" /> {t('Atrás')}
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? ctx.endTour() : setStep(s => s + 1))}
              className="flex items-center gap-0.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-md px-3 py-1 text-[11px] font-bold cursor-pointer transition-colors"
            >
              {last ? t('Entendido') : t('Siguiente')}
              {!last && <ChevronRight className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
