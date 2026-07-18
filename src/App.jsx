/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapSimulator from './components/MapSimulator';
import SensorPanel from './components/SensorPanel';
import { Shield, Wifi, Database, Clock, RefreshCw } from 'lucide-react';
import Chatbot from './components/Chatbot';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import PublicReportModal from './components/PublicReportModal';
import NodesSummary from './components/NodesSummary';
import TimeSeriesPanel from './components/TimeSeriesPanel';
import NodeComparisonTable from './components/NodeComparisonTable';
import CommunityForum from './components/CommunityForum';
import ObservatorioPanel from './components/ObservatorioPanel';
import { supabase } from './utils/supabase';
import { translations } from './utils/translations';

export default function App() {
  // Language routing state
  const [lang, setLang] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang) {
      return paramLang === 'en' ? 'en' : 'es';
    }
    const host = window.location.hostname;
    if (host.endsWith('.co') || host.endsWith('.cl') || host.endsWith('.es')) {
      return 'es';
    }
    const browserLang = navigator.language || navigator.userLanguage || '';
    return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  });

  const t = translations[lang];

  // View routing state: 'landing', 'dashboard', or 'login'
  const [view, setView] = useState('landing');
  
  // Dashboard internal active sub-tab: 'monitoreo' or 'comunidad'
  const [activeTab, setActiveTab] = useState('monitoreo');

  // Authentication State
  const [user, setUser] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Compute if the logged in user is a Brigadista or official administrator
  const isBrigadista = user && (
    user.email.endsWith('@nte.gov') || 
    user.email.endsWith('@brigada.org') || 
    user.user_metadata?.role === 'brigadista'
  );

  // Global Risk Score (0 to 1) - defaults to 0.72 (Rojo/Alarma)
  const [score, setScore] = useState(0.72);
  
  // Selected IoT node in the right sensor panel
  const [selectedNodeId, setSelectedNodeId] = useState(3);

  // Nodes list (stateful so they can adapt to score changes)
  const [nodes, setNodes] = useState([
    { id: 1, id_nodo: 'BST-01', name: 'P.N.R. El Vínculo', location: 'Buga, Valle del Cauca', sentidos: { olfato: { co_ppm: 12, voc_ppb: 110, pm25: 15.0, pm10: 24 }, tacto: { temp_aire: 36.5, humedad: 50, viento_vel: 12, viento_dir: 'NE', viento_angle: 45, presion_atm: 1014, humedad_suelo: 34, temp_contacto: 41.3 }, intuicion: { ndvi: 0.32 }, oido: { nivel_db: 40 }, vista: { iluminacion_lux: 4.0 } }, fusion: { status: 'alarm', riesgo: 0.85, nivel: 'rojo' } },
    { id: 2, id_nodo: 'BST-02', name: 'R.F. Bosque de Yotoco', location: 'Yotoco, Valle del Cauca', sentidos: { olfato: { co_ppm: 18, voc_ppb: 140, pm25: 18.2, pm10: 26 }, tacto: { temp_aire: 28.2, humedad: 55, viento_vel: 9, viento_dir: 'ENE', viento_angle: 60, presion_atm: 1012, humedad_suelo: 42, temp_contacto: 30.1 }, intuicion: { ndvi: 0.68 }, oido: { nivel_db: 42 }, vista: { iluminacion_lux: 2.2 } }, fusion: { status: 'warning', riesgo: 0.65, nivel: 'naranja' } },
    { id: 3, id_nodo: 'BST-03', name: 'R.N. Chimbilaco', location: 'Yotoco / La Virginia', sentidos: { olfato: { co_ppm: 115, voc_ppb: 545, pm25: 150.5, pm10: 210 }, tacto: { temp_aire: 32.5, humedad: 52, viento_vel: 28, viento_dir: 'WNW', viento_angle: 285, presion_atm: 1008, humedad_suelo: 18, temp_contacto: 45.4 }, intuicion: { ndvi: 0.22 }, oido: { nivel_db: 78 }, vista: { iluminacion_lux: 0.8 } }, fusion: { status: 'alarm', riesgo: 0.88, nivel: 'rojo' } },
    { id: 4, id_nodo: 'BST-04', name: 'Hacienda El Medio', location: 'Zarzal, Valle del Cauca', sentidos: { olfato: { co_ppm: 45, voc_ppb: 290, pm25: 45.0, pm10: 60 }, tacto: { temp_aire: 25.1, humedad: 62, viento_vel: 19, viento_dir: 'WSW', viento_angle: 240, presion_atm: 1010, humedad_suelo: 52, temp_contacto: 28.5 }, intuicion: { ndvi: 0.81 }, oido: { nivel_db: 65 }, vista: { iluminacion_lux: 1.5 } }, fusion: { status: 'normal', riesgo: 0.15, nivel: 'verde' } }
  ]);

  // Satellite hotspots (NASA FIRMS)
  const [hotspots, setHotspots] = useState([
    { id: 101, x: 490, y: 230 },
    { id: 102, x: 445, y: 280 }
  ]);

  // Alerts Timeline logs
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'danger', source: 'NODO IoT 03', message: 'ANOMALÍA TÉRMICA CRÍTICA: Temperatura de 48.9°C y CO > 110 ppm. Alta probabilidad de ignición inmediata.', time: '13:02:15' },
    { id: 2, type: 'warning', source: 'SATÉLITE NASA FIRMS', message: 'DETECTADO PUNTO DE CALOR: Anomalía térmica activa registrada en cuadrante C4 (Hotspot #101).', time: '12:58:30' },
    { id: 3, type: 'warning', source: 'ESTIMACIÓN NDVI', message: 'VEGETACIÓN EN RIESGO: Zona C4 desciende a NDVI 0.22 (Estrés hídrico extremo, combustible forestal seco).', time: '12:45:10' },
    { id: 4, type: 'info', source: 'SISTEMA CENTRAL', message: 'RED ACTIVA: Conexión establecida con los 5 nodos de defensa activa. Todos transmitiendo en ráfaga.', time: '12:00:00' }
  ]);

  // Listen to Supabase Auth State Changes
  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleCitizenReport = ({ nodeId, type, desc }) => {
    const time = new Date().toTimeString().split(' ')[0];
    const typeLabels = {
      fire: lang === 'en' ? 'Active Fire' : 'Fuego Activo',
      smoke: lang === 'en' ? 'Smoke Column' : 'Columna de Humo',
      burn: lang === 'en' ? 'Controlled Burning' : 'Quema Agrícola',
      other: lang === 'en' ? 'Suspicious Sighting' : 'Avistamiento Sospechoso'
    };

    setAlerts(prev => [
      {
        id: Date.now(),
        type: 'danger',
        source: `REPORTES CIUDADANOS (NODO 0${nodeId})`,
        message: `${typeLabels[type].toUpperCase()}: ${desc}`,
        time
      },
      ...prev
    ]);
  };

  // Effect to update nodes, hotspots and alerts dynamically when global score is adjusted
  useEffect(() => {
    // 1. Update nodes based on risk score
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        let n = JSON.parse(JSON.stringify(node)); // Deep clone
        if (n.id === 3) {
          // Critical alarm node
          if (score < 0.2) {
            n.fusion.status = 'normal'; n.sentidos.tacto.temp_aire = 23.4; n.sentidos.tacto.humedad = 65; n.sentidos.olfato.co_ppm = 8; n.sentidos.olfato.voc_ppb = 85; n.sentidos.tacto.viento_vel = 6; n.sentidos.intuicion.ndvi = 0.69; n.sentidos.tacto.humedad_suelo = 55; n.sentidos.olfato.pm25 = 10;
          } else if (score < 0.5) {
            n.fusion.status = 'warning'; n.sentidos.tacto.temp_aire = 34.2; n.sentidos.tacto.humedad = 32; n.sentidos.olfato.co_ppm = 42; n.sentidos.olfato.voc_ppb = 220; n.sentidos.tacto.viento_vel = 14; n.sentidos.intuicion.ndvi = 0.42; n.sentidos.tacto.humedad_suelo = 28; n.sentidos.olfato.pm25 = 35;
          } else if (score < 0.8) {
            n.fusion.status = 'alarm'; n.sentidos.tacto.temp_aire = 49.5; n.sentidos.tacto.humedad = 12; n.sentidos.olfato.co_ppm = 115; n.sentidos.olfato.voc_ppb = 545; n.sentidos.tacto.viento_vel = 28; n.sentidos.intuicion.ndvi = 0.22; n.sentidos.tacto.humedad_suelo = 8; n.sentidos.olfato.pm25 = 150.5;
          } else {
            n.fusion.status = 'alarm'; n.sentidos.tacto.temp_aire = 64.2; n.sentidos.tacto.humedad = 5; n.sentidos.olfato.co_ppm = 185; n.sentidos.olfato.voc_ppb = 720; n.sentidos.tacto.viento_vel = 38; n.sentidos.intuicion.ndvi = 0.12; n.sentidos.tacto.humedad_suelo = 2; n.sentidos.olfato.pm25 = 300;
          }
        } else if (n.id === 4) {
          // Warning/alarm neighbor node
          if (score < 0.3) {
            n.fusion.status = 'normal'; n.sentidos.tacto.temp_aire = 24.1; n.sentidos.tacto.humedad = 61; n.sentidos.olfato.co_ppm = 11; n.sentidos.olfato.voc_ppb = 112; n.sentidos.tacto.viento_vel = 8; n.sentidos.intuicion.ndvi = 0.65; n.sentidos.tacto.humedad_suelo = 50; n.sentidos.olfato.pm25 = 12;
          } else if (score < 0.6) {
            n.fusion.status = 'warning'; n.sentidos.tacto.temp_aire = 35.1; n.sentidos.tacto.humedad = 28; n.sentidos.olfato.co_ppm = 45; n.sentidos.olfato.voc_ppb = 290; n.sentidos.tacto.viento_vel = 19; n.sentidos.intuicion.ndvi = 0.41; n.sentidos.tacto.humedad_suelo = 22; n.sentidos.olfato.pm25 = 45;
          } else if (score < 0.8) {
            n.fusion.status = 'warning'; n.sentidos.tacto.temp_aire = 39.8; n.sentidos.tacto.humedad = 20; n.sentidos.olfato.co_ppm = 62; n.sentidos.olfato.voc_ppb = 340; n.sentidos.tacto.viento_vel = 24; n.sentidos.intuicion.ndvi = 0.35; n.sentidos.tacto.humedad_suelo = 15; n.sentidos.olfato.pm25 = 65;
          } else {
            n.fusion.status = 'alarm'; n.sentidos.tacto.temp_aire = 53.4; n.sentidos.tacto.humedad = 9; n.sentidos.olfato.co_ppm = 104; n.sentidos.olfato.voc_ppb = 490; n.sentidos.tacto.viento_vel = 32; n.sentidos.intuicion.ndvi = 0.18; n.sentidos.tacto.humedad_suelo = 5; n.sentidos.olfato.pm25 = 180;
          }
        } else {
          // Other nodes get slightly dryer/windier as score increases, but remain stable
          const dryFactor = score * 15;
          const tempFactor = score * 8;
          const windFactor = score * 12;
          n.sentidos.tacto.temp_aire = parseFloat((n.id === 1 ? 22.1 : n.id === 2 ? 23.5 : 21.8) + tempFactor).toFixed(1);
          n.sentidos.tacto.humedad = Math.max(10, Math.round((n.id === 1 ? 68 : n.id === 2 ? 64 : 72) - dryFactor));
          n.sentidos.tacto.viento_vel = Math.round((n.id === 1 ? 5 : n.id === 2 ? 6 : 4) + windFactor);
        }
        return n;
      });
    });

    // 2. Adjust Hotspots
    if (score < 0.3) {
      setHotspots([]);
    } else if (score < 0.6) {
      setHotspots([{ id: 101, x: 490, y: 230 }]);
    } else if (score < 0.8) {
      setHotspots([
        { id: 101, x: 490, y: 230 },
        { id: 102, x: 445, y: 280 }
      ]);
    } else {
      setHotspots([
        { id: 101, x: 490, y: 230 },
        { id: 102, x: 445, y: 280 },
        { id: 103, x: 520, y: 260 }
      ]);
    }

    // 3. Add a log indicating user score calibration
    const time = new Date().toTimeString().split(' ')[0];
    setAlerts(prev => [
      {
        id: Date.now(),
        type: score >= 0.8 ? 'danger' : score >= 0.4 ? 'warning' : 'info',
        source: 'SISTEMA CENTRAL',
        message: `Riesgo recalibrado por coordinador. Score global: ${score.toFixed(2)}. ${
          score >= 0.8 ? 'Estado de EVACUACIÓN / ALARMA activa.' : score >= 0.4 ? 'Estado de ALERTA preventiva.' : 'Estado bajo condiciones NORMALES.'
        }`,
        time
      },
      ...prev.slice(0, 15) // Keep last 15 logs
    ]);

  }, [score]);

  // Trigger simulated anomaly button
  const triggerSimulatedAnomaly = () => {
    const time = new Date().toTimeString().split(' ')[0];
    const randomNode = Math.floor(Math.random() * 5) + 1;
    
    // Set score high if they trigger anomaly
    setScore(0.85);
    setSelectedNodeId(randomNode);
    
    setAlerts(prev => [
      {
        id: Date.now(),
        type: 'danger',
        source: `NODO IoT 0${randomNode}`,
        message: `SIMULACIÓN: Anomalía crítica simulada. Sensores reportan picos térmicos y reducción de humedad en tiempo récord. Viento arreciando.`,
        time
      },
      ...prev
    ]);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];

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

  if (view === 'landing') {
    return (
      <LandingPage 
        onEnterDashboard={(tab) => {
          setView('dashboard');
          setActiveTab(tab === 'comunidad' ? 'comunidad' : tab === 'observatorio' ? 'observatorio' : 'monitoreo');
        }} 
        lang={lang}
        setLang={setLang}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setView('login')}
      />
    );
  }

  if (view === 'login') {
    return (
      <LoginPage 
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          setView('dashboard');
        }}
        onBack={() => setView('landing')}
        lang={lang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] text-[#2D3436] flex flex-col antialiased">
      {/* Header bar */}
      <Header 
        onBackToLanding={() => setView('landing')} 
        lang={lang} 
        setLang={setLang} 
        user={user} 
        onLogout={handleLogout} 
        onOpenLogin={() => setView('login')} 
        isDashboard={true}
        onEnterDashboard={(tab) => {
          setView('dashboard');
          setActiveTab(tab === 'comunidad' ? 'comunidad' : tab === 'observatorio' ? 'observatorio' : 'monitoreo');
        }}
      />

      {/* Main Content Layout - Dynamic Tab Routing */}
      {activeTab === 'observatorio' ? (
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto mt-28">
          <ObservatorioPanel
            lang={lang}
            globalScore={score}
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            setActiveTab={setActiveTab}
          />
        </main>
      ) : activeTab === 'monitoreo' ? (
        <>
          {/* Control & Status Bar with layout offset (only in telemetry view) */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-col xl:flex-row items-center justify-between gap-4 text-xs shadow-xs mt-28">
            
            {/* Left Side: Telemetry Status */}
            <div className="flex flex-wrap items-center gap-4 font-mono text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <Wifi className="h-3.5 w-3.5" />
                {t.dbTitle}
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                <Database className="h-3.5 w-3.5" />
                {t.dbTelemetry}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {t.dbSincro}: {new Date().toLocaleDateString()} COT
              </span>
            </div>

            {/* Center: Global Alert status badge */}
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${risk.borderColor} ${risk.bgMuted} transition-all duration-500 font-sans`}>
              <span className="text-sm">{risk.icon}</span>
              <span className={`font-bold ${risk.textColor} text-xs`}>
                {risk.label}
              </span>
              <span className="text-slate-600 text-[11px] font-medium hidden sm:inline">
                {risk.desc}
              </span>
            </div>

            {/* Right Side: Risk Score Slider & Reset */}
            <div className="flex items-center gap-4 font-sans w-full xl:w-auto max-w-sm xl:max-w-xs justify-end">
              <div className="flex flex-col gap-0.5 w-full">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#2D3436] mb-0.5">
                  <span>{t.dbSimulatedRisk}</span>
                  <span>{(score * 100).toFixed(0)}%</span>
                </div>
                
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full w-[40%] bg-[#52B788] opacity-20"></div>
                  <div className="h-full w-[30%] bg-[#F4A261] opacity-20"></div>
                  <div className="h-full w-[30%] bg-[#E63946] opacity-20"></div>
                  
                  <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${
                      score <= 0.4 ? 'bg-[#52B788]' : score <= 0.7 ? 'bg-[#F4A261]' : 'bg-[#E63946]'
                    }`}
                    style={{ width: `${score * 100}%` }}
                  ></div>
                  
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
              </div>

              <button 
                onClick={() => setScore(0.72)} 
                className="flex items-center gap-1 hover:bg-gray-100 hover:text-slate-900 transition-colors duration-200 border border-gray-200 rounded-full px-3 py-1.5 bg-gray-50 cursor-pointer text-slate-600 font-mono text-[10px] shrink-0 font-semibold"
              >
                <RefreshCw className="h-3 w-3" />
                {t.dbReset}
              </button>
            </div>
          </div>

          <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            <NodesSummary nodes={nodes} lang={lang} />
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 shrink-0">
              {/* Left/Middle Column (Map & Alerts) - Takes 7/12 cols on desktop */}
              <div className="xl:col-span-7 flex flex-col gap-6 h-full">
                {/* Map Section */}
                <div className="flex-1 min-h-[380px]">
                  <MapSimulator
                    score={score}
                    nodes={nodes}
                    selectedNodeId={selectedNodeId}
                    setSelectedNodeId={setSelectedNodeId}
                    hotspots={hotspots}
                    setHotspots={setHotspots}
                    lang={lang}
                  />
                </div>

                {/* El bloque de MapSimulator ocupa todo el alto de la columna izquierda */}
              </div>

              {/* Right Column (Sensor metrics panel) - Takes 5/12 cols on desktop */}
              <div className="xl:col-span-5 flex flex-col gap-6 h-full">
                <SensorPanel node={selectedNode} globalScore={score} lang={lang} />
              </div>
            </div>
            
            {/* New Real-time Monitoring Sections */}
            <div className="flex flex-col gap-6 shrink-0 w-full mt-2">
              <TimeSeriesPanel node={selectedNode} lang={lang} />
              <NodeComparisonTable nodes={nodes} lang={lang} />
            </div>
          </main>
        </>
      ) : (
        <main className="flex-1 overflow-y-auto pt-28">
          <CommunityForum user={user} isBrigadista={isBrigadista} lang={lang} />
        </main>
      )}
      
      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 text-center text-xs text-slate-400 font-mono shadow-xs">
        {t.dbFooter}
      </footer>

      {/* Auth Modals */}
      <PublicReportModal 
        isOpen={reportModalOpen} 
        onClose={() => setReportModalOpen(false)} 
        onSubmitReport={handleCitizenReport} 
        lang={lang} 
      />

      <Chatbot />
    </div>
  );
}
