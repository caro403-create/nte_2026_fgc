# Sistema de Defensa Activa - Team Colombia 🇨🇴
### Dashboard Integrado de Alerta Temprana de Incendios Forestales

Este proyecto es el diseño inicial de un **Dashboard Integrado** en React y Tailwind CSS para un sistema de alerta temprana de incendios forestales. Está diseñado como un panel de control técnico de misión crítica para reducir la carga cognitiva del coordinador de respuesta bajo presión, mostrando la información mínima y suficiente en un panel único ("single-pane-of-glass").

La interfaz es totalmente responsive y funciona óptimamente tanto en PC como en dispositivos móviles.

---

## 🚀 Características Clave

1. **Cabecera de Control de Riesgo (Header)**
   - **Semáforo de Riesgo**: Indicador visual que escala según un Score de 0.0 a 1.0 en niveles: *Verde (Normal)*, *Amarillo (Vigilancia)*, *Naranja (Alerta)*, *Rojo (Alarma)* y *Púrpura (Evacuación)*.
   - **Educación con Datos**: Explicación en lenguaje natural del nivel de riesgo actual (días sin lluvia, velocidad del viento, humedad, etc.).
   
2. **Mapa de Simulación Táctica (Panel Central)**
   - Visualización interactiva de **Nodos IoT** con telemetrías reales.
   - Puntos de calor satelitales (**NASA FIRMS Hotspots**).
   - Polígono translúcido dinámico que estima el **Frente de Propagación del Fuego** y escala su tamaño/color según el riesgo global.
   - Capas interactivas para simular **Drones de Reconocimiento**, **Rutas de Evacuación** y **Alarmas Bioacústicas**.

3. **Lectura de Sensores "Los 5 Senses" (Panel Derecho)**
   - **Tacto (Térmico)**: Temperatura (°C) y Humedad (%) en tiempo real.
   - **Olfato (Químico)**: Concentraciones de gases CO y VOC (ppm).
   - **Oído (Acústico)**: Indicador dinámico de frecuencias (100-1000 Hz) para registrar crepitaciones del fuego.
   - **Vista (Visual)**: Transmisión simulada en tiempo real de la cámara **ESP32-CAM** con overlays de inteligencia artificial (detección de humo y flama activa).
   - **Intuición (Contexto)**: Dirección y velocidad del viento junto al índice de vegetación **NDVI**.

4. **Timeline de Alertas y Acciones Rápidas (Panel Inferior)**
   - Botón interactivo para **Simular Anomalías** aleatorias en la red de nodos.
   - Historial de eventos del sistema en tiempo real.
   - Acciones de misión crítica: desplegar rutas de evacuación, enviar drones y activar disuasión bioacústica de fauna.

---

## 🛠️ Instrucciones de Uso y Ejecución

### Requisitos Previos
- [Node.js](https://nodejs.org/) (versión v18 o superior recomendada).
- [npm](https://www.npmjs.com/) (instalado junto con Node.js).

### Instalación
1. Clona este repositorio en tu máquina local.
2. Abre la terminal en el directorio raíz del proyecto y ejecuta el siguiente comando para instalar las dependencias:
   ```bash
   npm install
   ```

### Servidor de Desarrollo
Para iniciar la aplicación localmente con soporte de recarga en caliente (HMR):
```bash
npm run dev
```
La aplicación estará disponible en la dirección de red que se imprima en consola (por defecto, `http://localhost:5173/` o `http://localhost:5174/`).

### Construcción para Producción
Para compilar y empaquetar la aplicación optimizada para producción en la carpeta `dist/`:
```bash
npm run build
```

### Calidad de Código y Estilo
Para correr el linter de ESLint y verificar que el código no tenga errores de importación o de sintaxis:
```bash
npm run lint
```
