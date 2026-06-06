/* eslint-disable no-unused-vars */
import React from 'react';
import { Shield, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Header({ score, setScore }) {
  // Determine risk details based on score
  const getRiskDetails = (val) => {
    if (val <= 0.2) {
      return {
        label: 'VERDE (NORMAL)',
        shortLabel: 'Verde',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        bgMuted: 'bg-emerald-50',
        dotColor: 'bg-emerald-500',
        desc: 'Humedad del suelo óptima (>65%), vegetación hidratada y vientos calmados. Sin anomalías.'
      };
    } else if (val <= 0.4) {
      return {
        label: 'AMARILLO (VIGILANCIA)',
        shortLabel: 'Amarillo',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        bgMuted: 'bg-amber-50',
        dotColor: 'bg-amber-500',
        desc: 'Humedad relativa del 45%, vientos moderados. Monitoreo preventivo activo.'
      };
    } else if (val <= 0.6) {
      return {
        label: 'NARANJA (ALERTA)',
        shortLabel: 'Naranja',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-200',
        bgMuted: 'bg-orange-50',
        dotColor: 'bg-orange-500',
        desc: 'Humedad crítica (<35%), vientos >20 km/h. Riesgo moderado-alto de ignición.'
      };
    } else if (val <= 0.8) {
      return {
        label: 'NIVEL ROJO (ALARMA)',
        shortLabel: 'Nivel Rojo',
        textColor: 'text-[#C21C1C]', // Clear, non-aggressive red
        borderColor: 'border-red-200',
        bgMuted: 'bg-red-50',
        dotColor: 'bg-[#EF4444]',
        desc: 'Temperaturas >34°C, vientos >25 km/h. Foco crítico activo detectado.'
      };
    } else {
      return {
        label: 'PÚRPURA (EVACUACIÓN)',
        shortLabel: 'Púrpura',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200',
        bgMuted: 'bg-purple-50',
        dotColor: 'bg-purple-500',
        desc: 'Propagación acelerada de fuego a menos de 1.5 km de interfaces urbanas.'
      };
    }
  };

  const risk = getRiskDetails(score);

  return (
    <header className="border-b border-gray-200 bg-white/95 backdrop-blur-md px-6 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4 sticky top-0 z-50 shadow-xs">
      {/* Brand Title (Left Side) */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shadow-2xs">
          <Shield className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 m-0 flex items-center gap-2 font-sans">
            SISTEMA DE DEFENSA ACTIVA
            <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
              COLOMBIA
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 font-sans tracking-wide mt-0.5 uppercase font-medium">
            Wildfire Monitoring & Early Warning System
          </p>
        </div>
      </div>

      {/* Control Panel (Middle Area) - Compact, Figma-style controls */}
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full lg:w-auto max-w-md">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">
            SIMULAR RIESGO GLOBAL
          </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            SCORE: {score.toFixed(2)}
          </span>
        </div>
        
        <div className="flex-1 flex items-center gap-2 min-w-[120px]">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Level shortcuts */}
        <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
          {[0.1, 0.5, 0.72].map((sVal, idx) => {
            const label = sVal === 0.1 ? 'V' : sVal === 0.5 ? 'N' : 'R';
            const title = sVal === 0.1 ? 'Normal' : sVal === 0.5 ? 'Alerta' : 'Alarma';
            const isActive = (score > sVal - 0.2 && score <= sVal) || (sVal === 0.72 && score > 0.6 && score <= 0.8);
            return (
              <button
                key={idx}
                onClick={() => setScore(sVal)}
                title={`Configurar: ${title}`}
                className={`w-5 h-5 rounded font-mono text-[9px] font-bold flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm scale-105'
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Elegant Alert Banner Capsule (Right Side) */}
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${risk.borderColor} ${risk.bgMuted} transition-all duration-300 w-full lg:w-auto max-w-md shadow-2xs`}>
        {/* Pulsating danger dot */}
        <div className="relative flex h-2.5 w-2.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${risk.dotColor}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${risk.dotColor}`}></span>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold font-sans uppercase tracking-wide ${risk.textColor}`}>
              {risk.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-600 leading-tight font-sans font-medium line-clamp-1">
            {risk.desc}
          </span>
        </div>
      </div>
    </header>
  );
}
