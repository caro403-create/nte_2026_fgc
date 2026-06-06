/* eslint-disable no-unused-vars */
import React from 'react';
import { Send, Map, Volume2, Bell, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

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
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 h-full shadow-xs">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4.5 w-4.5 text-amber-500" />
          <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase m-0 font-sans">
            ALERTAS Y ACCIONES INMEDIATAS
          </h2>
        </div>
        <button
          onClick={clearAlerts}
          className="text-[10px] font-mono text-slate-500 hover:text-slate-800 border border-gray-200 hover:border-gray-300 px-2 py-0.5 rounded transition-all cursor-pointer font-medium"
        >
          LIMPIAR REGISTROS
        </button>
      </div>

      {/* Main Grid: Left is Action buttons, Right is Timeline logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 min-h-[160px] overflow-hidden">
        
        {/* Quick Action Buttons (Misiones Críticas) */}
        <div className="flex flex-col gap-3 justify-center">
          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider mb-0.5">
            BOTONES DE ACCIÓN RÁPIDA (MISIONES CRÍTICAS)
          </span>

          {/* Action 1: Drone Reconnaissance */}
          <button
            onClick={() => setDroneActive(!droneActive)}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              droneActive
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                : 'bg-slate-50/70 border-gray-200 text-slate-500 hover:border-gray-300 hover:bg-slate-100/50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Send className={`h-4.5 w-4.5 shrink-0 ${droneActive ? 'text-blue-600 animate-pulse' : 'text-slate-400 group-hover:text-blue-500'}`} />
              <div>
                <span className="font-bold block text-slate-800">ENVIAR DRON RECON</span>
                <span className="text-[9px] text-slate-500 font-normal font-sans">Lanzar inspección aérea autónoma</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className={`w-1.5 h-1.5 rounded-full ${droneActive ? 'bg-blue-500 animate-ping' : 'bg-slate-300'}`}></span>
              <span className="text-[9px] uppercase font-bold">{droneActive ? 'ACTIVO' : 'STANDBY'}</span>
            </div>
          </button>

          {/* Action 2: Evacuation Routes */}
          <button
            onClick={() => setEvacRoutesActive(!evacRoutesActive)}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              evacRoutesActive
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                : 'bg-slate-50/70 border-gray-200 text-slate-500 hover:border-gray-300 hover:bg-slate-100/50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Map className={`h-4.5 w-4.5 shrink-0 ${evacRoutesActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
              <div>
                <span className="font-bold block text-slate-800">DESPLEGAR RUTAS EVAC.</span>
                <span className="text-[9px] text-slate-500 font-normal font-sans">Trazar rutas de escape optimizadas</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className={`w-1.5 h-1.5 rounded-full ${evacRoutesActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
              <span className="text-[9px] uppercase font-bold">{evacRoutesActive ? 'VISIBLE' : 'OCULTO'}</span>
            </div>
          </button>

          {/* Action 3: Bioacoustic Alert */}
          <button
            onClick={() => setAcousticAlertActive(!acousticAlertActive)}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              acousticAlertActive
                ? 'bg-red-50 border-red-200 text-[#C21C1C] shadow-sm animate-pulse'
                : 'bg-slate-50/70 border-gray-200 text-slate-500 hover:border-gray-300 hover:bg-slate-100/50 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Volume2 className={`h-4.5 w-4.5 shrink-0 ${acousticAlertActive ? 'text-[#EF4444]' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold block text-slate-800">ALERTA BIOACÚSTICA</span>
                <span className="text-[9px] text-slate-500 font-normal font-sans">Sonar ahuyentadores de fauna forestal</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className={`w-1.5 h-1.5 rounded-full ${acousticAlertActive ? 'bg-[#EF4444] animate-ping' : 'bg-slate-300'}`}></span>
              <span className="text-[9px] uppercase font-bold">{acousticAlertActive ? 'EMITIENDO' : 'STANDBY'}</span>
            </div>
          </button>
        </div>

        {/* Timeline Log Lists (Light Theme) */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider">
              TIMELINE DE EVENTOS (TIEMPO REAL)
            </span>
            {/* Simulation trigger */}
            <button
              onClick={onTriggerSimulatedAlert}
              className="text-[9px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded transition-all cursor-pointer font-bold"
            >
              + SIMULAR ANOMALÍA
            </button>
          </div>
          
          <div className="bg-[#F8F9FA] rounded-xl border border-gray-200 p-3.5 flex-1 overflow-y-auto flex flex-col gap-2 shadow-inner">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-2 py-4">
                <ShieldCheck className="h-6 w-6 text-slate-300" />
                <span className="text-[9px] font-mono font-bold tracking-tight uppercase">SISTEMA EN CALMA</span>
                <span className="text-[9px] text-slate-400">No se han registrado incidentes críticos.</span>
              </div>
            ) : (
              alerts.map((alert) => {
                let statusBg = 'bg-slate-100 border-slate-200 text-slate-600';
                let textStyle = 'text-slate-700';
                let Icon = Info;
                
                if (alert.type === 'danger') {
                  statusBg = 'bg-red-50 border-red-200 text-[#C21C1C]';
                  textStyle = 'text-slate-800';
                  Icon = AlertTriangle;
                } else if (alert.type === 'warning') {
                  statusBg = 'bg-amber-50 border-amber-200 text-amber-800';
                  textStyle = 'text-slate-800';
                  Icon = AlertTriangle;
                } else if (alert.type === 'success') {
                  statusBg = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                  textStyle = 'text-slate-700';
                  Icon = ShieldCheck;
                } else if (alert.type === 'info') {
                  statusBg = 'bg-blue-50 border-blue-200 text-blue-800';
                  textStyle = 'text-slate-700';
                  Icon = Info;
                }

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs font-mono transition-all duration-300 shadow-2xs ${statusBg}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-[9px] uppercase tracking-wide">
                          {alert.source}
                        </span>
                        <span className="text-[8px] opacity-75">
                          {alert.time}
                        </span>
                      </div>
                      <p className={`text-[10px] leading-relaxed font-sans ${textStyle} font-medium`}>
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
  );
}
