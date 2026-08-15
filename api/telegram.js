/**
 * Función Serverless para Vercel: Telegram Bot Webhook
 * Endpoint: POST /api/telegram y GET /api/telegram
 *
 * Procesa mensajes de Telegram mediante Webhook de forma totalmente stateless.
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

// Auxiliar para enviar mensajes utilizando la API de Telegram via HTTP POST
async function sendTelegramMessage(token, chatId, text, options = {}) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parse_mode || 'Markdown',
        disable_web_page_preview: options.disable_web_page_preview ?? true,
        ...options,
      }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('[Telegram API Error]', err.message);
    return null;
  }
}

// Auxiliar para guardar alertas en Supabase REST API sin cliente externo pesado
async function saveAlertToSupabase(alertData) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) {
      console.error('[Supabase Insert Error]', res.status, await res.text());
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('[Supabase Fetch Error]', err.message);
    return null;
  }
}

// Auxiliar para obtener el conteo o lista de alertas recientes
async function getRecentAlertsFromSupabase(limit = 5) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/alerts?select=*&order=created_at.desc&limit=${limit}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (res.ok) return await res.json();
    return [];
  } catch (err) {
    return [];
  }
}

export default async function handler(req, res) {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').replace(/\s/g, '');

  // --- GET: Estado del Webhook e Instrucciones de Registro ---
  if (req.method === 'GET') {
    const host = req.headers.host || 'tu-app.vercel.app';
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const webhookUrl = `${protocol}://${host}/api/telegram`;

    // Si se solicita registrar automáticamente el webhook
    if (req.query.set_webhook === '1' && token) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
        );
        const data = await response.json();
        return res.status(200).json({ ok: true, webhookUrl, telegramResponse: data });
      } catch (err) {
        return res.status(500).json({ ok: false, error: err.message });
      }
    }

    return res.status(200).json({
      status: 'active',
      service: 'Kawsay Telegram Bot Webhook API',
      botConfigured: Boolean(token),
      webhookUrl,
      instructions: token
        ? `Para activar el webhook en Telegram, abre en tu navegador:\nhttps://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
        : 'Agrega la variable TELEGRAM_BOT_TOKEN en las variables de entorno de Vercel.',
    });
  }

  // --- POST: Procesar actualizaciones entrantes de Telegram ---
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!token) {
    console.error('❌ TELEGRAM_BOT_TOKEN no está configurado en las variables de entorno.');
    return res.status(200).json({ ok: true, note: 'Bot token not set' });
  }

  const update = req.body;
  if (!update || (!update.message && !update.channel_post)) {
    return res.status(200).json({ ok: true, note: 'No message payload' });
  }

  const msg = update.message || update.channel_post;
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const location = msg.location;
  const fromName = msg.from ? `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() : 'Usuario Telegram';

  // 1. Comando /start
  if (text.startsWith('/start')) {
    const welcome =
      `🌲 ¡Hola *${fromName}*! Soy el bot de *Kawsay* (Sistema de Alerta Temprana de Incendios Forestales). 🔥\n\n` +
      `📜 *Nuestra misión:*\n` +
      `Proteger la biodiversidad mediante la integración de saberes comunitarios y sensores IoT.\n\n` +
      `⚙️ *¿Qué puedo hacer por ti?*\n` +
      `• Recibo y registro reportes de incendios o humo de la comunidad.\n` +
      `• Notifico alertas detectadas por los módulos centinelas en campo.\n\n` +
      `📍 *Comandos disponibles:*\n` +
      `• /start - Ver este mensaje de bienvenida.\n` +
      `• /estado - Ver resumen del estado de alertas.\n` +
      `• /alertas - Ver las últimas alertas registradas.\n` +
      `• /ayuda - Guía de uso y teléfonos de emergencia.\n\n` +
      `💬 *¿Ves fuego o humo?* Envíame un mensaje con los detalles o tu ubicación GPS y se registrará inmediatamente en el tablero Kawsay.`;

    await sendTelegramMessage(token, chatId, welcome);
    return res.status(200).json({ ok: true });
  }

  // 2. Comando /ayuda o /help
  if (text.startsWith('/ayuda') || text.startsWith('/help')) {
    const helpText =
      `🚨 *GUÍA DE EMERGENCIA Y BOT KAWSAY* 🚨\n\n` +
      `1. *Para reportar un incendio:* Escribe directamente aquí los detalles (ej. "Columna de humo cerca a Reserva Yotoco") o envía tu *Ubicación en Tiempo Real* por este chat.\n` +
      `2. *Teléfonos de emergencia en Valle del Cauca:*\n` +
      `   • Bomberos: 119\n` +
      `   • Cruz Roja: 132\n` +
      `   • Defensa Civil: 144\n` +
      `   • Policía Nacional: 123\n\n` +
      `🌐 Consulta el tablero web en vivo para más detalles.`;

    await sendTelegramMessage(token, chatId, helpText);
    return res.status(200).json({ ok: true });
  }

  // 3. Comando /estado
  if (text.startsWith('/estado') || text.startsWith('/status')) {
    const recent = await getRecentAlertsFromSupabase(10);
    const count = recent.length;

    const statusMsg =
      `📊 *ESTADO DEL SISTEMA KAWSAY*\n\n` +
      `• Alertas recientes registradas: *${count}*\n` +
      `• Estado del bot: *Activo / En línea (Vercel Serverless)*\n` +
      `• Cobertura: *Valle del Cauca (Reserva Yotoco, PNR El Vínculo, Chimbilaco, Zarzal)*\n\n` +
      `_Envía cualquier mensaje o ubicación para generar un reporte ciudadano._`;

    await sendTelegramMessage(token, chatId, statusMsg);
    return res.status(200).json({ ok: true });
  }

  // 4. Comando /alertas
  if (text.startsWith('/alertas')) {
    const recent = await getRecentAlertsFromSupabase(5);
    if (!recent || recent.length === 0) {
      await sendTelegramMessage(token, chatId, '✅ No hay alertas recientes registradas en el sistema.');
      return res.status(200).json({ ok: true });
    }

    let alertsMsg = `🔥 *ÚLTIMAS ALERTAS EN EL SISTEMA:* \n\n`;
    recent.forEach((a, i) => {
      const fecha = a.created_at ? new Date(a.created_at).toLocaleTimeString('es-CO') : 'Reciente';
      alertsMsg += `${i + 1}. *[${(a.type || 'info').toUpperCase()}]* ${a.message || 'Sin mensaje'}\n`;
      alertsMsg += `   📍 Fuente: ${a.source || 'Desconocida'} | Hora: ${fecha}\n\n`;
    });

    await sendTelegramMessage(token, chatId, alertsMsg);
    return res.status(200).json({ ok: true });
  }

  // 5. Manejo de Ubicación GPS enviada por el usuario
  if (location) {
    const lat = location.latitude;
    const lng = location.longitude;
    const locString = `Coordenadas GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const msgText = `Reporte con ubicación GPS desde Telegram por ${fromName}`;

    await saveAlertToSupabase({
      type: 'danger',
      source: `Telegram (${fromName})`,
      message: msgText,
      location: locString,
      telegram_chat_id: String(chatId),
      telegram_message_id: String(msg.message_id || ''),
    });

    const reply =
      `🚨 *UBICACIÓN Y ALERTA REGISTRADA* 🚨\n\n` +
      `Hemos recibido tus coordenadas GPS (${lat.toFixed(4)}, ${lng.toFixed(4)}).\n` +
      `Tu reporte ha sido integrado al tablero de mando Kawsay para notificación de las brigadas de emergencia.`;

    await sendTelegramMessage(token, chatId, reply);
    return res.status(200).json({ ok: true });
  }

  // 6. Reporte Ciudadano en Texto Libre
  if (text && !text.startsWith('/')) {
    await saveAlertToSupabase({
      type: 'warning',
      source: `Ciudadano via Telegram (${fromName})`,
      message: text,
      location: 'Reporte directo Telegram',
      telegram_chat_id: String(chatId),
      telegram_message_id: String(msg.message_id || ''),
    });

    const reply =
      `📝 *REPORTE RECIBIDO* 📝\n\n` +
      `Hola *${fromName}*, tu mensaje:\n_"${text}"_\n\n` +
      `Ha sido registrado en la base de datos de Kawsay y se mostrará en el panel de control. ¡Gracias por tu reporte comunitario!`;

    await sendTelegramMessage(token, chatId, reply);
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
