# Instructivo para el Agente — Observatorio v2: Leyendas, Mapa Meteorológico Real y Capa Comunitaria

**Plataforma NTE · Fundación Team Colombia**
**Base:** este documento extiende `Plan_Observatorio_Monitoreo_NTE.md`. No reemplaza la arquitectura ya definida (backend proxy, endpoints `/api/*`, grupos de capas); le agrega 3 mejoras concretas sobre la pestaña **Observatorio** ya construida.

> Estado actual (según captura): la barra de capas ya tiene los botones (Lluvia, Incendios, Temp, Viento, Nubes, Aire, Todas las capas, Ajustes), el panel de punto seleccionado funciona, y hay nodos (Nodo 01–05) en el mapa. Falta: (1) explicar qué hace cada botón, (2) que las capas se vean como un mapa meteorológico real (colores, no solo puntos), (3) que la comunidad pueda aportar información.

---

## 1. Objetivo de esta iteración

1. **Leyendas/tooltips** en cada botón de la barra de capas, más un panel de leyenda de colores para la capa activa.
2. **Visual real de mapa meteorológico**: agregar los *tile layers* de color (no solo marcadores) para que Lluvia/Temperatura/Viento/Nubes/Incendios se vean como un mapa satelital real.
3. **Interacción comunitaria**: capa de "Reportes de la Comunidad" donde cualquier usuario puede marcar en el mapa algo que está viendo (humo, lluvia fuerte, calor extremo, incendio) y otros pueden confirmarlo.

---

## 2. Tooltips y leyenda de la barra de botones

Cada ícono de la barra superior izquierda debe tener un `title`/tooltip al pasar el mouse (y en móvil, al mantener presionado), más un ícono de ayuda `?` que abra un modal con la tabla completa.

| Ícono actual | Nombre del grupo | Texto del tooltip | Fuente de datos |
|---|---|---|---|
| 💧 Gota (activo, naranja) | **Lluvia / Radar** | "Radar de lluvia en tiempo real. Se actualiza cada 5 min." | RainViewer |
| 🔥 Llama | **Incendios y calor** | "Focos de incendio activos detectados por satélite (últimas 3 h) y anomalías térmicas." | NASA FIRMS + GIBS |
| 🌡️ Termómetro | **Temperatura** | "Temperatura del aire en superficie." | OpenWeatherMap |
| 🌬️ Viento | **Viento** | "Dirección e intensidad del viento." | OpenWeatherMap |
| ☁️ Nube | **Nubosidad** | "Cobertura de nubes." | OpenWeatherMap |
| 🛡️ Escudo | **Calidad del aire** | "Niveles de PM2.5, PM10, CO y O₃. El color indica riesgo para la salud." | Open-Meteo Air Quality / OpenAQ |
| 🗂️ Capas (stack) | **Todas las capas** | "Abre el panel completo de capas por grupo (Clima, Incendios, Aire, Vegetación, Satélite)." | — |
| ⚙️ Engranaje | **Ajustes del sistema** | "Modo Online/Offline y claves de API (FIRMS, OpenWeatherMap)." | — |

### Implementación sugerida (Leaflet + React/HTML)

```html
<button class="layer-btn" data-tooltip="Radar de lluvia en tiempo real. Se actualiza cada 5 min.">
  💧
</button>
```

```css
.layer-btn { position: relative; }
.layer-btn:hover::after {
  content: attr(data-tooltip);
  position: absolute;
  top: 110%; left: 50%; transform: translateX(-50%);
  background: #111; color: #fff; padding: 6px 10px;
  border-radius: 6px; font-size: 12px; white-space: nowrap;
  z-index: 1000;
}
```

En móvil (donde no hay `hover`), usar `onTouchStart` para mostrar el tooltip 2 segundos, o abrir directamente el modal de ayuda con la tabla completa.

### Panel de leyenda de colores (dinámico, según capa activa)

Debajo del botón de opacidad (ya existe en el plan original), agregar una barra de gradiente que cambie según la capa activa:

- **Lluvia (RainViewer):** azul claro (llovizna) → azul oscuro/morado (lluvia intensa), escala en mm/h.
- **Temperatura (OWM):** azul (frío) → amarillo → rojo (calor), escala en °C.
- **Incendios (FIRMS):** puntos naranja = confianza media, rojo = alta confianza; tamaño = intensidad (FRP).
- **Calidad del aire:** verde (bueno) → amarillo → naranja → rojo → morado (peligroso), según PM2.5 (escala AQI estándar).

