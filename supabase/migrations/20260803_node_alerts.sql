-- ============================================================
-- NTE Alertas de nodo — Tabla, RLS y datos simulados (piloto Valle del Cauca)
-- ============================================================
-- Una alerta de nodo = un evento de fusión sensorial generado por el
-- servidor local a partir de las lecturas de los nodos LoRaWAN. La
-- plataforma solo lee, cambia el estado y muestra el envío a Telegram.
--
-- OJO: la tabla `alerts` ya existe y es el buzón ENTRANTE del bot de
-- Telegram (reportes ciudadanos: type, source, message, telegram_chat_id,
-- processed). No se toca. El panel de alertas mezcla las dos fuentes.
-- ============================================================

CREATE TABLE IF NOT EXISTS node_alerts (
  id              BIGSERIAL PRIMARY KEY,

  -- Origen
  node_code       TEXT NOT NULL,                    -- BST-01 … BST-04
  node_name       TEXT NOT NULL,                    -- R.N. Chimbilaco
  location        TEXT NOT NULL,                    -- Yotoco, Valle del Cauca
  lat             NUMERIC(9,5),
  lng             NUMERIC(9,5),

  -- Clasificación
  level           TEXT NOT NULL CHECK (level IN ('critica','alerta','vigilancia','info')),
  score           NUMERIC(3,2) NOT NULL DEFAULT 0,  -- 0.00 – 1.00
  rule            TEXT,                             -- sentidos concordantes que dispararon

  -- Contenido bilingüe
  message         TEXT NOT NULL,
  message_en      TEXT,

  -- Evidencia de los sensores: [{sense,label,value,unit,base}]
  evidence        JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Ciclo de vida
  status          TEXT NOT NULL DEFAULT 'nueva'
                  CHECK (status IN ('nueva','en_atencion','resuelta','descartada')),
  assigned_to     TEXT,

  -- Despacho por Telegram
  telegram_status TEXT NOT NULL DEFAULT 'no_aplica'
                  CHECK (telegram_status IN ('enviada','pendiente','fallida','no_aplica')),
  telegram_at     TIMESTAMPTZ,
  telegram_chat   TEXT,                             -- grupo destino

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS node_alerts_created_idx ON node_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS node_alerts_status_idx  ON node_alerts (status);

-- RLS: cualquiera lee (la comunidad ve el estado del territorio),
-- solo usuarios autenticados cambian el estado.
ALTER TABLE node_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can read node alerts" ON node_alerts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can update node alerts" ON node_alerts FOR UPDATE TO authenticated
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Authenticated can insert node alerts" ON node_alerts FOR INSERT TO authenticated
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

GRANT SELECT ON node_alerts TO anon, authenticated;
GRANT INSERT, UPDATE ON node_alerts TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE node_alerts_id_seq TO authenticated;


-- ============================================================
-- DATOS SIMULADOS — 72 h del piloto (4 nodos reales)
-- Los valores corresponden a las magnitudes que realmente entregan
-- los sensores del nodo: MQ135 (CO/gases), PM2.5 láser Grove,
-- MKR ENV (temp, humedad, presión, lux), DS18B20 (temp contacto),
-- HD38 (humedad de suelo), SparkFun Sound Detector (dB) y NDVI.
-- ============================================================

INSERT INTO node_alerts (
  id, node_code, node_name, location, lat, lng,
  level, score, rule, message, message_en, evidence,
  status, assigned_to, telegram_status, telegram_at, telegram_chat,
  created_at, resolved_at
) VALUES

(1, 'BST-03', 'R.N. Chimbilaco', 'Yotoco / La Virginia, Valle del Cauca', 3.88100, -76.42400,
 'critica', 0.88, 'olfato + tacto + oído concordantes',
 'Posible ignición: gases y material particulado se disparan junto con temperatura de contacto de 45.4 °C y crepitación audible.',
 'Possible ignition: gases and particulate matter spike alongside a 45.4 °C contact temperature and audible crackling.',
 '[{"sense":"olfato","label":"CO (MQ135)","value":115,"unit":"ppm","base":14},
   {"sense":"olfato","label":"PM2.5","value":150.5,"unit":"µg/m³","base":16.0},
   {"sense":"tacto","label":"Temp. contacto","value":45.4,"unit":"°C","base":31.0},
   {"sense":"tacto","label":"Humedad suelo","value":18,"unit":"%","base":38},
   {"sense":"oído","label":"Nivel sonoro","value":78,"unit":"dB","base":42}]'::jsonb,
 'nueva', NULL, 'enviada', '2026-08-03 13:02:40+00', 'Brigada Forestal Yotoco',
 '2026-08-03 13:02:15+00', NULL),

