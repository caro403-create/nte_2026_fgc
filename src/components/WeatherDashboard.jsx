import React from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, SunDim, Sunrise, Sunset, Eye, Gauge, Compass } from 'lucide-react';

// WMO Weather code mapping
const getWeatherDetails = (code) => {
  const codes = {
    0: { text: 'Despejado', icon: <Sun className="w-12 h-12 text-yellow-400" /> },
    1: { text: 'Mayormente despejado', icon: <SunDim className="w-12 h-12 text-yellow-300" /> },
    2: { text: 'Parcialmente nublado', icon: <Cloud className="w-12 h-12 text-gray-300" /> },
    3: { text: 'Nublado', icon: <Cloud className="w-12 h-12 text-gray-400" /> },
    45: { text: 'Niebla', icon: <Cloud className="w-12 h-12 text-gray-500" /> },
    48: { text: 'Niebla escarchada', icon: <Cloud className="w-12 h-12 text-gray-400" /> },
    51: { text: 'Llovizna ligera', icon: <CloudRain className="w-12 h-12 text-blue-300" /> },
    53: { text: 'Llovizna moderada', icon: <CloudRain className="w-12 h-12 text-blue-400" /> },
    55: { text: 'Llovizna densa', icon: <CloudRain className="w-12 h-12 text-blue-500" /> },
    61: { text: 'Lluvia leve', icon: <CloudRain className="w-12 h-12 text-blue-400" /> },
    63: { text: 'Lluvia moderada', icon: <CloudRain className="w-12 h-12 text-blue-500" /> },
    65: { text: 'Lluvia fuerte', icon: <CloudRain className="w-12 h-12 text-blue-600" /> },
    71: { text: 'Nieve leve', icon: <Cloud className="w-12 h-12 text-white" /> },
    73: { text: 'Nieve moderada', icon: <Cloud className="w-12 h-12 text-white" /> },
    75: { text: 'Nieve fuerte', icon: <Cloud className="w-12 h-12 text-white" /> },
    80: { text: 'Chubascos leves', icon: <CloudRain className="w-12 h-12 text-blue-400" /> },
    81: { text: 'Chubascos', icon: <CloudRain className="w-12 h-12 text-blue-500" /> },
    82: { text: 'Chubascos violentos', icon: <CloudRain className="w-12 h-12 text-blue-600" /> },
    95: { text: 'Tormenta', icon: <CloudRain className="w-12 h-12 text-purple-400" /> },
    96: { text: 'Tormenta con granizo', icon: <CloudRain className="w-12 h-12 text-purple-500" /> },
    99: { text: 'Tormenta severa', icon: <CloudRain className="w-12 h-12 text-purple-600" /> },
  };
  return codes[code] || { text: 'Desconocido', icon: <Sun className="w-12 h-12 text-gray-400" /> };
};

