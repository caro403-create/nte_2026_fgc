import React, { useEffect, useRef, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  Cell,
  Line, ReferenceLine,
  ComposedChart, Area, ReferenceDot, ReferenceArea
} from 'recharts';
import {
  Loader2, Info, Play, Pause, RotateCcw, AlertTriangle, Search, Check,
  ChevronDown, Sparkles, Radar as RadarIcon, BarChart3, Filter, Database,
  Download, ExternalLink, FileSpreadsheet, BookOpen
} from 'lucide-react';
import {
  LearningProvider, CardInfo, PlainLine, Term, RichText, LearnModeToggle
} from './LearningLayer';
import { TERM_BY_VALUE } from '../utils/glossary';
import { useLearning } from '../utils/learningContext';
import {
  makeT, makeV, MONTHS_EN, MONTHS_FULL_EN, WEEKDAYS_EN, REGION_EN, METHOD_NOTES_EN
} from '../utils/dashboardI18n';

/* ==================================================================
 * COLOR SYSTEM — semantic, no exceptions.
 *
 *   brand green   → marca, navegación, acciones, estado seleccionado
 *   fire ramp     → intensidad de focos, y NADA más
 *   purple        → ecosistemas sensibles
 *   gray          → contexto y "sin dato"
 *   amber         → advertencias metodológicas
 * ================================================================== */
const BRAND = '#2D6A4F';

// amarillo → naranja → rojo → vinotinto. One ordered ramp for fire intensity.
const FIRE_RAMP = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a', '#e31a1c', '#bd0026', '#800026'];
// On a light surface the first three steps wash out, so discrete marks (bars,
// cells) start at index 3 — the lightest step that still clears 2:1 on white.
const FIRE_BARS = FIRE_RAMP.slice(3);

const fireBar = (t) => FIRE_BARS[Math.max(0, Math.min(FIRE_BARS.length - 1, Math.floor(t * FIRE_BARS.length)))];
const fireBarOf = (v, max) => (max > 0 && v > 0 ? fireBar(v / max) : '#e2e8f0');
// Los tres últimos pasos de la rampa son demasiado oscuros para tinta oscura.
const fireInk = (v, max) => (max > 0 && v > 0 && Math.floor((v / max) * FIRE_BARS.length) >= 2 ? '#ffffff' : '#334155');

const GRAY = { line: '#e2e8f0', mark: '#94a3b8', markStrong: '#64748b', ink: '#475569', noData: '#e2e8f0' };
const PURPLE = '#9333ea';
// Sensitive ecosystem types — one hue family, separated by lightness, always
// shipped with a legend so the hue never has to carry the meaning alone.
// Ordered by ecological irreplaceability, brightest first: a glacier or páramo
// fire must not be buried by the far more numerous forest fires around it.
const SENSITIVE_COLOR = { 'Glaciar': '#f3e8ff', 'Páramo': '#d8b4fe', 'Humedal': '#a855f7', 'Bosque': '#7e22ce' };
const SENSITIVE_ORDER = ['Glaciar', 'Páramo', 'Humedal', 'Bosque'];
const SENSITIVE_INK = { 'Glaciar': '#3b0764', 'Páramo': '#3b0764', 'Humedal': '#ffffff', 'Bosque': '#ffffff' };

// Cluster thresholds — published in the map legend, never implicit.
const CLUSTER_STEPS = [
  { max: 20, color: FIRE_RAMP[2], label: '1 – 20 focos' },
  { max: 100, color: FIRE_RAMP[4], label: '21 – 100 focos' },
  { max: Infinity, color: FIRE_RAMP[6], label: 'Más de 100 focos' }
];
const clusterStep = (n) => CLUSTER_STEPS.find(s => n <= s.max);

/* ================= Data vocabulary ================= */
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTH_INITIALS = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTHS_FULL = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];
const MONTH_KEYS = MONTHS.map((_, i) => String(i + 1).padStart(2, '0'));
const YEARS = Array.from({ length: 16 }, (_, i) => 2010 + i);
const Q1 = ['01', '02', '03'];
const Q3 = ['07', '08', '09'];

// Rangos que el propio archivo hace relevantes: la temporada seca de los Llanos
// y las dos temporadas del régimen bimodal andino. Elegir varios meses de un
// clic, sin depender de arrastrar sobre una tira de 24 px por mes.
const MONTH_PRESETS = [
  { label: 'Dic–Mar', title: 'Temporada seca: diciembre a marzo', keys: ['12', '01', '02', '03'] },
  { label: 'Ene–Mar', title: 'Primera temporada seca andina', keys: Q1 },
  { label: 'Jul–Sep', title: 'Segunda temporada seca andina', keys: Q3 },
  { label: 'Bimodal', title: 'Las dos temporadas secas andinas juntas', keys: [...Q1, ...Q3] }
];

// The source file stores every value unaccented ("Calido", "Paramo",
// "Vegetacion"). These dictionaries translate the raw value to its display
// name; the raw value stays the key used for filtering.
const ACCENT_WORDS = {
  'Calido': 'Cálido', 'Frio': 'Frío', 'frio': 'frío',
  'Humedo': 'Húmedo', 'Semihumedo': 'Semihúmedo', 'Superhumedo': 'Superhúmedo',
  'humedo': 'húmedo', 'Semiarido': 'Semiárido', 'Arido': 'Árido',
  'Vegetacion': 'Vegetación', 'Paramo': 'Páramo', 'Rio': 'Río',
  'Lomerio': 'Lomerío', 'Miscelaneo': 'Misceláneo', 'Eolica': 'Eólica',
  'Montaña': 'Montaña', 'Canones': 'Cañones', 'Loes': 'Loess'
};
const prettify = (s) => {
  if (!s) return '—';
  if (s === 'S.I.') return 'Sin información';
  return String(s).split(' ').map(w => ACCENT_WORDS[w] || w).join(' ');
};

const DEPT_LABEL = {
  'AMAZONAS': 'Amazonas', 'ANTIOQUIA': 'Antioquia', 'ARAUCA': 'Arauca', 'ATLANTICO': 'Atlántico',
  'BOGOTA, D.C.': 'Bogotá D.C.', 'BOLIVAR': 'Bolívar', 'BOYACA': 'Boyacá', 'CALDAS': 'Caldas',
  'CAQUETA': 'Caquetá', 'CASANARE': 'Casanare', 'CAUCA': 'Cauca', 'CESAR': 'Cesar', 'CHOCO': 'Chocó',
  'CORDOBA': 'Córdoba', 'CUNDINAMARCA': 'Cundinamarca', 'GUAINIA': 'Guainía', 'GUAVIARE': 'Guaviare',
  'HUILA': 'Huila', 'LA GUAJIRA': 'La Guajira', 'MAGDALENA': 'Magdalena', 'META': 'Meta',
  'NACIÓN': 'Sin departamento asignado', 'NARIÑO': 'Nariño', 'NORTE DE SANTANDER': 'Norte de Santander',
  'PUTUMAYO': 'Putumayo', 'QUINDIO': 'Quindío', 'RISARALDA': 'Risaralda', 'SAN ANDRES': 'San Andrés',
  'SANTANDER': 'Santander', 'SUCRE': 'Sucre', 'TOLIMA': 'Tolima', 'VALLE DEL CAUCA': 'Valle del Cauca',
  'VAUPES': 'Vaupés', 'VICHADA': 'Vichada'
};
const deptLabel = (d) => DEPT_LABEL[d] || d;
// Municipalities have no accent gazetteer in the source, so we only restore
// casing. Flagged in the methodological notes.
const LOWER_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e', 'en', 'el']);
const titleCase = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/(^|[\s(/.,-])([a-záéíóúñ])/g, (_, p, c) => p + c.toUpperCase())
    .split(' ')
    .map((w, i) => (i > 0 && LOWER_WORDS.has(w.toLowerCase()) ? w.toLowerCase() : w))
    .join(' ');
// A few municipality names are also department keys ("BOGOTA, D.C."); reuse the
// accented department spelling there instead of shipping "Bogota, D.C."
const munLabel = (m) => DEPT_LABEL[m] || titleCase(m);

const REGION_BY_DEPT = {
  'ANTIOQUIA': 'Andina', 'BOYACA': 'Andina', 'CALDAS': 'Andina', 'CAUCA': 'Andina',
  'CUNDINAMARCA': 'Andina', 'BOGOTA, D.C.': 'Andina', 'HUILA': 'Andina', 'NARIÑO': 'Andina',
  'NORTE DE SANTANDER': 'Andina', 'QUINDIO': 'Andina', 'RISARALDA': 'Andina',
  'SANTANDER': 'Andina', 'TOLIMA': 'Andina', 'VALLE DEL CAUCA': 'Andina',
  'ARAUCA': 'Orinoquía', 'CASANARE': 'Orinoquía', 'META': 'Orinoquía', 'VICHADA': 'Orinoquía',
  'ATLANTICO': 'Caribe', 'BOLIVAR': 'Caribe', 'CESAR': 'Caribe', 'CORDOBA': 'Caribe',
  'LA GUAJIRA': 'Caribe', 'MAGDALENA': 'Caribe', 'SUCRE': 'Caribe', 'SAN ANDRES': 'Caribe',
  'AMAZONAS': 'Amazonía', 'CAQUETA': 'Amazonía', 'GUAINIA': 'Amazonía',
  'GUAVIARE': 'Amazonía', 'PUTUMAYO': 'Amazonía', 'VAUPES': 'Amazonía',
  'CHOCO': 'Pacífica'
};
const MAIN_REGIONS = new Set(['Andina', 'Orinoquía', 'Caribe', 'Amazonía']);
const REGIONS = ['Andina', 'Orinoquía', 'Caribe', 'Amazonía', 'Otras'];
const regionOf = (dept) => {
  const r = REGION_BY_DEPT[dept];
  return r && MAIN_REGIONS.has(r) ? r : 'Otras';
};

// Ecosistemas de alto valor de conservación: la misma definición operativa que
// usa la capa "sensibles" del mapa, enumerada para poder contarla.
const HIGH_VALUE_ECOS = ['Bosque', 'Bosque Fragmentado', 'Paramo', 'Zona Pantanosa', 'Glaciares y Nivales'];

// Áreas departamentales (DANE, km²) — necesarias para la tasa por 1.000 km².
const DEPT_AREA_KM2 = {
  'AMAZONAS': 109665, 'ANTIOQUIA': 63612, 'ARAUCA': 23818, 'ATLANTICO': 3388,
  'BOGOTA, D.C.': 1775, 'BOLIVAR': 25978, 'BOYACA': 23189, 'CALDAS': 7888,
  'CAQUETA': 88965, 'CASANARE': 44640, 'CAUCA': 29308, 'CESAR': 22905,
  'CHOCO': 46530, 'CORDOBA': 25020, 'CUNDINAMARCA': 24210, 'GUAINIA': 72238,
  'GUAVIARE': 53460, 'HUILA': 19890, 'LA GUAJIRA': 20848, 'MAGDALENA': 23188,
  'META': 85635, 'NARIÑO': 33268, 'NORTE DE SANTANDER': 21658, 'PUTUMAYO': 24885,
  'QUINDIO': 1845, 'RISARALDA': 4140, 'SAN ANDRES': 44, 'SANTANDER': 30537,
  'SUCRE': 10917, 'TOLIMA': 23562, 'VALLE DEL CAUCA': 22140, 'VAUPES': 54135,
  'VICHADA': 100242
};

// El campo `clima` codifica dos dimensiones pegadas: piso térmico + humedad.
const THERMAL_AXIS = ['Calido', 'Templado', 'Frio', 'Muy frio', 'Extremadamente frio', 'Nival'];
const HUMIDITY_AXIS = ['Arido', 'Semiarido', 'Semihumedo', 'Humedo', 'Superhumedo'];

const WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Coordenada de relleno: 133 registros sin coordenada usable fueron volcados al
// centroide geográfico del país. No es un punto caliente; se excluye del
// análisis de recurrencia y se declara aparte.
const PLACEHOLDER_COORD = '4.5709,-74.2973';

const SENSITIVE_RE = /paramo|bosque|humedal|pantano|glaciar/i;
const isSensitiveEco = (name) => SENSITIVE_RE.test(name || '');
const sensitiveTypeOf = (ecos) => {
  const s = ecos || '';
  if (/glaciar|nival/i.test(s)) return 'Glaciar';
  if (/paramo/i.test(s)) return 'Páramo';
  if (/pantano|humedal/i.test(s)) return 'Humedal';
  if (/bosque/i.test(s)) return 'Bosque';
  return null;
};

const THERMAL_FLOORS = ['Calido', 'Templado', 'Frio', 'Muy frio', 'Extremadamente frio', 'Nival'];
const thermalFloorOf = (clima) => THERMAL_FLOORS.find(f => (clima || '').startsWith(f)) || 'Sin información';

const pct = (part, total) => (total > 0 ? (part * 100) / total : 0);
const fmtPct = (v, d = 1) => v.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d }) + '%';
const fmtNum = (v) => (v ?? 0).toLocaleString('es-CO');

/* ================= Primitives ================= */

/** Nombre de gran bioma con su palabra clave enlazada al glosario. */
function BiomaLabel({ name }) {
  const KEY = [
    ['Orobioma Azonal', 'azonal'], ['Orobioma', 'orobioma'], ['Pedobioma', 'pedobioma'],
    ['Helobioma', 'helobioma'], ['Zonobioma Alternohigrico', 'alternohigrico'], ['Zonobioma', 'zonobioma']
  ];
  const hit = KEY.find(([w]) => name.startsWith(w));
  if (!hit) return prettify(name);
  const [word, id] = hit;
  return (
    <>
      <Term id={id}>{word}</Term>
      {prettify(name.slice(word.length))}
    </>
  );
}

function Card({ children, className = '', ...rest }) {
  return <div className={`bg-white border border-slate-200 rounded-lg ${className}`} {...rest}>{children}</div>;
}

/* Acentos de sección. Salen del sistema semántico ya establecido, no de tonos
 * nuevos: ámbar es «advertencia metodológica» y el verde de marca es «acción».
 * Por eso las notas van en ámbar y los datos abiertos en verde. */
const SECTION_ACCENTS = {
  method: { rule: 'linear-gradient(90deg,#b45309,#f59e0b 45%,#fcd34d)', ink: '#b45309' },
  data: { rule: `linear-gradient(90deg,${BRAND},#52B788 45%,#a7f3d0)`, ink: BRAND }
};

/**
 * Una sección, no una tarjeta. Lleva filete de acento, título de jerarquía
 * mayor que los títulos de tarjeta y subtítulo: es el nivel que le dice al ojo
 * dónde empieza una idea y dónde termina otra.
 */
function SectionCard({ accent, eyebrow, title, subtitle, action, id, children }) {
  return (
    <section
      id={id}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,.05)]"
    >
      <div className="h-[3px] w-full" style={{ background: accent.rule }} />
      <div className="p-5 md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 mb-5 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: accent.ink }}>
              {eyebrow}
            </div>
            <h2 className="text-[20px] font-bold text-slate-900 leading-tight tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[12.5px] text-slate-500 mt-1.5 max-w-[68ch] leading-relaxed">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

/** Tiny inline bar sparkline. No library, no axes — shape only. */
function Sparkbars({ values, colorOf, highlight, height = 26, gap = 2 }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[2px]" style={{ height }} aria-hidden="true">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px] min-w-[2px]"
          style={{
            height: `${Math.max(2, (v / max) * height)}px`,
            background: colorOf ? colorOf(v, max, i) : GRAY.mark,
            outline: highlight === i ? `1.5px solid ${BRAND}` : 'none',
            outlineOffset: '1px',
            marginRight: i === values.length - 1 ? 0 : gap - 2
          }}
        />
      ))}
    </div>
  );
}

/**
 * Horizontal ranked bars. Built in HTML so labels never clip or rotate.
 * La fila es un div con rol de botón, no un <button>, porque las etiquetas
 * pueden contener términos del glosario —que sí son botones— y anidar botones
 * es HTML inválido.
 */
function RankBars({ items, max, total, colorOf, selectedSet, onSelect, labelWidth = 150, maxHeight, showRank = true }) {
  const { v } = useLearning();
  // El degradado de abajo solo tiene sentido si de verdad hay más filas fuera
  // de vista; si no, es un adorno que miente sobre que hay más contenido.
  const scrollable = Boolean(maxHeight) && items.length * 27 > maxHeight;

  return (
    <div className="relative">
      <div
        className="flex flex-col gap-px overflow-y-auto pr-1.5 nte-thin-scroll"
        style={maxHeight ? { maxHeight } : undefined}
      >
        {items.map((item, i) => {
          const on = selectedSet?.has(item.value);
          const termId = TERM_BY_VALUE[item.value];
          return (
            <div
              key={item.value}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onClick={() => onSelect?.(item.value)}
              onKeyDown={(e) => {
                if (onSelect && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(item.value); }
              }}
              title={`${v(item.label)} · ${fmtNum(item.count)} (${fmtPct(pct(item.count, total))})`}
              className={`group relative flex items-center gap-2.5 text-left rounded-md pl-2 pr-2 py-[5px] transition-colors ${
                onSelect ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${on ? 'bg-emerald-50' : ''}`}
            >
              {/* Filete de seleccionado: dice «este filtro está puesto» sin
                  depender solo del tinte de fondo. */}
              <span
                className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-full transition-all ${
                  on
                    ? 'bg-emerald-700 opacity-100'
                    : onSelect
                      ? 'bg-slate-300 opacity-0 group-hover:opacity-100'
                      : 'opacity-0'
                }`}
              />

              {showRank && (
                <span
                  className={`text-[9.5px] font-mono tabular-nums w-[17px] text-right shrink-0 transition-colors ${
                    on ? 'font-bold text-emerald-800' : 'text-slate-300 group-hover:text-slate-500'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}

              <span
                className={`text-[11.5px] shrink-0 truncate transition-colors ${
                  on ? 'font-bold text-emerald-900' : 'font-medium text-slate-700 group-hover:text-slate-900'
                }`}
                style={{ width: labelWidth }}
              >
                {termId ? <Term id={termId}>{v(item.label)}</Term> : v(item.label)}
              </span>

              <span className="flex-1 min-w-[36px] h-[14px] bg-slate-100 rounded-full overflow-hidden">
                <span
                  className="block h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.max(1, (item.count / max) * 100)}%`, background: colorOf(item) }}
                />
              </span>

              <span
                className={`text-[11.5px] font-mono tabular-nums font-bold w-[52px] text-right shrink-0 transition-colors ${
                  on ? 'text-emerald-900' : 'text-slate-900'
                }`}
              >
                {fmtNum(item.count)}
              </span>
              <span className="text-[10px] font-mono tabular-nums text-slate-400 w-[42px] text-right shrink-0">
                {fmtPct(pct(item.count, total))}
              </span>
            </div>
          );
        })}
      </div>

      {scrollable && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  );
}

/**
 * Encabezado de tarjeta de gráfico. Un escalón por debajo de <SectionCard>:
 * regla inferior, título y subtítulo, y sitio para una marca corta cuando el
 * dato necesita una salvedad —la explicación completa vive tras el ⓘ, no
 * suelta en una caja que compite con el gráfico.
 */
function ChartHeader({ title, subtitle, caveat, infoId, right, scope }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3.5 pb-3 border-b border-slate-100">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[12px] font-bold text-slate-900 uppercase tracking-[0.1em]">{title}</h3>
          {scope && <ScopeBadge scope={scope} />}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{subtitle}</span>
          {caveat && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.08em] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
              <AlertTriangle className="w-2.5 h-2.5" />
              {caveat}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {right}
        {infoId && <CardInfo id={infoId} />}
      </div>
    </div>
  );
}

