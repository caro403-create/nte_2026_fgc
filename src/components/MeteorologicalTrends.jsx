import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line } from 'recharts';
import { Thermometer, Droplets, Wind, BarChart2 } from 'lucide-react';

const MOCK_TREND_DATA = [
  { name: 'Sep.', min: 14, max: 24, avg: 19, rainMin: 10, rainMax: 120, humMin: 40, humMax: 85, windMin: 5, windMax: 25 },
  { name: 'Oct.', min: 14, max: 23, avg: 18.5, rainMin: 20, rainMax: 150, humMin: 45, humMax: 90, windMin: 8, windMax: 30 },
  { name: 'Nov.', min: 15, max: 23, avg: 19, rainMin: 15, rainMax: 100, humMin: 40, humMax: 80, windMin: 6, windMax: 28 },
  { name: 'Dic.', min: 14, max: 24, avg: 19, rainMin: 5, rainMax: 80, humMin: 35, humMax: 75, windMin: 4, windMax: 20 },
  { name: 'Ene.', min: 13, max: 25, avg: 19, rainMin: 0, rainMax: 40, humMin: 30, humMax: 65, windMin: 3, windMax: 15 },
  { name: 'Feb.', min: 14, max: 26, avg: 20, rainMin: 0, rainMax: 30, humMin: 30, humMax: 60, windMin: 3, windMax: 18 },
  { name: 'Mar.', min: 15, max: 26, avg: 20.5, rainMin: 5, rainMax: 50, humMin: 35, humMax: 65, windMin: 5, windMax: 22 },
  { name: 'Abr.', min: 15, max: 25, avg: 20, rainMin: 10, rainMax: 80, humMin: 40, humMax: 70, windMin: 6, windMax: 26 },
  { name: 'Mayo', min: 16, max: 25, avg: 20.5, rainMin: 20, rainMax: 110, humMin: 45, humMax: 75, windMin: 8, windMax: 28 },
  { name: 'Jun.', min: 15, max: 26, avg: 20.5, rainMin: 25, rainMax: 140, humMin: 50, humMax: 80, windMin: 10, windMax: 32 },
  { name: 'Jul.', min: 14, max: 27, avg: 20.5, rainMin: 30, rainMax: 160, humMin: 55, humMax: 85, windMin: 12, windMax: 35 },
  { name: 'Ago.', min: 15, max: 27, avg: 21, rainMin: 20, rainMax: 130, humMin: 50, humMax: 80, windMin: 10, windMax: 30 },
];

import { translations } from '../utils/translations';

