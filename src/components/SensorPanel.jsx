/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { Thermometer, Droplet, Wind, Eye, Compass, Activity, Cloud } from 'lucide-react';

export default function SensorPanel({ node, globalScore }) {
  const [acousticData, setAcousticData] = useState([30, 45, 60, 35, 70, 85, 40, 50, 65, 55]);
  const canvasRef = useRef(null);

  // Audio frequency animation (simulated real-time acoustic scan)
  useEffect(() => {
    const interval = setInterval(() => {
      setAcousticData(prev => 
        prev.map(val => {
          const baseChange = Math.floor(Math.random() * 21) - 10;
          const limit = node.status === 'alarm' ? 95 : node.status === 'warning' ? 70 : 40;
          const min = node.status === 'alarm' ? 55 : 20;
          let newVal = val + baseChange;
          if (newVal > limit) newVal = limit - 10;
          if (newVal < min) newVal = min + 10;
          return newVal;
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, [node]);

  // Canvas-based ESP32-CAM thermal mockup drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let frame = 0;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Dark background for viewfinder to make thermal feed stand out
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 20; i < w; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 20; j < h; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // Draw simulated forest background elements
      ctx.fillStyle = '#064E3B';
      // Left trees
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(30, h - 50);
      ctx.lineTo(70, h);
      ctx.fill();
      
      // Right trees
      ctx.beginPath();
      ctx.moveTo(w - 80, h);
      ctx.lineTo(w - 40, h - 70);
      ctx.lineTo(w, h);
      ctx.fill();

      // Draw threat depending on status
      if (node.status === 'alarm') {
        const flameCenterX = w / 2 + Math.sin(frame * 0.1) * 5;
        const flameCenterY = h / 2 + 10;
        const radius = 22 + Math.sin(frame * 0.3) * 5;

        // Outer thermal glow (coral red / orange)
        const glowGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 4, flameCenterX, flameCenterY, radius * 2.3);
        glowGrad.addColorStop(0, 'rgba(248, 113, 113, 0.8)'); // Coral red
        glowGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.45)');
        glowGrad.addColorStop(1, 'rgba(248, 113, 113, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(flameCenterX, flameCenterY, radius * 2.3, 0, Math.PI * 2);
        ctx.fill();

        // Inner fire core
        const fireGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 2, flameCenterX, flameCenterY - 8, radius);
        fireGrad.addColorStop(0, '#FFFFFF');
        fireGrad.addColorStop(0.3, '#FBBF24'); // Amber
        fireGrad.addColorStop(0.7, '#F97316');
        fireGrad.addColorStop(1, 'rgba(248, 113, 113, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(flameCenterX - radius, flameCenterY);
        ctx.quadraticCurveTo(flameCenterX - radius/2, flameCenterY - radius * 1.4, flameCenterX, flameCenterY - radius * 1.8);
        ctx.quadraticCurveTo(flameCenterX + radius/2, flameCenterY - radius * 1.4, flameCenterX + radius, flameCenterY);
        ctx.closePath();
        ctx.fill();

        // ESP32 AI Target box
        ctx.strokeStyle = '#F87171'; // Coral red
        ctx.lineWidth = 1.5;
        ctx.strokeRect(flameCenterX - radius - 12, flameCenterY - radius - 30, radius * 2 + 24, radius * 2 + 42);

        // Target Box Text
        ctx.fillStyle = '#F87171';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`ANOMALIA: LLAMA ACTIVA (${Math.floor(92 + Math.sin(frame*0.05)*6)}%)`, flameCenterX - radius - 9, flameCenterY - radius - 35);
      } else if (node.status === 'warning') {
        // Draw smoke
        const smokeX = w / 2 - 15 + Math.sin(frame * 0.05) * 12;
        const smokeY = h / 2 - 8;
        
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 12, 0, Math.PI * 2);
        ctx.arc(smokeX + 8, smokeY - 12, 18, 0, Math.PI * 2);
        ctx.arc(smokeX - 8, smokeY - 20, 15, 0, Math.PI * 2);
        ctx.fill();

        // Target box for warning
        ctx.strokeStyle = '#F59E0B'; // Amber
        ctx.lineWidth = 1.5;
        ctx.strokeRect(smokeX - 20, smokeY - 35, 50, 55);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`HUMO DETECTADO (${Math.floor(74 + Math.sin(frame*0.04)*4)}%)`, smokeX - 18, smokeY - 40);
      } else {
        // Stable state
        ctx.strokeStyle = '#10B981'; // Emerald Green
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#10B981';
        ctx.font = '8px monospace';
        ctx.fillText("VISTA CAM: NO SE DETECTAN ANOMALIAS", w/2 - 75, 12);
      }

      // Camera status overlays
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '9px monospace';
      ctx.fillText(`ESP32-CAM // NODE_0${node.id}`, 8, 16);
      
      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(timeStr, w - 65, 16);

      // Flickering green dot
      if (Math.floor(frame / 12) % 2 === 0) {
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(12, h - 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("LIVE FEED", 20, h - 9);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [node]);

  // Get status color styling helper
  const getStatusBadgeClass = (status) => {
    if (status === 'alarm') return 'bg-red-50 text-[#C21C1C] border-red-200';
    if (status === 'warning') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-4 h-full shadow-xs">
      {/* Sensor Title Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-blue-600" />
          <h2 className="text-xs font-bold tracking-wider text-slate-800 uppercase m-0 font-sans">
            SENSORES: NODO 0{node.id}
          </h2>
        </div>
        
        <div className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(node.status)} flex items-center gap-1.5 transition-all`}>
          <span className={`w-1.5 h-1.5 rounded-full ${node.status === 'alarm' ? 'bg-[#EF4444]' : node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
          <span>ESTADO: {node.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Grid of the Senses (Bento Grid layout with generous padding) */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
        
        {/* Card 1: Temperature Sub-card */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">TEMPERATURA</span>
            <Thermometer className={`h-4 w-4 ${node.temp > 35 ? 'text-[#EF4444] animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold tracking-tight font-sans ${node.temp > 35 ? 'text-[#C21C1C]' : 'text-slate-900'}`}>
              {node.temp}°C
            </span>
            {/* Thin clean gauge */}
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${node.temp > 35 ? 'bg-[#EF4444]' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (node.temp / 60) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Humidity Sub-card */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">HUMEDAD REL.</span>
            <Droplet className={`h-4 w-4 ${node.hum < 20 ? 'text-amber-500' : 'text-blue-500'}`} />
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold tracking-tight font-sans ${node.hum < 20 ? 'text-[#C21C1C]' : 'text-slate-900'}`}>
              {node.hum}%
            </span>
            {/* Thin clean gauge */}
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${node.hum < 20 ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${node.hum}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: CO Sub-card (Gas) */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">MONÓXIDO (CO)</span>
            <Cloud className={`h-4 w-4 ${node.co > 80 ? 'text-[#EF4444]' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-sans text-slate-800">{node.co} <span className="text-xs font-normal text-slate-500">ppm</span></span>
            {/* Thin progress bar with soft color scale */}
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${node.co > 85 ? 'bg-[#EF4444]' : node.co > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (node.co / 150) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 4: VOC Sub-card (Gas) */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">C. ORGÁNICOS (VOC)</span>
            <Cloud className={`h-4 w-4 ${node.voc > 400 ? 'text-[#EF4444]' : 'text-slate-400'}`} />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold font-sans text-slate-800">{node.voc} <span className="text-xs font-normal text-slate-500">ppm</span></span>
            {/* Thin progress bar with soft color scale */}
            <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-3">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${node.voc > 400 ? 'bg-[#EF4444]' : node.voc > 200 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (node.voc / 800) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 5: Audio Spectrum Sub-card */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl col-span-2 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">ANÁLISIS ACÚSTICO</span>
            <span className={`text-[9px] font-mono font-bold ${node.status === 'alarm' ? 'text-[#C21C1C] animate-pulse' : 'text-slate-500'}`}>
              {node.status === 'alarm' ? 'DETECTADO CREPITACIÓN' : 'ESPECTRO AMBIENTAL'}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-mono block mb-2">Frecuencia (100 - 1000 Hz)</span>
          {/* Dynamic frequencies bar chart on light panel background */}
          <div className="flex items-end justify-between h-14 bg-white p-2 rounded-lg border border-slate-100 gap-0.5">
            {acousticData.map((val, idx) => (
              <div key={idx} className="flex-1 bg-slate-100 rounded-t overflow-hidden h-full flex items-end">
                <div 
                  className={`w-full transition-all duration-150 rounded-t ${
                    node.status === 'alarm' ? 'bg-[#EF4444]' : node.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ height: `${val}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Environmental Context Sub-card */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl col-span-2 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">VIENTO & VEGETACIÓN (CONTEXTUAL)</span>
            <Compass className="h-4 w-4 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-gray-200/80 pr-2">
              <span className="text-[9px] text-slate-400 font-bold block font-mono">VELOCIDAD VIENTO</span>
              <span className="text-md font-bold font-sans text-slate-800 block mt-1">
                {node.windSpeed} km/h
              </span>
              <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1 mt-1">
                <Wind className="h-3.5 w-3.5 text-blue-500 shrink-0" style={{ transform: `rotate(${node.windAngle}deg)` }} />
                <span>DIR: {node.windDir}</span>
              </span>
            </div>
            <div className="pl-2">
              <span className="text-[9px] text-slate-400 font-bold block font-mono">INDICE VEG. NDVI</span>
              <span className={`text-md font-bold font-sans block mt-1 ${node.ndvi < 0.35 ? 'text-[#C21C1C]' : node.ndvi < 0.55 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {node.ndvi.toFixed(2)}
              </span>
              <span className="text-[8px] text-slate-500 font-mono font-medium block mt-1 leading-normal">
                {node.ndvi < 0.35 ? 'Combustible seco / Riesgo' : node.ndvi < 0.55 ? 'Estrés hídrico' : 'Vegetación sana'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 7: ESP32-CAM Viewfinder Sub-card */}
        <div className="bg-[#F8F9FA] border border-gray-200 p-4 rounded-xl col-span-2 shadow-2xs hover:shadow-xs hover:border-gray-300 transition-all flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">MONITOR SENSADO VISUAL</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-[#EF4444] animate-pulse" />
              <span className="text-[9px] font-mono text-[#C21C1C] font-bold tracking-wider">ESP32-CAM</span>
            </div>
          </div>
          <div className="crt-effect border border-gray-200 rounded-lg overflow-hidden aspect-video bg-slate-900 flex items-center justify-center relative shadow-inner">
            <canvas 
              ref={canvasRef} 
              width={380} 
              height={190} 
              className="w-full h-full object-cover block"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
