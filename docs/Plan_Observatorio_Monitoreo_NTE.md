# Pestaña "Observatorio" — Mapa de monitoreo en vivo (datos públicos)

**Plataforma NTE · Fundación Team Colombia**

Mapa de Colombia (y el mundo) donde, a partir de **datos públicos satelitales recientes**, el usuario puede:
- **ver capas de color** actualizadas (clima, lluvia, calor, incendios, humo, vegetación), y
- **hacer clic en cualquier lugar** para leer sus valores actuales.

> **Esto es monitoreo (observación), NO el modelo predictivo.**
> El mapa solo muestra datos que ya existen; no calcula predicciones.
> La salida del modelo vive aparte, en "Mapa de Riesgo".
>
> *La pestaña "Clima en Vivo" que se planteó antes es, en realidad, uno de los grupos de capas de este Observatorio (el grupo "Clima").*

---

## 1. Nombre de la pestaña

**Recomendado:** `Observatorio`

Alternativas: `Monitoreo en Vivo` · `Datos en Vivo` · `Monitoreo Ambiental` · `Mapa Satelital`.

Ubicación en el menú: junto a `Mapa de Riesgo`, como capa de **observación** (vs. la de **predicción**).

---

## 2. Las tres formas en que un dato llega al mapa

Toda fuente pública entra al mapa por uno de estos tres mecanismos:

1. **Capa de color (tiles WMTS/WMS):** la agencia ya entrega la imagen coloreada → se agrega como capa de Leaflet. *(imagen satelital, calor, humo, lluvia, incendios)*
2. **Puntos / mancha de calor (GeoJSON):** datos vectoriales → marcadores o heatmap. *(focos de incendio de FIRMS)*
3. **Clic para consultar (REST):** al hacer clic, se toma `lat/lon` y se pide el valor de ese punto → panel lateral. *(clima, aire, elevación)*

---

## 3. Grupos de capas y sus fuentes

El Observatorio organiza las capas en **grupos temáticos**. Cada grupo puede crecer sin cambiar la arquitectura.

### A. Clima
| Capa | Fuente | Mecanismo | Actualiza | Clave |
|---|---|---|---|---|
| Lluvia / radar | **RainViewer** | tiles + animación 2 h | cada 5 min | No |
| Temperatura, viento, nubes | **OpenWeatherMap – Weather Maps** | tiles | ~3 h | Sí (free) |
| Clima puntual (clic) | **Open-Meteo – Forecast** | REST | horaria | No |

### B. Incendios y calor
| Capa | Fuente | Mecanismo | Actualiza | Clave |
|---|---|---|---|---|
| Focos activos | **NASA FIRMS** (MODIS/VIIRS) | puntos / heatmap | < 3 h | Sí (MAP_KEY free) |
| Anomalías térmicas | **NASA GIBS** | tiles WMTS | 3–5 h | No |
| Áreas quemadas / FWI | **Copernicus EFFIS / GWIS** | tiles WMS | casi real | No |

### C. Aire y humo
| Capa | Fuente | Mecanismo | Actualiza | Clave |
|---|---|---|---|---|
| Aerosol / humo | **NASA GIBS** (AOD) / **CAMS** | tiles | diaria | No |
| Calidad del aire (clic) | **Open-Meteo – Air Quality** | REST (PM2.5, PM10, CO, O₃) | horaria | No |
| Estaciones en tierra (opcional) | **OpenAQ** | REST | variable | Sí |

### D. Vegetación
| Capa | Fuente | Mecanismo | Actualiza | Clave |
|---|---|---|---|---|
| Sequedad de vegetación (NDVI) | **Sentinel-2 (Copernicus)** | tiles WMS | ~5 días | Sí (free tier) |
| Cobertura / color real | **NASA GIBS** | tiles WMTS | diaria | No |

### E. Base satelital
| Capa | Fuente | Mecanismo | Actualiza | Clave |
|---|---|---|---|---|
| Imagen "color real" | **NASA GIBS** (MODIS/VIIRS True Color) | tiles WMTS | 3–5 h | No |

**Prioridad (costo cero, cobertura Colombia y mundo):** GIBS + FIRMS + Open-Meteo + RainViewer.
Fuentes locales de tierra opcionales: **IDEAM**, **SIATA** (Medellín).

---

## 4. Estructura del mapa (UI)

```
┌──────────────── Menú superior ────────────────┐
│ NTE  Panel  Mapa de Riesgo  OBSERVATORIO  ...  │
├────────────────────────────────────────────────┤
│ Observatorio — datos públicos en vivo   Actualizado 14:20 │
│ ┌──────────────────────────────┐ ┌───────────────────┐   │
│ │  Capas ▾                      │ │ Punto seleccionado │   │
│ │  ▸ Clima                      │ │ Palmira, Valle     │   │
│ │    ◉ Lluvia  ○ Temp  ○ Viento │ │ Temp:      34 °C   │   │
│ │  ▸ Incendios                  │ │ Sensación: 37 °C   │   │
│ │    ◉ Focos  ○ Térmico         │ │ Humedad:   45 %    │   │
│ │  ▸ Aire   ▸ Vegetación        │ │ Lluvia:    0 mm    │   │
│ │  ▸ Satélite                   │ │ PM2.5:     18      │   │
│ │                               │ │ Viento:    12 NE   │   │
│ │        MAPA (Leaflet)         │ │ [Pronóstico 7 d]   │   │
│ │  leyenda ▸   opacidad ▬●▬     │ └───────────────────┘   │
│ └──────────────────────────────┘                         │
│ ◀──── línea de tiempo (radar / focos últimas horas) ────▶ │
└────────────────────────────────────────────────────────────┘
```

