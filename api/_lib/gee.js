/**
 * Lógica de Google Earth Engine compartida.
 *
 * Este archivo es la única implementación: lo usan tanto las funciones
 * serverless de `api/` en producción como el servidor Express local
 * (`server.js`). El prefijo `_` hace que Vercel no lo publique como ruta.
 */
import ee from '@google/earthengine';

// La autenticación tarda y en serverless cada arranque en frío la repite, así
// que se memoriza la promesa: las invocaciones siguientes de la misma
// instancia reutilizan la sesión ya abierta.
let ready = null;

export function ensureEE() {
  if (ready) return ready;

  const privateKey = (process.env.VITE_GEE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  const clientEmail = process.env.VITE_GEE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    return Promise.reject(
      new Error('Faltan VITE_GEE_PRIVATE_KEY y/o VITE_GEE_SERVICE_ACCOUNT_EMAIL en el entorno.')
    );
  }

  ready = new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      { client_email: clientEmail, private_key: privateKey },
      () => ee.initialize(null, null, () => resolve(ee), (e) => reject(new Error(String(e)))),
      (e) => reject(new Error(String(e)))
    );
  }).catch((err) => {
    // Si falló, no dejamos la promesa rota en caché: el siguiente intento
    // vuelve a autenticar en vez de heredar el error para siempre.
    ready = null;
    throw err;
  });

  return ready;
}

function getMapUrl(image, visParams) {
  return new Promise((resolve, reject) => {
    image.getMap(visParams, (mapId, error) => (error ? reject(error) : resolve(mapId.urlFormat)));
  });
}

/** Recuadro continental: sin él, el cálculo global se va en timeout. */
const AMERICAS = () => ee.Geometry.BBox(-170.0, -56.0, -30.0, 75.0);

const HANSEN = 'UMD/hansen/global_forest_change_2023_v1_11';

/** Bosque seco tropical = Hansen recortado al bioma 2 de RESOLVE Ecoregions. */
function dryForestMask() {
  const ecoregions = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
  return ee.Image().paint(ecoregions.filter(ee.Filter.eq('BIOME_NUM', 2)), 1);
}

/** Devuelve la URL de teselas de una capa, o null si el tipo no existe. */
export async function buildLayerUrl(layerType) {
  await ensureEE();

  if (layerType === 'burned') {
    // MODIS MCD64A1: fechas de quema mensuales ya calculadas por la NASA.
    const burned = ee.ImageCollection('MODIS/061/MCD64A1')
      .filterBounds(AMERICAS())
      .filterDate('2023-01-01', '2024-01-01')
      .select('BurnDate')
      .max();
    // Se enmascaran los píxeles sin quemar para que se vea el mapa base.
    return getMapUrl(burned.updateMask(burned.gt(0)), {
      min: 1,
      max: 365,
      palette: ['ffaa00', 'ff4400', 'ff0000', '990000'],
    });
  }

  if (layerType === 'treeCover') {
    const treeCover = ee.Image(HANSEN).select(['treecover2000']);
    return getMapUrl(treeCover.updateMask(treeCover.gt(25)), {
      min: 25,
      max: 100,
      palette: ['10b981', '059669', '047857', '064e3b'],
    });
  }

  if (layerType === 'tropicalDryForest') {
    const treeCover = ee.Image(HANSEN).select(['treecover2000']);
    const masked = treeCover.updateMask(treeCover.gt(25)).updateMask(dryForestMask());
    return getMapUrl(masked, {
      min: 25,
      max: 100,
      palette: ['d97706', 'b45309', '92400e', '78350f'],
    });
  }

  if (layerType === 'aridity') {
    const pdsi = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
      .filterBounds(AMERICAS())
      .filterDate('2022-01-01', '2022-12-31')
      .median()
      .select('pdsi');
    return getMapUrl(pdsi, {
      min: -600,
      max: 600,
      palette: ['dc2626', 'ea580c', 'f59e0b', 'eab308', '93c5fd', '3b82f6', '1d4ed8'],
    });
  }

  if (layerType === 'drought') {
    const soil = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
      .filterBounds(AMERICAS())
      .filterDate('2022-01-01', '2022-12-31')
      .median()
      .select('soil');
    return getMapUrl(soil, {
      min: 0,
      max: 1000,
      palette: ['990000', 'ef4444', 'f97316', 'eab308', '10b981', '065f46'],
    });
  }

  if (layerType === 'erosion') {
    const slope = ee.Terrain.slope(ee.Image('USGS/SRTMGL1_003'));
    return getMapUrl(slope.updateMask(slope.gt(12)), {
      min: 12,
      max: 45,
      palette: ['eab308', 'f97316', 'dc2626'],
    });
  }

  return null;
}

/** Valor de una capa en un punto. Devuelve { value, key }. */
export async function samplePoint(lat, lng, layerType) {
  await ensureEE();

  let image;
  if (layerType === 'geeBurned') {
    image = ee.ImageCollection('MODIS/061/MCD64A1')
      .filterDate('2023-01-01', '2024-01-01')
      .select('BurnDate')
      .max();
  } else if (layerType === 'geeAridity') {
    image = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
      .filterDate('2022-01-01', '2022-12-31')
      .select('pdsi')
      .median();
  } else if (layerType === 'geeDrought') {
    image = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
      .filterDate('2022-01-01', '2022-12-31')
      .select('soil')
      .median();
  } else if (layerType === 'geeErosion') {
    image = ee.Terrain.slope(ee.Image('CGIAR/SRTM90_V4').select('elevation'));
  } else if (layerType === 'geeTreeCover') {
    image = ee.Image(HANSEN).select('treecover2000');
  } else if (layerType === 'geeTropicalDryForest') {
    image = ee.Image(HANSEN).select('treecover2000').updateMask(dryForestMask());
  } else {
    return null;
  }

  const values = await new Promise((resolve, reject) => {
    image
      .reduceRegion({
        reducer: ee.Reducer.first(),
        geometry: ee.Geometry.Point([parseFloat(lng), parseFloat(lat)]),
        scale: 1000,
        bestEffort: true,
      })
      .evaluate((result, error) => (error ? reject(new Error(error)) : resolve(result)));
  });

  const key = Object.keys(values || {})[0];
  return { value: values ? values[key] : null, key };
}

/** Respaldo cuando el CSV de FIRMS no responde: muestreo de focos con GEE. */
export async function sampleFiresFromGEE(now) {
  await ensureEE();

  const fires = ee.ImageCollection('MODIS/061/MOD14A1')
    .filterDate(ee.Date(now - 7 * 24 * 60 * 60 * 1000), ee.Date(now))
    .select('FireMask')
    .max();

  const points = fires.gt(6).selfMask().sample({ numPixels: 5000, scale: 1000, geometries: true });

  const results = await new Promise((resolve, reject) => {
    points.evaluate((data, err) => (err ? reject(new Error(err)) : resolve(data)));
  });

  return (results?.features || []).map((f) => ({
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    brightness: 0,
    confidence: 80,
    frp: 0,
    date: new Date(now).toISOString().split('T')[0],
    time: '',
  }));
}
