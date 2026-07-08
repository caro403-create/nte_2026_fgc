# Instructivo para el Agente — Panel de Clima Detallado (debajo del mapa)

**Plataforma NTE · Fundación Team Colombia**
**Base:** extiende `Plan_Observatorio_Monitoreo_NTE.md` y `Instructivo_Observatorio_Leyendas_Comunidad.md`. Usa las mismas fuentes ya aprobadas (Open-Meteo, sin clave).

## 0. Qué se pide

Agregar, **debajo del mapa del Observatorio**, un panel tipo "MSN El Tiempo" (ver imagen de referencia) que se actualiza automáticamente según:
- la ciudad/municipio que el usuario busque en "Buscar ciudad o lugar...", **o**
- el punto/nodo que el usuario haga clic en el mapa (mismo `lat/lon` que ya alimenta el panel "Punto seleccionado").

Es decir: **una sola fuente de verdad de coordenadas** (`lat, lon, nombreLugar`) alimenta tanto el panel lateral que ya existe como este nuevo panel inferior.

---

## 1. Estructura visual (grid de 4 columnas, como la referencia)

```
┌───────────────────────┬─────────────┬─────────────┬─────────────┐
│ Encabezado + Hoy       │ Visibilidad  │ Viento       │ Mini-mapa    │
│ + Pronóstico 6 días    │ Presión      │ (compás)     │ del punto    │
│ + Gráfica horaria      │ Calidad aire │              │              │
│  (temp + % lluvia)     │ UV           ├─────────────┼─────────────┤
│                        │              │ Humedad      │ Horas de sol │
│                        │              │ Punto rocío  │ (amanecer/   │
│                        │              │              │  atardecer)  │
└───────────────────────┴─────────────┴─────────────┴─────────────┘
```

En móvil: apilar en 1 columna, en el mismo orden.

---

## 2. Mapa de cada widget → fuente de dato

| Widget (de la imagen) | Variable(s) Open-Meteo | Endpoint |
|---|---|---|
| Ciudad, hora, "Actualizado hace..." | nombre ya conocido (geocoding o clic) + `current.time` | Forecast |
| Temp actual + condición + ícono | `current.temperature_2m`, `current.weather_code`, `current.is_day` | Forecast |
| Máx./Mín. de hoy | `daily.temperature_2m_max[0]`, `daily.temperature_2m_min[0]` | Forecast |
| Pronóstico 6 días (con íconos) | `daily.weather_code`, `daily.temperature_2m_max`, `daily.temperature_2m_min` | Forecast |
| Gráfica horaria (temp + % lluvia) | `hourly.temperature_2m`, `hourly.precipitation_probability` | Forecast |
| Visibilidad | `hourly.visibility` (metros → convertir a km) | Forecast |
| Presión | `hourly.surface_pressure` o `hourly.pressure_msl` | Forecast |
| Calidad del aire (número + "Moderado") | `current.us_aqi` | Air Quality |
| UV | `daily.uv_index_max[0]` (o `hourly.uv_index` de la hora actual) | Forecast |
| Viento: velocidad, ráfaga, dirección | `current.wind_speed_10m`, `current.wind_gusts_10m`, `current.wind_direction_10m` | Forecast |
| Humedad + punto de rocío | `current.relative_humidity_2m`, `hourly.dew_point_2m` | Forecast |
| Mini-mapa | Reutilizar el mismo Leaflet (instancia pequeña, sin controles, centrada en `lat/lon`) | — (no necesita API nueva) |
| Horas de sol (amanecer/atardecer + duración) | `daily.sunrise[0]`, `daily.sunset[0]` (la duración se calcula restando) | Forecast |

---

## 3. Llamadas exactas

### 3.1 Clima (todo en una sola llamada, para no gastar cuota)

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,apparent_temperature,relative_humidity_2m,is_day,weather_code,
            wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation
  &hourly=temperature_2m,precipitation_probability,visibility,surface_pressure,
           uv_index,dew_point_2m
  &daily=weather_code,temperature_2m_max,temperature_2m_min,uv_index_max,sunrise,sunset
  &timezone=auto&forecast_days=7
  &temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm
```

### 3.2 Calidad del aire

```
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude={lat}&longitude={lon}
  &current=us_aqi,pm2_5
  &timezone=auto
