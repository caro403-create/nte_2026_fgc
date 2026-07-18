import React from 'react';
import { MapPin } from 'lucide-react';

export default function NodesSummary({ nodes, lang }) {
  const isEn = lang === 'en';

  const getVPD = (t, hr) => {
    const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
    const pva = pvs * (hr / 100);
    return parseFloat((pvs - pva).toFixed(2));
  };

  const activeAlerts = nodes.filter(n => n.fusion?.status === 'alarm').length;

  return (
    <div className="flex flex-col gap-4 mb-2">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold text-[#52B788] tracking-widest uppercase mb-1">
            {isEn ? 'Early Detection · Phase 1' : 'Detección Temprana · Fase 1'}
          </div>
          <h1 className="text-3xl font-bold text-[#2D3436] mb-2">
            {isEn ? 'Node Monitoring' : 'Monitoreo por Nodos'}
          </h1>
          <p className="text-sm text-[#636E72] max-w-3xl">
            {isEn 
              ? 'Live readings from field sensors (MQ135, HM3301, MKR ENV, DS18B20, HD38) plus the predictive VPD index calculated in the backend from air temperature and humidity.' 
              : 'Lecturas en vivo de los sensores desplegados en campo (MQ135, HM3301, MKR ENV, DS18B20, HD38) más el índice predictivo VPD calculado en el backend a partir de temperatura y humedad del aire.'}
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white border border-[#EEF5E9] px-4 py-3 rounded-2xl shadow-sm text-center min-w-[120px]">
            <div className="text-[10px] text-[#636E72] font-semibold mb-1">
              {isEn ? 'Active Nodes' : 'Nodos activos'}
            </div>
            <div className="text-xl font-extrabold text-[#2D3436]">{nodes.length} / 4</div>
          </div>
          <div className="bg-white border border-[#EEF5E9] px-4 py-3 rounded-2xl shadow-sm text-center min-w-[120px]">
            <div className="text-[10px] text-[#636E72] font-semibold mb-1">
              {isEn ? 'Active Alerts' : 'Alertas activas'}
            </div>
            <div className={`text-xl font-extrabold ${activeAlerts > 0 ? 'text-[#E63946]' : 'text-[#52B788]'}`}>
              {activeAlerts}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de 4 Nodos */}
      <div className="grid grid-cols-4 gap-4 mt-2">
        {nodes.slice(0, 4).map(node => {
          const temp = node.sentidos?.tacto?.temp_aire || 25;
          const hum = node.sentidos?.tacto?.humedad || 50;
          const vpd = getVPD(temp, hum);
          
          let vpdStatus = "ÓPTIMO";
          let vpdColor = "text-[#2D6A4F]";
          let borderColor = "border-[#52B788]";
          let dotColor = "bg-[#52B788]";

          if (vpd > 2.0) { 
            vpdStatus = "EXTREMO"; 
            vpdColor = "text-[#E63946]"; 
            borderColor = "border-[#E63946]";
            dotColor = "bg-[#E63946]";
          } else if (vpd > 1.2) { 
            vpdStatus = "ALTO"; 
            vpdColor = "text-[#F4A261]"; 
            borderColor = "border-[#F4A261]";
            dotColor = "bg-[#F4A261]";
          }

          return (
            <div key={node.id} className={`bg-white border-t-4 ${borderColor} border-x border-b border-x-[#EEF5E9] border-b-[#EEF5E9] rounded-2xl p-4 shadow-sm flex flex-col justify-between relative`}>
              {/* Dot superior derecho */}
              <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${dotColor}`}></div>

              <div>
                <div className="text-[10px] text-[#636E72] font-mono mb-1">{node.id_nodo}</div>
                <h3 className="font-bold text-[#2D3436] text-base leading-tight mb-1">{node.name}</h3>
                <div className="flex items-center text-xs text-[#636E72] gap-1 mb-4">
                  <MapPin className="w-3 h-3" />
                  {node.location}
                </div>
              </div>

              <div className="flex items-end justify-between mt-2">
                <div>
                  <div className="text-[10px] text-[#636E72] font-semibold mb-0.5">VPD</div>
                  <div className={`text-xl font-extrabold ${vpdColor}`}>
                    {vpd.toFixed(2)} <span className="text-xs font-semibold text-[#636E72] ml-0.5">kPa</span>
                  </div>
                </div>
                <div className={`text-[9px] font-extrabold uppercase tracking-wider ${vpdColor}`}>
                  {vpdStatus}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
