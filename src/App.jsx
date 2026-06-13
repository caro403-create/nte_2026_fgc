/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, no-unused-vars */
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MapSimulator from './components/MapSimulator';
import SensorPanel from './components/SensorPanel';
import AlertsAndActions from './components/AlertsAndActions';
import { Shield, Wifi, Database, Clock, RefreshCw } from 'lucide-react';
import EmergencyPanel from './components/EmergencyPanel';


export default function App() {
  // Global Risk Score (0 to 1) - defaults to 0.72 (Rojo/Alarma)
  const [score, setScore] = useState(0.72);

  // States for mission controls
  const [droneActive, setDroneActive] = useState(false);
  const [evacRoutesActive, setEvacRoutesActive] = useState(false);
  const [acousticAlertActive, setAcousticAlertActive] = useState(false);
  
  // Selected IoT node in the right sensor panel
  const [selectedNodeId, setSelectedNodeId] = useState(3);

  // Nodes list (stateful so they can adapt to score changes)
  const [nodes, setNodes] = useState([
    { id: 1, x: 120, y: 180, status: 'normal', temp: 24.5, hum: 62, co: 12, voc: 110, windSpeed: 8, windDir: 'NE', windAngle: 45, ndvi: 0.72 },
    { id: 2, x: 280, y: 110, status: 'normal', temp: 26.2, hum: 58, co: 18, voc: 140, windSpeed: 9, windDir: 'ENE', windAngle: 60, ndvi: 0.68 },
    { id: 3, x: 480, y: 240, status: 'alarm', temp: 48.9, hum: 14, co: 112, voc: 540, windSpeed: 28, windDir: 'WNW', windAngle: 285, ndvi: 0.22 },
    { id: 4, x: 410, y: 320, status: 'warning', temp: 35.1, hum: 28, co: 45, voc: 290, windSpeed: 19, windDir: 'WSW', windAngle: 240, ndvi: 0.41 },
    { id: 5, x: 620, y: 160, status: 'normal', temp: 23.8, hum: 65, co: 10, voc: 95, windSpeed: 6, windDir: 'E', windAngle: 90, ndvi: 0.75 }
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

  // Effect to update nodes, hotspots and alerts dynamically when global score is adjusted
  useEffect(() => {
    // 1. Update nodes based on risk score
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        if (node.id === 3) {
          // Critical alarm node
          if (score < 0.2) {
            return { ...node, status: 'normal', temp: 23.4, hum: 65, co: 8, voc: 85, windSpeed: 6, ndvi: 0.69 };
          } else if (score < 0.5) {
            return { ...node, status: 'warning', temp: 34.2, hum: 32, co: 42, voc: 220, windSpeed: 14, ndvi: 0.42 };
          } else if (score < 0.8) {
            return { ...node, status: 'alarm', temp: 48.9, hum: 14, co: 112, voc: 540, windSpeed: 28, ndvi: 0.22 };
          } else {
            return { ...node, status: 'alarm', temp: 64.2, hum: 5, co: 185, voc: 720, windSpeed: 38, ndvi: 0.12 };
          }
        }
        if (node.id === 4) {
          // Warning/alarm neighbor node
          if (score < 0.3) {
            return { ...node, status: 'normal', temp: 24.1, hum: 61, co: 11, voc: 112, windSpeed: 8, ndvi: 0.65 };
          } else if (score < 0.6) {
            return { ...node, status: 'warning', temp: 35.1, hum: 28, co: 45, voc: 290, windSpeed: 19, ndvi: 0.41 };
          } else if (score < 0.8) {
            return { ...node, status: 'warning', temp: 39.8, hum: 20, co: 62, voc: 340, windSpeed: 24, ndvi: 0.35 };
          } else {
            return { ...node, status: 'alarm', temp: 53.4, hum: 9, co: 104, voc: 490, windSpeed: 32, ndvi: 0.18 };
          }
        }
        // Other nodes get slightly dryer/windier as score increases, but remain stable
        const dryFactor = score * 15;
        const tempFactor = score * 8;
        const windFactor = score * 12;
        return {
          ...node,
          temp: parseFloat((node.id === 1 ? 22.1 : node.id === 2 ? 23.5 : 21.8) + tempFactor).toFixed(1),
          hum: Math.max(10, Math.round((node.id === 1 ? 68 : node.id === 2 ? 64 : 72) - dryFactor)),
          windSpeed: Math.round((node.id === 1 ? 5 : node.id === 2 ? 6 : 4) + windFactor)
        };
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

  const addSystemLog = (source, message, type) => {
    const time = new Date().toTimeString().split(' ')[0];
    setAlerts(prev => [
      {
        id: Date.now() + Math.random(),
        type,
        source,
        message,
        time
      },
      ...prev
    ]);
  };

  // Quick Action feedback logs
  useEffect(() => {
    if (droneActive) {
      addSystemLog('DRON RECON', 'Misión aérea iniciada. Dron de ala fija despegando de base regional. Estimado de arribo a Zona C4: 4 min.', 'info');
    } else {
      addSystemLog('DRON RECON', 'Dron retornado a base. Inspección completada y guardada en registros.', 'success');
    }
  }, [droneActive]);

  useEffect(() => {
    if (evacRoutesActive) {
      addSystemLog('CONTROL DE EVACUACIÓN', 'Rutas de escape activadas. Desplegando señalizadores luminosos forestales hacia Zonas Seguras A y B.', 'success');
    } else {
      addSystemLog('CONTROL DE EVACUACIÓN', 'Rutas de evacuación en standby.', 'info');
    }
  }, [evacRoutesActive]);

  useEffect(() => {
    if (acousticAlertActive) {
      addSystemLog('ALERTA BIOACÚSTICA', 'Emisión ultrasónica activa en Nodos 3 y 4. Dispersión preventiva de avifauna y fauna terrestre iniciada.', 'danger');
    } else {
      addSystemLog('ALERTA BIOACÚSTICA', 'Emisores de frecuencia desactivados.', 'info');
    }
  }, [acousticAlertActive]);


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

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col antialiased">
      {/* Header bar */}
      <Header score={score} setScore={setScore} />

      {/* Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2 shadow-xs">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <Wifi className="h-3.5 w-3.5" />
            RED NODOS: ONLINE (5/5)
          </span>
          <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
            <Database className="h-3.5 w-3.5" />
            TELEMETRÍA: LORA WAN 915MHZ
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-600 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            SINCRO: {new Date().toLocaleDateString()} 13:08 COT
          </span>
          <button 
            onClick={() => setScore(0.72)} 
            className="flex items-center gap-1 hover:bg-gray-100 hover:text-slate-900 transition-colors duration-200 border border-gray-200 rounded px-1.5 py-0.5 bg-gray-50 cursor-pointer text-slate-600 font-medium"
          >
            <RefreshCw className="h-3 w-3" />
            RESTABLECER
          </button>
        </div>
      </div>

      {/* Main Content Layout - Single Pane of Glass */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
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
              droneActive={droneActive}
              evacRoutesActive={evacRoutesActive}
              acousticAlertActive={acousticAlertActive}
              hotspots={hotspots}
              setHotspots={setHotspots}
            />
          </div>

          {/* Alerts Timeline & Action Buttons Section */}
          <div className="shrink-0">
            <AlertsAndActions
              alerts={alerts}
              clearAlerts={clearAlerts}
              droneActive={droneActive}
              setDroneActive={setDroneActive}
              evacRoutesActive={evacRoutesActive}
              setEvacRoutesActive={setEvacRoutesActive}
              acousticAlertActive={acousticAlertActive}
              setAcousticAlertActive={setAcousticAlertActive}
              onTriggerSimulatedAlert={triggerSimulatedAnomaly}
            />
          </div>
        </div>

        {/* Right Column (Sensor metrics panel) - Takes 5/12 cols on desktop */}
        <div className="xl:col-span-5 h-full">
          <SensorPanel node={selectedNode} globalScore={score} />
        </div>
        </div>
        
        {/* Emergency Panel */}
        <div className="shrink-0">
          <EmergencyPanel globalScore={score} />
        </div>
      </main>
      
      {/* Footer copyright */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 text-center text-xs text-slate-400 font-mono shadow-xs">
        SISTEMA DE DEFENSA ACTIVA © 2026 // EQUIPO COLOMBIA // DESARROLLADO PARA ENTORNOS DE MISIÓN CRÍTICA
      </footer>
    </div>
  );
}