export default function MeteorologicalTrends({ lang = 'es' }) {
  const [activeTab, setActiveTab] = useState('temp');
  const [timeRange, setTimeRange] = useState('12m'); // '12m' o 'all'
  const t = translations[lang];

  const getDataKeys = () => {
    switch(activeTab) {
      case 'rain': return { max: 'rainMax', min: 'rainMin', colorMax: '#3b82f6', colorMin: '#60a5fa', maxLabel: t.trendsMaxRain, minLabel: t.trendsMinRain };
      case 'hum': return { max: 'humMax', min: 'humMin', colorMax: '#06b6d4', colorMin: '#22d3ee', maxLabel: t.trendsMaxHum, minLabel: t.trendsMinHum };
      case 'wind': return { max: 'windMax', min: 'windMin', colorMax: '#14b8a6', colorMin: '#2dd4bf', maxLabel: t.trendsMaxWind, minLabel: t.trendsMinWind };
      case 'temp':
      default: return { max: 'max', min: 'min', colorMax: '#ef4444', colorMin: '#3b82f6', maxLabel: t.trendsMaxDaily, minLabel: t.trendsMinDaily };
    }
  };

  const { max: maxKey, min: minKey, colorMax, colorMin, maxLabel, minLabel } = getDataKeys();
  
  const translateMonth = (m) => {
    if (lang === 'es') return m;
    const map = { 'Dic.': 'Dec.', 'Ene.': 'Jan.', 'Abr.': 'Apr.', 'Mayo': 'May', 'Ago.': 'Aug.' };
    return map[m] || m;
  };

  const displayData = timeRange === 'all' 
    ? [...MOCK_TREND_DATA].reverse().map(d => ({ ...d, name: `2024 ${translateMonth(d.name)}` })) 
    : MOCK_TREND_DATA.map(d => ({ ...d, name: translateMonth(d.name) }));

  return (
    <div className="w-full max-w-6xl mx-auto bg-[#1C1C1C] rounded-3xl p-6 border border-white/10 shadow-2xl text-white mt-8 mb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-6 border-b border-white/10 pb-4 mb-6">
        <h3 className="text-lg font-bold">{t.trendsTitle}</h3>
        <div className="flex gap-4 text-sm font-semibold">
          <button 
            onClick={() => setTimeRange('12m')} 
            className={`pb-1 transition-colors ${timeRange === '12m' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white'}`}
          >
            {t.trends12m}
          </button>
          <button 
            onClick={() => setTimeRange('all')} 
            className={`pb-1 transition-colors ${timeRange === 'all' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white'}`}
          >
            {t.trendsAll}
          </button>
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-3 mb-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button 
          onClick={() => setActiveTab('temp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeTab === 'temp' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
        >
          <Thermometer className="w-4 h-4" /> {t.obsTemp || 'Temperatura'}
        </button>
        <button 
          onClick={() => setActiveTab('rain')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeTab === 'rain' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
        >
          <Droplets className="w-4 h-4" /> {t.obsLluvia || 'Precipitaciones'}
        </button>
        <button 
          onClick={() => setActiveTab('hum')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeTab === 'hum' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
        >
          <Droplets className="w-4 h-4" /> {t.obsHumedad || 'Humedad'}
        </button>
        <button 
          onClick={() => setActiveTab('wind')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${activeTab === 'wind' ? 'bg-teal-500/20 text-teal-400 border-teal-500/50' : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'}`}
        >
          <Wind className="w-4 h-4" /> {t.obsViento || 'Viento'}
        </button>
      </div>

      {/* Chart Area */}
      <div className="h-80 w-full mb-6 relative">
        {/* Info overlay (like MSN) */}
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-white/10 text-[10px]">
          <div className="text-white font-bold mb-1">{timeRange === 'all' ? t.trendsHistSummary : '7 de septiembre de 2025'}</div>
          <div className="flex items-center gap-2" style={{ color: colorMax }}><div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMax }}/> {maxLabel}: {displayData[0][maxKey]}</div>
          <div className="flex items-center gap-2 text-white/70"><div className="w-2 h-2 rounded-full bg-white/40"/> {t.trendsHistMax} {displayData[0][maxKey] - 3}</div>
          <div className="flex items-center gap-2 mt-1" style={{ color: colorMin }}><div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMin }}/> {minLabel}: {displayData[0][minKey]}</div>
          <div className="flex items-center gap-2 text-white/70"><div className="w-2 h-2 rounded-full bg-white/40"/> {t.trendsHistMin} {displayData[0][minKey] + 3}</div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorMax} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colorMax} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colorMin} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colorMin} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1C1C1C', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ fontSize: '12px' }} />
            <Area type="monotone" dataKey={maxKey} stroke={colorMax} fillOpacity={1} fill="url(#colorMax)" strokeWidth={2} />
            <Area type="monotone" dataKey={minKey} stroke={colorMin} fillOpacity={1} fill="url(#colorMin)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Simple Legend */}
        <div className="flex justify-center gap-6 mt-2 text-[10px] text-white/50 font-semibold">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMin }} /> {minLabel}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colorMax }} /> {maxLabel}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-[2px] bg-white/50 rounded-sm" /> {t.trendsForecast30d}</div>
          <div className="flex items-center gap-1"><div className="w-3 h-[2px] bg-white/20 rounded-sm" /> {activeTab === 'temp' ? t.trendsHistTemp : t.trendsHistData}</div>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-white/10 pt-6">
        
        {/* Left Table */}
        <div className="text-xs">
          <div className="grid grid-cols-3 text-white/50 font-bold border-b border-white/10 pb-2 mb-2">
            <div>{t.trendsWeatherInfo}</div>
            <div>{t.trends12m}</div>
            <div>{t.trendsAllYears}</div>
          </div>
          <div className="grid grid-cols-3 py-2 items-center">
            <div className="flex items-center gap-2 text-red-400 font-bold"><Thermometer className="w-4 h-4"/> {t.trendsHotMonth}</div>
            <div>{lang === 'en' ? 'september' : 'septiembre'}</div>
            <div>{lang === 'en' ? 'august' : 'agosto'}</div>
          </div>
          <div className="grid grid-cols-3 py-2 items-center">
            <div className="flex items-center gap-2 text-blue-400 font-bold"><Thermometer className="w-4 h-4"/> {t.trendsColdMonth}</div>
            <div>{lang === 'en' ? 'december' : 'diciembre'}</div>
            <div>{lang === 'en' ? 'january' : 'enero'}</div>
          </div>
          <div className="grid grid-cols-3 py-2 items-center">
            <div className="flex items-center gap-2 text-cyan-400 font-bold"><Droplets className="w-4 h-4"/> {t.trendsHumidMonth}</div>
            <div>{lang === 'en' ? 'september' : 'septiembre'}</div>
            <div>{lang === 'en' ? 'march' : 'marzo'}</div>
          </div>
          <div className="grid grid-cols-3 py-2 items-center border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-teal-400 font-bold"><Wind className="w-4 h-4"/> {t.trendsWindyMonth}</div>
            <div>{lang === 'en' ? 'july' : 'julio'}</div>
            <div>{lang === 'en' ? 'april' : 'abril'}</div>
          </div>
        </div>

        {/* Right Table */}
        <div className="text-xs">
          <div className="grid grid-cols-4 text-white/50 font-bold border-b border-white/10 pb-2 mb-2">
            <div className="col-span-2">{t.trendsDailySummary}</div>
            <div className="text-right">{t.obsMax}</div>
            <div className="text-right">{t.obsMin}</div>
          </div>
          <div className="grid grid-cols-4 py-2">
            <div className="col-span-2 text-white/80">{t.trendsHighTemp}</div>
            <div className="text-right font-bold text-red-400">33</div>
            <div className="text-right font-bold text-slate-300">14</div>
          </div>
          <div className="grid grid-cols-4 py-2">
            <div className="col-span-2 text-white/80">{t.trendsLowTemp}</div>
            <div className="text-right font-bold text-slate-300">20</div>
            <div className="text-right font-bold text-blue-400">5</div>
          </div>
          <div className="grid grid-cols-4 py-2">
            <div className="col-span-2 text-white/80">{t.trendsPrecipMm}</div>
            <div className="text-right font-bold text-blue-400">24.92</div>
            <div className="text-right font-bold text-slate-300">0</div>
          </div>
          <div className="grid grid-cols-4 py-2 border-b border-white/10 pb-3">
            <div className="col-span-2 text-white/80">{t.trendsWindKmh}</div>
            <div className="text-right font-bold text-teal-400">19</div>
            <div className="text-right font-bold text-slate-300">4.7</div>
          </div>
        </div>

      </div>
    </div>
  );
}
