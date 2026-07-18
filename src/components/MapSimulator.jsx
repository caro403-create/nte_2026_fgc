import React, { useState, useEffect, useRef } from 'react';
import { Layers, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Coordenadas reales georeferenciadas del Valle del Cauca
const nodeCoords = {
  1: { lat: 3.836, lng: -76.301 }, // El Vínculo (Buga)
  2: { lat: 3.864, lng: -76.435 }, // Bosque de Yotoco
  3: { lat: 3.876, lng: -76.437 }, // Chimbilaco (Epicentro de Alerta)
  4: { lat: 4.395, lng: -76.069 }, // Hacienda El Medio (Zarzal)
};

const hotspotsCoords = {
  101: { lat: 3.879, lng: -76.435 }, // Cerca de Chimbilaco
  102: { lat: 3.872, lng: -76.442 }  // Cerca de Chimbilaco
};

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

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  
  // Layer Groups
  const nodesGroupRef = useRef(null);
  const hotspotsGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa centrado en el Valle del Cauca
    const map = L.map(mapContainerRef.current, {
      center: [4.0, -76.2], // Centro aproximado Valle del Cauca
      zoom: 9, // Nivel de zoom regional
      minZoom: 5,
      zoomControl: false,
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // Capa Base OpenStreetMap (igual que en el observatorio)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20
    }).addTo(map);

    // Inicializar Layer Groups
    nodesGroupRef.current = L.layerGroup().addTo(map);
    hotspotsGroupRef.current = L.layerGroup().addTo(map);

    // Limpieza
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Solo al montar

  // Actualizar visibilidad de capas
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (showNodes && !map.hasLayer(nodesGroupRef.current)) map.addLayer(nodesGroupRef.current);
    if (!showNodes && map.hasLayer(nodesGroupRef.current)) map.removeLayer(nodesGroupRef.current);

    if (showHotspots && !map.hasLayer(hotspotsGroupRef.current)) map.addLayer(hotspotsGroupRef.current);
    if (!showHotspots && map.hasLayer(hotspotsGroupRef.current)) map.removeLayer(hotspotsGroupRef.current);

  }, [showNodes, showHotspots]);

  // Dibujar Nodos
  useEffect(() => {
    const group = nodesGroupRef.current;
    if (!group) return;
    group.clearLayers();

    nodes.forEach(node => {
      const coords = nodeCoords[node.id];
      if (!coords) return;

      const isSelected = node.id === selectedNodeId;
      const status = node?.fusion?.status || node?.status;
      const nId = node?.id_nodo || `0${node?.id}`;
      
      let nodeBg = '#52B788';
      if (status === 'alarm') nodeBg = '#E63946';
      else if (status === 'warning') nodeBg = '#F4A261';
      if (isSelected) nodeBg = '#2D6A4F';

      const pulseHtml = (isSelected || status === 'alarm') 
        ? `<div style="position:absolute; width:44px; height:44px; border-radius:50%; border:2px solid ${nodeBg}; opacity:0.4; top:-12px; left:-12px;" class="animate-pulse"></div>` 
        : '';

      const dotHtml = `<div style="position:absolute; width:${isSelected ? 20 : 16}px; height:${isSelected ? 20 : 16}px; border-radius:50%; background-color:${nodeBg}; border:2px solid #FFFFFF; box-shadow:0 2px 4px rgba(0,0,0,0.2); top:0; left:0; display:flex; align-items:center; justify-content:center;">
        ${isSelected ? '<div style="width:6px; height:6px; border-radius:50%; background-color:#FFF;"></div>' : ''}
      </div>`;

      const labelHtml = `<div style="position:absolute; top:-24px; left:-30px; width:60px; height:18px; border-radius:6px; background-color:rgba(255,255,255,0.95); border:1.5px solid ${isSelected ? '#2D6A4F' : '#EEF5E9'}; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <span style="font-size:9px; font-weight:bold; font-family:sans-serif; color:${isSelected ? '#2D3436' : '#636E72'};">Nodo ${nId}</span>
      </div>`;

      const customIcon = L.divIcon({
        html: `<div style="position:relative; width:20px; height:20px;">
          ${pulseHtml}
          ${dotHtml}
          ${labelHtml}
        </div>`,
        className: 'custom-iot-node',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });
      
      marker.on('click', () => {
        setSelectedNodeId(node.id);
      });

      group.addLayer(marker);
    });
  }, [nodes, selectedNodeId]);

  // Dibujar NASA FIRMS
  useEffect(() => {
    const group = hotspotsGroupRef.current;
    if (!group) return;
    group.clearLayers();

    hotspots.forEach(spot => {
      const coords = hotspotsCoords[spot.id];
      if (!coords) return;

      const html = `<div style="position:relative; width:32px; height:32px; display:flex; justify-content:center; align-items:center;">
        <div style="position:absolute; width:100%; height:100%; border-radius:50%; background-color:#E63946; opacity:0.25;" class="animate-pulse"></div>
        <svg viewBox="0 0 14 10" width="14" height="10" style="position:relative; z-index:10; fill:#E63946; stroke:#fff; stroke-width:1.5;">
          <polygon points="7,0 14,10 0,10" />
        </svg>
        <div style="position:absolute; top:24px; background-color:rgba(255,255,255,0.9); border:1px solid #E63946; border-radius:4px; padding:2px 4px; white-space:nowrap;">
          <span style="font-size:8px; font-weight:bold; color:#E63946;">NASA #${spot.id}</span>
        </div>
      </div>`;

      const icon = L.divIcon({
        html,
        className: 'custom-hotspot-node',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([coords.lat, coords.lng], { icon });
      group.addLayer(marker);
    });
  }, [hotspots]);

  return (
    <div className="bg-white border border-[#EEF5E9] rounded-2xl overflow-hidden flex flex-col h-full relative shadow-[0_2px_12px_rgba(0,0,0,0.07)] z-10">
      
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-3 pointer-events-auto bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#EEF5E9] shadow-sm text-[#636E72]">
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
        
        {/* Hotspots Checkbox */}
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium hover:text-[#2D3436]">
          <input
            type="checkbox"
            checked={showHotspots}
            onChange={(e) => setShowHotspots(e.target.checked)}
            className="rounded border-gray-300 text-[#E63946] focus:ring-[#E63946]/25 h-4 w-4 accent-[#E63946]"
          />
          <span>{lang === 'en' ? 'NASA FIRMS' : 'Capa NASA'}</span>
        </label>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-12 left-4 z-[400] hidden sm:flex flex-col gap-3 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-[#EEF5E9] text-xs text-[#636E72] shadow-[0_2px_12px_rgba(0,0,0,0.07)] text-left pointer-events-auto">
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
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#EEF5E9] font-medium text-[10px] text-[#636E72] shadow-sm font-mono pointer-events-auto">
        {lang === 'en' ? 'NODE NETWORK: VALLE DEL CAUCA' : 'RED DE NODOS: VALLE DEL CAUCA'}
      </div>

      {/* Interfaz de Leaflet */}
      <div className="flex-1 min-h-[350px] relative bg-[#F8FAF5] z-0">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}></div>
      </div>

      {/* Footer Info */}
      <div className="bg-white px-5 py-3 flex items-center justify-between text-xs font-medium text-[#636E72] border-t border-[#EEF5E9] z-[400] relative">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-[#2D6A4F]" />
          <span>{lang === 'en' ? 'Live GPS Tracking: Active Nodes' : 'Rastreo GPS en vivo: Nodos Activos'}</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>{lang === 'en' ? 'BST ECOSYSTEM' : 'ECOSISTEMA B.S.T.'}</span>
        </div>
      </div>
    </div>
  );
}
