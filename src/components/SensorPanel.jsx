import React, { useEffect, useState, useRef } from 'react';
import { Thermometer, Droplet, Wind, Eye, Compass, Activity, Cloud, HelpCircle } from 'lucide-react';
import { translations } from '../utils/translations';

export default function SensorPanel({ node, globalScore, lang }) {
  const nId = node?.id_nodo || `0${node?.id}`;
  const status = node?.fusion?.status || node?.status;
  const temp = node?.sentidos?.tacto?.temp_aire ?? node?.temp;
  const hum = node?.sentidos?.tacto?.humedad ?? node?.hum;
  const co = node?.sentidos?.olfato?.co_ppm ?? node?.co;
  const voc = node?.sentidos?.olfato?.voc_ppb ?? node?.voc;
  const windSpeed = node?.sentidos?.tacto?.viento_vel ?? node?.windSpeed;
  const windDir = node?.sentidos?.tacto?.viento_dir ?? node?.windDir;
  const windAngle = node?.sentidos?.tacto?.viento_angle ?? node?.windAngle;
  const ndvi = node?.sentidos?.intuicion?.ndvi ?? node?.ndvi;

  const presionAtm = node?.sentidos?.tacto?.presion_atm ?? 1012;
  const iluminacion = node?.sentidos?.vista?.iluminacion_lux ?? 2.0;
  const humedadSuelo = node?.sentidos?.tacto?.humedad_suelo ?? 44;
  const tempContacto = node?.sentidos?.tacto?.temp_contacto ?? 31.3;
  const pm25 = node?.sentidos?.olfato?.pm25 ?? 15.0;
  const pm10 = node?.sentidos?.olfato?.pm10 ?? 24;

  const getVPD = (t, hr) => {
    const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
    const pva = pvs * (hr / 100);
    return (pvs - pva).toFixed(2);
  };
  const vpd = parseFloat(getVPD(temp, hum));

  let vpdStatus = "ÓPTIMO";
  let vpdColor = "text-[#2D6A4F]";
  let vpdBg = "bg-[#52B788]";
  if (vpd > 2.0) { vpdStatus = "EXTREMO"; vpdColor = "text-[#E63946]"; vpdBg = "bg-[#E63946]"; }
  else if (vpd > 1.2) { vpdStatus = "ALTO"; vpdColor = "text-[#F4A261]"; vpdBg = "bg-[#F4A261]"; }

  const [acousticData, setAcousticData] = useState([30, 45, 60, 35, 70, 85, 40, 50, 65, 55]);
  const canvasRef = useRef(null);
  const t = translations[lang || 'es'];

  useEffect(() => {
    const interval = setInterval(() => {
      setAcousticData(prev => 
        prev.map(val => {
          const baseChange = Math.floor(Math.random() * 21) - 10;
          const limit = status === 'alarm' ? 95 : status === 'warning' ? 70 : 40;
          const min = status === 'alarm' ? 55 : 20;
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

      if (status === 'alarm') {
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
        ctx.fillText(lang === 'en' ? `ACTIVE FLAME (${Math.floor(92 + Math.sin(frame*0.05)*6)}%)` : `LLAMA ACTIVA (${Math.floor(92 + Math.sin(frame*0.05)*6)}%)`, flameCenterX - radius - 9, flameCenterY - radius - 35);
      } else if (status === 'warning') {
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
        ctx.fillText(lang === 'en' ? `SMOKE (${Math.floor(74 + Math.sin(frame*0.04)*4)}%)` : `HUMO (${Math.floor(74 + Math.sin(frame*0.04)*4)}%)`, smokeX - 18, smokeY - 40);
      } else {
        ctx.strokeStyle = '#52B788';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);
        ctx.fillStyle = '#52B788';
        ctx.font = '8px sans-serif';
        ctx.fillText(lang === 'en' ? "NO ANOMALIES" : "SIN ANOMALÍAS", w/2 - 35, 12);
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '9px sans-serif';
      ctx.fillText(lang === 'en' ? `CAMERA // NODE ` : `CÁMARA // NODO `, 8, 16);
      
      if (Math.floor(frame / 12) % 2 === 0) {
        ctx.fillStyle = '#52B788';
        ctx.beginPath(); ctx.arc(12, h - 12, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillText(lang === 'en' ? "LIVE" : "EN VIVO", 20, h - 9);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [node, lang]);

  const getStatusBadgeClass = (status) => {
    if (status === 'alarm') return 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20';
    if (status === 'warning') return 'bg-[#F4A261]/10 text-[#F4A261] border-[#F4A261]/20';
    return 'bg-[#EEF5E9] text-[#2D6A4F] border-[#EEF5E9]';
  };

  const getTempText = (temp) => {
    if (lang === 'en') {
      return temp > 35 ? '⚠️ Active risk (Very high)' : '✅ Normal';
    }
    return temp > 35 ? '⚠️ Riesgo activo (Muy alta)' : '✅ Normal';
  };

  const getTempColor = (temp) => temp > 35 ? 'text-[#E63946]' : 'text-[#2D6A4F]';
  const getTempBgColor = (temp) => temp > 35 ? 'bg-[#E63946]' : 'bg-[#52B788]';

  const getHumText = (hum) => {
    if (lang === 'en') {
      return hum < 30 ? '⚠️ Spread hazard (Low)' : '✅ Normal';
    }
    return hum < 30 ? '⚠️ Peligro propagación (Baja)' : '✅ Normal';
  };

  const getHumColor = (hum) => hum < 30 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getHumBgColor = (hum) => hum < 30 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  const getCoText = (co) => {
    if (lang === 'en') {
      return co > 80 ? '🔴 High concentration' : co > 40 ? '⚠️ Warning' : '✅ Clean air';
    }
    return co > 80 ? '🔴 Alta concentración' : co > 40 ? '⚠️ Precaución' : '✅ Aire limpio';
  };

  const getCoColor = (co) => co > 80 ? 'text-[#E63946]' : co > 40 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getCoBgColor = (co) => co > 80 ? 'bg-[#E63946]' : co > 40 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  const getVocText = (voc) => {
    if (lang === 'en') {
      return voc > 400 ? '🔴 Smoke alarm' : voc > 200 ? '⚠️ Possible ignition' : '✅ Normal air';
    }
    return voc > 400 ? '🔴 Alarma de humo' : voc > 200 ? '⚠️ Posible ignición' : '✅ Aire normal';
  };

  const getVocColor = (voc) => voc > 400 ? 'text-[#E63946]' : voc > 200 ? 'text-[#F4A261]' : 'text-[#2D6A4F]';
  const getVocBgColor = (voc) => voc > 400 ? 'bg-[#E63946]' : voc > 200 ? 'bg-[#F4A261]' : 'bg-[#52B788]';

  const getNdviText = (ndvi) => {
    if (ndvi < 0.35) return t.sensorNdviDanger;
    if (ndvi < 0.55) return t.sensorNdviWater;
    return t.sensorNdviSafe;
  };

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 flex flex-col gap-6 h-full shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      
      {/* Sensor Title Header */}
      <div className="flex items-center justify-between border-b border-[#EEF5E9] pb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-[#2D6A4F]" />
          <h2 className="text-lg font-bold text-[#2D3436]">
            {t.sensorNodeTitle} {nId}
          </h2>
        </div>
        
        <div className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeClass(status)} flex items-center gap-2 transition-all`}>
          <span className={`w-2 h-2 rounded-full ${status === 'alarm' ? 'bg-[#E63946]' : status === 'warning' ? 'bg-[#F4A261]' : 'bg-[#52B788]'}`}></span>
          <span>{t.sensorStatus} {status === 'alarm' ? t.sensorCritical : status === 'warning' ? t.sensorWarning : t.sensorNormal}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-6">
        
        {/* Main VPD Card */}
        <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-sm font-bold text-[#636E72] flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-[#2D6A4F]" /> ÍNDICE VPD
              </span>
              <span className="text-xs text-[#636E72] mt-1 block">Déficit de Presión de Vapor calculado</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-white border border-[#EEF5E9] ${vpdColor}`}>
              Estado: {vpdStatus}
            </span>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-5xl font-extrabold ${vpdColor}`}>{vpd}</span>
            <span className="text-lg font-bold text-[#636E72] ml-1">kPa</span>
          </div>
          <div className="w-full bg-[#EEF5E9] rounded-full h-1.5 mt-4 overflow-hidden flex relative">
            <div className={`absolute top-0 left-0 h-full ${vpdBg} transition-all duration-500`} style={{ width: `${Math.min(100, (vpd / 4) * 100)}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-[9px] font-bold text-[#636E72] px-1">
            <span>0.4</span>
            <span>0.8</span>
            <span>1.2</span>
            <span>1.6</span>
            <span>2.0+</span>
          </div>
        </div>

        {/* Grid for small metrics */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Temperatura */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Temperatura aire</span>
              <Thermometer className={`h-4 w-4 ${getTempColor(temp)}`} />
            </div>
            <span className={`text-2xl font-extrabold ${getTempColor(temp)}`}>{temp} <span className="text-xs text-[#636E72]">°C</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">MKR ENV SHIELD</span>
          </div>

          {/* Humedad */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Humedad aire</span>
              <Droplet className={`h-4 w-4 ${getHumColor(hum)}`} />
            </div>
            <span className={`text-2xl font-extrabold ${getHumColor(hum)}`}>{hum} <span className="text-xs text-[#636E72]">%</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">MKR ENV SHIELD</span>
          </div>

          {/* Presión Atm */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Presión atm.</span>
              <Cloud className="h-4 w-4 text-[#2D6A4F]" />
            </div>
            <span className="text-2xl font-extrabold text-[#2D3436]">{presionAtm} <span className="text-xs text-[#636E72]">hPa</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">MKR ENV SHIELD</span>
          </div>

          {/* Iluminación */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Iluminación</span>
              <Eye className="h-4 w-4 text-[#2D6A4F]" />
            </div>
            <span className="text-2xl font-extrabold text-[#2D3436]">{iluminacion} <span className="text-xs text-[#636E72]">klux</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">MKR ENV SHIELD</span>
          </div>

          {/* Humedad Suelo */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Humedad suelo</span>
              <Droplet className={`h-4 w-4 ${humedadSuelo < 20 ? 'text-[#E63946]' : 'text-[#2D6A4F]'}`} />
            </div>
            <span className={`text-2xl font-extrabold ${humedadSuelo < 20 ? 'text-[#E63946]' : 'text-[#2D3436]'}`}>{humedadSuelo} <span className="text-xs text-[#636E72]">%</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">HD38</span>
          </div>

          {/* Temp Contacto */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">Temp. contacto</span>
              <Thermometer className={`h-4 w-4 ${tempContacto > 40 ? 'text-[#E63946]' : 'text-[#2D6A4F]'}`} />
            </div>
            <span className={`text-2xl font-extrabold ${tempContacto > 40 ? 'text-[#E63946]' : 'text-[#2D3436]'}`}>{tempContacto} <span className="text-xs text-[#636E72]">°C</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">DS18B20</span>
          </div>

          {/* CO2 */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">CO₂ estimado</span>
              <Cloud className={`h-4 w-4 ${getCoColor(co)}`} />
            </div>
            <span className={`text-2xl font-extrabold ${getCoColor(co)}`}>{co} <span className="text-xs text-[#636E72]">ppm</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">MQ135</span>
          </div>

          {/* PM2.5/PM10 */}
          <div className="bg-[#F8FAF5] border border-[#EEF5E9] p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-[#636E72]">PM2.5 / PM10</span>
              <Cloud className={`h-4 w-4 ${pm25 > 50 ? 'text-[#E63946]' : 'text-[#2D6A4F]'}`} />
            </div>
            <span className={`text-2xl font-extrabold ${pm25 > 50 ? 'text-[#E63946]' : 'text-[#2D3436]'}`}>{pm25} <span className="text-sm font-bold text-[#636E72]">· {pm10}</span> <span className="text-xs text-[#636E72]">μg/m³</span></span>
            <span className="text-[10px] text-[#636E72] mt-1 font-mono uppercase">HM3301</span>
          </div>
        </div>

      </div>
    </div>
  );
}
