import React, { useState, useEffect } from 'react';
import { translations } from '../utils/translations';

export default function Header({ 
  onBackToLanding, 
  lang, 
  setLang, 
  user, 
  onLogout, 
  onOpenLogin,
  isDashboard = false,
  onEnterDashboard,
  activeTab
}) {
  const t = translations[lang || 'es'];
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener for landing page
  useEffect(() => {
    if (isDashboard) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDashboard]);

  const isLightTheme = isDashboard || isScrolled;

  const handleNavClick = (sectionId, tabName) => {
    if (sectionId === 'home') {
      if (isDashboard) {
        onBackToLanding();
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (tabName) {
      onEnterDashboard(tabName);
    } else if (sectionId) {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getBtnClass = (tab) => {
    const isActive = activeTab === tab;
    if (isActive) {
      return isLightTheme ? 'bg-[#2D6A4F] text-white shadow-md' : 'bg-brand-cream text-brand-darkgreen shadow-md';
    }
    return isLightTheme ? 'text-slate-500 hover:text-[#2D6A4F] hover:bg-[#EEF5E9]' : 'text-white/70 hover:text-white hover:bg-white/5';
  };

  const handleAncestralClick = () => {
    if (isDashboard) {
      onBackToLanding();
      setTimeout(() => {
        const el = document.getElementById('manifiesto');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      const el = document.getElementById('manifiesto');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCommunityClick = () => {
    onEnterDashboard('comunidad');
  };

  const handleChatbotClick = () => {
    if (isDashboard) {
      const chatbotBtn = document.querySelector('button[aria-label="Abrir asistente de incendios"]') || document.querySelector('.chatbot-trigger');
      if (chatbotBtn) chatbotBtn.click();
    } else {
      onEnterDashboard('chatbot');
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isLightTheme 
          ? 'py-0 px-0' 
          : 'py-4 px-4 md:px-8'
      }`}
    >
      <div 
        className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between transition-all duration-500 ease-in-out ${
          isLightTheme 
            ? 'max-w-full bg-[#F8FAF5]/90 md:bg-white/85 backdrop-blur-md border-b border-slate-200/80 py-3.5 px-6 md:px-12 rounded-none shadow-sm text-slate-800' 
            : 'bg-brand-darkgreen/40 backdrop-blur-xl border border-white/10 rounded-3xl lg:rounded-full py-3 px-6 md:px-8 shadow-2xl text-white'
        }`}
      >
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => isDashboard ? onBackToLanding() : window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div 
            className={`w-9 h-9 rounded-full flex items-center justify-center border transition-colors duration-300 ${
              isLightTheme 
                ? 'bg-[#EEF5E9] border-[#EEF5E9] text-[#2D6A4F]' 
                : 'bg-brand-cream/10 border-white/20 text-brand-cream'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-2.12.74-4.07 1.97-5.61L12 2l7.03 4.39C20.26 7.93 21 9.88 21 12c0 4.97-4.03 9-9 9z" />
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span 
              className={`font-serif-editorial text-lg font-bold tracking-wide leading-none transition-colors duration-300 ${
                isLightTheme ? 'text-[#2D3436]' : 'text-white'
              }`}
            >
              {t.brandName}
            </span>
            <span 
              className={`text-[9px] tracking-wider font-semibold font-mono uppercase mt-0.5 transition-colors duration-300 ${
                isLightTheme ? 'text-slate-400' : 'text-white/50'
              }`}
            >
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Navigation Menu in Center */}
        <nav 
          className={`flex flex-wrap items-center justify-center gap-1 md:gap-3 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
            isLightTheme ? 'text-slate-500' : 'text-white/70'
          }`}
        >
          <button 
            onClick={() => isDashboard ? onBackToLanding() : window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${
              isLightTheme ? 'hover:text-[#2D6A4F] hover:bg-[#EEF5E9]' : 'hover:text-white hover:bg-white/5'
            }`}
          >
            {t.menuHome}
          </button>
          <button 
            onClick={() => handleNavClick(null, 'monitoreo')} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('monitoreo')}`}
          >
            {t.menuMonitoring}
          </button>
          <button 
            onClick={() => handleNavClick(null, 'dashboard')} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('dashboard')}`}
          >
            {t.menuDashboard}
          </button>
          <button 
            onClick={() => handleNavClick(null, 'mapa')} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('mapa')}`}
          >
            {t.menuMap}
          </button>
          <button 
            onClick={() => handleNavClick(null, 'observatorio')} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('observatorio')}`}
          >
            {t.menuObservatorio}
          </button>
          <button 
            onClick={handleAncestralClick} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${isLightTheme ? 'text-slate-500 hover:text-[#2D6A4F] hover:bg-[#EEF5E9]' : 'text-white/70 hover:text-white hover:bg-white/5'}`}
          >
            {t.menuAncestral}
          </button>
          <button 
            onClick={handleCommunityClick} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('comunidad')}`}
          >
            {t.menuCommunity}
          </button>
          <button 
            onClick={handleChatbotClick} 
            className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${getBtnClass('chatbot')}`}
          >
            {t.menuChatbot}
          </button>
        </nav>

        {/* Action Button & Language selector */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div 
            className={`flex items-center gap-1 rounded-full p-1 border font-sans text-[10px] transition-all duration-300 ${
              isLightTheme 
                ? 'bg-slate-100 border-slate-200 text-slate-700' 
                : 'bg-white/10 border-white/15 text-white'
            }`}
          >
            <button 
              onClick={() => setLang('es')} 
              className={`px-2.5 py-1 rounded-full transition-all duration-200 uppercase font-bold cursor-pointer ${
                lang === 'es' 
                  ? (isLightTheme ? 'bg-[#2D6A4F] text-white shadow-sm' : 'bg-brand-cream text-brand-darkgreen shadow-sm')
                  : (isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-white/60 hover:text-white')
              }`}
            >
              ES
            </button>
            <button 
              onClick={() => setLang('en')} 
              className={`px-2.5 py-1 rounded-full transition-all duration-200 uppercase font-bold cursor-pointer ${
                lang === 'en' 
                  ? (isLightTheme ? 'bg-[#2D6A4F] text-white shadow-sm' : 'bg-brand-cream text-brand-darkgreen shadow-sm')
                  : (isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-white/60 hover:text-white')
              }`}
            >
              EN
            </button>
          </div>

          {/* Auth status or Login button */}
          {user ? (
            <div 
              className={`flex items-center gap-2 rounded-full pl-3 pr-1 py-1 border font-sans transition-all duration-300 ${
                isLightTheme 
                  ? 'bg-white/80 border-slate-200 text-[#2D6A4F]' 
                  : 'bg-white/10 border-white/15 text-white'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider max-w-[80px] truncate">
                {user.email.split('@')[0]}
              </span>
              <button 
                onClick={onLogout} 
                className={`px-2.5 py-1 rounded-full text-[9px] uppercase font-bold transition-all duration-200 cursor-pointer ${
                  isLightTheme
                    ? 'bg-slate-200 hover:bg-slate-700 text-slate-600 hover:text-white'
                    : 'bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white'
                }`}
              >
                {t.logoutButton}
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenLogin} 
              className={`font-bold px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider transition-all duration-300 shadow-sm cursor-pointer font-sans hover:scale-[1.03] active:scale-[0.97] ${
                isLightTheme 
                  ? 'bg-[#2D6A4F] hover:bg-[#1E4635] text-white' 
                  : 'bg-brand-cream hover:bg-white text-brand-darkgreen'
              }`}
            >
              {t.loginButton}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