Componentes:
- **Mapa base** (OSM / Carto claro) centrado en Colombia, con zoom al mundo.
- **Panel de capas** agrupado por tema (Clima, Incendios, Aire, Vegetación, Satélite), cada capa con **leyenda** y **opacidad**.
- **Línea de tiempo** para animar capas casi-en-tiempo-real (radar de lluvia, focos).
- **Panel de punto**: se llena al hacer clic (clima + aire + elevación).
- **"Actualizado hh:mm"** y auto-refresco por capa.

---

## 5. Arquitectura técnica

**Frontend (Leaflet):** capas = *tile layers* que se encienden/apagan; focos = GeoJSON → marcadores/heatmap; clic → `map.on('click')` → backend → panel.

**Backend proxy (Flask/FastAPI) — recomendado:**
1. **Oculta las claves** (FIRMS, OpenWeatherMap) — nunca en el navegador.
2. **Cachea** respuestas (respeta límites: FIRMS 5.000/10 min) y habilita **offline**.
3. **Normaliza** formatos (CSV de FIRMS → GeoJSON; un solo JSON para el frontend).
4. Expone endpoints propios (§6).

**Refresco:** radar 5 min · focos 10–15 min · tiles satelitales por fecha · clic on-demand.

---

## 6. Endpoints propios (backend)

```
GET /api/capas                      → catálogo de capas (nombre, grupo, leyenda, atribución)
GET /api/clima?lat=&lon=            → temp, sensación, humedad, lluvia, viento   (Open-Meteo)
GET /api/aire?lat=&lon=             → PM2.5, PM10, CO, O₃                         (Open-Meteo AQ)
GET /api/focos?bbox=                → focos activos en GeoJSON                    (FIRMS)
GET /api/radar                      → frames del radar (timestamps + tiles)      (RainViewer)
```

**URLs de las fuentes (referencia):**
```
GIBS (tiles):  https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{layer}/default/{time}/
               GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg
FIRMS (área):  https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/
               -82,-4,-66,13/1      (bbox Colombia · 1 día)
Open-Meteo:    https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}
               &current=temperature_2m,apparent_temperature,relative_humidity_2m,
               precipitation,wind_speed_10m,wind_direction_10m
Open-Meteo AQ: https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}
               &longitude={lon}&current=pm2_5,pm10,carbon_monoxide,ozone
RainViewer:    https://api.rainviewer.com/public/weather-maps.json
OpenWeather:   https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={KEY}
EFFIS (WMS):   https://ies-ows.jrc.ec.europa.eu/effis   (GetMap)
```

---

## 7. Plan de implementación por fases

### Fase 0 — Base (1–2 días)
- [ ] Crear la pestaña `Observatorio` y el panel de capas (vacío).
- [ ] Leaflet + mapa base centrado en Colombia.
- [ ] Registrar claves gratuitas (FIRMS MAP_KEY, OpenWeatherMap).

### Fase 1 — Satélite + Incendios (semana 1) — *el núcleo del monitoreo*
- [ ] Capa satelital "color real" (GIBS) con selector de fecha.
- [ ] Anomalías térmicas (GIBS).
- [ ] Focos activos (FIRMS) vía `/api/focos` (proxy + caché), como puntos/heatmap.

### Fase 2 — Clima
- [ ] Radar de lluvia (RainViewer) con línea de tiempo/animación.
- [ ] Capas de temperatura/viento/nubes (OpenWeatherMap) con leyenda y opacidad.

### Fase 3 — Clic para consultar
- [ ] `/api/clima` y `/api/aire` (Open-Meteo).
- [ ] Manejador de clic → panel lateral (clima + aire + elevación).

### Fase 4 — Aire, humo y vegetación
- [ ] Aerosol/humo (GIBS/CAMS), áreas quemadas/FWI (EFFIS).
- [ ] NDVI (Sentinel-2), si hay tiempo.

### Fase 5 — Pulido
- [ ] Leyendas y atribuciones por fuente.
- [ ] "Actualizado hh:mm" + auto-refresco + caché offline.
- [ ] Estados (cargando / vacío / error / sin conexión).

**Total: ~2–3 semanas.** Con Fase 1 + 2 + 3 ya tienes el mapa de monitoreo completo y gratuito.

---

## 8. Criterios de aceptación
- [ ] El mapa muestra al menos una capa satelital reciente y los focos activos sobre Colombia.
- [ ] Se encienden/apagan capas por grupo, con su leyenda y opacidad.
- [ ] Al hacer clic en cualquier punto aparecen sus condiciones actuales.
- [ ] Las capas se refrescan solas y se muestra la hora de actualización.
- [ ] Ninguna clave de API queda expuesta en el frontend.
- [ ] La pestaña funciona con la última data en caché cuando no hay conexión.

---

### Fuentes
- NASA GIBS — https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA FIRMS API — https://firms.modaps.eosdis.nasa.gov/api/area/
- Open-Meteo — https://open-meteo.com/en/docs  ·  Air Quality — https://open-meteo.com/en/docs/air-quality-api
- RainViewer — https://www.rainviewer.com/api.html
- OpenWeatherMap Weather Maps — https://openweathermap.org/api/weathermaps
- Copernicus GWIS / EFFIS — https://gwis.jrc.ec.europa.eu/applications/data-and-services
