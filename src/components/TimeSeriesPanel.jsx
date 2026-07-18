import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, ComposedChart, CartesianGrid } from 'recharts';
import { TriangleAlert } from 'lucide-react';

export default function TimeSeriesPanel({ node, lang }) {
  const isEn = lang === 'en';

  const data = useMemo(() => {
    const points = [];
    if (!node) return points;
    const baseTemp = parseFloat(node.sentidos?.tacto?.temp_aire || 25);
    const baseHum = parseFloat(node.sentidos?.tacto?.humedad || 50);

    const getVPD = (t, hr) => {
      const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
      const pva = pvs * (hr / 100);
      return parseFloat((pvs - pva).toFixed(2));
    };

    const now = new Date();
    
    for (let i = 48; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 30 * 60000); // 30 min intervals
      
      // Simulate diurnal cycle (sin curve)
      const hour = time.getHours() + time.getMinutes() / 60;
      const diurnalTemp = Math.sin((hour - 8) * Math.PI / 12) * 5; 
      const diurnalHum = Math.cos((hour - 8) * Math.PI / 12) * 15;

      const t = baseTemp - 5 + diurnalTemp + (Math.random() * 2 - 1);
      const h = Math.max(10, Math.min(100, baseHum + 10 + diurnalHum + (Math.random() * 4 - 2)));
      const v = getVPD(t, h);

      points.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: parseFloat(t.toFixed(1)),
        hum: parseFloat(h.toFixed(1)),
        vpd: v
      });
    }
    return points;
  }, [node]);

  if (!node) return null;

  const currentTemp = parseFloat(node.sentidos?.tacto?.temp_aire || 25);
  const currentHum = parseFloat(node.sentidos?.tacto?.humedad || 50);
  
  const getVPD = (t, hr) => {
    const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
    const pva = pvs * (hr / 100);
    return parseFloat((pvs - pva).toFixed(2));
  };
  const currentVpd = getVPD(currentTemp, currentHum);

  const getVpdStatus = (v) => {
    if (v > 2.0) return { label: 'EXTREMO', color: 'text-[#E63946]' };
    if (v > 1.2) return { label: 'ALTO', color: 'text-[#F4A261]' };
    return { label: 'ÓPTIMO', color: 'text-[#52B788]' };
  };

  const getCo2Status = (co2) => {
    if (co2 > 1000) return { label: 'EXTREMO', color: 'text-[#E63946]' };
    if (co2 > 600) return { label: 'ALTO', color: 'text-[#F4A261]' };
    return { label: 'ÓPTIMO', color: 'text-[#52B788]' };
  };

  const getPm25Status = (pm) => {
    if (pm > 35) return { label: 'EXTREMO', color: 'text-[#E63946]' };
    if (pm > 12) return { label: 'ALTO', color: 'text-[#F4A261]' };
    return { label: 'ÓPTIMO', color: 'text-[#52B788]' };
  };

  const vpdStatus = getVpdStatus(currentVpd);
  const co2 = parseFloat(node.sentidos?.olfato?.co_ppm || 400);
  const co2Status = getCo2Status(co2);
  const pm25 = parseFloat(node.sentidos?.olfato?.pm25 || 10);
  const pm25Status = getPm25Status(pm25);
  const soil = parseFloat(node.sentidos?.tacto?.humedad_suelo || 50);
  const tempCont = parseFloat(node.sentidos?.tacto?.temp_contacto || 25);

  return (
    <div className="flex flex-col xl:flex-row gap-6 mt-6 w-full mb-2">
      
      {/* Columna Izquierda: Gráfica */}
      <div className="flex-1 bg-white border border-[#EEF5E9] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#2D3436]">
              {isEn ? 'Time series — ' : 'Serie temporal — '}{node.name}
            </h2>
            <p className="text-sm text-[#636E72] mt-1">
              {isEn ? 'Temperature, relative humidity and calculated VPD · last 48 points' : 'Temperatura, humedad relativa y VPD calculado · últimos 48 puntos'}
            </p>
          </div>
          <div className="flex bg-[#F8FAF5] p-1 rounded-full border border-[#EEF5E9]">
            <button className="px-3 py-1 text-xs font-bold bg-[#52B788] text-white rounded-full shadow-sm">
              {isEn ? 'Day' : 'Día'}
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-[#636E72] hover:text-[#2D3436] transition-colors">
              {isEn ? 'Week' : 'Semana'}
            </button>
            <button className="px-3 py-1 text-xs font-semibold text-[#636E72] hover:text-[#2D3436] transition-colors">
              {isEn ? 'Month' : 'Mes'}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF5E9" />
              <XAxis dataKey="time" tick={{fontSize: 10, fill: '#636E72'}} tickLine={false} axisLine={false} minTickGap={30} />
              <YAxis yAxisId="left" tick={{fontSize: 10, fill: '#636E72'}} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#636E72'}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #EEF5E9', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}
                labelStyle={{ color: '#2D3436', fontWeight: 'bold', marginBottom: '4px' }}
              />
              
              <Line yAxisId="left" type="monotone" dataKey="temp" name={isEn ? "Temperature °C" : "Temperatura °C"} stroke="#F4A261" strokeWidth={2} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="hum" name={isEn ? "Relative Humidity %" : "Humedad relativa %"} stroke="#48CAE4" strokeWidth={2} dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="vpd" name="VPD kPa" fill="#E63946" stroke="#E63946" fillOpacity={0.1} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-6 mt-4 pt-4 border-t border-[#EEF5E9] text-xs font-semibold text-[#636E72]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F4A261]"></div>
            {isEn ? 'Temperature °C' : 'Temperatura °C'}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#48CAE4]"></div>
            {isEn ? 'Relative humidity %' : 'Humedad relativa %'}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E63946]"></div>
            VPD kPa
          </div>
        </div>
      </div>

      {/* Columna Derecha: Alertas por Sensor */}
      <div className="w-full xl:w-[350px] bg-white border border-[#EEF5E9] rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex flex-col shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <TriangleAlert className="w-5 h-5 text-[#F4A261]" />
          <h2 className="text-xl font-bold text-[#2D3436]">
            {isEn ? 'Sensor alerts' : 'Alertas por sensor'}
          </h2>
        </div>
        <p className="text-sm text-[#636E72] mb-6">
          {isEn ? 'Threshold rules applied to the active node.' : 'Reglas de umbral aplicadas al nodo activo.'}
        </p>

        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
          {/* VPD */}
          <div className={`p-4 rounded-xl border ${vpdStatus.color === 'text-[#E63946]' ? 'border-[#E63946]/30 bg-[#E63946]/5' : vpdStatus.color === 'text-[#F4A261]' ? 'border-[#F4A261]/30 bg-[#F4A261]/5' : 'border-[#EEF5E9] bg-[#F8FAF5]'}`}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${vpdStatus.color.replace('text-', 'bg-')}`}></div>
                <span className="font-bold text-[#2D3436]">VPD {currentVpd} kPa</span>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider ${vpdStatus.color}`}>{vpdStatus.label}</span>
            </div>
            <p className="text-[11px] text-[#636E72] pl-4">
              {isEn ? 'Composite index of air temperature and humidity.' : 'Índice compuesto de temperatura y humedad del aire.'}
            </p>
          </div>

          {/* CO2 */}
          <div className={`p-4 rounded-xl border ${co2Status.color === 'text-[#E63946]' ? 'border-[#E63946]/30 bg-[#E63946]/5' : co2Status.color === 'text-[#F4A261]' ? 'border-[#F4A261]/30 bg-[#F4A261]/5' : 'border-[#EEF5E9] bg-[#F8FAF5]'}`}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${co2Status.color.replace('text-', 'bg-')}`}></div>
                <span className="font-bold text-[#2D3436]">CO₂ {co2} ppm</span>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider ${co2Status.color}`}>{co2Status.label}</span>
            </div>
            <p className="text-[11px] text-[#636E72] pl-4">
              {co2Status.label === 'EXTREMO' ? 'Niveles críticos de monóxido y gases.' : 'Dentro de rango normal.'}
            </p>
          </div>

          {/* PM2.5 */}
          <div className={`p-4 rounded-xl border ${pm25Status.color === 'text-[#E63946]' ? 'border-[#E63946]/30 bg-[#E63946]/5' : pm25Status.color === 'text-[#F4A261]' ? 'border-[#F4A261]/30 bg-[#F4A261]/5' : 'border-[#EEF5E9] bg-[#F8FAF5]'}`}>
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${pm25Status.color.replace('text-', 'bg-')}`}></div>
                <span className="font-bold text-[#2D3436]">PM2.5 {pm25.toFixed(1)} μg/m³</span>
              </div>
              <span className={`text-[10px] font-extrabold tracking-wider ${pm25Status.color}`}>{pm25Status.label}</span>
            </div>
            <p className="text-[11px] text-[#636E72] pl-4">
              Detección de humo por láser HM3301.
            </p>
          </div>

          {/* Humedad Suelo */}
          <div className="p-4 rounded-xl border border-[#EEF5E9] bg-[#F8FAF5]">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#52B788]"></div>
                <span className="font-bold text-[#2D3436]">Humedad suelo {soil}%</span>
              </div>
              <span className="text-[10px] font-extrabold tracking-wider text-[#52B788]">ÓPTIMO</span>
            </div>
            <p className="text-[11px] text-[#636E72] pl-4">
              Sequedad del terreno (HD38).
            </p>
          </div>

          {/* Temp Contacto */}
          <div className="p-4 rounded-xl border border-[#EEF5E9] bg-[#F8FAF5]">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#52B788]"></div>
                <span className="font-bold text-[#2D3436]">Temp. contacto {tempCont.toFixed(1)} °C</span>
              </div>
              <span className="text-[10px] font-extrabold tracking-wider text-[#52B788]">ÓPTIMO</span>
            </div>
            <p className="text-[11px] text-[#636E72] pl-4">
              Temperatura directa del combustible (DS18B20).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