```

### 3.3 Buscador de ciudad/municipio (ya lo tienes en la barra superior)

```
GET https://geocoding-api.open-meteo.com/v1/search?name={texto}&count=5&language=es&format=json
```

Al elegir un resultado, tomar su `latitude`, `longitude`, `name`, `admin1` (departamento) y disparar el mismo evento que un clic en el mapa (ver §5).

---

## 4. Traducción de `weather_code` (WMO) a texto e ícono en español

Usar esta tabla para el ícono grande ("Soleado" en la imagen) y los íconos de los 6 días:

| Código | Texto ES | Ícono sugerido |
|---|---|---|
| 0 | Despejado / Soleado | ☀️ |
| 1, 2 | Parcialmente nublado | 🌤️ |
| 3 | Nublado | ☁️ |
| 45, 48 | Neblina | 🌫️ |
| 51, 53, 55 | Llovizna | 🌦️ |
| 61, 63, 65 | Lluvia | 🌧️ |
| 66, 67 | Lluvia helada | 🌧️❄️ |
| 71, 73, 75, 77 | Nieve | ❄️ |
| 80, 81, 82 | Chubascos | 🌦️ |
| 95 | Tormenta eléctrica | ⛈️ |
| 96, 99 | Tormenta con granizo | ⛈️🧊 |

```javascript
const WMO = {
  0: { text: "Despejado", icon: "☀️" }, 1: { text: "Parcialmente nublado", icon: "🌤️" },
  2: { text: "Parcialmente nublado", icon: "🌤️" }, 3: { text: "Nublado", icon: "☁️" },
  45: { text: "Neblina", icon: "🌫️" }, 48: { text: "Neblina", icon: "🌫️" },
  51: { text: "Llovizna", icon: "🌦️" }, 53: { text: "Llovizna", icon: "🌦️" }, 55: { text: "Llovizna", icon: "🌦️" },
  61: { text: "Lluvia", icon: "🌧️" }, 63: { text: "Lluvia", icon: "🌧️" }, 65: { text: "Lluvia fuerte", icon: "🌧️" },
  71: { text: "Nieve", icon: "❄️" }, 73: { text: "Nieve", icon: "❄️" }, 75: { text: "Nieve fuerte", icon: "❄️" },
  80: { text: "Chubascos", icon: "🌦️" }, 81: { text: "Chubascos", icon: "🌦️" }, 82: { text: "Chubascos fuertes", icon: "🌦️" },
  95: { text: "Tormenta eléctrica", icon: "⛈️" }, 96: { text: "Tormenta con granizo", icon: "⛈️" }, 99: { text: "Tormenta con granizo", icon: "⛈️" },
};
```

## 5. Escalas de color para los medidores circulares (UV y calidad del aire)

Para que se vean como la imagen (arco de color con puntero):

**UV (`uv_index`):**
0–2 verde (Bajo) · 3–5 amarillo (Moderado) · 6–7 naranja (Alto) · 8–10 rojo (Muy alto) · 11+ morado (Extremo).

**Calidad del aire (`us_aqi`):**
0–50 verde (Bueno) · 51–100 amarillo (Moderado) · 101–150 naranja (Dañino a grupos sensibles) · 151–200 rojo (Dañino) · 201–300 morado (Muy dañino) · 300+ granate (Peligroso).

```javascript
function colorAQI(aqi) {
  if (aqi <= 50) return "#00e400";
  if (aqi <= 100) return "#ffff00";
  if (aqi <= 150) return "#ff7e00";
  if (aqi <= 200) return "#ff0000";
  if (aqi <= 300) return "#8f3f97";
  return "#7e0023";
}
```

## 6. Actualización automática al cambiar de ciudad/nodo

Debe existir **un solo estado compartido** (ej. contexto de React o store) `puntoActivo = { lat, lon, nombre }` que se actualiza en 3 casos:
1. Usuario busca y elige una ciudad en el buscador → geocoding.
2. Usuario hace clic en cualquier parte del mapa.
3. Usuario hace clic en un nodo (Nodo 01–05).

Cualquier cambio en `puntoActivo` debe:
- Refrescar el panel lateral "Punto seleccionado" (ya existe).
- Refrescar este nuevo panel inferior completo (clima + aire + mini-mapa + horas de sol).
- Actualizar el texto "Actualizado hace pocos minutos" con la hora real de la respuesta (`current.time`).

```javascript
async function actualizarPanelClima({ lat, lon, nombre }) {
  const [clima, aire] = await Promise.all([
    fetch(`/api/clima?lat=${lat}&lon=${lon}`).then(r => r.json()),   // usa tu proxy backend, no llamar directo desde el navegador
    fetch(`/api/aire?lat=${lat}&lon=${lon}`).then(r => r.json()),
  ]);
  renderPanelClima({ clima, aire, nombre });
}
```

> Recuerda: tu backend proxy ya cachea por coordenada redondeada (~10 min), así que cambiar de ciudad varias veces no dispara llamadas repetidas innecesarias a Open-Meteo.

## 7. Mini-mapa (columna derecha de la imagen)

No necesita una API nueva: es una segunda instancia de Leaflet, pequeña (ej. 220×160 px), sin zoom ni arrastre (`dragging: false, zoomControl: false, scrollWheelZoom: false`), centrada en `puntoActivo`, con un único marcador. El botón **"Mapa más grande"** simplemente centra y hace zoom en el mapa principal sobre ese mismo punto (no abre un mapa nuevo).

## 8. Horas de sol

```javascript
function horasDeSol(sunrise, sunset) {
  const ms = new Date(sunset) - new Date(sunrise);
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  return `${h}horas ${m}minutos`;
}
```

Mostrar barra de arco con el sol en la posición proporcional a la hora actual entre `sunrise` y `sunset` (como en la imagen), y debajo las horas de amanecer/atardecer en formato `HH:mm`.

---

## 9. Criterios de aceptación

- [ ] El panel aparece debajo del mapa, con el layout de 4 columnas (1 en móvil).
- [ ] Al buscar una ciudad o hacer clic en el mapa/nodo, **todo el panel se actualiza** (no solo el panel lateral existente).
- [ ] Los 6 días de pronóstico muestran ícono + máx/mín correctos según `weather_code`.
- [ ] La gráfica horaria muestra temperatura y % de probabilidad de lluvia.
- [ ] Visibilidad, presión, calidad del aire y UV muestran el color/arco correspondiente a su escala.
- [ ] El compás de viento apunta en la dirección real (`wind_direction_10m`) y muestra velocidad + ráfaga.
- [ ] Humedad y punto de rocío se muestran correctamente.
- [ ] El mini-mapa se centra en el punto activo y el botón "Mapa más grande" centra el mapa principal ahí.
- [ ] Horas de sol muestra amanecer, atardecer y duración total del día.
- [ ] Todas las llamadas pasan por el backend proxy (`/api/clima`, `/api/aire`), nunca directo desde el navegador.

---

### Fuentes
- Open-Meteo Forecast (variables horarias/diarias, códigos WMO) — https://open-meteo.com/en/docs
- Open-Meteo Air Quality (US AQI) — https://open-meteo.com/en/docs/air-quality-api
- Open-Meteo Geocoding — https://open-meteo.com/en/docs/geocoding-api
