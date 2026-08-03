import { getHotspots } from '../_lib/firms.js';

export default async function handler(req, res) {
  try {
    const payload = await getHotspots();
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('[FIRMS] handler', error.message);
    return res.status(500).json({ error: 'Could not fetch fire data' });
  }
}
