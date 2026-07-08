import React from 'react';
import { translations } from '../utils/translations';

export default function Header({ onBackToLanding, lang, setLang, activeTab, setActiveTab }) {
  const t = translations[lang || 'es'];

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
          <span className="font-serif-editorial text-lg font-bold tracking-wide text-white leading-none">{t.brandName}</span>
          <span className="text-[9px] tracking-wider text-white/50 font-semibold font-mono uppercase mt-0.5">{t.brandSubtitle}</span>
        </div>
      </div>

      {/* Navigation Menu in Center (Matches the Landing Page exactly) */}
      <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-4 text-xs font-semibold uppercase tracking-wider text-white/70">
        <button 
          onClick={onBackToLanding} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          {t.menuHome}
        </button>
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer ${
            activeTab === 'dashboard' ? 'text-white bg-white/10 font-bold' : ''
          }`}
        >
          {t.menuMap}
        </button>
        <button 
          onClick={() => setActiveTab('observatorio')} 
          className={`px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer ${
            activeTab === 'observatorio' ? 'text-white bg-white/10 font-bold' : ''
          }`}
        >
          {t.menuObservatorio}
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
          {t.menuCommunity}
        </button>
        <button 
          onClick={() => { 
            const chatbotBtn = document.querySelector('button[aria-label="Abrir asistente de incendios"]');
            if (chatbotBtn) chatbotBtn.click();
          }} 
          className="px-3 py-1.5 hover:text-white rounded-full hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          {t.menuChatbot}
        </button>
      </nav>

      {/* Action Button & Language selector */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 border border-white/15 font-sans text-[10px]">
          <button 
            onClick={() => setLang('es')} 
            className={`px-2.5 py-1 rounded-full transition-all duration-200 uppercase font-bold cursor-pointer ${
              lang === 'es' 
                ? 'bg-brand-cream text-brand-darkgreen shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            ES
          </button>
          <button 
            onClick={() => setLang('en')} 
            className={`px-2.5 py-1 rounded-full transition-all duration-200 uppercase font-bold cursor-pointer ${
              lang === 'en' 
                ? 'bg-brand-cream text-brand-darkgreen shadow-sm' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        <button 
          onClick={onBackToLanding} 
          className="bg-brand-cream hover:bg-white text-brand-darkgreen font-semibold px-6 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] shadow-md hover:shadow-lg cursor-pointer"
        >
          {t.menuHome}
        </button>
      </div>

    </header>
  );
}