export default function WeatherDashboard({ point }) {
  if (!point || !point.daily) return null;

  const currentW = getWeatherDetails(point.weatherCode);
  const now = new Date();
  
  // Helper to format hours
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper for small daily icons
  const getSmallIcon = (code) => {
    const d = getWeatherDetails(code);
    return React.cloneElement(d.icon, { className: 'w-6 h-6 ' + d.icon.props.className });
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 text-white pb-10">
      
      {/* Top Main Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column (Main City + 5 Day forecast) */}
        <div className="flex-1 flex flex-col gap-4">
          
          {/* Main Info Card */}
          <div className="bg-[#1C1C1C] rounded-3xl p-6 md:p-8 flex flex-col border border-white/5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{point.name}</h2>
                <p className="text-white/50 text-sm">Actualizado hace pocos minutos</p>
              </div>
              <div className="bg-black/40 rounded-full px-4 py-2 text-xl font-bold text-amber-500">
                {now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-6">
              {currentW.icon}
              <div>
                <div className="text-6xl font-extrabold text-white tracking-tighter">
                  {Math.round(point.temp)}°<span className="text-3xl text-white/50 align-top">C</span>
                </div>
              </div>
              <div className="ml-4 flex flex-col justify-center">
                <span className="text-2xl font-bold text-white">{currentW.text}</span>
                <span className="text-white/60 font-medium mt-1">
                  Máx. {Math.round(point.daily.temperature_2m_max[0])}° Mín. {Math.round(point.daily.temperature_2m_min[0])}°
                </span>
              </div>
            </div>
          </div>

          {/* 5 Day Forecast Box */}
          <div className="bg-[#1C1C1C] rounded-3xl p-6 border border-white/5 shadow-lg overflow-x-auto">
            <div className="flex justify-between items-end min-w-[500px]">
              {point.daily.time.slice(0, 6).map((timeStr, idx) => {
                const date = new Date(timeStr + 'T00:00:00'); // Force local midnight
                const isToday = idx === 0;
                const dayName = isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
                const max = Math.round(point.daily.temperature_2m_max[idx]);
                const min = Math.round(point.daily.temperature_2m_min[idx]);
                const prob = point.daily.precipitation_probability_max?.[idx] || 0;
                
                // Extremely simple visual curve simulation (bar height)
                const relativeHeight = (max - 15) * 4; // Arbitrary scale

                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <span className={`text-sm font-bold mb-2 ${isToday ? 'text-amber-400' : 'text-white/70'}`}>
                      {dayName}
                    </span>
                    {getSmallIcon(point.daily.weather_code[idx])}
                    
                    <div className="mt-2 text-xs font-bold">
                      <span className="text-white">{max}°</span> <span className="text-white/50">{min}°</span>
                    </div>

                    <div className="h-24 w-full flex items-end justify-center mt-4 border-l border-white/10 relative">
                      <div 
                        className="w-1/2 bg-gradient-to-t from-amber-500/10 to-amber-500/50 rounded-t-sm"
                        style={{ height: `${Math.max(10, Math.min(100, relativeHeight))}%` }}
                      />
                    </div>
                    
                    <div className="text-[10px] text-blue-400 font-bold mt-2 flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {prob}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* Right Column (Widgets grid) */}
        <div className="w-full lg:w-[45%] grid grid-cols-2 gap-4">
          
          {/* Visibility */}
          <div className="bg-[#1C1C1C] rounded-3xl p-5 border border-white/5 shadow-lg flex flex-col justify-between">
            <h4 className="text-white/50 text-sm font-semibold flex items-center gap-2"><Eye className="w-4 h-4" /> Visibilidad</h4>
            <div className="mt-2">
              <span className="text-3xl font-extrabold">{point.visibility !== undefined ? (point.visibility / 1000).toFixed(1) : '--'}</span>
              <span className="text-white/50 text-sm ml-1">km</span>
            </div>
            <p className="text-emerald-400 text-sm font-bold mt-2">Buena</p>
          </div>

          {/* Pressure */}
          <div className="bg-[#1C1C1C] rounded-3xl p-5 border border-white/5 shadow-lg flex flex-col justify-between">
            <h4 className="text-white/50 text-sm font-semibold flex items-center gap-2"><Gauge className="w-4 h-4" /> Presión</h4>
            <div className="mt-2">
              <span className="text-3xl font-extrabold">{point.pressure ? Math.round(point.pressure) : '--'}</span>
              <span className="text-white/50 text-sm ml-1">mbar</span>
            </div>
            <p className="text-blue-400 text-sm font-bold mt-2">Estable</p>
          </div>
          
          {/* UV */}
          <div className="bg-[#1C1C1C] rounded-3xl p-5 border border-white/5 shadow-lg flex flex-col justify-between">
            <h4 className="text-white/50 text-sm font-semibold flex items-center gap-2"><Sun className="w-4 h-4" /> Índice UV</h4>
            <div className="mt-2">
              <span className="text-3xl font-extrabold">{point.daily?.uv_index_max?.[0] !== undefined ? Math.round(point.daily.uv_index_max[0]) : '--'}</span>
            </div>
            <p className="text-amber-500 text-sm font-bold mt-2">Moderado</p>
          </div>
          
          {/* Air Quality */}
          <div className="bg-[#1C1C1C] rounded-3xl p-5 border border-white/5 shadow-lg flex flex-col justify-between">
            <h4 className="text-white/50 text-sm font-semibold flex items-center gap-2"><Wind className="w-4 h-4" /> ICA (PM2.5)</h4>
            <div className="mt-2">
              <span className="text-3xl font-extrabold">{point.pm2_5 !== undefined ? point.pm2_5 : '--'}</span>
            </div>
            <p className="text-emerald-400 text-sm font-bold mt-2">Bueno</p>
          </div>

        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Wind */}
        <div className="bg-[#1C1C1C] rounded-3xl p-6 border border-white/5 shadow-lg col-span-1 md:col-span-1">
          <h4 className="text-white/50 text-sm font-semibold mb-4 flex items-center gap-2"><Compass className="w-4 h-4" /> Viento</h4>
          <div className="flex gap-4 items-center h-full">
            {/* Simple Compass */}
            <div className="w-24 h-24 rounded-full border-4 border-white/10 relative flex items-center justify-center shrink-0">
              <span className="absolute top-1 text-[10px] text-white/30 font-bold">N</span>
              <span className="absolute bottom-1 text-[10px] text-white/30 font-bold">S</span>
              <span className="absolute left-1 text-[10px] text-white/30 font-bold">O</span>
              <span className="absolute right-1 text-[10px] text-white/30 font-bold">E</span>
              
              <div 
                className="w-10 h-10 text-blue-500 transition-transform duration-1000" 
                style={{ transform: `rotate(${point.windDegree || 0}deg)` }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L4 20l8-4 8 4-8-18z"/></svg>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-2xl font-extrabold text-white">{point.windSpeed !== undefined ? point.windSpeed : '--'} <span className="text-xs text-white/50">km/h</span></span>
                <p className="text-[10px] text-white/40 uppercase font-bold">Velocidad</p>
              </div>
              <div>
                <span className="text-xl font-bold text-white">{point.windGusts !== undefined ? point.windGusts : '--'} <span className="text-xs text-white/50">km/h</span></span>
                <p className="text-[10px] text-white/40 uppercase font-bold">Ráfagas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-[#1C1C1C] rounded-3xl p-6 border border-white/5 shadow-lg">
          <h4 className="text-white/50 text-sm font-semibold mb-4 flex items-center gap-2"><Droplets className="w-4 h-4" /> Humedad</h4>
          <div className="flex items-end gap-6 h-full pb-4">
            <div className="flex-1 flex gap-1 items-end h-16">
              {/* Pseudo bars */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm ${i < ((point.hum || 0) / 10) ? 'bg-blue-500' : 'bg-white/10'}`} style={{ height: `${20 + (i * 8)}%` }} />
              ))}
            </div>
            <div className="flex flex-col items-end">
              <span className="text-4xl font-extrabold text-white">{point.hum !== undefined ? point.hum : '--'}%</span>
              <span className="text-blue-400 font-bold text-sm">Húmedo</span>
            </div>
          </div>
        </div>

        {/* Sun Phases */}
        <div className="bg-[#1C1C1C] rounded-3xl p-6 border border-white/5 shadow-lg">
          <h4 className="text-white/50 text-sm font-semibold mb-4 flex items-center gap-2"><Sunrise className="w-4 h-4" /> Sol y Luna</h4>
          <div className="relative h-20 w-full border-b-2 border-white/10 mt-6">
            {/* Arc */}
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              <path d="M 0 50 A 50 50 0 0 1 100 50" fill="none" stroke="rgba(255,160,0,0.5)" strokeWidth="4" strokeDasharray="4 4" />
              <circle cx="50" cy="0" r="4" fill="#fbbf24" />
            </svg>
          </div>
          <div className="flex justify-between mt-3 text-white font-bold text-lg">
            <div>
              {formatTime(point.daily?.sunrise?.[0])}
              <p className="text-[10px] text-white/40 font-normal">Amanecer</p>
            </div>
            <div className="text-right">
              {formatTime(point.daily?.sunset?.[0])}
              <p className="text-[10px] text-white/40 font-normal">Atardecer</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
