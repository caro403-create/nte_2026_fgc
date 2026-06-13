import React from 'react';
import { Send, Map, Volume2, Bell, AlertTriangle, ShieldCheck, Info, Plane, Radio, Eye } from 'lucide-react';

export default function AlertsAndActions({
  alerts,
  clearAlerts,
  droneActive,
  setDroneActive,
  evacRoutesActive,
  setEvacRoutesActive,
  acousticAlertActive,
  setAcousticAlertActive,
  onTriggerSimulatedAlert
}) {
  
  // Categorized icons based on alert source string matching
  const getIconForSource = (source) => {
    const s = source.toLowerCase();
    if (s.includes('dron')) return Plane;
    if (s.includes('nodo') || s.includes('sensor')) return Radio;
    if (s.includes('satélite') || s.includes('nasa')) return Eye;
    if (s.includes('acústic') || s.includes('sirena')) return Volume2;
    if (s.includes('sistema') || s.includes('central')) return ShieldCheck;
    return Info;
  };

  const getLatestSummary = () => {
    if (alerts.length === 0) return "Todo está tranquilo en este momento.";
    const latest = alerts[0];
    if (latest.type === 'danger') return "¡Atención! Hay un reporte crítico reciente.";
    if (latest.type === 'warning') return "Precaución: El sistema está monitoreando una anomalía.";
    return "El sistema está funcionando con normalidad.";
  };

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 flex flex-col gap-5 h-full shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-[#EEF5E9] pb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#2D6A4F]" />
          <h2 className="text-lg font-bold text-[#2D3436]">
            Alertas y Acciones Inmediatas
          </h2>
        </div>
        <button
          onClick={clearAlerts}
          className="text-xs text-[#636E72] hover:text-[#2D3436] border border-[#EEF5E9] hover:bg-[#F8FAF5] px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold"
        >
          Limpiar registros
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[160px] overflow-hidden">
        
        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-3 justify-center">
          <span className="text-xs font-bold text-[#636E72] mb-1">
            ACCIONES RÁPIDAS
          </span>

          {/* Action 1: Drone Reconnaissance */}
          <button
            onClick={() => setDroneActive(!droneActive)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
              droneActive
                ? 'bg-[#EEF5E9] border-[#52B788] text-[#2D6A4F] shadow-sm'
                : 'bg-[#F8FAF5] border-[#EEF5E9] text-[#636E72] hover:border-[#52B788]/50 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${droneActive ? 'bg-[#52B788] text-white' : 'bg-[#EEF5E9] text-[#52B788] group-hover:bg-[#52B788] group-hover:text-white transition-colors'}`}>
                <Plane className="h-5 w-5" />
              </div>
              <div>
                <span className={`font-bold block text-sm ${droneActive ? 'text-[#2D6A4F]' : 'text-[#2D3436]'}`}>Enviar Dron de Reconocimiento</span>
                <span className="text-xs opacity-80 font-medium mt-0.5 block">Inspección aérea de la zona</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-[#EEF5E9] pl-4">
              <span className={`w-2 h-2 rounded-full ${droneActive ? 'bg-[#52B788] animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="text-xs font-bold">{droneActive ? 'EN VUELO' : 'ESPERA'}</span>
            </div>
          </button>

          {/* Action 2: Evacuation Routes */}
          <button
            onClick={() => setEvacRoutesActive(!evacRoutesActive)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
              evacRoutesActive
                ? 'bg-[#EEF5E9] border-[#52B788] text-[#2D6A4F] shadow-sm'
                : 'bg-[#F8FAF5] border-[#EEF5E9] text-[#636E72] hover:border-[#52B788]/50 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${evacRoutesActive ? 'bg-[#52B788] text-white' : 'bg-[#EEF5E9] text-[#52B788] group-hover:bg-[#52B788] group-hover:text-white transition-colors'}`}>
                <Map className="h-5 w-5" />
              </div>
              <div>
                <span className={`font-bold block text-sm ${evacRoutesActive ? 'text-[#2D6A4F]' : 'text-[#2D3436]'}`}>Ver Rutas de Evacuación</span>
                <span className="text-xs opacity-80 font-medium mt-0.5 block">Trazar caminos seguros en el mapa</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-[#EEF5E9] pl-4">
              <span className={`w-2 h-2 rounded-full ${evacRoutesActive ? 'bg-[#52B788] animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="text-xs font-bold">{evacRoutesActive ? 'ACTIVO' : 'OCULTO'}</span>
            </div>
          </button>

          {/* Action 3: Bioacoustic Alert */}
          <button
            onClick={() => setAcousticAlertActive(!acousticAlertActive)}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 text-left cursor-pointer group ${
              acousticAlertActive
                ? 'bg-[#E63946]/10 border-[#E63946]/30 text-[#E63946] shadow-sm'
                : 'bg-[#F8FAF5] border-[#EEF5E9] text-[#636E72] hover:border-[#E63946]/30 hover:bg-white hover:text-[#E63946]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg transition-colors ${acousticAlertActive ? 'bg-[#E63946] text-white' : 'bg-[#E63946]/10 text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white'}`}>
                <Volume2 className="h-5 w-5" />
              </div>
              <div>
                <span className={`font-bold block text-sm ${acousticAlertActive ? 'text-[#E63946]' : 'text-[#2D3436]'}`}>Activar Alerta Sonora</span>
                <span className="text-xs opacity-80 font-medium mt-0.5 block">Ahuyentar fauna en peligro</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-l border-[#EEF5E9] pl-4">
              <span className={`w-2 h-2 rounded-full ${acousticAlertActive ? 'bg-[#E63946] animate-ping' : 'bg-slate-300'}`}></span>
              <span className="text-xs font-bold">{acousticAlertActive ? 'SONANDO' : 'ESPERA'}</span>
            </div>
          </button>
        </div>

        {/* Timeline Log Lists */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#636E72]">
              LÍNEA DE EVENTOS
            </span>
            <button
              onClick={onTriggerSimulatedAlert}
              className="text-xs bg-[#EEF5E9] hover:bg-[#52B788] text-[#2D6A4F] hover:text-white border border-[#52B788]/20 px-3 py-1.5 rounded-lg transition-colors font-bold shadow-sm"
            >
              + Simular Evento
            </button>
          </div>
          
          <div className="bg-[#F8FAF5] rounded-2xl border border-[#EEF5E9] p-4 flex-1 flex flex-col overflow-hidden">
            
            {/* Contextual Banner */}
            <div className="bg-white border border-[#EEF5E9] rounded-xl p-3 mb-3 shadow-sm flex items-center gap-3 shrink-0">
              <div className="bg-[#EEF5E9] text-[#2D6A4F] p-2 rounded-lg">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#636E72] block">¿Qué está pasando?</span>
                <span className="text-sm font-bold text-[#2D3436]">{getLatestSummary()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[#636E72] gap-3 py-6">
                  <ShieldCheck className="h-8 w-8 text-[#52B788] opacity-50" />
                  <span className="text-sm font-bold">Todo tranquilo</span>
                  <span className="text-xs">No hay eventos recientes para mostrar.</span>
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
                        <p className="text-xs leading-relaxed font-medium opacity-90">
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