```jsx
function LayerLegend({ layer }) {
  const legends = {
    lluvia:  { title: "Lluvia (mm/h)", gradient: "linear-gradient(90deg,#a6cee3,#1f78b4,#6a3d9a)" },
    temperatura: { title: "Temperatura (°C)", gradient: "linear-gradient(90deg,#2b83ba,#ffffbf,#d7191c)" },
    incendios: { title: "Confianza del foco", gradient: "linear-gradient(90deg,#feb24c,#f03b20)" },
    aire: { title: "PM2.5 (µg/m³)", gradient: "linear-gradient(90deg,#00e400,#ffff00,#ff7e00,#ff0000,#8f3f97)" },
  };
  const l = legends[layer];
  if (!l) return null;
  return (
    <div className="legend">
      <span>{l.title}</span>
      <div style={{height: 8, borderRadius: 4, background: l.gradient}} />
    </div>
  );
}
```

---

## 3. Que el mapa se vea como un mapa meteorológico real (capas de color, no solo puntos)

Hoy el mapa muestra nodos como puntos (verde/naranja/negro). Para que se vea como un mapa meteorológico real, hay que **prender tile layers de color** sobre el mapa base cuando el usuario activa cada botón. Esto ya está previsto en `Plan_Observatorio_Monitoreo_NTE.md` §3 y §6; aquí va el código concreto.

### 3.1 Lluvia — RainViewer (gratis, sin clave)

