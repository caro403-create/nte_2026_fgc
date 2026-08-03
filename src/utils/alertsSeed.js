// Espejo local de los datos sembrados en supabase/migrations/20260803_node_alerts.sql.
// El panel de alertas lee de la tabla node_alerts; si todavía no está migrada
// o no hay conexión, cae a estos mismos registros para que la vista se pueda mostrar.

export const ALERTS_SEED = [
  {
    origin: 'nodo', id: 1,
    node_code: 'BST-03', node_name: 'R.N. Chimbilaco', location: 'Yotoco / La Virginia, Valle del Cauca',
    lat: 3.881, lng: -76.424,
    level: 'critica', score: 0.88, rule: 'olfato + tacto + oído concordantes',
    message: 'Posible ignición: gases y material particulado se disparan junto con temperatura de contacto de 45.4 °C y crepitación audible.',
    message_en: 'Possible ignition: gases and particulate matter spike alongside a 45.4 °C contact temperature and audible crackling.',
    evidence: [
      { sense: 'olfato', label: 'CO (MQ135)', value: 115, unit: 'ppm', base: 14 },
      { sense: 'olfato', label: 'PM2.5', value: 150.5, unit: 'µg/m³', base: 16.0 },
      { sense: 'tacto', label: 'Temp. contacto', value: 45.4, unit: '°C', base: 31.0 },
      { sense: 'tacto', label: 'Humedad suelo', value: 18, unit: '%', base: 38 },
      { sense: 'oído', label: 'Nivel sonoro', value: 78, unit: 'dB', base: 42 }
    ],
    status: 'nueva', assigned_to: null,
    telegram_status: 'enviada', telegram_at: '2026-08-03T13:02:40Z', telegram_chat: 'Brigada Forestal Yotoco',
    created_at: '2026-08-03T13:02:15Z', resolved_at: null
  },
  {
    origin: 'nodo', id: 2,
    node_code: 'BST-01', node_name: 'P.N.R. El Vínculo', location: 'Buga, Valle del Cauca',
    lat: 3.902, lng: -76.315,
    level: 'alerta', score: 0.71, rule: 'tacto + intuición concordantes',
    message: 'Combustible seco y viento en aumento: 36.5 °C con 50 % de humedad y NDVI en 0.32. Ventana crítica de las próximas 6 h.',
    message_en: 'Dry fuel and rising wind: 36.5 °C at 50 % humidity with NDVI at 0.32. Critical window over the next 6 hours.',
    evidence: [
      { sense: 'tacto', label: 'Temp. aire', value: 36.5, unit: '°C', base: 28.0 },
      { sense: 'tacto', label: 'Humedad aire', value: 50, unit: '%', base: 68 },
      { sense: 'tacto', label: 'Viento', value: 12, unit: 'km/h', base: 6 },
      { sense: 'intuición', label: 'NDVI', value: 0.32, unit: '', base: 0.55 }
    ],
    status: 'en_atencion', assigned_to: 'Ana María Velasco (CVC)',
    telegram_status: 'enviada', telegram_at: '2026-08-03T12:31:10Z', telegram_chat: 'Brigada Forestal Buga',
    created_at: '2026-08-03T12:30:45Z', resolved_at: null
  },
  {
    origin: 'nodo', id: 3,
    node_code: 'BST-02', node_name: 'R.F. Bosque de Yotoco', location: 'Yotoco, Valle del Cauca',
    lat: 3.863, lng: -76.389,
    level: 'vigilancia', score: 0.52, rule: 'olfato (un solo sentido)',
    message: 'Humo leve detectado: PM2.5 en 18.2 µg/m³ sin confirmación térmica. Se mantiene en vigilancia, sin despacho automático.',
    message_en: 'Light smoke detected: PM2.5 at 18.2 µg/m³ with no thermal confirmation. Kept under watch, no automatic dispatch.',
    evidence: [
      { sense: 'olfato', label: 'PM2.5', value: 18.2, unit: 'µg/m³', base: 9.0 },
      { sense: 'olfato', label: 'PM10', value: 26, unit: 'µg/m³', base: 15 },
      { sense: 'tacto', label: 'Temp. aire', value: 28.2, unit: '°C', base: 26.5 }
    ],
    status: 'nueva', assigned_to: null,
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-08-03T11:48:00Z', resolved_at: null
  },
  {
    origin: 'nodo', id: 4,
    node_code: 'BST-04', node_name: 'Hacienda El Medio', location: 'Zarzal, Valle del Cauca',
    lat: 4.393, lng: -76.071,
    level: 'info', score: 0.15, rule: 'diagnóstico del nodo',
    message: 'Batería del nodo en 3.62 V y enlace LoRa degradado (RSSI −112 dBm). Requiere mantenimiento, no es un evento de fuego.',
    message_en: 'Node battery at 3.62 V and degraded LoRa link (RSSI −112 dBm). Needs maintenance; this is not a fire event.',
    evidence: [
      { sense: 'diagnóstico', label: 'Batería', value: 3.62, unit: 'V', base: 3.95 },
      { sense: 'diagnóstico', label: 'RSSI', value: -112, unit: 'dBm', base: -92 },
      { sense: 'diagnóstico', label: 'SNR', value: 2.1, unit: 'dB', base: 7.5 }
    ],
    status: 'nueva', assigned_to: null,
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-08-03T10:20:00Z', resolved_at: null
  },
  {
    origin: 'nodo', id: 5,
    node_code: 'BST-03', node_name: 'R.N. Chimbilaco', location: 'Yotoco / La Virginia, Valle del Cauca',
    lat: 3.881, lng: -76.424,
    level: 'alerta', score: 0.68, rule: 'olfato + oído concordantes',
    message: 'Aumento sostenido de gases (78 ppm) con ruido de motosierra intermitente. Posible quema agrícola en el borde de la reserva.',
    message_en: 'Sustained gas rise (78 ppm) with intermittent chainsaw noise. Possible agricultural burn at the reserve edge.',
    evidence: [
      { sense: 'olfato', label: 'CO (MQ135)', value: 78, unit: 'ppm', base: 14 },
      { sense: 'oído', label: 'Nivel sonoro', value: 69, unit: 'dB', base: 42 },
      { sense: 'tacto', label: 'Humedad suelo', value: 22, unit: '%', base: 38 }
    ],
    status: 'en_atencion', assigned_to: 'Miguel Ángel Ospina (Bomberos)',
    telegram_status: 'enviada', telegram_at: '2026-08-03T09:15:30Z', telegram_chat: 'Brigada Forestal Yotoco',
    created_at: '2026-08-03T09:15:00Z', resolved_at: null
  },
  {
    origin: 'nodo', id: 6,
    node_code: 'BST-01', node_name: 'P.N.R. El Vínculo', location: 'Buga, Valle del Cauca',
    lat: 3.902, lng: -76.315,
    level: 'vigilancia', score: 0.44, rule: 'tacto (un solo sentido)',
    message: 'Humedad de suelo bajo el umbral estacional (34 %). El combustible fino se está secando antes de lo previsto.',
    message_en: 'Soil moisture below the seasonal threshold (34 %). Fine fuel is drying earlier than expected.',
    evidence: [
      { sense: 'tacto', label: 'Humedad suelo', value: 34, unit: '%', base: 52 },
      { sense: 'tacto', label: 'Temp. contacto', value: 41.3, unit: '°C', base: 33.0 }
    ],
    status: 'resuelta', assigned_to: 'Ana María Velasco (CVC)',
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-08-02T16:40:00Z', resolved_at: '2026-08-02T19:05:00Z'
  },
  {
    origin: 'nodo', id: 7,
    node_code: 'BST-02', node_name: 'R.F. Bosque de Yotoco', location: 'Yotoco, Valle del Cauca',
    lat: 3.863, lng: -76.389,
    level: 'critica', score: 0.82, rule: 'olfato + tacto + vista concordantes',
    message: 'Foco confirmado por cámara: humo denso y 44.8 °C de contacto. Brigada despachada, controlado en 40 minutos.',
    message_en: 'Camera-confirmed hotspot: dense smoke and 44.8 °C contact temperature. Brigade dispatched, contained in 40 minutes.',
    evidence: [
      { sense: 'olfato', label: 'PM2.5', value: 186.0, unit: 'µg/m³', base: 9.0 },
      { sense: 'olfato', label: 'CO (MQ135)', value: 132, unit: 'ppm', base: 16 },
      { sense: 'tacto', label: 'Temp. contacto', value: 44.8, unit: '°C', base: 29.0 },
      { sense: 'vista', label: 'Clasificación cámara', value: 0.91, unit: 'conf. humo', base: 0.10 }
    ],
    status: 'resuelta', assigned_to: 'Brigada Forestal Palmira',
    telegram_status: 'enviada', telegram_at: '2026-08-02T14:22:15Z', telegram_chat: 'Brigada Forestal Yotoco',
    created_at: '2026-08-02T14:22:00Z', resolved_at: '2026-08-02T15:04:00Z'
  },
  {
    origin: 'nodo', id: 8,
    node_code: 'BST-04', node_name: 'Hacienda El Medio', location: 'Zarzal, Valle del Cauca',
    lat: 4.393, lng: -76.071,
    level: 'vigilancia', score: 0.47, rule: 'olfato + comunidad',
    message: 'Reporte comunitario de humo confirmado por dos vecinos, con PM10 elevado en el nodo. Verificado en campo: quema doméstica controlada.',
    message_en: 'Community smoke report confirmed by two neighbours, with elevated PM10 at the node. Field check: controlled household burn.',
    evidence: [
      { sense: 'olfato', label: 'PM10', value: 60, unit: 'µg/m³', base: 22 },
      { sense: 'comunidad', label: 'Reportes confirmados', value: 2, unit: '', base: 0 }
    ],
    status: 'descartada', assigned_to: 'Carlos Ramírez (Palmira)',
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-08-02T11:05:00Z', resolved_at: '2026-08-02T12:30:00Z'
  },
  {
    origin: 'nodo', id: 9,
    node_code: 'BST-03', node_name: 'R.N. Chimbilaco', location: 'Yotoco / La Virginia, Valle del Cauca',
    lat: 3.881, lng: -76.424,
    level: 'alerta', score: 0.63, rule: 'tacto + intuición concordantes',
    message: 'Viento de 28 km/h del WNW sobre vegetación con NDVI 0.22. Si hay ignición, el frente correría hacia la reserva.',
    message_en: 'Wind at 28 km/h from the WNW over vegetation with NDVI 0.22. On ignition, the front would run toward the reserve.',
    evidence: [
      { sense: 'tacto', label: 'Viento', value: 28, unit: 'km/h', base: 9 },
      { sense: 'intuición', label: 'NDVI', value: 0.22, unit: '', base: 0.48 },
      { sense: 'tacto', label: 'Humedad aire', value: 52, unit: '%', base: 70 }
    ],
    status: 'resuelta', assigned_to: 'Miguel Ángel Ospina (Bomberos)',
    telegram_status: 'enviada', telegram_at: '2026-08-01T15:50:20Z', telegram_chat: 'Brigada Forestal Yotoco',
    created_at: '2026-08-01T15:50:00Z', resolved_at: '2026-08-01T20:10:00Z'
  },
  {
    origin: 'nodo', id: 10,
    node_code: 'BST-01', node_name: 'P.N.R. El Vínculo', location: 'Buga, Valle del Cauca',
    lat: 3.902, lng: -76.315,
    level: 'critica', score: 0.79, rule: 'olfato + tacto concordantes',
    message: 'Pico de CO a 148 ppm con salto térmico de 9 °C en 12 minutos. Sin red al momento del despacho: mensaje encolado y sirena local activada.',
    message_en: 'CO spike to 148 ppm with a 9 °C thermal jump in 12 minutes. No connectivity at dispatch time: message queued and local siren triggered.',
    evidence: [
      { sense: 'olfato', label: 'CO (MQ135)', value: 148, unit: 'ppm', base: 12 },
      { sense: 'tacto', label: 'Temp. contacto', value: 47.1, unit: '°C', base: 33.0 },
      { sense: 'tacto', label: 'Humedad suelo', value: 15, unit: '%', base: 52 }
    ],
    status: 'resuelta', assigned_to: 'Brigada Forestal Buga',
    telegram_status: 'fallida', telegram_at: '2026-08-01T09:12:40Z', telegram_chat: 'Brigada Forestal Buga',
    created_at: '2026-08-01T09:12:00Z', resolved_at: '2026-08-01T11:45:00Z'
  },
  {
    origin: 'nodo', id: 11,
    node_code: 'BST-02', node_name: 'R.F. Bosque de Yotoco', location: 'Yotoco, Valle del Cauca',
    lat: 3.863, lng: -76.389,
    level: 'info', score: 0.10, rule: 'estado de la red',
    message: 'Los 4 nodos del piloto reportaron correctamente durante 24 h. Cobertura LoRaWAN estable, sin pérdida de tramas.',
    message_en: 'All 4 pilot nodes reported correctly for 24 h. Stable LoRaWAN coverage with no frame loss.',
    evidence: [
      { sense: 'diagnóstico', label: 'Nodos activos', value: 4, unit: '/ 4', base: 4 },
      { sense: 'diagnóstico', label: 'Tramas recibidas', value: 576, unit: '', base: 576 }
    ],
    status: 'resuelta', assigned_to: null,
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-08-01T07:00:00Z', resolved_at: '2026-08-01T07:00:00Z'
  },
  {
    origin: 'nodo', id: 12,
    node_code: 'BST-04', node_name: 'Hacienda El Medio', location: 'Zarzal, Valle del Cauca',
    lat: 4.393, lng: -76.071,
    level: 'vigilancia', score: 0.41, rule: 'intuición (contexto satelital)',
    message: 'Foco activo de NASA FIRMS a 3.2 km del nodo. No hay confirmación en tierra; se sube la cadencia del nodo a 2 minutos.',
    message_en: 'Active NASA FIRMS hotspot 3.2 km from the node. No ground confirmation; node cadence raised to 2 minutes.',
    evidence: [
      { sense: 'intuición', label: 'Distancia al foco', value: 3.2, unit: 'km', base: 0 },
      { sense: 'intuición', label: 'Confianza FIRMS', value: 74, unit: '%', base: 0 },
      { sense: 'olfato', label: 'PM2.5', value: 12.4, unit: 'µg/m³', base: 10.0 }
    ],
    status: 'descartada', assigned_to: 'Ana María Velasco (CVC)',
    telegram_status: 'no_aplica', telegram_at: null, telegram_chat: null,
    created_at: '2026-07-31T18:30:00Z', resolved_at: '2026-07-31T22:00:00Z'
  }
];
