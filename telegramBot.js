import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const token = process.env.TELEGRAM_BOT_TOKEN?.replace(/\s/g, '');
if (!token) {
    console.error('❌ ERROR: No se encontró TELEGRAM_BOT_TOKEN en el archivo .env');
    process.exit(1);
}

// 1. Inicializar Bot
const bot = new TelegramBot(token, { polling: true });

// 2. Inicializar Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

// Lista temporal en memoria de suscriptores al bot
const chatIdsSuscritos = new Set();

// 3. Inicializar Servidor Express (La "Central de Módulos")
const app = express();
app.use(cors());
app.use(express.json()); // Permite a la API entender JSON de los módulos

// ============================================================================
// API: ENDPOINT PARA LOS MÓDULOS FÍSICOS (Arduino / ESP32 / Raspberry)
// ============================================================================
app.post('/api/lecturas', async (req, res) => {
    // 1. El módulo físico envía sus datos en JSON
    const datosSensor = req.body;
    console.log('\n📥 Datos recibidos del módulo físico:', datosSensor);
    
    const nodoId = datosSensor.device_id || datosSensor.id_nodo || 'NODO_DESCONOCIDO';
    
    // 2. Lógica para detectar anomalías basada en los datos físicos
    // (Puedes ajustar estos umbrales según tu hardware)
    let esAnomalia = false;
    let mensajeAnomalia = '';

    // Extraer datos comunes de cualquiera de los dos formatos del PDF (ISABELLA o JSON estructurado)
    const temp = datosSensor.temp_aire || (datosSensor.sentidos?.tacto?.temp_aire);
    const co2 = datosSensor.co2_ppm_est || (datosSensor.sentidos?.olfato?.co2_ppm);
    const pm25 = datosSensor.pm25 || (datosSensor.sentidos?.olfato?.pm25);
    const sonidoFuego = datosSensor.sonido_detectado;

    // Reglas de negocio (Ejemplo de alerta por fuego)
    if (temp && temp >= 45) {
        esAnomalia = true;
        mensajeAnomalia += `Temperatura crítica detectada (${temp}°C). `;
    }
    if (co2 && co2 >= 1000) {
        esAnomalia = true;
        mensajeAnomalia += `Niveles peligrosos de CO2 (${co2} ppm). `;
    }
    if (sonidoFuego) {
        esAnomalia = true;
        mensajeAnomalia += `Firma acústica de crepitar de fuego detectada. `;
    }
    
    // 3. Si hay anomalía, DESPACHAR a Telegram y Supabase
    if (esAnomalia) {
        console.log('🚨 ANOMALÍA CONFIRMADA. Despachando alertas...');
        
        const textoTelegram = `🔥 *ALERTA FÍSICA DETECTADA* 🔥\n\n*Nodo Origen:* ${nodoId}\n*Detalles:* ${mensajeAnomalia}\n\nRevisa el panel de control inmediatamente.`;

        // A. Notificar por Telegram a las brigadas
        chatIdsSuscritos.forEach(chatId => {
            bot.sendMessage(chatId, textoTelegram, { parse_mode: 'Markdown' });
        });

        // B. Guardar la alerta en la Base de Datos para el Mapa Web
        const { error } = await supabase.from('alerts').insert([{
            type: 'danger',
            source: nodoId,
            message: mensajeAnomalia,
            location: 'Detección por sensor físico'
        }]);

        if (error) console.error('Error subiendo alerta a BD:', error.message);
    }

    // 4. Responderle al módulo físico que recibimos los datos
    res.status(200).json({ status: 'ok', alerta_generada: esAnomalia });
});


// ============================================================================
// BOT: COMANDOS DE TELEGRAM
// ============================================================================
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    chatIdsSuscritos.add(chatId);

    if (!text) return;

    if (text === '/start') {
        const welcomeMessage = 
            '🌲 ¡Hola! Soy *EarlyFlame bot*, el asistente virtual oficial de *TeamColombia* para la alerta temprana de incendios forestales. 🔥\n\n' +
            '📜 *Nuestra Historia y Propósito:*\n' +
            'Nacimos con la misión de proteger nuestra biodiversidad frente a la amenaza constante de incendios. Nuestro objetivo es fusionar saberes comunitarios con tecnología IoT. Nuestro fin es detectar anomalías mucho antes de que el fuego gane fuerza, brindando a las brigadas de emergencia los minutos críticos necesarios para actuar.\n\n' +
            '⚙️ *¿Qué puedo hacer por ti?*\n' +
            '- Vigilo 24/7 los sensores distribuidos en el campo.\n' +
            '- Te envío notificaciones instantáneas de humo, calor extremo o crepitar de fuego.\n\n' +
            '📍 *Ubicación de los Módulos de Detección:*\n' +
            'Nuestros nodos centinelas vigilan puntos estratégicos en el *Valle del Cauca*: P.N.R. El Vínculo (Buga), Reserva Forestal Bosque de Yotoco, R.N. Chimbilaco (Yotoco/La Virginia) y Hacienda El Medio (Zarzal).\n\n' +
            '🌐 *Monitoreo en vivo:*\n' +
            'Puedes ver el estado de los módulos y el mapa de riesgo en tiempo real ingresando a nuestra app:\n' +
            '👉 [EarlyFlame Web App](http://localhost:5173)\n\n' +
            '_¡Ya estás suscrito! Cualquier alerta física llegará a este chat de inmediato._';

        return bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown', disable_web_page_preview: true });
    }
});
bot.on("polling_error", (err) => console.log('Error de Telegram:', err));

// ============================================================================
// INICIAR EL SERVIDOR
// ============================================================================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`📡 Servidor de la Central de Módulos escuchando en http://localhost:${PORT}`);
    console.log('🤖 Bot de Telegram conectado y esperando suscriptores...');
});