```javascript
async function addRainLayer(map) {
  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
  const data = await res.json();
  const frame = data.radar.nowcast[0] || data.radar.past.at(-1);
  const url = `${data.host}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
  const rainLayer = L.tileLayer(url, { opacity: 0.7, zIndex: 400 });
  rainLayer.addTo(map);
  return rainLayer; // guardar referencia para poder quitarla al apagar el botón
}
```

Para la **línea de tiempo** (ya existe en la UI), usar `data.radar.past` (frames anteriores) y `data.radar.nowcast` (pronóstico a 2 h) — cada frame trae su propio `path`, se cambia el tile layer según el slider.

### 3.2 Temperatura / Viento / Nubes — OpenWeatherMap (requiere `API Key OWM`, ya hay campo para guardarla)

```javascript
function addOWMLayer(map, tipo, apiKey) {
  // tipo: "temp_new" | "wind_new" | "clouds_new" | "precipitation_new"
  const url = `https://tile.openweathermap.org/map/${tipo}/{z}/{x}/{y}.png?appid=${apiKey}`;
  return L.tileLayer(url, { opacity: 0.6, zIndex: 400 }).addTo(map);
}
```

⚠️ Importante (ya lo dice el plan original): la clave **nunca debe ir en el frontend en producción**. Para pruebas puede ir directo, pero el agente debe dejar preparado el proxy backend (`GET /api/tiles/owm/:tipo/:z/:x/:y`) que agregue la clave del lado del servidor antes de salir a producción.

### 3.3 Incendios y calor — NASA GIBS (satélite color real / térmico) + FIRMS (focos)

```javascript
function addGIBSLayer(map, layerName, fecha) {
  // layerName ej: "MODIS_Terra_CorrectedReflectance_TrueColor" o "VIIRS_SNPP_Thermal_Anomalies_375m_Night"
  const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerName}/default/${fecha}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
  return L.tileLayer(url, { opacity: 0.8, zIndex: 300 }).addTo(map);
}
```

Los focos de FIRMS (puntos) ya están cubiertos por el endpoint `/api/focos` del plan original — se muestran como marcadores/heatmap **encima** de la capa GIBS, no la reemplazan.

### 3.4 Orden de capas (z-index) para que se vea bien

De abajo hacia arriba: mapa base (OSM/Carto) → satélite GIBS → temperatura/viento/nubes (OWM) → lluvia (RainViewer) → focos/incendios (FIRMS, puntos) → nodos propios (Nodo 01–05) → marcadores comunitarios (§4).

### 3.5 Reglas para el agente

- Cada botón de la barra enciende/apaga **una capa tile**, no solo un color de fondo del botón.
- Al apagar un botón, remover el layer con `map.removeLayer(layer)` (no solo ocultarlo con CSS) para no gastar ancho de banda.
- Guardar en estado (o `localStorage` fuera de artifacts / DB si aplica) qué capas estaban activas, para recordarlas al recargar.
- Mostrar un indicador de carga pequeño mientras el tile layer carga sus primeros tiles.

---

## 4. Interacción con la comunidad: capa de "Reportes Comunitarios"

Nueva funcionalidad para que la comunidad participe directamente sobre el mapa.

### 4.1 Qué hace

- Cualquier usuario autenticado puede hacer clic en "Reportar" (nuevo botón, ícono 👥 o 📍, al lado de Ajustes) y luego clic en el mapa para dejar un reporte.
- Formulario corto:
  - Categoría (select): `Incendio` · `Humo` · `Lluvia fuerte / inundación` · `Calor extremo` · `Otro`
  - Comentario (texto corto, máx. 140 caracteres)
  - Foto opcional
- El reporte aparece como un marcador con ícono según categoría y color distinto a los datos satelitales (para no confundir dato oficial vs. dato ciudadano).
- Otros usuarios pueden pulsar **"Confirmar"** sobre el reporte (contador de confirmaciones); esto le da peso/confiabilidad sin necesitar moderación manual inmediata.
- Los reportes expiran automáticamente (ocultarse, no borrarse) después de N horas según categoría (ej. incendio/humo: 6 h; lluvia: 3 h) salvo que se sigan confirmando.

### 4.2 Backend — nuevos endpoints (se agregan a los de §6 del plan original)

```
POST /api/reportes            → { lat, lon, categoria, comentario, foto? } → crea reporte
GET  /api/reportes?bbox=      → reportes activos en el área visible (GeoJSON)
POST /api/reportes/:id/confirmar  → suma una confirmación
```

Guardar en base de datos (tabla `reportes_comunidad`): `id, lat, lon, categoria, comentario, foto_url, confirmaciones, creado_en, expira_en, usuario_id`.

### 4.3 Moderación mínima

- Limitar a 1 reporte por usuario cada X minutos (evitar spam).
- Si un reporte acumula "Falso"/rechazos suficientes, ocultarlo automáticamente.
- Este reporte ciudadano se muestra **siempre etiquetado como "dato comunitario, no verificado"**, distinto de las capas satelitales oficiales, para no generar confusión sobre la fuente.

### 4.4 Tooltip del nuevo botón

| Ícono nuevo | Nombre | Tooltip |
|---|---|---|
| 👥 | **Reportes de la comunidad** | "Marca en el mapa algo que estás viendo (humo, lluvia fuerte, calor extremo). Otros usuarios pueden confirmarlo." |

---

## 5. Criterios de aceptación

- [x] Cada botón de la barra muestra un tooltip explicativo al pasar el mouse / mantener presionado.
- [x] Existe un modal de ayuda (ícono `?`) con la tabla completa de capas y qué significan.
- [x] Al activar Lluvia/Temperatura/Viento/Nubes/Incendios/Satélite, el mapa muestra una **capa de color real** (tile layer), no solo puntos.
- [x] Existe una leyenda de gradiente de color que cambia según la capa activa, con sus unidades.
- [x] Existe el botón "Reportes de la comunidad": permite crear un reporte con categoría + comentario, y verlo en el mapa.
- [x] Los reportes comunitarios se distinguen visualmente (color/ícono) de las capas oficiales.
- [x] Los reportes pueden confirmarse por otros usuarios y expiran automáticamente.
- [x] Ninguna clave de API (FIRMS, OWM) queda expuesta si el proyecto pasa a producción (usar el proxy backend).

---

## 6. Fases sugeridas (se agregan a las fases 0–5 del plan original)

### Fase 6 — Leyendas y ayuda (0.5–1 día)
- [x] Tooltips en los 8 botones existentes.
- [x] Modal de ayuda con tabla completa.
- [x] Leyenda de gradiente dinámica bajo el control de opacidad.

### Fase 7 — Capas visuales reales (2–3 días)
- [x] Tile layer RainViewer con animación (línea de tiempo ya existe, conectar frames reales).
- [x] Tile layers OWM (temp/viento/nubes) con clave guardada en Ajustes.
- [x] Tile layer GIBS (satélite color real + térmico).
- [x] Orden z-index correcto entre capas.

### Fase 8 — Reportes comunitarios (2–3 días)
- [x] Endpoints `/api/reportes*` + tabla en base de datos.
- [x] Botón + flujo de creación de reporte en el frontend.
- [x] Marcadores diferenciados + confirmaciones + expiración automática.
- [x] Límite anti-spam por usuario.

**Total adicional estimado: ~5–7 días.**

---

### Fuentes usadas en este instructivo
- RainViewer API — https://www.rainviewer.com/api.html
- OpenWeatherMap Weather Maps — https://openweathermap.org/api/weathermaps
- NASA GIBS — https://nasa-gibs.github.io/gibs-api-docs/access-basics/
- NASA FIRMS — https://firms.modaps.eosdis.nasa.gov/api/area/
- Open-Meteo Air Quality — https://open-meteo.com/en/docs/air-quality-api
