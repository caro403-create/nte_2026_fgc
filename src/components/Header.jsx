import React from 'react';
import { Shield } from 'lucide-react';

export default function Header({ score, setScore }) {
  // Determine risk details based on score
  const getRiskDetails = (val) => {
    if (val <= 0.4) {
      return {
        label: 'Todo tranquilo',
        icon: '✅',
        textColor: 'text-[#2D6A4F]',
        borderColor: 'border-[#EEF5E9]',
        bgMuted: 'bg-[#EEF5E9]',
        desc: 'Condiciones normales. Riesgo bajo de incendio.'
      };
    } else if (val <= 0.7) {
      return {
        label: 'Revisar zonas secas',
        icon: '⚠️',
        textColor: 'text-[#F4A261]',
        borderColor: 'border-[#F4A261]/20',
        bgMuted: 'bg-[#F4A261]/10',
        desc: 'Precaución: Condiciones propensas a ignición.'
      };
    } else {
      return {
        label: '¡Atención inmediata requerida!',
        icon: '🔴',
        textColor: 'text-[#E63946]',
        borderColor: 'border-[#E63946]/20',
        bgMuted: 'bg-[#E63946]/10',
        desc: 'Alarma: Posible foco activo detectado.'
      };
    }
  };

  const risk = getRiskDetails(score);

  return (
    <header className="border-b border-[#EEF5E9] bg-white px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-6 sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      
      {/* Brand Title (Left Side) */}
      <div className="flex items-center gap-3 w-full lg:w-auto">
        <div className="p-2.5 bg-[#EEF5E9] border border-[#52B788]/20 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-[#2D6A4F]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#2D3436] m-0 flex items-center gap-2">
            SISTEMA DE DEFENSA ACTIVA
            <span className="text-[10px] bg-[#EEF5E9] text-[#2D6A4F] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Colombia
            </span>
          </h1>
          <p className="text-xs text-[#636E72] mt-0.5">
            Sincronizado: {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Global Status Bar (Center) */}
      <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border ${risk.borderColor} ${risk.bgMuted} transition-all duration-500 w-full lg:w-auto min-w-[300px]`}>
        <div className="text-2xl">{risk.icon}</div>
        <div className="flex flex-col">
          <span className={`text-base font-bold ${risk.textColor}`}>
            {risk.label}
          </span>
          <span className="text-xs text-[#636E72] font-medium">
            {risk.desc}
          </span>
        </div>
      </div>

      {/* Risk Score Meter (Right Side) */}
      <div className="flex flex-col gap-1 w-full lg:w-auto max-w-[200px]">
        <div className="flex justify-between items-end mb-1">
          <span className="text-xs font-bold text-[#2D3436]">Riesgo Global</span>
          <span className="text-[10px] text-[#636E72] font-bold">{(score * 100).toFixed(0)}%</span>
        </div>
        
        {/* Visual segmented bar that acts as a slider */}
        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          {/* Segments for visual zones */}
          <div className="h-full w-[40%] bg-[#52B788] opacity-20"></div>
          <div className="h-full w-[30%] bg-[#F4A261] opacity-20"></div>
          <div className="h-full w-[30%] bg-[#E63946] opacity-20"></div>
          
          {/* Actual fill */}
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${
              score <= 0.4 ? 'bg-[#52B788]' : score <= 0.7 ? 'bg-[#F4A261]' : 'bg-[#E63946]'
            }`}
            style={{ width: `${score * 100}%` }}
          ></div>
          
          {/* Invisible range input for interaction */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            title="Simular nivel de riesgo"
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#636E72] font-bold mt-0.5 uppercase">
          <span>Verde</span>
          <span>Amarillo</span>
          <span>Rojo</span>
        </div>
      </div>
      
    </header>
  );
}
