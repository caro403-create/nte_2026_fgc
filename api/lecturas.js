/**
 * Función Serverless para Vercel: Telemetría de Módulos Físicos IoT
 * Endpoint: POST /api/lecturas
 *
 * Recibe datos de sensores en campo (ESP32 / Arduino / Raspberry Pi),
 * evalúa anomalías térmicas/acústicas, registra en Supabase y despacha
 * alertas por Telegram.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

// Despachar mensaje a Telegram
async function notifyTelegram(token, chatId, messageText) {
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'Markdown',
      }),
    });
  } catch (err) {
    console.error('[Lecturas Telegram Notify Error]', err.message);
  }
}

// Guardar alerta en Supabase
async function saveAlert(alertData) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify(alertData),
    });
  } catch (err) {
    console.error('[Lecturas Supabase Insert Error]', err.message);
  }
}

export default async function handler(req, res) {
  // CORS y cabeceras
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      service: 'Kawsay IoT Telemetry Receiver Endpoint',
      endpoint: '/api/lecturas',
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const datosSensor = req.body || {};
  console.log('[IoT Telemetry Received]', JSON.stringify(datosSensor));

  const nodoId = datosSensor.device_id || datosSensor.id_nodo || 'NODO_CENTINELA';
  
  // Extraer valores de sensores de varios formatos posibles
  const temp = datosSensor.temp_aire ?? datosSensor.sentidos?.tacto?.temp_aire;
  const co2 = datosSensor.co2_ppm_est ?? datosSensor.sentidos?.olfato?.co2_ppm;
  const sonidoFuego = datosSensor.sonido_detectado;
  const ubicacion = datosSensor.ubicacion || datosSensor.location || 'Detección por sensor físico en campo';

  let esAnomalia = false;
  let detalles = '';

  if (typeof temp === 'number' && temp >= 45) {
    esAnomalia = true;
    detalles += `Temperatura crítica (${temp}°C). `;
  }
  if (typeof co2 === 'number' && co2 >= 1000) {
    esAnomalia = true;
    detalles += `Niveles peligrosos de CO2 (${co2} ppm). `;
  }
  if (sonidoFuego) {
    esAnomalia = true;
    detalles += `Firma acústica de fuego detectada. `;
  }

  if (esAnomalia) {
    // 1. Guardar en Supabase para el panel web
    await saveAlert({
      type: 'danger',
      source: nodoId,
      message: detalles.trim(),
      location: ubicacion,
    });

    // 2. Notificar por Telegram si la variable de chat de alertas está configurada
    const token = (process.env.TELEGRAM_BOT_TOKEN || '').replace(/\s/g, '');
    const chatId = process.env.TELEGRAM_ALERT_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

    if (token && chatId) {
      const textoTelegram =
        `🔥 *ALERTA FÍSICA DETECTADA EN CAMPO* 🔥\n\n` +
        `*Nodo Origen:* ${nodoId}\n` +
        `*Detalles:* ${detalles.trim()}\n` +
        `*Ubicación:* ${ubicacion}\n\n` +
        `Revisa el tablero de control Kawsay inmediatamente.`;

      await notifyTelegram(token, chatId, textoTelegram);
    }
  }

  return res.status(200).json({
    status: 'ok',
    nodoId,
    alerta_generada: esAnomalia,
    detalles: esAnomalia ? detalles.trim() : 'Telemetría dentro de parámetros normales',
  });
}
