import React, { useEffect, useState } from 'react';
import { Shield, ArrowRight, Menu, X } from 'lucide-react';

// Import local images from assets
import heroForest from '../assets/hero-forest.jpg';
import capMonitoreo from '../assets/cap-monitoreo.jpg';
import capDashboard from '../assets/cap-dashboard.jpg';
import capMapa from '../assets/cap-mapa.jpg';
import capSaberes from '../assets/cap-saberes.jpg';
import capChatbot from '../assets/cap-chatbot.jpg';
import fireNight from '../assets/colombia-fire-night.jpg';
import colombiaBomberos from '../assets/colombia-bomberos.jpg';

export default function LandingPage({ onEnterDashboard, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animateMetrics, setAnimateMetrics] = useState(false);

  // Trigger metrics animation on mount
  useEffect(() => {
    setAnimateMetrics(true);
  }, []);

  // Smooth scroll handler for landing page anchors
  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-darkgreen font-sans selection:bg-brand-sage/20 selection:text-brand-darkgreen flex flex-col overflow-x-hidden antialiased">
      
      {/* 1. Header (Landing) */}
      <header className="fixed top-0 left-0 w-full z-50 px-4 md:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-brand-darkgreen/40 backdrop-blur-xl border border-white/10 rounded-full py-3 px-6 md:px-8 shadow-2xl">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {/* Custom SVG leaf/shield logo as shown in the mockup */}
            <div className="w-9 h-9 rounded-full bg-brand-cream/10 border border-white/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-cream fill-none stroke-current" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-2.12.74-4.07 1.97-5.61L12 2l7.03 4.39C20.26 7.93 21 9.88 21 12c0 4.97-4.03 9-9 9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v10m-3-4h6" className="opacity-40" />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-serif-editorial text-lg font-bold tracking-wide text-white leading-none">NTE</span>
              <span className="text-[9px] tracking-wider text-white/50 font-semibold font-mono uppercase mt-0.5">TEAM COLOMBIA · FGC 2026</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <button 
              onClick={() => onEnterDashboard('monitoreo')} 
              className="text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              Monitoreo
            </button>
            <button 
              onClick={() => onEnterDashboard('dashboard')} 
              className="text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              Dashboard
            </button>
            <button 
              onClick={() => onEnterDashboard('mapa')} 
              className="text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              Mapa de Riesgo
            </button>
            <button 
              onClick={() => scrollToSection('superficies')} 
              className="text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              Saberes & Comunidad
            </button>
            <button 
              onClick={() => onEnterDashboard('chatbot')} 
              className="text-white/80 hover:text-white text-xs font-semibold tracking-wide uppercase transition-colors duration-200 py-1.5 px-3 rounded-full hover:bg-white/5"
            >
              Chatbot
            </button>
          </nav>

          {/* Action Button */}
          <div className="hidden lg:flex items-center">
            <button 
              onClick={() => onEnterDashboard('dashboard')} 
              className="bg-brand-cream hover:bg-white text-brand-darkgreen font-semibold px-6 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] shadow-md hover:shadow-lg"
            >
              Acceder
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white hover:text-brand-sage transition-colors duration-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-brand-darkgreen/95 backdrop-blur-2xl flex flex-col justify-center px-8 py-16 transition-all duration-300">
          <nav className="flex flex-col gap-6 text-center">
            <button 
              onClick={() => { onEnterDashboard('monitoreo'); setMobileMenuOpen(false); }} 
              className="text-white/90 hover:text-brand-sage text-2xl font-serif-editorial italic"
            >
              Monitoreo en vivo
            </button>
            <button 
              onClick={() => { onEnterDashboard('dashboard'); setMobileMenuOpen(false); }} 
              className="text-white/90 hover:text-brand-sage text-2xl font-serif-editorial italic"
            >
              Dashboard General
            </button>
            <button 
              onClick={() => { onEnterDashboard('mapa'); setMobileMenuOpen(false); }} 
              className="text-white/90 hover:text-brand-sage text-2xl font-serif-editorial italic"
            >
              Mapa de Riesgo
            </button>
            <button 
              onClick={() => { scrollToSection('superficies'); setMobileMenuOpen(false); }} 
              className="text-white/90 hover:text-brand-sage text-2xl font-serif-editorial italic"
            >
              Saberes & Comunidad
            </button>
            <button 
              onClick={() => { onEnterDashboard('chatbot'); setMobileMenuOpen(false); }} 
              className="text-white/90 hover:text-brand-sage text-2xl font-serif-editorial italic"
            >
              Chatbot Operativo
            </button>
            <div className="h-px bg-white/10 my-4"></div>
            <button 
              onClick={() => { onEnterDashboard('dashboard'); setMobileMenuOpen(false); }}
              className="bg-brand-cream hover:bg-white text-brand-darkgreen font-semibold py-3 px-6 rounded-full text-sm uppercase tracking-wider transition-all duration-300 self-center"
            >
              Acceder
            </button>
          </nav>
        </div>
      )}

      {/* 2. Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-between pt-32 pb-12 px-6 md:px-12 text-white bg-brand-darkgreen overflow-hidden">
        {/* Background Image with elegant overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroForest} 
            alt="Andean forest" 
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-darkgreen via-brand-darkgreen/50 to-brand-darkgreen/80"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto flex-1 flex flex-col justify-center text-left gap-6 mt-8">
          
          {/* Subtitle */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-px bg-brand-sage"></div>
            <span className="text-[10px] md:text-xs tracking-[0.25em] text-brand-sage font-semibold uppercase font-mono">
              Sistema de defensa activa
            </span>
          </div>

          {/* Main Heading */}
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif-editorial leading-[1.05] tracking-tight max-w-4xl">
            El bosque no <br />
            <span className="text-brand-sage italic font-light">espera al humo.</span>
          </h2>

          {/* Paragraph Description */}
          <p className="text-sm md:text-base text-white/70 max-w-xl font-normal leading-relaxed mt-2">
            NTE es una plataforma integral de detección temprana, prevención y respuesta ante incendios forestales en los Andes colombianos. Sensores en el borde, inteligencia artificial y saberes comunitarios trabajando como un solo organismo.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button 
              onClick={() => onEnterDashboard('monitoreo')}
              className="bg-brand-cream hover:bg-white text-brand-darkgreen hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-semibold px-8 py-4 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-2 group shadow-xl"
            >
              Entrar al monitoreo en vivo 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button 
              onClick={() => scrollToSection('manifiesto')}
              className="border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all duration-300 font-semibold px-8 py-4 rounded-full text-xs uppercase tracking-wider flex items-center justify-center"
            >
              Conocer el proyecto
            </button>
          </div>

        </div>

        {/* Bottom Metrics Section */}
        <div className="relative z-10 max-w-7xl mx-auto w-full mt-16 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Metric 1 */}
            <div className={`flex flex-col gap-1 transition-all duration-700 ${animateMetrics ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="font-serif-editorial text-4xl md:text-5xl text-brand-cream">35 min</span>
              <span className="text-[10px] md:text-xs text-white/50 leading-relaxed font-mono">Tiempo a la primera intervención efectiva</span>
            </div>

            {/* Metric 2 */}
            <div className={`flex flex-col gap-1 transition-all duration-700 delay-100 ${animateMetrics ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="font-serif-editorial text-4xl md:text-5xl text-brand-cream">&lt; 500 ms</span>
              <span className="text-[10px] md:text-xs text-white/50 leading-relaxed font-mono">Latencia de inferencia en el borde</span>
            </div>

            {/* Metric 3 */}
            <div className={`flex flex-col gap-1 transition-all duration-700 delay-200 ${animateMetrics ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="font-serif-editorial text-4xl md:text-5xl text-brand-cream">5 ejes</span>
              <span className="text-[10px] md:text-xs text-white/50 leading-relaxed font-mono">Detección · Prevención · Monitoreo · Respuesta · Recuperación</span>
            </div>

            {/* Metric 4 */}
            <div className={`flex flex-col gap-1 transition-all duration-700 delay-300 ${animateMetrics ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <span className="font-serif-editorial text-4xl md:text-5xl text-brand-cream">Farallones</span>
              <span className="text-[10px] md:text-xs text-white/50 leading-relaxed font-mono">Piloto activo en cordillera Central</span>
            </div>

          </div>
        </div>

      </section>

      {/* 3. Section 01 — MANIFIESTO */}
      <section id="manifiesto" className="bg-brand-cream py-24 px-6 md:px-12 border-b border-brand-darkgreen/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Section Label) */}
          <div className="lg:col-span-4 flex items-center gap-3">
            <span className="text-xs tracking-[0.2em] text-brand-sage font-bold uppercase font-mono">
              01 — Manifiesto
            </span>
          </div>

          {/* Right Column (Manifiesto Content) */}
          <div className="lg:col-span-8 flex flex-col gap-8 text-left">
            <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-darkgreen leading-tight max-w-3xl">
              Un incendio activo puede <span className="text-brand-sage italic font-light">duplicar su área cada 15 minutos.</span> Construimos la plataforma que devuelve el tiempo al territorio.
            </h3>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed max-w-2xl font-light">
              NTE integra sensores IoT de bajo costo, visión computacional en el borde y protocolos de notificación instantánea para comprimir la latencia del pipeline de respuesta. Donde antes había cien minutos de incertidumbre, hoy hay treinta y cinco minutos de acción coordinada. La diferencia, en el bosque andino, equivale a un orden de magnitud menos de hectáreas quemadas.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Full-width Transition Banner */}
      <section className="relative h-[480px] md:h-[600px] flex items-end py-16 px-6 md:px-12 bg-brand-darkgreen overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={fireNight} 
            alt="Wildfire at night in Tolima" 
            className="w-full h-full object-cover object-center scale-102"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-darkgreen via-brand-darkgreen/20 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full text-left flex flex-col gap-4 text-white">
          <span className="text-[10px] md:text-xs tracking-[0.25em] text-brand-sage font-bold font-mono uppercase">
            Colombia · Temporada Seca
          </span>
          <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-cream leading-tight max-w-3xl">
            En 2024, más de <span className="text-brand-sage italic font-light">120 mil hectáreas</span> ardieron en el país. La mayoría comenzó como un punto invisible.
          </h3>
          <p className="text-xs text-white/50 tracking-wider font-mono uppercase mt-4">
            Fotografía documental · cordillera Central, Tolima.
          </p>
        </div>
      </section>

      {/* 5. Section 02 — QUÉ SE PUEDE HACER EN LA PLATAFORMA */}
      <section id="superficies" className="bg-[#FAFBF7] py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-brand-darkgreen/10 text-left">
            <div>
              <span className="text-xs tracking-[0.2em] text-brand-sage font-bold uppercase font-mono">
                02 — Qué se puede hacer en la plataforma
              </span>
              <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-darkgreen mt-4 leading-tight">
                Cinco superficies. Un único sistema nervioso para el bosque.
              </h3>
            </div>
            <div className="text-left md:text-right font-mono text-[10px] md:text-xs text-slate-500 uppercase tracking-widest self-start md:self-end">
              Cordillera Central · Farallones
            </div>
          </div>

          {/* Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Monitoreo */}
            <div className="bg-white rounded-2xl overflow-hidden border border-brand-darkgreen/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left">
              <div className="h-56 overflow-hidden relative">
                <img src={capMonitoreo} alt="Monitoreo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-4">
                    <span>Monitoreo</span>
                    <span>01</span>
                  </div>
                  <h4 className="text-2xl font-serif-editorial text-brand-darkgreen mb-3">
                    Telemetría en vivo desde cada nodo
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                    Temperatura, humedad, CO₂, partículas y audio fusionados en un score unificado de riesgo, evaluado cada segundo en el ESP32.
                  </p>
                </div>
                <button 
                  onClick={() => onEnterDashboard('monitoreo')} 
                  className="mt-6 text-brand-sage hover:text-brand-darkgreen font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 group self-start transition-colors duration-200"
                >
                  Ver panel
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 2: Dashboard */}
            <div className="bg-white rounded-2xl overflow-hidden border border-brand-darkgreen/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left">
              <div className="h-56 overflow-hidden relative">
                <img src={capDashboard} alt="Dashboard" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-4">
                    <span>Dashboard</span>
                    <span>02</span>
                  </div>
                  <h4 className="text-2xl font-serif-editorial text-brand-darkgreen mb-3">
                    Una sola vista del territorio
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                    Series temporales, estado de los sensores, alertas activas y overlay satelital. Diseñado para operación rural y baja conectividad.
                  </p>
                </div>
                <button 
                  onClick={() => onEnterDashboard('dashboard')} 
                  className="mt-6 text-brand-sage hover:text-brand-darkgreen font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 group self-start transition-colors duration-200"
                >
                  Ver panel
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 3: Mapa de Riesgo */}
            <div className="bg-white rounded-2xl overflow-hidden border border-brand-darkgreen/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left">
              <div className="h-56 overflow-hidden relative">
                <img src={capMapa} alt="Mapa de Riesgo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-4">
                    <span>Mapa de Riesgo</span>
                    <span>03</span>
                  </div>
                  <h4 className="text-2xl font-serif-editorial text-brand-darkgreen mb-3">
                    Geografía predictiva
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                    Capas de pendiente, vegetación, viento y FWI combinadas con detecciones MODIS/VIIRS para anticipar la propagación.
                  </p>
                </div>
                <button 
                  onClick={() => onEnterDashboard('mapa')} 
                  className="mt-6 text-brand-sage hover:text-brand-darkgreen font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 group self-start transition-colors duration-200"
                >
                  Ver panel
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 4: Saberes & Comunidad */}
            <div className="bg-white rounded-2xl overflow-hidden border border-brand-darkgreen/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left">
              <div className="h-56 overflow-hidden relative">
                <img src={capSaberes} alt="Saberes & Comunidad" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-4">
                    <span>Saberes & Comunidad</span>
                    <span>04</span>
                  </div>
                  <h4 className="text-2xl font-serif-editorial text-brand-darkgreen mb-3">
                    El conocimiento local, registrado
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                    Reportes ciudadanos, calendarios de quemas controladas y memoria comunitaria de fuegos históricos como capa de contexto.
                  </p>
                </div>
                <button 
                  onClick={() => scrollToSection('bomberos')} 
                  className="mt-6 text-brand-sage hover:text-brand-darkgreen font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 group self-start transition-colors duration-200"
                >
                  Saber más
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 5: Chatbot */}
            <div className="bg-white rounded-2xl overflow-hidden border border-brand-darkgreen/5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full text-left">
              <div className="h-56 overflow-hidden relative">
                <img src={capChatbot} alt="Chatbot" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono tracking-widest uppercase mb-4">
                    <span>Chatbot</span>
                    <span>05</span>
                  </div>
                  <h4 className="text-2xl font-serif-editorial text-brand-darkgreen mb-3">
                    Asistente de despacho
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                    Vía Telegram. Recibe la alerta, consulta el GPS exacto del nodo, accesos al punto y video del drone antes de salir al terreno.
                  </p>
                </div>
                <button 
                  onClick={() => onEnterDashboard('chatbot')} 
                  className="mt-6 text-brand-sage hover:text-brand-darkgreen font-mono text-[10px] tracking-wider uppercase font-bold flex items-center gap-1.5 group self-start transition-colors duration-200"
                >
                  Abrir asistente
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Card 6: Próximamente */}
            <div className="bg-brand-darkgreen text-brand-cream rounded-2xl p-8 flex flex-col justify-between h-full min-h-[350px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left">
              <div>
                <span className="text-[10px] text-brand-sage font-mono tracking-[0.25em] uppercase font-bold">
                  Próximamente
                </span>
                <h4 className="text-2xl font-serif-editorial text-brand-cream mt-6 mb-4">
                  Recuperación adaptativa por tipo de suelo
                </h4>
                <p className="text-xs md:text-sm text-white/60 leading-relaxed font-light">
                  Viveros comunitarios con sensores IoT que miden pH, humedad de suelo y crecimiento de plántulas tras el incendio.
                </p>
              </div>
              <div className="flex justify-between items-center text-[10px] text-brand-sage font-mono tracking-widest mt-8 border-t border-white/10 pt-4">
                <span>Eje V</span>
                <span>06</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Section 03 — LA MÉTRICA QUE IMPORTA */}
      <section className="bg-brand-darkgreen-m text-white py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col gap-6 text-left relative z-10">
            <span className="text-xs tracking-[0.2em] text-brand-sage font-bold uppercase font-mono">
              03 — La métrica que importa
            </span>
            <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-cream leading-tight">
              El ahorro de tiempo se mide en <span className="text-brand-sage italic font-light">hectáreas no quemadas.</span>
            </h3>
            <p className="text-xs md:text-sm text-white/50 leading-relaxed max-w-sm font-mono uppercase tracking-wider">
              Modelado con la ecuación de propagación de Rothermel adaptada a viento moderado y pendiente media inferior al quince por ciento.
            </p>
          </div>

          {/* Right Column (Metric Timeline Comparison) */}
          <div className="lg:col-span-7 flex flex-col gap-10 text-left relative z-10">
            
            {/* Metric Comparison 1 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <span className="font-serif-editorial text-4xl md:text-5xl text-white">100 min</span>
                <span className="text-sm font-serif-editorial italic text-white/60">&asymp; 32 ha</span>
              </div>
              <div className="text-[10px] text-white/40 tracking-wider font-mono uppercase mt-1">
                Respuesta rural convencional
              </div>
              {/* Progress Line */}
              <div className="h-[2px] bg-white/10 w-full mt-2 overflow-hidden">
                <div className="h-full bg-red-500/60 w-full rounded-full"></div>
              </div>
            </div>

            {/* Metric Comparison 2 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end border-b border-white/10 pb-2">
                <span className="font-serif-editorial text-4xl md:text-5xl text-white">60 min</span>
                <span className="text-sm font-serif-editorial italic text-white/60">&asymp; 8 ha</span>
              </div>
              <div className="text-[10px] text-white/40 tracking-wider font-mono uppercase mt-1">
                Cámaras Standalone
              </div>
              {/* Progress Line */}
              <div className="h-[2px] bg-white/10 w-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-500/60 w-[60%] rounded-full"></div>
              </div>
            </div>

            {/* Metric Comparison 3 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end border-b border-brand-sage/20 pb-2">
                <span className="font-serif-editorial text-4xl md:text-5xl text-brand-cream">35 min</span>
                <span className="text-sm font-serif-editorial italic text-brand-sage">&asymp; 1,5 ha</span>
              </div>
              <div className="text-[10px] text-brand-sage tracking-wider font-mono uppercase mt-1 font-semibold">
                Sistema Integrado NTE
              </div>
              {/* Progress Line */}
              <div className="h-[2px] bg-white/10 w-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-sage w-[35%] rounded-full"></div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Section 04 — QUIENES LLEGAN PRIMERO */}
      <section id="bomberos" className="bg-brand-cream py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column (Image) */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-2xl relative border border-brand-darkgreen/5 h-[400px] md:h-[500px]">
            <img 
              src={colombiaBomberos} 
              alt="Bomberos forestales en acción" 
              className="w-full h-full object-cover object-center scale-102 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-brand-darkgreen/5 mix-blend-overlay"></div>
          </div>

          {/* Right Column (Text Content) */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            <span className="text-xs tracking-[0.2em] text-brand-sage font-bold uppercase font-mono">
              Quienes llegan primero
            </span>
            <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-darkgreen leading-tight">
              La plataforma trabaja para que los <span className="text-brand-sage italic font-light">bomberos forestales</span> lleguen antes, con mejor información y menos riesgo.
            </h3>
            <p className="text-sm md:text-base text-slate-700 leading-relaxed font-light">
              Cuerpos de bomberos voluntarios, brigadas de Parques Nacionales y comunidades rurales son el último kilómetro del sistema. Todo en NTE existe para servirles.
            </p>
          </div>

        </div>
      </section>

      {/* 8. Section 05 — ARQUITECTURA EN CINCO EJES */}
      <section className="bg-brand-cream pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          
          {/* Section Header */}
          <div className="flex flex-col text-left border-b border-brand-darkgreen/10 pb-6">
            <span className="text-xs tracking-[0.2em] text-brand-sage font-bold uppercase font-mono">
              04 — Arquitectura en cinco ejes
            </span>
            <h3 className="text-3xl md:text-5xl font-serif-editorial text-brand-darkgreen mt-4 leading-tight">
              Del primer chasquido del fuego a la primera plántula sembrada.
            </h3>
          </div>

          {/* Axes List */}
          <div className="flex flex-col">
            
            {/* Axis I */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center py-6 md:py-8 border-b border-brand-darkgreen/10 hover:bg-brand-darkgreen/[0.02] px-4 md:px-6 transition-all duration-300 group cursor-pointer text-left gap-4" onClick={() => onEnterDashboard('monitoreo')}>
              <div className="md:col-span-1 font-serif-editorial text-brand-sage italic text-xl md:text-2xl">
                I
              </div>
              <div className="md:col-span-3 font-serif-editorial text-brand-darkgreen text-2xl font-semibold">
                Detección
              </div>
              <div className="md:col-span-7 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                Edge AI multi-sensorial. Score unificado por debajo de quinientos milisegundos.
              </div>
              <div className="md:col-span-1 text-right flex justify-end">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-sage group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
            </div>

            {/* Axis II */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center py-6 md:py-8 border-b border-brand-darkgreen/10 hover:bg-brand-darkgreen/[0.02] px-4 md:px-6 transition-all duration-300 group cursor-pointer text-left gap-4" onClick={() => onEnterDashboard('dashboard')}>
              <div className="md:col-span-1 font-serif-editorial text-brand-sage italic text-xl md:text-2xl">
                II
              </div>
              <div className="md:col-span-3 font-serif-editorial text-brand-darkgreen text-2xl font-semibold">
                Prevención
              </div>
              <div className="md:col-span-7 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                Del paradigma reactivo al predictivo. Índices FWI, FFDI, WDI.
              </div>
              <div className="md:col-span-1 text-right flex justify-end">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-sage group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
            </div>

            {/* Axis III */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center py-6 md:py-8 border-b border-brand-darkgreen/10 hover:bg-brand-darkgreen/[0.02] px-4 md:px-6 transition-all duration-300 group cursor-pointer text-left gap-4" onClick={() => onEnterDashboard('monitoreo')}>
              <div className="md:col-span-1 font-serif-editorial text-brand-sage italic text-xl md:text-2xl">
                III
              </div>
              <div className="md:col-span-3 font-serif-editorial text-brand-darkgreen text-2xl font-semibold">
                Monitoreo
              </div>
              <div className="md:col-span-7 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                Coherencia satelital y nodos en tierra sobre una sola superficie.
              </div>
              <div className="md:col-span-1 text-right flex justify-end">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-sage group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
            </div>

            {/* Axis IV */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center py-6 md:py-8 border-b border-brand-darkgreen/10 hover:bg-brand-darkgreen/[0.02] px-4 md:px-6 transition-all duration-300 group cursor-pointer text-left gap-4" onClick={() => onEnterDashboard('chatbot')}>
              <div className="md:col-span-1 font-serif-editorial text-brand-sage italic text-xl md:text-2xl">
                IV
              </div>
              <div className="md:col-span-3 font-serif-editorial text-brand-darkgreen text-2xl font-semibold">
                Respuesta
              </div>
              <div className="md:col-span-7 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                Última milla operativa: despacho automático y guía al punto.
              </div>
              <div className="md:col-span-1 text-right flex justify-end">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-sage group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
            </div>

            {/* Axis V */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center py-6 md:py-8 border-b border-brand-darkgreen/10 hover:bg-brand-darkgreen/[0.02] px-4 md:px-6 transition-all duration-300 group cursor-pointer text-left gap-4" onClick={() => scrollToSection('superficies')}>
              <div className="md:col-span-1 font-serif-editorial text-brand-sage italic text-xl md:text-2xl">
                V
              </div>
              <div className="md:col-span-3 font-serif-editorial text-brand-darkgreen text-2xl font-semibold">
                Recuperación
              </div>
              <div className="md:col-span-7 text-xs md:text-sm text-slate-600 leading-relaxed font-light">
                Restauración adaptativa con ciencia ciudadana.
              </div>
              <div className="md:col-span-1 text-right flex justify-end">
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-sage group-hover:translate-x-1.5 transition-all duration-300" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. Footer */}
      <footer className="bg-brand-darkgreen-m text-white/90 pt-20 pb-8 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* Column 1: Brand Info */}
            <div className="md:col-span-5 flex flex-col gap-6 text-left">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-cream/10 border border-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-cream fill-none stroke-current" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.97 0-9-4.03-9-9 0-2.12.74-4.07 1.97-5.61L12 2l7.03 4.39C20.26 7.93 21 9.88 21 12c0 4.97-4.03 9-9 9z" />
                  </svg>
                </div>
                <span className="font-serif-editorial text-2xl font-bold tracking-wide text-white leading-none">NTE</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm font-light">
                Proyecto de la Fundación Team Colombia para el FIRST Global Challenge 2026 — <span className="italic font-serif-editorial text-brand-sage">Igniting Innovation</span>.
              </p>
            </div>

            {/* Column 2: Platform Links */}
            <div className="md:col-span-3 flex flex-col gap-4 text-left">
              <span className="text-[10px] text-brand-sage font-mono tracking-widest uppercase font-semibold">
                Plataforma
              </span>
              <ul className="flex flex-col gap-2.5 text-xs text-white/60 font-medium">
                <li>
                  <button onClick={() => onEnterDashboard('monitoreo')} className="hover:text-white transition-colors">
                    Monitoreo en vivo
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterDashboard('dashboard')} className="hover:text-white transition-colors">
                    Dashboard Central
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterDashboard('mapa')} className="hover:text-white transition-colors">
                    Mapa de Riesgo
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('superficies')} className="hover:text-white transition-colors">
                    Saberes & Comunidad
                  </button>
                </li>
                <li>
                  <button onClick={() => onEnterDashboard('chatbot')} className="hover:text-white transition-colors">
                    Chatbot
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Pilot Info */}
            <div className="md:col-span-4 flex flex-col gap-4 text-left">
              <span className="text-[10px] text-brand-sage font-mono tracking-widest uppercase font-semibold">
                Piloto
              </span>
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Farallones · Cordillera Central, Colombia.<br />
                Mayo 2026.
              </p>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10 text-[10px] text-white/40 font-mono uppercase tracking-wider">
            <span>&copy; 2026 Fundación Team Colombia</span>
            <span>V0.1 · Hero Release</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