/**
 * De dónde salen las cifras de esta tarjeta. Sin esta marca no hay forma de
 * saber si un gráfico responde a los filtros de arriba o se calcula siempre
 * sobre el archivo entero — y las dos cosas conviven en el mismo tablero.
 *
 *   filtered → obedece a los filtros activos
 *   archive  → siempre el archivo completo (2010–2025)
 *   partial  → obedece solo a algunos (hoy: departamento)
 */
const SCOPES = {
  filtered: {
    label: 'Con tus filtros',
    title: 'Estas cifras cambian cuando cambias los filtros de arriba.',
    className: 'text-slate-500 bg-slate-100 border-slate-200'
  },
  archive: {
    label: 'Todo el archivo',
    title: 'Estas cifras se calculan sobre los 14.985 registros completos y no cambian con los filtros.',
    className: 'text-indigo-800 bg-indigo-50 border-indigo-200'
  },
  partial: {
    label: 'Solo filtro de depto.',
    title: 'Estas cifras ignoran año, mes, ecosistema y clima; solo responden al filtro de departamento.',
    className: 'text-indigo-800 bg-indigo-50 border-indigo-200'
  }
};

function ScopeBadge({ scope }) {
  // El traductor llega por el contexto: esta insignia se usa dentro de
  // <ChartHeader> y suelta, y no tiene sentido irle pasando `lang` a mano.
  const { t } = useLearning();
  const s = SCOPES[scope];
  if (!s) return null;
  return (
    <span
      title={t(s.title)}
      className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.08em] border rounded px-1.5 py-0.5 whitespace-nowrap cursor-help ${s.className}`}
    >
      {scope === 'filtered' ? <Filter className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5" />}
      {t(s.label)}
    </span>
  );
}

/** Mini-mapa del conglomerado recurrente: su propia instancia, aislada del mapa principal. */
function ClusterMiniMap({ cluster }) {
  const ref = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const bounds = L.latLngBounds(cluster.points.map(p => [p.lat, p.lng]));
    const map = L.map(ref.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    map.fitBounds(bounds, { padding: [26, 26] });
    L.rectangle(
      [[cluster.box.s, cluster.box.w], [cluster.box.n, cluster.box.e]],
      { color: FIRE_BARS[3], weight: 1, dashArray: '4 3', fill: false }
    ).addTo(map);
    const maxYears = Math.max(...cluster.points.map(p => p.years_count));
    cluster.points.forEach(p => {
      L.circleMarker([p.lat, p.lng], {
        radius: 3 + p.years_count * 1.6,
        fillColor: fireBarOf(p.years_count, maxYears),
        color: '#ffffff', weight: 0.8, fillOpacity: 0.85
      })
        .bindTooltip(`${p.coord}<br>${p.years_count} años · ${p.count} focos`, { className: 'choro-tip' })
        .addTo(map);
    });
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 120);
    return () => { map.remove(); mapRef.current = null; };
  }, [cluster]);

  return <div ref={ref} style={{ height: '100%', width: '100%', position: 'relative', zIndex: 0 }} />;
}

function Popover({ anchorRef, open, onClose, width = 300, children }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;
    const place = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const gap = 6;
      const margin = 10;
      const spaceBelow = vh - r.bottom - gap - margin;
      const spaceAbove = r.top - gap - margin;
      const flipUp = spaceBelow < 200 && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, Math.round(Math.min(420, flipUp ? spaceAbove : spaceBelow)));
      const w = Math.min(width, vw - margin * 2);
      let left = r.left;
      if (left + w > vw - margin) left = vw - margin - w;
      if (left < margin) left = margin;
      setPos({ left, width: w, maxHeight, top: flipUp ? undefined : r.bottom + gap, bottom: flipUp ? vh - r.top + gap : undefined });
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
    if (!open) return;
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
  }, [open, onClose, anchorRef]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      style={{ position: 'fixed', left: pos.left, top: pos.top, bottom: pos.bottom, width: pos.width, maxHeight: pos.maxHeight, zIndex: 10000 }}
      className="bg-white border border-slate-200 rounded-lg shadow-lg flex flex-col overflow-hidden"
    >
      {children}
    </div>,
    document.body
  );
}

const FilterButton = React.forwardRef(function FilterButton({ label, count, open, onClick }, ref) {
  const active = count > 0;
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className={`flex items-center gap-1.5 border rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
        active ? 'bg-emerald-50 border-emerald-600 text-emerald-900' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'
      } ${open ? 'ring-1 ring-emerald-600' : ''}`}
    >
      {label}
      {active && <span className="bg-emerald-800 text-white rounded-full px-1.5 text-[10px] font-mono leading-4">{count}</span>}
      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
  );
});

/* ================= Filter strips ================= */

function YearStrip({ data, range, onChange }) {
  const dragRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const up = () => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      setPreview(null);
      if (drag.moved) onChange([Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)]);
      else if (range && range[0] === drag.a && range[1] === drag.a) onChange(null);
      else onChange([drag.a, drag.a]);
    };
    window.addEventListener('pointerup', up);
    return () => window.removeEventListener('pointerup', up);
  }, [onChange, range]);

  const shown = preview || range;
  const max = Math.max(1, ...data.map(d => d.count));
  const toggle = (year) => {
    if (range && range[0] === year && range[1] === year) onChange(null);
    else onChange([year, year]);
  };

  return (
    <div className="flex items-end gap-[3px] select-none" style={{ touchAction: 'none' }}>
      {data.map(d => {
        const inRange = shown ? d.year >= shown[0] && d.year <= shown[1] : true;
        const none = d.coverage === 'none';
        const h = d.count === 0 ? 2 : Math.max(3, Math.round((d.count / max) * 34));
        // Coverage is a property of data capture, so it is NOT on the fire ramp:
        // solid gray = full capture, hatched = partial, dashed outline = none.
        const background = none
          ? 'transparent'
          : d.coverage === 'dense'
            ? GRAY.markStrong
            : 'repeating-linear-gradient(45deg, #94a3b8 0 3px, #dbe2ea 3px 6px)';
        return (
          <button
            key={d.year}
            type="button"
            disabled={none}
            title={
              none
                ? `${d.year} · sin captura en el archivo`
                : `${d.year} · ${fmtNum(d.count)} registros con los filtros actuales · ${fmtNum(d.archiveCount)} en el archivo (captura ${d.coverage === 'dense' ? 'densa' : 'parcial'})`
            }
            onPointerDown={() => {
              if (none) return;
              dragRef.current = { a: d.year, b: d.year, moved: false };
              setPreview([d.year, d.year]);
            }}
            onPointerEnter={() => {
              const drag = dragRef.current;
              if (!drag) return;
              drag.b = d.year;
              drag.moved = drag.moved || drag.b !== drag.a;
              setPreview([Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)]);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!none) toggle(d.year); }
            }}
            className={`flex flex-col items-center justify-end gap-1 w-[24px] ${none ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            style={{ opacity: inRange ? 1 : 0.28 }}
          >
            <div className="h-[36px] w-full flex items-end justify-center">
              <div
                className="w-full rounded-t-[2px]"
                style={{
                  height: none ? '12px' : `${h}px`,
                  background,
                  border: none ? '1px dashed #cbd5e1' : 'none'
                }}
              />
            </div>
            <div
              className={`text-[9px] font-mono leading-none pb-[2px] w-full border-b-2 ${
                shown && inRange ? 'border-emerald-700 text-emerald-800 font-bold' : 'border-transparent text-slate-400'
              }`}
            >
              {String(d.year).slice(2)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MonthStrip({ data, selected, onChange, animatingMonth, monthNames = MONTHS }) {
  const { t } = useLearning();
  // Las iniciales cambian de idioma: enero es E en español y J en inglés.
  const initials = (t('MONTH_INITIALS') === 'MONTH_INITIALS' ? MONTH_INITIALS.join('') : t('MONTH_INITIALS')).split('');
  const dragRef = useRef(null);
  const stripRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    // El mes bajo el puntero se resuelve por coordenadas, no con pointerenter:
    // al empezar el gesto el navegador captura el puntero en el botón inicial
    // (implícito en táctil y lápiz), así que los pointerenter de los meses
    // vecinos nunca llegaban y el arrastre solo seleccionaba uno.
    const monthAt = (x, y) => {
      const el = document.elementFromPoint(x, y);
      const btn = el?.closest?.('[data-month-idx]');
      if (!btn || !stripRef.current?.contains(btn)) return null;
      return Number(btn.dataset.monthIdx);
    };

    const move = (e) => {
      const drag = dragRef.current;
      if (!drag) return;
      const i = monthAt(e.clientX, e.clientY);
      if (i === null || i === drag.b) return;
      drag.b = i;
      drag.moved = true;
      setPreview([Math.min(drag.a, drag.b), Math.max(drag.a, drag.b)]);
    };

    const up = () => {
      const drag = dragRef.current;
      if (!drag) return;
      dragRef.current = null;
      setPreview(null);
      const next = new Set(selected);
      if (drag.moved) {
        // Un rango siempre suma. Si quitara lo ya elegido, arrastrar por encima
        // de una selección previa la iría apagando a mitad del gesto.
        for (let i = Math.min(drag.a, drag.b); i <= Math.max(drag.a, drag.b); i++) next.add(MONTH_KEYS[i]);
      } else {
        const key = MONTH_KEYS[drag.a];
        if (next.has(key)) next.delete(key); else next.add(key);
      }
      onChange(MONTH_KEYS.filter(k => next.has(k)));
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [onChange, selected]);

  const max = Math.max(1, ...data.map(d => d.count));

  return (
    <div ref={stripRef} className="flex items-center gap-[3px] select-none" style={{ touchAction: 'none' }}>
      {MONTH_KEYS.map((key, i) => {
        const count = data[i]?.count || 0;
        const isSel = selectedSet.has(key);
        const inPreview = preview && i >= preview[0] && i <= preview[1];
        const dim = selected.length > 0 && !isSel && !inPreview;
        const bg = fireBarOf(count, max);
        return (
          <button
            key={key}
            type="button"
            data-month-idx={i}
            aria-pressed={isSel}
            title={`${monthNames[i]} · ${fmtNum(count)}`}
            onPointerDown={(e) => {
              // Soltar la captura implícita: sin esto el gesto queda anclado a
              // este botón y el arrastre no puede cruzar a los meses vecinos.
              if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
              dragRef.current = { a: i, b: i, moved: false };
              setPreview([i, i]);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const next = new Set(selected);
                if (next.has(key)) next.delete(key); else next.add(key);
                onChange(MONTH_KEYS.filter(k => next.has(k)));
              }
            }}
            className={`w-[24px] h-[26px] rounded-[3px] flex items-center justify-center text-[10px] font-bold cursor-pointer transition-all ${
              isSel ? 'ring-2 ring-emerald-700 ring-offset-1' : inPreview ? 'ring-2 ring-emerald-400 ring-offset-1' : ''
            } ${animatingMonth === i + 1 ? 'ring-2 ring-slate-900 ring-offset-1' : ''}`}
            style={{ background: bg, color: fireInk(count, max), opacity: dim ? 0.3 : 1 }}
          >
            {initials[i]}
          </button>
        );
      })}
    </div>
  );
}

/* ================= Dimension filters ================= */

function DeptCombobox({ options, selected, onChange }) {
  const { t } = useLearning();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return options;
    return options.filter(o => norm(deptLabel(o.name)).includes(q) || norm(o.name).includes(q));
  }, [options, query]);

  const toggle = (name) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name); else next.add(name);
    onChange([...next].sort());
  };

  return (
    <>
      <FilterButton ref={anchorRef} label={t('Departamento')} count={selected.length} open={open} onClick={() => setOpen(o => !o)} />
      <Popover anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} width={330}>
        <div className="p-2 border-b border-slate-200 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('Buscar departamento…')}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2 py-1.5 text-xs outline-none focus:border-emerald-700"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 py-1">
          {filtered.length === 0 && <div className="px-3 py-4 text-xs text-slate-400 text-center">{t('Ningún departamento coincide.')}</div>}
          {filtered.map(o => {
            const checked = selectedSet.has(o.name);
            return (
              <button
                key={o.name}
                type="button"
                onClick={() => toggle(o.name)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-50 cursor-pointer ${o.count === 0 && !checked ? 'opacity-45' : ''}`}
              >
                <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${checked ? 'bg-emerald-800 border-emerald-800' : 'border-slate-300'}`}>
                  {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="flex-1 truncate text-slate-700 font-medium">{deptLabel(o.name)}</span>
                <span className="font-mono text-[10px] text-slate-400 tabular-nums">{fmtNum(o.count)}</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[11px] shrink-0">
          <span className="text-slate-500 font-medium">{selected.length} seleccionado(s)</span>
          <button type="button" onClick={() => onChange([])} className="font-bold text-slate-600 hover:text-red-700 cursor-pointer">Limpiar</button>
        </div>
      </Popover>
    </>
  );
}

function GroupedCheckboxFilter({ label, groups, selected, onChange, shortcut, width = 300 }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggle = (name) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name); else next.add(name);
    onChange([...next]);
  };

  return (
    <>
      <FilterButton ref={anchorRef} label={label} count={selected.length} open={open} onClick={() => setOpen(o => !o)} />
      <Popover anchorRef={anchorRef} open={open} onClose={() => setOpen(false)} width={width}>
        {shortcut && (
          <div className="p-2 border-b border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => onChange(shortcut.values)}
              className="w-full flex items-center justify-center gap-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-bold text-[11px] py-1.5 rounded-md cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {shortcut.label}
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1 py-1">
          {groups.map(group => (
            <div key={group.title}>
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-y border-slate-100 flex items-center gap-1.5">
                {group.sensitive && <span className="w-2 h-2 rounded-full" style={{ background: PURPLE }} />}
                {group.title}
              </div>
              {group.items.map(o => {
                const checked = selectedSet.has(o.name);
                return (
                  <button
                    key={o.name}
                    type="button"
                    onClick={() => toggle(o.name)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-slate-50 cursor-pointer ${o.count === 0 && !checked ? 'opacity-45' : ''}`}
                  >
                    <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${checked ? 'bg-emerald-800 border-emerald-800' : 'border-slate-300'}`}>
                      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </span>
                    <span className="flex-1 truncate text-slate-700 font-medium">{prettify(o.name)}</span>
                    <span className="font-mono text-[10px] text-slate-400 tabular-nums">{fmtNum(o.count)}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 px-3 py-2 flex items-center justify-between text-[11px] shrink-0">
          <span className="text-slate-500 font-medium">{selected.length} seleccionado(s)</span>
          <button type="button" onClick={() => onChange([])} className="font-bold text-slate-600 hover:text-red-700 cursor-pointer">Limpiar</button>
        </div>
      </Popover>
    </>
  );
}

/* ================= URL state ================= */
const URL_KEYS = { year: 'fy', months: 'fm', depts: 'fd', ecos: 'fe', climas: 'fc', tab: 'ft' };
// Cada pestaña responde una pregunta distinta, y la pregunta se muestra: cinco
// sustantivos sueltos no le dicen a nadie qué va a encontrar dentro.
const TABS = [
  { id: 'territorio', label: 'Territorio', question: '¿Dónde arde?', desc: 'Ranking de departamentos y municipios, y qué tan concentrado está el fuego en unas pocas unidades.' },
  { id: 'temporal', label: 'Temporal', question: '¿Cuándo arde?', desc: 'Las temporadas secas de cada región natural y cómo se reparte el fuego entre los días de la semana.' },
  { id: 'ecosistemas', label: 'Ecosistemas', question: '¿Sobre qué arde?', desc: 'Perfil ecológico de lo que se quema, grandes biomas y matriz climática de los focos.' },
  { id: 'terreno', label: 'Terreno', question: '¿En qué relieve?', desc: 'Paisaje y formas del terreno donde caen los focos — lo que determina qué tan difícil es llegar a apagarlos.' },
  // El id se queda en 'datos' para no romper las URLs ya compartidas (?ft=datos),
  // pero la pestaña ya no contiene los datos abiertos: esos viven al pie.
  { id: 'datos', label: 'Recurrencia', question: '¿Dónde se repite?', desc: 'Coordenadas que arden en varios años distintos y el conglomerado recurrente al occidente de Bogotá.' }
];

function readUrlState() {
  if (typeof window === 'undefined') return { months: [], depts: [], ecos: [], climas: [], yearRange: null, tab: 'territorio' };
  const p = new URLSearchParams(window.location.search);
  const list = (key) => { const raw = p.get(key); return raw ? raw.split('|').filter(Boolean) : []; };
  let yearRange = null;
  const fy = p.get(URL_KEYS.year);
  if (fy) {
    const [a, b] = fy.split('-').map(Number);
    if (Number.isFinite(a)) yearRange = [a, Number.isFinite(b) ? b : a];
  }
  const tab = p.get(URL_KEYS.tab);
  return {
    yearRange,
    months: list(URL_KEYS.months).filter(m => MONTH_KEYS.includes(m)),
    depts: list(URL_KEYS.depts),
    ecos: list(URL_KEYS.ecos),
    climas: list(URL_KEYS.climas),
    tab: TABS.some(t => t.id === tab) ? tab : 'territorio'
  };
}

function writeUrlState({ yearRange, months, depts, ecos, climas, tab }) {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  Object.values(URL_KEYS).forEach(k => p.delete(k));
  if (yearRange) p.set(URL_KEYS.year, yearRange[0] === yearRange[1] ? `${yearRange[0]}` : `${yearRange[0]}-${yearRange[1]}`);
  if (months.length) p.set(URL_KEYS.months, months.join('|'));
  if (depts.length) p.set(URL_KEYS.depts, depts.join('|'));
  if (ecos.length) p.set(URL_KEYS.ecos, ecos.join('|'));
  if (climas.length) p.set(URL_KEYS.climas, climas.join('|'));
  if (tab && tab !== 'territorio') p.set(URL_KEYS.tab, tab);
  const qs = p.toString();
  window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`);
}

const METHOD_NOTES = [
  {
    title: 'Foco de calor no es incendio.',
    body: 'Un [[foco-de-calor]] es un píxel que el satélite vio más caliente que un umbral. Un [[incendio|incendio de la cobertura vegetal]] es el evento real, con duración y superficie. Un incendio puede generar decenas de focos, y muchos focos no corresponden a ningún incendio sino a quemas agrícolas de manejo.'
  },
  {
    title: 'Unidad de análisis.',
    body: 'Todos los conteos son [[unidad-de-analisis|frecuencia de reporte]], no superficie afectada: el archivo del IDEAM no trae área quemada en ninguna columna.'
  },
  {
    title: 'Resolución espacial.',
    body: 'Las coordenadas vienen redondeadas a ~0,005° (grilla satelital). Cada punto es una [[celda|celda de ~500 m]], no un predio.'
  },
  {
    title: 'Cobertura temporal desigual.',
    body: 'La [[cobertura-temporal|captura no es homogénea]]: 2012–2017, 2019 y 2025 son años densos; 2010, 2018 y 2020–2024 tienen vacíos, y 2011 no tiene ningún registro. Comparar años entre sí sin tener esto en cuenta lleva a conclusiones falsas sobre tendencia.'
  },
  {
    title: 'Regiones naturales.',
    body: 'El archivo no trae columna de [[region-natural|región]]; se asignan por departamento. «Otras» agrupa la Pacífica (Chocó) y los registros sin departamento asignado.'
  },
  {
    title: 'Zonas intervenidas.',
    body: 'Las [[zonas-intervenidas]] se derivan del [[ecosistema-de-sintesis|ecosistema de síntesis]]: [[agroecosistema]], [[vegetacion-secundaria|vegetación secundaria]], territorio artificializado y transicional transformado.'
  },
  {
    title: 'Ecosistemas sensibles.',
    body: 'La categoría de [[ecosistemas-sensibles]] —[[paramo|páramo]], bosque, humedal y glaciar— es una definición operativa de este tablero, no una categoría oficial del IAvH.'
  },
  {
    title: 'Tildes.',
    body: 'El archivo almacena los valores sin tildes («Calido», «Paramo»). El tablero los muestra con su ortografía correcta mediante un diccionario de nombres de despliegue; los municipios solo se normalizan en mayúsculas, por falta de un listado oficial con tildes.'
  }
];

const MAP_HINT_KEY = 'nte-map-hint-seen';

const heatRadiusFor = (zoom) => (zoom <= 5 ? 12 : zoom === 6 ? 15 : zoom === 7 ? 19 : zoom === 8 ? 24 : zoom === 9 ? 30 : 36);
const heatBlurFor = (zoom) => (zoom <= 6 ? 20 : 18);

/* ================================================================== */

export default function ColombiaDashboard({ lang = 'es' }) {
  return (
    <LearningProvider lang={lang}>
      <Dashboard lang={lang} />
    </LearningProvider>
  );
}

function Dashboard({ lang = 'es' }) {
  const { openGlossary, tourRunning } = useLearning();
  // Traductor del tablero. En español es la identidad; en inglés busca la frase
  // y, si aún no está traducida, la devuelve tal cual en vez de romper.
  const t = useMemo(() => makeT(lang), [lang]);
  // Traductor de VALORES del archivo (ejes de clima, ecosistemas, paisaje).
  const v = useMemo(() => makeV(lang), [lang]);
  const METHOD_NOTES_L = lang === 'en' ? METHOD_NOTES_EN : METHOD_NOTES;
  const MONTHS_L = lang === 'en' ? MONTHS_EN : MONTHS;
  const MONTHS_FULL_L = lang === 'en' ? MONTHS_FULL_EN : MONTHS_FULL;
  const WEEKDAYS_L = lang === 'en' ? WEEKDAYS_EN : WEEKDAYS;
  const regionName = useCallback(
    (n) => (lang === 'en' ? (REGION_EN[n] || n) : n),
    [lang]
  );
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const zoomHandlerRef = useRef(null);
  const wheelHandlerRef = useRef(null);
  const lastFitRef = useRef(null);

  const [ideamData, setIdeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialUrlState] = useState(readUrlState);

  const [yearRange, setYearRange] = useState(initialUrlState.yearRange);
  const [months, setMonths] = useState(initialUrlState.months);
  const [depts, setDepts] = useState(initialUrlState.depts);
  const [ecos, setEcos] = useState(initialUrlState.ecos);
  const [climas, setClimas] = useState(initialUrlState.climas);
  const [tab, setTab] = useState(initialUrlState.tab);

  const [mapLayer, setMapLayer] = useState('PUNTOS');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationMonth, setAnimationMonth] = useState(1);
  const animationRef = useRef(null);
  // Las pistas de interacción del mapa no son información: son instrucciones.
  // Se muestran la primera visita y luego solo al pasar el cursor por el mapa.
  const [mapHover, setMapHover] = useState(false);
  const [mapHintPinned, setMapHintPinned] = useState(() => {
    try { return window.localStorage.getItem(MAP_HINT_KEY) !== '1'; } catch { return true; }
  });
  const dismissMapHint = useCallback(() => {
    setMapHintPinned(false);
    try { window.localStorage.setItem(MAP_HINT_KEY, '1'); } catch { /* modo privado */ }
  }, []);
  // 'season' = paneles con escala compartida (comparables entre regiones).
  // El radar se retiró: su propia nota al pie admitía que exagera y que los
  // paneles no eran comparables, que es justo lo que uno quiere hacer aquí.
  const [seasonMode, setSeasonMode] = useState('season');
  const [heatMax, setHeatMax] = useState(0);
  const [deptMetric, setDeptMetric] = useState('count'); // coropleta: 'count' | 'rate'
  const [choroBreaks, setChoroBreaks] = useState([]);
  const geoRef = useRef(null);

  // Al bajar, las barras de encabezado se recogen: la de producto desaparece y
  // la de filtros queda en una sola línea. Solo los filtros merecen quedarse
  // fijos, y solo como resumen — el resto es trabajo antes del primer dato.
  const [condensed, setCondensed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const condensedRef = useRef(false);

  useEffect(() => {
    // Histéresis: sin ella la barra parpadea al quedar justo en el umbral.
    const onScroll = () => {
      const y = window.scrollY;
      const next = condensedRef.current ? y > 120 : y > 200;
      if (next === condensedRef.current) return;
      condensedRef.current = next;
      setCondensed(next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // La gaveta solo la cierra quien la abrió, o Escape. NUNCA el scroll: al
  // filtrar cambia la altura de la página, el navegador ajusta scrollY y eso
  // disparaba un cierre automático justo después de cada clic — dejando elegir
  // un solo mes por apertura y pareciendo que la multiselección no servía.
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setFiltersOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [filtersOpen]);

  // Mientras el recorrido guiado corre, las barras no se recogen. Sus pasos
  // apuntan a la fila de filtros y al interruptor de aprendizaje, y hacen
  // scrollIntoView sobre ellos: ese scroll recogía la barra, la barra sacaba el
  // objetivo del layout con display:none, y el recorrido quedaba apuntando a un
  // elemento de tamaño cero con la página parada a media altura. En ese estado
  // la tira de meses no existe y no hay forma de elegir un mes.
  const barCondensed = condensed && !tourRunning;
  const showFilters = !barCondensed || filtersOpen;

  useEffect(() => {
    fetch('/ideam_data.json')
      .then(res => res.json())
      .then(data => { setIdeamData(data); setLoading(false); })
      .catch(err => { console.error('Error fetching IDEAM data:', err); setLoading(false); });
  }, []);

  useEffect(() => {
    writeUrlState({ yearRange, months, depts, ecos, climas, tab });
  }, [yearRange, months, depts, ecos, climas, tab]);

  const deptSet = useMemo(() => new Set(depts), [depts]);
  const ecoSet = useMemo(() => new Set(ecos), [ecos]);
  const climaSet = useMemo(() => new Set(climas), [climas]);
  const monthSet = useMemo(() => new Set(months), [months]);

  const matches = useCallback((inc, skip) => {
    if (skip !== 'year' && yearRange) {
      const y = parseInt(inc.year, 10);
      if (y < yearRange[0] || y > yearRange[1]) return false;
    }
    if (skip !== 'month' && monthSet.size && !monthSet.has(inc.month)) return false;
    if (skip !== 'dept' && deptSet.size && !deptSet.has(inc.dept)) return false;
    if (skip !== 'eco' && ecoSet.size && !ecoSet.has(inc.ecos)) return false;
    if (skip !== 'clima' && climaSet.size && !climaSet.has(inc.clima)) return false;
    return true;
  }, [yearRange, monthSet, deptSet, ecoSet, climaSet]);

  /* ---- Whole-archive facts (filter-independent) ---- */
  const archive = useMemo(() => {
    if (!ideamData) return null;
    const incidents = ideamData.incidents;
    const yearCounts = {};
    const ecoArchiveCounts = {};
    const deptNames = new Set(), ecoNames = new Set(), climaNames = new Set();
    const byRegion = {}, q1ByRegion = {}, q3ByRegion = {};
    const monthByRegion = MONTH_KEYS.map(() => ({}));
    let q1Total = 0, q3Total = 0, lastDate = '';

    incidents.forEach(inc => {
      yearCounts[inc.year] = (yearCounts[inc.year] || 0) + 1;
      deptNames.add(inc.dept);
      if (inc.ecos) {
        ecoNames.add(inc.ecos);
        ecoArchiveCounts[inc.ecos] = (ecoArchiveCounts[inc.ecos] || 0) + 1;
      }
      if (inc.clima) climaNames.add(inc.clima);
      if (inc.fecha > lastDate) lastDate = inc.fecha;
      const r = regionOf(inc.dept);
      byRegion[r] = (byRegion[r] || 0) + 1;
      const mi = parseInt(inc.month, 10) - 1;
      if (mi >= 0 && mi < 12) monthByRegion[mi][r] = (monthByRegion[mi][r] || 0) + 1;
      if (Q1.includes(inc.month)) { q1ByRegion[r] = (q1ByRegion[r] || 0) + 1; q1Total++; }
      if (Q3.includes(inc.month)) { q3ByRegion[r] = (q3ByRegion[r] || 0) + 1; q3Total++; }
    });

    const total = incidents.length;
    const regionRows = REGIONS
      .map(name => ({
        name,
        n: byRegion[name] || 0,
        q1Share: pct(q1ByRegion[name] || 0, byRegion[name] || 0),
        q3Share: pct(q3ByRegion[name] || 0, byRegion[name] || 0),
        ofQ1: pct(q1ByRegion[name] || 0, q1Total),
        ofQ3: pct(q3ByRegion[name] || 0, q3Total)
      }))
      .filter(r => r.n > 0)
      .sort((a, b) => b.n - a.n);

    // Each region's monthly profile as % of its own annual total. Each small
    // multiple is scaled to its own peak month: the question these charts answer
    // is WHEN each region burns, and a shared domain shrinks the Andean shape —
    // the one that carries the finding — to an unreadable speck. The peak value
    // is printed under every chart so the scaling is never hidden.
    const regionProfiles = regionRows.map(r => {
      const data = MONTH_KEYS.map((_, i) => ({
        month: MONTHS[i],
        key: MONTH_KEYS[i],
        count: monthByRegion[i][r.name] || 0,
        share: pct(monthByRegion[i][r.name] || 0, r.n)
      }));
      const peak = data.reduce((a, b) => (b.share > a.share ? b : a), data[0]);
      return { ...r, data, peak, domain: Math.max(5, Math.ceil(peak.share / 5) * 5) };
    });

    return {
      total,
      lastDate,
      yearCounts,
      ecoArchiveCounts,
      deptNames: [...deptNames].sort((a, b) => deptLabel(a).localeCompare(deptLabel(b), 'es')),
      ecoNames: [...ecoNames].sort(),
      climaNames: [...climaNames].sort(),
      regionRows,
      regionProfiles,
      q1Pct: pct(q1Total, total),
      q3Pct: pct(q3Total, total),
      bimodalPct: pct(q1Total + q3Total, total)
    };
  }, [ideamData]);

  /* ---- Cascading option counts ---- */
  const cascade = useMemo(() => {
    if (!ideamData || !archive) return null;
    const yearCounts = {}, monthCounts = {}, deptCounts = {}, ecoCounts = {}, climaCounts = {};
    ideamData.incidents.forEach(inc => {
      if (matches(inc, 'year')) yearCounts[inc.year] = (yearCounts[inc.year] || 0) + 1;
      if (matches(inc, 'month')) monthCounts[inc.month] = (monthCounts[inc.month] || 0) + 1;
      if (matches(inc, 'dept')) deptCounts[inc.dept] = (deptCounts[inc.dept] || 0) + 1;
      if (matches(inc, 'eco')) ecoCounts[inc.ecos] = (ecoCounts[inc.ecos] || 0) + 1;
      if (matches(inc, 'clima')) climaCounts[inc.clima] = (climaCounts[inc.clima] || 0) + 1;
    });
    return {
      years: YEARS.map(y => {
        const archiveCount = archive.yearCounts[String(y)] || 0;
        return {
          year: y,
          count: yearCounts[String(y)] || 0,
          archiveCount,
          coverage: archiveCount === 0 ? 'none' : archiveCount >= 500 ? 'dense' : 'partial'
        };
      }),
      months: MONTH_KEYS.map(k => ({ key: k, count: monthCounts[k] || 0 })),
      depts: archive.deptNames.map(name => ({ name, count: deptCounts[name] || 0 })),
      ecos: archive.ecoNames.map(name => ({ name, count: ecoCounts[name] || 0 })),
      climas: archive.climaNames.map(name => ({ name, count: climaCounts[name] || 0 }))
    };
  }, [ideamData, archive, matches]);

  const filteredIncidents = useMemo(() => {
    if (!ideamData) return [];
    return ideamData.incidents.filter(inc => {
      if (!matches(inc)) return false;
      if (isAnimating && parseInt(inc.month, 10) !== animationMonth) return false;
      return true;
    });
  }, [ideamData, matches, isAnimating, animationMonth]);

  const resetFilters = useCallback(() => {
    setYearRange(null); setMonths([]); setDepts([]); setEcos([]); setClimas([]); setIsAnimating(false);
  }, []);

  const toggleDept = useCallback((name) => {
    setDepts(prev => (prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name].sort()));
  }, []);
  const toggleEco = useCallback((name) => {
    setEcos(prev => (prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]));
  }, []);
  const toggleClima = useCallback((name) => {
    setClimas(prev => (prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]));
  }, []);
  const toggleMonth = useCallback((key) => {
    setMonths(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return MONTH_KEYS.filter(k => next.has(k));
    });
  }, []);

  const ecoGroups = useMemo(() => {
    if (!cascade) return [];
    const sensitive = [], otherNatural = [], intervened = [];
    const intervenedNames = new Set((ideamData?.incidents || []).filter(i => i.is_intervened).map(i => i.ecos));
    cascade.ecos.forEach(o => {
      if (isSensitiveEco(o.name)) sensitive.push(o);
      else if (intervenedNames.has(o.name)) intervened.push(o);
      else otherNatural.push(o);
    });
    return [
      { title: 'Sensibles (páramo, bosque, humedal, glaciar)', items: sensitive, sensitive: true },
      { title: 'Otros ecosistemas naturales', items: otherNatural },
      { title: 'Intervenidos / transformados', items: intervened }
    ].filter(g => g.items.length > 0);
  }, [cascade, ideamData]);

  const intervenedNameSet = useMemo(
    () => new Set((ideamData?.incidents || []).filter(i => i.is_intervened).map(i => i.ecos)),
    [ideamData]
  );

  const sensitiveEcoNames = useMemo(
    () => (cascade ? cascade.ecos.filter(o => isSensitiveEco(o.name)).map(o => o.name) : []),
    [cascade]
  );

  const climaGroups = useMemo(() => {
    if (!cascade) return [];
    const byFloor = {};
    cascade.climas.forEach(o => { const f = thermalFloorOf(o.name); (byFloor[f] = byFloor[f] || []).push(o); });
    return [...THERMAL_FLOORS, 'Sin información']
      .filter(f => byFloor[f])
      .map(f => ({ title: `Piso térmico: ${prettify(f)}`, items: byFloor[f] }));
  }, [cascade]);

  /* ---- Analytics over the current slice ---- */
  const analytics = useMemo(() => {
    if (filteredIncidents.length === 0) return null;
    const deptCounts = {}, munCounts = {}, monthCounts = {}, ecoCounts = {}, climaCounts = {};
    const paisajeCounts = {}, relieveCounts = {}, biomaCounts = {}, paramoByDept = {};
    const climaMatrix = {}, dowCounts = new Array(7).fill(0);
    let intervenedCount = 0, mountainCount = 0, highValueCount = 0, climaUnclassified = 0;

    filteredIncidents.forEach(inc => {
      deptCounts[inc.dept] = (deptCounts[inc.dept] || 0) + 1;
      munCounts[`${inc.mun}|${inc.dept}`] = (munCounts[`${inc.mun}|${inc.dept}`] || 0) + 1;
      monthCounts[inc.month] = (monthCounts[inc.month] || 0) + 1;
      ecoCounts[inc.ecos] = (ecoCounts[inc.ecos] || 0) + 1;
      climaCounts[inc.clima] = (climaCounts[inc.clima] || 0) + 1;
      if (inc.is_intervened) intervenedCount++;
      if (/montaña/i.test(inc.paisaje)) mountainCount++;
      if (HIGH_VALUE_ECOS.includes(inc.ecos)) highValueCount++;
      if (inc.ecos === 'Paramo') paramoByDept[inc.dept] = (paramoByDept[inc.dept] || 0) + 1;

      paisajeCounts[inc.paisaje] = (paisajeCounts[inc.paisaje] || 0) + 1;
      relieveCounts[inc.relieve] = (relieveCounts[inc.relieve] || 0) + 1;
      biomaCounts[inc.gran_bioma] = (biomaCounts[inc.gran_bioma] || 0) + 1;

      // El clima viene como "<piso térmico> <régimen de humedad>": lo separamos.
      const floor = THERMAL_AXIS.find(f => (inc.clima || '').startsWith(f));
      const hum = HUMIDITY_AXIS.find(h => (inc.clima || '').endsWith(h));
      if (floor && hum) climaMatrix[`${floor}|${hum}`] = (climaMatrix[`${floor}|${hum}`] || 0) + 1;
      else climaUnclassified++;

      const [yy, mm, dd] = inc.fecha.split('-').map(Number);
      if (yy) {
        // getUTCDay: 0 = domingo → índice con lunes primero.
        const js = new Date(Date.UTC(yy, mm - 1, dd)).getUTCDay();
        dowCounts[(js + 6) % 7]++;
      }
    });

    // Concentración territorial: cuántas unidades acumulan el 80% de los focos.
    const paretoOf = (counts) => {
      const vals = Object.values(counts).sort((a, b) => b - a);
      const grand = vals.reduce((a, b) => a + b, 0);
      let acc = 0, n = 0;
      const curve = [];
      vals.forEach((v, i) => {
        acc += v;
        if (acc <= 0.8 * grand || n === 0) n = i + 1;
        if (i % Math.max(1, Math.floor(vals.length / 60)) === 0 || i === vals.length - 1) {
          curve.push({ units: i + 1, unitPct: pct(i + 1, vals.length), cumPct: pct(acc, grand) });
        }
      });
      return { n, ofTotal: vals.length, curve, grand };
    };

    const monthSeries = MONTH_KEYS.map(k => monthCounts[k] || 0);
    const peakIdx = monthSeries.indexOf(Math.max(...monthSeries));
    const total = filteredIncidents.length;

    const rankDepts = Object.entries(deptCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: deptLabel(value), count }));

    const rankMuns = Object.entries(munCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([key, count]) => {
        const [mun, dept] = key.split('|');
        return { value: key, label: `${munLabel(mun)} · ${deptLabel(dept)}`, count };
      });

    const ecoChart = Object.entries(ecoCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: prettify(value), count }));

    const climaChart = Object.entries(climaCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value, label: prettify(value), count }));

    const topEco = Object.entries(ecoCounts).sort((a, b) => b[1] - a[1])[0] || ['—', 0];
    const deptSorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]);
    const top5DeptShare = pct(deptSorted.slice(0, 5).reduce((a, e) => a + e[1], 0), total);

    return {
      total,
      deptCount: Object.keys(deptCounts).length,
      munCount: Object.keys(munCounts).length,
      monthSeries,
      topEco: { name: topEco[0], count: topEco[1], pct: pct(topEco[1], total) },
      highValueCount,
      highValuePct: pct(highValueCount, total),
      highValueBreakdown: HIGH_VALUE_ECOS
        .map(name => ({ name, count: ecoCounts[name] || 0 }))
        .filter(e => e.count > 0)
        .sort((a, b) => b.count - a.count),
      paramoCount: ecoCounts['Paramo'] || 0,
      paramoPct: pct(ecoCounts['Paramo'] || 0, total),
      paramoTopDepts: Object.entries(paramoByDept)
        .sort((a, b) => b[1] - a[1]).slice(0, 4)
        .map(([value, count]) => ({ value, label: deptLabel(value), count })),
      paisajeChart: Object.entries(paisajeCounts).sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({ value, label: prettify(value), count })),
      relieveChart: Object.entries(relieveCounts).sort((a, b) => b[1] - a[1]).slice(0, 14)
        .map(([value, count]) => ({ value, label: prettify(value), count })),
      biomaChart: Object.entries(biomaCounts).sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count, pct: pct(count, total) })),
      climaMatrix,
      climaMatrixMax: Math.max(0, ...Object.values(climaMatrix)),
      climaUnclassified,
      dowCounts,
      dowPct: dowCounts.map(v => pct(v, total)),
      deptPareto: paretoOf(deptCounts),
      munPareto: paretoOf(munCounts),
      top5DeptShare,
      top5Depts: deptSorted.slice(0, 5).map(([value, count]) => ({ value, label: deptLabel(value), count })),
      deptRate: deptSorted
        .filter(([v]) => DEPT_AREA_KM2[v])
        .map(([value, count]) => ({ value, label: deptLabel(value), count, rate: (count / DEPT_AREA_KM2[value]) * 1000 }))
        .sort((a, b) => b.rate - a.rate),
      peakIdx,
      peakMonth: MONTHS[peakIdx],
      peakCount: monthSeries[peakIdx],
      intervenedPct: Math.round((intervenedCount / total) * 100),
      mountainPct: Math.round((mountainCount / total) * 100),
      rankDepts,
      rankMuns,
      ecoChart,
      climaChart
    };
  }, [filteredIncidents]);

  // Conglomerado de coordenadas recurrentes al occidente de Bogotá. Se define
  // por CAJA GEOGRÁFICA, no por nombre de municipio: el campo de municipio del
  // archivo no es fiable a nivel de registro.
  // Total de coordenadas recurrentes, sin la coordenada de relleno.
  const recurrenceTotal = useMemo(
    () => (ideamData?.recurrence || []).filter(r => r.coord !== PLACEHOLDER_COORD && r.years_count >= 2).length,
    [ideamData]
  );

  const cluster = useMemo(() => {
    if (!ideamData?.recurrence) return null;
    const BOX = { s: 4.70, n: 4.90, w: -74.20, e: -74.00 };
    const pts = ideamData.recurrence.filter(
      r => r.coord !== PLACEHOLDER_COORD &&
           r.lat >= BOX.s && r.lat <= BOX.n && r.lng >= BOX.w && r.lng <= BOX.e && r.years_count >= 2
    );
    if (pts.length === 0) return null;
    const ranked = [...ideamData.recurrence]
      .filter(r => r.coord !== PLACEHOLDER_COORD && r.years_count >= 2)
      .sort((a, b) => b.years_count - a.years_count || b.count - a.count);
    const top9 = ranked.slice(0, 9);
    const inTop9 = top9.filter(r => r.lat >= BOX.s && r.lat <= BOX.n && r.lng >= BOX.w && r.lng <= BOX.e);
    return {
      box: BOX,
      points: pts.sort((a, b) => b.years_count - a.years_count || b.count - a.count),
      focos: pts.reduce((a, r) => a + r.count, 0),
      inTop9: inTop9.length,
      topOf: top9.length,
      munNames: [...new Set(inTop9.map(r => titleCase(r.mun)))]
    };
  }, [ideamData]);

  // Valor por departamento para la coropleta, en la métrica activa.
  const choroValues = useMemo(() => {
    if (!analytics) return {};
    const src = deptMetric === 'rate' ? analytics.deptRate : analytics.rankDepts;
    const out = {};
    src.forEach(d => {
      if (deptMetric === 'rate') out[d.value] = d.rate;
      else if (DEPT_AREA_KM2[d.value]) out[d.value] = d.count;
    });
    return out;
  }, [analytics, deptMetric]);

  const recurrenceData = useMemo(() => {
    if (!ideamData?.recurrence) return [];
    return ideamData.recurrence
      .filter(item => item.coord !== PLACEHOLDER_COORD)
      .filter(item => (deptSet.size ? deptSet.has(item.dept) : true) && item.years_count >= 2)
      .slice(0, 12);
  }, [ideamData, deptSet]);

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = setInterval(() => setAnimationMonth(prev => (prev >= 12 ? 1 : prev + 1)), 1200);
    } else if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    return () => { if (animationRef.current) clearInterval(animationRef.current); };
  }, [isAnimating]);

  // Tear the map down on unmount — Leaflet keeps DOM and listeners otherwise.
  useEffect(() => () => {
    const map = mapRef.current;
    if (!map) return;
    if (wheelHandlerRef.current) map.getContainer().removeEventListener('wheel', wheelHandlerRef.current);
    map.remove();
    mapRef.current = null;
    layerGroupRef.current = null;
  }, []);

  /* ---- Map ---- */
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // This effect awaits a dynamic import before touching the map, so two runs
    // can overlap: a slow "points" run could finish AFTER a "heatmap" run and
    // re-add its cluster layer on top. Each run owns exactly one layer and the
    // cleanup both cancels it and removes what it added.
    let cancelled = false;
    let created = null;

    const initMap = async () => {
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [4.5709, -74.2973],
          zoom: 5, minZoom: 5, maxZoom: 16,
          maxBounds: L.latLngBounds(L.latLng(-4.5, -82.0), L.latLng(13.5, -66.0)),
          maxBoundsViscosity: 0.9,
          zoomControl: false,
          // The map sits inside a scrolling page: with wheel zoom on, scrolling
          // past it hijacks the gesture and silently re-zooms the map. Zoom is
          // opt-in via Ctrl/⌘ + wheel, the +/− control, or double click.
          scrollWheelZoom: false
        });
        L.control.zoom({ position: 'bottomright' }).addTo(map);
        mapRef.current = map;

        const onWheel = (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (!map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable();
          } else if (map.scrollWheelZoom.enabled()) {
            map.scrollWheelZoom.disable();
          }
        };
        map.getContainer().addEventListener('wheel', onWheel, { passive: false });
        wheelHandlerRef.current = onWheel;
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap & CARTO', maxZoom: 19, subdomains: 'abcd'
        }).addTo(map);
        setTimeout(() => map.invalidateSize(), 100);
      }

      const map = mapRef.current;
      if (!window.L) window.L = L;

      if (zoomHandlerRef.current) { map.off('zoomend', zoomHandlerRef.current); zoomHandlerRef.current = null; }
      if (layerGroupRef.current && map.hasLayer(layerGroupRef.current)) map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
      if (cancelled || filteredIncidents.length === 0) { setHeatMax(0); return; }

      let layer;

      if (mapLayer === 'COROPLETA') {
        if (!geoRef.current) {
          const res = await fetch('/co_departamentos.geojson');
          const gj = await res.json();
          if (cancelled) return;
          geoRef.current = gj;
        }
        setHeatMax(0);

        // Cortes por cuantiles sobre los departamentos con dato: con 33 unidades
        // y una distribución muy sesgada, los cortes iguales dejarían casi todo
        // en la clase más baja.
        const vals = Object.values(choroValues).filter(v => v > 0).sort((a, b) => a - b);
        const breaks = FIRE_BARS.map((_, i) => vals[Math.floor(((i + 1) / FIRE_BARS.length) * (vals.length - 1))] || 0);
        setChoroBreaks(breaks);
        const colorFor = (v) => {
          if (!v) return '#334155';
          const idx = breaks.findIndex(b => v <= b);
          return FIRE_BARS[idx === -1 ? FIRE_BARS.length - 1 : idx];
        };

        layer = L.geoJSON(geoRef.current, {
          style: (f) => {
            const v = choroValues[f.properties.dept];
            return {
              fillColor: colorFor(v), fillOpacity: v ? 0.82 : 0.25,
              color: '#0f172a', weight: 1, opacity: 0.9
            };
          },
          onEachFeature: (f, lyr) => {
            const dept = f.properties.dept;
            const count = analytics?.rankDepts.find(d => d.value === dept)?.count || 0;
            const area = DEPT_AREA_KM2[dept];
            const rate = area ? (count / area) * 1000 : 0;
            lyr.bindTooltip(
              `<strong>${deptLabel(dept)}</strong><br>${fmtNum(count)} focos<br>` +
              `${rate.toLocaleString('es-CO', { maximumFractionDigits: 1 })} por 1.000 km²<br>` +
              `<span style="opacity:.6">${fmtNum(area)} km²</span>`,
              { sticky: true, className: 'choro-tip' }
            );
            lyr.on('click', () => toggleDept(dept));
            lyr.on('mouseover', () => lyr.setStyle({ weight: 2.5, color: '#ffffff' }));
            lyr.on('mouseout', () => lyr.setStyle({ weight: 1, color: '#0f172a' }));
          }
        });
        map.addLayer(layer);
      } else if (mapLayer === 'HEATMAP') {
        await import('leaflet.heat');
        if (cancelled) return;
        // Aggregate to a ~0.05° grid and normalise against the real cell
        // maximum. Feeding raw points at intensity 1 is what saturated the
        // whole country into one red blob.
        const CELL = 0.05;
        const grid = new Map();
        filteredIncidents.forEach(inc => {
          const key = `${Math.round(inc.lat / CELL)}|${Math.round(inc.lng / CELL)}`;
          const g = grid.get(key);
          if (g) { g.n++; g.lat += inc.lat; g.lng += inc.lng; }
          else grid.set(key, { n: 1, lat: inc.lat, lng: inc.lng });
        });
        const cells = [...grid.values()];
        const maxCell = Math.max(...cells.map(c => c.n));
        setHeatMax(maxCell);

        // Cell counts are heavily long-tailed (one Bogotá cell holds ~250 while
        // the median cell holds 1). Normalising linearly against that maximum
        // flattens the whole country into one tone, so intensity runs on a
        // square-root scale — noted in the legend.
        const points = cells.map(c => [c.lat / c.n, c.lng / c.n, Math.sqrt(c.n)]);
        const zoom = map.getZoom();
        layer = L.heatLayer(points, {
          max: Math.sqrt(maxCell),
          radius: heatRadiusFor(zoom),
          blur: heatBlurFor(zoom),
          minOpacity: 0.25,
          maxZoom: 12,
          gradient: { 0.05: FIRE_RAMP[0], 0.2: FIRE_RAMP[1], 0.4: FIRE_RAMP[2], 0.6: FIRE_RAMP[3], 0.78: FIRE_RAMP[4], 0.9: FIRE_RAMP[5], 1.0: FIRE_RAMP[6] }
        });
        map.addLayer(layer);

        // Radius must track zoom or the blob stops meaning anything.
        const onZoom = () => {
          const z = map.getZoom();
          layer.setOptions({ radius: heatRadiusFor(z), blur: heatBlurFor(z) });
        };
        map.on('zoomend', onZoom);
        zoomHandlerRef.current = onZoom;
      } else {
        await import('leaflet.markercluster');
        if (cancelled) return;
        const sensitiveMode = mapLayer === 'SENSIBLES';
        setHeatMax(0);

        layer = L.markerClusterGroup({
          chunkedLoading: true,
          maxClusterRadius: 40,
          iconCreateFunction: (cluster) => {
            const count = cluster.getChildCount();
            if (sensitiveMode) {
              // Here the question is "which sensitive ecosystem is burning", so
              // the cluster hue encodes ecosystem type, not the count. Taking the
              // *most numerous* type would paint everything "Bosque" — forest
              // fires outnumber the rest ten to one — so the cluster takes the
              // most irreplaceable type present instead.
              const present = new Set();
              cluster.getAllChildMarkers().forEach(m => { if (m.options.sensType) present.add(m.options.sensType); });
              const top = SENSITIVE_ORDER.find(t => present.has(t)) || 'Bosque';
              const size = count > 100 ? 42 : count > 20 ? 36 : 30;
              return L.divIcon({
                html: `<div style="width:${size}px;height:${size}px;background:${SENSITIVE_COLOR[top]};color:${SENSITIVE_INK[top]};border:2px solid rgba(255,255,255,.85)" class="rounded-full font-black flex items-center justify-center font-mono text-[11px]">${count}</div>`,
                className: 'custom-cluster-icon',
                iconSize: L.point(size, size)
              });
            }
            const step = clusterStep(count);
            const size = count > 100 ? 42 : count > 20 ? 36 : 30;
            return L.divIcon({
              html: `<div style="width:${size}px;height:${size}px;background:${step.color};color:${count > 100 ? '#fff' : '#451a03'};border:2px solid rgba(255,255,255,.85)" class="rounded-full font-black flex items-center justify-center font-mono text-[11px]">${count}</div>`,
              className: 'custom-cluster-icon',
              iconSize: L.point(size, size)
            });
          }
        });

        const markers = [];
        filteredIncidents.forEach(inc => {
          const sensType = sensitiveTypeOf(inc.ecos);
          if (sensitiveMode && !sensType) return;

          const marker = L.circleMarker([inc.lat, inc.lng], {
            radius: 5,
            fillColor: sensitiveMode ? SENSITIVE_COLOR[sensType] : sensType ? PURPLE : FIRE_RAMP[4],
            color: '#ffffff',
            weight: 0.8,
            opacity: 0.9,
            fillOpacity: 0.85,
            sensType
          });

          const popup = document.createElement('div');
          popup.className = 'p-1 font-sans text-xs min-w-[210px] text-slate-800';
          const title = document.createElement('div');
          title.className = 'font-bold text-sm text-slate-900 border-b border-slate-200 pb-1 mb-2';
          title.textContent = `${munLabel(inc.mun)}, ${deptLabel(inc.dept)}`;
          popup.appendChild(title);

          const body = document.createElement('div');
          body.className = 'space-y-1 text-[11px]';
          [['Fecha', inc.fecha], ['Ecosistema', prettify(inc.ecos)], ['Clima', prettify(inc.clima)],
           ['Paisaje', inc.paisaje], ['Suelo', inc.suelos]].forEach(([k, v]) => {
            const row = document.createElement('div');
            const label = document.createElement('span');
            label.className = 'font-bold text-slate-500';
            label.textContent = `${k}: `;
            row.appendChild(label);
            row.appendChild(document.createTextNode(v ?? '—'));
            body.appendChild(row);
          });
          popup.appendChild(body);

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'mt-2.5 w-full bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 rounded cursor-pointer';
          btn.textContent = deptSet.has(inc.dept) ? `Quitar filtro: ${deptLabel(inc.dept)}` : `Filtrar por ${deptLabel(inc.dept)}`;
          btn.addEventListener('click', () => { toggleDept(inc.dept); map.closePopup(); });
          popup.appendChild(btn);

          marker.bindPopup(popup);
          markers.push(marker);
        });

        layer.addLayers(markers);
        map.addLayer(layer);
      }

      created = layer;
      layerGroupRef.current = layer;

      // Frame the current selection — with no filters that means framing
      // Colombia, instead of leaving half of South America in the viewport.
      // Only when the data changed: switching layers must not throw away the
      // pan and zoom the reader just set.
      if (lastFitRef.current !== filteredIncidents) {
        lastFitRef.current = filteredIncidents;
        const bounds = L.latLngBounds(filteredIncidents.map(inc => [inc.lat, inc.lng]));
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 10 });
      }
    };

    initMap();

    return () => {
      cancelled = true;
      const map = mapRef.current;
      if (!map) return;
      if (zoomHandlerRef.current) { map.off('zoomend', zoomHandlerRef.current); zoomHandlerRef.current = null; }
      if (created && map.hasLayer(created)) map.removeLayer(created);
      if (layerGroupRef.current === created) layerGroupRef.current = null;
    };
  }, [filteredIncidents, mapLayer, ideamData, deptSet, toggleDept, choroValues, analytics]);

  if (loading || !archive || !cascade) {
    return (
      <div className="w-full min-h-[60vh] bg-[#FAFAF8] flex items-center justify-center text-slate-700 flex-col gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
        <span className="font-bold tracking-wider text-xs uppercase">{t('Cargando registros del IDEAM…')}</span>
      </div>
    );
  }

  const chips = [];
  if (yearRange) {
    chips.push({
      key: 'year',
      label: yearRange[0] === yearRange[1] ? `Año: ${yearRange[0]}` : `Años: ${yearRange[0]}–${yearRange[1]}`,
      onRemove: () => setYearRange(null)
    });
  }
  months.forEach(m => chips.push({ key: `m-${m}`, label: `Mes: ${MONTHS[parseInt(m, 10) - 1]}`, onRemove: () => toggleMonth(m) }));
  depts.forEach(d => chips.push({ key: `d-${d}`, label: deptLabel(d), onRemove: () => toggleDept(d) }));
  ecos.forEach(e => chips.push({ key: `e-${e}`, label: prettify(e), onRemove: () => toggleEco(e) }));
  climas.forEach(c => chips.push({ key: `c-${c}`, label: prettify(c), onRemove: () => toggleClima(c) }));

  // Resumen de una línea para la barra recogida. Reemplaza a la fila de chips:
  // el año ya está resaltado en el histograma y el mes en la tira de meses, así
  // que repetirlos como fichas era decir tres veces lo mismo.
  const summaryParts = [];
  if (yearRange) summaryParts.push(yearRange[0] === yearRange[1] ? `${yearRange[0]}` : `${yearRange[0]}–${yearRange[1]}`);
  else summaryParts.push('2010–2025');
  if (months.length === 1) summaryParts.push(MONTHS_FULL_L[parseInt(months[0], 10) - 1]);
  else if (months.length > 1) summaryParts.push(`${months.length} ${t('meses')}`);
  if (depts.length === 1) summaryParts.push(deptLabel(depts[0]));
  else if (depts.length > 1) summaryParts.push(`${depts.length} ${t('deptos')}`);
  const otherFilters = ecos.length + climas.length;
  if (otherFilters === 1) summaryParts.push(ecos.length ? prettify(ecos[0]) : prettify(climas[0]));
  else if (otherFilters > 1) summaryParts.push(`${otherFilters} ${t('filtros más')}`);
  summaryParts.push(`${fmtNum(filteredIncidents.length)} ${t('focos')}`);

  // Las demás regiones ya no se nombran una a una: el hallazgo las recorre en
  // bucle sobre smallMultiples. Solo la Andina sigue suelta, por su aporte al
  // segundo pico nacional.
  const andina = archive.regionRows.find(r => r.name === 'Andina');
  const smallMultiples = archive.regionProfiles.filter(r => r.name !== 'Otras').slice(0, 4);
  // Escala común a los cuatro paneles: sin ella cada región se dibuja contra su
  // propio máximo y las alturas mienten al compararlas de un vistazo.
  const seasonDomain = Math.max(5, ...smallMultiples.map(r => r.domain));
  // Referencia del gráfico semanal: la media de lunes a viernes.
  const weekdayAvg = analytics.dowCounts.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

  const ecoColorOf = (item) =>
    isSensitiveEco(item.value) ? PURPLE : intervenedNameSet.has(item.value) ? GRAY.markStrong : GRAY.mark;

  // Los tres grupos de la leyenda, con su cifra. Mismo criterio de color que
  // las barras, para que la banda de arriba y el ranking de abajo concuerden.
  const ecoGroupSplit = [
    { key: 'sensible', label: t('Sensible'), color: PURPLE, match: (i) => isSensitiveEco(i.value) },
    { key: 'intervenido', label: t('Intervenido'), color: GRAY.markStrong, match: (i) => !isSensitiveEco(i.value) && intervenedNameSet.has(i.value) },
    { key: 'otro', label: t('Otro natural'), color: GRAY.mark, match: (i) => !isSensitiveEco(i.value) && !intervenedNameSet.has(i.value) }
  ].map(g => ({
    ...g,
    count: analytics.ecoChart.filter(g.match).reduce((a, i) => a + i.count, 0)
  }));

  // Cifras vivas para la nota "ojo con esto" del perfil ecológico, sobre el
  // archivo completo: si el dato cambia, el texto cambia con él.
  const ecoGuideCtx = {
    paramoCount: fmtNum(archive.ecoArchiveCounts['Paramo'] || 0),
    pastureCount: fmtNum(archive.ecoArchiveCounts['Agroecosistema'] || 0)
  };

  // Referencia del archivo completo para los estados en cero: una tarjeta que
  // marca 0 no debe ocupar lo mismo que una con información, pero tampoco
  // desaparecer — se atenúa y dice contra qué se está comparando.
  const archiveHighValue = HIGH_VALUE_ECOS.reduce((s, n) => s + (archive.ecoArchiveCounts[n] || 0), 0);
  const archiveParamo = archive.ecoArchiveCounts['Paramo'] || 0;
  const noHighValue = analytics.highValueCount === 0;

  return (
    <div className="w-full bg-[#FAFAF8] text-slate-800 font-sans">

      {/* ---- 1. Product bar: contexto de la fuente, no controles. Se va con
             el scroll; lo que el usuario necesita a mano son los filtros. ---- */}
      <div
        className={`border-b border-slate-200 bg-white overflow-hidden transition-all duration-300 ${
          barCondensed ? 'max-h-0 opacity-0 border-b-0' : 'max-h-32 opacity-100'
        }`}
        aria-hidden={barCondensed}
      >
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[15px] font-bold text-slate-900 leading-none">{t('Observatorio de Incendios')}</h1>
            <span className="text-[11px] text-slate-400 font-medium">
              {t('Caracterización biofísica de')} <Term id="foco-de-calor">{t('focos de calor')}</Term>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <span>{t('Fuente:')} <span className="font-semibold text-slate-700">IDEAM</span></span>
            <span className="text-slate-300">·</span>
            <span>2010 – 2025</span>
            <span className="text-slate-300">·</span>
            <span>{t('Último registro:')} <span className="font-mono text-slate-700">{archive.lastDate}</span></span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-700">{fmtNum(archive.total)} {t('registros')}</span>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => {
                // La sección vive al pie y siempre está montada: basta con bajar.
                document.getElementById('datos-abiertos')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="flex items-center gap-1 border border-slate-300 rounded-md px-2 py-1 text-[10px] font-bold text-slate-600 hover:border-emerald-700 hover:text-emerald-800 cursor-pointer transition-colors"
              title={t('Descargar el archivo de investigación y ver cómo se construyó')}
            >
              <Download className="w-3 h-3" /> {t('Datos abiertos')}
            </button>
            <span className="text-slate-300">·</span>
            <LearnModeToggle />
          </div>
        </div>
      </div>

      {/* ---- 2. Sticky filter bar (parks right under the fixed nav) ---- */}
      <div className="sticky z-40 bg-white border-b border-slate-200" style={{ top: 'var(--nte-header-h, 72px)' }}>

        {/* Recogida: una sola línea de 48px con lo que está filtrado ahora. */}
        {barCondensed && (
          <div className="max-w-[1600px] mx-auto px-6 lg:px-10 h-12 flex items-center gap-3 text-[12px]">
            <span className="text-slate-700 font-medium truncate">
              {summaryParts.map((part, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-slate-300 mx-1.5">·</span>}
                  <span className={i === summaryParts.length - 1 ? 'font-bold text-slate-900 tabular-nums' : ''}>{part}</span>
                </React.Fragment>
              ))}
            </span>
            <button
              type="button"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen(o => !o)}
              className={`flex items-center gap-1 border rounded-md px-2.5 py-1 text-[11px] font-bold cursor-pointer transition-colors shrink-0 ${
                filtersOpen
                  ? 'bg-emerald-800 border-emerald-800 text-white'
                  : 'border-slate-300 text-slate-600 hover:border-emerald-700 hover:text-emerald-800'
              }`}
            >
              {filtersOpen ? t('Listo') : t('Editar filtros')}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
            {chips.length > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-slate-400 hover:text-red-700 cursor-pointer transition-colors shrink-0"
              >
                {t('Limpiar')}
              </button>
            )}
          </div>
        )}

        <div
          data-tour="filters"
          className={`max-w-[1600px] mx-auto px-6 lg:px-10 py-2.5 flex-wrap items-end gap-x-6 gap-y-3 ${
            showFilters ? 'flex' : 'hidden'
          } ${barCondensed ? 'border-t border-slate-200' : ''}`}
        >

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Año')}</span>
              <span className="text-[9px] text-slate-400">{t('clic o arrastra')}</span>
            </div>
            <YearStrip data={cascade.years} range={yearRange} onChange={setYearRange} />
            <div className="flex items-center gap-3 text-[9px] text-slate-400 leading-none">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: GRAY.markStrong }} />{t('captura densa')}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: 'repeating-linear-gradient(45deg, #94a3b8 0 3px, #dbe2ea 3px 6px)' }} />{t('captura parcial')}</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] border border-dashed border-slate-300" />{t('sin captura')}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Mes')}</span>
              {/* «multiselección» nombra la capacidad pero no dice cómo usarla. */}
              <span className="text-[9px] text-slate-400">{t('clic para sumar · arrastra un rango')}</span>
            </div>
            <MonthStrip data={cascade.months} selected={months} onChange={setMonths} animatingMonth={isAnimating ? animationMonth : null} monthNames={MONTHS_L} />
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] leading-none">
              {MONTH_PRESETS.map(preset => {
                const active =
                  months.length === preset.keys.length && preset.keys.every(k => months.includes(k));
                return (
                  <button
                    key={preset.label}
                    type="button"
                    title={t(preset.title)}
                    onClick={() => setMonths(active ? [] : MONTH_KEYS.filter(k => preset.keys.includes(k)))}
                    className={`px-1.5 py-1 rounded border font-bold cursor-pointer transition-colors ${
                      active
                        ? 'bg-emerald-800 border-emerald-800 text-white'
                        : 'border-slate-200 text-slate-500 hover:border-emerald-700 hover:text-emerald-800'
                    }`}
                  >
                    {t(preset.label)}
                  </button>
                );
              })}
              {months.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMonths([])}
                  className="px-1.5 py-1 text-slate-400 hover:text-red-700 underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
                >
                  {t('quitar')} ({months.length})
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pb-[14px]">
            <DeptCombobox options={cascade.depts} selected={depts} onChange={setDepts} />
            <GroupedCheckboxFilter
              label={t('Ecosistema')} groups={ecoGroups} selected={ecos} onChange={setEcos} width={330}
              shortcut={{ label: t('Solo ecosistemas sensibles'), values: sensitiveEcoNames }}
            />
            <GroupedCheckboxFilter label={t('Clima')} groups={climaGroups} selected={climas} onChange={setClimas} width={300} />
            {chips.length > 0 && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1 border border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-700 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t('Limpiar')} ({chips.length})
              </button>
            )}
          </div>

          <div className="ml-auto pb-[14px] font-mono text-[13px] text-slate-900 font-bold tabular-nums">
            {fmtNum(filteredIncidents.length)}
            <span className="text-slate-400 font-normal font-sans text-[11px]"> / {fmtNum(archive.total)} {t('registros')}</span>
          </div>
        </div>

      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 pt-4 flex flex-col gap-4">

        {filteredIncidents.length === 0 ? (
          <Card className="p-10 text-center flex flex-col items-center justify-center gap-3 my-6">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800">{t('No hay registros con la combinación seleccionada')}</h3>
            <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
              No existen reportes en el archivo del IDEAM para esta combinación de filtros. Quita un filtro con su ✕ o restablece todo.
            </p>
            <button onClick={resetFilters} className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-md transition-colors cursor-pointer">
              {t('Restablecer filtros')}
            </button>
          </Card>
        ) : (
          <>
            {/* ---- 3. KPI row: cuatro preguntas, una tarjeta cada una.
                   ¿cuántos? · ¿sobre qué? · ¿dónde importa? · ¿cuándo?
                   Lo que era «afectación territorial» y «dificultad operativa»
                   se mudó al encabezado del mapa, su contexto natural. ---- */}
            <div data-tour="kpis" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <Card className="p-3">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('Focos de incendio')}</span>
                  <CardInfo id="kpi-focos" />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="text-[26px] font-black text-slate-900 tabular-nums leading-none">{fmtNum(analytics.total)}</div>
                  <div className="w-[86px]">
                    <Sparkbars values={analytics.monthSeries} colorOf={(v, max) => fireBarOf(v, max)} />
                  </div>
                </div>
                {/* El malentendido más caro del tablero va fijo junto a la cifra
                    principal, no escondido en las notas metodológicas. */}
                <div className="text-[10px] text-slate-500 mt-1.5 leading-snug border-t border-slate-100 pt-1.5">
{t('Son')} <Term id="foco-de-calor">{t('detecciones satelitales')}</Term>, {t('no')}{' '}
                  <Term id="incendio">{t('incendios')}</Term> {t('ni')} <Term id="unidad-de-analisis">{t('hectáreas')}</Term>.
                </div>
              </Card>

              {/* ¿Sobre qué? — el ecosistema dominante y cuánto de eso ya
                  estaba intervenido son la misma pregunta, en una tarjeta. */}
              <Card className="p-3">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('Ecosistema dominante')}</span>
                  <CardInfo id="kpi-eco-dominante" />
                </div>
                <div className="text-[19px] font-black text-slate-900 leading-tight truncate">
                  {v(prettify(analytics.topEco.name))}
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-[15px] font-bold text-slate-700 tabular-nums">{fmtNum(analytics.topEco.count)}</span>
                  <span className="text-[12px] font-bold tabular-nums" style={{ color: FIRE_BARS[3] }}>
                    {fmtPct(analytics.topEco.pct)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-0.5">{t('de')} {analytics.ecoChart.length} {t('clases')}</span>
                </div>
                <div className="border-t border-slate-100 mt-2 pt-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[10px] text-slate-500">{t('Zonas intervenidas')}</span>
                    <span className="text-[12px] font-bold text-slate-800 tabular-nums">{analytics.intervenedPct}%</span>
                  </div>
                  <div className="h-[5px] bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full" style={{ width: `${analytics.intervenedPct}%`, background: FIRE_BARS[2] }} />
                  </div>
                </div>
              </Card>

              {/* ¿Dónde importa? — el páramo es una línea de esta tarjeta, no
                  una tarjeta aparte: es un subconjunto de lo mismo. */}
              <Card
                className={`p-3 transition-opacity ${noHighValue ? 'border-slate-200 opacity-60' : 'border-purple-200 bg-purple-50/40'}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wide"
                    style={{ color: noHighValue ? GRAY.ink : PURPLE }}
                  >
                    {t('Alto valor de conservación')}
                  </span>
                  <CardInfo id="kpi-alto-valor" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-black text-slate-900 tabular-nums leading-none">
                    {fmtNum(analytics.highValueCount)}
                  </span>
                  <span
                    className="text-[15px] font-bold tabular-nums"
                    style={{ color: noHighValue ? GRAY.mark : PURPLE }}
                  >
                    {fmtPct(analytics.highValuePct)}
                  </span>
                </div>

                {noHighValue ? (
                  <div className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                    {t('Ninguno con estos filtros. En el archivo completo son')}{' '}
                    <span className="font-mono font-bold text-slate-700">{fmtNum(archiveHighValue)}</span>{' '}
                    ({fmtPct(pct(archiveHighValue, archive.total))}), {t('de los cuales')}{' '}
                    <span className="font-mono font-bold text-slate-700">{fmtNum(archiveParamo)}</span> {t('en páramo')}.
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 mt-1.5 text-[10px] text-slate-600">
                      {analytics.highValueBreakdown.map(e => (
                        <span key={e.name}>
                          {v(prettify(e.name))} <span className="font-mono font-bold text-slate-800">{fmtNum(e.count)}</span>
                        </span>
                      ))}
                    </div>
                    <div className="border-t border-purple-200/70 mt-2 pt-1.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] text-slate-600">
                          {t('De ellos, en')} <Term id="paramo">{t('páramo')}</Term>
                        </span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: '#581c87' }}>
                          {fmtNum(analytics.paramoCount)}
                          <span className="text-slate-500 font-semibold ml-1">{fmtPct(analytics.paramoPct)}</span>
                        </span>
                      </div>
                      {analytics.paramoTopDepts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {analytics.paramoTopDepts.map(dp => (
                            <button
                              key={dp.value}
                              type="button"
                              onClick={() => toggleDept(dp.value)}
                              className="text-[10px] border border-purple-200 bg-white rounded-full px-1.5 py-0.5 text-purple-900 hover:border-purple-500 cursor-pointer transition-colors"
                            >
                              {dp.label} <span className="font-mono font-bold">{dp.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <PlainLine id="kpi-alto-valor" className="!mt-1.5 !pt-1.5" />
              </Card>

              {/* ¿Cuándo? */}
              <Card className="p-3">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{t('Pico estacional')}</span>
                  <CardInfo id="kpi-pico" />
                </div>
                <div className="flex items-end justify-between gap-3">
                  <div className="text-[26px] font-black text-slate-900 leading-none uppercase">{analytics.peakMonth}</div>
                  <div className="w-[86px]">
                    <Sparkbars values={analytics.monthSeries} colorOf={(v, max) => fireBarOf(v, max)} highlight={analytics.peakIdx} />
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{fmtNum(analytics.peakCount)} {t('focos registrados')}</div>
              </Card>
            </div>

            {/* ---- 4. Automatic finding ---- */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-emerald-950">
              <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-px" />
              <div className="leading-relaxed">
                <span className="font-bold">{t('Hallazgo automático:')}</span> {t('con los filtros seleccionados')} ({fmtNum(analytics.total)} {t('reportes')}), {' '}
                <span className="font-bold">{analytics.intervenedPct}%</span> {t('ocurre en ecosistemas intervenidos (uso agropecuario/antrópico) y el')}{' '}
                <span className="font-bold">{analytics.mountainPct}%</span> {t('se concentra en paisaje de montaña, el mayor reto logístico de extinción.')}
              </div>
            </div>

            {/* ---- 5. Map ---- */}
            <div data-tour="map" className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-slate-950 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] mr-1">{t('Capa:')}</span>
                  {[['PUNTOS', t('Puntos')], ['HEATMAP', t('Densidad')], ['COROPLETA', t('Coropleta')], ['SENSIBLES', t('Ecosistemas sensibles')]].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setMapLayer(key)}
                      className={`px-2.5 py-1 rounded font-bold transition-colors cursor-pointer ${
                        mapLayer === key ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  {mapLayer === 'COROPLETA' && (
                    <div className="flex items-center border border-slate-700 rounded overflow-hidden ml-2">
                      {[['count', t('Conteo')], ['rate', t('Tasa /1.000 km²')]].map(([k, l]) => (
                        <button
                          key={k}
                          onClick={() => setDeptMetric(k)}
                          className={`px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${
                            deptMetric === k ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* La afectación territorial vive aquí, no en una tarjeta KPI:
                      el mapa es su contexto natural. */}
                  <span className="text-[10px] text-slate-400 hidden lg:flex items-center gap-1.5 tabular-nums">
                    <span><span className="font-bold text-slate-200">{analytics.deptCount}</span> {t('deptos')}</span>
                    <span className="text-slate-700">·</span>
                    <span><span className="font-bold text-slate-200">{fmtNum(analytics.munCount)}</span> {t('municipios')}</span>
                    <span className="text-slate-700">·</span>
                    <span><span className="font-bold text-slate-200">{analytics.mountainPct}%</span> {t('en montaña')}</span>
                  </span>
                  <div className="flex items-center gap-2 border border-slate-800 px-2 py-1 rounded">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t('Animación')}</span>
                    <button
                      onClick={() => setIsAnimating(!isAnimating)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${isAnimating ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
                    >
                      {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-px" />}
                    </button>
                    {isAnimating && <span className="font-bold text-white font-mono text-[11px] w-6">{MONTHS_L[animationMonth - 1]}</span>}
                  </div>
                  <span className="bg-white/10 rounded-full"><CardInfo id="mapa" /></span>
                </div>
              </div>

              <div
                style={{ height: '540px', width: '100%', position: 'relative' }}
                onMouseEnter={() => setMapHover(true)}
                onMouseLeave={() => { setMapHover(false); if (mapHintPinned) dismissMapHint(); }}
              >
                <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

                {(mapHintPinned || mapHover) && (
                  <div className="absolute top-3 left-3 z-10 bg-slate-950/90 border border-slate-800 rounded-md px-3 py-1.5 text-[10px] text-slate-300 backdrop-blur-sm pointer-events-none flex items-center gap-2">
                    <span>{t('Clic en un punto → filtrar por departamento')}</span>
                    <span className="text-slate-700">·</span>
                    <span>{t('Ctrl/⌘ + rueda para hacer zoom')}</span>
                  </div>
                )}

                {/* Map legend — thresholds are never implicit */}
                <div className="absolute bottom-3 left-3 z-10 bg-slate-950/90 border border-slate-800 rounded-md px-3 py-2 text-[10px] text-slate-300 backdrop-blur-sm">
                  {mapLayer === 'COROPLETA' ? (
                    <>
                      <div className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[9px]">
                        {deptMetric === 'rate' ? t('Focos por 1.000 km²') : t('Focos por departamento')}
                      </div>
                      <div className="flex h-2 w-[170px] rounded-sm overflow-hidden">
                        {FIRE_BARS.map(c => <span key={c} className="flex-1" style={{ background: c }} />)}
                      </div>
                      <div className="flex justify-between w-[170px] mt-1 font-mono text-[9px]">
                        <span>{t('bajo')}</span>
                        <span>
                          {choroBreaks.length
                            ? (deptMetric === 'rate'
                                ? choroBreaks[choroBreaks.length - 1].toLocaleString('es-CO', { maximumFractionDigits: 1 })
                                : fmtNum(Math.round(choroBreaks[choroBreaks.length - 1])))
                            : '—'}
                        </span>
                      </div>
                      <div className="text-slate-500 mt-1 max-w-[180px] leading-tight">
                        Cortes por cuantiles · gris = sin dato · clic en un departamento para filtrar
                      </div>
                    </>
                  ) : mapLayer === 'HEATMAP' ? (
                    <>
                      <div className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[9px]">{t('Densidad de focos')}</div>
                      <div className="h-2 w-[150px] rounded-sm" style={{ background: `linear-gradient(90deg, ${FIRE_RAMP.join(',')})` }} />
                      <div className="flex justify-between w-[150px] mt-1 font-mono">
                        <span>1</span>
                        <span>{fmtNum(heatMax)} focos / celda</span>
                      </div>
                      <div className="text-slate-500 mt-1 max-w-[170px] leading-tight">
                        Celda ≈ 0,05° (~5,5 km) · escala de raíz cuadrada
                      </div>
                    </>
                  ) : mapLayer === 'SENSIBLES' ? (
                    <>
                      <div className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[9px]">{t('Tipo de ecosistema sensible')}</div>
                      <div className="flex flex-col gap-1">
                        {SENSITIVE_ORDER.map(t => (
                          <div key={t} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-white/40 shrink-0" style={{ background: SENSITIVE_COLOR[t] }} />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-slate-500 mt-1.5 max-w-[180px] leading-tight">
                        El clúster toma el color del tipo más sensible que contiene (no el más numeroso); el número es el conteo.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-slate-200 mb-1.5 uppercase tracking-wider text-[9px]">{t('Tamaño del clúster')}</div>
                      <div className="flex flex-col gap-1">
                        {CLUSTER_STEPS.map(s => (
                          <div key={t(s.label)} className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-white/40 shrink-0" style={{ background: s.color }} />
                            <span>{t(s.label)}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 pt-1 border-t border-slate-800 mt-0.5">
                          <span className="w-3 h-3 rounded-full border border-white/40 shrink-0" style={{ background: PURPLE }} />
                          <span>{t('Punto en ecosistema sensible')}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            <PlainLine id="mapa" className="!mt-0 !border-t-0 !pt-0" />

            {/* ---- 6. Analysis tabs ----
                 Cada pestaña lleva encima la pregunta que responde y, debajo de
                 la tira, la descripción de lo que hay dentro. Antes eran cinco
                 sustantivos sueltos y había que entrar a cada uno para saberlo. */}
            <div data-tour="tabs" className="mt-1">
              <div className="flex flex-wrap items-stretch gap-1 border-b border-slate-200">
                {TABS.map(tab_ => {
                  const on = tab === tab_.id;
                  return (
                    <button
                      key={tab_.id}
                      onClick={() => setTab(tab_.id)}
                      aria-current={on ? 'page' : undefined}
                      className={`group px-4 py-2 text-left transition-colors cursor-pointer border-b-2 -mb-px ${
                        on ? 'border-emerald-800' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <span className={`block text-[9.5px] font-bold uppercase tracking-[0.1em] transition-colors ${
                        on ? 'text-emerald-700' : 'text-slate-300 group-hover:text-slate-400'
                      }`}>
                        {t(tab_.question)}
                      </span>
                      <span className={`block text-xs font-bold transition-colors ${
                        on ? 'text-emerald-900' : 'text-slate-500 group-hover:text-slate-800'
                      }`}>
                        {t(tab_.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5">
                <p className="text-[11.5px] text-slate-500 max-w-[80ch] leading-relaxed">
                  {t(TABS.find(x => x.id === tab)?.desc)}
                </p>
                {/* La leyenda de las marcas de alcance, una sola vez y junto a
                    los gráficos que las llevan. */}
                <span className="flex items-center gap-2 text-[9.5px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Filter className="w-2.5 h-2.5" /> {t('sigue tus filtros')}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="flex items-center gap-1">
                    <Database className="w-2.5 h-2.5 text-indigo-500" /> {t('archivo completo')}
                  </span>
                </span>
              </div>
            </div>

            {/* --- Territorio --- */}
            {tab === 'territorio' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5">
                  <ChartHeader
                    title={t("Departamentos")}
                    scope="filtered"
                    subtitle={`${analytics.rankDepts.length} ${t('con registros · clic para filtrar')}`}
                    infoId="departamentos"
                  />
                  <RankBars
                    items={analytics.rankDepts}
                    max={analytics.rankDepts[0]?.count || 1}
                    total={analytics.total}
                    colorOf={(item) => fireBarOf(item.count, analytics.rankDepts[0]?.count || 1)}
                    selectedSet={deptSet}
                    onSelect={toggleDept}
                    labelWidth={150}
                    maxHeight={440}
                  />
                  <PlainLine id="departamentos" />
                </Card>

                <Card className="p-5">
                  {/* La salvedad de fiabilidad municipal ya no ocupa una caja
                      entre el gráfico y su lectura: queda como marca corta aquí
                      y completa en el ⓘ, junto al resto de advertencias. */}
                  <ChartHeader
                    title={t("Municipios más afectados")}
                    scope="filtered"
                    subtitle={t("Top 20 del subconjunto filtrado")}
                    caveat={t("Orientativo")}
                    infoId="municipios"
                  />
                  <RankBars
                    items={analytics.rankMuns}
                    max={analytics.rankMuns[0]?.count || 1}
                    total={analytics.total}
                    colorOf={(item) => fireBarOf(item.count, analytics.rankMuns[0]?.count || 1)}
                    labelWidth={190}
                    maxHeight={440}
                  />
                  <PlainLine id="municipios" />
                </Card>

                <Card className="p-5 lg:col-span-2">
                  <ChartHeader
                    title={t("Concentración territorial")}
                    scope="filtered"
                    subtitle={t("Qué tan repartido está el fuego entre unidades territoriales")}
                    infoId="concentracion"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-2 flex flex-col gap-3">

                      {/* Dos barras enfrentadas: la desproporción entre «cuántas
                          unidades» y «cuánto fuego» es el hallazgo, y así se ve
                          de un vistazo en vez de deducirse de dos cifras. */}
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="text-[30px] font-black text-slate-900 tabular-nums leading-none">
                          {fmtNum(analytics.munPareto.n)}
                          <span className="text-[14px] font-medium text-slate-400"> de {fmtNum(analytics.munPareto.ofTotal)}</span>
                        </div>
                        <div className="text-[11.5px] text-slate-600 mt-1.5 leading-snug">
                          {t('municipios concentran el')} <strong className="text-slate-900">80%</strong> {t('de los focos')}
                        </div>

                        <div className="flex flex-col gap-2 mt-3.5 pt-3 border-t border-slate-100">
                          {[
                            { label: t('Municipios'), value: pct(analytics.munPareto.n, analytics.munPareto.ofTotal), color: GRAY.mark },
                            { label: t('Focos'), value: 80, color: FIRE_BARS[3] }
                          ].map(row => (
                            <div key={row.label} className="flex items-center gap-2.5">
                              <span className="text-[10px] text-slate-500 w-[62px] shrink-0">{row.label}</span>
                              <span className="flex-1 h-[10px] bg-slate-100 rounded-full overflow-hidden">
                                <span
                                  className="block h-full rounded-full transition-[width] duration-500 ease-out"
                                  style={{ width: `${row.value}%`, background: row.color }}
                                />
                              </span>
                              <span className="text-[11px] font-mono font-bold tabular-nums text-slate-800 w-[38px] text-right shrink-0">
                                {fmtPct(row.value, 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Los cinco departamentos como reparto proporcional: cada
                          segmento vale lo que aporta, y filtra al hacer clic. */}
                      <div className="border border-slate-200 rounded-lg p-4">
                        <div className="text-[30px] font-black tabular-nums leading-none" style={{ color: FIRE_BARS[4] }}>
                          {fmtPct(analytics.top5DeptShare)}
                        </div>
                        <div className="text-[11.5px] text-slate-600 mt-1.5 leading-snug">
                          {t('del total está en los')} <strong className="text-slate-900">{t('5 departamentos')}</strong> {t('más afectados')}
                        </div>

                        <div className="flex h-[10px] rounded-full overflow-hidden mt-3.5 gap-[1.5px]">
                          {analytics.top5Depts.map(d => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleDept(d.value)}
                              title={`${d.label} · ${fmtNum(d.count)} focos (${fmtPct(pct(d.count, analytics.total))})`}
                              aria-label={`Filtrar por ${d.label}`}
                              className="h-full cursor-pointer hover:opacity-75 transition-opacity first:rounded-l-full"
                              style={{
                                width: `${pct(d.count, analytics.total)}%`,
                                background: fireBarOf(d.count, analytics.top5Depts[0]?.count || 1)
                              }}
                            />
                          ))}
                          <span className="flex-1 h-full bg-slate-100 rounded-r-full" title={t('El resto del país')} />
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {analytics.top5Depts.map(d => (
                            <button
                              key={d.value}
                              type="button"
                              onClick={() => toggleDept(d.value)}
                              className={`flex items-center gap-1.5 text-[10.5px] border rounded-full pl-1.5 pr-2 py-0.5 cursor-pointer transition-colors ${
                                deptSet.has(d.value)
                                  ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                                  : 'border-slate-200 text-slate-600 hover:border-emerald-700 hover:text-emerald-800'
                              }`}
                            >
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: fireBarOf(d.count, analytics.top5Depts[0]?.count || 1) }}
                              />
                              {d.label}
                              <span className="font-mono tabular-nums text-slate-400">{fmtPct(pct(d.count, analytics.total), 0)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-3 h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={analytics.munPareto.curve}
                          margin={{ top: 14, right: 16, left: -14, bottom: 16 }}
                        >
                          <defs>
                            <linearGradient id="paretoFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={FIRE_BARS[4]} stopOpacity={0.22} />
                              <stop offset="100%" stopColor={FIRE_BARS[4]} stopOpacity={0.02} />
                            </linearGradient>
                          </defs>

                          <XAxis
                            type="number" dataKey="unitPct" domain={[0, 100]}
                            tick={{ fontSize: 9, fill: GRAY.mark }} axisLine={{ stroke: GRAY.line }} tickLine={false}
                            tickFormatter={(v) => `${Math.round(v)}%`}
                            label={{ value: t('% de municipios, del que más arde al que menos'), position: 'insideBottom', offset: -10, fontSize: 9, fill: GRAY.mark }}
                          />
                          <YAxis
                            domain={[0, 100]} tick={{ fontSize: 9, fill: GRAY.mark }} axisLine={false} tickLine={false}
                            tickFormatter={(v) => `${v}%`}
                          />
                          <RechartsTooltip
                            formatter={(v, name, pl) =>
                              name === 'equality'
                                ? null
                                : [`${fmtPct(v)} de los focos`, `Los ${fmtNum(pl.payload.units)} municipios que más arden`]}
                            labelFormatter={() => ''}
                            contentStyle={{ borderRadius: '8px', border: `1px solid ${GRAY.line}`, fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,.08)' }}
                          />

                          {/* La zona que responde por el 80%: el número de la
                              izquierda, dibujado. */}
                          <ReferenceArea
                            x1={0} x2={pct(analytics.munPareto.n, analytics.munPareto.ofTotal)}
                            fill={FIRE_BARS[4]} fillOpacity={0.05} strokeOpacity={0}
                          />

                          {/* Reparto perfectamente uniforme. Sin esta diagonal,
                              «concentrado» es una palabra; con ella, la distancia
                              entre las dos curvas es la concentración. */}
                          <Line
                            type="linear" dataKey="unitPct" name="equality"
                            stroke={GRAY.mark} strokeWidth={1} strokeDasharray="3 4" dot={false} activeDot={false} isAnimationActive={false}
                          />

                          <ReferenceLine
                            y={80} stroke={FIRE_BARS[3]} strokeDasharray="4 3" strokeWidth={1.5}
                            label={{ value: t('80% de los focos'), position: 'insideBottomLeft', fontSize: 9, fill: FIRE_BARS[3], offset: 6 }}
                          />

                          <Area
                            type="monotone" dataKey="cumPct"
                            stroke={FIRE_BARS[4]} strokeWidth={2.5} fill="url(#paretoFill)" dot={false}
                          />

                          <ReferenceDot
                            x={pct(analytics.munPareto.n, analytics.munPareto.ofTotal)} y={80}
                            r={5} fill={FIRE_BARS[4]} stroke="#ffffff" strokeWidth={2}
                            // Encima del punto, no a su derecha: ahí la etiqueta
                            // caía sobre la línea del 80% y las rayas la cruzaban.
                            label={{
                              value: `${fmtNum(analytics.munPareto.n)} municipios`,
                              position: 'top', fontSize: 10.5, fontWeight: 700, fill: FIRE_BARS[4], offset: 12
                            }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>

                      <div className="flex items-center justify-center gap-4 -mt-1 text-[9.5px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 h-[2.5px] rounded-full" style={{ background: FIRE_BARS[4] }} />
                          {t('Focos acumulados')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-4 border-t border-dashed" style={{ borderColor: GRAY.mark }} />
                          {t('Si el fuego se repartiera por igual')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <PlainLine id="concentracion" />
                </Card>
              </div>
            )}

            {/* --- Temporal --- */}
            {tab === 'temporal' && (
              <div className="flex flex-col gap-4">
                {/* Esto es un hallazgo, no una advertencia metodológica: por eso
                    deja de ser una caja ámbar de prosa densa y pasa a mostrar el
                    reparto por región, que es donde se ve el argumento. */}
                <Card className="p-5 overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: FIRE_BARS[4] }}>
                      {t('Hallazgo')}
                    </span>
                    <ScopeBadge scope="archive" />
                  </div>
                  <h3 className="text-[19px] font-bold text-slate-900 leading-tight tracking-tight">
                    {t('Las dos temporadas no son dos regiones que se turnan')}
                  </h3>
                  <p className="text-[12.5px] text-slate-600 mt-1.5 max-w-[72ch] leading-relaxed">
{t('El primer pico lo arman todas las regiones a la vez. El segundo es casi solo andino — y coincide con el clima: los Llanos tienen una única temporada seca, mientras la región Andina tiene')}{' '}
                    <Term id="bimodalidad">{t('régimen bimodal de lluvias')}</Term>{' '}
                    {t('y, por tanto, dos temporadas secas al año.')}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mt-5">
                    {[
                      {
                        key: 'q1',
                        band: t('Ene–Mar'),
                        verdict: t('Todas las regiones a la vez'),
                        color: FIRE_BARS[4],
                        get: (r) => r.q1Share
                      },
                      {
                        key: 'q3',
                        band: t('Jul–Sep'),
                        verdict: t('Casi solo la Andina'),
                        color: FIRE_BARS[1],
                        get: (r) => r.q3Share
                      }
                    ].map(block => (
                      <div key={block.key}>
                        <div className="flex items-baseline gap-2 mb-2.5">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded"
                            style={{ background: `${block.color}1f`, color: '#7f1d1d' }}
                          >
                            {block.band}
                          </span>
                          <span className="text-[12.5px] font-bold text-slate-900">{block.verdict}</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {[...smallMultiples]
                            .sort((a, b) => block.get(b) - block.get(a))
                            .map(r => (
                              <div key={r.name} className="flex items-center gap-2.5">
                                <span className="text-[11px] text-slate-600 w-[74px] shrink-0">{regionName(r.name)}</span>
                                <span className="flex-1 h-[11px] bg-slate-100 rounded-full overflow-hidden">
                                  <span
                                    className="block h-full rounded-full transition-[width] duration-500"
                                    style={{ width: `${block.get(r)}%`, background: block.color }}
                                  />
                                </span>
                                <span className="text-[11.5px] font-mono font-bold tabular-nums text-slate-900 w-[46px] text-right shrink-0">
                                  {fmtPct(block.get(r))}
                                </span>
                              </div>
                            ))}
                        </div>
                        <p className="text-[10.5px] text-slate-400 mt-2 leading-snug">
                          {block.key === 'q1'
                            ? t('Porcentaje de los focos de cada región que cae en ese trimestre.')
                            : andina && (
                              <>
                                {t('La región Andina aporta el')}{' '}
                                <span className="font-bold text-slate-600">{fmtPct(andina.ofQ3)}</span>{' '}
                                {t('de este pico nacional.')}
                              </>
                            )}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5">
                  <ChartHeader
                    title={t("Estacionalidad por región natural")}
                    scope="archive"
                    subtitle={t("% de los focos de cada región en cada mes · misma escala en los cuatro paneles")}
                    infoId="estacionalidad"
                    right={(
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded">
                          {fmtPct(archive.bimodalPct)} {t('en Ene–Mar + Jul–Sep')}
                        </span>
                        <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
                          <button
                            onClick={() => setSeasonMode('season')}
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${seasonMode === 'season' ? 'bg-emerald-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            <RadarIcon className="w-3 h-3" /> {t('Temporada')}
                          </button>
                          <button
                            onClick={() => setSeasonMode('bars')}
                            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold cursor-pointer transition-colors ${seasonMode === 'bars' ? 'bg-emerald-800 text-white' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            <BarChart3 className="w-3 h-3" /> {t('Barras')}
                          </button>
                        </div>
                      </div>
                    )}
                  />

                  {/* Leyenda de las bandas: sin ella el sombreado es decoración. */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3 rounded-sm" style={{ background: `${FIRE_BARS[4]}1f` }} />
                      {t('Ene–Mar · primera temporada seca')}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3 rounded-sm" style={{ background: `${FIRE_BARS[1]}26` }} />
                      {t('Jul–Sep · segunda temporada seca')}
                    </span>
                    <span className="text-slate-400">{t('Los cuatro paneles llegan hasta')} {seasonDomain}% — {t('así que las alturas sí se pueden comparar.')}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-6">
                    {smallMultiples.map(region => (
                      <div key={region.name} className="flex flex-col">
                        <div className="flex items-baseline justify-between mb-0.5">
                          <h4 className="text-[13px] font-bold text-slate-900">{regionName(region.name)}</h4>
                          <span className="text-[10px] font-mono text-slate-400">n = {fmtNum(region.n)}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 mb-1.5">
                          {region.q1Share >= 15 && region.q3Share >= 15
                            ? t('Dos temporadas al año')
                            : t('Una sola temporada al año')}
                          <span className="text-slate-400"> · {t('pico')} {MONTHS_L[MONTHS.indexOf(region.peak.month)] ?? region.peak.month}</span>
                        </div>

                        <div className="h-[190px]">
                          <ResponsiveContainer width="100%" height="100%">
                            {seasonMode === 'season' ? (
                              <ComposedChart data={region.data.map((d,i) => ({ ...d, monthL: MONTHS_L[i] }))} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                                <XAxis dataKey="monthL" tick={{ fontSize: 8, fill: GRAY.ink }} axisLine={{ stroke: GRAY.line }} tickLine={false} interval={0} />
                                <YAxis domain={[0, seasonDomain]} tick={{ fontSize: 8, fill: GRAY.mark }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />

                                {/* Las dos temporadas secas, dibujadas. Es lo que
                                    convierte «bimodal» en algo que se ve. */}
                                <ReferenceArea x1="Ene" x2="Mar" fill={FIRE_BARS[4]} fillOpacity={0.12} strokeOpacity={0} />
                                <ReferenceArea x1="Jul" x2="Sep" fill={FIRE_BARS[1]} fillOpacity={0.15} strokeOpacity={0} />

                                <RechartsTooltip
                                  cursor={{ stroke: GRAY.mark, strokeDasharray: '3 3' }}
                                  formatter={(v, _n, p) => [`${fmtPct(v)} · ${fmtNum(p.payload.count)} ${t('focos')}`, regionName(region.name)]}
                                  contentStyle={{ borderRadius: '8px', border: `1px solid ${GRAY.line}`, fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,.08)' }}
                                />
                                <Area
                                  type="monotone" dataKey="share"
                                  stroke={FIRE_BARS[4]} strokeWidth={2} fill={FIRE_BARS[3]} fillOpacity={0.25}
                                  dot={{ r: 2, fill: FIRE_BARS[4], strokeWidth: 0 }}
                                  activeDot={{ r: 4 }}
                                />
                              </ComposedChart>
                            ) : (
                              <BarChart data={region.data.map((d,i) => ({ ...d, monthL: MONTHS_L[i] }))} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
                                <XAxis dataKey="monthL" tick={{ fontSize: 8, fill: GRAY.ink }} axisLine={{ stroke: GRAY.line }} tickLine={false} interval={0} />
                                <YAxis domain={[0, seasonDomain]} tick={{ fontSize: 8, fill: GRAY.mark }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                <RechartsTooltip
                                  cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                                  formatter={(v, _n, p) => [`${fmtPct(v)} · ${fmtNum(p.payload.count)} ${t('focos')}`, regionName(region.name)]}
                                  contentStyle={{ borderRadius: '8px', border: `1px solid ${GRAY.line}`, fontSize: '11px' }}
                                />
                                <Bar dataKey="share" radius={[2, 2, 0, 0]} className="cursor-pointer" onClick={(d) => d?.payload?.key && toggleMonth(d.payload.key)}>
                                  {region.data.map(d => (
                                    <Cell key={d.key} fill={fireBarOf(d.share, seasonDomain)} />
                                  ))}
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>

                        {/* Las dos temporadas como barras enfrentadas: aquí se ve
                            que Orinoquía vuelca todo en una y la Andina reparte. */}
                        <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-100">
                          {[
                            { label: t('Ene–Mar'), value: region.q1Share, color: FIRE_BARS[4] },
                            { label: t('Jul–Sep'), value: region.q3Share, color: FIRE_BARS[1] }
                          ].map(q => (
                            <div key={q.label} className="flex items-center gap-2">
                              <span className="text-[9.5px] text-slate-500 w-[42px] shrink-0">{q.label}</span>
                              <span className="flex-1 h-[7px] bg-slate-100 rounded-full overflow-hidden">
                                <span className="block h-full rounded-full transition-[width] duration-500" style={{ width: `${q.value}%`, background: q.color }} />
                              </span>
                              <span className="text-[10px] font-mono font-bold tabular-nums text-slate-700 w-[38px] text-right shrink-0">
                                {fmtPct(q.value, 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed mt-4 border-t border-slate-100 pt-2.5 max-w-[95ch]">
{t('Cada panel muestra qué porcentaje de los focos')} <em>{t('de esa región')}</em>{' '}
                    {t('cae en cada mes, así que las cuatro curvas suman 100% por separado: comparan la forma de la temporada, no cuánto arde cada región —eso es la n de cada título—. Regiones asignadas por departamento; el archivo del IDEAM no trae columna de región.')}
                  </p>
                </Card>

                <Card className="p-5">
                  <ChartHeader
                    title={t("Distribución por día de la semana")}
                    scope="filtered"
                    subtitle={t("Los mismos focos filtrados, repartidos por día")}
                    infoId="dia-semana"
                  />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div>
                      <div className="h-[210px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={WEEKDAYS_L.map((name, i) => ({ name, short: name.slice(0, 3), count: analytics.dowCounts[i], share: analytics.dowPct[i] }))}
                            margin={{ top: 12, right: 8, left: -22, bottom: 0 }}
                          >
                            <XAxis dataKey="short" tick={{ fontSize: 10, fill: GRAY.ink }} axisLine={{ stroke: GRAY.line }} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fill: GRAY.mark }} axisLine={false} tickLine={false} />
                            <RechartsTooltip
                              cursor={{ fill: 'rgba(15,23,42,0.04)' }}
                              formatter={(v, _n, pl) => [`${fmtNum(v)} focos · ${fmtPct(pl.payload.share)}`, pl.payload.name]}
                              contentStyle={{ borderRadius: '8px', border: `1px solid ${GRAY.line}`, fontSize: '11px', boxShadow: '0 4px 12px rgba(15,23,42,.08)' }}
                            />

                            {/* El fin de semana, marcado. El texto habla de él;
                                ahora el gráfico también lo señala. */}
                            <ReferenceArea x1="Sáb" x2="Dom" fill={GRAY.markStrong} fillOpacity={0.07} strokeOpacity={0} />

                            {/* Promedio de lunes a viernes: convierte «cae el fin
                                de semana» en una distancia medible. */}
                            <ReferenceLine
                              y={weekdayAvg}
                              stroke={GRAY.markStrong} strokeDasharray="4 3" strokeWidth={1.5}
                              // A la derecha: a la izquierda caía sobre la barra
                              // del lunes y el texto gris se perdía en el vinotinto.
                              label={{ value: t('Promedio Lun–Vie'), position: 'insideTopRight', fontSize: 9, fill: GRAY.markStrong, offset: 6 }}
                            />

                            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                              {analytics.dowCounts.map((v, i) => (
                                <Cell key={i} fill={fireBarOf(v, Math.max(...analytics.dowCounts))} />
                              ))}
                            </Bar>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-slate-400 mt-1 pl-6">
                        <span className="w-3.5 h-3 rounded-sm bg-slate-400/10" />
                        {t('Fin de semana')}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-[32px] font-black tabular-nums leading-none" style={{ color: FIRE_BARS[4] }}>
                          −{fmtPct(100 * (Math.max(...analytics.dowCounts) - Math.min(...analytics.dowCounts)) / Math.max(...analytics.dowCounts), 0)}
                        </span>
                        <span className="text-[11.5px] text-slate-600 leading-snug">
                          {t('del')} <strong className="text-slate-900">{WEEKDAYS_L[analytics.dowCounts.indexOf(Math.max(...analytics.dowCounts))]}</strong> ({fmtPct(Math.max(...analytics.dowPct))})
                          {t('al')} <strong className="text-slate-900">{WEEKDAYS_L[analytics.dowCounts.indexOf(Math.min(...analytics.dowCounts))]}</strong> ({fmtPct(Math.min(...analytics.dowPct))})
                        </span>
                      </div>

                      {/* Dos lecturas, una sola pieza: antes eran dos cajas de
                          distinto color compitiendo entre sí. */}
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="p-3.5">
                          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 mb-1.5">
                            {t('Una lectura · el fenómeno')}
                          </div>
                          <p className="text-[11.5px] text-slate-600 leading-relaxed">
{t('El fuego no sabe qué día es. Una caída sistemática el fin de semana apunta a que la ignición es')}{' '}
                            <strong className="text-slate-900">{t('antrópica')}</strong> {t('y sigue el calendario de trabajo agrícola.')}
                          </p>
                        </div>
                        <div className="p-3.5 bg-amber-50 border-t border-amber-200">
                          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800 mb-1.5">
                            {t('La otra · el registro')}
                          </div>
                          <p className="text-[11.5px] text-amber-950 leading-relaxed">
{t('Si los registros dependen de reportes institucionales, lo que cae el fin de semana puede ser la')}{' '}
                            <strong>{t('capacidad de reporte')}</strong>{t(', no el fuego. Con este archivo no se puede separar una de otra: haría falta contrastarla con detecciones satelitales puras, que no dependen de turnos.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <PlainLine id="dia-semana" />
                </Card>
              </div>
            )}

            {/* --- Ecosistemas --- */}
            {/* items-start: sin esto la tarjeta corta se estira a la altura de
                la larga y queda un bloque blanco vacío de varios cientos de px. */}
            {tab === 'ecosistemas' && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
                <Card className="p-5 lg:col-span-3">
                  <ChartHeader
                    title={t("Perfil ecológico")}
                    scope="filtered"
                    subtitle={`${analytics.ecoChart.length} ${t('categorías con registros · clic para filtrar')}`}
                    infoId={null}
                    right={<CardInfo id="perfil-eco" ctx={ecoGuideCtx} />}
                  />

                  {/* La leyenda de tres grupos no estaba representada en ningún
                      gráfico: era vocabulario sin cifra. Ahora es el reparto. */}
                  <div className="mb-4">
                    <div className="flex h-[11px] rounded-full overflow-hidden gap-[1.5px]">
                      {ecoGroupSplit.map(g => (
                        <span
                          key={g.key}
                          title={`${g.label} · ${fmtNum(g.count)} focos (${fmtPct(pct(g.count, analytics.total))})`}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{ width: `${pct(g.count, analytics.total)}%`, background: g.color }}
                        />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10.5px]">
                      {ecoGroupSplit.map(g => (
                        <span key={g.key} className="flex items-center gap-1.5 text-slate-500">
                          <span className="w-2.5 h-2.5 rounded-[2px]" style={{ background: g.color }} />
                          {g.label}
                          <span className="font-mono font-bold tabular-nums text-slate-800">{fmtPct(pct(g.count, analytics.total), 1)}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <RankBars
                    items={analytics.ecoChart}
                    max={analytics.ecoChart[0]?.count || 1}
                    total={analytics.total}
                    colorOf={ecoColorOf}
                    selectedSet={ecoSet}
                    onSelect={toggleEco}
                    labelWidth={165}
                    maxHeight={420}
                  />
                  <PlainLine id="perfil-eco" />
                </Card>

                <Card className="p-5 lg:col-span-2">
                  <ChartHeader
                    title={t("Gran bioma")}
                    scope="filtered"
                    subtitle={t("Las unidades de primer nivel del IAvH")}
                    infoId="gran-bioma"
                  />

                  {/* El anillo escondía la última categoría —una porción del 0,2%
                      no se ve— y dejaba media tarjeta vacía. Un reparto
                      proporcional muestra las cinco y llena el ancho. */}
                  <div className="flex h-3 rounded-full overflow-hidden gap-[1.5px] mb-4">
                    {analytics.biomaChart.map((e, i) => (
                      <span
                        key={e.name}
                        title={`${prettify(e.name)} · ${fmtNum(e.count)} focos (${fmtPct(e.pct)})`}
                        className="h-full first:rounded-l-full last:rounded-r-full min-w-[2px]"
                        style={{ width: `${e.pct}%`, background: FIRE_BARS[Math.min(FIRE_BARS.length - 1, i)] }}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {analytics.biomaChart.map((e, i) => (
                      <div key={e.name} className="flex items-start gap-2.5 text-[11.5px]">
                        <span
                          className="w-2.5 h-2.5 rounded-[2px] shrink-0 mt-1"
                          style={{ background: FIRE_BARS[Math.min(FIRE_BARS.length - 1, i)] }}
                        />
                        <span className="flex-1 text-slate-700 leading-snug min-w-0">
                          <BiomaLabel name={e.name} />
                        </span>
                        <span className="font-mono tabular-nums font-bold text-slate-900 shrink-0">{fmtNum(e.count)}</span>
                        <span className="font-mono tabular-nums text-slate-400 w-[44px] text-right shrink-0">{fmtPct(e.pct)}</span>
                      </div>
                    ))}
                  </div>
                  <PlainLine id="gran-bioma" />
                </Card>

                <Card className="p-5 lg:col-span-5">
                  <ChartHeader
                    title={t("Matriz climática")}
                    scope="filtered"
                    subtitle={<><Term id="piso-termico">{t('Piso térmico')}</Term> × <Term id="regimen-de-humedad">{t('régimen de humedad')}</Term> · {t('clic en una celda para filtrar')}</>}
                    infoId="matriz-clima"
                    right={(
                      <div className="hidden md:flex items-center gap-1.5 text-[9.5px] text-slate-400">
                        <span>{t('menos')}</span>
                        <span className="flex h-2.5 w-[70px] rounded-sm overflow-hidden">
                          {FIRE_BARS.map(c => <span key={c} className="flex-1" style={{ background: c }} />)}
                        </span>
                        <span>{t('más focos')}</span>
                      </div>
                    )}
                  />

                  <div className="overflow-x-auto nte-thin-scroll">
                    {/* w-full: la tabla ocupaba media tarjeta y dejaba el resto
                        en blanco. Ahora las celdas se reparten el ancho. */}
                    <table className="w-full border-collapse text-[11px] min-w-[620px]">
                      <thead>
                        <tr>
                          <th className="p-1 w-[120px]" />
                          {HUMIDITY_AXIS.map(h => (
                            <th key={h} className="p-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                              {v(prettify(h))}
                            </th>
                          ))}
                          <th className="p-1 pl-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right w-[64px]">{t('Total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {THERMAL_AXIS.map(f => {
                          const rowTotal = HUMIDITY_AXIS.reduce((a, h) => a + (analytics.climaMatrix[`${f}|${h}`] || 0), 0);
                          return (
                            <tr key={f}>
                              <th className="p-1 pr-2.5 text-[11.5px] font-bold text-slate-700 text-right whitespace-nowrap">{v(prettify(f))}</th>
                              {HUMIDITY_AXIS.map(h => {
                                const v = analytics.climaMatrix[`${f}|${h}`] || 0;
                                const raw = `${f} ${h}`;
                                const on = climaSet.has(raw);
                                return (
                                  <td key={h} className="p-[2px]">
                                    <button
                                      type="button"
                                      disabled={v === 0}
                                      onClick={() => toggleClima(raw)}
                                      title={`${prettify(raw)} · ${fmtNum(v)} focos (${fmtPct(pct(v, analytics.total))})`}
                                      className={`w-full h-[46px] rounded-[4px] flex flex-col items-center justify-center transition-all ${
                                        v === 0 ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-slate-400'
                                      } ${on ? 'ring-2 ring-emerald-700 ring-offset-1' : ''}`}
                                      style={{
                                        background: v === 0 ? '#f8fafc' : fireBarOf(v, analytics.climaMatrixMax),
                                        color: v === 0 ? '#cbd5e1' : fireInk(v, analytics.climaMatrixMax)
                                      }}
                                    >
                                      <span className="font-mono font-bold tabular-nums leading-none text-[12.5px]">{v === 0 ? '·' : fmtNum(v)}</span>
                                      {v > 0 && (
                                        <span className="font-mono text-[9px] leading-none mt-0.5 opacity-75">{fmtPct(pct(v, analytics.total))}</span>
                                      )}
                                    </button>
                                  </td>
                                );
                              })}
                              <td className="p-1 pl-3 font-mono tabular-nums font-bold text-slate-700 text-right">{fmtNum(rowTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      {/* Totales por régimen de humedad: la tabla solo sumaba por
                          fila, así que la mitad de los márgenes faltaba. */}
                      <tfoot>
                        <tr>
                          <th className="p-1 pr-2.5 pt-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">{t('Total')}</th>
                          {HUMIDITY_AXIS.map(h => {
                            const colTotal = THERMAL_AXIS.reduce((a, f) => a + (analytics.climaMatrix[`${f}|${h}`] || 0), 0);
                            return (
                              <td key={h} className="p-1 pt-2.5 text-center font-mono tabular-nums font-bold text-slate-700 border-t border-slate-200">
                                {fmtNum(colTotal)}
                              </td>
                            );
                          })}
                          <td className="p-1 pl-3 pt-2.5 text-right font-mono tabular-nums text-slate-400 border-t border-slate-200">
                            {fmtNum(THERMAL_AXIS.reduce((a, f) => a + HUMIDITY_AXIS.reduce((b, h) => b + (analytics.climaMatrix[`${f}|${h}`] || 0), 0), 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {analytics.climaUnclassified > 0 && (
                    <p className="text-[10px] text-slate-400 mt-2">
                      {fmtNum(analytics.climaUnclassified)} {t('registros con clima «S.I.» (sin información) quedan fuera de la matriz.')}
                    </p>
                  )}
                  <PlainLine id="matriz-clima" />
                </Card>
              </div>
            )}

            {/* --- Terreno --- */}
            {tab === 'terreno' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="p-5">
                  <ChartHeader
                    title={<Term id="paisaje">Paisaje</Term>}
                    subtitle={t("La unidad grande del terreno · sostiene el KPI de dificultad operativa")}
                    infoId="paisaje"
                    scope="filtered"
                  />
                  <RankBars
                    items={analytics.paisajeChart}
                    max={analytics.paisajeChart[0]?.count || 1}
                    total={analytics.total}
                    colorOf={(item) => fireBarOf(item.count, analytics.paisajeChart[0]?.count || 1)}
                    labelWidth={175}
                    maxHeight={400}
                  />
                  <PlainLine id="paisaje" />
                </Card>

                <Card className="p-5">
                  <ChartHeader
                    title={<Term id="relieve">Relieve</Term>}
                    subtitle={t("El detalle operativo fino · 14 formas más frecuentes")}
                    infoId="relieve"
                    scope="filtered"
                  />
                  <RankBars
                    items={analytics.relieveChart}
                    max={analytics.relieveChart[0]?.count || 1}
                    total={analytics.total}
                    colorOf={(item) => fireBarOf(item.count, analytics.relieveChart[0]?.count || 1)}
                    labelWidth={175}
                    maxHeight={400}
                  />
                  <PlainLine id="relieve" />
                </Card>
              </div>
            )}

            {/* --- Datos --- */}
            {tab === 'datos' && (
              <div className="flex flex-col gap-4">
                {/* Esta pestaña mide repetición entre años, así que se calcula
                    sobre el archivo entero: filtrar por un año la dejaría sin
                    sentido. Antes eso no se decía en ninguna parte y las cifras
                    parecían responder a los filtros de arriba. */}
                <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-[11.5px] text-slate-600 leading-relaxed">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-px" />
                  <div>
                    <strong className="text-slate-800">
                      {t('Esta pestaña no sigue los filtros de año, mes, ecosistema ni clima.')}
                    </strong>{' '}
                    {t('La recurrencia es, por definición, algo que ocurre')} <em>{t('entre')}</em>{' '}
                    {t('años: restringirla a uno solo la anularía. Las cifras de abajo salen del archivo completo')}
                    {depts.length > 0 && <> {t('— la tabla sí respeta el filtro de departamento que tienes puesto')}</>}.
                  </div>
                </div>

                {cluster && (
                  <Card className="p-5">
                    <ChartHeader
                      title={t('Hallazgo · conglomerado recurrente al occidente de Bogotá')}
                      scope="archive"
                      subtitle={`${cluster.inTop9}/${cluster.topOf} ${t('de las coordenadas más recurrentes del archivo caen en una caja de ~22 × 22 km')}`}
                      infoId="conglomerado"
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                      <div className="lg:col-span-2 flex flex-col">
                        <div className="grid grid-cols-3 gap-3 mb-3.5">
                          {[
                            { n: fmtNum(cluster.points.length), l: t('coordenadas recurrentes en la caja'), c: '#0f172a' },
                            { n: fmtNum(cluster.focos), l: t('focos acumulados en ellas'), c: FIRE_BARS[4] },
                            { n: `${cluster.inTop9}/${cluster.topOf}`, l: t('de las más recurrentes del país'), c: FIRE_BARS[2] }
                          ].map(s => (
                            <div key={s.l} className="border border-slate-200 rounded-lg p-2.5">
                              <div className="text-[22px] font-black tabular-nums leading-none" style={{ color: s.c }}>{s.n}</div>
                              <div className="text-[10px] text-slate-500 mt-1 leading-snug">{s.l}</div>
                            </div>
                          ))}
                        </div>

                        <p className="text-[12px] text-slate-600 leading-relaxed">
{t('Entre')} <span className="font-mono text-slate-800">4,70–4,90 N</span> {t('y')}{' '}
                          <span className="font-mono text-slate-800">74,00–74,20 O</span>,{' '}
                          {t('justo al occidente de Bogotá, se concentra un grupo de celdas que arden en años distintos de forma sostenida. No es azar, y es el candidato más claro a intervención preventiva focalizada.')}
                        </p>

                        {/* Una línea, no un bloque: el texto completo ya vive en
                            el «Ojo con esto» del ⓘ de esta misma tarjeta, así
                            que repetirlo aquí era decir dos veces lo mismo. */}
                        <p className="flex items-start gap-2 mt-3 text-[11px] text-amber-900 leading-relaxed">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-px" />
                          <span>
{t('Se define por su caja de coordenadas, no por municipio: los nombres que trae el archivo (Ricaurte, Nilo, Tocaima) quedan a 50–75 km de aquí.')}
                          </span>
                        </p>
                      </div>

                      <div className="lg:col-span-3 border border-slate-200 rounded-lg overflow-hidden min-h-[340px]">
                        <ClusterMiniMap cluster={cluster} />
                      </div>
                    </div>
                    <PlainLine id="conglomerado" />
                  </Card>
                )}
                <Card className="p-5">
                  <ChartHeader
                    title={t("Puntos críticos recurrentes")}
                    scope="partial"
                    subtitle={
                      depts.length > 0
                        ? `${t('Las')} ${recurrenceData.length} ${t('primeras de')} ${deptLabel(depts[0])}${depts.length > 1 ? ` ${t('y otros')}` : ''} · ${fmtNum(recurrenceTotal)} ${t('identificadas en todo el archivo')}`
                        : `${t('Coordenadas con fuegos en 2 o más años distintos')} · ${fmtNum(recurrenceTotal)} ${t('identificadas en el archivo')}`
                    }
                    infoId="recurrentes"
                    right={(
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded whitespace-nowrap">
                        {t('Orden: años afectados ↓')}
                      </span>
                    )}
                  />

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                          <th className="py-2 pr-3">{t('Coordenadas')}</th>
                          <th className="py-2 pr-3">{t('Municipio')}</th>
                          <th className="py-2 pr-3">{t('Departamento')}</th>
                          <th className="py-2 pr-3 text-right">{t('Años')}</th>
                          <th className="py-2 pr-3 text-right">{t('Focos')}</th>
                          <th className="py-2">{t('Años registrados')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recurrenceData.map((item, idx) => (
                          <tr key={`${item.coord}-${idx}`} className="hover:bg-slate-50">
                            <td className="py-2 pr-3 font-mono text-slate-400">{item.coord}</td>
                            <td className="py-2 pr-3 font-semibold text-slate-900">{munLabel(item.mun)}</td>
                            <td className="py-2 pr-3">
                              <button type="button" onClick={() => toggleDept(item.dept)} className="text-slate-600 hover:text-emerald-800 hover:underline cursor-pointer">
                                {t(deptLabel(item.dept))}
                              </button>
                            </td>
                            <td className="py-2 pr-3 text-right font-mono font-bold text-slate-700 tabular-nums">{item.years_count}</td>
                            <td className="py-2 pr-3 text-right font-mono font-bold tabular-nums" style={{ color: FIRE_BARS[4] }}>{item.count}</td>
                            <td className="py-2 text-[10px] text-slate-400 font-mono">{item.years_list.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PlainLine id="recurrentes" />
                </Card>
              </div>
            )}
          </>
        )}

      </div>

      {/* ---- Cierre del tablero ----
          Banda propia, a sangre completa y sobre otra superficie: es lo que
          separa "la herramienta" de "cómo se hizo la herramienta". Las notas y
          los datos abiertos no son una pestaña — van siempre visibles, en
          cualquier pestaña y también cuando los filtros no dejan registros,
          que es justo cuando alguien necesita leer cómo se construyó esto. */}
      <div className="mt-16 border-t border-slate-200 bg-[#F1EFE9]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-12 md:py-16 flex flex-col gap-6">
          <SectionCard
            accent={SECTION_ACCENTS.method}
            eyebrow={t("Antes de citar estas cifras")}
            title={t("Notas metodológicas")}
            subtitle={`${METHOD_NOTES_L.length} ${t('advertencias que cambian lo que significan los números de arriba. Ninguna es un detalle menor: la primera separa «foco de calor» de «incendio», y la cuarta explica por qué comparar años entre sí puede llevar a conclusiones falsas.')}`}
            action={(
              <button
                type="button"
                onClick={() => openGlossary()}
                className="group flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-emerald-900 cursor-pointer border border-slate-300 hover:border-emerald-700 hover:bg-emerald-50 rounded-lg px-3 py-2 transition-all shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                {t('Abrir glosario completo')}
              </button>
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              {METHOD_NOTES_L.map(note => (
                <div
                  key={note.title}
                  className="group border-l-2 border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 pl-3.5 pr-2 py-2.5 rounded-r-md transition-colors duration-200"
                >
                  <p className="text-[11.5px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-900 group-hover:text-amber-900 transition-colors">{note.title}</strong>{' '}
                    <RichText text={note.body} />
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            id="datos-abiertos"
            accent={SECTION_ACCENTS.data}
            eyebrow={t("Descarga y reutilización")}
            title={t("Datos abiertos")}
            subtitle={t('Este tablero se construyó sobre un archivo que armamos nosotros, cruzando registros históricos de incendios con la cartografía de ecosistemas del IDEAM y del IAvH. Lo publicamos con fines abiertos: descárgalo y úsalo para lo que necesites —investigación, docencia, planeación o periodismo—. Si te sirve, cítanos.')}
            action={(
              <span className="flex items-center gap-1.5 text-[11px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1.5 rounded-lg shrink-0">
                <Check className="w-3.5 h-3.5" />
                {t('Uso libre')}
              </span>
            )}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {[
                {
                  href: '/resultado_incendios_IDEAM.xlsx',
                  download: true,
                  icon: FileSpreadsheet,
                  iconClass: 'text-emerald-700',
                  cue: Download,
                  title: t('Archivo de investigación'),
                  desc: `${t('Excel con los')} ${fmtNum(archive.total)} ${t('registros y sus 12 columnas biofísicas. 787 KB.')}`,
                  tag: 'XLSX · 787 KB'
                },
                {
                  href: '/ideam_data.json',
                  download: true,
                  icon: FileSpreadsheet,
                  iconClass: 'text-slate-400',
                  cue: Download,
                  title: t('Versión procesada'),
                  desc: t('El JSON que consume este tablero, ya normalizado y con el índice de recurrencia.'),
                  tag: 'JSON'
                },
                {
                  href: 'https://github.com/alejandrobarrera-wq/Caso-de-estudio-sobre-incedios-forestales-en-Colombia',
                  external: true,
                  icon: BookOpen,
                  iconClass: 'text-slate-400',
                  cue: ExternalLink,
                  title: t('Cómo se construyó'),
                  desc: t('Repositorio con el cuaderno de procesamiento geoespacial: validación de coordenadas, reproyección a MAGNA-SIRGAS y cruce espacial con los polígonos de ecosistemas.'),
                  tag: t('Repositorio')
                }
              ].map(item => {
                const Icon = item.icon;
                const Cue = item.cue;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    {...(item.download ? { download: true } : {})}
                    {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="group relative overflow-hidden bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-1.5
                               hover:border-emerald-700 hover:bg-emerald-50/40 hover:shadow-md hover:-translate-y-0.5
                               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700
                               transition-all duration-200"
                  >
                    {/* El filete que se pinta al pasar el cursor: dice «esto se puede tocar». */}
                    <span
                      className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      style={{ background: SECTION_ACCENTS.data.rule }}
                    />
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-[12.5px]">
                      <Icon className={`w-4 h-4 shrink-0 ${item.iconClass} group-hover:text-emerald-700 transition-colors`} />
                      {item.title}
                      <Cue className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 ml-auto shrink-0 transition-all" />
                    </div>
                    <span className="text-[11px] text-slate-500 leading-snug">{item.desc}</span>
                    <span className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-slate-400 group-hover:text-emerald-800 transition-colors">
                      {item.tag}
                    </span>
                  </a>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <div className="group border-l-2 border-slate-200 hover:border-emerald-700 hover:bg-emerald-50/40 pl-3.5 pr-2 py-2.5 rounded-r-md transition-colors duration-200">
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 group-hover:text-emerald-900 transition-colors">{t('Fuentes que se cruzaron.')}</strong>{' '}
                  <RichText text={t("Registros históricos de incendios de la UNGRD, detecciones térmicas de NASA FIRMS (MODIS, NOAA-20, Suomi NPP) y la cartografía de ecosistemas del IDEAM / IAvH. El cruce espacial es lo que añade a cada registro su bioma, [[ecosistema-de-sintesis|ecosistema de síntesis]], clima, [[paisaje]], [[relieve]] y suelos.")} />
                </p>
              </div>
              <div className="group border-l-2 border-slate-200 hover:border-emerald-700 hover:bg-emerald-50/40 pl-3.5 pr-2 py-2.5 rounded-r-md transition-colors duration-200">
                <p className="text-[11.5px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 group-hover:text-emerald-900 transition-colors">{t('Cómo citarlo.')}</strong>{' '}
{t('«Observatorio de Incendios IDEAM — Team Colombia (FGC 2026). Archivo derivado de UNGRD, NASA FIRMS e IDEAM/IAvH.» Los datos de origen son públicos y de sus respectivas entidades; lo que aquí se publica es el cruce y la normalización.')}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
