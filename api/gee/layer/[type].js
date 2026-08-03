import { buildLayerUrl } from '../../_lib/gee.js';

export default async function handler(req, res) {
  const { type } = req.query;
  try {
    const url = await buildLayerUrl(type);
    if (!url) return res.status(400).json({ error: 'Layer type not implemented' });
    // Las teselas de GEE viven horas; se cachean en el borde para no volver a
    // pedirle a Earth Engine la misma capa en cada visita.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ url });
  } catch (error) {
    console.error('[GEE] layer', type, error.message);
    return res.status(500).json({ error: error.message });
  }
}
