import React from 'react';

export default function Header({ onBackToLanding }) {
  return (
    <header className="bg-brand-darkgreen border-b border-white/10 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-6 sticky top-0 z-50 shadow-lg text-white">
      
      {/* Brand Logo & Title */}
      <div 
        className="flex items-center gap-3 cursor-pointer select-none" 
        onClick={onBackToLanding}
      >
        <div className="w-9 h-9 rounded-full bg-brand-cream/10 border border-white/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-cream fill-none stroke-current" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-2.12.74-4.07 1.97-5.61L12 2l7.03 4.39C20.26 7.93 21 9.88 21 12c0 4.97-4.03 9-9 9z" />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-serif-editorial text-lg font-bold tracking-wide text-white leading-none">NTE</span>
          <span className="text-[9px] tracking-wider text-white/50 font-semibold font-mono uppercase mt-0.5">TEAM COLOMBIA · FGC 2026</span>
        </div>
      </div>

      {/* Navigation Menu in Center (Matches the Landing Page exactly) */}
      <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-4 text-xs font-semibold uppercase tracking-wider text-white/70">
        <button 
          onClick={onBackToLanding} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          Inicio
        </button>
        <button 
          onClick={() => {
            const mapEl = document.querySelector('.min-h-\\[380px\\]') || document.querySelector('main');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer text-white bg-white/10"
        >
          Monitoreo
        </button>
        <button 
          onClick={() => {
            const dashboardEl = document.querySelector('main');
            if (dashboardEl) dashboardEl.scrollIntoView({ behavior: 'smooth' });
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer font-bold"
        >
          Dashboard
        </button>
        <button 
          onClick={() => {
            const mapEl = document.querySelector('.min-h-\\[380px\\]');
            if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth' });
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          Mapa de Riesgo
        </button>
        <button 
          onClick={() => { 
            onBackToLanding(); 
            setTimeout(() => { 
              document.getElementById('superficies')?.scrollIntoView({ behavior: 'smooth' }); 
            }, 300); 
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          Saberes & Comunidad
        </button>
        <button 
          onClick={() => { 
            const chatbotBtn = document.querySelector('button[aria-label="Abrir asistente de incendios"]');
            if (chatbotBtn) chatbotBtn.click();
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          Chatbot
        </button>
      </nav>

      {/* Back to Home Action Button (Matches ACCEDER button layout) */}
      <div className="flex items-center">
        <button 
          onClick={onBackToLanding} 
          className="bg-brand-cream hover:bg-white text-brand-darkgreen font-semibold px-6 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-lg cursor-pointer"
        >
          Inicio
        </button>
      </div>

    </header>
  );
}
