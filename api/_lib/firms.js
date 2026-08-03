/**
 * Focos activos de NASA FIRMS (CSV público, MODIS global últimas 24 h).
 * Con respaldo en Earth Engine si el CSV no responde.
 */
import { sampleFiresFromGEE } from './gee.js';

const FIRMS_URL =
  'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv';

const CACHE_MS = 60 * 60 * 1000; // 1 hora

// En serverless esta caché vive mientras la instancia siga caliente; es una
// optimización, no una garantía, y por eso el TTL es explícito.
let cache = null;
let cachedAt = 0;

function parseCsv(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const idx = {
    lat: headers.indexOf('latitude'),
    lng: headers.indexOf('longitude'),
    bright: headers.indexOf('brightness'),
    conf: headers.indexOf('confidence'),
    date: headers.indexOf('acq_date'),
    time: headers.indexOf('acq_time'),
    frp: headers.indexOf('frp'),
  };

  const hotspots = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 6) continue;

    const lat = parseFloat(cols[idx.lat]);
    const lng = parseFloat(cols[idx.lng]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) continue;

    hotspots.push({
      lat,
      lng,
      brightness: parseFloat(cols[idx.bright]) || 0,
      confidence: parseInt(cols[idx.conf], 10) || 0,
      frp: parseFloat(cols[idx.frp]) || 0,
      date: cols[idx.date] || '',
      time: cols[idx.time] || '',
    });
  }
  return hotspots;
}

export async function getHotspots() {
  const now = Date.now();
  if (cache && now - cachedAt < CACHE_MS) {
    return { hotspots: cache, cached: true };
  }

  try {
    const response = await fetch(FIRMS_URL);
    if (!response.ok) throw new Error(`FIRMS devolvió ${response.status}`);

    cache = parseCsv(await response.text());
    cachedAt = now;
    return { hotspots: cache, cached: false };
  } catch (error) {
    console.error('[FIRMS] Error:', error.message);
    cache = await sampleFiresFromGEE(now);
    cachedAt = now;
    return { hotspots: cache, cached: false, source: 'gee_fallback' };
  }
}
