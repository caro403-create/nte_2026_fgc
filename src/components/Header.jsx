import { useState, useEffect, useRef } from 'react';
import { translations } from '../utils/translations';
import Logo from './Logo';

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
  const [hoveredNav, setHoveredNav] = useState(null);
  const headerRef = useRef(null);

  // Scroll listener. Capture phase, so it also catches scroll from an inner
  // scrolling container (the dashboard panes) and not just the window.
  useEffect(() => {
    const handleScroll = (e) => {
      const target = e?.target;
      const offset =
        target && target !== document && target !== window && typeof target.scrollTop === 'number'
          ? target.scrollTop
          : window.scrollY;
      setIsScrolled(offset > (isDashboard ? 16 : 40));
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isDashboard]);

  // Publish the real header height so fixed-offset layouts (and sticky filter
  // bars that must park just below it) can track it instead of guessing.
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const publish = () => {
      document.documentElement.style.setProperty('--nte-header-h', `${el.offsetHeight}px`);
    };
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isLightTheme = isDashboard || isScrolled;
  // On the dashboard the bar sits directly on top of charts and tables, so it
  // is fully opaque — a translucent bar smears the content scrolling under it.
  const isCompact = isDashboard && isScrolled;

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

  // Saberes dejó de ser un ancla al manifiesto de la portada: ahora es una
  // sección propia del tablero con su contenido en la base de datos.
  const handleAncestralClick = () => {
    onEnterDashboard('saberes');
  };

  const handleCommunityClick = () => {
    onEnterDashboard('comunidad');
  };

  // Un solo sitio para el menú: etiqueta, destino y —sobre todo— qué se
  // encontrará dentro. `tab` marca los que resaltan cuando esa sección está
  // abierta; los demás son saltos a la landing.
  const navItems = [
    {
      key: 'home', label: t.menuHome, desc: t.menuHomeDesc, tab: null,
      onClick: () => (isDashboard ? onBackToLanding() : window.scrollTo({ top: 0, behavior: 'smooth' }))
    },
    {
      key: 'monitoreo', label: t.menuMonitoring, desc: t.menuMonitoringDesc, tab: 'monitoreo',
      onClick: () => handleNavClick(null, 'monitoreo')
    },
    {
      key: 'observatorio', label: t.menuObservatorio, desc: t.menuObservatorioDesc, tab: 'observatorio',
      onClick: () => handleNavClick(null, 'observatorio')
    },
    {
      key: 'colombia', label: t.menuColombia, desc: t.menuColombiaDesc, tab: 'colombia',
      onClick: () => handleNavClick(null, 'colombia')
    },
    { key: 'ancestral', label: t.menuAncestral, desc: t.menuAncestralDesc, tab: 'saberes', onClick: handleAncestralClick },
    { key: 'comunidad', label: t.menuCommunity, desc: t.menuCommunityDesc, tab: 'comunidad', onClick: handleCommunityClick }
  ];

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out ${
        isLightTheme
          ? 'py-0 px-0'
          : 'py-4 px-4 md:px-8'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between transition-all duration-300 ease-in-out ${
          isLightTheme
            ? `max-w-full bg-white border-b border-slate-200 px-6 md:px-12 rounded-none text-slate-800 ${isCompact ? 'py-1.5' : 'py-2.5'}`
            : 'bg-brand-darkgreen/40 backdrop-blur-xl border border-white/10 rounded-3xl lg:rounded-full py-3 px-6 md:px-8 shadow-2xl text-white'
        }`}
      >
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => isDashboard ? onBackToLanding() : window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div
            className={`w-9 h-9 rounded-full overflow-hidden border transition-colors duration-300 ${
              isLightTheme ? 'border-[#DCE7DA]' : 'border-white/25'
            }`}
          >
            <Logo className="w-full h-full" />
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

        {/* Navigation Menu in Center.
            Cada ítem lleva su descripción: al pasar el cursor aparece bajo la
            barra, en posición absoluta para que el encabezado no dé un salto. */}
        <nav
          onMouseLeave={() => setHoveredNav(null)}
          className={`relative flex flex-wrap items-center justify-center gap-1 md:gap-3 text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 ${
            isLightTheme ? 'text-slate-500' : 'text-white/70'
          }`}
        >
          {hoveredNav && (
            <div
              className={`hidden lg:block absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-10 whitespace-nowrap rounded-lg px-3 py-1.5 text-[11px] font-medium normal-case tracking-normal shadow-lg pointer-events-none ${
                isLightTheme
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-800'
              }`}
            >
              {hoveredNav}
            </div>
          )}
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={item.onClick}
              onMouseEnter={() => setHoveredNav(item.desc)}
              onFocus={() => setHoveredNav(item.desc)}
              onBlur={() => setHoveredNav(null)}
              title={item.desc}
              className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer font-sans ${
                item.tab
                  ? getBtnClass(item.tab)
                  : isLightTheme
                    ? 'text-slate-500 hover:text-[#2D6A4F] hover:bg-[#EEF5E9]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
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
