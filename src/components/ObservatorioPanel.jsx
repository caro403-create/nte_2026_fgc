import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { 
  Layers, MapPin, Wind, Thermometer, Droplets, Flame, RefreshCw, Play, Pause, 
  ChevronLeft, ChevronRight, Settings, Info, CloudRain, Search, X, ShieldAlert, 
  Cpu, ThermometerSun, CloudFog, HelpCircle, Users, Cloud, MessageSquare, 
  CheckCircle2, Mountain, Trees, SunDim, Eye, EyeOff, ExternalLink, Pencil, 
  Trash2, ChevronDown, ChevronUp, Sliders
} from 'lucide-react';
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

const LAYER_METADATA = {
  geeBurned: {
    id: 'geeBurned',
    name: 'Áreas quemadas (MCD64A1)',
    category: 'GEE',
    icon: Flame,
    iconColor: 'text-red-400',
    resolution: '500m (MODIS / GEE)',
    source: 'NASA MODIS / Google Earth Engine',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: 'Enero (Quema antigua)',
    maxLabel: 'Diciembre (Quema reciente)',
    gradient: 'from-amber-500 via-red-600 to-black',
    description: '**¿Qué mide?** Muestra cicatrices de incendios ocurridos durante el último año.\n\n**¿Cómo se calcula?** Utiliza el producto MCD64A1 del satélite MODIS, que analiza cambios bruscos en la reflectancia de la superficie (índices de vegetación que caen repentinamente) combinados con anomalías térmicas. Los valores indican el "Día del Año" (1 a 365) en el que ocurrió el incendio.\n\n**¿Cómo se interpreta?** El mapa colorea de naranja a rojo oscuro las zonas quemadas. Puedes hacer clic en una zona quemada para ver el día exacto en que el algoritmo detectó que el área se quemó por primera vez en el año.'
  },
  geeAridity: {
    id: 'geeAridity',
    name: 'Índice de Aridez (PDSI)',
    category: 'GEE',
    icon: SunDim,
    iconColor: 'text-amber-400',
    resolution: '4.6 km (TerraClimate / GEE)',
    source: 'Universidad de Idaho / GEE',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: '-5.0 Seco severo',
    maxLabel: '+5.0 Húmedo',
    gradient: 'from-red-600 via-yellow-400 to-blue-600',
    description: '**¿Qué mide?** El Índice de Severidad de Sequía de Palmer (PDSI). Indica qué tan seca está una región en comparación con su clima histórico normal.\n\n**¿Cómo se calcula?** Es un modelo matemático complejo (TerraClimate) que hace un balance entre la precipitación (lluvia que entra) y la evapotranspiración (agua que se evapora por el calor). Toma parámetros históricos y actuales de temperatura y lluvia.\n\n**¿Cómo se interpreta?** Valores negativos (rojo/naranja) indican sequía meteorológica (falta de lluvia prolongada). Valores alrededor de 0 (verde) son condiciones normales. Valores positivos (azul) indican exceso de humedad. Las zonas rojas son altamente susceptibles a incendios.'
  },
  geeDrought: {
    id: 'geeDrought',
    name: 'Humedad del Suelo',
    category: 'GEE',
    icon: Thermometer,
    iconColor: 'text-orange-400',
    resolution: '4.6 km (TerraClimate / GEE)',
    source: 'Universidad de Idaho / GEE',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: '0 mm (Déficit crítico)',
    maxLabel: '1000 mm (Saturación)',
    gradient: 'from-red-500 via-yellow-400 to-emerald-500',
    description: '**¿Qué mide?** La cantidad total de agua almacenada en el perfil del suelo (la capa donde crecen las raíces).\n\n**¿Cómo se calcula?** Modelo TerraClimate que simula cómo el agua de lluvia se filtra y se retiene en la tierra, restando el agua que las plantas consumen. Se mide en milímetros (mm).\n\n**¿Cómo se interpreta?** Zonas en rojo intenso (cerca a 0 mm) tienen los suelos completamente secos. En estas condiciones, la vegetación baja (hojarasca, pastos) muere y se convierte en un combustible perfecto y altamente inflamable para los incendios forestales.'
  },
  geeErosion: {
    id: 'geeErosion',
    name: 'Riesgo de Erosión (Pendiente)',
    category: 'GEE',
    icon: Mountain,
    iconColor: 'text-stone-300',
    resolution: '30m (SRTM DEM / GEE)',
    source: 'NASA SRTM / Google Earth Engine',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: '0° Plano / Seguro',
    maxLabel: '45°+ Pendiente crítica',
    gradient: 'from-emerald-500 via-yellow-400 to-red-600',
    description: '**¿Qué mide?** La inclinación del terreno en grados. Ayuda a identificar zonas montañosas peligrosas.\n\n**¿Cómo se calcula?** Utiliza un Modelo de Elevación Digital (DEM) creado por la Misión Topográfica Radar del Transbordador Espacial de la NASA (SRTM). El algoritmo de GEE calcula el grado de inclinación entre cada píxel de 30 metros.\n\n**¿Cómo se interpreta?** Áreas en rojo (> 30°) son laderas empinadas. En un incendio, el fuego avanza mucho más rápido hacia arriba por laderas empinadas. Además, si llueve fuerte sobre una zona quemada y empinada, hay un riesgo altísimo de deslizamientos de tierra.'
  },
  geeTreeCover: {
    id: 'geeTreeCover',
    name: 'Cobertura Arbórea General',
    category: 'GEE',
    icon: Trees,
    iconColor: 'text-emerald-400',
    resolution: '30m (Hansen GFC / GEE)',
    source: 'UMD Hansen / GEE',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: '25% Cobertura dispersa',
    maxLabel: '100% Dosel denso',
    gradient: 'from-emerald-950 via-emerald-700 to-emerald-400',
    description: '**¿Qué mide?** Muestra TODAS las áreas del mundo que están cubiertas por árboles (bosques de todo tipo, manglares, plantaciones maderables).\n\n**¿Cómo se calcula?** El equipo de la Universidad de Maryland analizó miles de imágenes del satélite Landsat para calcular qué porcentaje de cada cuadro de 30x30m está tapado por las copas de los árboles (canopy).\n\n**¿Cómo se interpreta?** En este mapa **se ha aplicado un filtro matemático** para ocultar cualquier zona que tenga menos del 25% de árboles. Todo lo que ves en verde es considerado "Bosque" según los estándares forestales, sin importar el clima o la especie.'
  },
  geeTropicalDryForest: {
    id: 'geeTropicalDryForest',
    name: 'Bosque Seco Tropical',
    category: 'GEE',
    icon: Trees,
    iconColor: 'text-amber-600',
    resolution: '30m (Hansen + RESOLVE)',
    source: 'UMD Hansen & WWF / GEE',
    sourceUrl: 'https://earthengine.google.com/',
    minLabel: '25% Cobertura dispersa',
    maxLabel: '100% Dosel denso',
    gradient: 'from-amber-700 via-amber-600 to-yellow-600',
    description: '**¿Qué mide?** Exclusivamente las áreas de Bosque Seco Tropical, uno de los ecosistemas más amenazados del mundo por su alta susceptibilidad a incendios y deforestación.\n\n**¿Cómo se calcula?** Cruza dos bases de datos enormes: 1. Toma la cobertura de árboles general de Hansen (>25%). 2. Aplica una "máscara matemática" usando el mapa global de Ecorregiones de RESOLVE/WWF. Solo muestra los árboles si caen geográficamente dentro del Bioma 2 ("Bosques secos de hoja ancha tropicales y subtropicales").\n\n**¿Cómo se interpreta?** Los tonos tierra (naranja/oliva) representan la densidad de estos bosques secos. Al usar este mapa, eliminas el ruido de los bosques húmedos (como la Amazonía o el Chocó) y te enfocas únicamente en el bioma seco, que es el más vulnerable en temporadas de El Niño.'
  },
  thermalGibs: {
    id: 'thermalGibs',
    name: 'Focos Activos / Anomalías Térmicas',
    category: 'Satelital',
    icon: Flame,
    iconColor: 'text-orange-500',
    resolution: '375m - 1km (VIIRS/MODIS)',
    source: 'NASA FIRMS / GIBS',
    sourceUrl: 'https://firms.modaps.eosdis.nasa.gov/',
    minLabel: 'Anomalía leve',
    maxLabel: 'Incendio confirmado',
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    description: '**¿Qué mide?** Los puntos exactos en la superficie terrestre que están emitiendo un calor inusualmente alto en las últimas 24 horas.\n\n**¿Cómo se calcula?** Satélites que orbitan la tierra (MODIS y VIIRS) tienen sensores infrarrojos que miden la radiación térmica. Un algoritmo compara el calor de un píxel con el de sus vecinos. Si la diferencia es muy alta, genera una "Alerta de Fuego".\n\n**¿Cómo se interpreta?** Los círculos que ves en el mapa agrupan estas alertas. Un foco térmico no siempre es un incendio forestal masivo; puede ser una quema agrícola controlada o una llamarada industrial, pero en zonas de bosque es el indicador número uno de un incendio activo.'
  },
  rainRadar: {
    id: 'rainRadar',
    name: 'Radar de Lluvia en Tiempo Real',
    category: 'Clima',
    icon: CloudRain,
    iconColor: 'text-cyan-400',
    resolution: 'Regional (RainViewer Radar)',
    source: 'RainViewer Radar Network',
    sourceUrl: 'https://www.rainviewer.com/',
    gradient: 'from-cyan-400 via-blue-600 to-purple-600',
    description: '**¿Qué mide?** La ubicación e intensidad de las precipitaciones (lluvia, granizo) en tiempo real en la atmósfera baja.\n\n**¿Cómo se calcula?** Radares Doppler en tierra emiten pulsos de microondas al cielo. Las gotas de agua rebotan estas ondas de vuelta al radar. Entre mayor sea el eco que rebota, más fuerte es la lluvia.\n\n**¿Cómo se interpreta?** Tonos azules y cian indican lloviznas o lluvias suaves. Tonos morados y rojos indican tormentas muy pesadas. Es crucial para monitorear si una tormenta se dirige hacia un incendio activo para ayudar a apagarlo.'
  },
  satGibs: {
    id: 'satGibs',
    name: 'Satélite Color Real (MODIS)',
    category: 'Satelital',
    icon: Layers,
    iconColor: 'text-indigo-400',
    resolution: '250m (NASA GIBS)',
    source: 'NASA EOSDIS GIBS',
    sourceUrl: 'https://gibs.earthdata.nasa.gov/',
    gradient: 'from-blue-900 via-emerald-800 to-amber-700',
    description: '**¿Qué mide?** Una fotografía satelital a todo color de cómo se vio la Tierra el día de ayer, captada desde el espacio sin nubes superpuestas.\n\n**¿Cómo se calcula?** El satélite Terra de la NASA usa el sensor MODIS para captar la luz visible (los canales Rojo, Verde y Azul que ven nuestros ojos). NASA procesa la imagen para corregir el brillo atmosférico.\n\n**¿Cómo se interpreta?** Úsala como un mapa base realista. En días muy despejados, si hay un incendio forestal gigantesco, a veces es posible observar directamente el humo grisáceo o las enormes cicatrices negras dejadas por las quemas recientes.'
  },
  owmTemp: {
    id: 'owmTemp',
    name: 'Temperatura del Aire',
    category: 'Clima',
    icon: ThermometerSun,
    iconColor: 'text-amber-400',
    resolution: '10 km (OpenWeatherMap)',
    source: 'OpenWeatherMap',
    sourceUrl: 'https://openweathermap.org/',
    minLabel: '0°C Templado',
    maxLabel: '40°C+ Extremo',
    gradient: 'from-blue-500 via-yellow-400 to-red-600',
    description: '**¿Qué mide?** La temperatura pronosticada del aire a 2 metros de altura sobre el suelo.\n\n**¿Cómo se calcula?** OpenWeatherMap utiliza enormes supercomputadoras meteorológicas (modelos globales) que toman datos de estaciones meteorológicas terrestres y satélites, y los interpolan en una cuadrícula continua.\n\n**¿Cómo se interpreta?** Tonos amarillos y rojos indican altas temperaturas (ola de calor). Las altas temperaturas desecan rápidamente la vegetación (evapotranspiración), preparándola para que prenda fuego rápidamente ante cualquier chispa.'
  },
  owmWind: {
    id: 'owmWind',
    name: 'Viento en Superficie',
    category: 'Clima',
    icon: Wind,
    iconColor: 'text-teal-400',
    resolution: '10 km (OpenWeatherMap)',
    source: 'OpenWeatherMap',
    sourceUrl: 'https://openweathermap.org/',
    minLabel: '0 km/h Calma',
    maxLabel: '60+ km/h Ventarrón',
    gradient: 'from-teal-400 to-indigo-600',
    description: '**¿Qué mide?** La velocidad y dirección pronosticada de los vientos que soplan cerca de la superficie terrestre.\n\n**¿Cómo se calcula?** Modelos meteorológicos numéricos globales asimilan datos de la presión atmosférica para calcular el flujo de aire.\n\n**¿Cómo se interpreta?** El viento es el factor más letal durante un incendio forestal. Aporta oxígeno constante a las llamas e inclina el fuego hacia adelante, calentando la vegetación no quemada. Zonas con colores intensos indican ráfagas fuertes que podrían hacer un incendio incontrolable.'
  }
};

