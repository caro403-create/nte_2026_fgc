/* eslint-disable no-unused-vars */
import React from 'react';
import { Shield, Info } from 'lucide-react';


export default function Header({ score, setScore }) {
  // Determine risk details based on score
  const getRiskDetails = (val) => {
    if (val <= 0.2) {
      return {
        label: 'NORMAL',
        color: 'bg-green-500',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
        bgMuted: 'bg-green-950/40',
        glowClass: 'glow-green',
        desc: 'Nivel Verde: Humedad del suelo óptima (>65%), vegetación hidratada y vientos calmados (<8 km/h). Sin anomalías térmicas.'
      };
    } else if (val <= 0.4) {
      return {
        label: 'VIGILANCIA',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-400',
        borderColor: 'border-yellow-500/30',
        bgMuted: 'bg-yellow-950/40',
        glowClass: 'glow-yellow',
        desc: 'Nivel Amarillo: 5 días sin lluvias, humedad relativa del 45%, vientos moderados entre 10-15 km/h. Monitoreo preventivo activo.'
      };
    } else if (val <= 0.6) {
      return {
        label: 'ALERTA',
        color: 'bg-orange-500',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
        bgMuted: 'bg-orange-950/40',
        glowClass: 'glow-orange',
        desc: 'Nivel Naranja: 9 días sin lluvias, vientos racheados > 20 km/h, humedad crítica (<35%). Alto riesgo de ignición por combustible seco.'
      };
    } else if (val <= 0.8) {
      return {
        label: 'ALARMA',
        color: 'bg-red-500',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        bgMuted: 'bg-red-950/40',
        glowClass: 'glow-red',
        desc: 'Nivel Rojo: Alarma. 12 días sin lluvia, vientos continuos > 25 km/h, temperaturas > 34°C. Puntos de calor satelitales (hotspots) detectados.'
      };
    } else {
      return {
        label: 'EVACUACIÓN',
        color: 'bg-purple-600',
        textColor: 'text-purple-400',
        borderColor: 'border-purple-500/30',
        bgMuted: 'bg-purple-950/40',
        glowClass: 'glow-purple',
        desc: 'Nivel Púrpura: Evacuación Inmediata. Foco activo a menos de 1.5 km de interfaces urbano-forestales, propagación acelerada y vientos > 35 km/h.'
      };
    }
  };

  const risk = getRiskDetails(score);

  return (
    <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand Title */}
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="p-2.5 bg-red-950/40 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.1)] flex items-center justify-center">
          <Shield className="h-6 w-6 text-red-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-wider text-white m-0 flex items-center gap-2">
            SISTEMA DE DEFENSA ACTIVA
            <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded font-mono font-medium">
              TEAM COLOMBIA
            </span>
          </h1>
          <p className="text-xs text-gray-400 font-mono tracking-tight mt-0.5">
            DASHBOARD INTEGRADO DE ALERTA TEMPRANA Y MISIONES CRÍTICAS
          </p>
        </div>
      </div>

      {/* Dynamic Data-Driven Education Bar */}
      <div className={`flex-1 max-w-xl px-4 py-2.5 rounded-lg border ${risk.borderColor} ${risk.bgMuted} flex items-start gap-2.5 transition-all duration-300 w-full`}>
        <Info className={`h-4 w-4 ${risk.textColor} shrink-0 mt-0.5`} />
        <div>
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-0.5">
            Educación con Datos (Estado de Riesgo)
          </span>
          <p className="text-xs font-medium text-gray-200 leading-relaxed">
            {risk.desc}
          </p>
        </div>
      </div>

      {/* Traffic Light Alert Level Controls */}
      <div className="flex flex-col items-end gap-1.5 w-full md:w-auto shrink-0">
        <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-4">
          <span className="text-xs font-mono text-gray-400">SCORE: {score.toFixed(2)}</span>
          <div className="flex items-center gap-1.5">
            {/* Traffic Light indicators */}
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((sVal, idx) => {
              const currentDetails = getRiskDetails(sVal);
              const isActive = (score > sVal - 0.2 && score <= sVal) || (sVal === 0.9 && score > 0.8);
              return (
                <button
                  key={idx}
                  onClick={() => setScore(sVal)}
                  className={`w-8 h-8 rounded-md flex flex-col items-center justify-center font-mono text-[9px] font-bold border transition-all duration-200 ${
                    isActive
                      ? `${currentDetails.color} text-black font-extrabold border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-110`
                      : 'bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700 hover:text-gray-300'
                  }`}
                  title={`Cambiar a nivel ${currentDetails.label}`}
                >
                  {currentDetails.label[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini-slider for fine control */}
        <div className="flex items-center gap-2 w-full md:w-48">
          <span className="text-[10px] text-gray-500 font-mono">0.0</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <span className="text-[10px] text-gray-500 font-mono">1.0</span>
        </div>
      </div>
    </header>
  );
}
