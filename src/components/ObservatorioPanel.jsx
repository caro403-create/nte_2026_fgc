import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Wind, Thermometer, Droplets, Flame, RefreshCw, Play, Pause, ChevronLeft, ChevronRight, Settings, Info, CloudRain, Search, X, ShieldAlert, Cpu, ThermometerSun, CloudFog, HelpCircle, Users, Cloud, MessageSquare, CheckCircle2 } from 'lucide-react';
import { translations } from '../utils/translations';
import WeatherDashboard from './WeatherDashboard';
import MeteorologicalTrends from './MeteorologicalTrends';

const CITIES_BAR_DATA = [
  { name: 'Bogotá', lat: 4.6097, lng: -74.0817, temp: 14, icon: '☁️' },
  { name: 'Medellín', lat: 6.2442, lng: -75.5812, temp: 24, icon: '⛅' },
  { name: 'Cali', lat: 3.4516, lng: -76.5320, temp: 28, icon: '☀️' },
  { name: 'Barranquilla', lat: 10.9685, lng: -74.7813, temp: 32, icon: '☀️' },
  { name: 'Cartagena', lat: 10.3997, lng: -75.5144, temp: 31, icon: '☀️' },
  { name: 'Bucaramanga', lat: 7.1193, lng: -73.1227, temp: 23, icon: '⛅' },
  { name: 'Pereira', lat: 4.8133, lng: -75.6961, temp: 22, icon: '🌧️' },
  { name: 'Santa Marta', lat: 11.2408, lng: -74.1990, temp: 33, icon: '☀️' },
  { name: 'Pasto', lat: 1.2136, lng: -77.2811, temp: 13, icon: '🌧️' },
  { name: 'Cúcuta', lat: 7.8939, lng: -72.5078, temp: 34, icon: '☀️' }
];

