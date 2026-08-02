const express = require('express');
const cors = require('cors');
const ee = require('@google/earthengine');
require('dotenv').config();

const app = express();
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.url}`);
  next();
});

// Initialize Google Earth Engine
const PRIVATE_KEY = process.env.VITE_GEE_PRIVATE_KEY ? process.env.VITE_GEE_PRIVATE_KEY.replace(/\\n/g, '\n') : '';
const CLIENT_EMAIL = process.env.VITE_GEE_SERVICE_ACCOUNT_EMAIL;

if (!PRIVATE_KEY || !CLIENT_EMAIL) {
  console.error("Missing GEE credentials in .env");
} else {
  console.log("Authenticating Earth Engine...");
  ee.data.authenticateViaPrivateKey(
    {
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY
    },
    () => {
      console.log("Authentication successful. Initializing Earth Engine...");
      ee.initialize(
        null, null,
        () => {
          console.log("Earth Engine initialized successfully.");
        },
        (e) => {
          console.error("Initialization error: " + e);
        }
      );
    },
    (e) => {
      console.error("Authentication error: " + e);
    }
  );
}

// Helper function to get MapID for a GEE Image
const getMapId = (image, visParams) => {
  return new Promise((resolve, reject) => {
    image.getMap(visParams, (mapId, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(mapId.urlFormat);
      }
    });
  });
};

app.get('/api/gee/layer/:type', async (req, res) => {
  const layerType = req.params.type;
  try {
    let url = '';

    // Continental bounding box to prevent global computation timeouts (Includes all Americas)
    const americasBounds = ee.Geometry.BBox(-170.0, -56.0, -30.0, 75.0);

    if (layerType === 'burned') {
      // Using MODIS Burned Area Monthly (MCD64A1) - Fast, official pre-calculated burn dates
      const dataset = ee.ImageCollection('MODIS/061/MCD64A1')
                        .filterBounds(americasBounds)
                        .filterDate('2023-01-01', '2024-01-01')
                        .select('BurnDate');
      const burnedImage = dataset.max();
      // Mask unburned pixels so the satellite base map shows through
      const masked = burnedImage.updateMask(burnedImage.gt(0));
      const visParams = {
        min: 1,
        max: 365,
        palette: ['ffaa00', 'ff4400', 'ff0000', '990000']
      };
      url = await getMapId(masked, visParams);
    } 
    else if (layerType === 'treeCover') {
      // Hansen Global Forest Cover - Masked for canopy > 25%
      const dataset = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
      const treeCover = dataset.select(['treecover2000']);
      const masked = treeCover.updateMask(treeCover.gt(25));
      const visParams = {
        min: 25,
        max: 100,
        palette: ['10b981', '059669', '047857', '064e3b']
      };
      url = await getMapId(masked, visParams);
    } else if (layerType === 'tropicalDryForest') {
      // Hansen Global Forest Cover masked by RESOLVE Ecoregions (Biome 2 = Tropical Dry Broadleaf Forests)
      const dataset = ee.Image('UMD/hansen/global_forest_change_2023_v1_11');
      const treeCover = dataset.select(['treecover2000']);
      
      const ecoregions = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
      const dryForestEcoregions = ecoregions.filter(ee.Filter.eq('BIOME_NUM', 2));
      const biomeMask = ee.Image().paint(dryForestEcoregions, 1);
      
      // Mask by canopy > 25% AND being inside Biome 2
      const masked = treeCover.updateMask(treeCover.gt(25)).updateMask(biomeMask);
      
      const visParams = {
        min: 25,
        max: 100,
        palette: ['d97706', 'b45309', '92400e', '78350f'] // Warm terracotta/brown/olive gradient for dry forest
      };
      url = await getMapId(masked, visParams);
    } else if (layerType === 'aridity') {
      // TerraClimate PDSI - Full spectrum
      const dataset = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
                        .filterBounds(americasBounds)
                        .filterDate('2022-01-01', '2022-12-31')
                        .median();
      const pdsi = dataset.select('pdsi');
      const visParams = {
        min: -600,
        max: 600,
        palette: ['dc2626', 'ea580c', 'f59e0b', 'eab308', '93c5fd', '3b82f6', '1d4ed8']
      };
      url = await getMapId(pdsi, visParams);
    } else if (layerType === 'drought') {
      // TerraClimate Soil Moisture - Full spectrum
      const dataset = ee.ImageCollection('IDAHO_EPSCOR/TERRACLIMATE')
                        .filterBounds(americasBounds)
                        .filterDate('2022-01-01', '2022-12-31')
                        .median();
      const soilMoisture = dataset.select('soil');
      const visParams = {
        min: 0,
        max: 1000,
        palette: ['990000', 'ef4444', 'f97316', 'eab308', '10b981', '065f46']
      };
      url = await getMapId(soilMoisture, visParams);
    } else if (layerType === 'erosion') {
      // SRTM DEM Slope - Masked for slopes > 12 degrees
      const dem = ee.Image('USGS/SRTMGL1_003');
      const slope = ee.Terrain.slope(dem);
      const steepSlope = slope.updateMask(slope.gt(12));
      const visParams = {
        min: 12,
        max: 45,
        palette: ['eab308', 'f97316', 'dc2626']
      };
      url = await getMapId(steepSlope, visParams);
    }

    if (url) {
      res.json({ url });
    } else {
      res.status(400).json({ error: 'Layer type not implemented' });
    }
  } catch (error) {
    console.error('Error generating GEE layer:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/gee/point', async (req, res) => {
  const { lat, lng, layerType } = req.query;
  if (!lat || !lng || !layerType) {
    return res.status(400).json({ error: 'Missing lat, lng, or layerType' });
  }

  try {
    const point = ee.Geometry.Point([parseFloat(lng), parseFloat(lat)]);
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
      image = ee.Image('CGIAR/SRTM90_V4').select('elevation');
      image = ee.Terrain.slope(image);
    } else if (layerType === 'geeTreeCover') {
      image = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')
                .select('treecover2000');
    } else if (layerType === 'geeTropicalDryForest') {
      const ecoregions = ee.FeatureCollection('RESOLVE/ECOREGIONS/2017');
      const dryForestEcoregions = ecoregions.filter(ee.Filter.eq('BIOME_NUM', 2));
      const biomeMask = ee.Image().paint(dryForestEcoregions, 1);
      
      image = ee.Image('UMD/hansen/global_forest_change_2023_v1_11')
                .select('treecover2000')
                .updateMask(biomeMask);
    } else {
      return res.status(400).json({ error: 'Layer type not supported for point inspection' });
    }

    const dict = image.reduceRegion({
      reducer: ee.Reducer.first(),
      geometry: point,
      scale: 1000,
      bestEffort: true
    });

    const values = await new Promise((resolve, reject) => {
      dict.evaluate((result, error) => {
        if (error) reject(new Error(error));
        else resolve(result);
      });
    });

    const key = Object.keys(values || {})[0];
    const value = values ? values[key] : null;

    res.json({ value, key });
  } catch (error) {
    console.error('Error getting GEE point data:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── NASA FIRMS FIRE HOTSPOTS (real individual detections, global) ──
let firmsCache = null;
let firmsCacheTimestamp = 0;
const FIRMS_CACHE_MS = 60 * 60 * 1000; // 1 hour cache

app.get('/api/firms/hotspots', async (req, res) => {
  try {
    // Return cached data if fresh
    if (firmsCache && (Date.now() - firmsCacheTimestamp) < FIRMS_CACHE_MS) {
      console.log(`[FIRMS] Returning cached data (${firmsCache.length} points)`);
      return res.json({ hotspots: firmsCache, cached: true });
    }

    console.log('[FIRMS] Fetching active fire data from NASA FIRMS...');

    // NASA FIRMS public CSV — MODIS global last 24h (~5,000-15,000 points)
    const firmsUrl = 'https://firms.modaps.eosdis.nasa.gov/data/active_fire/modis-c6.1/csv/MODIS_C6_1_Global_24h.csv';
    
    const response = await fetch(firmsUrl);
    if (!response.ok) {
      throw new Error(`FIRMS returned ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    // Find column indices
    const latIdx = headers.indexOf('latitude');
    const lngIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('brightness');
    const confIdx = headers.indexOf('confidence');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const frpIdx = headers.indexOf('frp'); // Fire Radiative Power
    
    const hotspots = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      if (cols.length < 6) continue;
      
      const lat = parseFloat(cols[latIdx]);
      const lng = parseFloat(cols[lngIdx]);
      if (isNaN(lat) || isNaN(lng)) continue;
      
      hotspots.push({
        lat,
        lng,
        brightness: parseFloat(cols[brightIdx]) || 0,
        confidence: parseInt(cols[confIdx]) || 0,
        frp: parseFloat(cols[frpIdx]) || 0,
        date: cols[dateIdx] || '',
        time: cols[timeIdx] || '',
      });
    }

    // Cache
    firmsCache = hotspots;
    firmsCacheTimestamp = Date.now();

    console.log(`[FIRMS] Parsed ${hotspots.length} fire hotspots globally`);
    res.json({ hotspots, cached: false });
  } catch (error) {
    console.error('[FIRMS] Error:', error.message);
    
    // If FIRMS fetch fails, use GEE to sample fire points
    try {
      console.log('[FIRMS] Falling back to GEE MODIS active fire...');
      const fires = ee.ImageCollection('MODIS/061/MOD14A1')
        .filterDate(ee.Date(Date.now() - 7 * 24 * 60 * 60 * 1000), ee.Date(Date.now()))
        .select('FireMask')
        .max();
      
      const fireMask = fires.gt(6).selfMask(); // Confidence > nominal
      const points = fireMask.sample({ numPixels: 5000, scale: 1000, geometries: true });
      
      const results = await new Promise((resolve, reject) => {
        points.evaluate((data, err) => err ? reject(err) : resolve(data));
      });
      
      const hotspots = results.features.map(f => ({
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        brightness: 0,
        confidence: 80,
        frp: 0,
        date: new Date().toISOString().split('T')[0],
        time: '',
      }));
      
      firmsCache = hotspots;
      firmsCacheTimestamp = Date.now();
      console.log(`[FIRMS/GEE] Sampled ${hotspots.length} fire points from GEE`);
      res.json({ hotspots, cached: false, source: 'gee_fallback' });
    } catch (geeError) {
      console.error('[FIRMS/GEE] Fallback also failed:', geeError.message);
      res.status(500).json({ error: 'Could not fetch fire data' });
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`GEE Backend running on http://localhost:${PORT}`);
});