(2, 'BST-01', 'P.N.R. El Vínculo', 'Buga, Valle del Cauca', 3.90200, -76.31500,
 'alerta', 0.71, 'tacto + intuición concordantes',
 'Combustible seco y viento en aumento: 36.5 °C con 50 % de humedad y NDVI en 0.32. Ventana crítica de las próximas 6 h.',
 'Dry fuel and rising wind: 36.5 °C at 50 % humidity with NDVI at 0.32. Critical window over the next 6 hours.',
 '[{"sense":"tacto","label":"Temp. aire","value":36.5,"unit":"°C","base":28.0},
   {"sense":"tacto","label":"Humedad aire","value":50,"unit":"%","base":68},
   {"sense":"tacto","label":"Viento","value":12,"unit":"km/h","base":6},
   {"sense":"intuición","label":"NDVI","value":0.32,"unit":"","base":0.55}]'::jsonb,
 'en_atencion', 'Ana María Velasco (CVC)', 'enviada', '2026-08-03 12:31:10+00', 'Brigada Forestal Buga',
 '2026-08-03 12:30:45+00', NULL),

(3, 'BST-02', 'R.F. Bosque de Yotoco', 'Yotoco, Valle del Cauca', 3.86300, -76.38900,
 'vigilancia', 0.52, 'olfato (un solo sentido)',
 'Humo leve detectado: PM2.5 en 18.2 µg/m³ sin confirmación térmica. Se mantiene en vigilancia, sin despacho automático.',
 'Light smoke detected: PM2.5 at 18.2 µg/m³ with no thermal confirmation. Kept under watch, no automatic dispatch.',
 '[{"sense":"olfato","label":"PM2.5","value":18.2,"unit":"µg/m³","base":9.0},
   {"sense":"olfato","label":"PM10","value":26,"unit":"µg/m³","base":15},
   {"sense":"tacto","label":"Temp. aire","value":28.2,"unit":"°C","base":26.5}]'::jsonb,
 'nueva', NULL, 'no_aplica', NULL, NULL,
 '2026-08-03 11:48:00+00', NULL),

(4, 'BST-04', 'Hacienda El Medio', 'Zarzal, Valle del Cauca', 4.39300, -76.07100,
 'info', 0.15, 'diagnóstico del nodo',
 'Batería del nodo en 3.62 V y enlace LoRa degradado (RSSI −112 dBm). Requiere mantenimiento, no es un evento de fuego.',
 'Node battery at 3.62 V and degraded LoRa link (RSSI −112 dBm). Needs maintenance; this is not a fire event.',
 '[{"sense":"diagnóstico","label":"Batería","value":3.62,"unit":"V","base":3.95},
   {"sense":"diagnóstico","label":"RSSI","value":-112,"unit":"dBm","base":-92},
   {"sense":"diagnóstico","label":"SNR","value":2.1,"unit":"dB","base":7.5}]'::jsonb,
 'nueva', NULL, 'no_aplica', NULL, NULL,
 '2026-08-03 10:20:00+00', NULL),

