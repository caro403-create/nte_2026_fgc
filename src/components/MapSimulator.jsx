import React, { useState } from 'react';
import { Layers, Navigation } from 'lucide-react';

export default function MapSimulator({
  score,
  nodes,
  selectedNodeId,
  setSelectedNodeId,
  hotspots,
  setHotspots,
  lang
}) {
  const [showNodes, setShowNodes] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPolygon, setShowPolygon] = useState(true);

  const width = 800;
  const height = 500;

  const getPropagationPolygon = () => {
    if (score < 0.3) return null;
    
    const scale = (score - 0.2) * 2.2; 
    const baseCenterX = 480;
    const baseCenterY = 240;
    
    const points = [
      [baseCenterX - 25 * scale, baseCenterY - 45 * scale],
      [baseCenterX + 65 * scale, baseCenterY - 15 * scale],
      [baseCenterX + 85 * scale, baseCenterY + 45 * scale],
      [baseCenterX - 10 * scale, baseCenterY + 75 * scale],
      [baseCenterX - 75 * scale, baseCenterY + 15 * scale],
    ];
    
    return points.map(p => p.join(',')).join(' ');
  };

  const polyPoints = getPropagationPolygon();

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl overflow-hidden flex flex-col h-full relative shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
      
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-3 pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#EEF5E9] shadow-sm text-[#636E72]">
        <div className="flex items-center gap-1.5 pr-3 border-r border-[#EEF5E9] text-xs font-bold text-[#2D3436]">
          <Layers className="h-4 w-4 text-[#2D6A4F]" />
          <span>{lang === 'en' ? 'LAYERS:' : 'CAPAS:'}</span>
        </div>
        
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium hover:text-[#2D3436]">
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
            className="rounded border-gray-300 text-[#52B788] focus:ring-[#52B788]/25 h-4 w-4 accent-[#52B788]"
          />
          <span>{lang === 'en' ? 'IoT Nodes' : 'Nodos IoT'}</span>
        </label>
        
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium hover:text-[#2D3436]">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]/25 h-4 w-4 accent-[#E63946]"
          />
          <span>NASA FIRMS</span>
        </label>
        
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium hover:text-[#2D3436]">
          <input
            type="checkbox"
            checked={showPolygon}
            onChange={(e) => setShowPolygon(e.target.checked)}
            className="rounded border-gray-300 text-[#F4A261] focus:ring-[#F4A261]/25 h-4 w-4 accent-[#F4A261]"
          />
          <span>{lang === 'en' ? 'Fire Front' : 'Frente de Fuego'}</span>
        </label>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-12 left-4 z-20 hidden sm:flex flex-col gap-3 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-[#EEF5E9] text-xs text-[#636E72] shadow-[0_2px_12px_rgba(0,0,0,0.07)] text-left">
        <div className="font-bold text-[#2D3436] mb-1 border-b border-[#EEF5E9] pb-2 text-xs">
          {lang === 'en' ? 'IoT Node Status' : 'Estado de Nodos'}
        </div>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#52B788] inline-block shadow-sm"></span>
          <span>{lang === 'en' ? 'Normal (Safe)' : 'Normal (Seguro)'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#F4A261] inline-block shadow-sm"></span>
          <span>{lang === 'en' ? 'Warning (Dry)' : 'Precaución (Seco)'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#E63946] inline-block shadow-sm"></span>
          <span>{lang === 'en' ? 'Alarm (Critical)' : 'Alarma (Crítico)'}</span>
        </div>
        <div className="flex items-center gap-3 pt-2 mt-1 border-t border-[#EEF5E9]">
          <span className="w-3 h-3 rounded-full bg-[#2D6A4F] ring-2 ring-[#2D6A4F]/30 inline-block"></span>
          <span className="font-bold text-[#2D3436]">
            {lang === 'en' ? 'Selected Node' : 'Nodo Seleccionado'}
          </span>
        </div>
      </div>

      {/* Map Coordinates overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#EEF5E9] font-medium text-[10px] text-[#636E72] shadow-sm font-mono">
        PILOTO: BOSQUE SECO PALMIRA
      </div>

      {/* Interactive Map Visual */}
      <div className="flex-1 min-h-[350px] relative bg-[#F8FAF5] flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none cursor-crosshair" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle elevation contour lines */}
          <path d="M 0 100 Q 150 80, 250 140 T 500 120 T 800 200" fill="none" stroke="#EEF5E9" strokeWidth="2" />
          <path d="M 0 160 Q 200 130, 350 220 T 600 170 T 800 280" fill="none" stroke="#EEF5E9" strokeWidth="2" />
          <path d="M 0 240 Q 180 200, 300 310 T 650 250 T 800 360" fill="none" stroke="#EEF5E9" strokeWidth="2" />
          <path d="M 0 350 Q 220 300, 420 390 T 700 320 T 800 440" fill="none" stroke="#EEF5E9" strokeWidth="2" />

          {/* Fire Perimeter */}
          {showPolygon && polyPoints && (
            <g>
              <polygon points={polyPoints} fill="url(#fireGradient)" fillOpacity={0.15 + score * 0.2} stroke={score >= 0.8 ? '#E63946' : '#F4A261'} strokeWidth="2" strokeLinejoin="round" className="transition-all duration-700 ease-in-out" />
            </g>
          )}

          {/* NASA FIRMS Hotspots */}
          {showHotspots && hotspots.map((spot) => (
            <g key={spot.id} transform={`translate(${spot.x}, ${spot.y})`}>
              <circle r="16" fill="#E63946" opacity="0.15" className="animate-pulse" />
              <polygon points="0,-8 7,5 -7,5" fill="#E63946" stroke="#fff" strokeWidth="1.5" />
              <rect x="-25" y="10" width="50" height="14" rx="4" fill="white" fillOpacity="0.9" stroke="#E63946" strokeWidth="1" />
              <text y="20" textAnchor="middle" fill="#E63946" fontSize="8" fontWeight="bold">NASA #{spot.id}</text>
            </g>
          ))}

          {/* IoT Nodes */}
          {showNodes && nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            let nodeBg = '#52B788';
            if (node.status === 'alarm') nodeBg = '#E63946';
            else if (node.status === 'warning') nodeBg = '#F4A261';

            if (isSelected) nodeBg = '#2D6A4F';

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`} className="cursor-pointer" onClick={() => setSelectedNodeId(node.id)}>
                {(isSelected || node.status === 'alarm') && (
                  <circle r="18" fill="none" stroke={nodeBg} strokeWidth="2" strokeOpacity="0.4" className="animate-pulse" />
                )}

                <circle r={isSelected ? '10' : '8'} fill={nodeBg} stroke="#FFFFFF" strokeWidth="2" className="transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.1)]" />
                {isSelected && <circle r="3" fill="#FFFFFF" />}

                {/* Readable Label Above */}
                <g transform={`translate(0, ${isSelected ? '-24' : '-20'})`}>
                  <rect x="-30" y="-12" width="60" height="18" rx="6" fill="white" fillOpacity="0.95" stroke={isSelected ? '#2D6A4F' : '#EEF5E9'} strokeWidth="1.5" className="shadow-sm" />
                  <text y="0" textAnchor="middle" fill={isSelected ? '#2D3436' : '#636E72'} fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                    Nodo 0{node.id}
                  </text>
                </g>
              </g>
            );
          })}

          <defs>
            <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E63946" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#F4A261" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#E63946" stopOpacity="0.0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Info */}
      <div className="bg-white px-5 py-3 flex items-center justify-between text-xs font-medium text-[#636E72] border-t border-[#EEF5E9]">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-[#2D6A4F]" />
          <span>{lang === 'en' ? 'Pilot Zone coordinates: 3°31\'48"N 76°18\'13"W (Palmira)' : 'Coordenadas Piloto: 3°31\'48"N 76°18\'13"O (Palmira)'}</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>{lang === 'en' ? 'BST ECOSYSTEM' : 'ECOSISTEMA B.S.T.'}</span>
        </div>
      </div>
    </div>
  );
}
