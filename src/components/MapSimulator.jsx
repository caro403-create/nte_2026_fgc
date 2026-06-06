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
  // We can interpolate vertices or size. Let's make it look like a growing threat.
  const getPropagationPolygon = () => {
    if (score < 0.3) return null; // No propagation polygon for low risk
    
    // Scale polygon coordinates based on risk score
    const scale = (score - 0.2) * 2.2; // 0 to 1.76
    const baseCenterX = 450;
    const baseCenterY = 250;
    
    // 5 vertices for a organic-looking fire polygon
    const points = [
      [baseCenterX - 20 * scale, baseCenterY - 40 * scale],
      [baseCenterX + 60 * scale, baseCenterY - 10 * scale],
      [baseCenterX + 80 * scale, baseCenterY + 40 * scale],
      [baseCenterX - 10 * scale, baseCenterY + 70 * scale],
      [baseCenterX - 70 * scale, baseCenterY + 10 * scale],
    ];
    
    return points.map(p => p.join(',')).join(' ');
  };

  const polyPoints = getPropagationPolygon();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col h-full relative group">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 pointer-events-auto bg-gray-950/80 backdrop-blur-md px-3 py-2 rounded-lg border border-gray-800">
        <div className="flex items-center gap-1.5 pr-2 mr-2 border-r border-gray-800 text-xs font-mono font-bold text-gray-300">
          <Layers className="h-3.5 w-3.5 text-blue-500" />
          <span>CAPAS MAPA:</span>
        </div>
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-gray-400 hover:text-white">
          <input
            type="checkbox"
            checked={showNodes}
            onChange={(e) => setShowNodes(e.target.checked)}
            className="rounded bg-gray-850 border-gray-700 text-blue-500 focus:ring-0 focus:ring-offset-0"
          />
          <span>Nodos IoT ({nodes.length})</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-gray-400 hover:text-white ml-2">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            className="rounded bg-gray-850 border-gray-700 text-orange-500 focus:ring-0 focus:ring-offset-0"
          />
          <span>FIRMS Satélite</span>
        </label>
        <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-gray-400 hover:text-white ml-2">
          <input
            type="checkbox"
            checked={showPolygon}
            onChange={(e) => setShowPolygon(e.target.checked)}
            className="rounded bg-gray-850 border-gray-700 text-red-500 focus:ring-0 focus:ring-offset-0"
          />
          <span>Sim. Propagación</span>
        </label>
        {evacRoutesActive && (
          <label className="flex items-center gap-1.5 text-xs font-mono cursor-pointer select-none text-gray-400 hover:text-white ml-2">
            <input
              type="checkbox"
              checked={showEvacuation}
              onChange={(e) => setShowEvacuation(e.target.checked)}
              className="rounded bg-gray-850 border-gray-700 text-green-500 focus:ring-0 focus:ring-offset-0"
            />
            <span className="text-green-400 font-bold">Rutas Evac.</span>
          </label>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex flex-col gap-1 bg-gray-950/85 backdrop-blur-md px-3 py-2.5 rounded-lg border border-gray-800 text-[10px] font-mono text-gray-400">
        <div className="font-bold text-gray-300 mb-1 border-b border-gray-800 pb-0.5">LEYENDA TÉCNICA</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
          <span>Nodo IoT Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
          <span>Nodo IoT Operativo</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse inline-block"></span>
          <span>Hotspot Satelital FIRMS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-2 bg-purple-600/30 border border-purple-500/50 inline-block rounded"></span>
          <span>Frente del Fuego Estimado</span>
        </div>
      </div>

      {/* Map Coordinates overlay */}
      <div className="absolute top-4 right-4 z-20 bg-gray-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-gray-800 font-mono text-[9px] text-gray-400">
        REF: COL-MTN-ZONE-C4
      </div>

      {/* Interactive Map Visual (SVG Canvas) */}
      <div className="flex-1 min-h-[350px] relative tech-grid bg-slate-950 flex items-center justify-center">
        {/* Radar Scanning Line Animation (to simulate technical sweep) */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
          <svg className="w-full h-full">
            <circle cx={width / 2} cy={height / 2} r="350" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="5, 5" />
            <circle cx={width / 2} cy={height / 2} r="200" fill="none" stroke="#1e293b" strokeWidth="1" />
            <circle cx={width / 2} cy={height / 2} r="80" fill="none" stroke="#1e293b" strokeWidth="1" />
            {/* Radar sweep lines */}
            <line x1={width / 2} y1={height / 2} x2={width / 2 + 350} y2={height / 2} stroke="#3b82f6" strokeWidth="1" className="radar-sweep" />
          </svg>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none cursor-crosshair"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Simulated Topographic / Contour Lines */}
          <path d="M 0 100 Q 150 80, 250 140 T 500 120 T 800 200" fill="none" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M 0 160 Q 200 130, 350 220 T 600 170 T 800 280" fill="none" stroke="#1e293b" strokeWidth="1" />
          <path d="M 0 240 Q 180 200, 300 310 T 650 250 T 800 360" fill="none" stroke="#1e293b" strokeWidth="1.5" />
          <path d="M 0 350 Q 220 300, 420 390 T 700 320 T 800 440" fill="none" stroke="#1e293b" strokeWidth="1" />

          {/* Evacuation Routes (simulated path from nodes to safe zones) */}
          {evacRoutesActive && showEvacuation && (
            <g className="animate-pulse">
              {/* Route 1 */}
              <path
                d="M 120 180 Q 200 280, 320 380 T 600 450"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray="8, 6"
              />
              {/* Route 2 */}
              <path
                d="M 450 130 Q 550 220, 680 320"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray="8, 6"
              />
              {/* Safe zone indicators */}
              <g transform="translate(600, 450)">
                <circle r="14" fill="#065f46" opacity="0.6" />
                <circle r="8" fill="#10b981" />
                <text y="-18" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">ZONA SEGURA A</text>
              </g>
              <g transform="translate(680, 320)">
                <circle r="14" fill="#065f46" opacity="0.6" />
                <circle r="8" fill="#10b981" />
                <text y="-18" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">ZONA SEGURA B</text>
              </g>
            </g>
          )}

          {/* Translucent Propagation Polygon */}
          {showPolygon && polyPoints && (
            <g>
              {/* Pulse backing */}
              <polygon
                points={polyPoints}
                fill="url(#fireGradient)"
                fillOpacity={0.25 + score * 0.25}
                stroke={score >= 0.8 ? '#a855f7' : '#ef4444'}
                strokeWidth="2.5"
                strokeDasharray={score >= 0.8 ? '5,3' : '0'}
                className="transition-all duration-500 ease-out"
              />
              {/* Internal warning overlay */}
              <polygon
                points={polyPoints}
                fill="none"
                stroke="#f97316"
                strokeWidth="1"
                opacity="0.6"
              />
              {/* Labels for fire front */}
              <text
                x="450"
                y="220"
                fill="#f87171"
                fontSize="10"
                fontWeight="extrabold"
                fontFamily="monospace"
                textAnchor="middle"
                className="animate-pulse"
              >
                FRENTE DE PROPAGACIÓN {score >= 0.8 ? '(CRÍTICO)' : ''}
              </text>
            </g>
          )}

          {/* NASA FIRMS Hotspots */}
          {showHotspots && hotspots.map((spot, idx) => (
            <g key={spot.id} transform={`translate(${spot.x}, ${spot.y})`}>
              <circle r="16" fill="#f97316" opacity="0.15" className="pulse-ring" />
              <polygon
                points="0,-8 7,5 -7,5"
                fill="#ef4444"
                stroke="#fff"
                strokeWidth="1"
                className="animate-pulse cursor-pointer filter drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]"
                onClick={() => {
                  // Alert click
                  alert(`NASA FIRMS Hotspot #${spot.id}\nCoordenadas: Lat: 6.244, Lng: -75.589\nConfianza Térmica: 92%`);
                }}
              />
              <text y="-12" textAnchor="middle" fill="#f87171" fontSize="8" fontWeight="bold" fontFamily="monospace">
                FIRMS #{spot.id}
              </text>
            </g>
          ))}

          {/* IoT Sensor Nodes */}
          {showNodes && nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            // Node colors based on individual risk
            let nodeColor = '#22c55e'; // Green
            if (node.status === 'alarm') nodeColor = '#ef4444';
            else if (node.status === 'warning') nodeColor = '#f97316';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => setSelectedNodeId(node.id)}
              >
                {/* Pulsing ring if selected or if in alarm */}
                {(isSelected || node.status === 'alarm') && (
                  <circle
                    r="22"
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth="2"
                    className="pulse-ring"
                  />
                )}
                
                {/* Acoustic alert wave animation */}
                {acousticAlertActive && node.status === 'alarm' && (
                  <g className="opacity-75">
                    <circle r="30" fill="none" stroke="#3b82f6" strokeWidth="1" className="pulse-ring" style={{ animationDelay: '0s' }} />
                    <circle r="45" fill="none" stroke="#3b82f6" strokeWidth="1" className="pulse-ring" style={{ animationDelay: '1s' }} />
                  </g>
                )}

                {/* Node pin */}
                <circle
                  r={isSelected ? '10' : '8'}
                  fill={isSelected ? '#090d16' : nodeColor}
                  stroke={isSelected ? '#3b82f6' : '#fff'}
                  strokeWidth={isSelected ? '3' : '1.5'}
                  className="transition-all duration-200"
                />

                {/* Inner dot for selected node */}
                {isSelected && (
                  <circle r="4" fill="#3b82f6" />
                )}

                {/* Label */}
                <text
                  y="20"
                  textAnchor="middle"
                  fill={isSelected ? '#fff' : '#9ca3af'}
                  fontSize="9"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  fontFamily="monospace"
                  className="bg-black/60 px-1 py-0.5 rounded"
                >
                  NODO 0{node.id}
                </text>
              </g>
            );
          })}

          {/* Simulated Flying Drone */}
          {droneActive && (
            <g transform="translate(320, 200)" className="drone-bob">
              <path
                d="M -20 -20 L 20 20 M -20 20 L 20 -20"
                stroke="#60a5fa"
                strokeWidth="2"
              />
              <circle r="6" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
              {/* Drone propellers */}
              <circle cx="-20" cy="-20" r="4" fill="none" stroke="#60a5fa" className="animate-spin" />
              <circle cx="20" cy="-20" r="4" fill="none" stroke="#60a5fa" className="animate-spin" />
              <circle cx="-20" cy="20" r="4" fill="none" stroke="#60a5fa" className="animate-spin" />
              <circle cx="20" cy="20" r="4" fill="none" stroke="#60a5fa" className="animate-spin" />
              <text y="-25" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold" fontFamily="monospace">
                DRON RECON
              </text>
              {/* Laser camera vector scanning below */}
              <path d="M 0 0 L -40 120 M 0 0 L 40 120" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5" />
            </g>
          )}

          {/* Gradients definitions */}
          <defs>
            <radialGradient id="fireGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={score >= 0.8 ? '#c084fc' : '#ef4444'} stopOpacity="0.8" />
              <stop offset="70%" stopColor="#f97316" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Footer Info for coordinates */}
      <div className="bg-gray-950 px-4 py-2 border-t border-gray-800 flex items-center justify-between text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-1">
          <Navigation className="h-3 w-3 text-red-500 animate-pulse" />
          <span>CENTRO DEL MAPA: 6°14'44.2"N 75°35'21.1"W</span>
        </div>
        <div className="flex items-center gap-3">
          <span>ALTITUD: 1,820m</span>
          <span>COB: 94%</span>
        </div>
      </div>
    </div>
  );
}
