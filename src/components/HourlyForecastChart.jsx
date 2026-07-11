import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Cloud, CloudRain, Sun, Moon, Wind } from 'lucide-react';

const mockHourlyData = Array.from({ length: 24 }).map((_, i) => {
  const hour = i;
  const temp = 20 + Math.sin((hour - 8) * (Math.PI / 12)) * 8 + (Math.random() * 2);
  const precip = Math.max(0, Math.sin((hour - 4) * (Math.PI / 8)) * 5 + (Math.random() * 2));
  const wind = 10 + Math.sin((hour - 12) * (Math.PI / 6)) * 15 + (Math.random() * 5);
  const isNight = hour < 6 || hour > 18;
  return {
    time: `${hour}:00`,
    hour,
    temp: Math.round(temp),
    precip: Math.round(precip),
    wind: Math.round(wind),
    isNight,
    prob: Math.round(Math.random() * 30),
  };
});

const CustomTooltip = ({ active, payload, label, activeTab }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white shadow-xl flex flex-col items-center z-50">
        <span className="text-xs text-white/50 font-bold mb-1">{label}</span>
        <div className="flex items-center gap-2">
          {activeTab === 'precip' ? (
            <>
              <CloudRain className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-extrabold">{data.precip} mm</span>
            </>
          ) : activeTab === 'wind' ? (
            <>
              <Wind className="w-5 h-5 text-teal-400" />
              <span className="text-xl font-extrabold">{data.wind} km/h</span>
            </>
          ) : (
            <>
              {data.isNight ? <Moon className="w-5 h-5 text-indigo-300" /> : <Sun className="w-5 h-5 text-amber-400" />}
              <span className="text-xl font-extrabold">{data.temp}°</span>
            </>
          )}
        </div>
        {activeTab !== 'precip' && activeTab !== 'wind' && data.prob > 0 && <span className="text-[10px] text-blue-400 font-bold mt-1">💧 {data.prob}%</span>}
      </div>
    );
  }
  return null;
};

export default function HourlyForecastChart({ baseTemp }) {
  const [activeTab, setActiveTab] = useState('hourly'); // hourly, general, precip, wind

  // Adjust mock data to base temp
  const data = mockHourlyData.map(d => ({
    ...d,
    temp: Math.round((d.temp - 20) + (baseTemp || 25))
  }));

  const getDataKey = () => {
    switch (activeTab) {
      case 'precip': return 'precip';
      case 'wind': return 'wind';
      case 'hourly':
      case 'general':
      default: return 'temp';
    }
  };

  const getColor = () => {
    switch (activeTab) {
      case 'precip': return '#3b82f6';
      case 'wind': return '#14b8a6';
      case 'hourly':
      case 'general':
      default: return '#fbbf24';
    }
  };

  const dataKey = getDataKey();
  const color = getColor();

  const minVal = Math.min(...data.map(d => d[dataKey])) - 5;
  const maxVal = Math.max(...data.map(d => d[dataKey])) + 5;

  return (
    <div className="bg-[#1C1C1C] rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden relative">
      {/* Header Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2 overflow-x-auto text-sm font-bold" style={{ scrollbarWidth: 'none' }}>
        <button onClick={() => setActiveTab('hourly')} className={`${activeTab === 'hourly' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white transition-colors'} pb-2 px-1 whitespace-nowrap`}>Por hora</button>
        <button onClick={() => setActiveTab('general')} className={`${activeTab === 'general' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-white/50 hover:text-white transition-colors'} pb-2 px-1 whitespace-nowrap`}>Información general</button>
        <button onClick={() => setActiveTab('precip')} className={`${activeTab === 'precip' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-white/50 hover:text-white transition-colors'} pb-2 px-1 whitespace-nowrap`}>Precipitación</button>
        <button onClick={() => setActiveTab('wind')} className={`${activeTab === 'wind' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-white/50 hover:text-white transition-colors'} pb-2 px-1 whitespace-nowrap`}>Viento</button>
      </div>

      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart key={activeTab} data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`colorGradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.5}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }} 
              dy={10}
            />
            <YAxis 
              domain={[minVal, maxVal]} 
              axisLine={false} 
              tickLine={false} 
              tick={false} 
            />
            <Tooltip content={<CustomTooltip activeTab={activeTab} />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3}
              fillOpacity={1} 
              fill={`url(#colorGradient-${activeTab})`} 
              activeDot={{ r: 6, fill: color, stroke: '#1C1C1C', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Solar/Lunar Phase Bar (Simulated) */}
      <div className="flex items-center justify-between text-[10px] text-white/40 font-bold border-t border-white/10 pt-4 mt-4">
        <div className="flex items-center gap-2 text-indigo-300">
          <Moon className="w-3 h-3" /> Fase lunar: Luna menguante
        </div>
      </div>
    </div>
  );
}
