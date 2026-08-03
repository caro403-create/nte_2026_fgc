import { useEffect, useMemo, useState } from 'react';
import {
  Bell, Send, Check, X, ChevronDown, Lock, RefreshCw,
  MapPin, ShieldCheck, Database, Clock, AlertTriangle
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { ALERTS_SEED } from '../utils/alertsSeed';

// Tema "consola de operaciones": casi negro con acentos de brasa. El panel es
// una superficie oscura dentro del tablero claro — la sala de crisis del sistema.
// Paleta (las clases de Tailwind necesitan el hex literal, va aquí de referencia):
//   fondo #0B0F0E · superficie #141A18 · elevada #1A211E · borde #232C29
//   texto #E8EDEA · apagado #8A9691 · acento brasa #FF6B35 · ok #52B788

// Niveles del sistema de fusión sensorial (mismos umbrales del semáforo global),
// recalibrados para leerse sobre fondo oscuro.
const LEVELS = {
  critica:    { es: 'Crítica',    en: 'Critical', color: '#FF5A47', soft: 'rgba(255,90,71,0.09)' },
  alerta:     { es: 'Alerta',     en: 'Alert',    color: '#FF9F43', soft: 'rgba(255,159,67,0.08)' },
  vigilancia: { es: 'Vigilancia', en: 'Watch',    color: '#FFD166', soft: 'rgba(255,209,102,0.07)' },
  info:       { es: 'Info',       en: 'Info',     color: '#52B788', soft: 'rgba(82,183,136,0.07)' }
};

const STATUS = {
  nueva:       { es: 'Nueva',       en: 'New' },
  en_atencion: { es: 'En atención', en: 'In progress' },
  resuelta:    { es: 'Resuelta',    en: 'Resolved' },
  descartada:  { es: 'Descartada',  en: 'Dismissed' }
};

// Los sentidos y las etiquetas vienen en español desde la BD.
const SENSE_EN = {
  'olfato': 'smell', 'tacto': 'touch', 'oído': 'hearing', 'vista': 'sight',
  'intuición': 'context', 'diagnóstico': 'diagnostics', 'comunidad': 'community'
};
const LABEL_EN = {
  'CO (MQ135)': 'CO (MQ135)', 'PM2.5': 'PM2.5', 'PM10': 'PM10',
  'Temp. contacto': 'Contact temp.', 'Temp. aire': 'Air temp.',
  'Humedad suelo': 'Soil moisture', 'Humedad aire': 'Air humidity',
  'Nivel sonoro': 'Sound level', 'Viento': 'Wind', 'NDVI': 'NDVI',
  'Clasificación cámara': 'Camera classification', 'Batería': 'Battery',
  'RSSI': 'RSSI', 'SNR': 'SNR', 'Nodos activos': 'Active nodes',
  'Tramas recibidas': 'Frames received', 'Reportes confirmados': 'Confirmed reports',
  'Distancia al foco': 'Distance to hotspot', 'Confianza FIRMS': 'FIRMS confidence'
};

const FILTERS = [
  { id: 'todas',       es: 'Todas',       en: 'All' },
  { id: 'nueva',       es: 'Nuevas',      en: 'New' },
  { id: 'en_atencion', es: 'En atención', en: 'In progress' },
  { id: 'cerradas',    es: 'Cerradas',    en: 'Closed' }
];

const timeAgo = (iso, isEn) => {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return isEn ? `${mins} min ago` : `hace ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return isEn ? `${hrs} h ago` : `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  return isEn ? `${days} d ago` : `hace ${days} d`;
};

const clockOf = (iso) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Cuántas veces por encima (o por debajo) de su línea base está la lectura.
const deviation = (value, base) => {
  if (!base) return null;
  const ratio = value / base;
  if (ratio >= 1.3) return `×${ratio.toFixed(1)}`;
  if (ratio <= 0.7) return `−${Math.round((1 - ratio) * 100)}%`;
  return null;
};

// Un reporte que entra por el bot de Telegram (tabla `alerts`) se normaliza
// a la misma forma que un evento de fusión sensorial para poder mostrarlos
// juntos en la misma bandeja.
const fromTelegram = (r) => ({
  id: `tg-${r.id}`,
  origin: 'telegram',
  node_code: 'TELEGRAM',
  node_name: r.source || 'Bot de Telegram',
  location: r.location || 'Reporte comunitario',
  lat: null, lng: null,
  level: r.type === 'danger' ? 'alerta' : r.type === 'warning' ? 'vigilancia' : 'info',
  score: 0,
  rule: 'reporte ciudadano vía Telegram',
  message: r.message,
  message_en: r.message,
  evidence: [],
  status: r.processed ? 'resuelta' : 'nueva',
  assigned_to: null,
  telegram_status: 'recibida',
  telegram_at: r.created_at,
  telegram_chat: r.telegram_chat_id ? `chat ${r.telegram_chat_id}` : null,
  created_at: r.created_at,
  resolved_at: null,
  raw_id: r.id
});

// Dos fuentes: los eventos de los nodos (`node_alerts`) y los reportes que
// llegan por el bot (`alerts`). Si `node_alerts` todavía no está migrada,
// se usa la siembra local para que la vista siga siendo demostrable.
const fetchAlerts = async () => {
  const [nodeRes, tgRes] = await Promise.allSettled([
    supabase.from('node_alerts').select('*').order('created_at', { ascending: false }).limit(50),
    supabase.from('alerts').select('*').order('created_at', { ascending: false }).limit(20)
  ]);

  const nodeRows = nodeRes.status === 'fulfilled' && !nodeRes.value.error && nodeRes.value.data?.length
    ? nodeRes.value.data.map(r => ({ ...r, origin: 'nodo' }))
    : null;

  const tgRows = tgRes.status === 'fulfilled' && !tgRes.value.error && tgRes.value.data?.length
    ? tgRes.value.data.map(fromTelegram)
    : [];

  const rows = [...(nodeRows || ALERTS_SEED), ...tgRows]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return { rows, source: nodeRows ? 'db' : 'demo' };
};

export default function AlertsPanel({ lang, isLoggedIn, isBrigadista, onOpenLogin, onSelectNode }) {
  const isEn = lang === 'en';
  const [alerts, setAlerts] = useState(ALERTS_SEED);
  const [source, setSource] = useState('demo'); // 'db' | 'demo'
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [openId, setOpenId] = useState(null);

  const apply = ({ rows, source: src }) => {
    setAlerts(rows);
    setSource(src);
    setLoading(false);
  };

  const load = async () => {
    setLoading(true);
    apply(await fetchAlerts());
  };

  useEffect(() => {
    let alive = true;
    fetchAlerts().then(result => { if (alive) apply(result); });
    return () => { alive = false; };
  }, []);

  const counts = useMemo(() => ({
    nueva: alerts.filter(a => a.status === 'nueva').length,
    en_atencion: alerts.filter(a => a.status === 'en_atencion').length,
    cerradas: alerts.filter(a => a.status === 'resuelta' || a.status === 'descartada').length,
    tgSent: alerts.filter(a => a.telegram_status === 'enviada').length,
    tgIn: alerts.filter(a => a.origin === 'telegram').length
  }), [alerts]);

  const visible = useMemo(() => {
    if (filter === 'todas') return alerts;
    if (filter === 'cerradas') return alerts.filter(a => a.status === 'resuelta' || a.status === 'descartada');
    return alerts.filter(a => a.status === filter);
  }, [alerts, filter]);

  const changeStatus = async (alert, status) => {
    if (!isLoggedIn) return onOpenLogin?.();
    if (!isBrigadista) return;

    const resolved_at = (status === 'resuelta' || status === 'descartada') ? new Date().toISOString() : null;
    setAlerts(prev => prev.map(a => (a.id === alert.id ? { ...a, status, resolved_at } : a)));

    if (alert.origin === 'telegram') {
      // El buzón del bot solo distingue procesado / sin procesar.
      await supabase.from('alerts').update({ processed: status !== 'nueva' }).eq('id', alert.raw_id);
    } else if (source === 'db') {
      await supabase.from('node_alerts').update({ status, resolved_at }).eq('id', alert.id);
    }
  };

  const canAct = isLoggedIn && isBrigadista;

  return (
    <div className="bg-[#0B0F0E] border border-[#232C29] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] overflow-hidden">

      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-[#232C29]">
        <div className="flex items-center gap-2.5">
          <span className="bg-[#FF6B35]/12 text-[#FF6B35] p-2 rounded-xl border border-[#FF6B35]/25">
            <Bell className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-[#E8EDEA] leading-tight tracking-wide">
              {isEn ? 'Alerts' : 'Alertas'}
            </h2>
            <p className="text-[11px] text-[#8A9691]">
              {isEn
                ? 'Sensor-fusion events from the 4 pilot nodes · Valle del Cauca'
                : 'Eventos de fusión sensorial de los 4 nodos del piloto · Valle del Cauca'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              source === 'db'
                ? 'text-[#52B788] border-[#52B788]/30 bg-[#52B788]/10'
                : 'text-[#FFD166] border-[#FFD166]/30 bg-[#FFD166]/10'
            }`}
            title={source === 'db'
              ? (isEn ? 'Live from node_alerts + the Telegram bot inbox' : 'En vivo desde node_alerts + el buzón del bot de Telegram')
              : (isEn ? 'Seed data — run the node_alerts migration to read from the database' : 'Datos sembrados — corre la migración node_alerts para leer de la base de datos')}
          >
            <Database className="h-3 w-3" />
            {source === 'db' ? (isEn ? 'DATABASE' : 'BASE DE DATOS') : (isEn ? 'SEED DATA' : 'DATOS SEMBRADOS')}
          </span>
          <button
            onClick={load}
            className="text-[#8A9691] hover:text-[#FF6B35] border border-[#232C29] hover:border-[#FF6B35]/40 hover:bg-[#1A211E] p-1.5 rounded-lg transition-colors cursor-pointer"
            title={isEn ? 'Refresh' : 'Actualizar'}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#232C29] border-b border-[#232C29]">
        {[
          { n: counts.nueva, es: 'Nuevas', en: 'New', color: '#FF5A47' },
          { n: counts.en_atencion, es: 'En atención', en: 'In progress', color: '#FF9F43' },
          { n: counts.cerradas, es: 'Cerradas', en: 'Closed', color: '#52B788' },
          { n: `${counts.tgSent} / ${counts.tgIn}`, es: 'Telegram enviadas / recibidas', en: 'Telegram sent / received', color: '#E8EDEA' }
        ].map(k => (
          <div key={k.es} className="bg-[#0B0F0E] px-4 py-3">
            <div className="text-xl font-extrabold font-mono" style={{ color: k.color }}>{k.n}</div>
            <div className="text-[10px] font-semibold text-[#8A9691] uppercase tracking-wider">
              {isEn ? k.en : k.es}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[#232C29] bg-[#0E1412]">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              filter === f.id
                ? 'bg-[#E8EDEA] text-[#0B0F0E] border-[#E8EDEA]'
                : 'bg-[#141A18] text-[#8A9691] border-[#232C29] hover:text-[#E8EDEA] hover:border-[#3A4642]'
            }`}
          >
            {isEn ? f.en : f.es}
          </button>
        ))}
        {!canAct && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-[#8A9691] font-medium">
            <Lock className="h-3 w-3" />
            {isEn ? 'Brigade credentials required to act on alerts' : 'Se requieren credenciales de brigada para actuar'}
          </span>
        )}
      </div>

      {/* Lista */}
      <div className="divide-y divide-[#1B2320] max-h-[560px] overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <ShieldCheck className="h-8 w-8 text-[#52B788] opacity-60" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#8A9691] font-mono">
              {isEn ? 'Nothing here' : 'Nada por aquí'}
            </span>
            <span className="text-[11px] text-[#8A9691]">
              {isEn ? 'No alerts match this filter.' : 'No hay alertas con este filtro.'}
            </span>
          </div>
        ) : visible.map(a => {
          const lv = LEVELS[a.level] || LEVELS.info;
          const open = openId === a.id;
          const closed = a.status === 'resuelta' || a.status === 'descartada';

          return (
            <div key={a.id} className="relative" style={{ background: open ? lv.soft : undefined }}>
              <span className="absolute left-0 top-0 bottom-0 w-1" style={{ background: lv.color }} />

              {/* Fila */}
              <button
                onClick={() => setOpenId(open ? null : a.id)}
                className="w-full text-left px-5 py-3.5 pl-6 hover:bg-[#141A18] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-[#0B0F0E]"
                      style={{ background: lv.color }}
                    >
                      {isEn ? lv.en : lv.es}
                    </span>
                    {a.origin === 'telegram' ? (
                      <span className="text-[10px] font-bold text-[#52B788] bg-[#52B788]/10 border border-[#52B788]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Send className="h-3 w-3" />
                        {isEn ? 'Citizen report' : 'Reporte ciudadano'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#E8EDEA] font-mono">{a.node_code}</span>
                    )}
                    <span className="text-xs text-[#8A9691] truncate">{a.node_name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      closed
                        ? 'text-[#8A9691] border-[#232C29] bg-[#141A18]'
                        : 'text-[#E8EDEA] border-[#3A4642] bg-[#1A211E]'
                    }`}>
                      {isEn ? STATUS[a.status]?.en : STATUS[a.status]?.es}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[#8A9691]">
                    {a.telegram_status !== 'no_aplica' && (
                      <span
                        className="flex items-center gap-1 text-[10px] font-bold"
                        style={{ color: a.telegram_status === 'fallida' ? '#FF5A47' : a.telegram_status === 'pendiente' ? '#FF9F43' : '#52B788' }}
                        title={a.telegram_chat || ''}
                      >
                        <Send className="h-3 w-3" />
                        {a.telegram_status === 'enviada'
                          ? (isEn ? 'Sent' : 'Enviada')
                          : a.telegram_status === 'recibida'
                            ? (isEn ? 'Received' : 'Recibida')
                            : a.telegram_status === 'fallida'
                              ? (isEn ? 'Queued (no signal)' : 'En cola (sin señal)')
                              : (isEn ? 'Pending' : 'Pendiente')}
                      </span>
                    )}
                    <span className="text-[10px] font-mono whitespace-nowrap">{timeAgo(a.created_at, isEn)}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                <p className="text-[12.5px] text-[#C8D2CD] mt-1.5 leading-snug">
                  {isEn ? (a.message_en || a.message) : a.message}
                </p>

                {/* Evidencia resumida */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(a.evidence || []).slice(0, open ? 99 : 4).map((e, i) => {
                    const dev = deviation(e.value, e.base);
                    return (
                      <span key={i} className="text-[10px] font-mono bg-[#141A18] border border-[#232C29] rounded-lg px-2 py-0.5 text-[#8A9691]">
                        <span className="text-[#E8EDEA] font-bold">
                          {isEn ? (LABEL_EN[e.label] || e.label) : e.label}
                        </span>{' '}
                        {e.value}{e.unit ? ` ${e.unit}` : ''}
                        {dev && <span className="text-[#FF6B35] font-bold"> {dev}</span>}
                      </span>
                    );
                  })}
                </div>
              </button>

              {/* Detalle */}
              {open && (
                <div className="px-6 pb-4 -mt-1 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-[#141A18] border border-[#232C29] rounded-xl p-3">
                      <span className="text-[10px] font-bold text-[#8A9691] uppercase tracking-wider block mb-1">
                        {isEn ? 'Fusion score' : 'Score de fusión'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-[#232C29] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${a.score * 100}%`, background: lv.color }} />
                        </div>
                        <span className="text-xs font-extrabold text-[#E8EDEA] font-mono">{a.score}</span>
                      </div>
                      <span className="text-[10px] text-[#8A9691] mt-1 block font-mono">{a.rule}</span>
                    </div>

                    <div className="bg-[#141A18] border border-[#232C29] rounded-xl p-3">
                      <span className="text-[10px] font-bold text-[#8A9691] uppercase tracking-wider block mb-1">
                        {isEn ? 'Location' : 'Ubicación'}
                      </span>
                      <span className="text-xs text-[#E8EDEA] font-semibold block">{a.location}</span>
                      <span className="text-[10px] font-mono text-[#8A9691]">{a.lat}, {a.lng}</span>
                    </div>

                    <div className="bg-[#141A18] border border-[#232C29] rounded-xl p-3">
                      <span className="text-[10px] font-bold text-[#8A9691] uppercase tracking-wider block mb-1">
                        {isEn ? 'Dispatch' : 'Despacho'}
                      </span>
                      <span className="text-xs text-[#E8EDEA] font-semibold block">
                        {a.telegram_status === 'no_aplica'
                          ? (isEn ? 'No dispatch (below red level)' : 'Sin despacho (bajo nivel rojo)')
                          : a.telegram_status === 'recibida'
                            ? (isEn ? 'Inbound from the Telegram bot' : 'Entrante desde el bot de Telegram')
                            : a.telegram_chat}
                      </span>
                      <span className="text-[10px] font-mono text-[#8A9691]">
                        {a.telegram_at ? `${clockOf(a.telegram_at)} · ${a.assigned_to || (isEn ? 'unassigned' : 'sin asignar')}` : (a.assigned_to || '—')}
                      </span>
                    </div>
                  </div>

                  {/* Evidencia detallada por sentido */}
                  {(a.evidence || []).length > 0 && (
                  <div className="bg-[#141A18] border border-[#232C29] rounded-xl overflow-hidden">
                    <div className="px-3 py-2 border-b border-[#232C29] text-[10px] font-bold text-[#8A9691] uppercase tracking-wider">
                      {isEn ? 'Sensor evidence vs. node baseline' : 'Evidencia del sensor vs. línea base del nodo'}
                    </div>
                    {(a.evidence || []).map((e, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#1B2320] last:border-0">
                        <span className="text-[10px] font-mono uppercase text-[#52B788] font-bold w-24 shrink-0">
                          {isEn ? (SENSE_EN[e.sense] || e.sense) : e.sense}
                        </span>
                        <span className="text-xs text-[#C8D2CD] flex-1 truncate">
                          {isEn ? (LABEL_EN[e.label] || e.label) : e.label}
                        </span>
                        <span className="text-xs font-mono text-[#8A9691]">
                          {isEn ? 'base' : 'base'} {e.base}{e.unit ? ` ${e.unit}` : ''}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#E8EDEA] w-24 text-right">
                          {e.value}{e.unit ? ` ${e.unit}` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap items-center gap-2">
                    {a.status === 'nueva' && (
                      <button
                        onClick={() => changeStatus(a, 'en_atencion')}
                        disabled={!canAct}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#FF6B35] text-[#0B0F0E] hover:bg-[#FF8355] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {!canAct && <Lock className="h-3 w-3" />}
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {isEn ? 'Take it' : 'Atender'}
                      </button>
                    )}
                    {!closed && (
                      <>
                        <button
                          onClick={() => changeStatus(a, 'resuelta')}
                          disabled={!canAct}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#52B788]/40 text-[#52B788] hover:bg-[#52B788]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {isEn ? 'Resolve' : 'Resolver'}
                        </button>
                        <button
                          onClick={() => changeStatus(a, 'descartada')}
                          disabled={!canAct}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#232C29] text-[#8A9691] hover:text-[#E8EDEA] hover:bg-[#1A211E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <X className="h-3.5 w-3.5" />
                          {isEn ? 'Dismiss' : 'Descartar'}
                        </button>
                      </>
                    )}
                    {onSelectNode && a.origin !== 'telegram' && (
                      <button
                        onClick={() => onSelectNode(a.node_code)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg border border-[#232C29] text-[#8A9691] hover:text-[#E8EDEA] hover:bg-[#1A211E] transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        {isEn ? 'View node' : 'Ver nodo'}
                      </button>
                    )}
                    {closed && a.resolved_at && (
                      <span className="text-[10px] text-[#8A9691] font-mono flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        {isEn ? 'Closed' : 'Cerrada'} {clockOf(a.resolved_at)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
