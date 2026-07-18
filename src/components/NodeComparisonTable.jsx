import React from 'react';
import { Activity } from 'lucide-react';

export default function NodeComparisonTable({ nodes, lang }) {
  const isEn = lang === 'en';

  const getVPD = (t, hr) => {
    const pvs = 0.61078 * Math.exp((17.27 * t) / (t + 237.3));
    const pva = pvs * (hr / 100);
    return parseFloat((pvs - pva).toFixed(2));
  };

  // Enriquecer nodos con VPD y ordenar
  const sortedNodes = [...nodes].map(node => {
    const temp = parseFloat(node.sentidos?.tacto?.temp_aire || 25);
    const hum = parseFloat(node.sentidos?.tacto?.humedad || 50);
    const soil = parseFloat(node.sentidos?.tacto?.humedad_suelo || 50);
    const vpd = getVPD(temp, hum);
    return { ...node, temp, hum, soil, vpd };
  }).sort((a, b) => b.vpd - a.vpd);

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl p-6 shadow-sm flex flex-col w-full mb-6 mt-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#2D3436] flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#52B788]" />
          {isEn ? 'Node comparison' : 'Comparación entre nodos'}
        </h2>
        <p className="text-sm text-[#636E72] mt-1">
          {isEn ? 'Current snapshot · ordered by descending VPD.' : 'Snapshot actual · ordenado por VPD descendente.'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#EEF5E9]">
              <th className="pb-3 text-xs font-bold text-[#636E72] tracking-wider uppercase px-4">{isEn ? 'NODE' : 'NODO'}</th>
              <th className="pb-3 text-xs font-bold text-[#636E72] tracking-wider uppercase px-4 text-center">TEMP</th>
              <th className="pb-3 text-xs font-bold text-[#636E72] tracking-wider uppercase px-4 text-center">HR</th>
              <th className="pb-3 text-xs font-bold text-[#636E72] tracking-wider uppercase px-4 text-center">{isEn ? 'SOIL' : 'SUELO'}</th>
              <th className="pb-3 text-xs font-bold text-[#636E72] tracking-wider uppercase px-4 text-right">VPD</th>
            </tr>
          </thead>
          <tbody>
            {sortedNodes.map((node, index) => {
              const isLast = index === sortedNodes.length - 1;
              
              let vpdColor = "text-[#2D6A4F]";
              if (node.vpd > 2.0) vpdColor = "text-[#E63946]";
              else if (node.vpd > 1.2) vpdColor = "text-[#F4A261]";

              return (
                <tr key={node.id} className={`${!isLast ? 'border-b border-[#EEF5E9]/50' : ''} hover:bg-[#F8FAF5]/50 transition-colors`}>
                  <td className="py-4 px-4">
                    <div className="font-bold text-[#2D3436] text-sm">{node.name}</div>
                    <div className="text-[10px] text-[#636E72] font-mono">{node.id_nodo}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-[#2D3436]">
                    {node.temp.toFixed(1)}°
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-[#2D3436]">
                    {node.hum}%
                  </td>
                  <td className="py-4 px-4 text-center font-semibold text-[#2D3436]">
                    {node.soil}%
                  </td>
                  <td className={`py-4 px-4 text-right font-bold text-base ${vpdColor}`}>
                    {node.vpd.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