const renderBoldText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="text-white font-black">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const CitiesBar = ({ onCityClick, currentCityName, t }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-6 flex items-center bg-[#1C1C1C]/90 p-3 rounded-xl border border-white/10 shadow-lg text-white">
      <div className="px-4 py-2 border-r border-white/10 mr-2 flex items-center gap-2 font-bold text-xs text-amber-500 shrink-0">
        <MapPin className="w-4 h-4 text-amber-500"/> {t.obsCapitals || 'CAPITALES'}
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
  const tRef = useRef(t);
  const langRef = useRef(lang || 'es');
  useEffect(() => {
    tRef.current = t;
    langRef.current = lang || 'es';
  }, [t, lang]);

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

  // Side Drawer Restor Style
  const [isLayerDrawerOpen, setIsLayerDrawerOpen] = useState(true);
  const [layerSearchQuery, setLayerSearchQuery] = useState('');
  const [expandedMetadataLayers, setExpandedMetadataLayers] = useState({ geeBurned: true });
  const fireClusterGroupRef = useRef(null);
  const fireHotspotsLoadedRef = useRef(false);

  // Area Delimitation (Polygon Tool)
  const [isDrawingArea, setIsDrawingArea] = useState(false);
  const isDrawingAreaRef = useRef(false);
  useEffect(() => { isDrawingAreaRef.current = isDrawingArea; }, [isDrawingArea]);

  const [drawnPolygonPoints, setDrawnPolygonPoints] = useState([]);
  const drawnPolygonRef = useRef(null);
  const [areaStats, setAreaStats] = useState(null);

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
    baseLabels: true,
    rainRadar: false,
    thermalGibs: false, // FIRMS active fires
    satGibs: false, // True color
    owmTemp: false,
    owmWind: false,
    owmClouds: false,
    owmHumidity: false,
    owmPrecip: false,
    effisBurned: false,
    geeBurned: false,
    geeAridity: false,
    geeDrought: false,
    geeErosion: false,
    geeTreeCover: false,
    geeTropicalDryForest: false,
  });
  
  const layersStateRef = useRef(layersState);
  useEffect(() => {
    layersStateRef.current = layersState;
  }, [layersState]);

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
    geeBurned: 0.7,
    geeAridity: 0.7,
    geeDrought: 0.7,
    geeErosion: 0.7,
    geeTreeCover: 0.7,
    geeTropicalDryForest: 0.7,
  });

  const toggleLayer = (layerName) => {
    setLayersState(prev => {
      const isTurningOn = !prev[layerName];
      if (isTurningOn) {
        setExpandedMetadataLayers(exp => ({ ...exp, [layerName]: true }));
      }
      
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
  const hoverTimeoutRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [mapZoom, setMapZoom] = useState(6);

  const loadGeeLayer = async (layerName, type) => {
    try {
      console.log(`[GEE] Loading layer: ${layerName} (type: ${type})...`);
      const response = await fetch(`http://localhost:3001/api/gee/layer/${type}`);
      if (!response.ok) {
        console.error(`[GEE] Server returned ${response.status} for ${type}`);
        return;
      }
      const data = await response.json();
      if (data.url) {
        console.log(`[GEE] Got tile URL for ${layerName}:`, data.url.substring(0, 80) + '...');
        const tileLayer = L.tileLayer(data.url, {
          attribution: 'Google Earth Engine',
          opacity: opacities[layerName] || 0.7,
          maxZoom: 18,
          tileSize: 256,
        });
        
        tileLayer.on('tileerror', (err) => {
          console.warn(`[GEE] Tile load error for ${layerName}:`, err);
        });
        tileLayer.on('load', () => {
          console.log(`[GEE] All tiles loaded for ${layerName}`);
        });
        
        // Clear previous layers in the group and add new ones
        layersRef.current[layerName].clearLayers();
        tileLayer.addTo(layersRef.current[layerName]);
        console.log(`[GEE] Layer ${layerName} added to map successfully`);
      } else {
        console.error(`[GEE] No URL returned for ${layerName}`);
      }
    } catch (error) {
      console.error(`[GEE] Error loading layer ${layerName}:`, error);
    }
  };

  // Load NASA FIRMS fire hotspots with dynamic clustering
  const loadFireHotspots = async () => {
    const map = mapRef.current;
    if (!map || fireHotspotsLoadedRef.current) return;
    fireHotspotsLoadedRef.current = true;
    const currentLangT = translations[lang || 'es'];

    try {
      console.log('[FIRMS] Loading fire hotspots...');
      const response = await fetch('http://localhost:3001/api/firms/hotspots');
      if (!response.ok) { fireHotspotsLoadedRef.current = false; return; }
      const data = await response.json();
      if (!data.hotspots || data.hotspots.length === 0) { fireHotspotsLoadedRef.current = false; return; }

      console.log(`[FIRMS] Received ${data.hotspots.length} hotspots, creating cluster group...`);

      // Remove old cluster group if exists
      if (fireClusterGroupRef.current && map.hasLayer(fireClusterGroupRef.current)) {
        map.removeLayer(fireClusterGroupRef.current);
      }

      // Fix for leaflet.markercluster in Vite/ESM
      if (!window.L) window.L = L;
      await import('leaflet.markercluster');

      // Create markerClusterGroup with custom Restor-style icons
      const clusterGroup = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 14,
        iconCreateFunction: function(cluster) {
          const count = cluster.getChildCount();
          let displayCount = count >= 1000 ? `${(count/1000).toFixed(1)}k` : `${count}`;
          let size = count > 500 ? 50 : count > 100 ? 42 : count > 20 ? 36 : 30;
          let borderColor = count > 500 ? '#dc2626' : count > 100 ? '#f97316' : count > 20 ? '#f59e0b' : '#eab308';

          return L.divIcon({
            html: `<div style="
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 5px;
              width: ${size}px;
              height: ${size}px;
              background: rgba(10, 10, 10, 0.88);
              backdrop-filter: blur(10px);
              border: 2px solid ${borderColor};
              color: white;
              border-radius: 50%;
              box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 15px ${borderColor}40;
              font-family: system-ui, -apple-system, sans-serif;
              font-weight: 800;
              font-size: ${size > 42 ? 13 : 11}px;
              letter-spacing: 0.3px;
              cursor: pointer;
            ">
              <span>${displayCount}</span>
            </div>`,
            className: 'fire-cluster-icon',
            iconSize: L.point(size, size),
            iconAnchor: L.point(size/2, size/2)
          });
        }
      });

      // Add individual fire point markers
      data.hotspots.forEach(pt => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 4,
          fillColor: pt.confidence >= 80 ? '#ef4444' : pt.confidence >= 50 ? '#f97316' : '#eab308',
          fillOpacity: 0.9,
          color: '#fff',
          weight: 1,
          opacity: 0.8
        });
        marker.bindPopup(`
          <div style="font-family: system-ui; font-size: 13px; min-width: 220px; color: #111;">
            <div style="font-weight: 800; font-size: 14px; margin-bottom: 8px; color: #dc2626; border-bottom: 1px solid #eee; padding-bottom: 4px;">
              ${currentLangT.obsFirmsPopupTitle}
            </div>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #444; line-height: 1.4;">
              ${currentLangT.obsFirmsPopupDesc}
            </p>
            <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 8px; font-size: 12px;">
              <span style="color: #666;">${currentLangT.obsFirmsConfianza}</span>
              <span style="font-weight: 600; color: ${pt.confidence >= 80 ? '#dc2626' : pt.confidence >= 50 ? '#d97706' : '#16a34a'}">
                ${pt.confidence}% ${pt.confidence >= 80 ? currentLangT.obsFirmsAlta : pt.confidence >= 50 ? currentLangT.obsFirmsMedia : currentLangT.obsFirmsBaja}
              </span>
              
              <span style="color: #666;">${currentLangT.obsFirmsIntensidad}</span>
              <span style="font-weight: 600;">${pt.frp.toFixed(1)} MW</span>
              
              <span style="color: #666;">${currentLangT.obsFirmsDetectado}</span>
              <span style="font-weight: 600;">${pt.date} ${pt.time}</span>
            </div>
            <div style="margin-top: 8px; font-size: 10px; color: #888; text-align: right;">
              ${currentLangT.obsFirmsFuente}
            </div>
          </div>
        `);
        clusterGroup.addLayer(marker);
      });

      fireClusterGroupRef.current = clusterGroup;
      clusterGroup.addTo(map);
      console.log(`[FIRMS] Cluster group added with ${data.hotspots.length} points`);
    } catch (error) {
      console.error('[FIRMS] Error loading hotspots:', error);
      fireHotspotsLoadedRef.current = false;
    }
  };

  // Remove fire cluster group from map
  const removeFireHotspots = () => {
    const map = mapRef.current;
    if (map && fireClusterGroupRef.current && map.hasLayer(fireClusterGroupRef.current)) {
      map.removeLayer(fireClusterGroupRef.current);
    }
  };

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
    if (mapRef.current) return; // Prevent double initialization in StrictMode

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

    // Interpretation Helper
    const getLayerInterpretation = (layerType, val) => {
      let color = '#6b7280';
      let text = tRef.current.popupUnknown || 'Desconocido';
      let desc = '';

      if (layerType === 'geeAridity') {
        if (val < -400) { color = '#dc2626'; text = tRef.current.popupAridityExtreme; desc = tRef.current.popupAridityExtremeDesc; }
        else if (val < -200) { color = '#ea580c'; text = tRef.current.popupAriditySevere; desc = tRef.current.popupAriditySevereDesc; }
        else if (val < -100) { color = '#f59e0b'; text = tRef.current.popupAridityModerate; desc = tRef.current.popupAridityModerateDesc; }
        else if (val < 100) { color = '#10b981'; text = tRef.current.popupAridityNormal; desc = tRef.current.popupAridityNormalDesc; }
        else { color = '#3b82f6'; text = tRef.current.popupAridityWet; desc = tRef.current.popupAridityWetDesc; }
      } 
      else if (layerType === 'geeDrought') {
        if (val < 100) { color = '#990000'; text = tRef.current.popupDroughtArid; desc = tRef.current.popupDroughtAridDesc; }
        else if (val < 300) { color = '#ef4444'; text = tRef.current.popupDroughtVeryDry; desc = tRef.current.popupDroughtVeryDryDesc; }
        else if (val < 500) { color = '#f97316'; text = tRef.current.popupDroughtDry; desc = tRef.current.popupDroughtDryDesc; }
        else { color = '#10b981'; text = tRef.current.popupDroughtWet; desc = tRef.current.popupDroughtWetDesc; }
      }
      else if (layerType === 'geeErosion') {
        if (val > 30) { color = '#dc2626'; text = tRef.current.popupErosionCritical; desc = (tRef.current.popupErosionCriticalDesc || '').replace('{val}', Math.round(val)); }
        else if (val > 15) { color = '#ea580c'; text = tRef.current.popupErosionModerate; desc = (tRef.current.popupErosionModerateDesc || '').replace('{val}', Math.round(val)); }
        else { color = '#10b981'; text = tRef.current.popupErosionFlat; desc = (tRef.current.popupErosionFlatDesc || '').replace('{val}', Math.round(val)); }
      }
      else if (layerType === 'geeTreeCover' || layerType === 'geeTropicalDryForest') {
        if (val > 70) { color = '#064e3b'; text = tRef.current.popupForestDense; desc = tRef.current.popupForestDenseDesc; }
        else if (val > 25) { color = '#059669'; text = tRef.current.popupForestSparse; desc = tRef.current.popupForestSparseDesc; }
        else { color = '#9ca3af'; text = tRef.current.popupForestNone; desc = tRef.current.popupForestNoneDesc; }
      }
      else if (layerType === 'geeBurned') {
        const d = new Date(2023, 0, Math.round(val));
        const dateStr = d.toLocaleDateString(langRef.current === 'en' ? 'en-US' : 'es-ES', { month: 'long', day: 'numeric', year: 'numeric' });
        color = '#dc2626'; text = tRef.current.popupBurnedScar; 
        desc = (tRef.current.popupBurnedScarDesc || '').replace('{date}', dateStr).replace('{val}', Math.round(val));
      }

      return `
        <div style="margin-top: 6px; text-align: left;">
          <span style="display: inline-block; padding: 3px 6px; background-color: ${color}; color: white; border-radius: 6px; font-size: 10px; font-weight: 900; letter-spacing: 0.5px;">
            ${text}
          </span>
          <div style="font-size: 10px; color: #6b7280; margin-top: 6px; line-height: 1.3; font-weight: 500;">
            ${desc}
          </div>
        </div>
      `;
    };

    // Map Click for Point Inspection (GEE)
    map.on('click', async (e) => {
      // Do not trigger if drawing
      if (isDrawingAreaRef.current) return;
      
      const { lat, lng } = e.latlng;
      const currentLayers = layersStateRef.current;
      
      // Find the first active GEE layer
      const geeLayers = ['geeBurned', 'geeAridity', 'geeDrought', 'geeErosion', 'geeTreeCover', 'geeTropicalDryForest'];
      const activeGeeLayer = geeLayers.find(l => currentLayers[l]);
      
      if (activeGeeLayer) {
        const popup = L.popup({ closeButton: true, autoPanPadding: [50, 50] })
          .setLatLng(e.latlng)
          .setContent(`<div class="p-2 text-xs font-sans text-center min-w-[120px]"><div class="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-2"></div><span class="text-gray-600">${tRef.current.popupConsulting || 'Consultando...'}</span></div>`)
          .openOn(map);
          
        try {
          const res = await fetch(`http://localhost:3001/api/gee/point?lat=${lat}&lng=${lng}&layerType=${activeGeeLayer}`);
          const data = await res.json();
          
          if (data.value !== null && data.value !== undefined) {
             const layerMeta = LAYER_METADATA[activeGeeLayer];
             const displayValue = Number(data.value).toFixed(2);
             const interpretationHtml = getLayerInterpretation(activeGeeLayer, Number(data.value));
             
             let unit = '';
             if (activeGeeLayer === 'geeTreeCover' || activeGeeLayer === 'geeTropicalDryForest') unit = '<span class="text-xs text-gray-500 font-bold ml-1">%</span>';
             else if (activeGeeLayer === 'geeErosion') unit = '<span class="text-xs text-gray-500 font-bold ml-1">°</span>';
             else if (activeGeeLayer === 'geeDrought') unit = '<span class="text-xs text-gray-500 font-bold ml-1">mm</span>';
             else if (activeGeeLayer === 'geeBurned') unit = '<span class="text-xs text-gray-500 font-bold ml-1">DOY</span>';

             popup.setContent(`
               <div class="p-2.5 font-sans min-w-[170px]">
                 <div class="text-[9px] uppercase tracking-wider font-extrabold text-amber-500 mb-1 leading-tight">${tRef.current['obs' + activeGeeLayer.charAt(0).toUpperCase() + activeGeeLayer.slice(1) + 'Name'] || layerMeta.name}</div>
                 <div class="flex items-baseline">
                   <span class="text-xl font-black text-[#1C1C1C]">${displayValue}</span>${unit}
                 </div>
                 ${interpretationHtml}
                 <div class="text-[9px] font-mono text-gray-400 mt-2 pt-2 border-t border-gray-100">
                   Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}
                 </div>
               </div>
             `);
          } else {
             let noDataText = tRef.current.popupNoDataGeneric || 'Sin datos en esta coordenada';
             if (activeGeeLayer === 'geeBurned') noDataText = tRef.current.popupNoDataBurned;
             else if (activeGeeLayer === 'geeTreeCover' || activeGeeLayer === 'geeTropicalDryForest') noDataText = tRef.current.popupNoDataForest;
             
             popup.setContent(`<div class="p-2.5 text-xs font-sans font-medium text-center text-gray-500 max-w-[200px] leading-snug">${noDataText}</div>`);
          }
        } catch (error) {
          popup.setContent(`<div class="p-2.5 text-xs font-sans font-bold text-center text-red-500">${tRef.current.popupConnectionError || 'Error de conexión'}</div>`);
        }
      }
    });

    // Base Satellite Layer (Esri World Imagery)
    const baseSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye',
      maxZoom: 19
    }).addTo(map);
    layersRef.current.baseOsm = baseSatellite;

    // Boundaries & Place Labels overlay
    const baseLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.95
    }).addTo(map);
    layersRef.current.baseLabels = baseLabels;

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

      const owmHumidity = L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${owmKey}`);
      layersRef.current.owmHumidity = owmHumidity;

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

    // Mock GEE layers until backend auth is set up
    layersRef.current.geeBurned = L.layerGroup();
    layersRef.current.geeAridity = L.layerGroup();
    layersRef.current.geeDrought = L.layerGroup();
    layersRef.current.geeErosion = L.layerGroup();
    layersRef.current.geeTreeCover = L.layerGroup();
    layersRef.current.geeTropicalDryForest = L.layerGroup();

    // Copernicus EFFIS Fire Danger Forecast (FWI)
    // The WMS requires a `time` parameter — without it, defaults to 2019-01-01 (empty tiles).
    const today = new Date();
    const effisDate = today.toISOString().split('T')[0]; // e.g. '2026-07-18'
    const effisBurned = L.tileLayer.wms('https://ies-ows.jrc.ec.europa.eu/effis', {
      layers: 'ecmwf007.danger_index',
      format: 'image/png',
      transparent: true,
      version: '1.1.1',
      srs: 'EPSG:4326',
      time: effisDate,
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
      if (isDrawingAreaRef.current) {
        setDrawnPolygonPoints(prev => [...prev, { lat, lng }]);
      } else if (isReportingModeRef.current) {
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

    if (layersState.geeBurned) {
      if (layersRef.current.geeBurned && !map.hasLayer(layersRef.current.geeBurned)) {
        layersRef.current.geeBurned.addTo(map);
        if (layersRef.current.geeBurned.getLayers().length === 0) loadGeeLayer('geeBurned', 'burned');
        loadFireHotspots(); // Load dynamic FIRMS fire clusters
      }
    } else {
      if (layersRef.current.geeBurned && map.hasLayer(layersRef.current.geeBurned)) map.removeLayer(layersRef.current.geeBurned);
      removeFireHotspots();
    }
    
    if (layersState.geeAridity) {
      if (layersRef.current.geeAridity && !map.hasLayer(layersRef.current.geeAridity)) {
        layersRef.current.geeAridity.addTo(map);
        if (layersRef.current.geeAridity.getLayers().length === 0) loadGeeLayer('geeAridity', 'aridity');
      }
    } else {
      if (layersRef.current.geeAridity && map.hasLayer(layersRef.current.geeAridity)) map.removeLayer(layersRef.current.geeAridity);
    }
    
    if (layersState.geeDrought) {
      if (layersRef.current.geeDrought && !map.hasLayer(layersRef.current.geeDrought)) {
        layersRef.current.geeDrought.addTo(map);
        if (layersRef.current.geeDrought.getLayers().length === 0) loadGeeLayer('geeDrought', 'drought');
      }
    } else {
      if (layersRef.current.geeDrought && map.hasLayer(layersRef.current.geeDrought)) map.removeLayer(layersRef.current.geeDrought);
    }
    
    if (layersState.geeErosion) {
      if (layersRef.current.geeErosion && !map.hasLayer(layersRef.current.geeErosion)) {
        layersRef.current.geeErosion.addTo(map);
        if (layersRef.current.geeErosion.getLayers().length === 0) loadGeeLayer('geeErosion', 'erosion');
      }
    } else {
      if (layersRef.current.geeErosion && map.hasLayer(layersRef.current.geeErosion)) map.removeLayer(layersRef.current.geeErosion);
    }

    if (layersState.geeTreeCover) {
      if (layersRef.current.geeTreeCover && !map.hasLayer(layersRef.current.geeTreeCover)) {
        layersRef.current.geeTreeCover.addTo(map);
        if (layersRef.current.geeTreeCover.getLayers().length === 0) loadGeeLayer('geeTreeCover', 'treeCover');
      }
    } else {
      if (layersRef.current.geeTreeCover && map.hasLayer(layersRef.current.geeTreeCover)) map.removeLayer(layersRef.current.geeTreeCover);
    }

    if (layersState.geeTropicalDryForest) {
      if (layersRef.current.geeTropicalDryForest && !map.hasLayer(layersRef.current.geeTropicalDryForest)) {
        layersRef.current.geeTropicalDryForest.addTo(map);
        if (layersRef.current.geeTropicalDryForest.getLayers().length === 0) loadGeeLayer('geeTropicalDryForest', 'tropicalDryForest');
      }
    } else {
      if (layersRef.current.geeTropicalDryForest && map.hasLayer(layersRef.current.geeTropicalDryForest)) map.removeLayer(layersRef.current.geeTropicalDryForest);
    }

    drawMarkers();
  }, [layersState, rainViewerIndex]);

  // Handle Language changes for Hotspots
  useEffect(() => {
    if (layersState.geeBurned && fireHotspotsLoadedRef.current) {
      fireHotspotsLoadedRef.current = false;
      loadFireHotspots();
    }
  }, [lang]);

  // Unified Opacity adjustment
  useEffect(() => {
    Object.keys(opacities).forEach(layerKey => {
      const layerGroup = layersRef.current[layerKey];
      if (layerGroup) {
        if (typeof layerGroup.setOpacity === 'function') {
          layerGroup.setOpacity(opacities[layerKey]);
        } else if (typeof layerGroup.eachLayer === 'function') {
          layerGroup.eachLayer(l => {
            if (typeof l.setOpacity === 'function') l.setOpacity(opacities[layerKey]);
          });
        }
      }
    });
  }, [opacities]);

  // Area Delimitation Polygon render effect
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (drawnPolygonRef.current) {
      map.removeLayer(drawnPolygonRef.current);
      drawnPolygonRef.current = null;
    }

    if (drawnPolygonPoints.length > 0) {
      const latlngs = drawnPolygonPoints.map(p => [p.lat, p.lng]);
      if (drawnPolygonPoints.length === 1) {
        drawnPolygonRef.current = L.circleMarker(latlngs[0], { radius: 6, color: '#f59e0b', fillColor: '#fbbf24', fillOpacity: 0.9 }).addTo(map);
        setAreaStats(null);
      } else if (drawnPolygonPoints.length === 2) {
        drawnPolygonRef.current = L.polyline(latlngs, { color: '#f59e0b', weight: 3, dashArray: '6,6' }).addTo(map);
        setAreaStats(null);
      } else {
        drawnPolygonRef.current = L.polygon(latlngs, { color: '#f59e0b', weight: 3, fillColor: '#f59e0b', fillOpacity: 0.3 }).addTo(map);
        
        // Approximate area calculation in m² and hectares
        let areaM2 = 0;
        const R = 6378137;
        for (let i = 0; i < latlngs.length; i++) {
          const p1 = latlngs[i];
          const p2 = latlngs[(i + 1) % latlngs.length];
          areaM2 += (p2[1] * Math.PI / 180 - p1[1] * Math.PI / 180) *
                    (2 + Math.sin(p1[0] * Math.PI / 180) + Math.sin(p2[0] * Math.PI / 180));
        }
        areaM2 = Math.abs(areaM2 * R * R / 2);
        const hectares = Math.round(areaM2 / 10000);
        const km2 = (areaM2 / 1000000).toFixed(2);

        setAreaStats({ hectares, km2, pointsCount: drawnPolygonPoints.length });
      }
    } else {
      setAreaStats(null);
    }
  }, [drawnPolygonPoints]);

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
  }, [selectedNodeId, selectedPoint, communityReports]);

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

      {/* 2. FLOATING TOP-RIGHT SEARCH BAR */}
      <div className="absolute top-4 right-4 z-20 w-80 max-w-sm pointer-events-auto">
        <form onSubmit={handleLocationSearch} className="flex items-center bg-[#10171D]/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 shadow-2xl gap-2">
          <Search className="h-4 w-4 text-amber-500 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar municipio o lugar...' : 'Search city or place...'}
            className="flex-1 bg-transparent text-xs text-white outline-none border-none placeholder-white/40 font-sans"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')} className="text-white/40 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200"
          >
            {lang === 'es' ? 'Buscar' : 'Search'}
          </button>
        </form>
      </div>

      {/* 3. TOP CONTROL BAR (Restor / Modern Map Style) */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsLayerDrawerOpen(!isLayerDrawerOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl border transition-all duration-200 cursor-pointer ${
            isLayerDrawerOpen 
              ? 'bg-amber-500 text-black border-amber-400' 
              : 'bg-[#10171D]/90 hover:bg-[#1A232C] text-white border-white/10'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.obsDataLayer || 'Capa de datos'}</span>
          <span className="bg-black/30 px-1.5 py-0.5 rounded-full text-[10px] ml-0.5 font-mono">
            {Object.values(layersState).filter(Boolean).length}
          </span>
        </button>

        <button
          onClick={() => {
            setIsDrawingArea(!isDrawingArea);
            if (isDrawingArea) setDrawnPolygonPoints([]);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xl border transition-all duration-200 cursor-pointer ${
            isDrawingArea 
              ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse' 
              : 'bg-[#10171D]/90 hover:bg-[#1A232C] text-white border-white/10'
          }`}
        >
          <Pencil className="w-4 h-4" />
          <span>{isDrawingArea ? 'Dibujando Zona...' : t.obsDrawArea || 'Delimitar Área'}</span>
        </button>

        <button
          onClick={() => setIsReportingMode(!isReportingMode)}
          className={`p-2.5 rounded-xl text-xs font-bold shadow-xl border transition-all duration-200 cursor-pointer ${
            isReportingMode 
              ? 'bg-purple-600 text-white border-purple-500 animate-pulse' 
              : 'bg-[#10171D]/90 hover:bg-[#1A232C] text-white/80 border-white/10 hover:text-white'
          }`}
          title="Reportes comunitarios"
        >
          <Users className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2.5 rounded-xl text-xs font-bold shadow-xl border transition-all duration-200 cursor-pointer ${
            showSettings 
              ? 'bg-white/20 text-white border-white/30' 
              : 'bg-[#10171D]/90 hover:bg-[#1A232C] text-white/80 border-white/10 hover:text-white'
          }`}
          title="Ajustes de API"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* AREA DELIMITATION FLOATING BANNER */}
      {(isDrawingArea || drawnPolygonPoints.length > 0) && (
        <div className="absolute top-16 left-4 z-20 pointer-events-auto bg-[#10171D]/95 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/40 shadow-2xl text-xs text-white max-w-sm font-sans flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-emerald-400">
            <span className="flex items-center gap-1.5"><Pencil className="w-4 h-4" /> {isDrawingArea ? (t.obsDrawArea || 'Delimitar Área') : 'Área Delimitada'}</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-md font-mono">{drawnPolygonPoints.length} Vértices</span>
          </div>
          
          {isDrawingArea && (
            <p className="text-white/70 text-[11px]">
              Haz clic sobre el mapa para agregar puntos marcando los límites de la zona que deseas analizar.
            </p>
          )}

          {areaStats && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl my-1 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase font-extrabold text-emerald-400/80 block">Superficie Delimitada</span>
                <span className="text-sm font-black text-emerald-300 font-mono">
                  {areaStats.hectares.toLocaleString()} ha <span className="text-xs text-white/60">({areaStats.km2} km²)</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-1">
            {drawnPolygonPoints.length > 0 && (
              <button
                onClick={() => { setDrawnPolygonPoints([]); setIsDrawingArea(false); }}
                className="flex-1 bg-red-950/50 hover:bg-red-900/60 text-red-200 border border-red-500/30 text-[10px] font-bold py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Limpiar
              </button>
            )}
            
            {isDrawingArea && (
              <button
                onClick={() => {
                  setIsDrawingArea(false);
                  if (mapRef.current && drawnPolygonRef.current && drawnPolygonPoints.length >= 3) {
                    try {
                      mapRef.current.fitBounds(drawnPolygonRef.current.getBounds(), { padding: [50, 50], maxZoom: 14 });
                    } catch (e) {}
                  }
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-bold py-1.5 rounded-lg transition-colors"
              >
                Finalizar
              </button>
            )}
            
            {!isDrawingArea && drawnPolygonPoints.length > 0 && (
              <button
                onClick={() => setIsDrawingArea(true)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] font-bold py-1.5 rounded-lg transition-colors"
              >
                Editar Puntos
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESTOR-STYLE SIDE DRAWER ("CAPA DE DATOS") */}
      {isLayerDrawerOpen && (
        <div className="absolute top-0 right-0 bottom-0 z-30 w-96 max-w-full bg-[#10171D]/95 backdrop-blur-xl border-l border-white/10 text-white shadow-2xl flex flex-col pointer-events-auto font-sans">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151D24]">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base tracking-tight text-white">{t.obsDataLayer || 'Capa de datos'}</h3>
            </div>
            <button 
              onClick={() => setIsLayerDrawerOpen(false)} 
              className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Search Bar */}
          <div className="p-3 border-b border-white/10 bg-[#121920]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/40 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={layerSearchQuery}
                onChange={(e) => setLayerSearchQuery(e.target.value)}
                placeholder={t.obsSearchLayers || "Buscar capas de datos..."}
                className="w-full bg-[#1A232C] text-xs text-white pl-9 pr-8 py-2 rounded-xl border border-white/10 outline-none focus:border-amber-500/50 placeholder-white/40"
              />
              {layerSearchQuery && (
                <button onClick={() => setLayerSearchQuery('')} className="absolute right-2 text-white/40 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Drawer Layer Cards (Scrollable List) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/40 px-1 block mb-1">
              {t.obsAvailableLayers || 'Capas Disponibles'} ({Object.keys(LAYER_METADATA).length})
            </span>

            {Object.keys(LAYER_METADATA)
              .filter(key => {
                const meta = LAYER_METADATA[key];
                return meta.name.toLowerCase().includes(layerSearchQuery.toLowerCase()) ||
                       meta.category.toLowerCase().includes(layerSearchQuery.toLowerCase());
              })
              .map(key => {
                const meta = LAYER_METADATA[key];
                const displayName = t['obs' + key.charAt(0).toUpperCase() + key.slice(1) + 'Name'] || meta.name;
                const displayDesc = t['obs' + key.charAt(0).toUpperCase() + key.slice(1) + 'Desc'] || meta.description;
                const isActive = !!layersState[key];
                const IconComponent = meta.icon || Layers;
                const isExpanded = !!expandedMetadataLayers[key];

                return (
                  <div 
                    key={key} 
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isActive 
                        ? 'bg-[#18222B] border-amber-500/40 shadow-lg' 
                        : 'bg-[#131B22] border-white/5 hover:border-white/15'
                    }`}
                  >
                    {/* Layer Header */}
                    <div className="p-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`p-2 rounded-xl bg-white/5 shrink-0 ${meta.iconColor || 'text-white'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-white truncate">{displayName}</h4>
                          <span className="text-[9px] text-white/40 font-mono block">{meta.resolution}</span>
                        </div>
                      </div>

                      {/* Toggle Active Button (Mostrar / Ocultar) */}
                      <button
                        onClick={() => toggleLayer(key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                          isActive 
                            ? 'bg-white text-black hover:bg-white/90 shadow-md' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-black" />
                            <span>{t.obsHide || 'Ocultar'}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 text-white/70" />
                            <span>{t.obsShow || 'Mostrar'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Active Layer Controls & Legend */}
                    {isActive && (
                      <div className="px-3.5 pb-3.5 border-t border-white/10 pt-3 space-y-3 bg-[#141C23]">
                        {/* Gradient Legend */}
                        {meta.gradient && (
                          <div>
                            <div className={`h-2 rounded-full w-full bg-gradient-to-r ${meta.gradient}`} />
                            <div className="flex justify-between text-[9px] text-white/60 mt-1 font-mono">
                              <span>{meta.minLabel}</span>
                              <span>{meta.maxLabel}</span>
                            </div>
                          </div>
                        )}

                        {/* Opacity Slider */}
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-white/70 mb-1">
                            <span>{t.obsOpacity || 'Opacidad'} ({Math.round((opacities[key] || 0.7) * 100)}%)</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={opacities[key] || 0.7}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setOpacities(prev => ({ ...prev, [key]: val }));
                            }}
                            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>

                        {/* Details Toggle Accordion */}
                        <button
                          onClick={() => setExpandedMetadataLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="w-full flex items-center justify-between text-[10px] text-amber-400 font-bold hover:text-amber-300 pt-1"
                        >
                          <span>{isExpanded ? (t.obsMethodologyHide || 'Ocultar Metodología') : (t.obsMethodologyShow || 'Ver Fuente y Metodología')}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {/* Expanded Metadata */}
                        {isExpanded && (
                          <div className="bg-black/30 p-2.5 rounded-xl border border-white/10 text-[10px] space-y-2 font-sans">
                            <div className="flex justify-between items-center">
                              <span className="text-white/50 uppercase font-bold">{t.obsSource || 'Fuente:'}</span>
                              <a
                                href={meta.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                              >
                                {meta.source} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div>
                              <span className="text-white/50 uppercase font-bold block mb-0.5">{t.obsDescCalc || 'Descripción & Cálculo:'}</span>
                              <div className="text-white/80 leading-relaxed text-[10px] whitespace-pre-wrap">
                                {renderBoldText(displayDesc)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
            <span className="font-bold text-[10px] opacity-80 mb-1 block">{t.obsTemp || 'TEMPERATURA'} (°C)</span>
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
                    <span className="text-[8px] font-bold text-white/50 uppercase">{t.obsTemp || 'TEMPERATURA'}</span>
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
                  <span className="flex items-center gap-2"><ThermometerSun className="w-4 h-4 text-amber-400"/> {t.obsTemp || 'TEMPERATURA'}</span>
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
            </div>

            <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 mt-6">Capas Ecológicas y de Riesgo (GEE)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 cursor-pointer">
              <div onClick={() => toggleLayer('geeBurned')} className={`p-3 rounded-xl border transition-colors ${layersState.geeBurned ? 'bg-red-500/10 border-red-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-red-400"><Flame className="w-4 h-4"/> Áreas Quemadas (NBR)</span>
                  {layersState.geeBurned && <CheckCircle2 className="w-4 h-4 text-red-400" />}
                </p>
                <p className="text-white/60 text-xs">Tasa de Quema Normalizada, diferencia entre vegetación normal y quemada.</p>
              </div>

              <div onClick={() => toggleLayer('geeAridity')} className={`p-3 rounded-xl border transition-colors ${layersState.geeAridity ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-amber-500"><SunDim className="w-4 h-4"/> Índice de Aridez (AI)</span>
                  {layersState.geeAridity && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </p>
                <p className="text-white/60 text-xs">Métrica de sequedad (Zomer et al. 2008).</p>
              </div>

              <div onClick={() => toggleLayer('geeDrought')} className={`p-3 rounded-xl border transition-colors ${layersState.geeDrought ? 'bg-orange-500/10 border-orange-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-orange-500"><Droplets className="w-4 h-4"/> Riesgo de Sequía</span>
                  {layersState.geeDrought && <CheckCircle2 className="w-4 h-4 text-orange-500" />}
                </p>
                <p className="text-white/60 text-xs">Riesgo relativo de estrés hídrico (Carrão et al. 2016).</p>
              </div>

              <div onClick={() => toggleLayer('geeErosion')} className={`p-3 rounded-xl border transition-colors ${layersState.geeErosion ? 'bg-stone-500/10 border-stone-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-stone-400"><Mountain className="w-4 h-4"/> Riesgo de Erosión</span>
                  {layersState.geeErosion && <CheckCircle2 className="w-4 h-4 text-stone-400" />}
                </p>
                <p className="text-white/60 text-xs">Erosividad global de las precipitaciones (Panagos et al. 2017).</p>
              </div>

              <div onClick={() => toggleLayer('geeTreeCover')} className={`p-3 rounded-xl border transition-colors ${layersState.geeTreeCover ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-emerald-400"><Trees className="w-4 h-4"/> Cobertura Arbórea</span>
                  {layersState.geeTreeCover && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </p>
                <p className="text-white/60 text-xs">Muestra toda la cobertura de árboles general (Hansen).</p>
              </div>

              <div onClick={() => toggleLayer('geeTropicalDryForest')} className={`p-3 rounded-xl border transition-colors ${layersState.geeTropicalDryForest ? 'bg-amber-500/10 border-amber-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <p className="font-bold flex items-center justify-between mb-1">
                  <span className="flex items-center gap-2 text-amber-500"><Trees className="w-4 h-4"/> Bosque Seco</span>
                  {layersState.geeTropicalDryForest && <CheckCircle2 className="w-4 h-4 text-amber-500" />}
                </p>
                <p className="text-white/60 text-xs">Filtra y muestra exclusivamente el bioma de Bosque Seco Tropical.</p>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4 mt-6">Configuraciones de la Comunidad</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 cursor-pointer">
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

      {/* DASHBOARD COMPONENT */}
      <div className="p-4 md:p-6 lg:p-8">
        <CitiesBar onCityClick={handleMapClick} currentCityName={selectedPoint?.name} t={t} />
        {selectedPoint && selectedPoint.type === 'coordinate' && selectedPoint.daily && (
           <>
             <WeatherDashboard point={selectedPoint} lang={lang} />
             <MeteorologicalTrends lang={lang} />
           </>
        )}
      </div>

    </div>
  );
}