(5, 'BST-03', 'R.N. Chimbilaco', 'Yotoco / La Virginia, Valle del Cauca', 3.88100, -76.42400,
 'alerta', 0.68, 'olfato + oído concordantes',
 'Aumento sostenido de gases (78 ppm) con ruido de motosierra intermitente. Posible quema agrícola en el borde de la reserva.',
 'Sustained gas rise (78 ppm) with intermittent chainsaw noise. Possible agricultural burn at the reserve edge.',
 '[{"sense":"olfato","label":"CO (MQ135)","value":78,"unit":"ppm","base":14},
   {"sense":"oído","label":"Nivel sonoro","value":69,"unit":"dB","base":42},
   {"sense":"tacto","label":"Humedad suelo","value":22,"unit":"%","base":38}]'::jsonb,
 'en_atencion', 'Miguel Ángel Ospina (Bomberos)', 'enviada', '2026-08-03 09:15:30+00', 'Brigada Forestal Yotoco',
 '2026-08-03 09:15:00+00', NULL),

(6, 'BST-01', 'P.N.R. El Vínculo', 'Buga, Valle del Cauca', 3.90200, -76.31500,
 'vigilancia', 0.44, 'tacto (un solo sentido)',
 'Humedad de suelo bajo el umbral estacional (34 %). El combustible fino se está secando antes de lo previsto.',
 'Soil moisture below the seasonal threshold (34 %). Fine fuel is drying earlier than expected.',
 '[{"sense":"tacto","label":"Humedad suelo","value":34,"unit":"%","base":52},
   {"sense":"tacto","label":"Temp. contacto","value":41.3,"unit":"°C","base":33.0}]'::jsonb,
 'resuelta', 'Ana María Velasco (CVC)', 'no_aplica', NULL, NULL,
 '2026-08-02 16:40:00+00', '2026-08-02 19:05:00+00'),

(7, 'BST-02', 'R.F. Bosque de Yotoco', 'Yotoco, Valle del Cauca', 3.86300, -76.38900,
 'critica', 0.82, 'olfato + tacto + vista concordantes',
 'Foco confirmado por cámara: humo denso y 44.8 °C de contacto. Brigada despachada, controlado en 40 minutos.',
 'Camera-confirmed hotspot: dense smoke and 44.8 °C contact temperature. Brigade dispatched, contained in 40 minutes.',
 '[{"sense":"olfato","label":"PM2.5","value":186.0,"unit":"µg/m³","base":9.0},
   {"sense":"olfato","label":"CO (MQ135)","value":132,"unit":"ppm","base":16},
   {"sense":"tacto","label":"Temp. contacto","value":44.8,"unit":"°C","base":29.0},
   {"sense":"vista","label":"Clasificación cámara","value":0.91,"unit":"conf. humo","base":0.10}]'::jsonb,
 'resuelta', 'Brigada Forestal Palmira', 'enviada', '2026-08-02 14:22:15+00', 'Brigada Forestal Yotoco',
 '2026-08-02 14:22:00+00', '2026-08-02 15:04:00+00'),

(8, 'BST-04', 'Hacienda El Medio', 'Zarzal, Valle del Cauca', 4.39300, -76.07100,
 'vigilancia', 0.47, 'olfato + comunidad',
 'Reporte comunitario de humo confirmado por dos vecinos, con PM10 elevado en el nodo. Verificado en campo: quema doméstica controlada.',
 'Community smoke report confirmed by two neighbours, with elevated PM10 at the node. Field check: controlled household burn.',
 '[{"sense":"olfato","label":"PM10","value":60,"unit":"µg/m³","base":22},
   {"sense":"comunidad","label":"Reportes confirmados","value":2,"unit":"","base":0}]'::jsonb,
 'descartada', 'Carlos Ramírez (Palmira)', 'no_aplica', NULL, NULL,
 '2026-08-02 11:05:00+00', '2026-08-02 12:30:00+00'),

