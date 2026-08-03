/**
 * Servidor de desarrollo local.
 *
 * En producción estas tres rutas las sirve Vercel como funciones serverless
 * (carpeta `api/`). Aquí se montan sobre Express para poder trabajar en local
 * contra `http://localhost:3001`, reutilizando exactamente los mismos módulos
 * de `api/_lib` — no hay una segunda implementación que se pueda desincronizar.
 *
 *   node server.js
 */
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import { buildLayerUrl, samplePoint } from './api/_lib/gee.js';
import { getHotspots } from './api/_lib/firms.js';
import keepalive from './api/keepalive.js';

const app = express();
app.use(cors());

app.use((req, _res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

app.get('/api/gee/layer/:type', async (req, res) => {
  try {
    const url = await buildLayerUrl(req.params.type);
    if (!url) return res.status(400).json({ error: 'Layer type not implemented' });
    res.json({ url });
  } catch (error) {
    console.error('[GEE] layer', req.params.type, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gee/point', async (req, res) => {
  const { lat, lng, layerType } = req.query;
  if (!lat || !lng || !layerType) {
    return res.status(400).json({ error: 'Missing lat, lng, or layerType' });
  }
  try {
    const result = await samplePoint(lat, lng, layerType);
    if (!result) {
      return res.status(400).json({ error: 'Layer type not supported for point inspection' });
    }
    res.json(result);
  } catch (error) {
    console.error('[GEE] point', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/firms/hotspots', async (_req, res) => {
  try {
    res.json(await getHotspots());
  } catch (error) {
    console.error('[FIRMS] handler', error.message);
    res.status(500).json({ error: 'Could not fetch fire data' });
  }
});

// El mismo ping de Supabase que en producción dispara el cron de Vercel.
app.get('/api/keepalive', keepalive);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend NTE en http://localhost:${PORT}`);
});
