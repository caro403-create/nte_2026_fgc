import React, { useEffect, useState, useRef } from 'react';
import { Thermometer, Droplet, Wind, Eye, Compass, Activity, Cloud, HelpCircle } from 'lucide-react';

export default function SensorPanel({ node, globalScore }) {
  const [acousticData, setAcousticData] = useState([30, 45, 60, 35, 70, 85, 40, 50, 65, 55]);
  const canvasRef = useRef(null);

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

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(51, 65, 85, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 20; i < w; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      }
      for (let j = 20; j < h; j += 20) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke();
      }

      ctx.fillStyle = '#064E3B';
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(30, h - 50); ctx.lineTo(70, h); ctx.fill();
      ctx.beginPath(); ctx.moveTo(w - 80, h); ctx.lineTo(w - 40, h - 70); ctx.lineTo(w, h); ctx.fill();

      if (node.status === 'alarm') {
        const flameCenterX = w / 2 + Math.sin(frame * 0.1) * 5;
        const flameCenterY = h / 2 + 10;
        const radius = 22 + Math.sin(frame * 0.3) * 5;

        const glowGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 4, flameCenterX, flameCenterY, radius * 2.3);
        glowGrad.addColorStop(0, 'rgba(230, 57, 70, 0.8)');
        glowGrad.addColorStop(0.5, 'rgba(244, 162, 97, 0.45)');
        glowGrad.addColorStop(1, 'rgba(230, 57, 70, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath(); ctx.arc(flameCenterX, flameCenterY, radius * 2.3, 0, Math.PI * 2); ctx.fill();

        const fireGrad = ctx.createRadialGradient(flameCenterX, flameCenterY, 2, flameCenterX, flameCenterY - 8, radius);
        fireGrad.addColorStop(0, '#FFFFFF');
        fireGrad.addColorStop(0.3, '#F4A261');
        fireGrad.addColorStop(0.7, '#E63946');
        fireGrad.addColorStop(1, 'rgba(230, 57, 70, 0)');
        ctx.fillStyle = fireGrad;
        ctx.beginPath();
        ctx.moveTo(flameCenterX - radius, flameCenterY);
        ctx.quadraticCurveTo(flameCenterX - radius/2, flameCenterY - radius * 1.4, flameCenterX, flameCenterY - radius * 1.8);
        ctx.quadraticCurveTo(flameCenterX + radius/2, flameCenterY - radius * 1.4, flameCenterX + radius, flameCenterY);
        ctx.closePath(); ctx.fill();

        ctx.strokeStyle = '#E63946';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(flameCenterX - radius - 12, flameCenterY - radius - 30, radius * 2 + 24, radius * 2 + 42);

        ctx.fillStyle = '#E63946';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(`LLAMA ACTIVA (${Math.floor(92 + Math.sin(frame*0.05)*6)}%)`, flameCenterX - radius - 9, flameCenterY - radius - 35);
      } else if (node.status === 'warning') {
        const smokeX = w / 2 - 15 + Math.sin(frame * 0.05) * 12;
        const smokeY = h / 2 - 8;
        
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 12, 0, Math.PI * 2);
        ctx.arc(smokeX + 8, smokeY - 12, 18, 0, Math.PI * 2);
        ctx.arc(smokeX - 8, smokeY - 20, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#F4A261';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(smokeX - 20, smokeY - 35, 50, 55);

        ctx.fillStyle = '#F4A261';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText(`HUMO (${Math.floor(74 + Math.sin(frame*0.04)*4)}%)`, smokeX - 18, smokeY - 40);
      } else {
        ctx.strokeStyle = '#52B788';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#52B788';
        ctx.font = '8px sans-serif';
        ctx.fillText("SIN ANOMALÍAS", w/2 - 35, 12);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '9px sans-serif';
      ctx.fillText(`CÁMARA // NODO 0${node.id}`, 8, 16);
      
      if (Math.floor(frame / 12) % 2 === 0) {
        ctx.fillStyle = '#52B788';
        ctx.beginPath(); ctx.arc(12, h - 12, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillText("EN VIVO", 20, h - 9);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [node]);

  const getStatusBadgeClass = (status) => {
    if (status === 'alarm') return 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20';
    if (status === 'warning') return 'bg-[#F4A261]/10 text-[#F4A261] border-[#F4A261]/20';
    return 'bg-[#EEF5E9] text-[#2D6A4F] border-[#EEF5E9]';
  };

  const getTempText = (temp) => temp > 35 ? '⚠️ Riesgo activo (Muy alta)' : '✅ Normal';
  const getTempColor = (temp) => temp > 35 ? 'text-[#E63946]' : 'text-[#2D6A4F]';
  const getTempBgColor = (temp) => temp > 35 ? 'bg-[#E63946]' : 'bg-[#52B788]';

  const getHumText = (hum) => hum < 30 ? '⚠️ Peligro propagación (Baja)' : '✅ Normal';
  const getHumColor = (hum) => hum < 30 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getHumBgColor = (hum) => hum < 30 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  const getCoText = (co) => co > 80 ? '🔴 Alta concentración' : co > 40 ? '⚠️ Precaución' : '✅ Aire limpio';
  const getCoColor = (co) => co > 80 ? 'text-[#E63946]' : co > 40 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getCoBgColor = (co) => co > 80 ? 'bg-[#E63946]' : co > 40 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  const getVocText = (voc) => voc > 400 ? '🔴 Alarma de humo' : voc > 200 ? '⚠️ Posible ignición' : '✅ Aire normal';
  const getVocColor = (voc) => voc > 400 ? 'text-[#E63946]' : voc > 200 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getVocBgColor = (voc) => voc > 400 ? 'bg-[#E63946]' : voc > 200 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 flex flex-col gap-6 h-full shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      
      {/* Sensor Title Header */}
      <div className="flex items-center justify-between border-b border-[#EEF5E9] pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#2D6A4F]" />
          <h2 className="text-lg font-bold text-[#2D3436]">
            Sensores: Nodo 0{node.id}
          </h2>
        </div>
        
        <div className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(node.status)} flex items-center gap-2 transition-all`}>
          <span className={`w-2 h-2 rounded-full ${node.status === 'alarm' ? 'bg-[#E63946]' : node.status === 'warning' ? 'bg-[#F4A261]' : 'bg-[#52B788]'}`}></span>
          <span>ESTADO: {node.status === 'alarm' ? 'CRÍTICO' : node.status === 'warning' ? 'PRECAUCIÓN' : 'NORMAL'}</span>
        </div>
      </div>

      {/* Grid of the Senses */}
      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        
        {/* Card 1: Temperature */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#636E72]">Temperatura</span>
            <Thermometer className={`h-5 w-5 ${getTempColor(node.temp)}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${getTempColor(node.temp)}`}>{node.temp}°C</span>
            </div>
            <div className="text-xs font-medium text-[#636E72] mt-1">{getTempText(node.temp)}</div>
            <div className="w-full bg-[#EEF5E9] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${getTempBgColor(node.temp)} transition-all duration-500`} style={{ width: `${Math.min(100, (node.temp / 60) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Card 2: Humidity */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#636E72]">Humedad Rel.</span>
            <Droplet className={`h-5 w-5 ${getHumColor(node.hum)}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold ${getHumColor(node.hum)}`}>{node.hum}%</span>
            </div>
            <div className="text-xs font-medium text-[#636E72] mt-1">{getHumText(node.hum)}</div>
            <div className="w-full bg-[#EEF5E9] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${getHumBgColor(node.hum)} transition-all duration-500`} style={{ width: `${node.hum}%` }} />
            </div>
          </div>
        </div>

        {/* Card 3: CO */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 cursor-help group" title="Monóxido de carbono: Gas tóxico que indica presencia de humo invisible.">
              <span className="text-sm font-bold text-[#636E72]">Monóxido (CO)</span>
              <HelpCircle className="h-3 w-3 text-[#636E72] opacity-50 group-hover:opacity-100" />
            </div>
            <Cloud className={`h-5 w-5 ${getCoColor(node.co)}`} />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#2D3436]">{node.co} <span className="text-sm font-medium text-[#636E72]">ppm</span></span>
            <div className="text-xs font-medium text-[#636E72] mt-1">{getCoText(node.co)}</div>
            <div className="w-full bg-[#EEF5E9] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${getCoBgColor(node.co)} transition-all duration-500`} style={{ width: `${Math.min(100, (node.co / 150) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Card 4: VOC */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1 cursor-help group" title="Gases de compuestos orgánicos emitidos por hojas quemándose o resinas.">
              <span className="text-sm font-bold text-[#636E72]">Gases Orgánicos</span>
              <HelpCircle className="h-3 w-3 text-[#636E72] opacity-50 group-hover:opacity-100" />
            </div>
            <Cloud className={`h-5 w-5 ${getVocColor(node.voc)}`} />
          </div>
          <div>
            <span className="text-2xl font-bold text-[#2D3436]">{node.voc} <span className="text-sm font-medium text-[#636E72]">ppm</span></span>
            <div className="text-xs font-medium text-[#636E72] mt-1">{getVocText(node.voc)}</div>
            <div className="w-full bg-[#EEF5E9] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className={`h-full rounded-full ${getVocBgColor(node.voc)} transition-all duration-500`} style={{ width: `${Math.min(100, (node.voc / 800) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* Card 5: Audio Spectrum */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#636E72]">Micrófono Acústico</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${node.status === 'alarm' ? 'bg-[#E63946]/10 text-[#E63946]' : 'bg-[#EEF5E9] text-[#2D6A4F]'}`}>
              {node.status === 'alarm' ? '🚨 SONIDO DE FUEGO DETECTADO' : 'Sonido del bosque normal'}
            </span>
          </div>
          <div className="flex items-end justify-between h-12 bg-white p-2 rounded-xl border border-[#EEF5E9] gap-1">
            {acousticData.map((val, idx) => (
              <div key={idx} className="flex-1 bg-[#F8FAF5] rounded-t-md overflow-hidden h-full flex items-end">
                <div 
                  className={`w-full transition-all duration-150 rounded-t-md ${
                    node.status === 'alarm' ? 'bg-[#E63946]' : node.status === 'warning' ? 'bg-[#F4A261]' : 'bg-[#52B788]'
                  }`}
                  style={{ height: `${val}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Card 6: Environment */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-[#636E72]">Contexto Ambiental</span>
            <Compass className="h-5 w-5 text-[#636E72]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border-r border-[#EEF5E9] pr-4">
              <span className="text-xs text-[#636E72] font-bold">Viento</span>
              <span className="text-xl font-bold text-[#2D3436] block mt-1">{node.windSpeed} km/h</span>
              <span className="text-xs text-[#636E72] flex items-center gap-1 mt-1">
                <Wind className="h-4 w-4 text-[#52B788] shrink-0" style={{ transform: `rotate(${node.windAngle}deg)` }} />
                Dir: {node.windDir}
              </span>
            </div>
            <div className="pl-2">
              <div className="flex items-center gap-1 cursor-help group" title="Índice de Vegetación. Valores bajos = vegetación extremadamente seca y propensa al fuego.">
                <span className="text-xs text-[#636E72] font-bold">Vegetación Seca (NDVI)</span>
                <HelpCircle className="h-3 w-3 text-[#636E72] opacity-50 group-hover:opacity-100" />
              </div>
              <span className={`text-xl font-bold block mt-1 ${node.ndvi < 0.35 ? 'text-[#E63946]' : node.ndvi < 0.55 ? 'text-[#F4A261]' : 'text-[#2D6A4F]'}`}>
                {node.ndvi.toFixed(2)}
              </span>
              <span className="text-xs text-[#636E72] font-medium block mt-1">
                {node.ndvi < 0.35 ? '⚠️ Altamente inflamable' : node.ndvi < 0.55 ? 'Estrés hídrico' : '✅ Sana y húmeda'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 7: Camera */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#636E72]">Cámara Térmica Visual</span>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-[#2D6A4F]" />
            </div>
          </div>
          <div className="border border-[#EEF5E9] rounded-xl overflow-hidden aspect-video bg-slate-900 flex items-center justify-center relative">
            <canvas ref={canvasRef} width={380} height={190} className="w-full h-full object-cover block" />
          </div>
        </div>

      </div>
    </div>
  );
}