const CitiesBar = ({ onCityClick, currentCityName }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 flex items-center bg-[#1C1C1C]/90 p-3 rounded-xl border border-white/10 shadow-lg text-white">
      <div className="px-4 py-2 text-white/50 border-r border-white/10 mr-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider shrink-0">
        <MapPin className="w-4 h-4 text-amber-500"/> Capitales
      </div>
      
      <button onClick={() => scroll('left')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors shrink-0 mx-1">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div ref={scrollRef} className="flex overflow-x-hidden gap-3 items-center flex-1 scroll-smooth">
        {CITIES_BAR_DATA.map((city, idx) => {
          const isSelected = currentCityName && currentCityName.includes(city.name);
          return (
            <button 
              key={idx} 
              onClick={() => onCityClick(city.lat, city.lng, true)}
              className={`flex items-center gap-3 min-w-max px-4 py-2 rounded-lg border transition-all hover:bg-white/10 cursor-pointer
                ${isSelected ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-transparent border-transparent text-white/70'}`}
            >
              <span className="font-semibold text-sm">{city.name}</span>
              <span className="flex items-center gap-1.5 font-bold">
                {city.icon} {city.temp}°
              </span>
            </button>
          );
        })}
      </div>

      <button onClick={() => scroll('right')} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors shrink-0 mx-1">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default function ObservatorioPanel({ lang, globalScore, nodes, selectedNodeId, setSelectedNodeId, setActiveTab }) {
  const t = translations[lang || 'es'];

  // Map state
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  // Settings & Status
  const [useRealApi, setUseRealApi] = useState(true);
  const [firmsApiKey, setFirmsApiKey] = useState(() => import.meta.env.VITE_FIRMS_KEY || localStorage.getItem('nte_firms_key') || '');
  const [owmApiKey, setOwmApiKey] = useState(() => import.meta.env.VITE_OWM_KEY || localStorage.getItem('nte_owm_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(new Date().toTimeString().split(' ')[0]);
  const [isQuerying, setIsQuerying] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Selected telemetry (on map click or search)
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Help Modal
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Community Reports State
  const [isReportingMode, setIsReportingMode] = useState(false);
  const isReportingModeRef = useRef(false);
  useEffect(() => { isReportingModeRef.current = isReportingMode; }, [isReportingMode]);
  
  const [reportFormPos, setReportFormPos] = useState(null); // {lat, lng}
  const [reportCategory, setReportCategory] = useState('Incendio');
  const [reportComment, setReportComment] = useState('');
  const [communityReports, setCommunityReports] = useState(() => {
    try {
      const stored = localStorage.getItem('nte_community_reports');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    // Add custom style for OWM Temperature layer to simulate MSN Weather colors and fix the "inverted" feel
    const style = document.createElement('style');
    style.innerHTML = `
      .temp-layer-msn-style { filter: saturate(3) contrast(1.2); }
      .wind-layer-style { filter: hue-rotate(120deg) saturate(2) brightness(1.2); }
      .clouds-layer-style { filter: contrast(1.5) brightness(1.2); }
      .effis-layer-style { filter: saturate(2.5) contrast(1.2); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const deleteCommunityReport = (id) => {
    setCommunityReports(prev => prev.filter(r => r.id !== id));
    setSelectedPoint(null);
  };

  // Persist reports
  useEffect(() => {
    localStorage.setItem('nte_community_reports', JSON.stringify(communityReports));
    drawMarkers();
  }, [communityReports]);

  // Map layers references
  const layersRef = useRef({});
  const markersGroupRef = useRef(null);
  const rainViewerFrames = useRef([]);
  const [rainViewerIndex, setRainViewerIndex] = useState(0);
  const [isRainViewerPlaying, setIsRainViewerPlaying] = useState(false);
  const rainPlayInterval = useRef(null);

  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Layer Visibility & Opacity (Windy style)
  const [layersState, setLayersState] = useState({
    baseOsm: true,
    satGibs: false,
    rainRadar: true,
    hotspotsFirms: true,
    thermalGibs: false,
    owmTemp: false,
    effisBurned: false,
    owmWind: false,
    owmClouds: false,
    owmHumidity: false,
    owmPrecip: false,
  });

  const [opacities, setOpacities] = useState({
    satGibs: 0.8,
    rainRadar: 0.7,
    thermalGibs: 0.8,
    owmTemp: 1.0,
    effisBurned: 0.7,
    owmWind: 0.6,
    owmClouds: 0.6,
    owmHumidity: 0.6,
    owmPrecip: 0.8,
  });

  const toggleLayer = (layerName) => {
    setLayersState(prev => {
      if (isMultiSelectMode) {
        return { ...prev, [layerName]: !prev[layerName] };
      } else {
        const exclusiveLayers = ['rainRadar', 'thermalGibs', 'owmTemp', 'effisBurned', 'satGibs', 'owmWind', 'owmClouds', 'owmHumidity', 'owmPrecip'];
        const newState = { ...prev };
        exclusiveLayers.forEach(l => newState[l] = false);
        newState[layerName] = !prev[layerName]; // Toggle the clicked one
        return newState;
      }
    });
  };

  // Map coordinates for simulated IoT nodes close to Palmira / Farallones
  const nodeCoords = {
    1: { lat: 3.541, lng: -76.315 },
    2: { lat: 3.548, lng: -76.292 },
    3: { lat: 3.525, lng: -76.285 },
    4: { lat: 3.518, lng: -76.308 },
    5: { lat: 3.535, lng: -76.275 },
  };

  // City Markers and Hover State
  const [cityWeatherData, setCityWeatherData] = useState({});
  const cityMarkersRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(6);

  const COLOMBIA_CITIES = [
    { name: 'Bogotá', lat: 4.6097, lng: -74.0817, rank: 1 },
    { name: 'Medellín', lat: 6.2442, lng: -75.5812, rank: 1 },
    { name: 'Cali', lat: 3.4516, lng: -76.5320, rank: 1 },
    { name: 'Barranquilla', lat: 10.9685, lng: -74.7813, rank: 1 },
    { name: 'Cartagena', lat: 10.3997, lng: -75.5144, rank: 1 },
    { name: 'Bucaramanga', lat: 7.1193, lng: -73.1227, rank: 2 },
    { name: 'Pereira', lat: 4.8133, lng: -75.6961, rank: 2 },
    { name: 'Santa Marta', lat: 11.2408, lng: -74.1990, rank: 2 },
    { name: 'Pasto', lat: 1.2136, lng: -77.2811, rank: 2 },
    { name: 'Cúcuta', lat: 7.8939, lng: -72.5078, rank: 2 },
    { name: 'Villavicencio', lat: 4.1420, lng: -73.6266, rank: 2 },
    { name: 'Ibagué', lat: 4.4389, lng: -75.2322, rank: 2 },
    { name: 'Manizales', lat: 5.0689, lng: -75.5174, rank: 2 },
    { name: 'Neiva', lat: 2.9273, lng: -75.2819, rank: 3 },
    { name: 'Popayán', lat: 2.4382, lng: -76.6132, rank: 3 },
    { name: 'Armenia', lat: 4.5339, lng: -75.6811, rank: 3 },
    { name: 'Valledupar', lat: 10.4631, lng: -73.2532, rank: 3 },
    { name: 'Montería', lat: 8.7480, lng: -75.8814, rank: 3 },
    { name: 'Sincelejo', lat: 9.3047, lng: -75.3978, rank: 3 },
    { name: 'Riohacha', lat: 11.5444, lng: -72.9072, rank: 3 },
    { name: 'Quibdó', lat: 5.6947, lng: -76.6611, rank: 3 },
    { name: 'Florencia', lat: 1.6144, lng: -75.6062, rank: 3 },
    { name: 'Tunja', lat: 5.5353, lng: -73.3678, rank: 3 },
    { name: 'Yopal', lat: 5.3377, lng: -72.3959, rank: 3 },
    { name: 'Mocoa', lat: 1.1478, lng: -76.6475, rank: 3 },
    { name: 'Leticia', lat: -4.2153, lng: -69.9406, rank: 3 },
  ];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered in Colombia
    const map = L.map(mapContainerRef.current, {
      center: [4.5709, -74.2973], // Colombia center
      zoom: 6,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    // Base OSM Layer (Standard OSM for intense sea color)
    const baseOsm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 20
    }).addTo(map);
    layersRef.current.baseOsm = baseOsm;

    // Base Sat NASA GIBS (True Color MODIS Terra)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const satGibs = L.tileLayer(
      `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${yesterday}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      {
        attribution: 'NASA EOSDIS GIBS MODIS Terra True Color',
        opacity: opacities.satGibs,
        maxZoom: 18,
        maxNativeZoom: 9
      }
    );
    layersRef.current.satGibs = satGibs;

    // Thermal Anomalies NASA GIBS / FIRMS
    const firmsKey = import.meta.env.VITE_FIRMS_KEY || localStorage.getItem('nte_firms_key');
    const thermalGibs = firmsKey
      ? L.tileLayer.wms(`https://firms.modaps.eosdis.nasa.gov/mapserver/wms/fires/${firmsKey}/`, {
          layers: 'fires_modis_24,fires_viirs_24',
          format: 'image/png',
          transparent: true,
          attribution: 'NASA FIRMS',
          opacity: opacities.thermalGibs,
          maxZoom: 18
        })
      : L.tileLayer(
          `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Thermal_Anomalies_All/default/${yesterday}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
          {
            attribution: 'NASA EOSDIS GIBS Thermal Anomalies',
            opacity: opacities.thermalGibs,
            maxZoom: 18,
            maxNativeZoom: 9
          }
        );
    layersRef.current.thermalGibs = thermalGibs;

    // OpenWeatherMap Layers (Temp, Wind, Clouds)
    const owmKey = import.meta.env.VITE_OWM_KEY || localStorage.getItem('nte_owm_key');
    if (owmKey) {
      const owmTemp = L.tileLayer(
        `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${owmKey}`,
        {
          attribution: 'Map data &copy; OpenWeatherMap',
          opacity: opacities.owmTemp,
          maxZoom: 18,
          className: 'temp-layer-msn-style'
        }
      );
      layersRef.current.owmTemp = owmTemp;

      const owmWind = L.tileLayer(
        `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${owmKey}`,
        {
          attribution: 'Map data &copy; OpenWeatherMap',
          opacity: opacities.owmWind,
          maxZoom: 18,
          className: 'wind-layer-style'
        }
      );
      layersRef.current.owmWind = owmWind;

      const owmClouds = L.tileLayer(
        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${owmKey}`,
        {
          attribution: 'Map data &copy; OpenWeatherMap',
          opacity: opacities.owmClouds,
          maxZoom: 18,
          className: 'clouds-layer-style'
        }
      );
      layersRef.current.owmClouds = owmClouds;

      const owmPrecip = L.tileLayer(
        `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${owmKey}`,
        {
          attribution: 'Map data &copy; OpenWeatherMap',
          opacity: opacities.owmPrecip,
          maxZoom: 18,
          className: 'precip-layer-style'
        }
      );
      layersRef.current.owmPrecip = owmPrecip;
    }



    // Copernicus EFFIS Fire Danger Forecast (FWI)
    const effisBurned = L.tileLayer.wms('https://ies-ows.jrc.ec.europa.eu/effis', {
      layers: 'ecmwf.fwi.danger_index',
      format: 'image/png',
      transparent: true,
      attribution: 'Copernicus EFFIS FWI',
      opacity: opacities.effisBurned,
      className: 'effis-layer-style'
    });
    layersRef.current.effisBurned = effisBurned;

    // Group for dynamic markers
    markersGroupRef.current = L.layerGroup().addTo(map);
    cityMarkersRef.current = L.layerGroup().addTo(map);

    // Map hover handler for Tooltips (Debounced)
    map.on('mousemove', (e) => {
      const { lat, lng } = e.latlng;
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      
      // Clear tooltip if moving quickly
      setHoverData(null);

      hoverTimeoutRef.current = setTimeout(async () => {
        // Only fetch if a specific layer is active, or just fetch anyway
        // For performance, let's only fetch if OWM layers are active or if we're in hover mode.
        // Actually, the user requested it for the whole app.
        try {
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
          const data = await res.json();
          if (data && data.current) {
            const date = new Date(data.current.time);
            setHoverData({
              lat, lng,
              temp: data.current.temperature_2m,
              humidity: data.current.relative_humidity_2m,
              dateStr: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
              timeStr: date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' })
            });
          }
        } catch(err) {}
      }, 400); // 400ms debounce
    });

    // Zoom handler
    map.on('zoomend', () => {
      setMapZoom(map.getZoom());
    });

    // Map click handler
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (isReportingModeRef.current) {
        setReportFormPos({ lat, lng });
      } else {
        handleMapClick(lat, lng);
      }
    });

    // Fetch RainViewer Radar config
    fetchRainViewer();

    // Fix map size on first render due to dynamic flex containers
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize(true);
      }
    }, 800);

    return () => {
      if (rainPlayInterval.current) clearInterval(rainPlayInterval.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch RainViewer Radar frames
  const fetchRainViewer = async () => {
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!response.ok) throw new Error('Failed to load RainViewer config');
      const data = await response.json();
      
      if (data.radar && data.radar.past) {
        rainViewerFrames.current = data.radar.past;
        setRainViewerIndex(data.radar.past.length - 1);
        updateRainRadarLayer(data.radar.past.length - 1);
      }
    } catch (error) {
      console.error('Error fetching RainViewer:', error);
    }
  };

  // Update RainViewer layer
  const updateRainRadarLayer = (index) => {
    if (!mapRef.current || rainViewerFrames.current.length === 0) return;
    
    if (layersRef.current.rainRadar) {
      mapRef.current.removeLayer(layersRef.current.rainRadar);
    }

    if (!layersState.rainRadar) return;

    const frame = rainViewerFrames.current[index];
    if (!frame) return;

    const radarLayer = L.tileLayer(
      `https://tilecache.rainviewer.com/v2/radar/${frame.path}/256/{z}/{x}/{y}/4/1_1.png`,
      {
        attribution: 'RainViewer weather radar',
        opacity: opacities.rainRadar,
        zIndex: 100
      }
    );

    radarLayer.addTo(mapRef.current);
    layersRef.current.rainRadar = radarLayer;
  };

  // Handle Layer toggling
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (layersState.baseOsm) {
      if (!map.hasLayer(layersRef.current.baseOsm)) layersRef.current.baseOsm.addTo(map);
    } else {
      if (map.hasLayer(layersRef.current.baseOsm)) map.removeLayer(layersRef.current.baseOsm);
    }

    if (layersState.satGibs) {
      if (!map.hasLayer(layersRef.current.satGibs)) layersRef.current.satGibs.addTo(map);
    } else {
      if (layersRef.current.satGibs && map.hasLayer(layersRef.current.satGibs)) map.removeLayer(layersRef.current.satGibs);
    }

    if (layersState.thermalGibs) {
      if (!map.hasLayer(layersRef.current.thermalGibs)) layersRef.current.thermalGibs.addTo(map);
    } else {
      if (layersRef.current.thermalGibs && map.hasLayer(layersRef.current.thermalGibs)) map.removeLayer(layersRef.current.thermalGibs);
    }

    if (layersState.owmTemp) {
      if (layersRef.current.owmTemp && !map.hasLayer(layersRef.current.owmTemp)) layersRef.current.owmTemp.addTo(map);
    } else {
      if (layersRef.current.owmTemp && map.hasLayer(layersRef.current.owmTemp)) map.removeLayer(layersRef.current.owmTemp);
    }



    if (layersState.effisBurned) {
      if (layersRef.current.effisBurned && !map.hasLayer(layersRef.current.effisBurned)) layersRef.current.effisBurned.addTo(map);
    } else {
      if (layersRef.current.effisBurned && map.hasLayer(layersRef.current.effisBurned)) map.removeLayer(layersRef.current.effisBurned);
    }

    if (layersState.owmWind) {
      if (layersRef.current.owmWind && !map.hasLayer(layersRef.current.owmWind)) layersRef.current.owmWind.addTo(map);
    } else {
      if (layersRef.current.owmWind && map.hasLayer(layersRef.current.owmWind)) map.removeLayer(layersRef.current.owmWind);
    }

    if (layersState.owmClouds) {
      if (layersRef.current.owmClouds && !map.hasLayer(layersRef.current.owmClouds)) layersRef.current.owmClouds.addTo(map);
    } else {
      if (layersRef.current.owmClouds && map.hasLayer(layersRef.current.owmClouds)) map.removeLayer(layersRef.current.owmClouds);
    }

    if (layersState.owmPrecip) {
      if (layersRef.current.owmPrecip && !map.hasLayer(layersRef.current.owmPrecip)) layersRef.current.owmPrecip.addTo(map);
    } else {
      if (layersRef.current.owmPrecip && map.hasLayer(layersRef.current.owmPrecip)) map.removeLayer(layersRef.current.owmPrecip);
    }

    if (layersState.rainRadar) {
      updateRainRadarLayer(rainViewerIndex);
    } else {
      if (layersRef.current.rainRadar && map.hasLayer(layersRef.current.rainRadar)) map.removeLayer(layersRef.current.rainRadar);
    }

    drawMarkers();
  }, [layersState, rainViewerIndex]);

  // Adjust Opacity on Change
  useEffect(() => {
    if (layersRef.current.satGibs) layersRef.current.satGibs.setOpacity(opacities.satGibs);
  }, [opacities.satGibs]);

  useEffect(() => {
    if (layersRef.current.rainRadar) layersRef.current.rainRadar.setOpacity(opacities.rainRadar);
  }, [opacities.rainRadar]);

  useEffect(() => {
    if (layersRef.current.thermalGibs) layersRef.current.thermalGibs.setOpacity(opacities.thermalGibs);
  }, [opacities.thermalGibs]);

  useEffect(() => {
    if (layersRef.current.owmTemp) layersRef.current.owmTemp.setOpacity(opacities.owmTemp);
  }, [opacities.owmTemp]);



  useEffect(() => {
    if (layersRef.current.effisBurned) layersRef.current.effisBurned.setOpacity(opacities.effisBurned);
  }, [opacities.effisBurned]);

  useEffect(() => {
    if (layersRef.current.owmWind) layersRef.current.owmWind.setOpacity(opacities.owmWind);
  }, [opacities.owmWind]);

  useEffect(() => {
    if (layersRef.current.owmClouds) layersRef.current.owmClouds.setOpacity(opacities.owmClouds);
  }, [opacities.owmClouds]);

  useEffect(() => {
    if (layersRef.current.owmPrecip) layersRef.current.owmPrecip.setOpacity(opacities.owmPrecip);
  }, [opacities.owmPrecip]);

  // RainViewer Playing Effect
  useEffect(() => {
    if (isRainViewerPlaying) {
      rainPlayInterval.current = setInterval(() => {
        setRainViewerIndex((prev) => {
          if (prev >= rainViewerFrames.current.length - 1) return 0;
          return prev + 1;
        });
      }, 1500);
    } else {
      if (rainPlayInterval.current) clearInterval(rainPlayInterval.current);
    }
    return () => {
      if (rainPlayInterval.current) clearInterval(rainPlayInterval.current);
    };
  }, [isRainViewerPlaying]);

  // Draw Custom HTML Markers
  const drawMarkers = () => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    markersGroup.clearLayers();

    // Draw Community Reports
    communityReports.forEach((rep) => {
      if (Date.now() > rep.expiresAt) return; // Hide expired reports
      
      const iconMarkup = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #8B5CF6;
            border: 2.5px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
          ">
            <span style="font-size: 14px; line-height: 1; padding-bottom: 2px;">👤</span>
          </div>
          <div style="
            position: absolute;
            top: -20px;
            background-color: #8B5CF6;
            color: white;
            font-size: 8px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid white;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            font-family: sans-serif;
            pointer-events: none;
          ">
            ${rep.category}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconMarkup,
        className: 'custom-community-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([rep.lat, rep.lon], { icon: customIcon });
      
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedPoint({
          type: 'report',
          id: rep.id,
          name: 'Reporte Comunitario',
          lat: rep.lat,
          lng: rep.lon,
          category: rep.category,
          comment: rep.comment,
          confirms: rep.confirms,
          createdAt: rep.createdAt,
          isSimulated: true
        });
        map.setView([rep.lat, rep.lon], 13);
      });

      markersGroup.addLayer(marker);
    });

    // Selected Pin marker
    if (selectedPoint && selectedPoint.type === 'coordinate') {
      const pinMarkup = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="30" height="30" style="fill: #3B82F6; stroke: white; stroke-width: 1.5; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.35)); transform: translateY(-12px);">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
        </div>
      `;
      const pinIcon = L.divIcon({
        html: pinMarkup,
        className: 'custom-pin-marker',
        iconSize: [30, 30],
        iconAnchor: [14, 28]
      });

      const pinMarker = L.marker([selectedPoint.lat, selectedPoint.lng], { icon: pinIcon });
      markersGroup.addLayer(pinMarker);
    }
  };

  useEffect(() => {
    drawMarkers();
  }, [selectedNodeId, selectedPoint]);

  // Handle map click
  const handleMapClick = async (lat, lng, isDefault = false) => {
    if (isQuerying && !isDefault) return;
    setIsQuerying(true);
    const updatedTime = new Date().toTimeString().split(' ')[0];
    setLastUpdatedTime(updatedTime);

    let locationName = `Coordenada: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°W`;
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const geoResponse = await fetch(geoUrl);
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        if (geoData && geoData.address) {
          const addr = geoData.address;
          const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || addr.suburb;
          const state = addr.state || addr.region || addr.country;
          if (city) {
            locationName = `${city}${state ? `, ${state}` : ''}`;
          } else if (geoData.name) {
            locationName = geoData.name;
          }
        }
      }
    } catch(e) {
      console.warn('Geocoding failed');
    }

    if (!useRealApi) {
      setTimeout(() => {
        const distFromCenter = Math.sqrt(Math.pow(lat - 3.528, 2) + Math.pow(lng + 76.297, 2));
        const simulatedTemp = parseFloat((28.5 + (Math.random() * 4) - distFromCenter * 15).toFixed(1));
        const simulatedHum = Math.round(52 - (Math.random() * 10) + distFromCenter * 30);
        const simulatedWind = parseFloat((12.4 + Math.random() * 8).toFixed(1));
        const simulatedPm25 = Math.round(14 + Math.random() * 18);
        const simulatedCo = parseFloat((0.22 + Math.random() * 0.15).toFixed(2));
        
        setSelectedPoint({
          type: 'coordinate',
          lat: parseFloat(lat.toFixed(4)),
          lng: parseFloat(lng.toFixed(4)),
          name: locationName,
          temp: simulatedTemp,
          apparent_temp: parseFloat((simulatedTemp + 1.8).toFixed(1)),
          hum: simulatedHum,
          rain: Math.random() > 0.7 ? parseFloat((Math.random() * 5).toFixed(1)) : 0,
          windSpeed: simulatedWind,
          windDir: simulatedWind > 15 ? 'WSW' : 'ENE',
          pm2_5: simulatedPm25,
          pm10: Math.round(simulatedPm25 * 1.5),
          co: simulatedCo,
          ozone: Math.round(28 + Math.random() * 15),
          isSimulated: true
        });
        setIsQuerying(false);
      }, 500);
      return;
    }

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) throw new Error('Weather API error');
      const weatherData = await weatherResponse.json();

      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm2_5,pm10,carbon_monoxide,ozone`;
      const aqResponse = await fetch(aqUrl);
      if (!aqResponse.ok) throw new Error('Air Quality API error');
      const aqData = await aqResponse.json();

      const currentW = weatherData.current;
      const currentAQ = aqData.current;

      const getWindDirectionString = (degree) => {
        const sectors = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
        return sectors[Math.round(degree / 22.5) % 16];
      };

      setSelectedPoint({
        type: 'coordinate',
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        name: locationName,
        temp: currentW.temperature_2m,
        apparent_temp: currentW.apparent_temperature,
        hum: currentW.relative_humidity_2m,
        rain: currentW.precipitation,
        weatherCode: currentW.weather_code,
        pressure: currentW.surface_pressure,
        visibility: currentW.visibility,
        windSpeed: currentW.wind_speed_10m,
        windDir: getWindDirectionString(currentW.wind_direction_10m),
        windGusts: currentW.wind_gusts_10m,
        windDegree: currentW.wind_direction_10m,
        pm2_5: currentAQ.pm2_5,
        pm10: currentAQ.pm10,
        co: currentAQ.carbon_monoxide,
        ozone: currentAQ.ozone,
        daily: weatherData.daily,
        isSimulated: false
      });
    } catch (error) {
      console.error('Error fetching real APIs, falling back to simulation:', error);
      const simulatedTemp = parseFloat((26.5 + (Math.random() * 5)).toFixed(1));
      setSelectedPoint({
        type: 'coordinate',
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        name: locationName,
        temp: simulatedTemp,
        apparent_temp: parseFloat((simulatedTemp + 1.5).toFixed(1)),
        hum: Math.round(58 + Math.random() * 20),
        rain: 0,
        weatherCode: 2,
        pressure: 1012,
        visibility: 10000,
        windSpeed: 8.5,
        windDir: 'E',
        windGusts: 12,
        windDegree: 90,
        pm2_5: 18,
        pm10: 25,
        co: 0.18,
        ozone: 32,
        daily: {
          time: [...Array(6)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d.toISOString().split('T')[0]; }),
          weather_code: [2, 3, 1, 61, 0, 2],
          temperature_2m_max: [30, 28, 31, 25, 33, 29],
          temperature_2m_min: [20, 19, 21, 18, 22, 20],
          precipitation_probability_max: [10, 30, 5, 80, 0, 20],
          sunrise: [new Date(new Date().setHours(6, 0, 0, 0)).toISOString()],
          sunset: [new Date(new Date().setHours(18, 30, 0, 0)).toISOString()],
          uv_index_max: [8]
        },
        isSimulated: true,
        networkError: true
      });
    } finally {
      setIsQuerying(false);
    }
  };

  // Nominatim OSM Search API
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsQuerying(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': lang === 'es' ? 'es' : 'en' }
      });
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);

        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 12);
        }

        // Call the data fetching method
        await handleMapClick(latitude, longitude);
        
        // Overwrite the name with the search display name (cleaner)
        setSelectedPoint(prev => ({
          ...prev,
          name: display_name.split(',')[0] + (display_name.split(',')[1] ? ', ' + display_name.split(',')[1] : '')
        }));
      } else {
        alert(lang === 'es' ? 'No se encontró la ubicación.' : 'Location not found.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error de búsqueda de geocodificación.');
    } finally {
      setIsQuerying(false);
    }
  };

  // Default city on load
  useEffect(() => {
    // Select Cali by default on mount
    if (!selectedPoint) {
      handleMapClick(3.4516, -76.5320, true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveApiKey = () => {
    localStorage.setItem('nte_firms_key', firmsApiKey);
    localStorage.setItem('nte_owm_key', owmApiKey);
    setShowSettings(false);
    alert('Claves API guardadas exitosamente. (Recarga la página si añadiste OpenWeatherMap por primera vez)');
    drawMarkers();
  };

  // Color helper for AQI indices
  const getPm25ColorClass = (val) => {
    if (val <= 12) return 'bg-emerald-500';
    if (val <= 35.4) return 'bg-yellow-500';
    if (val <= 55.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCOColorClass = (val) => {
    if (val <= 4.4) return 'bg-emerald-500';
    if (val <= 9.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const submitCommunityReport = (e) => {
    e.preventDefault();
    if (!reportFormPos) return;

    const newReport = {
      id: Date.now().toString(),
      lat: reportFormPos.lat,
      lon: reportFormPos.lng,
      category: reportCategory,
      comment: reportComment,
      confirms: 0,
      createdAt: Date.now(),
      expiresAt: Date.now() + 6 * 3600000 // 6 horas
    };

    setCommunityReports(prev => [...prev, newReport]);
    setReportFormPos(null);
    setReportComment('');
    setIsReportingMode(false);
  };
  
  const confirmCommunityReport = (id) => {
    setCommunityReports(prev => prev.map(rep => rep.id === id ? { ...rep, confirms: rep.confirms + 1 } : rep));
    if (selectedPoint && selectedPoint.id === id) {
      setSelectedPoint(prev => ({ ...prev, confirms: prev.confirms + 1 }));
    }
  };

  return (
    <div className="flex-1 w-full h-[calc(100vh-140px)] relative rounded-3xl overflow-y-auto overflow-x-hidden border border-slate-200 shadow-sm bg-slate-50/50">
      
      {/* 1. Leaflet Fullscreen Container (Now limited height) */}
      <div className="relative w-full h-[60vh] min-h-[500px] shrink-0">
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0 z-0 bg-[#1E1E1E]" 
        />

      {/* 2. FLOATING TOP-RIGHT SEARCH BAR (Windy Style) */}
      <div className="absolute top-4 right-4 z-10 w-80 max-w-sm pointer-events-auto">
        <form onSubmit={handleLocationSearch} className="flex items-center bg-white/95 backdrop-blur-md px-3 py-2 rounded-full border border-slate-200 shadow-lg gap-2">
          <Search className="h-4 w-4 text-emerald-800 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar ciudad o lugar...' : 'Search city or place...'}
            className="flex-1 bg-transparent text-xs text-slate-800 outline-none border-none placeholder-slate-400 font-sans"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="bg-brand-darkgreen hover:bg-emerald-800 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full cursor-pointer transition-all duration-200"
          >
            {lang === 'es' ? 'Buscar' : 'Search'}
          </button>
        </form>
      </div>

      {/* 3. TOP HORIZONTAL TOOLBAR (MSN Weather Style) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex flex-col gap-2">
        <div className="bg-[#1C1C1C]/90 backdrop-blur-md rounded-xl p-1.5 flex items-center shadow-2xl border border-white/10 text-white/80">
          <button 
            onClick={() => toggleLayer('rainRadar')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.rainRadar ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Radar Lluvia (RainViewer)"
          >
            <CloudRain className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('thermalGibs')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.thermalGibs ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Focos Activos / Anomalías (NASA FIRMS / GIBS)"
          >
            <Flame className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('owmTemp')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.owmTemp ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Temperatura (OpenWeatherMap)"
          >
            <ThermometerSun className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('owmHumidity')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.owmHumidity ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Humedad (Open-Meteo / Interpolada)"
          >
            <Droplets className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('effisBurned')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.effisBurned ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Áreas Quemadas (Copernicus EFFIS)"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('satGibs')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.satGibs ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Satélite (NASA GIBS True Color)"
          >
            <Layers className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('owmWind')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.owmWind ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Viento (OpenWeatherMap)"
          >
            <Wind className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('owmClouds')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.owmClouds ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Nubosidad (OpenWeatherMap)"
          >
            <Cloud className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => toggleLayer('owmPrecip')}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${layersState.owmPrecip ? 'bg-amber-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Precipitación / Tormenta (OpenWeatherMap)"
          >
            <CloudRain className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-2"></div>
          <button 
            onClick={() => setIsMultiSelectMode(!isMultiSelectMode)}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${isMultiSelectMode ? 'bg-emerald-500 text-black' : 'hover:bg-white/10 hover:text-white'}`}
            title="Modo Selección Múltiple (Apilar Capas)"
          >
            <div className="relative">
              <Layers className="w-5 h-5" />
              {isMultiSelectMode && <div className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full"></div>}
            </div>
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => setIsReportingMode(!isReportingMode)}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${isReportingMode ? 'bg-purple-500 text-white animate-pulse' : 'hover:bg-white/10 hover:text-white'}`}
            title="Reportes de la comunidad"
          >
            <Users className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-lg transition-all flex items-center justify-center hover:bg-white/10 hover:text-white"
            title="Ayuda y Leyendas"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1"></div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${showSettings ? 'bg-white/20 text-white' : 'hover:bg-white/10 hover:text-white'}`}
            title="Configuración de Sistema"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Settings Drawer */}
        {showSettings && (
          <div className="bg-[#1C1C1C]/95 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl w-72 text-xs text-white/90 flex flex-col gap-3 font-sans">
            <h4 className="font-bold text-white flex items-center justify-between">
              <span>{lang === 'es' ? 'Ajustes del Sistema' : 'System Settings'}</span>
              <button onClick={() => setShowSettings(false)} className="text-white/50 hover:text-white font-bold">×</button>
            </h4>

            {/* Offline vs Online switch */}
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-white/60">{t.obsApiUsage}</span>
              <div className="flex bg-black/50 p-0.5 rounded-lg text-[10px]">
                <button
                  type="button"
                  onClick={() => setUseRealApi(true)}
                  className={`flex-1 py-1.5 rounded-md text-center font-bold transition-all cursor-pointer ${
                    useRealApi ? 'bg-amber-500 text-black shadow-xs' : 'text-white/50 hover:text-white'
                  }`}
                >
                  API Online
                </button>
                <button
                  type="button"
                  onClick={() => setUseRealApi(false)}
                  className={`flex-1 py-1.5 rounded-md text-center font-bold transition-all cursor-pointer ${
                    !useRealApi ? 'bg-amber-500 text-black shadow-xs' : 'text-white/50 hover:text-white'
                  }`}
                >
                  Mocks Offline
                </button>
              </div>
            </div>

          </div>
        )}

        {/* 3.1 LAYER LEGEND */}
        {layersState.rainRadar && (
          <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white shadow-xl text-xs w-60">
            <span className="font-bold text-[10px] opacity-80 mb-1 block">Lluvia (mm/h)</span>
            <div className="h-1.5 rounded-full w-full" style={{ background: 'linear-gradient(90deg,#a6cee3,#1f78b4,#6a3d9a)' }} />
            <div className="flex justify-between text-[8px] opacity-60 mt-1"><span>0.1</span><span>Llovizna</span><span>Tormenta</span></div>
          </div>
        )}
        {layersState.owmPrecip && (
          <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white shadow-xl text-xs w-60">
            <span className="font-bold text-[10px] opacity-80 mb-1 block">Precipitación / Tormenta (OWM)</span>
            <div className="h-1.5 rounded-full w-full" style={{ background: 'linear-gradient(90deg, #b2d8ff, #66b2ff, #0080ff, #0059b3, #003366, #ff00ff, #990099)' }} />
            <div className="flex justify-between text-[8px] opacity-60 mt-1"><span>Lluvia Ligera</span><span>Moderada</span><span>Tormenta Fuerte</span></div>
          </div>
        )}
        {layersState.thermalGibs && (
          <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white shadow-xl text-xs w-60">
            <span className="font-bold text-[10px] opacity-80 mb-1 block">Focos de Calor (NASA FIRMS)</span>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 bg-red-600 rounded-sm shadow-[0_0_5px_rgba(255,0,0,0.8)]"></div>
              <span className="text-[10px] font-bold">MODIS (Aqua & Terra) [1km]</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-red-400 rounded-sm shadow-[0_0_5px_rgba(255,100,100,0.8)]"></div>
              <span className="text-[10px] font-bold">VIIRS (NOAA-20/21) [375m]</span>
            </div>
          </div>
        )}
        {layersState.owmTemp && (
          <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white shadow-xl text-xs w-60">
            <span className="font-bold text-[10px] opacity-80 mb-1 block">Temperatura (°C)</span>
            <div className="h-1.5 rounded-full w-full" style={{ background: 'linear-gradient(90deg,#2b83ba,#abdda4,#ffffbf,#fdae61,#d7191c)' }} />
            <div className="flex justify-between text-[8px] opacity-60 mt-1"><span>-10°</span><span>15°</span><span>40°</span></div>
          </div>
        )}
        {layersState.effisBurned && (
          <div className="bg-[#1C1C1C]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-white shadow-xl text-xs w-60">
            <span className="font-bold text-[10px] opacity-80 mb-1 block">Riesgo de Incendio (FWI)</span>
            <div className="h-1.5 rounded-full w-full" style={{ background: 'linear-gradient(90deg,#008000,#ffff00,#ffa500,#ff0000,#800000)' }} />
            <div className="flex justify-between text-[8px] opacity-60 mt-1"><span>Bajo</span><span>Moderado</span><span>Extremo</span></div>
          </div>
        )}

      </div>

      {/* 4. FLOATING RIGHT DETAIL CARD (Dark MSN Style) */}
      {(() => {
        const displayPoint = selectedPoint ? { ...selectedPoint } : null;
        if (displayPoint && displayPoint.type === 'coordinate' && displayPoint.isSimulated && rainViewerFrames.current.length > 0) {
           const modifier = (rainViewerIndex - (rainViewerFrames.current.length / 2)) * 0.4;
           displayPoint.temp = parseFloat((displayPoint.temp + modifier).toFixed(1));
           displayPoint.hum = Math.max(0, Math.min(100, Math.round(displayPoint.hum - (modifier * 2))));
           displayPoint.windSpeed = parseFloat(Math.max(0, displayPoint.windSpeed + (modifier * 0.5)).toFixed(1));
        }
        
        return displayPoint && displayPoint.type !== 'coordinate' ? (
          <div className="absolute top-20 right-4 z-10 w-80 max-w-sm pointer-events-auto bg-[#1C1C1C]/95 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-4 font-sans max-h-[calc(100vh-280px)] overflow-y-auto text-white">
            
            {/* Card Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                  <h4 className="font-extrabold text-white text-xs tracking-wide uppercase line-clamp-1">
                    {displayPoint.name}
                  </h4>
                </div>
                <span className="text-[9px] text-white/50 font-mono mt-0.5 block">
                  Lat: {displayPoint.lat}°N · Lng: {displayPoint.lng}°W
                </span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-white/50 hover:text-white p-0.5 rounded-full hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* HOTSPOT DETAIL */}
            {displayPoint.type === 'hotspot' && (
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-1 text-red-500 font-bold">
                  <Flame className="h-4 w-4 animate-pulse" />
                  <span>PUNTO DE CALOR DETECTADO</span>
                </div>
                <p className="text-white/80 bg-red-950/40 border border-red-500/20 p-3 rounded-xl leading-relaxed text-[11px]">
                  {displayPoint.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mt-1 text-center">
                  <div className="bg-black/40 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] font-bold text-white/50 uppercase">Satélite</span>
                    <span className="block text-xs font-bold text-amber-400 mt-0.5">{displayPoint.sensorType}</span>
                  </div>
                  <div className="bg-black/40 p-2 rounded-lg border border-white/10">
                    <span className="text-[8px] font-bold text-white/50 uppercase">Temperatura</span>
                    <span className="block text-xs font-bold text-red-500 mt-0.5">{displayPoint.temp} K</span>
                  </div>
                </div>
              </div>
            )}

            {/* SENSOR DETAIL */}
            {displayPoint.type === 'sensor' && (
              <div>
                <h5 className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-amber-500" />
                  {t.obsSensorDetails}
                </h5>
                <div className="bg-amber-950/30 border border-amber-500/20 p-3 rounded-xl flex flex-col gap-2.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-white/60">Monóxido de Carbono:</span>
                    <span className="font-bold text-white">{displayPoint.co} ppm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Compuestos Orgánicos VOC:</span>
                    <span className="font-bold text-white">{displayPoint.voc} ppb</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Estrés Vegetativo (NDVI):</span>
                    <span className="font-bold text-emerald-400">{displayPoint.ndvi}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2">
                    <span className="text-white/60">Estado Diagnóstico:</span>
                    <span className={`font-extrabold uppercase ${
                      displayPoint.status === 'alarm' ? 'text-red-500 animate-pulse' : displayPoint.status === 'warning' ? 'text-amber-500' : 'text-emerald-400'
                    }`}>{displayPoint.status}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedNodeId(displayPoint.id);
                    setActiveTab('dashboard');
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-center text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors duration-200 mt-2"
                >
                  <span>{t.obsBackToDashboard}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* COMMUNITY REPORT DETAIL */}
            {displayPoint.type === 'report' && (
              <div>
                <h5 className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-purple-400" />
                  Detalles del Reporte
                </h5>
                <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl flex flex-col gap-3 text-xs">
                  <div>
                    <span className="text-white/50 text-[10px] block mb-1">Categoría:</span>
                    <span className="font-bold text-purple-400 text-sm bg-purple-500/10 px-2 py-1 rounded-md">{displayPoint.category}</span>
                  </div>
                  <div>
                    <span className="text-white/50 text-[10px] block mb-1">Comentario:</span>
                    <p className="text-white/90 italic leading-relaxed">"{displayPoint.comment}"</p>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-white/50">Confirmaciones:</span>
                      <span className="font-bold text-white text-lg">{displayPoint.confirms}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => deleteCommunityReport(displayPoint.id)}
                        className="bg-red-900/50 hover:bg-red-800/80 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors text-red-200"
                        title="Eliminar Reporte"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => confirmCommunityReport(displayPoint.id)}
                        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : null;
      })()}




      {/* HELP MODAL */}
      {showHelpModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1C1C1C] border border-white/10 rounded-2xl p-6 max-w-2xl w-full text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 p-1 rounded-lg">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle className="text-amber-500 w-6 h-6"/> Leyenda de Capas y Herramientas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className={`p-3 rounded-xl border ${layersState.rainRadar ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-blue-400"/> Radar de Lluvia</span>
                  {layersState.rainRadar && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </p>
                <p className="text-white/60 text-xs">Radar en tiempo real. Se actualiza cada 5 min (RainViewer).</p>
              </div>
              
              <div className={`p-3 rounded-xl border ${layersState.thermalGibs ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500"/> Focos / Anomalías Térmicas</span>
                  {layersState.thermalGibs && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </p>
                <p className="text-white/60 text-xs">Focos de incendio y calor extremo detectados por satélite (NASA FIRMS / GIBS).</p>
              </div>

              <div className={`p-3 rounded-xl border ${layersState.owmTemp ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><ThermometerSun className="w-4 h-4 text-amber-400"/> Temperatura</span>
                  {layersState.owmTemp && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </p>
                <p className="text-white/60 text-xs">Mapa de calor del aire en superficie (OpenWeatherMap).</p>
              </div>

              <div className={`p-3 rounded-xl border ${layersState.owmHumidity ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Droplets className="w-4 h-4 text-cyan-400"/> Humedad</span>
                  {layersState.owmHumidity && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                </p>
                <p className="text-white/60 text-xs">Niveles de humedad relativa en superficie.</p>
              </div>



              <div className={`p-3 rounded-xl border ${layersState.effisBurned ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-emerald-400"/> Áreas Quemadas (FWI)</span>
                  {layersState.effisBurned && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </p>
                <p className="text-white/60 text-xs">Índice de riesgo y áreas quemadas (Copernicus EFFIS / ECMWF).</p>
              </div>

              <div className={`p-3 rounded-xl border ${layersState.owmWind ? 'bg-teal-500/10 border-teal-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Wind className="w-4 h-4 text-teal-400"/> Viento</span>
                  {layersState.owmWind && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                </p>
                <p className="text-white/60 text-xs">Dirección y velocidad del viento (OpenWeatherMap).</p>
              </div>

              <div className={`p-3 rounded-xl border ${layersState.owmClouds ? 'bg-white/20 border-white/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Cloud className="w-4 h-4 text-white"/> Nubosidad</span>
                  {layersState.owmClouds && <CheckCircle2 className="w-4 h-4 text-white" />}
                </p>
                <p className="text-white/60 text-xs">Cobertura de nubes en tiempo real (OpenWeatherMap).</p>
              </div>

              <div className={`p-3 rounded-xl border ${layersState.satGibs ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-indigo-400"/> Satélite Color Real</span>
                  {layersState.satGibs && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </p>
                <p className="text-white/60 text-xs">Visión de cámara satelital real del terreno (NASA GIBS).</p>
              </div>

              <div className={`p-3 rounded-xl border ${isMultiSelectMode ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-transparent'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-emerald-400"/> Selección Múltiple</span>
                  {isMultiSelectMode && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </p>
                <p className="text-white/60 text-xs">Permite apilar y combinar múltiples capas al mismo tiempo.</p>
              </div>

              <div className={`p-3 rounded-xl border ${isReportingMode ? 'bg-purple-500/20 border-purple-500/60' : 'bg-white/5 border-purple-500/30'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400"/> Reportes de Comunidad</span>
                  {isReportingMode && <CheckCircle2 className="w-4 h-4 text-purple-400" />}
                </p>
                <p className="text-white/60 text-xs">Permite a los usuarios marcar incendios, humo, etc. en el mapa.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY REPORT FORM */}
      {reportFormPos && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-[2px]">
          <div className="bg-[#1C1C1C] border border-white/10 rounded-2xl p-5 w-80 shadow-2xl relative text-white">
            <button onClick={() => setReportFormPos(null)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-bold mb-1 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-400" /> Crear Reporte</h4>
            <p className="text-[10px] text-white/50 mb-4">Lat: {reportFormPos.lat.toFixed(4)}, Lng: {reportFormPos.lng.toFixed(4)}</p>
            
            <form onSubmit={submitCommunityReport} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] text-white/70 font-semibold mb-1 block">Categoría</label>
                <select 
                  value={reportCategory}
                  onChange={e => setReportCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500"
                >
                  <option value="Incendio">Incendio activo</option>
                  <option value="Humo">Humo intenso</option>
                  <option value="Calor extremo">Calor extremo</option>
                  <option value="Lluvia fuerte">Lluvia fuerte / Inundación</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-white/70 font-semibold mb-1 block">Comentario (máx 140 carácteres)</label>
                <textarea 
                  value={reportComment}
                  onChange={e => setReportComment(e.target.value)}
                  maxLength={140}
                  rows={3}
                  placeholder="Describe lo que ves..."
                  className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-xs text-white outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 rounded-lg mt-2 transition-colors">
                Publicar Reporte
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLOATING HOVER TOOLTIP */}
      {hoverData && mapRef.current && (
        <div 
          className="absolute z-[1000] bg-[#1C1C1C]/90 backdrop-blur-md text-white px-2 py-1.5 rounded-lg border border-white/10 shadow-2xl flex flex-col pointer-events-none transition-all duration-100"
          style={{
            left: mapRef.current.latLngToContainerPoint([hoverData.lat, hoverData.lng]).x + 15,
            top: mapRef.current.latLngToContainerPoint([hoverData.lat, hoverData.lng]).y + 15,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-500 text-sm">{hoverData.temp} °C</span>
            <span className="font-bold text-cyan-400 text-xs">💧 {hoverData.humidity}%</span>
          </div>
          <div className="text-white/50 text-[10px] font-semibold">{hoverData.dateStr}, {hoverData.timeStr}</div>
        </div>
      )}

      </div> {/* End of map relative wrapper */}

      {/* DASHBOARD COMPONENT */}
      <div className="p-4 md:p-6 lg:p-8">
        <CitiesBar onCityClick={handleMapClick} currentCityName={selectedPoint?.name} />
        {selectedPoint && selectedPoint.type === 'coordinate' && selectedPoint.daily && (
           <>
             <WeatherDashboard point={selectedPoint} />
             <MeteorologicalTrends />
           </>
        )}
      </div>

    </div>
  );
}