(9, 'BST-03', 'R.N. Chimbilaco', 'Yotoco / La Virginia, Valle del Cauca', 3.88100, -76.42400,
 'alerta', 0.63, 'tacto + intuición concordantes',
 'Viento de 28 km/h del WNW sobre vegetación con NDVI 0.22. Si hay ignición, el frente correría hacia la reserva.',
 'Wind at 28 km/h from the WNW over vegetation with NDVI 0.22. On ignition, the front would run toward the reserve.',
 '[{"sense":"tacto","label":"Viento","value":28,"unit":"km/h","base":9},
   {"sense":"intuición","label":"NDVI","value":0.22,"unit":"","base":0.48},
   {"sense":"tacto","label":"Humedad aire","value":52,"unit":"%","base":70}]'::jsonb,
 'resuelta', 'Miguel Ángel Ospina (Bomberos)', 'enviada', '2026-08-01 15:50:20+00', 'Brigada Forestal Yotoco',
 '2026-08-01 15:50:00+00', '2026-08-01 20:10:00+00'),

(10, 'BST-01', 'P.N.R. El Vínculo', 'Buga, Valle del Cauca', 3.90200, -76.31500,
 'critica', 0.79, 'olfato + tacto concordantes',
 'Pico de CO a 148 ppm con salto térmico de 9 °C en 12 minutos. Sin red al momento del despacho: mensaje encolado y sirena local activada.',
 'CO spike to 148 ppm with a 9 °C thermal jump in 12 minutes. No connectivity at dispatch time: message queued and local siren triggered.',
 '[{"sense":"olfato","label":"CO (MQ135)","value":148,"unit":"ppm","base":12},
   {"sense":"tacto","label":"Temp. contacto","value":47.1,"unit":"°C","base":33.0},
   {"sense":"tacto","label":"Humedad suelo","value":15,"unit":"%","base":52}]'::jsonb,
 'resuelta', 'Brigada Forestal Buga', 'fallida', '2026-08-01 09:12:40+00', 'Brigada Forestal Buga',
 '2026-08-01 09:12:00+00', '2026-08-01 11:45:00+00'),

(11, 'BST-02', 'R.F. Bosque de Yotoco', 'Yotoco, Valle del Cauca', 3.86300, -76.38900,
 'info', 0.10, 'estado de la red',
 'Los 4 nodos del piloto reportaron correctamente durante 24 h. Cobertura LoRaWAN estable, sin pérdida de tramas.',
 'All 4 pilot nodes reported correctly for 24 h. Stable LoRaWAN coverage with no frame loss.',
 '[{"sense":"diagnóstico","label":"Nodos activos","value":4,"unit":"/ 4","base":4},
   {"sense":"diagnóstico","label":"Tramas recibidas","value":576,"unit":"","base":576}]'::jsonb,
 'resuelta', NULL, 'no_aplica', NULL, NULL,
 '2026-08-01 07:00:00+00', '2026-08-01 07:00:00+00'),

(12, 'BST-04', 'Hacienda El Medio', 'Zarzal, Valle del Cauca', 4.39300, -76.07100,
 'vigilancia', 0.41, 'intuición (contexto satelital)',
 'Foco activo de NASA FIRMS a 3.2 km del nodo. No hay confirmación en tierra; se sube la cadencia del nodo a 2 minutos.',
 'Active NASA FIRMS hotspot 3.2 km from the node. No ground confirmation; node cadence raised to 2 minutes.',
 '[{"sense":"intuición","label":"Distancia al foco","value":3.2,"unit":"km","base":0},
   {"sense":"intuición","label":"Confianza FIRMS","value":74,"unit":"%","base":0},
   {"sense":"olfato","label":"PM2.5","value":12.4,"unit":"µg/m³","base":10.0}]'::jsonb,
 'descartada', 'Ana María Velasco (CVC)', 'no_aplica', NULL, NULL,
 '2026-07-31 18:30:00+00', '2026-07-31 22:00:00+00');

SELECT setval('node_alerts_id_seq', (SELECT MAX(id) FROM node_alerts));
