import React from 'react';
import { Bell, AlertTriangle, ShieldCheck, Info, Radio, Eye, Lock, RefreshCw, Trash2 } from 'lucide-react';
import { translations } from '../utils/translations';

export default function AlertsAndActions({
  alerts,
  clearAlerts,
  onTriggerSimulatedAlert,
  isLoggedIn,
  isBrigadista,
  onOpenLogin,
  onOpenReport,
  lang
}) {
  const t = translations[lang || 'es'];

  // Categorized icons based on alert source string matching
  const getIconForSource = (source) => {
    const s = source.toLowerCase();
    if (s.includes('nodo') || s.includes('sensor')) return Radio;
    if (s.includes('satélite') || s.includes('nasa')) return Eye;
    if (s.includes('sistema') || s.includes('central')) return ShieldCheck;
    if (s.includes('ciudadan') || s.includes('públic') || s.includes('avistamiento')) return AlertTriangle;
    return Info;
  };

  const getLatestSummary = () => {
    if (alerts.length === 0) return lang === 'en' ? "Everything is calm at this moment." : "Todo está tranquilo en este momento.";
    const latest = alerts[0];
    if (latest.type === 'danger') return lang === 'en' ? "Warning! A critical alert has been logged." : "¡Atención! Hay un reporte crítico reciente.";
    if (latest.type === 'warning') return lang === 'en' ? "Caution: System is monitoring an anomaly." : "Precaución: El sistema está monitoreando una anomalía.";
    return lang === 'en' ? "System is operating normally." : "El sistema está funcionando con normalidad.";
  };

  const handleProtectedAction = (actionFn) => {
    if (!isLoggedIn) {
      onOpenLogin();
    } else if (!isBrigadista) {
      alert(lang === 'en'
        ? "Access Denied: This operational action requires official Brigade or Coordinator credentials."
        : "Acceso denegado: Esta acción de operación requiere credenciales oficiales de Brigadista o Coordinador.");
    } else {
      actionFn();
    }
  };

  const showLock = !isLoggedIn || !isBrigadista;

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 flex flex-col gap-5 h-full shadow-[0_2px_12px_rgba(0,0,0,0.07)] text-left">
      
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#EEF5E9] pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#2D6A4F]" />
          <h2 className="text-md font-bold text-[#2D3436]">
            {lang === 'en' ? "Operations Center & Alerts" : "Centro de Operaciones y Alertas"}
          </h2>
        </div>
        <button
          onClick={() => handleProtectedAction(clearAlerts)}
          className="text-xs text-[#636E72] hover:text-red-600 border border-[#EEF5E9] hover:bg-[#F8FAF5] px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1"
        >
          {showLock && <Lock className="h-3 w-3 text-slate-400" />}
          <Trash2 className="h-3.5 w-3.5" />
          {lang === 'en' ? "Clear logs" : "Limpiar registros"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[160px] overflow-hidden">
        
        {/* Operations Command Menu */}
        <div className="flex flex-col gap-4 justify-center bg-[#F8FAF5] border border-[#EEF5E9] rounded-2xl p-5 text-left">
          <span className="text-xs font-bold text-[#636E72] font-mono tracking-wider block uppercase">
            {lang === 'en' ? "BRIGADE SYSTEMS SIMULATOR" : "SIMULADOR DE SISTEMAS - BRIGADA"}
          </span>

          <p className="text-[11px] text-slate-500 leading-normal font-light">
            {lang === 'en'
              ? "Simulate sensor failures, extreme temperatures or risk events. Verify immediate automated Telegram alarms and telemetry updates."
              : "Simula fallas en sensores, picos térmicos de riesgo o eventos de peligro forestal. Verifica las alertas de Telegram automáticas y actualizaciones de telemetría."}
          </p>

          <button
            onClick={() => handleProtectedAction(onTriggerSimulatedAlert)}
            className="w-full bg-[#2D6A4F] hover:bg-[#1E4635] text-white py-3 rounded-xl font-bold uppercase transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {showLock && <Lock className="h-3.5 w-3.5 text-white/70" />}
            <RefreshCw className="h-4 w-4" />
            <span>{lang === 'en' ? "Simulate Risk Event" : "Simular Evento de Riesgo"}</span>
          </button>

          {/* Access indicator */}
          <div className="border-t border-[#EEF5E9] pt-3 mt-1 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${isLoggedIn ? (isBrigadista ? 'bg-[#52B788]' : 'bg-amber-400') : 'bg-slate-300'}`}></span>
            <span>
              {isLoggedIn 
                ? (isBrigadista 
                  ? (lang === 'en' ? "Coordinators Mode: Full Access" : "Modo Coordinador: Acceso Total") 
                  : (lang === 'en' ? "Community Mode: Read-Only Simulation" : "Modo Comunidad: Simulación Deshabilitada"))
                : (lang === 'en' ? "Guest Mode: Read-Only" : "Modo Invitado: Solo Lectura")}
            </span>
          </div>
        </div>

        {/* Timeline Log Lists */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
            {/* Unlocked public report button */}
            <button
              onClick={onOpenReport}
              className="text-[10px] bg-[#E63946] hover:bg-[#C92A3A] text-white px-3.5 py-1.5 rounded-lg transition-colors font-bold shadow-sm flex items-center gap-1 cursor-pointer w-full"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {t.reportBtn || (lang === 'en' ? "Report Emergency / Sighting" : "Reportar Avistamiento / Emergencia")}
            </button>
          </div>
          
          <div className="bg-[#F8FAF5] rounded-2xl border border-[#EEF5E9] p-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Contextual Banner */}
            <div className="bg-white border border-[#EEF5E9] rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 shrink-0">
              <div className="bg-[#EEF5E9] text-[#2D6A4F] p-2 rounded-lg">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#636E72] block uppercase tracking-wider font-mono">
                  {lang === 'en' ? "TERRITORY STATUS" : "¿Qué está pasando?"}
                </span>
                <span className="text-xs font-bold text-[#2D3436] mt-0.5 block">{getLatestSummary()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#636E72] gap-3 py-6">
                  <ShieldCheck className="h-8 w-8 text-[#52B788] opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">
                    {lang === 'en' ? "ALL SECURE" : "Todo tranquilo"}
                  </span>
                  <span className="text-[11px] font-light">
                    {lang === 'en' ? "No anomalies detected or reported." : "No hay eventos recientes para mostrar."}
                  </span>
                </div>
              ) : (
                alerts.map((alert) => {
                  let statusBg = 'bg-white border-[#EEF5E9] text-[#636E72]';
                  let iconColor = 'text-[#2D6A4F] bg-[#EEF5E9]';
                  
                  if (alert.type === 'danger') {
                    statusBg = 'bg-[#E63946]/5 border-[#E63946]/20 text-[#2D3436]';
                    iconColor = 'text-[#E63946] bg-[#E63946]/10';
                  } else if (alert.type === 'warning') {
                    statusBg = 'bg-[#F4A261]/5 border-[#F4A261]/20 text-[#2D3436]';
                    iconColor = 'text-[#F4A261] bg-[#F4A261]/10';
                  } else if (alert.type === 'success') {
                    statusBg = 'bg-[#52B788]/5 border-[#52B788]/20 text-[#2D3436]';
                    iconColor = 'text-[#52B788] bg-[#EEF5E9]';
                  } else if (alert.type === 'info') {
                    statusBg = 'bg-white border-[#EEF5E9] text-[#2D3436]';
                    iconColor = 'text-[#2D6A4F] bg-[#EEF5E9]';
                  }

                  const DynamicIcon = getIconForSource(alert.source);

                  return (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 shadow-sm ${statusBg}`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
                        <DynamicIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-[#2D3436]">
                            {alert.source}
                          </span>
                          <span className="text-[10px] font-bold text-[#636E72]">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed font-light opacity-90">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
