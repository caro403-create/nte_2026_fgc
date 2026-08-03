import { samplePoint } from '../_lib/gee.js';

export default async function handler(req, res) {
  const { lat, lng, layerType } = req.query;
  if (!lat || !lng || !layerType) {
    return res.status(400).json({ error: 'Missing lat, lng, or layerType' });
  }

  try {
    const result = await samplePoint(lat, lng, layerType);
    if (!result) {
      return res.status(400).json({ error: 'Layer type not supported for point inspection' });
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('[GEE] point', error.message);
    return res.status(500).json({ error: error.message });
  }
}
