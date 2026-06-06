/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Layers, Navigation } from 'lucide-react';

export default function MapSimulator({
  score,
  nodes,
  selectedNodeId,
  setSelectedNodeId,
  droneActive,
  evacRoutesActive,
  acousticAlertActive,
  hotspots,
  setHotspots
}) {
  // Layer toggles
  const [showNodes, setShowNodes] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPolygon, setShowPolygon] = useState(true);
  const [showEvacuation, setShowEvacuation] = useState(true);

  // SVG dimensions for consistent aspect ratio
  const width = 800;
  const height = 500;

  // Propagation polygon dynamically changes size/vertices based on score
  const getPropagationPolygon = () => {
    if (score < 0.3) return null; // No propagation polygon for low risk
    
    // Scale polygon coordinates based on risk score
    const scale = (score - 0.2) * 2.2; 
    const baseCenterX = 480;
    const baseCenterY = 240;
    
    // 5 vertices for an organic-looking fire polygon centered around Node 3
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
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col h-full relative group shadow-xs">
      {/* Map Control Bar Overlay (Light Glassmorphism style) */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-auto bg-white/90 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-slate-700">
        <div className="flex items-center gap-1.5 pr-2 mr-2 border-r border-gray-200 text-xs font-mono font-bold text-slate-700">
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          <span>CAPAS MAPA:</span>
        </div>
        
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium">
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/25 h-3.5 w-3.5"
          />
          <span>Nodos IoT</span>
        </label>
        
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium ml-2">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            className="rounded border-gray-300 text-red-500 focus:ring-red-500/25 h-3.5 w-3.5"
          />
          <span>FIRMS Satélite</span>
        </label>
        
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-slate-600 hover:text-slate-900 font-medium ml-2">
          <input
            type="checkbox"
            checked={showPolygon}
            onChange={(e) => setShowPolygon(e.target.checked)}
            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500/25 h-3.5 w-3.5"
          />
          <span>Perímetro Fuego</span>
        </label>
        
        {evacRoutesActive && (
          <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-slate-700 hover:text-slate-900 font-bold ml-2">
            <input
              type="checkbox"
              checked={showEvacuation}
              onChange={(e) => setShowEvacuation(e.target.checked)}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500/25 h-3.5 w-3.5"
            />
            <span className="text-emerald-600">Rutas Evac.</span>
          </label>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-3 rounded-lg border border-gray-200 text-[10px] font-mono text-slate-600 shadow-sm">
        <div className="font-bold text-slate-800 mb-1 border-b border-gray-100 pb-1">LEYENDA TÉCNICA</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block border border-white shadow-2xs"></span>
          <span>Nodo IoT Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block border border-white shadow-2xs"></span>
          <span>Nodo IoT Activo (Estable)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block border border-white shadow-2xs"></span>
          <span>Nodo IoT Advertencia</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block border border-white shadow-2xs"></span>
          <span>Nodo IoT Alarma Crítica</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-2 bg-red-400/20 border border-red-400/50 inline-block rounded"></span>
          <span>Frente de Fuego Estimado</span>
        </div>
      </div>

      {/* Map Coordinates overlay */}
      <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded border border-gray-200 font-mono text-[9px] text-slate-500 shadow-xs">
        REF: COL-MTN-ZONE-C4
      </div>

      {/* Interactive Map Visual (SVG Canvas with soft beige terrain background) */}
      <div className="flex-1 min-h-[350px] relative tech-grid bg-[#F4F3EF] flex items-center justify-center">
        {/* Radar Scanning Line Animation (highly subtle light sweep) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
          <svg className="w-full h-full">
            <circle cx={width / 2} cy={height / 2} r="350" fill="none" stroke="#DCDAD1" strokeWidth="1" strokeDasharray="4, 4" />
            <circle cx={width / 2} cy={height / 2} r="200" fill="none" stroke="#E5E4DE" strokeWidth="1" />
            <circle cx={width / 2} cy={height / 2} r="80" fill="none" stroke="#E5E4DE" strokeWidth="1" />
            {/* Radar sweep lines */}
            <line x1={width / 2} y1={height / 2} x2={width / 2 + 350} y2={height / 2} stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.25" className="radar-sweep" />
          </svg>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none cursor-crosshair"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle elevation contour lines (soft beige/gray terrain lines) */}
          <path d="M 0 100 Q 150 80, 250 140 T 500 120 T 800 200" fill="none" stroke="#E4E2DC" strokeWidth="1.5" />
          <path d="M 0 160 Q 200 130, 350 220 T 600 170 T 800 280" fill="none" stroke="#E4E2DC" strokeWidth="1" />
          <path d="M 0 240 Q 180 200, 300 310 T 650 250 T 800 360" fill="none" stroke="#E4E2DC" strokeWidth="1.5" />
          <path d="M 0 350 Q 220 300, 420 390 T 700 320 T 800 440" fill="none" stroke="#E4E2DC" strokeWidth="1" />

          {/* Evacuation Routes (simulated path from nodes to safe zones) */}
          {evacRoutesActive && showEvacuation && (
            <g>
              {/* Route 1 */}
              <path
                d="M 120 180 Q 200 280, 320 380 T 600 450"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="6, 5"
                className="animate-pulse"
              />
              {/* Route 2 */}
              <path
                d="M 480 240 Q 550 220, 680 320"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="6, 5"
                className="animate-pulse"
              />
              {/* Safe zone indicators */}
              <g transform="translate(600, 450)">
                <circle r="12" fill="#10b981" fillOpacity="0.2" className="pulse-ring" />
                <circle r="7" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                <text y="-14" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">PUNTO SEGURO A</text>
              </g>
              <g transform="translate(680, 320)">
                <circle r="12" fill="#10b981" fillOpacity="0.2" className="pulse-ring" />
                <circle r="7" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                <text y="-14" textAnchor="middle" fill="#047857" fontSize="9" fontWeight="bold" fontFamily="monospace">PUNTO SEGURO B</text>
              </g>
            </g>
          )}

          {/* Fire Perimeter ("Frente de Fuego") smooth overlay */}
          {showPolygon && polyPoints && (
            <g>
              {/* Smooth soft red/orange semi-transparent overlay */}
              <polygon
                points={polyPoints}
                fill="url(#fireGradient)"
                fillOpacity={0.2 + score * 0.25}
                stroke={score >= 0.8 ? '#DC2626' : '#EA580C'}
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-all duration-500 ease-out"
              />
              {/* Internal subtle border accent */}
              <polygon
                points={polyPoints}
                fill="none"
                stroke="#FB923C"
                strokeWidth="1"
                strokeOpacity="0.5"
                strokeLinejoin="round"
              />
              {/* Label inside the overlay */}
              <text
                x="480"
                y="200"
                fill="#DC2626"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
                className="animate-pulse shadow-sm"
              >
                FRENTE DE FUEGO {score >= 0.8 ? '(CRÍTICO)' : ''}
              </text>
            </g>
          )}

          {/* NASA FIRMS Hotspots */}
          {showHotspots && hotspots.map((spot, idx) => (
            <g key={spot.id} transform={`translate(${spot.x}, ${spot.y})`}>
              <circle r="14" fill="#EF4444" opacity="0.2" className="pulse-ring" />
              <polygon
                points="0,-7 6,4 -6,4"
                fill="#EF4444"
                stroke="#fff"
                strokeWidth="1"
                className="animate-pulse cursor-pointer shadow-xs"
                onClick={() => {
                  alert(`NASA FIRMS Hotspot #${spot.id}\nCoordenadas: Lat: 6.244, Lng: -75.589\nConfianza Térmica: 92%`);
                }}
              />
              <text y="-10" textAnchor="middle" fill="#C21C1C" fontSize="8" fontWeight="bold" fontFamily="monospace">
                FIRMS #{spot.id}
              </text>
            </g>
          ))}

          {/* IoT Sensor Nodes represented as clean flat circular icons */}
          {showNodes && nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            
            // Standard colors based on status (eco-friendly: stable green, amber warning, red alarm)
            let nodeBg = '#10B981'; // Stable emerald green
            let glow = 'glow-green';
            if (node.status === 'alarm') {
              nodeBg = '#F87171'; // Coral red for alarm
              glow = 'glow-red';
            } else if (node.status === 'warning') {
              nodeBg = '#F59E0B'; // Amber for warning
              glow = 'glow-yellow';
            }

            // If selected, we override to blue as requested: "distinct blue for selected"
            if (isSelected) {
              nodeBg = '#2563EB';
              glow = 'glow-blue';
            }

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNodeId(node.id)}
              >
                {/* Outer ring for selected or warning/alarm state */}
                {(isSelected || node.status === 'alarm' || node.status === 'warning') && (
                  <circle
                    r="16"
                    fill="none"
                    stroke={nodeBg}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    className="pulse-ring"
                  />
                )}

                {/* Acoustic alert ultrasonic wave animation */}
                {acousticAlertActive && node.status === 'alarm' && (
                  <g className="opacity-40">
                    <circle r="25" fill="none" stroke="#2563EB" strokeWidth="1" className="pulse-ring" style={{ animationDelay: '0s' }} />
                    <circle r="40" fill="none" stroke="#2563EB" strokeWidth="1" className="pulse-ring" style={{ animationDelay: '1s' }} />
                  </g>
                )}

                {/* Clean, flat circular node icon */}
                <circle
                  r={isSelected ? '9' : '7.5'}
                  fill={nodeBg}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="transition-all duration-200 shadow-sm"
                />

                {/* Small center dot for selected node to make it pop */}
                {isSelected && (
                  <circle r="3" fill="#FFFFFF" />
                )}

                {/* Label capsule */}
                <g transform="translate(0, 18)">
                  <rect
                    x="-24"
                    y="-6"
                    width="48"
                    height="12"
                    rx="4"
                    fill="white"
                    fillOpacity="0.85"
                    stroke={isSelected ? '#2563EB' : '#E2E8F0'}
                    strokeWidth="1"
                    className="shadow-2xs"
                  />
                  <text
                    y="3"
                    textAnchor="middle"
                    fill={isSelected ? '#1E3A8A' : '#475569'}
                    fontSize="8"
                    fontWeight={isSelected ? 'bold' : '600'}
                    fontFamily="monospace"
                  >
                    NODO 0{node.id}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Flying Drone */}
          {droneActive && (
            <g transform="translate(320, 200)" className="drone-bob">
              <path
                d="M -16 -16 L 16 16 M -16 16 L 16 -16"
                stroke="#2563EB"
                strokeWidth="1.5"
              />
              <circle r="5" fill="#2563EB" stroke="#fff" strokeWidth="1.5" />
              {/* Drone propellers */}
              <circle cx="-16" cy="-16" r="3" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <circle cx="16" cy="-16" r="3" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <circle cx="-16" cy="16" r="3" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <circle cx="16" cy="16" r="3" fill="none" stroke="#3b82f6" strokeWidth="1" />
              <text y="-20" textAnchor="middle" fill="#2563EB" fontSize="8" fontWeight="bold" fontFamily="monospace">
                DRON RECON
              </text>
              {/* Laser scanning vector lines */}
              <path d="M 0 0 L -35 120 M 0 0 L 35 120" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
            </g>
          )}

          {/* Gradients definitions for Fire Perimeter */}
          <defs>
            <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F87171" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#FB923C" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F87171" stopOpacity="0.0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Info for coordinates (Clean Light Style) */}
      <div className="bg-white px-4 py-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-slate-500 shadow-2xs">
        <div className="flex items-center gap-1">
          <Navigation className="h-3 w-3 text-red-500" />
          <span>COORDS: 6°14'44.2"N 75°35'21.1"W</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ALTITUD: 1,820m</span>
          <span>COBERTURA RED: 94%</span>
        </div>
      </div>
    </div>
  );
}
