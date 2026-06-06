/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react';
import { Thermometer, Wind, Eye, Compass, Activity } from 'lucide-react';


export default function SensorPanel({ node, globalScore }) {
  const [acousticData, setAcousticData] = useState([30, 45, 60, 35, 70, 85, 40, 50, 65, 55]);
  const canvasRef = useRef(null);

  // Audio frequency animation (simulated real-time acoustic scan)
  useEffect(() => {
    const interval = setInterval(() => {
      setAcousticData(prev => 
        prev.map(val => {
          const baseChange = Math.floor(Math.random() * 21) - 10;
          // Scale activity based on node alarm level
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

  // Canvas-based ESP32-CAM mockup drawing
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

      // Background - simulated thermal (infrared) night vision green-blue gradient
      ctx.fillStyle = '#060d17';
      ctx.fillRect(0, 0, w, h);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(30, 58, 138, 0.25)';
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
      ctx.fillStyle = '#043425';
      // Left trees
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(30, h - 60);
      ctx.lineTo(70, h);
      ctx.fill();
      
      // Right trees
      ctx.beginPath();
      ctx.moveTo(w - 80, h);
      ctx.lineTo(w - 40, h - 85);
      ctx.lineTo(w, h);
      ctx.fill();

      // Draw threat depending on status
      if (node.status === 'alarm') {
        // Draw fire flames on canvas
        const flameCenterX = w / 2 + Math.sin(frame * 0.1) * 5;
        const flameCenterY = h / 2 + 10;
        const radius = 25 + Math.sin(frame * 0.3) * 6;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 5, flameCenterX, flameCenterY, radius * 2.5);
        glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        glowGrad.addColorStop(0.4, 'rgba(249, 115, 22, 0.4)');
        glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(flameCenterX, flameCenterY, radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner fire
        const fireGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 2, flameCenterX, flameCenterY - 10, radius);
        fireGrad.addColorStop(0, '#ffffff');
        fireGrad.addColorStop(0.3, '#facc15'); // Yellow
        fireGrad.addColorStop(0.7, '#f97316'); // Orange
        fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(flameCenterX - radius, flameCenterY);
        ctx.quadraticCurveTo(flameCenterX - radius/2, flameCenterY - radius * 1.5, flameCenterX, flameCenterY - radius * 2);
        ctx.quadraticCurveTo(flameCenterX + radius/2, flameCenterY - radius * 1.5, flameCenterX + radius, flameCenterY);
        ctx.closePath();
        ctx.fill();

        // ESP32 AI Target Box
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(flameCenterX - radius - 15, flameCenterY - radius - 35, radius * 2 + 30, radius * 2 + 50);

        // Target Box Text
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`ANOMALIA: LLAMA ACTIVA (${Math.floor(92 + Math.sin(frame*0.05)*6)}%)`, flameCenterX - radius - 12, flameCenterY - radius - 42);
      } else if (node.status === 'warning') {
        // Draw smoke
        const smokeX = w / 2 - 20 + Math.sin(frame * 0.05) * 15;
        const smokeY = h / 2 - 10;
        
        ctx.fillStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 15, 0, Math.PI * 2);
        ctx.arc(smokeX + 10, smokeY - 15, 22, 0, Math.PI * 2);
        ctx.arc(smokeX - 10, smokeY - 25, 18, 0, Math.PI * 2);
        ctx.fill();

        // ESP32 Target Box
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(smokeX - 25, smokeY - 45, 60, 70);

        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`HUMO DETECTADO (${Math.floor(74 + Math.sin(frame*0.04)*4)}%)`, smokeX - 22, smokeY - 50);
      } else {
        // Safe state
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#22c55e';
        ctx.font = '8px monospace';
        ctx.fillText("VISTA CAM: NO SE DETECTAN ANOMALIAS", w/2 - 75, 12);
      }

      // Camera status overlays
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '9px monospace';
      ctx.fillText(`ESP32-CAM // NODE_0${node.id}`, 8, 16);
      
      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(timeStr, w - 65, 16);

      // Flickering green dot
      if (Math.floor(frame / 10) % 2 === 0) {
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(12, h - 12, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText("REC", 20, h - 9);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationId);
  }, [node]);

  // Get status color helper
  const getStatusTextClass = (status) => {
    if (status === 'alarm') return 'text-red-500 font-extrabold';
    if (status === 'warning') return 'text-orange-500 font-bold';
    return 'text-green-500 font-medium';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-4 h-full">
      {/* Sensor Title Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-sm font-bold tracking-wider text-gray-200 uppercase m-0">
            SENSORES: NODO 0{node.id}
          </h2>
        </div>
        <div className="text-[10px] font-mono bg-gray-950 px-2 py-1 rounded border border-gray-800 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
          <span>ESTADO: <span className={getStatusTextClass(node.status)}>{node.status.toUpperCase()}</span></span>
        </div>
      </div>

      {/* Grid of the 5 Senses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {/* 1. TACTO (Térmico) */}
        <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">I. TACTO (TÉRMICO)</span>
            <Thermometer className={`h-4 w-4 ${node.temp > 35 ? 'text-red-500 animate-bounce' : 'text-orange-400'}`} />
          </div>
          <div className="flex items-end justify-between mt-1">
            <div>
              <span className="text-xs text-gray-400 block font-mono">Temperatura</span>
              <span className={`text-2xl font-black font-mono tracking-tight ${node.temp > 35 ? 'text-red-500' : 'text-white'}`}>
                {node.temp}°C
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-mono">Humedad R.</span>
              <span className={`text-xl font-bold font-mono tracking-tight ${node.hum < 30 ? 'text-orange-400' : 'text-white'}`}>
                {node.hum}%
              </span>
            </div>
          </div>
          {/* Progress bar gauges */}
          <div className="mt-2.5 space-y-1">
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${node.temp > 35 ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(100, (node.temp / 50) * 100)}%` }}
              />
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${node.hum}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. OLFATO (Químico) */}
        <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">II. OLFATO (QUÍMICO)</span>
            <span className="text-[9px] font-mono text-gray-400 bg-gray-900 px-1 py-0.5 rounded border border-gray-800">GASES</span>
          </div>
          <div className="space-y-2.5 mt-1">
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-gray-400">CO (Monóxido de Carbono)</span>
                <span className={`font-bold ${node.co > 80 ? 'text-red-500' : 'text-gray-300'}`}>{node.co} ppm</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${node.co > 80 ? 'bg-red-500' : node.co > 40 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (node.co / 150) * 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-mono mb-0.5">
                <span className="text-gray-400">VOC (Comp. Orgánicos Vól.)</span>
                <span className={`font-bold ${node.voc > 400 ? 'text-red-500' : 'text-gray-300'}`}>{node.voc} ppm</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${node.voc > 400 ? 'bg-red-500' : node.voc > 200 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, (node.voc / 800) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. OÍDO (Acústico) */}
        <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">III. OÍDO (ACÚSTICO)</span>
            <span className={`text-[9px] font-mono ${node.status === 'alarm' ? 'text-red-400 animate-pulse font-extrabold' : 'text-gray-500'}`}>
              {node.status === 'alarm' ? 'CREPITACIÓN' : 'ESPECTRO ACTIVO'}
            </span>
          </div>
          <span className="text-[10px] text-gray-400 block font-mono mb-2">Frecuencia (100 - 1000 Hz)</span>
          {/* Dynamic frequencies bar chart */}
          <div className="flex items-end justify-between h-14 bg-gray-900/60 p-1.5 rounded border border-gray-900 gap-0.5">
            {acousticData.map((val, idx) => (
              <div key={idx} className="flex-1 bg-gray-800 rounded-t overflow-hidden h-full flex items-end">
                <div 
                  className={`w-full transition-all duration-150 rounded-t ${
                    node.status === 'alarm' ? 'bg-red-500' : node.status === 'warning' ? 'bg-orange-400' : 'bg-blue-500'
                  }`}
                  style={{ height: `${val}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. INTUICIÓN (Contextual) */}
        <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">IV. INTUICIÓN (CONTEXTO)</span>
            <Compass className="h-4 w-4 text-blue-400" />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <span className="text-[10px] text-gray-500 block font-mono">VIENTO</span>
              <span className="text-sm font-bold font-mono text-white block mt-0.5">
                {node.windSpeed} km/h
              </span>
              <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                <Wind className="h-3 w-3 shrink-0 text-blue-400" style={{ transform: `rotate(${node.windAngle}deg)` }} />
                <span>DIR: {node.windDir}</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block font-mono">INDICE NDVI</span>
              <span className={`text-sm font-bold font-mono block mt-0.5 ${node.ndvi < 0.35 ? 'text-red-400' : node.ndvi < 0.55 ? 'text-yellow-400' : 'text-green-400'}`}>
                {node.ndvi.toFixed(2)}
              </span>
              <span className="text-[8px] text-gray-400 font-mono block">
                {node.ndvi < 0.35 ? 'Sequedad Extrema' : node.ndvi < 0.55 ? 'Estrés Hídrico' : 'Vegetación Sana'}
              </span>
            </div>
          </div>
        </div>

        {/* 5. VISTA (Visual ESP32-CAM) */}
        <div className="bg-gray-950/80 p-3 rounded-lg border border-gray-800 sm:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-500 font-mono tracking-wider">V. VISTA (SENSADO VISUAL)</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-red-500" />
              <span className="text-[9px] font-mono text-red-400 font-bold tracking-wider">ESP32-CAM FEED</span>
            </div>
          </div>
          <div className="crt-effect border border-gray-800 rounded overflow-hidden aspect-video bg-black flex items-center justify-center relative">
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
