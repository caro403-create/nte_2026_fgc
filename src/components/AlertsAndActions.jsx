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
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-yellow-400" />
          <h2 className="text-sm font-bold tracking-wider text-gray-200 uppercase m-0">
            ALERTAS Y ACCIONES INMEDIATAS
          </h2>
        </div>
        <button
          onClick={clearAlerts}
          className="text-[10px] font-mono text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700 px-2 py-0.5 rounded transition-all duration-200"
        >
          LIMPIAR REGISTROS
        </button>
      </div>

      {/* Main Grid: Left is Action buttons, Right is Timeline logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-[160px] overflow-hidden">
        
        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-2.5 justify-center">
          <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider mb-0.5">
            BOTONES DE ACCIÓN RÁPIDA (MISIONES CRÍTICAS)
          </span>

          {/* Action 1: Drone Reconnaissance */}
          <button
            onClick={() => setDroneActive(!droneActive)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              droneActive
                ? 'bg-blue-950/40 border-blue-500/80 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Send className={`h-4.5 w-4.5 shrink-0 ${droneActive ? 'text-blue-400 animate-pulse' : 'text-gray-500 group-hover:text-blue-400'}`} />
              <div>
                <span className="font-bold block text-white">ENVIAR DRON RECON</span>
                <span className="text-[9px] text-gray-400 font-normal">Lanzar dron autonomo de inspección</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${droneActive ? 'bg-blue-400 animate-ping' : 'bg-gray-700'}`}></span>
              <span className="text-[9px] uppercase font-bold">{droneActive ? 'ACTIVO' : 'STANDBY'}</span>
            </div>
          </button>

          {/* Action 2: Evacuation Routes */}
          <button
            onClick={() => setEvacRoutesActive(!evacRoutesActive)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              evacRoutesActive
                ? 'bg-green-950/40 border-green-500/80 text-green-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Map className={`h-4.5 w-4.5 shrink-0 ${evacRoutesActive ? 'text-green-400' : 'text-gray-500 group-hover:text-green-400'}`} />
              <div>
                <span className="font-bold block text-white">DESPLEGAR RUTAS EVAC.</span>
                <span className="text-[9px] text-gray-400 font-normal">Trazar rutas de escape optimizadas</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${evacRoutesActive ? 'bg-green-400 animate-pulse' : 'bg-gray-700'}`}></span>
              <span className="text-[9px] uppercase font-bold">{evacRoutesActive ? 'VISIBLE' : 'OCULTO'}</span>
            </div>
          </button>

          {/* Action 3: Bioacoustic Alert */}
          <button
            onClick={() => setAcousticAlertActive(!acousticAlertActive)}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 font-mono text-xs text-left cursor-pointer group ${
              acousticAlertActive
                ? 'bg-red-950/40 border-red-500/80 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-pulse'
                : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Volume2 className={`h-4.5 w-4.5 shrink-0 ${acousticAlertActive ? 'text-red-400' : 'text-gray-500 group-hover:text-red-400'}`} />
              <div>
                <span className="font-bold block text-white">ALERTA BIOACÚSTICA</span>
                <span className="text-[9px] text-gray-400 font-normal">Emitir sonidos ahuyentadores de fauna</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${acousticAlertActive ? 'bg-red-400 animate-ping' : 'bg-gray-700'}`}></span>
              <span className="text-[9px] uppercase font-bold">{acousticAlertActive ? 'EMITIENDO' : 'OFF'}</span>
            </div>
          </button>
        </div>

        {/* Timeline Log Lists */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">
              TIMELINE DE EVENTOS (TIEMPO REAL)
            </span>
            {/* Simulation trigger */}
            <button
              onClick={onTriggerSimulatedAlert}
              className="text-[9px] font-mono bg-blue-900/40 hover:bg-blue-900/60 text-blue-400 border border-blue-800/40 px-1.5 py-0.5 rounded transition-all duration-200"
            >
              + SIMULAR ANOMALÍA
            </button>
          </div>
          
          <div className="bg-gray-950/80 rounded-lg border border-gray-800 p-3 flex-1 overflow-y-auto flex flex-col gap-2">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-600 gap-1.5 py-4">
                <ShieldCheck className="h-7 w-7 text-gray-700" />
                <span className="text-[10px] font-mono font-bold tracking-tight uppercase">SISTEMA EN CALMA</span>
                <span className="text-[9px] font-mono">No se han registrado anomalías críticas.</span>
              </div>
            ) : (
              alerts.map((alert) => {
                let statusBg = 'bg-gray-800 border-gray-700 text-gray-400';
                let Icon = Info;
                if (alert.type === 'danger') {
                  statusBg = 'bg-red-950/30 border-red-900/40 text-red-400';
                  Icon = AlertTriangle;
                } else if (alert.type === 'warning') {
                  statusBg = 'bg-orange-950/30 border-orange-900/40 text-orange-400';
                  Icon = AlertTriangle;
                } else if (alert.type === 'success') {
                  statusBg = 'bg-green-950/30 border-green-900/40 text-green-400';
                  Icon = ShieldCheck;
                } else if (alert.type === 'info') {
                  statusBg = 'bg-blue-950/30 border-blue-900/40 text-blue-400';
                  Icon = Info;
                }

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-2.5 p-2 rounded border text-xs font-mono transition-all duration-300 ${statusBg}`}
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold text-[9px] uppercase tracking-wide">
                          {alert.source}
                        </span>
                        <span className="text-[8px] text-gray-500">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-[10px] leading-tight text-gray-300 break-words">
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
